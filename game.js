const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const saveKey = "defenseAscensionSaveV1";

const rarities = [
  ["Common", .60, "common"], ["Rare", .25, "rare"], ["Epic", .10, "epic"], ["Legendary", .04, "legendary"], ["Mythic", .01, "mythic"]
];
const maps = [
  {id:"grass",name:"Grasslands",theme:"#315a42",reward:90,path:[[0,390],[210,390],[210,160],[470,160],[470,500],[760,500],[760,260],[1100,260]],pads:[[105,315],[160,465],[315,155],[330,325],[410,245],[525,115],[590,500],[655,365],[720,405],[850,245],[930,160],[965,330]]},
  {id:"desert",name:"Desert Outpost",theme:"#7f6838",reward:120,path:[[0,210],[250,210],[250,470],[560,470],[560,170],[830,170],[830,390],[1100,390]],pads:[[95,135],[150,300],[310,325],[370,520],[465,560],[620,310],[680,155],[760,105],[760,285],[910,310],[980,220],[1000,470]]},
  {id:"snow",name:"Snow Valley",theme:"#4b7682",reward:140,path:[[0,505],[180,505],[180,310],[390,310],[390,115],[670,115],[670,450],[1100,450]],pads:[[105,425],[125,590],[250,245],[305,390],[360,390],[455,205],[520,105],[590,245],[650,220],[790,455],[865,350],[930,520]]},
  {id:"industrial",name:"Industrial Complex",theme:"#555d62",reward:170,path:[[0,335],[170,335],[170,145],[425,145],[425,355],[650,355],[650,555],[910,555],[910,250],[1100,250]],pads:[[90,255],[105,425],[260,140],[300,245],[360,250],[505,145],[535,430],[710,550],[730,360],[830,460],[980,220],[1000,340]]},
  {id:"volcano",name:"Volcano Core",theme:"#743236",reward:220,path:[[0,170],[190,170],[190,520],[410,520],[410,300],[610,300],[610,105],[855,105],[855,420],[1100,420]],pads:[[105,105],[105,300],[245,360],[300,585],[360,590],[505,235],[535,395],[650,170],[710,80],[770,190],[945,430],[990,325]]}
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
  {id:"ranger",name:"Ranger",rarity:"Common",cost:125,range:145,rate:.7,dmg:16,type:"bullet",desc:"Balanced early-game rifle tower."},
  {id:"sniper",name:"Sniper",rarity:"Common",cost:180,range:260,rate:1.4,dmg:45,type:"bullet",desc:"Long range heavy shots."},
  {id:"shotgun",name:"Shotgunner",rarity:"Rare",cost:240,range:105,rate:.9,dmg:35,type:"splash",desc:"Close burst damage."},
  {id:"minigun",name:"Minigunner",rarity:"Rare",cost:360,range:150,rate:.16,dmg:8,type:"bullet",desc:"Very high fire rate."},
  {id:"mortar",name:"Mortar Crew",rarity:"Rare",cost:430,range:230,rate:1.8,dmg:115,type:"splash",desc:"Slow artillery with huge blast radius."},
  {id:"tesla",name:"Tesla Coil",rarity:"Epic",cost:540,range:145,rate:.45,dmg:34,type:"laser",desc:"Electric tower with rapid zaps."},
  {id:"flame",name:"Flamethrower",rarity:"Epic",cost:480,range:110,rate:.22,dmg:13,type:"toxic",desc:"Short range burning damage over time."},
  {id:"rocket",name:"Rocket Launcher",rarity:"Epic",cost:500,range:180,rate:1.2,dmg:90,type:"splash",desc:"Explosive area hits."},
  {id:"freeze",name:"Freeze Tower",rarity:"Epic",cost:420,range:130,rate:.8,dmg:12,type:"freeze",desc:"Slows enemies."},
  {id:"laser",name:"Laser Tower",rarity:"Legendary",cost:720,range:190,rate:.08,dmg:10,type:"laser",desc:"Sustained burn beam."},
  {id:"railgun",name:"Railgunner",rarity:"Legendary",cost:880,range:275,rate:1.65,dmg:185,type:"bullet",desc:"Piercing late-game burst damage."},
  {id:"plasma",name:"Plasma Reactor",rarity:"Mythic",cost:1250,range:210,rate:.18,dmg:22,type:"laser",desc:"Mythic reactor that melts bosses."},
  {id:"toxic",name:"Toxic Tower",rarity:"Epic",cost:460,range:155,rate:.7,dmg:20,type:"toxic",desc:"Poison damage over time."},
  {id:"base",name:"Military Base",rarity:"Rare",cost:560,range:0,rate:4,dmg:0,type:"spawner",unit:"Soldier",desc:"Spawns soldiers."},
  {id:"barracks",name:"Barracks",rarity:"Epic",cost:760,range:0,rate:4.8,dmg:0,type:"spawner",unit:"Riflemen",desc:"Spawns riflemen and medics."},
  {id:"tank",name:"Tank Factory",rarity:"Legendary",cost:1050,range:0,rate:6.5,dmg:0,type:"spawner",unit:"Tank",desc:"Spawns armored vehicles."},
  {id:"commandcenter",name:"Elite Command Center",rarity:"Mythic",cost:1450,range:0,rate:7.5,dmg:0,type:"spawner",unit:"Commando",desc:"Spawns elite commandos."}
];
const skinCatalog = [
  {id:"default",name:"Default Finish",rarity:"Common",colors:["#c9d0d3","#41d18b"],glow:"#41d18b",pattern:"clean"},
  {id:"forest",name:"Forest Camo",rarity:"Common",colors:["#2f6d46","#a5c86f"],glow:"#8dcf63",pattern:"stripe"},
  {id:"urban",name:"Urban Alloy",rarity:"Common",colors:["#7b8c93","#d9e5e1"],glow:"#9fb0aa",pattern:"plate"},
  {id:"arctic",name:"Arctic Crystal",rarity:"Rare",colors:["#dff8ff","#5db7ff"],glow:"#8be4ff",pattern:"crystal"},
  {id:"ember",name:"Ember Forged",rarity:"Rare",colors:["#ff6b35","#f2c14e"],glow:"#ff8f3d",pattern:"flame"},
  {id:"venom",name:"Venom Reactor",rarity:"Epic",colors:["#20282c","#6dff8a"],glow:"#6dff8a",pattern:"toxic"},
  {id:"void",name:"Void Nebula",rarity:"Epic",colors:["#19142a","#b871ff"],glow:"#b871ff",pattern:"stars"},
  {id:"solar",name:"Solar Crown",rarity:"Legendary",colors:["#fff0a6","#ff8b2e"],glow:"#ffb02e",pattern:"halo"},
  {id:"dragon",name:"Dragon Scale",rarity:"Legendary",colors:["#53202c","#ff4b4b"],glow:"#ff5d5d",pattern:"scale"},
  {id:"quantum",name:"Quantum Prism",rarity:"Mythic",colors:["#8be4ff","#ff4fd8"],glow:"#ff4fd8",pattern:"prism"},
  {id:"glitch",name:"Glitch Matrix",rarity:"Mythic",colors:["#08110f","#41d18b"],glow:"#41d18b",pattern:"glitch"}
];
const shopTabs = ["featured","towers","skins","boosts"];
const achievements = [
  {id:"firstWin",name:"First Victory",goal:"Win one match",check:s=>s.stats.wins>=1,reward:1},
  {id:"slayer",name:"Enemy Slayer",goal:"Defeat 500 enemies",check:s=>s.stats.kills>=500,reward:2},
  {id:"builder",name:"Field Engineer",goal:"Place 100 towers",check:s=>s.stats.towersPlaced>=100,reward:1},
  {id:"boss",name:"Boss Breaker",goal:"Defeat 10 bosses",check:s=>s.stats.bossesDefeated>=10,reward:2},
  {id:"collector",name:"Collector",goal:"Open 25 crates",check:s=>s.stats.cratesOpened>=25,reward:3}
];
const promoCodes = {
  WELCOME1000:{label:"Starter bankroll",public:true,apply:s=>{s.coins+=1000;s.gems+=15;s.crates+=1;return "1,000 coins, 15 gems, and 1 crate"}},
  TOWERPOWER:{label:"Minigunner unlock",public:true,apply:s=>{unlock(s.unlockedTowers,"minigun");s.coins+=450;return "Minigunner unlocked and 450 coins"}},
  MANGOCRATE:{label:"Crate bundle",public:true,apply:s=>{s.crates+=5;return "5 crates"}},
  BOSSRUSH:{label:"Boss prep pack",public:true,apply:s=>{s.coins+=1500;s.gems+=35;addXP(250);return "1,500 coins, 35 gems, and 250 XP"}},
  BASEBOOST:{label:"Base starter pack",public:true,apply:s=>{unlock(s.unlockedBases,"hq");unlock(s.unlockedBases,"depot");s.crates+=2;return "Military HQ, Supply Depot, and 2 crates"}}
};

