const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const saveKey = "defenseAscensionSaveV1";

const rarities = [
  ["Common", .60, "common"], ["Rare", .25, "rare"], ["Epic", .10, "epic"], ["Legendary", .04, "legendary"], ["Mythic", .01, "mythic"]
];
const maps = [
  {id:"grass",name:"Grasslands",theme:"#315a42",reward:90,path:[[0,390],[210,390],[210,160],[470,160],[470,500],[760,500],[760,260],[1100,260]],pads:[[160,310],[315,155],[410,245],[590,500],[720,405],[850,245],[965,330]]},
  {id:"desert",name:"Desert Outpost",theme:"#7f6838",reward:120,path:[[0,210],[250,210],[250,470],[560,470],[560,170],[830,170],[830,390],[1100,390]],pads:[[150,130],[310,325],[465,560],[620,310],[760,105],[910,310],[1000,470]]},
  {id:"snow",name:"Snow Valley",theme:"#4b7682",reward:140,path:[[0,505],[180,505],[180,310],[390,310],[390,115],[670,115],[670,450],[1100,450]],pads:[[105,425],[250,245],[360,390],[520,105],[650,220],[790,455],[930,365]]},
  {id:"industrial",name:"Industrial Complex",theme:"#555d62",reward:170,path:[[0,335],[170,335],[170,145],[425,145],[425,355],[650,355],[650,555],[910,555],[910,250],[1100,250]],pads:[[90,255],[260,140],[360,250],[535,430],[710,550],[830,460],[980,220]]},
  {id:"volcano",name:"Volcano Core",theme:"#743236",reward:220,path:[[0,170],[190,170],[190,520],[410,520],[410,300],[610,300],[610,105],[855,105],[855,420],[1100,420]],pads:[[105,105],[245,360],[360,590],[505,235],[650,170],[770,90],[945,430]]}
];
const difficulties = {Normal:{mult:1,waves:15},Hard:{mult:1.45,waves:20},Endless:{mult:1.8,waves:999,locked:true}};
const bases = [
  {id:"standard",name:"Standard Base",rarity:"Common",hp:100,buff:"Normal income"},
  {id:"hq",name:"Military HQ",rarity:"Rare",hp:110,buff:"Spawns defenders"},
  {id:"depot",name:"Supply Depot",rarity:"Rare",hp:95,buff:"Bonus cash"},
  {id:"research",name:"Research Center",rarity:"Epic",hp:90,buff:"Tower range +12%"},
  {id:"fortress",name:"Fortress",rarity:"Epic",hp:150,buff:"Extra health"},
  {id:"command",name:"Command Base",rarity:"Legendary",hp:130,buff:"Elite troops and buffs"}
];
const towers = [
  {id:"scout",name:"Scout",rarity:"Common",cost:90,range:120,rate:.55,dmg:10,type:"bullet",desc:"Cheap starter tower."},
  {id:"sniper",name:"Sniper",rarity:"Common",cost:180,range:260,rate:1.4,dmg:45,type:"bullet",desc:"Long range heavy shots."},
  {id:"shotgun",name:"Shotgunner",rarity:"Rare",cost:240,range:105,rate:.9,dmg:35,type:"splash",desc:"Close burst damage."},
  {id:"minigun",name:"Minigunner",rarity:"Rare",cost:360,range:150,rate:.16,dmg:8,type:"bullet",desc:"Very high fire rate."},
  {id:"rocket",name:"Rocket Launcher",rarity:"Epic",cost:500,range:180,rate:1.2,dmg:90,type:"splash",desc:"Explosive area hits."},
  {id:"freeze",name:"Freeze Tower",rarity:"Epic",cost:420,range:130,rate:.8,dmg:12,type:"freeze",desc:"Slows enemies."},
  {id:"laser",name:"Laser Tower",rarity:"Legendary",cost:720,range:190,rate:.08,dmg:10,type:"laser",desc:"Sustained burn beam."},
  {id:"toxic",name:"Toxic Tower",rarity:"Epic",cost:460,range:155,rate:.7,dmg:20,type:"toxic",desc:"Poison damage over time."},
  {id:"base",name:"Military Base",rarity:"Rare",cost:560,range:0,rate:4,dmg:0,type:"spawner",unit:"Soldier",desc:"Spawns soldiers."},
  {id:"barracks",name:"Barracks",rarity:"Epic",cost:760,range:0,rate:4.8,dmg:0,type:"spawner",unit:"Riflemen",desc:"Spawns riflemen and medics."},
  {id:"tank",name:"Tank Factory",rarity:"Legendary",cost:1050,range:0,rate:6.5,dmg:0,type:"spawner",unit:"Tank",desc:"Spawns armored vehicles."},
  {id:"commandcenter",name:"Elite Command Center",rarity:"Mythic",cost:1450,range:0,rate:7.5,dmg:0,type:"spawner",unit:"Commando",desc:"Spawns elite commandos."}
];
const achievements = [
  {id:"firstWin",name:"First Victory",goal:"Win one match",check:s=>s.stats.wins>=1,reward:1},
  {id:"slayer",name:"Enemy Slayer",goal:"Defeat 500 enemies",check:s=>s.stats.kills>=500,reward:2},
  {id:"builder",name:"Field Engineer",goal:"Place 100 towers",check:s=>s.stats.towersPlaced>=100,reward:1},
  {id:"boss",name:"Boss Breaker",goal:"Defeat 10 bosses",check:s=>s.stats.bossesDefeated>=10,reward:2},
  {id:"collector",name:"Collector",goal:"Open 25 crates",check:s=>s.stats.cratesOpened>=25,reward:3}
];