let state = load();
let selected = freshSelection();
let game = null, last = 0, raf = 0;

function freshSelection(){
  return {map:"grass",difficulty:"Normal",base:"standard",loadout:["scout","ranger","sniper","shotgun","base"]};
}
function freshSave(){
  return {level:1,xp:0,coins:400,gems:20,crates:2,endless:false,lastDaily:0,settings:{volume:60,reducedFx:false},
    unlockedTowers:["scout","ranger","sniper","shotgun","base"],unlockedBases:["standard"],
    skins:["Default Finish","Forest Camo"],ownedSkins:["default","forest"],towerSkins:{},effects:["Classic Burst"],
    extraLives:0,seasonPass:false,upgrades:{startingCash:0,damage:0,discount:0},shopTab:"featured",
    stats:{kills:0,wins:0,towersPlaced:0,cratesOpened:0,bossesDefeated:0},achievements:{},mapWins:{},redeemedCodes:[],devMode:false};
}
function load(){try{return migrateSave({...freshSave(),...(JSON.parse(localStorage.getItem(saveKey))||{})})}catch{return freshSave()}}
function migrateSave(s){
  s.ownedSkins=s.ownedSkins||["default","forest"];
  s.skins=s.skins||["Default Finish","Forest Camo"];
  if(!s.ownedSkins.includes("default"))s.ownedSkins.unshift("default");
  if(!s.ownedSkins.includes("forest"))s.ownedSkins.push("forest");
  if(!s.skins.includes("Default Finish"))s.skins.unshift("Default Finish");
  if(!s.skins.includes("Forest Camo"))s.skins.push("Forest Camo");
  s.towerSkins=s.towerSkins||{};
  s.extraLives=s.extraLives||0;
  s.seasonPass=!!s.seasonPass;
  s.upgrades={startingCash:0,damage:0,discount:0,...(s.upgrades||{})};
  s.shopTab=shopTabs.includes(s.shopTab)?s.shopTab:"featured";
  s.unlockedTowers=[...new Set(s.unlockedTowers||freshSave().unlockedTowers)];
  s.unlockedBases=[...new Set(s.unlockedBases||freshSave().unlockedBases)];
  return s;
}
function save(){localStorage.setItem(saveKey,JSON.stringify(state));renderAll()}
function hardReset(){
  cancelAnimationFrame(raf);game=null;last=0;secretBuffer="";
  localStorage.removeItem(saveKey);
  state=freshSave();selected=freshSelection();
  localStorage.setItem(saveKey,JSON.stringify(state));
  $("#volume").value=state.settings.volume;$("#reducedFx").checked=state.settings.reducedFx;
  $("#promoInput").value="";$("#promoMessage").textContent="";
  $("#upgradePanel").classList.add("hidden");$("#bossIntro").classList.add("hidden");$("#modal").classList.add("hidden");
  nav("menu");renderAll();
}
function xpNeed(){return 100+state.level*60}
function addXP(n){state.xp+=n;while(state.xp>=xpNeed()){state.xp-=xpNeed();state.level++;state.coins+=75;state.gems+=3}}
function nav(to){$$(".screen").forEach(x=>x.classList.remove("active"));$("#"+to).classList.add("active");if(to==="match")return;renderAll()}