let state = load();
let selected = {map:"grass",difficulty:"Normal",base:"standard",loadout:["scout","sniper","shotgun","base"]};
let game = null, last = 0, raf = 0;

function freshSave(){
  return {level:1,xp:0,coins:400,gems:20,crates:2,endless:false,lastDaily:0,settings:{volume:60,reducedFx:false},
    unlockedTowers:["scout","sniper","shotgun","base"],unlockedBases:["standard"],skins:["Default Base"],effects:["Classic Burst"],
    stats:{kills:0,wins:0,towersPlaced:0,cratesOpened:0,bossesDefeated:0},achievements:{},mapWins:{}};
}
function load(){try{return {...freshSave(),...(JSON.parse(localStorage.getItem(saveKey))||{})}}catch{return freshSave()}}
function save(){localStorage.setItem(saveKey,JSON.stringify(state));renderAll()}
function xpNeed(){return 100+state.level*60}
function addXP(n){state.xp+=n;while(state.xp>=xpNeed()){state.xp-=xpNeed();state.level++;state.coins+=75;state.gems+=3}}
function nav(to){$$(".screen").forEach(x=>x.classList.remove("active"));$("#"+to).classList.add("active");if(to==="match")return;renderAll()}

function renderAll(){
  $("#profileLevel").textContent=state.level;$("#coins").textContent=state.coins;$("#gems").textContent=state.gems;$("#xpFill").style.width=Math.min(100,state.xp/xpNeed()*100)+"%";
  $("#crateCount").textContent=state.crates;$("#dailyBtn").disabled=sameDay(state.lastDaily,Date.now());
  renderHero();renderSetup();renderCollections();renderStats();renderInventory();
}
function renderNav(){
  const items=[["menu","Main Menu"],["play","Play"],["crates","Crates"],["collection","Collection"],["inventory","Inventory"],["stats","Stats"],["settings","Settings"]];
  $("#nav").innerHTML=items.map(i=>`<button data-nav="${i[0]}">${i[1]}</button>`).join("");
  $$("[data-nav]").forEach(b=>b.onclick=()=>nav(b.dataset.nav));$$("[data-go]").forEach(b=>b.onclick=()=>nav(b.dataset.go));
}
function renderHero(){
  $("#heroStats").innerHTML=[["Wins",state.stats.wins],["Kills",state.stats.kills],["Bosses",state.stats.bossesDefeated],["Endless",state.endless?"Unlocked":"Locked"]].map(x=>`<div class="stat-tile"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("");
  $("#featuredCards").innerHTML=[
    ["Boss Phases","Boss and Mega Boss waves introduce shields, rage speed, and heavy rewards."],
    ["Spawner Army","Military Base, Barracks, Tank Factory, and Command Center send friendly units down the lane."],
    ["Persistent Grind","Daily rewards, achievements, crates, XP, coins, skins, and map completions are saved."]
  ].map(c=>`<div class="card"><h3>${c[0]}</h3><small>${c[1]}</small></div>`).join("");
}
function renderSetup(){
  $("#mapSelect").innerHTML=maps.map(m=>`<div class="choice ${selected.map===m.id?"selected":""}" data-map="${m.id}"><b>${m.name}</b><small>${m.reward} coin clear reward</small></div>`).join("");
  $("#difficultySelect").innerHTML=Object.keys(difficulties).map(d=>`<div class="choice ${selected.difficulty===d?"selected":""}" data-diff="${d}"><b>${d}</b><small>${d==="Endless"&&!state.endless?"Locked until normal clear":difficulties[d].waves+" waves"}</small></div>`).join("");
  $("#baseSelect").innerHTML=bases.map(b=>`<div class="choice ${selected.base===b.id?"selected":""} ${!state.unlockedBases.includes(b.id)?"locked":""}" data-base="${b.id}"><b>${b.name}</b><small>${b.rarity} - ${b.buff}</small></div>`).join("");
  $("#loadoutSelect").innerHTML=towers.map(t=>`<button class="${selected.loadout.includes(t.id)?"selected":""}" data-tower="${t.id}" ${!state.unlockedTowers.includes(t.id)?"disabled":""}>${t.name}<br><small>${t.rarity} $${t.cost}</small></button>`).join("");
  $$("[data-map]").forEach(e=>e.onclick=()=>{selected.map=e.dataset.map;renderSetup()});
  $$("[data-diff]").forEach(e=>e.onclick=()=>{if(e.dataset.diff==="Endless"&&!state.endless)return;selected.difficulty=e.dataset.diff;renderSetup()});
  $$("[data-base]").forEach(e=>e.onclick=()=>{if(state.unlockedBases.includes(e.dataset.base)){selected.base=e.dataset.base;renderSetup()}});
  $$("[data-tower]").forEach(e=>e.onclick=()=>toggleLoadout(e.dataset.tower));
}
function toggleLoadout(id){let l=selected.loadout;if(l.includes(id))l.splice(l.indexOf(id),1);else if(l.length<6)l.push(id);renderSetup()}
function renderCollections(){
  $("#towerCollection").innerHTML=towers.map(t=>`<div class="card"><h3 class="${rarityClass(t.rarity)}">${t.name}</h3><small>${t.desc}</small><p>${state.unlockedTowers.includes(t.id)?"Unlocked":"Locked"}</p></div>`).join("");
  $("#baseCollection").innerHTML=bases.map(b=>`<div class="card"><h3 class="${rarityClass(b.rarity)}">${b.name}</h3><small>${b.buff}</small><p>${state.unlockedBases.includes(b.id)?"Unlocked":"Locked"}</p></div>`).join("");
}
function renderInventory(){
  $("#inventoryList").innerHTML=[...state.skins.map(x=>["Base Skin",x]),...state.effects.map(x=>["Effect",x]),["Crates",state.crates],["Coins",state.coins],["Gems",state.gems]].map(i=>`<div class="card"><h3>${i[0]}</h3><small>${i[1]}</small></div>`).join("");
}
function renderStats(){
  $("#statsGrid").innerHTML=Object.entries(state.stats).map(([k,v])=>`<div class="stat-tile"><b>${v}</b><span>${label(k)}</span></div>`).join("");
  $("#achievementList").innerHTML=achievements.map(a=>`<div class="card"><h3>${a.name}</h3><small>${a.goal}</small><p>${state.achievements[a.id]?"Claimed":"Reward: "+a.reward+" crate(s)"}</p></div>`).join("");
}

function startMatch(){
  if(selected.loadout.length===0)return;
  const map=maps.find(m=>m.id===selected.map), base=bases.find(b=>b.id===selected.base), diff=difficulties[selected.difficulty];
  game={map,base,diff,wave:0,cash:base.id==="depot"?720:600,health:base.hp,enemies:[],shots:[],towers:[],units:[],particles:[],numbers:[],pads:map.pads.map(p=>({x:p[0],y:p[1],tower:null})),spawnTimer:0,countdown:4,paused:false,speed:1,selectedTower:null,placing:selected.loadout[0],ended:false,kills:0,bosses:0};
  nav("match");renderTowerBar();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
}
function loop(ts){if(!game)return;const dt=Math.min(.05,(ts-last)/1000)*(game.paused?0:game.speed);last=ts;update(dt);draw();raf=requestAnimationFrame(loop)}
function update(dt){
  if(game.ended)return;
  if(game.countdown>0){game.countdown-=dt;if(game.countdown<=0)nextWave();updateHud();return}
  spawn(dt);moveEnemies(dt);updateTowers(dt);updateUnits(dt);updateParticles(dt);updateHud();
  if(game.enemies.length===0&&game.spawnTimer<=0&&game.toSpawn<=0){if(game.wave>=game.diff.waves)endMatch(true);else game.countdown=$("#autoskip").checked?1.2:9}
  if(game.health<=0)endMatch(false);
}
function nextWave(){
  game.wave++;const boss=game.wave%5===0, mega=game.wave%15===0, flying=game.wave%4===0, stealth=game.wave%7===0;
  game.toSpawn=mega?1:boss?1:8+game.wave*2;game.spawnKind=mega?"Mega Boss":boss?"Boss":flying?"Flying":stealth?"Stealth":game.wave%3===0?"Heavy":game.wave%2===0?"Fast":"Normal";game.spawnTimer=.1;
  if(boss||mega)showBoss(mega?"MEGA BOSS APPROACHING":"BOSS INCOMING");
}
function spawn(dt){
  game.spawnTimer-=dt;if(game.toSpawn>0&&game.spawnTimer<=0){game.enemies.push(makeEnemy(game.spawnKind));game.toSpawn--;game.spawnTimer=game.spawnKind.includes("Boss")?2:.55}
}
function makeEnemy(kind){
  const w=game.wave, mult=game.diff.mult, boss=kind==="Boss", mega=kind==="Mega Boss";
  const hp=(boss?700:mega?2600:kind==="Heavy"?140:kind==="Shielded"?120:kind==="Fast"?55:75)*(1+w*.18)*mult;
  return {kind,x:game.map.path[0][0],y:game.map.path[0][1],i:0,hp,max:hp,shield:kind==="Shielded"?hp*.45:0,speed:(kind==="Fast"?92:boss?38:mega?28:55)*(kind==="Flying"?1.25:1),flying:kind==="Flying",stealth:kind==="Stealth",slow:0,poison:0,boss:boss||mega,phase:1,reward:boss?180:mega?550:22+w*2};
}
function moveEnemies(dt){
  game.enemies.slice().forEach(e=>{
    if(e.poison>0){e.hp-=18*dt;e.poison-=dt}
    const p=game.map.path[e.i+1];if(!p){game.health-=e.boss?25:8;remove(game.enemies,e);return}
    const sp=e.speed*(e.slow>0?.48:1)*(e.hp<e.max*.45&&e.boss?1.35:1);e.slow-=dt;
    const dx=p[0]-e.x,dy=p[1]-e.y,d=Math.hypot(dx,dy),step=sp*dt;
    if(step>=d){e.x=p[0];e.y=p[1];e.i++}else{e.x+=dx/d*step;e.y+=dy/d*step}
  });
}
function updateTowers(dt){
  game.towers.forEach(t=>{
    t.cool-=dt;
    if(t.type==="spawner"){if(t.cool<=0){spawnUnit(t);t.cool=t.rate*Math.pow(.88,t.level)}return}
    const range=t.range*(game.base.id==="research"?1.12:1)*(1+t.level*.08);
    const target=game.enemies.filter(e=>dist(t,e)<range&&(!e.stealth||t.level>=3)).sort((a,b)=>progress(b)-progress(a))[0];
    if(target&&t.cool<=0){hit(t,target);t.cool=t.rate*Math.pow(.86,t.level)}
  });
}
function hit(t,e){
  const dmg=t.dmg*(1+t.level*.55)*(game.base.id==="command"?1.12:1);
  game.shots.push({x:t.x,y:t.y,tx:e.x,ty:e.y,life:.16,color:t.type==="laser"?"#ff4fd8":t.type==="freeze"?"#8be4ff":"#f2c14e"});
  if(t.type==="splash"){game.enemies.forEach(n=>{if(dist(e,n)<55)towerDamage(n,dmg*.75)})}
  else {towerDamage(e,dmg)}
  if(t.type==="freeze")e.slow=1.7;if(t.type==="toxic")e.poison=3;
}
function towerDamage(e,d){if(e.shield>0){const s=Math.min(e.shield,d);e.shield-=s;d-=s}e.hp-=d;game.numbers.push({x:e.x,y:e.y,v:Math.round(d),life:.55});if(e.hp<=0)kill(e)}
function kill(e){remove(game.enemies,e);game.cash+=e.reward;game.kills++;state.stats.kills++;if(e.boss){game.bosses++;state.stats.bossesDefeated++}burst(e.x,e.y,e.boss?28:12,e.boss?"#ff5d5d":"#f2c14e")}
function spawnUnit(t){const power=1+t.level*.45;game.units.push({x:game.map.path.at(-1)[0],y:game.map.path.at(-1)[1],i:game.map.path.length-1,hp:70*power,max:70*power,dmg:18*power,rate:.75,cool:0,speed:70,kind:t.unit})}
function updateUnits(dt){
  if((game.base.id==="hq"||game.base.id==="command")&&Math.random()<dt*.28)game.units.push({x:game.map.path.at(-1)[0],y:game.map.path.at(-1)[1],i:game.map.path.length-1,hp:55,max:55,dmg:12,rate:.8,cool:0,speed:75,kind:"Defender"});
  game.units.slice().forEach(u=>{
    u.cool-=dt;const target=game.enemies.filter(e=>dist(u,e)<58).sort((a,b)=>dist(u,a)-dist(u,b))[0];
    if(target){if(u.cool<=0){towerDamage(target,u.dmg);u.cool=u.rate}return}
    const p=game.map.path[u.i-1];if(!p)return;const dx=p[0]-u.x,dy=p[1]-u.y,d=Math.hypot(dx,dy),step=u.speed*dt;if(step>=d){u.x=p[0];u.y=p[1];u.i--}else{u.x+=dx/d*step;u.y+=dy/d*step}
  });
}
function updateParticles(dt){["shots","particles","numbers"].forEach(k=>game[k]=game[k].filter(o=>(o.life-=dt)>0))}
function placeAt(x,y){
  const pad=game.pads.find(p=>!p.tower&&Math.hypot(p.x-x,p.y-y)<34), def=towers.find(t=>t.id===game.placing);if(!pad||!def||game.cash<def.cost)return;
  const t={...def,x:pad.x,y:pad.y,level:0,cool:0,pad};pad.tower=t;game.towers.push(t);game.cash-=def.cost;state.stats.towersPlaced++;game.selectedTower=t;renderUpgrade();
}
function upgrade(t){const cost=Math.round(t.cost*(.65+t.level*.55));if(t.level>=5||game.cash<cost)return;game.cash-=cost;t.level++;renderUpgrade();burst(t.x,t.y,18,"#41d18b")}
function sell(t){game.cash+=Math.round(t.cost*(.45+t.level*.2));t.pad.tower=null;remove(game.towers,t);game.selectedTower=null;renderUpgrade()}
function endMatch(win){
  game.ended=true;cancelAnimationFrame(raf);
  const coin=win?Math.round(game.map.reward*game.diff.mult+game.wave*12):Math.round(game.wave*8), xp=win?80+game.wave*8:25+game.wave*3;
  state.coins+=coin;addXP(xp);if(win){state.stats.wins++;state.crates++;state.mapWins[game.map.id]=true;if(selected.difficulty==="Normal")state.endless=true}
  checkAchievements();save();
  showModal(win?"Victory":"Defeat",`Wave reached: ${game.wave}<br>Coins earned: ${coin}<br>XP earned: ${xp}<br>Crates earned: ${win?1:0}<br>Bosses defeated: ${game.bosses}`);
  nav("menu");
}
function checkAchievements(){achievements.forEach(a=>{if(!state.achievements[a.id]&&a.check(state)){state.achievements[a.id]=true;state.crates+=a.reward}})}

const canvas=$("#game"), ctx=canvas.getContext("2d");
canvas.onclick=e=>{if(!game)return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*canvas.width/r.width,y=(e.clientY-r.top)*canvas.height/r.height;const tower=game.towers.find(t=>Math.hypot(t.x-x,t.y-y)<28);if(tower){game.selectedTower=tower;renderUpgrade()}else placeAt(x,y)}
function draw(){
  if(!game)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=game.map.theme;ctx.fillRect(0,0,canvas.width,canvas.height);
  drawGrid();drawPath();game.pads.forEach(drawPad);game.towers.forEach(drawTower);game.units.forEach(drawUnit);game.enemies.forEach(drawEnemy);game.shots.forEach(drawShot);game.particles.forEach(drawParticle);game.numbers.forEach(drawNumber);
}
function drawGrid(){ctx.globalAlpha=.12;ctx.strokeStyle="#fff";for(let x=0;x<canvas.width;x+=55){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,canvas.height);ctx.stroke()}for(let y=0;y<canvas.height;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()}ctx.globalAlpha=1}
function drawPath(){ctx.strokeStyle="#2c2421";ctx.lineWidth=52;ctx.lineJoin="round";ctx.lineCap="round";pathLine();ctx.stroke();ctx.strokeStyle="#8b7760";ctx.lineWidth=38;pathLine();ctx.stroke()}
function pathLine(){ctx.beginPath();game.map.path.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]))}
function drawPad(p){ctx.fillStyle=p.tower?"#273238":"rgba(255,255,255,.18)";ctx.strokeStyle=p.tower?"#41d18b":"#d7e2dd";ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,30,0,Math.PI*2);ctx.fill();ctx.stroke()}
function drawTower(t){ctx.fillStyle=color(t.rarity);ctx.beginPath();ctx.arc(t.x,t.y,22+t.level,0,Math.PI*2);ctx.fill();ctx.fillStyle="#101416";ctx.fillText(t.level+1,t.x-4,t.y+5);if(t===game.selectedTower){ctx.strokeStyle="#fff";ctx.beginPath();ctx.arc(t.x,t.y,t.range||38,0,Math.PI*2);ctx.stroke()}}
function drawEnemy(e){ctx.fillStyle=e.boss?"#9b1d2d":e.kind==="Fast"?"#5db7ff":e.kind==="Heavy"?"#6b5b4b":e.kind==="Flying"?"#dfe9ff":e.kind==="Stealth"?"#6f5b8f":"#30363a";ctx.beginPath();ctx.arc(e.x,e.y,e.boss?24:15,0,Math.PI*2);ctx.fill();bar(e.x-24,e.y-32,48,5,e.hp/e.max,"#ff5d5d");if(e.shield>0)bar(e.x-24,e.y-39,48,4,e.shield/(e.max*.45),"#8be4ff")}
function drawUnit(u){ctx.fillStyle="#41d18b";ctx.fillRect(u.x-11,u.y-11,22,22);bar(u.x-18,u.y-24,36,4,u.hp/u.max,"#41d18b")}
function drawShot(s){ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.tx,s.ty);ctx.stroke()}
function drawParticle(p){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
function drawNumber(n){ctx.globalAlpha=n.life/.55;ctx.fillStyle="#fff";ctx.fillText(n.v,n.x,n.y-(1-n.life/.55)*25);ctx.globalAlpha=1}
function bar(x,y,w,h,p,c){ctx.fillStyle="#111";ctx.fillRect(x,y,w,h);ctx.fillStyle=c;ctx.fillRect(x,y,w*Math.max(0,p),h)}
function burst(x,y,n,c){if(state.settings.reducedFx)return;for(let i=0;i<n;i++)game.particles.push({x:x+(Math.random()-.5)*30,y:y+(Math.random()-.5)*30,r:2+Math.random()*5,c,life:.3+Math.random()*.5})}

function renderTowerBar(){$("#towerBar").innerHTML=selected.loadout.map(id=>{const t=towers.find(x=>x.id===id);return `<button data-place="${id}">${t.name}<br><small>$${t.cost}</small></button>`}).join("");$$("[data-place]").forEach(b=>b.onclick=()=>{game.placing=b.dataset.place;$$("[data-place]").forEach(x=>x.classList.toggle("selected",x===b))})}
function renderUpgrade(){const p=$("#upgradePanel");const t=game?.selectedTower;if(!t){p.classList.add("hidden");return}p.classList.remove("hidden");const cost=Math.round(t.cost*(.65+t.level*.55));p.innerHTML=`<h3>${t.name} Lv.${t.level+1}</h3><small>${t.type==="spawner"?"Unit: "+t.unit:"Damage "+Math.round(t.dmg*(1+t.level*.55))+" Range "+Math.round(t.range)}</small><button id="upBtn" ${t.level>=5?"disabled":""}>Upgrade $${cost}</button><button id="sellBtn">Sell</button>`;$("#upBtn").onclick=()=>upgrade(t);$("#sellBtn").onclick=()=>sell(t)}
function updateHud(){$("#hudMap").textContent=game.map.name;$("#hudWave").textContent=`Wave ${game.wave}/${game.diff.waves===999?"Endless":game.diff.waves}`;$("#hudCash").textContent="$"+Math.round(game.cash);$("#hudHealth").textContent=Math.max(0,Math.round(game.health));$("#hudCountdown").textContent=Math.max(0,Math.ceil(game.countdown))}
function showBoss(txt){const b=$("#bossIntro");b.textContent=txt;b.classList.remove("hidden");setTimeout(()=>b.classList.add("hidden"),1400)}

function openCrate(){
  if(state.crates<=0)return;state.crates--;state.stats.cratesOpened++;$("#crateBox").classList.add("opening");$("#rewardReveal").classList.add("hidden");
  setTimeout(()=>{const r=rollReward();applyReward(r);$("#crateBox").classList.remove("opening");$("#rewardReveal").className=`reward-reveal ${rarityClass(r.rarity)}`;$("#rewardReveal").innerHTML=`${r.rarity} ${r.type}<br>${r.name}`;checkAchievements();save()},1300);
}
function rollReward(){
  let n=Math.random(), acc=0, rarity="Common";for(const r of rarities){acc+=r[1];if(n<=acc){rarity=r[0];break}}
  const pool=[...towers.filter(t=>t.rarity===rarity&&!state.unlockedTowers.includes(t.id)).map(t=>({type:"Tower",name:t.name,id:t.id,rarity})),...bases.filter(b=>b.rarity===rarity&&!state.unlockedBases.includes(b.id)).map(b=>({type:"Base",name:b.name,id:b.id,rarity}))];
  if(pool.length&&Math.random()<.72)return pool[Math.floor(Math.random()*pool.length)];
  const bonus=Math.round(({Common:100,Rare:220,Epic:480,Legendary:950,Mythic:2200})[rarity]*(.8+Math.random()*.7));
  return Math.random()<.5?{type:"Currency",name:`${bonus} Coins`,coins:bonus,rarity}:{type:"Skin",name:`${rarity} ${["Base Skin","Tracer FX","Explosion FX"][Math.floor(Math.random()*3)]}`,rarity};
}
function applyReward(r){if(r.type==="Tower")state.unlockedTowers.push(r.id);else if(r.type==="Base")state.unlockedBases.push(r.id);else if(r.type==="Currency")state.coins+=r.coins;else if(r.name.includes("Skin"))state.skins.push(r.name);else state.effects.push(r.name)}
function daily(){if(sameDay(state.lastDaily,Date.now()))return;state.lastDaily=Date.now();state.coins+=250;state.gems+=5;state.crates++;save();showModal("Daily Reward","250 coins<br>5 gems<br>1 crate")}
function sameDay(a,b){return new Date(a).toDateString()===new Date(b).toDateString()}
function showModal(t,b){$("#modalTitle").textContent=t;$("#modalBody").innerHTML=b;$("#modal").classList.remove("hidden")}
function rarityClass(r){return r.toLowerCase().replace(" ","")}
function color(r){return getComputedStyle(document.documentElement).getPropertyValue("--"+rarityClass(r)).trim()}
function label(k){return k.replace(/[A-Z]/g,m=>" "+m.toLowerCase()).replace(/^./,m=>m.toUpperCase())}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function progress(e){return e.i*10000+e.x+e.y}
function remove(a,x){const i=a.indexOf(x);if(i>=0)a.splice(i,1)}

$("#beginMatch").onclick=startMatch;$("#pauseBtn").onclick=()=>game.paused=!game.paused;$("#speedBtn").onclick=()=>{game.speed=game.speed===1?2:game.speed===2?3:1;$("#speedBtn").textContent=game.speed+"x"};$("#openCrate").onclick=openCrate;$("#dailyBtn").onclick=daily;$("#modalClose").onclick=()=>$("#modal").classList.add("hidden");
$("#volume").oninput=e=>{state.settings.volume=+e.target.value;save()};$("#reducedFx").onchange=e=>{state.settings.reducedFx=e.target.checked;save()};$("#resetSave").onclick=()=>{if(confirm("Reset all progression?")){state=freshSave();save();nav("menu")}};
$("#volume").value=state.settings.volume;$("#reducedFx").checked=state.settings.reducedFx;
renderNav();renderAll();