function renderAll(){
  sanitizeSelection();
  $("#profileLevel").textContent=state.level;$("#coins").textContent=state.coins;$("#gems").textContent=state.gems;$("#xpFill").style.width=Math.min(100,state.xp/xpNeed()*100)+"%";
  $("#crateCount").textContent=state.crates;$("#dailyBtn").disabled=sameDay(state.lastDaily,Date.now());
  renderHero();renderSetup();renderCollections();renderStats();renderInventory();renderPromos();renderShop();
}
function renderNav(){
  const items=[["menu","Main Menu"],["play","Play"],["shop","Shop"],["crates","Crates"],["collection","Collection"],["inventory","Inventory"],["codes","Codes"],["stats","Stats"],["settings","Settings"]];
  $("#nav").innerHTML=items.map(i=>`<button data-nav="${i[0]}">${i[1]}</button>`).join("");
  $$("[data-nav]").forEach(b=>b.onclick=()=>nav(b.dataset.nav));$$("[data-go]").forEach(b=>b.onclick=()=>nav(b.dataset.go));
}
function renderHero(){
  $("#heroStats").innerHTML=[["Wins",state.stats.wins],["Kills",state.stats.kills],["Bosses",state.stats.bossesDefeated],["Endless",state.endless?"Unlocked":"Locked"]].map(x=>`<div class="stat-tile"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("");
  $("#featuredCards").innerHTML=[
    ["Coins","Use coins in the Shop for towers, crates, skins, bases, extra lives, and permanent upgrades."],
    ["Buy Towers","Open the Shop, choose Towers, then buy any locked tower you can afford."],
    ["Skin Towers","Right-click an owned tower in Inventory, press Add Skin, then use it in a match."]
  ].map(c=>`<div class="card"><h3>${c[0]}</h3><small>${c[1]}</small></div>`).join("");
}
function renderSetup(){
  sanitizeSelection();
  $("#mapSelect").innerHTML=maps.map(m=>`<div class="choice ${selected.map===m.id?"selected":""}" data-map="${m.id}"><b>${m.name}</b><small>${m.reward} coin clear reward</small></div>`).join("");
  $("#difficultySelect").innerHTML=Object.keys(difficulties).map(d=>`<div class="choice ${selected.difficulty===d?"selected":""}" data-diff="${d}"><b>${d}</b><small>${d==="Endless"&&!state.endless?"Locked until normal clear":difficulties[d].waves+" waves"}</small></div>`).join("");
  $("#baseSelect").innerHTML=bases.map(b=>`<div class="choice ${selected.base===b.id?"selected":""} ${!state.unlockedBases.includes(b.id)?"locked":""}" data-base="${b.id}"><b>${b.name}</b><small>${b.rarity} - ${b.buff}</small></div>`).join("");
  $("#loadoutSelect").innerHTML=towers.map(t=>{const picked=selected.loadout.includes(t.id), unlocked=state.unlockedTowers.includes(t.id);return `<button class="${picked?"selected":""}" data-tower="${t.id}" ${!unlocked&&!picked?"disabled":""}>${t.name}<br><small>${unlocked?t.rarity+" $"+t.cost:"Locked"}</small></button>`}).join("");
  $$("[data-map]").forEach(e=>e.onclick=()=>{selected.map=e.dataset.map;renderSetup()});
  $$("[data-diff]").forEach(e=>e.onclick=()=>{if(e.dataset.diff==="Endless"&&!state.endless)return;selected.difficulty=e.dataset.diff;renderSetup()});
  $$("[data-base]").forEach(e=>e.onclick=()=>{if(state.unlockedBases.includes(e.dataset.base)){selected.base=e.dataset.base;renderSetup()}});
  $$("[data-tower]").forEach(e=>e.onclick=()=>toggleLoadout(e.dataset.tower));
}
function sanitizeSelection(){
  if(!state.unlockedBases.includes(selected.base))selected.base="standard";
  if(selected.difficulty==="Endless"&&!state.endless)selected.difficulty="Normal";
  selected.loadout=selected.loadout.filter(id=>state.unlockedTowers.includes(id));
  if(selected.loadout.length===0)selected.loadout=freshSelection().loadout.filter(id=>state.unlockedTowers.includes(id));
}
function toggleLoadout(id){
  let l=selected.loadout;
  if(l.includes(id))l.splice(l.indexOf(id),1);
  else if(state.unlockedTowers.includes(id)&&l.length<8)l.push(id);
  renderSetup();
}
function renderCollections(){
  $("#towerCollection").innerHTML=towers.map(t=>`<div class="card"><h3 class="${rarityClass(t.rarity)}">${t.name}</h3><small>${t.desc}</small><p>${state.unlockedTowers.includes(t.id)?"Unlocked":"Locked"}</p></div>`).join("");
  $("#baseCollection").innerHTML=bases.map(b=>`<div class="card"><h3 class="${rarityClass(b.rarity)}">${b.name}</h3><small>${b.buff}</small><p>${state.unlockedBases.includes(b.id)?"Unlocked":"Locked"}</p></div>`).join("");
}
function renderInventory(){
  const towerCards=state.unlockedTowers.map(id=>{
    const t=towers.find(x=>x.id===id), skin=skinById(state.towerSkins[id]||"default");
    return `<div class="card inventory-tower" data-inventory-tower="${id}">
      <h3 class="${rarityClass(t.rarity)}">${t.name}</h3>
      <small>${t.rarity} tower - equipped skin: ${skin.name}</small>
      <p>Right-click for skin actions</p>
    </div>`;
  }).join("");
  const skinCards=state.ownedSkins.map(id=>{
    const s=skinById(id);
    return `<div class="card skin-card"><h3 class="${rarityClass(s.rarity)}">${s.name}</h3><small>${s.rarity} skin - ${skinTone(s)}</small></div>`;
  }).join("");
  $("#inventoryList").innerHTML=[
    `<div class="card wallet-card"><h3>Wallet</h3><small>Coins buy shop items. Gems buy premium bundles.</small><p>${state.coins} coins | ${state.gems} gems | ${state.crates} crates</p></div>`,
    `<div class="card wallet-card"><h3>Boosts</h3><small>Permanent upgrades and lives</small><p>Lives ${state.extraLives} | Cash +${state.upgrades.startingCash*75} | Damage +${state.upgrades.damage*5}% | Discount ${state.upgrades.discount*4}%</p></div>`,
    `<div class="card wallet-card"><h3>Season Pass</h3><small>${state.seasonPass?"Active: better crate odds and win bonuses":"Not owned"}</small><p>${state.seasonPass?"Premium rewards enabled":"Buy it in the Shop"}</p></div>`,
    towerCards,
    skinCards,
    ...state.effects.map(x=>`<div class="card"><h3>Effect</h3><small>${x}</small></div>`),
    `<div class="card"><h3>Dev Mode</h3><small>${state.devMode?"Active":"Off"}</small></div>`
  ].join("");
  $$("[data-inventory-tower]").forEach(e=>e.oncontextmenu=ev=>showInventoryMenu(ev,e.dataset.inventoryTower));
}
function renderShop(){
  if(!$("#shopList"))return;
  $("#shopCoins").textContent=state.coins;$("#shopGems").textContent=state.gems;
  $$("[data-shop-tab]").forEach(b=>{
    b.classList.toggle("selected",b.dataset.shopTab===state.shopTab);
    b.onclick=()=>{state.shopTab=b.dataset.shopTab;renderShop()};
  });
  const items=shopItems().filter(i=>i.tab===state.shopTab||i.tab==="all");
  $("#shopList").innerHTML=items.map(i=>shopCard(i)).join("");
  $$("[data-buy]").forEach(b=>b.onclick=()=>buyShopItem(b.dataset.buy));
}
function shopItems(){
  const lockedTowers=towers.filter(t=>!state.unlockedTowers.includes(t.id)).map(t=>({id:"tower:"+t.id,tab:"towers",name:t.name,type:"Tower",rarity:t.rarity,desc:t.desc,cost:towerShopCost(t),currency:"coins",owned:false}));
  const skinItems=skinCatalog.filter(s=>!state.ownedSkins.includes(s.id)).map(s=>({id:"skin:"+s.id,tab:"skins",name:s.name,type:"Skin",rarity:s.rarity,desc:`${skinTone(s)} tower finish`,cost:skinShopCost(s),currency:"coins",owned:false}));
  return [
    {id:"crate:basic",tab:"featured",name:"Battle Crate",type:"Crate",rarity:"Rare",desc:"Unlocks towers, bases, skins, effects, coins, or gems.",cost:450,currency:"coins"},
    {id:"crate:elite",tab:"featured",name:"Elite Crate Bundle",type:"Crates",rarity:"Epic",desc:"Three crates with one bonus skin roll.",cost:8,currency:"gems"},
    {id:"pass:season",tab:"featured",name:"Season Pass",type:"Pass",rarity:"Legendary",desc:"Win rewards +50%, daily crates +1, and better crate odds.",cost:35,currency:"gems",owned:state.seasonPass},
    {id:"life:1",tab:"boosts",name:"Extra Life",type:"Consumable",rarity:"Rare",desc:"Automatically saves a lost match once.",cost:650,currency:"coins"},
    {id:"upgrade:startingCash",tab:"boosts",name:"Start Cash Upgrade",type:"Upgrade",rarity:"Rare",desc:"Start every match with +75 cash per level.",cost:upgradeCost("startingCash"),currency:"coins",owned:state.upgrades.startingCash>=5},
    {id:"upgrade:damage",tab:"boosts",name:"Damage Upgrade",type:"Upgrade",rarity:"Epic",desc:"All towers deal +5% damage per level.",cost:upgradeCost("damage"),currency:"coins",owned:state.upgrades.damage>=5},
    {id:"upgrade:discount",tab:"boosts",name:"Build Discount",type:"Upgrade",rarity:"Epic",desc:"Placement and upgrade costs drop by 4% per level.",cost:upgradeCost("discount"),currency:"coins",owned:state.upgrades.discount>=5},
    ...bases.filter(b=>!state.unlockedBases.includes(b.id)).map(b=>({id:"base:"+b.id,tab:"boosts",name:b.name,type:"Base",rarity:b.rarity,desc:b.buff,cost:baseShopCost(b),currency:"coins"})),
    ...lockedTowers,
    ...skinItems
  ];
}
function shopCard(i){
  const canBuy=!i.owned&&state[i.currency]>=i.cost;
  return `<div class="card shop-card">
    <h3 class="${rarityClass(i.rarity)}">${i.name}</h3>
    <small>${i.type} - ${i.desc}</small>
    <p>${i.owned?"Owned":`${i.cost} ${i.currency}`}</p>
    <button class="primary" data-buy="${i.id}" ${!canBuy?"disabled":""}>${i.owned?"Owned":"Buy"}</button>
  </div>`;
}
function renderStats(){
  $("#statsGrid").innerHTML=Object.entries(state.stats).map(([k,v])=>`<div class="stat-tile"><b>${v}</b><span>${label(k)}</span></div>`).join("");
  $("#achievementList").innerHTML=achievements.map(a=>`<div class="card"><h3>${a.name}</h3><small>${a.goal}</small><p>${state.achievements[a.id]?"Claimed":"Reward: "+a.reward+" crate(s)"}</p></div>`).join("");
}
function renderPromos(){
  const list=$("#promoList");if(!list)return;
  list.innerHTML=Object.entries(promoCodes).filter(([,c])=>c.public).map(([code,c])=>`<div class="card"><h3>${code}</h3><small>${c.label}</small><p>${state.redeemedCodes.includes(code)?"Redeemed":"Available"}</p></div>`).join("");
}

function startMatch(){
  sanitizeSelection();
  if(selected.loadout.length===0)return;
  const map=maps.find(m=>m.id===selected.map), base=bases.find(b=>b.id===selected.base), diff=difficulties[selected.difficulty];
  const startCash=(base.id==="depot"?720:600)+state.upgrades.startingCash*75;
  game={map,base,diff,wave:0,cash:state.devMode?999999:startCash,health:base.hp,enemies:[],shots:[],towers:[],units:[],particles:[],numbers:[],pads:map.pads.map(p=>({x:p[0],y:p[1],tower:null})),spawnTimer:0,countdown:4,paused:false,speed:1,selectedTower:null,placing:selected.loadout[0],ended:false,kills:0,bosses:0};
  nav("match");renderTowerBar();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
}
function loop(ts){if(!game)return;const dt=Math.min(.05,(ts-last)/1000)*(game.paused?0:game.speed);last=ts;update(dt);draw();raf=requestAnimationFrame(loop)}
function update(dt){
  if(game.ended)return;
  if(state.devMode){game.cash=999999;game.health=Math.max(game.health,game.base.hp)}
  if(game.countdown>0){game.countdown-=dt;if(game.countdown<=0)nextWave();updateHud();return}
  spawn(dt);moveEnemies(dt);updateTowers(dt);updateUnits(dt);updateParticles(dt);updateHud();
  if(game.enemies.length===0&&game.spawnTimer<=0&&game.toSpawn<=0){if(game.wave>=game.diff.waves)endMatch(true);else game.countdown=$("#autoskip").checked?1.2:9}
  if(game.health<=0){
    if(state.extraLives>0){state.extraLives--;game.health=Math.ceil(game.base.hp*.45);burst(140,120,34,"#f2c14e");save();showBoss("EXTRA LIFE USED")}
    else endMatch(false);
  }
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
  const dmg=t.dmg*(1+t.level*.55)*(game.base.id==="command"?1.12:1)*(1+state.upgrades.damage*.05);
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
  const pad=game.pads.find(p=>!p.tower&&Math.hypot(p.x-x,p.y-y)<34), def=towers.find(t=>t.id===game.placing);if(!pad||!def)return;
  const cost=buildCost(def.cost);
  if(game.cash<cost)return;
  const t={...def,x:pad.x,y:pad.y,level:0,cool:0,pad,skin:state.towerSkins[def.id]||"default"};pad.tower=t;game.towers.push(t);game.cash-=cost;state.stats.towersPlaced++;game.selectedTower=t;renderUpgrade();
}
function upgrade(t){const cost=upgradeBuildCost(t);if(t.level>=5||game.cash<cost)return;game.cash-=cost;t.level++;renderUpgrade();burst(t.x,t.y,18,"#41d18b")}
function sell(t){game.cash+=Math.round(t.cost*(.45+t.level*.2));t.pad.tower=null;remove(game.towers,t);game.selectedTower=null;renderUpgrade()}
function endMatch(win){
  game.ended=true;cancelAnimationFrame(raf);
  const passMult=state.seasonPass&&win?1.5:1;
  const coin=win?Math.round((game.map.reward*game.diff.mult+game.wave*12)*passMult):Math.round(game.wave*8), xp=win?Math.round((80+game.wave*8)*passMult):25+game.wave*3;
  state.coins+=coin;addXP(xp);if(win){state.stats.wins++;state.crates+=state.seasonPass?2:1;state.mapWins[game.map.id]=true;if(selected.difficulty==="Normal")state.endless=true}
  checkAchievements();save();
  showModal(win?"Victory":"Defeat",`Wave reached: ${game.wave}<br>Coins earned: ${coin}<br>XP earned: ${xp}<br>Crates earned: ${win?(state.seasonPass?2:1):0}<br>Bosses defeated: ${game.bosses}`);
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
function drawTower(t){
  const skin=skinById(t.skin||state.towerSkins[t.id]||"default");
  const c=skin.id==="default"?color(t.rarity):skin.glow, x=t.x, y=t.y, size=22+t.level*.9;
  if(t===game.selectedTower){ctx.strokeStyle="rgba(255,255,255,.75)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,t.range||45,0,Math.PI*2);ctx.stroke()}
  ctx.save();
  ctx.shadowColor=c;ctx.shadowBlur=12;
  ctx.fillStyle=skin.colors[0];ctx.strokeStyle=c;ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(x,y,size+8,0,Math.PI*2);ctx.fill();ctx.stroke();
  drawSkinPattern(skin,x,y,size);
  ctx.shadowBlur=0;
  ctx.fillStyle=skin.colors[1];ctx.strokeStyle="#07120d";ctx.lineWidth=3;
  if(t.type==="spawner"){
    ctx.fillRect(x-20,y-16,40,32);ctx.strokeRect(x-20,y-16,40,32);
    ctx.fillStyle="#d9e5e1";ctx.fillRect(x-13,y-6,9,12);ctx.fillRect(x+4,y-6,9,12);
    ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x-24,y-16);ctx.lineTo(x,y-34);ctx.lineTo(x+24,y-16);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(t.id==="sniper"||t.id==="railgun"){
    ctx.fillRect(x-9,y-19,18,38);ctx.strokeRect(x-9,y-19,18,38);
    ctx.beginPath();ctx.moveTo(x+8,y-8);ctx.lineTo(x+38,y-22);ctx.lineWidth=t.id==="railgun"?8:5;ctx.stroke();
  }else if(t.id==="minigun"){
    ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();ctx.stroke();
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(x+8,y+i*7);ctx.lineTo(x+36,y+i*7);ctx.stroke()}
  }else if(t.id==="rocket"||t.id==="mortar"){
    ctx.beginPath();ctx.arc(x,y,18,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillRect(x-8,y-34,16,34);ctx.strokeRect(x-8,y-34,16,34);
    ctx.beginPath();ctx.moveTo(x-8,y-34);ctx.lineTo(x,y-48);ctx.lineTo(x+8,y-34);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(t.id==="freeze"||t.id==="tesla"){
    ctx.beginPath();ctx.moveTo(x,y-28);ctx.lineTo(x+25,y);ctx.lineTo(x,y+28);ctx.lineTo(x-25,y);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle="#eaffff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x+2,y-12);ctx.lineTo(x-1,y+7);ctx.lineTo(x+14,y-3);ctx.stroke();
  }else if(t.id==="laser"||t.id==="plasma"){
    ctx.beginPath();ctx.arc(x,y,22,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle="#fff";ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+12,y);ctx.lineTo(x+34,y);ctx.stroke();
  }else if(t.id==="toxic"||t.id==="flame"){
    ctx.beginPath();ctx.roundRect(x-18,y-20,36,40,8);ctx.fill();ctx.stroke();
    ctx.fillStyle="#07120d";ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x+14,y-5);ctx.lineTo(x+36,y);ctx.lineTo(x+14,y+5);ctx.closePath();ctx.fill();
  }else if(t.id==="shotgun"){
    ctx.fillRect(x-16,y-15,32,30);ctx.strokeRect(x-16,y-15,32,30);
    ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+10,y-6);ctx.lineTo(x+33,y-14);ctx.moveTo(x+10,y+6);ctx.lineTo(x+33,y+14);ctx.stroke();
  }else{
    ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+6,y-4);ctx.lineTo(x+31,y-10);ctx.stroke();
  }
  drawUpgradePips(t,x,y,size);
  drawTowerLabel(t,x,y);
  ctx.restore();
}
function drawSkinPattern(skin,x,y,size){
  if(skin.id==="default")return;
  ctx.save();ctx.strokeStyle=skin.colors[1];ctx.fillStyle=skin.colors[1];ctx.lineWidth=2;ctx.globalAlpha=.7;
  if(skin.pattern==="stripe"){
    for(let i=-18;i<=18;i+=12){ctx.beginPath();ctx.moveTo(x+i,y-size-1);ctx.lineTo(x+i+18,y+size+1);ctx.stroke()}
  }else if(skin.pattern==="plate"){
    ctx.strokeRect(x-18,y-18,36,36);ctx.strokeRect(x-10,y-10,20,20);
  }else if(skin.pattern==="crystal"){
    for(let i=0;i<6;i++){const a=i*Math.PI/3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*30,y+Math.sin(a)*30);ctx.stroke()}
  }else if(skin.pattern==="flame"){
    for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(x+i*9,y+22);ctx.quadraticCurveTo(x+i*12,y,x+i*4,y-19);ctx.stroke()}
  }else if(skin.pattern==="toxic"){
    for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(x-16+i*8,y+(i%2?10:-8),3+i%2,0,Math.PI*2);ctx.fill()}
  }else if(skin.pattern==="stars"){
    for(let i=0;i<7;i++){ctx.fillRect(x-18+Math.random()*36,y-18+Math.random()*36,2,2)}
  }else if(skin.pattern==="halo"){
    ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.stroke();
  }else if(skin.pattern==="scale"){
    for(let yy=-14;yy<=14;yy+=9)for(let xx=-14;xx<=14;xx+=9){ctx.beginPath();ctx.arc(x+xx,y+yy,5,Math.PI,0);ctx.stroke()}
  }else if(skin.pattern==="prism"){
    ctx.beginPath();ctx.moveTo(x,y-28);ctx.lineTo(x+24,y+12);ctx.lineTo(x-24,y+12);ctx.closePath();ctx.stroke();
  }else if(skin.pattern==="glitch"){
    for(let i=0;i<5;i++)ctx.fillRect(x-22+Math.random()*44,y-20+Math.random()*40,14,3);
  }
  ctx.restore();
}
function drawUpgradePips(t,x,y,size){
  for(let i=0;i<5;i++){
    ctx.fillStyle=i<t.level?"#f2c14e":"#263134";
    ctx.beginPath();ctx.arc(x-16+i*8,y+size+13,3,0,Math.PI*2);ctx.fill();
  }
}
function drawTowerLabel(t,x,y){
  ctx.font="700 11px Segoe UI, Arial";ctx.textAlign="center";ctx.textBaseline="middle";
  const text=towerShort(t), w=Math.max(42,ctx.measureText(text).width+12);
  ctx.fillStyle="rgba(7,18,13,.86)";ctx.fillRect(x-w/2,y+37,w,17);
  ctx.strokeStyle="rgba(255,255,255,.18)";ctx.strokeRect(x-w/2,y+37,w,17);
  ctx.fillStyle="#edf3f0";ctx.fillText(text,x,y+45.5);
}
function towerShort(t){
  return ({scout:"Scout",ranger:"Ranger",sniper:"Sniper",shotgun:"Shotgun",minigun:"Mini",mortar:"Mortar",tesla:"Tesla",flame:"Flame",rocket:"Rocket",freeze:"Freeze",laser:"Laser",railgun:"Railgun",plasma:"Plasma",toxic:"Toxic",base:"Mil Base",barracks:"Barracks",tank:"Tank Fac",commandcenter:"Command"})[t.id]||t.name;
}
function drawEnemy(e){ctx.fillStyle=e.boss?"#9b1d2d":e.kind==="Fast"?"#5db7ff":e.kind==="Heavy"?"#6b5b4b":e.kind==="Flying"?"#dfe9ff":e.kind==="Stealth"?"#6f5b8f":"#30363a";ctx.beginPath();ctx.arc(e.x,e.y,e.boss?24:15,0,Math.PI*2);ctx.fill();bar(e.x-24,e.y-32,48,5,e.hp/e.max,"#ff5d5d");if(e.shield>0)bar(e.x-24,e.y-39,48,4,e.shield/(e.max*.45),"#8be4ff")}
function drawUnit(u){ctx.fillStyle="#41d18b";ctx.fillRect(u.x-11,u.y-11,22,22);bar(u.x-18,u.y-24,36,4,u.hp/u.max,"#41d18b")}
function drawShot(s){ctx.strokeStyle=s.color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.tx,s.ty);ctx.stroke()}
function drawParticle(p){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
function drawNumber(n){ctx.globalAlpha=n.life/.55;ctx.fillStyle="#fff";ctx.fillText(n.v,n.x,n.y-(1-n.life/.55)*25);ctx.globalAlpha=1}
function bar(x,y,w,h,p,c){ctx.fillStyle="#111";ctx.fillRect(x,y,w,h);ctx.fillStyle=c;ctx.fillRect(x,y,w*Math.max(0,p),h)}
function burst(x,y,n,c){if(state.settings.reducedFx)return;for(let i=0;i<n;i++)game.particles.push({x:x+(Math.random()-.5)*30,y:y+(Math.random()-.5)*30,r:2+Math.random()*5,c,life:.3+Math.random()*.5})}

function renderTowerBar(){$("#towerBar").innerHTML=selected.loadout.map(id=>{const t=towers.find(x=>x.id===id);return `<button data-place="${id}">${t.name}<br><small>$${buildCost(t.cost)}</small></button>`}).join("");$$("[data-place]").forEach(b=>b.onclick=()=>{game.placing=b.dataset.place;$$("[data-place]").forEach(x=>x.classList.toggle("selected",x===b))})}
function renderUpgrade(){const p=$("#upgradePanel");const t=game?.selectedTower;if(!t){p.classList.add("hidden");return}p.classList.remove("hidden");const cost=upgradeBuildCost(t);const skin=skinById(t.skin||"default");p.innerHTML=`<h3>${t.name} Lv.${t.level+1}</h3><small>${t.type==="spawner"?"Unit: "+t.unit:"Damage "+Math.round(t.dmg*(1+t.level*.55)*(1+state.upgrades.damage*.05))+" Range "+Math.round(t.range)}<br>Skin: ${skin.name}</small><button id="upBtn" ${t.level>=5?"disabled":""}>Upgrade $${cost}</button><button id="sellBtn">Sell</button>`;$("#upBtn").onclick=()=>upgrade(t);$("#sellBtn").onclick=()=>sell(t)}
function updateHud(){$("#hudMap").textContent=game.map.name;$("#hudWave").textContent=`Wave ${game.wave}/${game.diff.waves===999?"Endless":game.diff.waves}`;$("#hudCash").textContent="$"+Math.round(game.cash);$("#hudHealth").textContent=Math.max(0,Math.round(game.health));$("#hudCountdown").textContent=Math.max(0,Math.ceil(game.countdown))}
function showBoss(txt){const b=$("#bossIntro");b.textContent=txt;b.classList.remove("hidden");setTimeout(()=>b.classList.add("hidden"),1400)}

function openCrate(){
  if(state.crates<=0)return;state.crates--;state.stats.cratesOpened++;$("#crateBox").classList.add("opening");$("#rewardReveal").classList.add("hidden");
  setTimeout(()=>{const r=rollReward();applyReward(r);$("#crateBox").classList.remove("opening");$("#rewardReveal").className=`reward-reveal ${rarityClass(r.rarity)}`;$("#rewardReveal").innerHTML=`${r.rarity} ${r.type}<br>${r.name}`;checkAchievements();save()},1300);
}
function rollReward(){
  let n=Math.random(), acc=0, rarity="Common";for(const r of rarities){acc+=r[1];if(n<=acc){rarity=r[0];break}}
  if(state.seasonPass&&Math.random()<.18)rarity=upgradeRarity(rarity);
  const pool=[...towers.filter(t=>t.rarity===rarity&&!state.unlockedTowers.includes(t.id)).map(t=>({type:"Tower",name:t.name,id:t.id,rarity})),...bases.filter(b=>b.rarity===rarity&&!state.unlockedBases.includes(b.id)).map(b=>({type:"Base",name:b.name,id:b.id,rarity}))];
  if(pool.length&&Math.random()<.58)return pool[Math.floor(Math.random()*pool.length)];
  const unopenedSkins=skinCatalog.filter(s=>s.rarity===rarity&&!state.ownedSkins.includes(s.id));
  if(unopenedSkins.length&&Math.random()<.62){const s=unopenedSkins[Math.floor(Math.random()*unopenedSkins.length)];return {type:"Skin",name:s.name,id:s.id,rarity:s.rarity}}
  const effects=["Meteor Impact FX","Aurora Beam FX","Thunder Pop FX","Gold Shell Tracer","Void Spark Burst","Crystal Freeze Ring","Toxic Bubble Trail"];
  if(Math.random()<.28)return {type:"Effect",name:`${rarity} ${effects[Math.floor(Math.random()*effects.length)]}`,rarity};
  const bonus=Math.round(({Common:120,Rare:260,Epic:560,Legendary:1150,Mythic:2600})[rarity]*(.8+Math.random()*.7));
  return Math.random()<.8?{type:"Currency",name:`${bonus} Coins`,coins:bonus,rarity}:{type:"Currency",name:`${Math.max(1,Math.round(bonus/170))} Gems`,gems:Math.max(1,Math.round(bonus/170)),rarity};
}
function applyReward(r){
  if(r.type==="Tower")unlock(state.unlockedTowers,r.id);
  else if(r.type==="Base")unlock(state.unlockedBases,r.id);
  else if(r.type==="Currency"){state.coins+=r.coins||0;state.gems+=r.gems||0}
  else if(r.type==="Skin")unlockSkin(r.id);
  else state.effects.push(r.name);
}
function buyShopItem(id){
  const item=shopItems().find(i=>i.id===id), msg=$("#shopMessage");
  if(!item||item.owned)return;
  if(state[item.currency]<item.cost){msg.textContent=`Need ${item.cost} ${item.currency}.`;return}
  state[item.currency]-=item.cost;
  const [kind,value]=id.split(":");
  if(kind==="tower")unlock(state.unlockedTowers,value);
  if(kind==="base")unlock(state.unlockedBases,value);
  if(kind==="skin")unlockSkin(value);
  if(kind==="crate"&&value==="basic")state.crates++;
  if(kind==="crate"&&value==="elite"){state.crates+=3;const bonus=skinCatalog.filter(s=>!state.ownedSkins.includes(s.id))[0];if(bonus)unlockSkin(bonus.id)}
  if(kind==="life")state.extraLives++;
  if(kind==="pass")state.seasonPass=true;
  if(kind==="upgrade"&&state.upgrades[value]<5)state.upgrades[value]++;
  msg.textContent=`Purchased ${item.name}.`;
  save();
}
function unlockSkin(id){
  const skin=skinById(id);
  unlock(state.ownedSkins,skin.id);
  if(!state.skins.includes(skin.name))state.skins.push(skin.name);
}
function showInventoryMenu(ev,towerId){
  ev.preventDefault();
  const menu=$("#contextMenu"), t=towers.find(x=>x.id===towerId);
  menu.innerHTML=`<button data-add-skin="${towerId}">Add Skin</button><small>${t.name}</small>`;
  menu.style.left=ev.clientX+"px";menu.style.top=ev.clientY+"px";menu.classList.remove("hidden");
  $("[data-add-skin]").onclick=()=>{cycleTowerSkin(towerId);menu.classList.add("hidden")};
}
function cycleTowerSkin(towerId){
  const ids=state.ownedSkins.length?state.ownedSkins:["default"], current=state.towerSkins[towerId]||"default";
  const next=ids[(ids.indexOf(current)+1+ids.length)%ids.length];
  state.towerSkins[towerId]=next;
  save();
  const t=towers.find(x=>x.id===towerId), s=skinById(next);
  showModal("Skin Equipped",`${t.name}<br>${s.name}`);
}
function skinById(id){return skinCatalog.find(s=>s.id===id)||skinCatalog[0]}
function skinTone(s){return `${s.colors[0]} / ${s.colors[1]} ${s.pattern}`}
function towerShopCost(t){return Math.round(t.cost*({Common:4,Rare:5,Epic:6,Legendary:7,Mythic:8})[t.rarity])}
function baseShopCost(b){return ({Common:450,Rare:950,Epic:1800,Legendary:3200,Mythic:5200})[b.rarity]||900}
function skinShopCost(s){return ({Common:300,Rare:700,Epic:1350,Legendary:2400,Mythic:4200})[s.rarity]}
function upgradeCost(k){return state.upgrades[k]>=5?0:Math.round(850*Math.pow(1.65,state.upgrades[k]))}
function buildCost(n){return Math.max(1,Math.round(n*(1-state.upgrades.discount*.04)))}
function upgradeBuildCost(t){return buildCost(Math.round(t.cost*(.65+t.level*.55)))}
function upgradeRarity(r){
  const order=["Common","Rare","Epic","Legendary","Mythic"], i=order.indexOf(r);
  return order[Math.min(order.length-1,i+1)];
}
function daily(){if(sameDay(state.lastDaily,Date.now()))return;state.lastDaily=Date.now();state.coins+=250;state.gems+=5;state.crates+=state.seasonPass?2:1;save();showModal("Daily Reward",`250 coins<br>5 gems<br>${state.seasonPass?2:1} crate${state.seasonPass?"s":""}`)}
function redeemPromo(){
  const input=$("#promoInput"), msg=$("#promoMessage"), code=(input.value||"").trim().toUpperCase().replace(/\s+/g,"");
  if(!code){msg.textContent="Enter a code first.";return}
  const promo=promoCodes[code];
  if(!promo){msg.textContent="Invalid code.";return}
  if(state.redeemedCodes.includes(code)){msg.textContent="That code was already redeemed.";return}
  const reward=promo.apply(state);state.redeemedCodes.push(code);checkAchievements();save();
  input.value="";msg.textContent=`Redeemed ${code}: ${reward}.`;
  showModal("Code Redeemed",`${code}<br>${reward}`);
}
function activateDevMode(){
  state.devMode=true;state.coins=999999999;state.gems=999999;state.crates=99;state.endless=true;
  towers.forEach(t=>unlock(state.unlockedTowers,t.id));bases.forEach(b=>unlock(state.unlockedBases,b.id));
  skinCatalog.forEach(s=>unlockSkin(s.id));state.extraLives=99;state.seasonPass=true;state.upgrades={startingCash:5,damage:5,discount:5};
  save();showModal("Testing Dev Mode","Infinite coins are enabled. Match health is protected while dev mode is active.");
}
function unlock(list,id){if(!list.includes(id))list.push(id)}
function sameDay(a,b){return new Date(a).toDateString()===new Date(b).toDateString()}
function showModal(t,b){$("#modalTitle").textContent=t;$("#modalBody").innerHTML=b;$("#modal").classList.remove("hidden")}
function rarityClass(r){return r.toLowerCase().replace(" ","")}
function color(r){return getComputedStyle(document.documentElement).getPropertyValue("--"+rarityClass(r)).trim()}
function label(k){return k.replace(/[A-Z]/g,m=>" "+m.toLowerCase()).replace(/^./,m=>m.toUpperCase())}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function progress(e){return e.i*10000+e.x+e.y}
function remove(a,x){const i=a.indexOf(x);if(i>=0)a.splice(i,1)}

$("#beginMatch").onclick=startMatch;$("#pauseBtn").onclick=()=>game.paused=!game.paused;$("#speedBtn").onclick=()=>{game.speed=game.speed===1?2:game.speed===2?3:1;$("#speedBtn").textContent=game.speed+"x"};$("#openCrate").onclick=openCrate;$("#dailyBtn").onclick=daily;$("#redeemCode").onclick=redeemPromo;$("#promoInput").onkeydown=e=>{if(e.key==="Enter")redeemPromo()};$("#modalClose").onclick=()=>$("#modal").classList.add("hidden");
$("#volume").oninput=e=>{state.settings.volume=+e.target.value;save()};$("#reducedFx").onchange=e=>{state.settings.reducedFx=e.target.checked;save()};$("#resetSave").onclick=()=>{if(confirm("Reset all progression?"))hardReset()};
$("#volume").value=state.settings.volume;$("#reducedFx").checked=state.settings.reducedFx;
let secretBuffer="";
document.addEventListener("keydown",e=>{if(e.target&&["INPUT","TEXTAREA"].includes(e.target.tagName))return;secretBuffer=(secretBuffer+e.key.toLowerCase()).slice(-12);if(secretBuffer.endsWith("mustardmango"))activateDevMode()});
document.addEventListener("click",e=>{if(!e.target.closest("#contextMenu"))$("#contextMenu").classList.add("hidden")});
renderNav();renderAll();
