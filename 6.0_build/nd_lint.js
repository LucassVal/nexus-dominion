
// ═══════════════════════════════════════════════
//  NEXUS DOMINION v5 — Living World Complete
// ═══════════════════════════════════════════════

// ─── INFRASTRUCTURE: AUDIO ───
const AE={c:null,i(){this.c=new(window.AudioContext||window.webkitAudioContext)()},
  p(f,t='sine',d=0.1,v=0.05){if(!this.c)return;const o=this.c.createOscillator(),g=this.c.createGain();o.type=t;o.frequency.value=f;g.gain.setValueAtTime(v,this.c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,this.c.currentTime+d);o.connect(g);g.connect(this.c.destination);o.start();o.stop(this.c.currentTime+d)},
  tk(){this.p(800,'square',0.03,0.02)},al(){this.p(1200,'sine',0.1,0.03)},ok(){this.p(523,'sine',0.08);setTimeout(()=>this.p(659,'sine',0.08),70);setTimeout(()=>this.p(784,'sine',0.1),140)},
  er(){this.p(150,'sawtooth',0.12,0.03)},cn(){this.p(900,'triangle',0.05,0.03)},ht(){this.p(200,'square',0.08,0.04)},am(){if(!this.c)return;const o=this.c.createOscillator(),g=this.c.createGain();o.type='sine';o.frequency.value=55;g.gain.value=0.01;o.connect(g);g.connect(this.c.destination);o.start()}};

// ─── DOMAIN: CONSTANTS ───
const COLS=60,ROWS=45,TILE=40;
const T={WATER:0,PLAINS:1,FOREST:2,MOUNTAIN:3,DESERT:4};
const TC=['#1a3a5c','#3a6b35','#1e4a1e','#4a4a4a','#c4a64a'];
const TN=['Water','Plains','Forest','Mountain','Desert'];
const TS={0:0,1:1,2:0.7,3:0.4,4:0.8};
const CN=[{n:'Aurelia',c:'rgba(42,138,90,1)',ct:['Goldcrest','Silverport','Ironforge','Copperfield']},{n:'Valdoria',c:'rgba(90,58,138,1)',ct:['Darkwater','Starhaven','Mistvale','Thornwall']},{n:'Meridian',c:'rgba(58,106,138,1)',ct:['Sunreach','Moontide','Skybreak','Oceanview']},{n:'Korvath',c:'rgba(138,58,58,1)',ct:['Ironpeak','Ashford','Blackmoor','Redcliff']},{n:'Sylvaris',c:'rgba(58,138,58,1)',ct:['Greenhaven','Riverbend','Forestedge','Dewspring']},{n:'Zenobia',c:'rgba(138,138,58,1)',ct:['Dunemarket','Brightstone','Sandport','Crystalpeak']}];

// ─── DOMAIN: 110+ GOODS CATALOG ───
const GD=[
  // FOOD (15)
  {id:'grain',n:'Grain',p:8,w:1,cat:'food',per:20},{id:'rice',n:'Rice',p:10,w:1,cat:'food',per:25},{id:'bread',n:'Bread',p:5,w:1,cat:'food',per:7},{id:'cheese',n:'Cheese',p:15,w:1,cat:'food',per:15},{id:'meat',n:'Meat',p:20,w:2,cat:'food',per:5},{id:'fish',n:'Fish',p:12,w:1,cat:'food',per:3},{id:'fruits',n:'Fruits',p:14,w:1,cat:'food',per:8},{id:'vegetables',n:'Vegetables',p:9,w:1,cat:'food',per:10},{id:'honey',n:'Honey',p:22,w:1,cat:'food',per:60},{id:'salt',n:'Salt',p:8,w:1,cat:'food'},{id:'sugar',n:'Sugar',p:18,w:1,cat:'food'},{id:'spices',n:'Spices',p:45,w:1,cat:'food'},{id:'wine',n:'Wine',p:35,w:2,cat:'food'},{id:'ale',n:'Ale',p:12,w:2,cat:'food',per:30},{id:'tea',n:'Tea',p:28,w:1,cat:'food'},
  // MATERIALS (12)
  {id:'wood',n:'Timber',p:12,w:3,cat:'material'},{id:'stone',n:'Stone',p:8,w:4,cat:'material'},{id:'clay',n:'Clay',p:5,w:3,cat:'material'},{id:'sand',n:'Sand',p:3,w:2,cat:'material'},{id:'iron_ore',n:'Iron Ore',p:18,w:3,cat:'material'},{id:'copper_ore',n:'Copper Ore',p:15,w:2,cat:'material'},{id:'coal',n:'Coal',p:10,w:3,cat:'material'},{id:'oil',n:'Oil',p:35,w:2,cat:'material'},{id:'cotton',n:'Cotton',p:14,w:1,cat:'material'},{id:'wool',n:'Wool',p:12,w:1,cat:'material'},{id:'leather',n:'Leather',p:20,w:2,cat:'material'},{id:'silk',n:'Silk',p:50,w:1,cat:'material'},
  // METALS (10)
  {id:'iron',n:'Iron Ingot',p:30,w:3,cat:'metal'},{id:'steel',n:'Steel',p:55,w:3,cat:'metal'},{id:'copper',n:'Copper',p:22,w:2,cat:'metal'},{id:'bronze',n:'Bronze',p:40,w:3,cat:'metal'},{id:'silver',n:'Silver',p:80,w:1,cat:'metal'},{id:'gold_ingot',n:'Gold Ingot',p:200,w:1,cat:'metal'},{id:'platinum',n:'Platinum',p:350,w:1,cat:'metal'},{id:'mithril',n:'Mithril',p:800,w:2,cat:'metal',r:'epic'},{id:'adamantite',n:'Adamantite',p:1500,w:3,cat:'metal',r:'legendary'},{id:'orichalcum',n:'Orichalcum',p:3000,w:2,cat:'metal',r:'legendary'},
  // WEAPONS (12)
  {id:'dagger',n:'Dagger',atk:4,p:30,w:1,cat:'weapon',dur:50,eq:'weapon'},{id:'sword',n:'Sword',atk:7,p:80,w:3,cat:'weapon',dur:80,eq:'weapon'},{id:'longsword',n:'Longsword',atk:10,p:180,w:4,cat:'weapon',dur:100,eq:'weapon'},{id:'axe',n:'Battle Axe',atk:12,p:200,w:5,cat:'weapon',dur:90,eq:'weapon'},{id:'mace',n:'War Mace',atk:9,p:120,w:4,cat:'weapon',dur:110,eq:'weapon'},{id:'spear',n:'Spear',atk:8,p:100,w:3,cat:'weapon',dur:70,eq:'weapon'},{id:'halberd',n:'Halberd',atk:13,p:280,w:6,cat:'weapon',dur:95,eq:'weapon'},{id:'bow',n:'Longbow',atk:7,p:90,w:2,cat:'weapon',dur:60,eq:'weapon'},{id:'crossbow',n:'Crossbow',atk:11,p:220,w:3,cat:'weapon',dur:75,eq:'weapon'},{id:'staff',n:'Mage Staff',atk:6,p:150,w:2,cat:'weapon',dur:50,eq:'weapon'},{id:'wand',n:'Magic Wand',atk:5,p:250,w:1,cat:'weapon',dur:40,eq:'weapon'},{id:'enchanted_blade',n:'Enchanted Blade',atk:16,p:600,w:3,cat:'weapon',dur:120,eq:'weapon',r:'epic'},
  // ARMOR (10)
  {id:'leather_armor',n:'Leather Armor',def:3,p:60,w:4,cat:'armor',dur:60,eq:'armor'},{id:'chainmail',n:'Chainmail',def:7,p:200,w:8,cat:'armor',dur:100,eq:'armor'},{id:'plate',n:'Plate Armor',def:12,p:500,w:12,cat:'armor',dur:140,eq:'armor'},{id:'shield',n:'Shield',def:5,p:120,w:6,cat:'armor',dur:80,eq:'armor'},{id:'helmet',n:'Helmet',def:3,p:80,w:2,cat:'armor',dur:70,eq:'armor'},{id:'boots',n:'Iron Boots',def:2,p:70,w:3,cat:'armor',dur:65,eq:'armor'},{id:'gauntlets',n:'Gauntlets',def:3,p:100,w:2,cat:'armor',dur:75,eq:'armor'},{id:'magic_robe',n:'Magic Robe',def:8,p:400,w:2,cat:'armor',dur:50,eq:'armor',r:'rare'},{id:'dragon_scale',n:'Dragon Scale',def:16,p:2000,w:8,cat:'armor',dur:200,eq:'armor',r:'epic'},{id:'aegis',n:'Aegis Shield',def:10,p:1500,w:5,cat:'armor',dur:180,eq:'armor',r:'legendary'},
  // MAGIC (12)
  {id:'mana_potion',n:'Mana Potion',p:30,w:1,cat:'magic',use:'restore_mp',val:50},{id:'health_potion',n:'Health Potion',p:40,w:1,cat:'magic',use:'restore_hp',val:50},{id:'scroll_fire',n:'Fire Scroll',p:80,w:1,cat:'magic',use:'fireball'},{id:'scroll_ice',n:'Ice Scroll',p:80,w:1,cat:'magic',use:'icestorm'},{id:'ring_power',n:'Ring of Power',p:300,w:1,cat:'magic',eq:'accessory',atk:5},{id:'amulet_protection',n:'Amulet of Protection',p:350,w:1,cat:'magic',eq:'accessory',def:5},{id:'enchanted_gem',n:'Enchanted Gem',p:250,w:1,cat:'magic'},{id:'phoenix_feather',n:'Phoenix Feather',p:500,w:1,cat:'magic',use:'revive'},{id:'void_crystal',n:'Void Crystal',p:800,w:1,cat:'magic',eq:'accessory',atk:15,hp:-10},{id:'star_dust',n:'Star Dust',p:600,w:1,cat:'magic'},{id:'soul_essence',n:'Soul Essence',p:1000,w:1,cat:'magic',use:'perm_hp',val:3},{id:'dragon_heart',n:'Dragon Heart',p:2500,w:2,cat:'magic',use:'max_hp',val:20},
  // ALCHEMY (10)
  {id:'herb',n:'Medicinal Herb',p:10,w:1,cat:'alchemy'},{id:'mushroom',n:'Glowing Mushroom',p:18,w:1,cat:'alchemy'},{id:'mandrake',n:'Mandrake Root',p:30,w:1,cat:'alchemy'},{id:'wolfsbane',n:'Wolfsbane',p:25,w:1,cat:'alchemy'},{id:'nightshade',n:'Nightshade',p:40,w:1,cat:'alchemy'},{id:'quicksilver',n:'Quicksilver',p:55,w:1,cat:'alchemy'},{id:'sulfur',n:'Sulfur',p:12,w:2,cat:'alchemy'},{id:'phosphorus',n:'Phosphorus',p:20,w:1,cat:'alchemy'},{id:'philosophers_stone',n:"Philosopher's Stone",p:5000,w:1,cat:'alchemy',r:'legendary'},{id:'elixir_life',n:'Elixir of Life',p:3000,w:1,cat:'alchemy',r:'legendary'},
  // TOOLS (8)
  {id:'pickaxe',n:'Pickaxe',p:25,w:4,cat:'tool'},{id:'axe_tool',n:'Wood Axe',p:20,w:3,cat:'tool'},{id:'hammer',n:'Hammer',p:15,w:3,cat:'tool'},{id:'saw',n:'Saw',p:18,w:2,cat:'tool'},{id:'rope',n:'Rope',p:8,w:2,cat:'tool'},{id:'lantern',n:'Lantern',p:30,w:1,cat:'tool'},{id:'compass',n:'Compass',p:50,w:1,cat:'tool'},{id:'lockpick',n:'Lockpick Set',p:45,w:1,cat:'tool'},
  // LUXURY (10)
  {id:'jewelry',n:'Fine Jewelry',p:150,w:1,cat:'luxury'},{id:'perfume',n:'Perfume',p:80,w:1,cat:'luxury'},{id:'ivory',n:'Ivory',p:200,w:2,cat:'luxury'},{id:'silk_robe',n:'Silk Robe',p:300,w:1,cat:'luxury'},{id:'golden_cup',n:'Golden Cup',p:400,w:1,cat:'luxury'},{id:'diamond',n:'Diamond',p:800,w:1,cat:'luxury'},{id:'ruby',n:'Ruby',p:600,w:1,cat:'luxury'},{id:'emerald',n:'Emerald',p:550,w:1,cat:'luxury'},{id:'sapphire',n:'Sapphire',p:500,w:1,cat:'luxury'},{id:'crown',n:'Royal Crown',p:2000,w:2,cat:'luxury',r:'legendary'},
  // BOOKS (8)
  {id:'spellbook_fire',n:'Fire Spellbook',p:200,w:2,cat:'book'},{id:'spellbook_ice',n:'Ice Spellbook',p:200,w:2,cat:'book'},{id:'tome_knowledge',n:'Tome of Knowledge',p:350,w:3,cat:'book',use:'xp',val:500},{id:'map_treasure',n:'Treasure Map',p:500,w:1,cat:'book'},{id:'bestiary',n:'Bestiary',p:150,w:2,cat:'book'},{id:'history_book',n:'History Book',p:100,w:2,cat:'book'},{id:'trade_ledger',n:'Trade Ledger',p:120,w:2,cat:'book'},{id:'forbidden_tome',n:'Forbidden Tome',p:1000,w:3,cat:'book',r:'epic'},
  // EXOTIC (8)
  {id:'dragon_egg',n:'Dragon Egg',p:5000,w:5,cat:'exotic',r:'legendary'},{id:'kraken_ink',n:'Kraken Ink',p:800,w:1,cat:'exotic',r:'epic'},{id:'phoenix_ash',n:'Phoenix Ash',p:2000,w:1,cat:'exotic',r:'epic'},{id:'basilisk_scale',n:'Basilisk Scale',p:1200,w:3,cat:'exotic'},{id:'unicorn_horn',n:'Unicorn Horn',p:1500,w:2,cat:'exotic',r:'epic'},{id:'fairy_dust',n:'Fairy Dust',p:400,w:1,cat:'exotic'},{id:'shadow_essence',n:'Shadow Essence',p:900,w:1,cat:'exotic',r:'epic'},{id:'time_sand',n:'Time Sand',p:3000,w:1,cat:'exotic',r:'legendary'},
  // TRANSPORT (5)
  {id:'horse',n:'Horse',p:300,w:0,cat:'transport',use:'speed',val:1.5},{id:'camel',n:'Camel',p:250,w:0,cat:'transport',use:'speed',val:1.3},{id:'wagon',n:'Wagon',p:500,w:0,cat:'transport',use:'cargo',val:100},{id:'ship_ticket',n:'Ship Ticket',p:100,w:1,cat:'transport',use:'fast_travel',tt:'ship'},{id:'train_ticket',n:'Train Ticket',p:75,w:1,cat:'transport',use:'fast_travel',tt:'train'}
];
// Index goods by id for fast lookup
const GI={};GD.forEach(g=>GI[g.id]=g);

// ─── DOMAIN: ENEMIES ───
const EN={bandit:{n:'Bandit',hp:40,atk:8,def:3,lt:[30,80],xp:20},raider:{n:'Raider',hp:70,atk:12,def:6,lt:[100,200],xp:40},wolf:{n:'Wolf Pack',hp:50,atk:10,def:2,lt:[15,40],xp:15},merc:{n:'Rogue Merc',hp:90,atk:14,def:8,lt:[200,400],xp:60},soldier:{n:'Army Soldier',hp:100,atk:16,def:10,lt:[200,500],xp:80},boss:{n:'Warlord',hp:200,atk:22,def:15,lt:[500,1500],xp:150}};

// ─── HELPERS ───
// Deterministic PRNG (Mulberry32) - same seed = same world
let RNG;function seedRNG(s){let st=s|0;RNG={next(){st|=0;st=st+0x6D2B79F5|0;let t=Math.imul(st^st>>>15,1|st);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296},nextInt(a,b){return Math.floor(this.next()*(b-a+1))+a},pick(a){return a[Math.floor(this.next()*a.length)]}}}
function ri(a,b){return RNG.nextInt(a,b)}function rf(a,b){return RNG.next()*(b-a)+a}function pk(a){return RNG.pick(a)}
function fmt(n){if(Math.abs(n)>=1e9)return(n/1e9).toFixed(1)+'B';if(Math.abs(n)>=1e6)return(n/1e6).toFixed(1)+'M';if(Math.abs(n)>=1e3)return(n/1e3).toFixed(1)+'K';return Math.floor(n).toLocaleString()}
function dt(a,b,c,d){return Math.hypot((c||0)-(a||0),(d||0)-(b||0))}
function cl(v,l,h){return Math.max(l,Math.min(h,v))}

// ─── DOMAIN: TERRAIN ───
let terrain=[],terEle=[],tCache=null,trees=[],rocks=[];
function genTerrain(seed){
  seedRNG(seed||42);
  const gs=5,gc=Math.ceil(COLS/gs)+1,gr=Math.ceil(ROWS/gs)+1,grid=[];
  function r(){return RNG.next()}
  for(let y=0;y<gr;y++){grid[y]=[];for(let x=0;x<gc;x++)grid[y][x]=r()}
  function ns(tx,ty){const gx=tx/gs,gy=ty/gs,ix=Math.floor(gx),iy=Math.floor(gy),fx=gx-ix,fy=gy-iy;function ci(a,b,t){const f=(1-Math.cos(t*Math.PI))*0.5;return a*(1-f)+b*f}const n00=grid[cl(iy,0,gr-1)][cl(ix,0,gc-1)],n10=grid[cl(iy,0,gr-1)][cl(ix+1,0,gc-1)],n01=grid[cl(iy+1,0,gr-1)][cl(ix,0,gc-1)],n11=grid[cl(iy+1,0,gr-1)][cl(ix+1,0,gc-1)];return ci(ci(n00,n10,fx),ci(n01,n11,fx),fy)}
  terrain=[];terEle=[];for(let y=0;y<ROWS;y++){terrain[y]=[];terEle[y]=[];for(let x=0;x<COLS;x++){const lb=Math.abs(y-ROWS/2)/(ROWS/2)*0.3,e=ns(x,y)-lb+(x<2||x>COLS-3||y<2||y>ROWS-3?0.3:0);terEle[y][x]=e;if(e<0.28)terrain[y][x]=T.WATER;else if(e<0.45)terrain[y][x]=T.DESERT;else if(e<0.62)terrain[y][x]=T.PLAINS;else if(e<0.78)terrain[y][x]=T.FOREST;else terrain[y][x]=T.MOUNTAIN}}
  // Generate tree positions (forest tiles) and rocks (mountain/desert tiles)
  trees=[];rocks=[];
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    if(terrain[y][x]===T.FOREST&&RNG.next()<0.35)trees.push({x:x*TILE+RNG.next()*TILE,y:y*TILE+RNG.next()*TILE,s:2+RNG.next()*3});
    if((terrain[y][x]===T.MOUNTAIN||terrain[y][x]===T.DESERT)&&RNG.next()<0.2)rocks.push({x:x*TILE+RNG.next()*TILE,y:y*TILE+RNG.next()*TILE,s:1+RNG.next()*3});
  }
  buildTCache();
}
function buildTCache(){tCache=document.createElement('canvas');tCache.width=COLS*TILE;tCache.height=ROWS*TILE;const tc=tCache.getContext('2d');for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){tc.fillStyle=TC[terrain[y][x]];tc.fillRect(x*TILE,y*TILE,TILE,TILE);tc.strokeStyle='rgba(0,0,0,0.06)';tc.lineWidth=0.5;tc.strokeRect(x*TILE,y*TILE,TILE,TILE)}}
function getTile(x,y){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);if(tx<0||tx>=COLS||ty<0||ty>=ROWS)return T.WATER;return terrain[ty][tx]}

// ─── DOMAIN: WORLD ───
let G;
function genWorld(){
  const cities=[],countries=[],roads=[];
  let cid=0;
  CN.forEach((cd,ci)=>{
    let cx,cy,att=0;do{cx=ri(4,COLS-5);cy=ri(4,ROWS-5);att++}while((terrain[cy][cx]===T.WATER||terrain[cy][cx]===T.MOUNTAIN)&&att<50);
    const cc=[];
    cd.ct.forEach(cn=>{
      let tx,ty,at=0;do{tx=cx+ri(-5,5);ty=cy+ri(-4,4);at++}while((tx<0||tx>=COLS||ty<0||ty>=ROWS||terrain[ty][tx]===T.WATER||terrain[ty][tx]===T.MOUNTAIN)&&at<50);
      tx=cl(tx,1,COLS-2);ty=cl(ty,1,ROWS-2);
      const bldgs=[];const bn=ri(3,8);for(let bi=0;bi<bn;bi++){const a=RNG.next()*Math.PI*2,d=12+RNG.next()*20;bldgs.push({rx:Math.cos(a)*d,ry:Math.sin(a)*d,w:4+RNG.next()*8,h:6+RNG.next()*14,c:pk(['#5a4a3a','#4a4a5a','#6a5a4a','#8a7a6a'])});}
      const ct={id:cid++,name:cn,cIdx:ci,tx,ty,x:tx*TILE+TILE/2,y:ty*TILE+TILE/2,pop:50000+ri(0,950000),bldgs,gdp:5+RNG.next()*45,stab:30+RNG.next()*70,owner:null,supply:{},demand:{},prices:{},shops:{}};
      GD.forEach(g=>{ct.supply[g.id]=ri(10,100);ct.demand[g.id]=ri(10,100);ct.prices[g.id]=g.p});
      cc.push(ct);cities.push(ct);
    });
    // Roads
    for(let i=0;i<cc.length;i++)for(let j=i+1;j<cc.length;j++)roads.push({fx:cc[i].tx,fy:cc[i].ty,tx:cc[j].tx,ty:cc[j].ty});
    // Is this coastal? Check for water-adjacent tiles
    const coastal=cc.some(ct=>{for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const nx=ct.tx+dx,ny=ct.ty+dy;if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&terrain[ny][nx]===T.WATER)return true}return false});
    countries.push({name:cd.n,color:cd.c,cities:cc,cx:cx*TILE+TILE/2,cy:cy*TILE+TILE/2,gov:pk(['Democracy','Monarchy','Oligarchy','Dictatorship']),mil:20+RNG.next()*80,treasury:1e5+RNG.next()*9e5,tax:ri(10,30),rel:{},armies:[],atWar:[],pop:0,pers:pk(['aggressive','peaceful','trading','expansionist']),coastal,investments:[],bonds:[],embassies:[]});
  });
  // Init relations
  countries.forEach(co=>{countries.forEach(c2=>{if(c2!==co)co.rel[c2.name]=ri(-30,50)})});
  // Train routes: cities in same country with pop > 150K
  const trains=[];countries.forEach(co=>{const big=co.cities.filter(c=>c.pop>150000);for(let i=0;i<big.length;i++)for(let j=i+1;j<big.length;j++)trains.push({fx:big[i].tx,fy:big[i].ty,tx:big[j].tx,ty:big[j].ty,cityA:big[i].id,cityB:big[j].id,cost:Math.floor(dt(big[i].x,big[i].y,big[j].x,big[j].y)*0.02+50)})});
  // Ship routes: coastal cities, cross-country
  const ships=[];const coastalCities=cities.filter(c=>{for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const nx=c.tx+dx,ny=c.ty+dy;if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&terrain[ny][nx]===T.WATER)return true}return false});
  for(let i=0;i<coastalCities.length;i++)for(let j=i+1;j<coastalCities.length;j++)if(coastalCities[i].cIdx!==coastalCities[j].cIdx)ships.push({cityA:coastalCities[i].id,cityB:coastalCities[j].id,cost:Math.floor(dt(coastalCities[i].x,coastalCities[i].y,coastalCities[j].x,coastalCities[j].y)*0.015+75)});
  return{cities,countries,roads,trains,ships};
}

// ─── DOMAIN: GAME STATE ───
function newState(){
  return{
    player:{name:'Traveler',role:'wanderer',gold:100,x:0,y:0,hp:100,mhp:100,atk:5,def:3,lvl:1,xp:0,sp:0,
      skills:{trading:1,combat:1,leadership:1,stealth:1,diplomacy:1},
      inv:[],eq:{weapon:null,armor:null,accessory:null},
      caravan:null,units:[],rep:{},path:[],moving:false,camping:false,cturns:0,
      edef:0,vis:[],trades:0,bounty:0,joinedArmy:null,abilityCd:0,companies:[],portfolio:{},investments:[],bonds:[]},
    day:1,tick:0,seed:ri(1,99999),achs:{},news:[],logs:[],bandits:[],aiTraders:[],evts:[],weather:{type:'clear',intensity:0,startDay:0,dur:0},modal:null,cbt:null,
    comps:[],missions:[],nextEventDay:ri(8,12)
  };
}

// ─── APPLICATION: START GAME ───
function startGame(role){
  G=newState();G.player.role=role;G.seed=ri(1,99999);seedRNG(G.seed);
  genTerrain(G.seed);const w=genWorld();
  G.cities=w.cities;G.countries=w.countries;G.roads=w.roads;G.trains=w.trains;G.ships=w.ships;
  const sc=pk(G.cities);G.player.x=sc.x;G.player.y=sc.y;G.player.vis.push(sc.id);
  // Role bonuses
  switch(role){
    case'merchant':G.player.gold=500;G.player.caravan={cap:50,goods:[],guards:0};G.player.skills.trading=3;break;
    case'warrior':G.player.gold=200;G.player.mhp=115;G.player.hp=115;G.player.atk=8;G.player.skills.combat=3;G.player.eq.weapon='sword';break;
    case'mercenary':G.player.gold=300;for(let i=0;i<3;i++)G.player.units.push({n:'Unit '+pk(['Alpha','Bravo','Delta']),hp:60,atk:8,def:4});G.player.skills.leadership=3;break;
    case'ceo':G.player.gold=100000;G.player.skills.trading=2;G.player.skills.leadership=2;foundCompany();break;
    case'wanderer':G.player.gold=100;G.player.skills.stealth=2;break;
  }
  // Init AI traders
  for(let i=0;i<6;i++){const sc2=pk(G.cities);G.aiTraders.push({id:i,n:'Trader '+pk(['Alaric','Borin','Cedric','Doran','Eldon','Fenris']),x:sc2.x,y:sc2.y,gold:500+ri(0,1000),goods:[],tx:sc2.tx,ty:sc2.ty})}
  // Init bandits
  for(let i=0;i<10;i++){let bx,by;do{bx=ri(2,COLS-3);by=ri(2,ROWS-3)}while(terrain[by][bx]===T.WATER);G.bandits.push({id:i,n:pk(['Mug','Scar','Blade','Fang','Rust','Crow','Ash','Dirk','Thorn','Vex']),hp:40,atk:8,def:3,x:bx*TILE+TILE/2,y:by*TILE+TILE/2,tx:bx,ty:by,type:'bandit'})}
  // Init country armies
  G.countries.forEach(co=>{for(let i=0;i<ri(1,3);i++){const ct=pk(co.cities);co.armies.push({id:`a_${co.name}_${i}`,c:co.name,sz:ri(500,3000),x:ct.x,y:ct.y,tx:ct.tx,ty:ct.ty,ord:'patrol'})}});
  // Init public companies
  for(let i=0;i<8;i++){const n=pk(['Apex','Nova','Quantum','Atlas','Titan','Vertex','Omega','Sigma'])+' '+pk(['Dynamics','Holdings','Corp','Global','Systems','Enterprises']);const bp=10+RNG.next()*90;G.comps.push({id:i,name:n,cash:50000+RNG.next()*500000,ct:5+RNG.next()*95,emp:50+ri(0,500),rev:5000+ri(0,20000),stock:bp,hist:Array(30).fill(bp),shares:10000+ri(0,90000),avail:0,owner:'public'});}
  G.comps.forEach(c=>{c.avail=Math.floor(c.shares*0.4)});
  // Generate initial missions
  genMissions();
  document.getElementById('rm').style.display='none';
  G.logs=[{t:1,m:'Your journey begins. Role: '+role.toUpperCase()+'.'}];
  AE.ok();notify('Living world generated!','inf');updateUI();saveGame();
}

// ─── DOMAIN: MISSIONS ───
function genMissions(){
  const MT=[{n:'Cargo',ic:'📦',rw:800,rk:1},{n:'Bounty',ic:'🎯',rw:2000,rk:3},{n:'Spy',ic:'🕵️',rw:3000,rk:4},{n:'Escort',ic:'🛡️',rw:1500,rk:2},{n:'Sabotage',ic:'💣',rw:4000,rk:5}];
  G.missions=G.missions.filter(m=>m.ok);for(let i=0;i<4;i++){const t=pk(MT),gv=pk(G.countries),tc=pk(G.cities);G.missions.push({id:`m${G.tick}_${i}`,t,gv:gv.name,tg:tc.name,rw:t.rw+ri(-200,500),rk:t.rk,dl:G.day+ri(5,15),ok:false})}
}

// ─── DOMAIN: COMPANY ───
function foundCompany(){
  const p=G.player;if(p.gold<20000){notify('Need $20,000','er');return}
  p.gold-=20000;const n=pk(['Apex','Nova','Quantum','Atlas'])+' '+pk(['Dynamics','Holdings','Corp','Global']);
  const sc=pk(G.cities);
  p.companies.push({name:n,sector:pk(['finance','tech','military','logistics','general']),cities:[sc.id],emp:20,rev:0,stock:25,hist:Array(30).fill(25),shares:5000,avail:2000,type:'private',ipo:false});
  AE.ok();addLog('Founded '+n);updateUI();
}
function ipoCompany(idx){
  const p=G.player;const co=p.companies[idx];if(!co||co.ipo||p.gold<50000){notify('Need $50K or already public','er');return}
  p.gold-=50000;co.ipo=true;G.comps.push({id:G.comps.length,name:co.name,cash:0,ct:co.shares,emp:co.emp,rev:co.rev,stock:co.stock,hist:co.hist,shares:co.shares,avail:Math.floor(co.shares*0.3),owner:'player'});
  p.gold+=co.stock*co.shares*0.5;AE.ok();addLog(co.name+' went PUBLIC! IPO raised cash.');updateUI();
}

// ─── DOMAIN: DIPLOMACY ───
function dipAction(countryName,action){
  const p=G.player;const co=G.countries.find(c=>c.name===countryName);if(!co)return;
  switch(action){
    case'gift':{if(p.gold<2000)return;p.gold-=2000;co.rel['player']=(co.rel['player']||0)+8;addLog('Sent gift to '+co.name);break}
    case'embassy':{if(p.gold<5000)return;p.gold-=5000;co.embassies.push('player');co.rel['player']=(co.rel['player']||0)+15;addLog('Established embassy in '+co.name);break}
    case'alliance':{const rel=co.rel['player']||0;if(rel<40){notify('Need 40+ relations','er');return}co.rel['player']=Math.min(100,rel+20);addLog('Alliance with '+co.name+'!');break}
    case'trade_agree':{const rel=co.rel['player']||0;if(rel<20){notify('Need 20+ relations','er');return}co.rel['player']=Math.min(100,rel+10);addLog('Trade agreement with '+co.name);break}
    case'sanction':{if(p.gold<3000)return;p.gold-=3000;co.rel['player']=(co.rel['player']||0)-20;addLog('Sanctions imposed on '+co.name);break}
  }
  AE.al();updateUI();openModal('diplomacy',true);
}
function investInCountry(countryName,amount){
  const p=G.player;const co=G.countries.find(c=>c.name===countryName);if(!co||p.gold<amount)return;
  p.gold-=amount;co.investments.push({player:true,amount,day:G.day,roi:ri(5,20)});
  addLog('Invested $'+fmt(amount)+' in '+co.name);AE.cn();updateUI();
}

// ─── DOMAIN: STOCK ───
function buyStock(cid,shares){
  const co=G.comps.find(c=>c.id===cid);const p=G.player;if(!co||shares>co.avail)return;
  const cost=shares*co.stock;if(p.gold<cost)return;
  p.gold-=cost;co.avail-=shares;
  if(!p.portfolio[cid])p.portfolio[cid]={shares:0,avg:0};
  const pt=p.portfolio[cid];pt.avg=(pt.shares*pt.avg+cost)/(pt.shares+shares);pt.shares+=shares;
  AE.cn();addLog('Bought '+shares+' '+co.name+' @ $'+co.stock.toFixed(1));
}
function sellStock(cid,shares){
  const co=G.comps.find(c=>c.id===cid);const p=G.player;const pt=p.portfolio[cid];if(!pt||pt.shares<shares)return;
  p.gold+=shares*co.stock;pt.shares-=shares;co.avail+=shares;
  if(pt.shares<=0)delete p.portfolio[cid];AE.cn();
}

// ─── DOMAIN: COMBAT ───
function startCombat(enemy){G.cbt={enemy,pt:true,log:[],fled:false};AE.er();openModal('combat')}
// ─── COMBAT ABILITIES ───
const AB={merchant:{n:'Silver Tongue',ic:'💬',desc:'-30% enemy ATK 2 turns',cd:4,fn(){if(!G.cbt)return;G.cbt.enemy.atkDebuff=2;G.cbt.log.unshift('Silver Tongue! Enemy ATK reduced');G.player.abilityCd=4}},
  warrior:{n:'Berserker Rage',ic:'💢',desc:'+50% damage next hit',cd:3,fn(){if(!G.cbt)return;G.cbt.dmgBoost=1.5;G.cbt.log.unshift('Berserker Rage!');G.player.abilityCd=3}},
  mercenary:{n:'Tactical Strike',ic:'🎯',desc:'Ignore 50% enemy DEF',cd:3,fn(){if(!G.cbt)return;G.cbt.ignoreDef=0.5;G.cbt.log.unshift('Tactical Strike!');G.player.abilityCd=3}},
  ceo:{n:'Hostile Takeover',ic:'💰',desc:'Steal enemy gold',cd:5,fn(){if(!G.cbt)return;const gd=Math.floor(G.cbt.enemy.lt?G.cbt.enemy.lt[0]*0.2:20);G.player.gold+=gd;G.cbt.log.unshift('Takeover! Stole $'+gd);G.player.abilityCd=5}},
  wanderer:{n:'Adaptive Strike',ic:'🌀',desc:'Bonus from best skill',cd:3,fn(){if(!G.cbt)return;const ms=Math.max(...Object.values(G.player.skills));G.cbt.adaptBonus=(ms-1)*0.15;G.cbt.log.unshift('Adaptive! +'+(G.cbt.adaptBonus*100).toFixed(0)+'%');G.player.abilityCd=3}}};
function useAbility(){if(!G.cbt||!G.cbt.pt||G.player.abilityCd>0)return;const ab=AB[G.player.role];if(!ab)return;ab.fn();G.cbt.pt=false;
  const c=G.cbt,p=G.player;const arm=GI[p.eq.armor];const pdef=(p.def+(arm?arm.def||0:0))*(1+p.skills.combat*0.03);
  const edmg=Math.max(1,Math.floor((c.enemy.atk-(c.enemy.atkDebuff?c.enemy.atk*0.3:0))-pdef+ri(-1,2)));p.hp-=edmg;c.log.unshift(c.enemy.n+' counters for '+edmg);
  if(c.enemy.atkDebuff){c.enemy.atkDebuff--;if(c.enemy.atkDebuff<=0)delete c.enemy.atkDebuff}
  c.pt=true;if(p.hp<=0){defeat();return}updateUI();openModal('combat',true)}
function getAbilityButtons(){const ab=AB[G.player.role];if(!ab)return'';const onCd=G.player.abilityCd>0;return`<button class="btn btn4 bs" onclick="useAbility()" ${onCd?'disabled':''}>${ab.ic} ${ab.n}${onCd?' ('+G.player.abilityCd+')':''}</button><span style="font-size:8px;color:#5a6a80">${ab.desc}</span>`}
function cbtAtk(){
  if(!G.cbt||!G.cbt.pt)return;const c=G.cbt,p=G.player;
  const wep=GI[p.eq.weapon],arm=GI[p.eq.armor],acc=GI[p.eq.accessory];
  const patk=(p.atk+(wep?wep.atk||0:0)+(acc?acc.atk||0:0))*(1+p.skills.combat*0.04);
  const pdef=(p.def+(arm?arm.def||0:0)+(acc?acc.def||0:0))*(1+p.skills.combat*0.03);
  const crit=RNG.next()<0.08+p.skills.combat*0.02;
  let dmg=Math.max(1,Math.floor(patk-c.enemy.def*(c.ignoreDef?1-c.ignoreDef:1)+ri(-2,3)));if(c.dmgBoost){dmg=Math.floor(dmg*c.dmgBoost);delete c.dmgBoost}if(c.adaptBonus){dmg=Math.floor(dmg*(1+c.adaptBonus));delete c.adaptBonus}if(crit)dmg=Math.floor(dmg*1.8);c.ignoreDef=null;
  c.enemy.hp-=dmg;c.log.unshift((crit?'CRIT! ':'')+'You hit for '+dmg);AE.ht();
  // Durability decay (tracked per-player, not on shared GD objects)
  if(wep&&wep.dur){p.eq._wDur=(p.eq._wDur||wep.dur)-1;if(p.eq._wDur<=0){p.eq.weapon=null;p.eq._wDur=0;addLog('⚠ Weapon broke!')}}
  if(c.enemy.hp<=0){victory();return}
  c.pt=false;
  const edmg=Math.max(1,Math.floor(c.enemy.atk-pdef+ri(-1,2)));p.hp-=edmg;c.log.unshift(c.enemy.n+' hits for '+edmg);
  // Armor decay
  if(arm&&arm.dur){p.eq._aDur=(p.eq._aDur||arm.dur)-1;if(p.eq._aDur<=0){p.eq.armor=null;p.eq._aDur=0;addLog('⚠ Armor broke!')}}
  if(p.hp<=0){defeat();return}
  c.pt=true;updateUI();openModal('combat',true);
}
function cbtDef(){
  if(!G.cbt||!G.cbt.pt)return;const c=G.cbt,p=G.player;
  const arm=GI[p.eq.armor];const pdef=((p.def+(arm?arm.def||0:0))*1.6)*(1+p.skills.combat*0.03);
  c.pt=false;const edmg=Math.max(0,Math.floor(c.enemy.atk-pdef+ri(-1,1)));p.hp-=edmg;c.log.unshift('Blocked! Took '+edmg);
  c.pt=true;if(p.hp<=0){defeat();return}updateUI();openModal('combat',true);
}
function cbtFlee(){
  if(!G.cbt)return;const st=G.player.skills.stealth||1;
  if(RNG.next()<0.25+st*0.06){G.cbt.fled=true;closeModal();addLog('Fled combat');G.cbt=null;return}
  G.cbt.log.unshift('Failed to flee!');G.cbt.pt=false;
  const p=G.player;const dmg=Math.max(1,G.cbt.enemy.atk-ri(1,3));p.hp-=dmg;G.cbt.log.unshift(G.cbt.enemy.n+' hits for '+dmg);
  G.cbt.pt=true;if(p.hp<=0){defeat();return}updateUI();openModal('combat',true);
}
function victory(){const c=G.cbt,p=G.player;p.xp+=c.enemy.xp;p.gold+=ri(c.enemy.lt[0],c.enemy.lt[1]);p.edef++;AE.ok();addLog('Defeated '+c.enemy.n+'! +'+c.enemy.xp+'XP');if(c.enemy.type){const bi=G.bandits.findIndex(b=>b.id===c.enemy.id);if(bi>=0)G.bandits.splice(bi,1)}lvlCheck();G.cbt=null;closeModal();updateUI()}
function defeat(){const p=G.player;p.hp=p.mhp*0.25;p.gold=Math.floor(p.gold*0.7);const nc=G.cities.reduce((b,c)=>{const d=dt(p.x,p.y,c.x,c.y);return d<b.d?{c,d}:b},{c:G.cities[0],d:Infinity});p.x=nc.c.x;p.y=nc.c.y;p.path=[];p.moving=false;AE.er();addLog('Defeated! Lost 70% gold.');notify('Defeated!','er');G.cbt=null;closeModal();updateUI()}
function lvlCheck(){const p=G.player;while(p.xp>=p.lvl*100){p.xp-=p.lvl*100;p.lvl++;p.sp++;p.mhp+=8;p.hp=Math.min(p.mhp,p.hp+8);addLog('⭐ LEVEL '+p.lvl+'!');notify('Level '+p.lvl+'!','ok')}}

// ─── DOMAIN: TRADE ───
function buyGood(gid,qty){
  const p=G.player;const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<50);if(!nc)return;
  const g=GI[gid];if(!g)return;const price=nc.prices[gid]||g.p;const total=price*qty;
  if(p.gold<total){notify('Need more gold','er');return}
  const cap=p.caravan?p.caravan.cap:30;const used=totWt();
  if(used+qty*(g.w||1)>cap){notify('No capacity!','er');return}
  p.gold-=total;const inv=p.caravan?p.caravan.goods:p.inv;
  const ex=inv.find(x=>x.id===gid);if(ex){if(g.per)ex.perDays=Math.min(ex.perDays||g.per,g.per);ex.qty+=qty}else{inv.push({id:gid,qty,perDays:g.per||0})}
  nc.supply[gid]=Math.max(1,(nc.supply[gid]||50)-qty);AE.cn();updateUI();openModal('market',true);
}
function sellGood(gid,qty){
  const p=G.player;const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<50);if(!nc)return;
  const inv=p.caravan?p.caravan.goods:p.inv;const ex=inv.find(x=>x.id===gid);if(!ex||ex.qty<qty)return;
  const g=GI[gid];const price=nc.prices[gid]||g.p;
  p.gold+=Math.floor(price*qty*(1+p.skills.trading*0.03));ex.qty-=qty;
  if(ex.qty<=0){const i=inv.indexOf(ex);inv.splice(i,1)}p.trades++;
  nc.demand[gid]=Math.max(1,(nc.demand[gid]||50)-qty);AE.cn();updateUI();openModal('market',true);
}
function totWt(){const p=G.player;const inv=p.caravan?p.caravan.goods:p.inv;return inv.reduce((s,x)=>{const g=GI[x.id];return s+(g?g.w||1:1)*x.qty},0)}

// ─── DOMAIN: TRANSPORT ───
function useTrain(cityIdA,cityIdB){
  const p=G.player;const t=G.trains.find(t=>(t.cityA===cityIdA&&t.cityB===cityIdB)||(t.cityA===cityIdB&&t.cityB===cityIdA));
  if(!t||p.gold<t.cost){notify('Need $'+t.cost,'er');return}
  p.gold-=t.cost;const dest=G.cities.find(c=>c.id===(cityIdA===t.cityA?t.cityB:t.cityA));
  if(!dest)return;p.x=dest.x;p.y=dest.y;p.path=[];p.moving=false;p.vis.push(dest.id);
  addLog('Took train to '+dest.name);AE.al();closeModal();updateUI();
}
function useShip(cityIdA,cityIdB){
  const p=G.player;const s=G.ships.find(s=>(s.cityA===cityIdA&&s.cityB===cityIdB)||(s.cityA===cityIdB&&s.cityB===cityIdA));
  if(!s||p.gold<s.cost){notify('Need $'+s.cost,'er');return}
  p.gold-=s.cost;const dest=G.cities.find(c=>c.id===(cityIdA===s.cityA?s.cityB:s.cityA));
  if(!dest)return;p.x=dest.x;p.y=dest.y;p.path=[];p.moving=false;p.vis.push(dest.id);
  addLog('Sailed to '+dest.name);AE.al();closeModal();updateUI();
}
function buyCaravan(){const p=G.player;if(p.gold<500||p.caravan)return;p.gold-=500;p.caravan={cap:50,goods:[],guards:0};AE.cn();addLog('Bought caravan!');notify('Caravan!','ok')}

// ─── DOMAIN: DECAY ───
function processDecay(){
  const p=G.player;
  // Food spoilage
  const inv=p.caravan?p.caravan.goods:p.inv;
  for(let i=inv.length-1;i>=0;i--){
    const x=inv[i];const g=GI[x.id];
    if(g&&g.per){x.spoilDay=(x.spoilDay||G.day+g.per);if(G.day>=x.spoilDay){addLog('Food rotted: '+g.n+' x'+x.qty);inv.splice(i,1)}}
  }
  // Road condition
  G.roads.forEach(r=>{r.cond=(r.cond||100)-0.5;if(r.cond<0)r.cond=0});
  // Country building maintenance
  if(G.day%10===0)G.countries.forEach(co=>{co.cities.forEach(ct=>{if(co.treasury<50000)ct.stab=Math.max(10,ct.stab-2)})});
  // Unsold goods lose value
  if(G.day%5===0)G.cities.forEach(c=>{GD.forEach(g=>{c.prices[g.id]=Math.max(1,c.prices[g.id]*0.99)})});
}

// ─── DOMAIN: COUNTRY AI ───
function countryAI(){
  G.countries.forEach(co=>{
    co.pop=co.cities.reduce((s,c)=>s+c.pop,0);
    // War
    if(co.atWar.length===0&&RNG.next()<0.15){
      const tg=G.countries.filter(c=>c!==co&&!co.atWar.includes(c.name)&&(co.rel[c.name]||0)<-15);
      if(tg.length>0){const t=pk(tg);co.atWar.push(t.name);t.atWar.push(co.name);addLog('⚔️ WAR: '+co.name+' vs '+t.name+'!')}
    }
    // Peace
    co.atWar=co.atWar.filter(en=>{
      const ec=G.countries.find(c=>c.name===en);if(!ec||co.treasury<30000||RNG.next()<0.08){if(ec)ec.atWar=ec.atWar.filter(n=>n!==co.name);addLog('🕊️ Peace: '+co.name+' & '+en);return false}return true;
    });
    // Armies move + fight + capture
    co.armies.forEach((a,ai)=>{
      if(co.atWar.length>0){
        const en=G.countries.find(c=>c.name===co.atWar[0]);
        if(en&&en.cities.length>0){
          // Check for enemy armies nearby
          let fought=false;
          for(let ei=en.armies.length-1;ei>=0;ei--){
            const ea=en.armies[ei];
            if(dt(a.x,a.y,ea.x,ea.y)<50){
              const pwr1=a.sz*(0.8+RNG.next()*0.4),pwr2=ea.sz*(0.8+RNG.next()*0.4);
              if(pwr1>pwr2){a.sz=Math.floor(a.sz*0.6);en.armies.splice(ei,1);if(a.sz<200)co.armies.splice(ai,1)}
              else{ea.sz=Math.floor(ea.sz*0.6);co.armies.splice(ai,1);if(ea.sz<200)en.armies.splice(ei,1)}
              fought=true;break;
            }
          }
          if(!fought){
            const tc=pk(en.cities);a.tx=tc.tx;a.ty=tc.ty;
            // Check if reached enemy city
            const ec=en.cities.find(c=>dt(a.x,a.y,c.x,c.y)<60);
            if(ec&&ec.owner!==co.name&&RNG.next()<0.25){
              ec.owner=co.name;ec.stab=Math.max(10,ec.stab-30);
              addLog('⚔️ '+co.name+' captured '+ec.name+'!');
              const remain=en.cities.filter(c=>c.owner!==co.name);
              if(remain.length===0){addLog('🏴 '+en.name+' has fallen!');en.atWar=[];co.atWar=co.atWar.filter(n=>n!==en.name)}
            }
          }
        }
      }else if(RNG.next()<0.15){const tc=pk(co.cities);a.tx=tc.tx;a.ty=tc.ty}
      const dx=a.tx*TILE+TILE/2-a.x,dy=a.ty*TILE+TILE/2-a.y,d=Math.hypot(dx,dy);if(d>5){a.x+=dx/d*6;a.y+=dy/d*6}
    });
    // Passive relations from embassies
    co.embassies.forEach(()=>{co.rel['player']=(co.rel['player']||0)+0.2});
    // Process investments
    co.investments.forEach(inv=>{if(G.day-inv.day>=30){const ret=Math.floor(inv.amount*(1+inv.roi/100));if(inv.player)G.player.gold+=ret;co.treasury+=Math.floor(inv.amount*0.3)}});
    co.investments=co.investments.filter(inv=>G.day-inv.day<30);
  });
}

// ─── APPLICATION: GAME TICK ───
function gameTick(){
  G.tick++;
  if(G.tick%3===0){
    G.day++;
    // Player movement
    if(G.player.path.length>0&&G.player.moving)movePlayer();
    // AI traders - actually trade
    G.aiTraders.forEach(t=>{
      // Check if at a city
      const nc=G.cities.find(c=>dt(t.x,t.y,c.x,c.y)<50);
      if(nc&&RNG.next()<0.3){
        // Buy low
        const cheap=GD.filter(g=>nc.prices[g.id]<g.p*0.9&&t.gold>=nc.prices[g.id]).slice(0,3);
        cheap.forEach(g=>{const qty=ri(1,5),cost=nc.prices[g.id]*qty;if(t.gold>=cost){t.gold-=cost;const ex=t.goods.find(x=>x.id===g.id);if(ex)ex.qty+=qty;else t.goods.push({id:g.id,qty});nc.supply[g.id]=Math.max(1,(nc.supply[g.id]||50)-qty)}});
        // Sell high
        for(let i=t.goods.length-1;i>=0;i--){const x=t.goods[i];const g=GI[x.id];if(g&&nc.prices[g.id]>g.p*1.1){t.gold+=nc.prices[g.id]*x.qty;nc.demand[g.id]=Math.max(1,(nc.demand[g.id]||50)-x.qty);t.goods.splice(i,1)}}
      }
      // Move toward target
      if(!nc||RNG.next()<0.15){if(RNG.next()<0.08){const tc=pk(G.cities);t.tx=tc.tx;t.ty=tc.ty}}
      const dx=t.tx*TILE+TILE/2-t.x,dy=t.ty*TILE+TILE/2-t.y,d=Math.hypot(dx,dy);if(d>5){t.x+=dx/d*6;t.y+=dy/d*6}
    });
    // Bandits
    G.bandits.forEach(b=>{if(RNG.next()<0.15){b.tx=cl(b.tx+ri(-2,2),1,COLS-2);b.ty=cl(b.ty+ri(-2,2),1,ROWS-2)}b.x+=(b.tx*TILE+TILE/2-b.x)*0.08;b.y+=(b.ty*TILE+TILE/2-b.y)*0.08});
    // Camping
    if(G.player.camping){G.player.hp=Math.min(G.player.mhp,G.player.hp+2);G.player.cturns--;if(G.player.cturns<=0)G.player.camping=false}
    // Country AI
    if(G.day%8===0)countryAI();
    // Missions
    if(G.day%6===0&&G.missions.filter(m=>!m.ok).length<3)genMissions();
    // Stock prices
    if(G.day%2===0)G.comps.forEach(c=>{c.stock=Math.max(1,c.stock*(1+(RNG.next()-0.48)*0.05));c.hist.push(c.stock);if(c.hist.length>30)c.hist.shift()});
    // City prices
    if(G.day%3===0)G.cities.forEach(c=>{GD.forEach(g=>{c.prices[g.id]=Math.max(1,g.p*(1+(c.demand[g.id]-c.supply[g.id])*0.003+rf(-0.08,0.08)))})});
    // Decay
    processDecay();
    // World events + weather
    if(G.day>=G.nextEventDay){const et=pk(['boom','recession','scandal','disaster','golden','war','crash','tech']);addLog('🌍 World Event: '+et);G.nextEventDay=G.day+ri(8,15)}
    if(G.day>=G.weather.startDay+G.weather.dur){G.weather={type:pk(['clear','clear','rain','rain','fog']),intensity:rf(0.3,1),startDay:G.day,dur:ri(3,8)};if(G.weather.type!=='clear')addLog('🌦️ '+G.weather.type.toUpperCase()+' for '+G.weather.dur+' days')}
    // Random encounter
    if(G.player.moving&&RNG.next()<0.06&&!G.cbt){const t=pk(Object.keys(EN));const e=EN[t];startCombat({...e,n:e.n,mhp:e.hp,type:t})}
    // Company revenue
    if(G.player.role==='ceo'&&G.player.companies.length>0)G.player.companies.forEach(co=>{const rev=co.cities.length*(2000+RNG.next()*3000);G.player.gold+=rev;co.rev=rev});
    // Player ability cooldown
    if(G.player&&G.player.abilityCd>0)G.player.abilityCd--;
  }
  updateUI();
}
function movePlayer(){
  const p=G.player;if(p.path.length===0){p.moving=false;return}
  const tgt=p.path[0],dx=tgt.x-p.x,dy=tgt.y-p.y,d=Math.hypot(dx,dy);
  const spd=3*(TS[getTile(p.x,p.y)]||1);if(d<spd){p.x=tgt.x;p.y=tgt.y;p.path.shift();if(p.path.length===0){p.moving=false;const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<30);if(nc&&!p.vis.includes(nc.id)){p.vis.push(nc.id)}}}
  else{p.x+=dx/d*spd;p.y+=dy/d*spd}
}
function findPath(sx,sy,tx,ty){
  const stx=Math.floor(sx/TILE),sty=Math.floor(sy/TILE),etx=Math.floor(tx/TILE),ety=Math.floor(ty/TILE);
  if(stx===etx&&sty===ety)return[{x:tx,y:ty}];
  const path=[];let blocked=false;const steps=Math.max(Math.abs(etx-stx),Math.abs(ety-sty))+1;
  for(let i=0;i<=steps;i++){const t=i/steps,cx=Math.floor(stx+(etx-stx)*t),cy=Math.floor(sty+(ety-sty)*t);if(terrain[cl(cy,0,ROWS-1)][cl(cx,0,COLS-1)]===T.WATER||terrain[cl(cy,0,ROWS-1)][cl(cx,0,COLS-1)]===T.MOUNTAIN){blocked=true;break}}
  if(!blocked){path.push({x:tx,y:ty});return path}
  const mx=(stx+etx)/2,my=(sty+ety)/2;path.push({x:mx*TILE+TILE/2,y:my*TILE+TILE/2});path.push({x:tx,y:ty});return path;
}

// ─── APPLICATION: CITY INTERACTION ───
function interactCity(){const p=G.player;const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<50);if(!nc){notify('No city nearby','inf');return}openModal('city')}
function healAtCity(){const p=G.player;if(p.gold<50)return;p.gold-=50;p.hp=p.mhp;AE.ok();notify('Healed!','ok')}
function joinArmy(cn){const p=G.player;if(p.joinedArmy)return;p.joinedArmy=cn;p.gold+=200;addLog('Enlisted in '+cn+' army!');notify('Joined '+cn+' army!','ok');setTimeout(()=>{if(G.cbt)return;const e={...EN.soldier};e.n='Enemy Soldier';e.mhp=e.hp;startCombat(e)},2500)}
function campAction(){const p=G.player;if(p.camping){p.camping=false;return}if(p.moving)return;p.camping=true;p.cturns=ri(4,10);addLog('Camping...')}

// ─── APPLICATION: SAVE/LOAD ───
function saveGame(){
  const d={v:4,player:G.player,day:G.day,tick:G.tick,seed:G.seed,achs:G.achs,news:G.news.slice(-40),logs:G.logs.slice(-60),
    cities:G.cities.map(c=>({id:c.id,name:c.name,cIdx:c.cIdx,tx:c.tx,ty:c.ty,x:c.x,y:c.y,pop:c.pop,gdp:c.gdp,stab:c.stab,owner:c.owner,supply:c.supply,demand:c.demand,prices:c.prices})),
    countries:G.countries.map(co=>({name:co.name,color:co.color,cIds:co.cities.map(c=>c.id),cx:co.cx,cy:co.cy,gov:co.gov,mil:co.mil,treasury:co.treasury,tax:co.tax,rel:co.rel,atWar:co.atWar,personality:co.pers,coastal:co.coastal,investments:co.investments.slice(-5),embassies:co.embassies,armies:co.armies.map(a=>({id:a.id,c:a.c,sz:a.sz,x:a.x,y:a.y,tx:a.tx,ty:a.ty,ord:a.ord}))})),
    bandits:G.bandits,aiTraders:G.aiTraders,misions:G.missions,roads:G.roads,trains:G.trains,ships:G.ships,comps:G.comps,
    terrain:terrain.map(r=>[...r]),nextEventDay:G.nextEventDay};
  try{localStorage.setItem('nd4_save',JSON.stringify(d));AE.ok()}catch(e){}
}
function loadGame(){
  try{const r=localStorage.getItem('nd4_save');if(!r)return false;const d=JSON.parse(r);
    G=newState();G.player=d.player;G.day=d.day;G.tick=d.tick;G.seed=d.seed;G.achs=d.achs||{};G.news=d.news||[];G.logs=d.logs||[];G.bandits=d.bandits||[];G.aiTraders=d.aiTraders||[];G.missions=d.misions||[];G.comps=d.comps||[];G.nextEventDay=d.nextEventDay||10;
    genTerrain(G.seed);
    G.cities=d.cities;G.roads=d.roads||[];G.trains=d.trains||[];G.ships=d.ships||[];
    G.countries=d.countries.map((cd,i)=>{const co={name:cd.name,color:cd.color,cities:[],cx:cd.cx,cy:cd.cy,gov:cd.gov,mil:cd.mil,treasury:cd.treasury,tax:cd.tax,rel:cd.rel||{},armies:cd.armies||[],atWar:cd.atWar||[],pop:0,pers:cd.personality,coastal:cd.coastal,investments:cd.investments||[],bonds:[],embassies:cd.embassies||[]};co.cities=cd.cIds.map(cid=>G.cities.find(c=>c.id===cid)).filter(Boolean);return co});
    document.getElementById('rm').style.display='none';updateUI();addLog('Game loaded');
    return true;
  }catch(e){notify('Load failed: '+e.message,'er');return false}
}

// ─── PRESENTATION: UI ───
function updateUI(){
  const p=G.player;
  document.getElementById('tbN').textContent=p.name||'Traveler';
  document.getElementById('tbH').textContent=Math.max(0,p.hp).toFixed(0)+'/'+p.mhp;
  document.getElementById('tbL').textContent=p.lvl;document.getElementById('tbG').textContent='$'+fmt(p.gold);
  document.getElementById('tbD').textContent='Day '+G.day;document.getElementById('tbR').textContent=p.role.toUpperCase();
  // Nearby city
  const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<70);
  document.getElementById('tbNear').textContent=nc?nc.name+' ('+G.countries[nc.cIdx].name+')':'wilderness';
  // Log overlay
  const lo=document.getElementById('logOverlay');
  lo.innerHTML=G.logs.slice(0,10).map(l=>`<div class="le"><span class="ld">D${l.t}</span>${l.m}</div>`).join('');
  // Minimap (interactive with terrain)
  const mm=document.getElementById('miniMap'),mmc=mm.getContext('2d');
  mmc.clearRect(0,0,130,90);mmc.fillStyle='rgba(5,10,20,0.85)';mmc.fillRect(0,0,130,90);
  // Simplified terrain
  for(let y=0;y<ROWS;y+=3)for(let x=0;x<COLS;x+=3){mmc.fillStyle=TC[terrain[y][x]];mmc.fillRect(2+x/COLS*126,2+y/ROWS*86,126/COLS*3,86/ROWS*3)}
  G.countries.forEach(co=>{co.cities.forEach(c=>{mmc.fillStyle=co.color.replace(/[\\d.]+\)$/,'0.9)');mmc.fillRect(2+c.tx/COLS*126,2+c.ty/ROWS*86,3,3)})});
  mmc.fillStyle='#ffd700';mmc.fillRect(1+p.x/TILE/COLS*126,1+p.y/TILE/ROWS*86,4,4);
  // Viewport rectangle
  mmc.strokeStyle='rgba(255,255,255,0.5)';mmc.lineWidth=1;mmc.strokeRect(2+(-camX/zoom/TILE)/COLS*126,2+(-camY/zoom/TILE)/ROWS*86,(canvas.width/zoom/TILE)/COLS*126,(canvas.height/zoom/TILE)/ROWS*86);
  if(G.modal)openModal(G.modal,true);
}
function notify(m,t='inf'){const e=document.createElement('div');e.className='note '+({ok:'ok',er:'er',inf:'inf'}[t]||'inf');e.textContent=m;document.body.appendChild(e);setTimeout(()=>{e.style.opacity='0';e.style.transition='opacity .3s'},2500);setTimeout(()=>e.remove(),2800)}
function addLog(m){G.logs.unshift({t:G.day,m});if(G.logs.length>150)G.logs.pop()}

function openModal(nm,ref){
  if(!ref)G.modal=nm;
  const ov=document.getElementById('modalOverlay'),mc=document.getElementById('modalC');
  let h='';
  switch(nm){
    case'combat':h=mdCombat();break;case'city':h=mdCity();break;case'market':h=mdMarket();break;
    case'inv':h=mdInv();break;case'skills':h=mdSkills();break;case'transport':h=mdTransport();break;
    case'diplomacy':h=mdDiplomacy();break;case'finance':h=mdFinance();break;
  }
  mc.innerHTML=h;if(!ref)ov.classList.add('on');
}
function closeModal(){document.getElementById('modalOverlay').classList.remove('on');G.modal=null}

function mdCombat(){
  if(!G.cbt)return'';const c=G.cbt,p=G.player,e=c.enemy;
  return`<div class="mh"><h2>⚔️ Combat</h2></div><div class="mb">
    <div class="card"><div class="sr"><span>You Lvl${p.lvl}</span><span class="red">${e.n}</span></div>
    <div class="pb"><div class="pf" style="width:${Math.max(0,p.hp/p.mhp*100)}%;background:${p.hp/p.mhp>0.5?'#2ed573':p.hp/p.mhp>0.25?'#ffd700':'#ff4757'}"></div></div><span style="font-size:9px">HP: ${Math.max(0,p.hp).toFixed(0)}/${p.mhp}</span>
    <div class="pb mt8"><div class="pf" style="width:${Math.max(0,e.hp/e.mhp*100)}%;background:${e.hp/e.mhp>0.5?'#2ed573':e.hp/e.mhp>0.25?'#ffd700':'#ff4757'}"></div></div><span style="font-size:9px">HP: ${Math.max(0,e.hp).toFixed(0)}/${e.mhp}</span></div>
    ${c.pt?`<div class="flex-row mt8" style="gap:6px;justify-content:center"><button class="btn btn3" onclick="cbtAtk()">⚔️ Attack</button><button class="btn btn1" onclick="cbtDef()">🛡️ Defend</button><button class="btn bs" onclick="cbtFlee()">🏃 Flee</button></div>
    ${c.pt?`<div class="flex-row mb8" style="gap:4px;justify-content:center">${getAbilityButtons()}</div>`:''}`:'<div style="text-align:center;color:#5a6a80;margin-top:6px">Enemy turn...</div>'}
    <div class="mt8" style="max-height:80px;overflow-y:auto;font-size:9px;color:#6a7a90">${c.log.slice(0,6).map(l=>`<div>${l}</div>`).join('')}</div></div>`;
}

function mdCity(){
  const p=G.player;const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<50);if(!nc)return'<div class="mh"><h2>No city nearby</h2></div>';
  if(!p.vis.includes(nc.id))p.vis.push(nc.id);
  const co=G.countries[nc.cIdx];
  return`<div class="mh"><h2>🏙️ ${nc.name}, ${co.name}</h2><button class="mc" onclick="closeModal()">✕</button></div><div class="mb">
    <div class="card"><div class="sr"><span class="sl">Pop</span><span class="sv">${fmt(nc.pop)}</span></div><div class="sr"><span class="sl">Stab</span><span class="sv">${nc.stab.toFixed(0)}%</span></div><div class="sr"><span class="sl">Tax</span><span class="sv red">${co.tax}%</span></div>${co.atWar.length>0?`<div class="sr"><span class="sl">At War</span><span class="sv red">${co.atWar.join(', ')}</span></div>`:''}</div>
    <div class="flex-row" style="gap:4px;flex-wrap:wrap">
    <button class="btn btn4" onclick="closeModal();openModal('market')">💰 Market</button>
    <button class="btn btn4" onclick="closeModal();openModal('transport')">🚂 Travel</button>
    <button class="btn btn1" onclick="healAtCity();closeModal()">🏥 Heal $50</button>
    ${!p.caravan?`<button class="btn btn4" onclick="buyCaravan();closeModal()">🐪 Caravan $500</button>`:''}
    ${!p.joinedArmy?`<button class="btn btn3" onclick="joinArmy('${co.name}');closeModal()">⚔️ Join Army</button>`:''}
    ${p.gold>=20000&&p.companies.length<3?`<button class="btn btn4" onclick="foundCompany();closeModal()">🏢 Found Co $20K</button>`:''}
    </div></div>`;
}

function mdMarket(){
  const p=G.player;const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<50);if(!nc)return'<div class="mh"><h2>No market nearby</h2></div>';
  const cap=p.caravan?p.caravan.cap:30,used=totWt();
  const inv=p.caravan?p.caravan.goods:p.inv;
  // Shop categories
  const cats=[...new Set(GD.map(g=>g.cat))];
  return`<div class="mh"><h2>💰 Market — ${nc.name}</h2><button class="mc" onclick="closeModal()">✕</button></div><div class="mb">
    <div class="sr"><span class="sl">Capacity</span><span class="sv">${fmt(used)}/${fmt(cap)}</span></div><div class="pb"><div class="pf" style="width:${Math.min(100,used/cap*100)}%;background:#00d4ff"></div></div>
    <h3 class="mt8">Buy Goods</h3>
    <div class="flex-row" style="gap:4px;margin:4px 0">
    <input id="searchFilter" placeholder="Search goods..." oninput="openModal('market',true)" style="background:#101827;color:#c0c8d4;border:1px solid #1e2d45;padding:3px;font-size:10px;width:140px">
    <select id="catFilter" onchange="openModal('market',true)" style="background:#101827;color:#c0c8d4;border:1px solid #1e2d45;padding:3px;font-size:10px">
      <option value="all">All Categories</option>${cats.map(c=>`<option value="${c}">${c.toUpperCase()}</option>`).join('')}
    </select></div>
    <div style="max-height:200px;overflow-y:auto"><table><tr><th>Good</th><th>Cat</th><th>Price</th><th>Wt</th><th>Buy</th></tr>
    ${(()=>{const cf=(document.getElementById('catFilter')||{}).value||'all';const sf=((document.getElementById('searchFilter')||{}).value||'').toLowerCase();return GD.filter(g=>(cf==='all'||g.cat===cf)&&(!sf||g.n.toLowerCase().includes(sf))).map(g=>`<tr><td>${g.n}${g.r?' ⭐':''}</td><td style="font-size:8px">${g.cat}</td><td>$${(nc.prices[g.id]||g.p).toFixed(0)}</td><td>${g.w||1}</td><td><button class="btn btn1 bs" onclick="buyGood('${g.id}',1)">+1</button> <button class="btn btn1 bs" onclick="buyGood('${g.id}',5)">+5</button></td></tr>`).join('')})()}
    </table></div>
    <h3 class="mt8">Sell Goods</h3>
    ${inv.length===0?'<div style="color:#5a6a80;font-size:10px">Nothing to sell</div>':`<table><tr><th>Good</th><th>Qty</th><th>Price</th><th>Sell</th></tr>${inv.map(x=>{const g=GI[x.id];return g?`<tr><td>${g.n}${x.perDays?' 🕐':''}</td><td>${x.qty}</td><td>$${(nc.prices[g.id]||g.p).toFixed(0)}</td><td><button class="btn btn2 bs" onclick="sellGood('${x.id}',1)">-1</button> <button class="btn btn2 bs" onclick="sellGood('${x.id}',${x.qty})">All</button></td></tr>`:''}).join('')}</table>`}
  </div>`;
}

function mdInv(){
  const p=G.player;const inv=p.caravan?p.caravan.goods:p.inv;
  return`<div class="mh"><h2>🎒 Inventory</h2><button class="mc" onclick="closeModal()">✕</button></div><div class="mb">
    <div class="sr"><span class="sl">Gold</span><span class="sv gld">$${fmt(p.gold)}</span></div>
    <div class="sr"><span class="sl">Weapon</span><span class="sv">${p.eq.weapon?(GI[p.eq.weapon]?GI[p.eq.weapon].n+' ['+(p.eq._wDur||GI[p.eq.weapon].dur||0)+'/'+(GI[p.eq.weapon].dur||0)+']':'?'):'None'}</span></div>
    <div class="sr"><span class="sl">Armor</span><span class="sv">${p.eq.armor?(GI[p.eq.armor]?GI[p.eq.armor].n+' ['+(p.eq._aDur||GI[p.eq.armor].dur||0)+'/'+(GI[p.eq.armor].dur||0)+']':'?'):'None'}</span></div>
    <div class="sr"><span class="sl">Accessory</span><span class="sv">${p.eq.accessory?GI[p.eq.accessory]?GI[p.eq.accessory].n:'?':'None'}</span></div>
    ${p.caravan?`<div class="sr"><span class="sl">Caravan</span><span class="sv">Cap:${p.caravan.cap} | Guards:${p.caravan.guards}</span></div>`:''}
    <h3 class="mt8">Goods</h3>${inv.length===0?'<div style="color:#5a6a80;font-size:10px">Empty</div>':`<table><tr><th>Item</th><th>Qty</th>${p.caravan?'<th>Spoil</th>':''}</tr>${inv.map(x=>{const g=GI[x.id];return g?`<tr><td>${g.n}</td><td>${x.qty}</td>${p.caravan?`<td style="font-size:8px">${x.spoilDay?Math.max(0,x.spoilDay-G.day)+'d':g.per?g.per+'d':'-'}</td>`:''}</tr>`:''}).join('')}</table>`}
    <h3 class="mt8">Quick Use</h3>${inv.filter(x=>{const g=GI[x.id];return g&&g.use}).map(x=>{const g=GI[x.id];return`<button class="btn btn2 bs mt8" onclick="useItem('${x.id}');openModal('inv',true)">Use ${g.n}</button>`}).join(' ')}</div>`;
}
function useItem(gid){
  const p=G.player;const inv=p.caravan?p.caravan.goods:p.inv;const ex=inv.find(x=>x.id===gid);if(!ex)return;const g=GI[gid];
  if(g.use==='restore_hp'){p.hp=Math.min(p.mhp,p.hp+g.val);ex.qty--;addLog('Used '+g.n)}
  else if(g.use==='xp'){p.xp+=g.val;ex.qty--;addLog('Read '+g.n);lvlCheck()}
  else if(g.use==='max_hp'){p.mhp+=g.val;p.hp+=g.val;ex.qty--;addLog('Used '+g.n+'! Max HP +'+g.val)}
  else if(g.use==='perm_hp'){p.mhp+=g.val;ex.qty--;addLog('Permanent HP +'+g.val)}
  if(ex.qty<=0){const i=inv.indexOf(ex);inv.splice(i,1)}
  AE.ok();updateUI();
}

function mdSkills(){
  const p=G.player;
  return`<div class="mh"><h2>⭐ Skills</h2><button class="mc" onclick="closeModal()">✕</button></div><div class="mb">
    <div class="card"><div class="sr"><span class="sl">Level</span><span class="sv">${p.lvl}</span></div><div class="sr"><span class="sl">XP</span><span class="sv">${p.xp}/${p.lvl*100}</span></div><div class="sr"><span class="sl">Points</span><span class="sv gld">${p.sp}</span></div></div>
    ${Object.entries(p.skills).map(([k,v])=>`<div class="card"><div class="sr"><span>${k.toUpperCase()}</span><span>Lvl ${v}</span></div><div class="pb"><div class="pf" style="width:${v*10}%;background:#00d4ff"></div></div>${p.sp>0?`<button class="btn btn4 bs mt8" onclick="upSkill('${k}');openModal('skills',true)">+1</button>`:''}</div>`).join('')}
    <h3 class="mt8">Stats</h3><div class="sr"><span class="sl">ATK</span><span class="sv">${p.atk+(p.eq.weapon&&GI[p.eq.weapon]?GI[p.eq.weapon].atk||0:0)+(p.eq.accessory&&GI[p.eq.accessory]?GI[p.eq.accessory].atk||0:0)}</span></div><div class="sr"><span class="sl">DEF</span><span class="sv">${p.def+(p.eq.armor&&GI[p.eq.armor]?GI[p.eq.armor].def||0:0)+(p.eq.accessory&&GI[p.eq.accessory]?GI[p.eq.accessory].def||0:0)}</span></div>
    <div class="sr"><span class="sl">Enemies Defeated</span><span class="sv">${p.edef}</span></div><div class="sr"><span class="sl">Trades</span><span class="sv">${p.trades}</span></div></div>`;
}
function upSkill(k){const p=G.player;if(p.sp<=0)return;p.skills[k]=(p.skills[k]||1)+1;p.sp--;AE.ok()}

function mdTransport(){
  const p=G.player;const nc=G.cities.find(c=>dt(p.x,p.y,c.x,c.y)<50);
  return`<div class="mh"><h2>🚂 Transport</h2><button class="mc" onclick="closeModal()">✕</button></div><div class="mb">
    ${nc?`<h3>From ${nc.name}</h3><h4>Trains</h4>${G.trains.filter(t=>t.cityA===nc.id||t.cityB===nc.id).map(t=>{const d=G.cities.find(c=>c.id===(t.cityA===nc.id?t.cityB:t.cityA));return d?`<button class="btn btn1 bs" onclick="useTrain(${nc.id},${d.id})">🚂 ${d.name} — $${t.cost}</button>`:''}).join(' ')||'<span style="color:#5a6a80;font-size:10px">No trains</span>'}
    <h4 class="mt8">Ships</h4>${G.ships.filter(s=>s.cityA===nc.id||s.cityB===nc.id).map(s=>{const d=G.cities.find(c=>c.id===(s.cityA===nc.id?s.cityB:s.cityA));return d?`<button class="btn btn1 bs" onclick="useShip(${nc.id},${d.id})">🚢 ${d.name} — $${s.cost}</button>`:''}).join(' ')||'<span style="color:#5a6a80;font-size:10px">No ships</span>'}`:'<span style="color:#5a6a80;">Move near a city first</span>'}
    ${p.caravan?`<h3 class="mt8">Caravan</h3><div class="sr"><span class="sl">Capacity</span><span class="sv">${p.caravan.cap}</span></div><div class="sr"><span class="sl">Guards</span><span class="sv">${p.caravan.guards}</span></div><button class="btn btn4 bs" onclick="upgradeCaravan();openModal('transport',true)">+25 Cap $300</button> <button class="btn btn4 bs" onclick="hireGuard();openModal('transport',true)">Hire Guard $20/d</button>`:`<button class="btn btn4" onclick="buyCaravan();openModal('transport',true)">Buy Caravan $500</button>`}
  </div>`;
}
function upgradeCaravan(){const p=G.player;if(!p.caravan||p.gold<300)return;p.gold-=300;p.caravan.cap+=25;AE.cn()}
function hireGuard(){const p=G.player;if(!p.caravan||p.gold<200)return;p.gold-=200;p.caravan.guards=(p.caravan.guards||0)+1;AE.cn()}

function mdDiplomacy(){
  const p=G.player;
  return`<div class="mh"><h2>🏛️ Diplomacy & Investments</h2><button class="mc" onclick="closeModal()">✕</button></div><div class="mb">
    ${G.countries.map(co=>{const rel=co.rel['player']||0;return`<div class="card"><div class="sr"><span><strong>${co.name}</strong></span><span style="font-size:9px">${co.gov} | ${co.pers}</span></div><div class="sr"><span class="sl">Relations</span><span class="sv" style="color:${rel>30?'#2ed573':rel<-10?'#ff4757':'#c0c8d4'}">${rel.toFixed(0)}</span></div><div class="pb"><div class="pf" style="width:${Math.max(0,(rel+100)/2)}%;background:${rel>30?'#2ed573':rel<-10?'#ff4757':'#00d4ff'}"></div></div>
    <div class="flex-row mt8" style="gap:3px"><button class="btn btn4 bs" onclick="dipAction('${co.name}','gift');openModal('diplomacy',true)">🎁 Gift $2K</button><button class="btn btn1 bs" onclick="dipAction('${co.name}','embassy');openModal('diplomacy',true)">🏛️ Embassy $5K</button>${rel>=20?`<button class="btn btn2 bs" onclick="dipAction('${co.name}','trade_agree');openModal('diplomacy',true)">📜 Trade</button>`:''}${rel>=40?`<button class="btn btn1 bs" onclick="dipAction('${co.name}','alliance');openModal('diplomacy',true)">🤝 Alliance</button>`:''}<button class="btn btn3 bs" onclick="dipAction('${co.name}','sanction');openModal('diplomacy',true)">🚫 Sanction $3K</button></div>
    <div class="mt8"><span style="font-size:9px">Invest: </span>${[5000,20000,50000].map(a=>`<button class="btn btn4 bs" onclick="investInCountry('${co.name}',${a});openModal('diplomacy',true)">$${fmt(a)}</button>`).join(' ')}</div>
    </div>`}).join('')}
  </div>`;
}

function mdFinance(){
  const p=G.player;const pv=Object.entries(p.portfolio).reduce((s,[cid,pt])=>{const co=G.comps.find(c=>c.id===parseInt(cid));return s+(co?pt.shares*co.stock:0)},0);
  return`<div class="mh"><h2>📈 Finance</h2><button class="mc" onclick="closeModal()">✕</button></div><div class="mb">
    <div class="card"><div class="sr"><span class="sl">Portfolio</span><span class="sv grn">$${fmt(pv)}</span></div></div>
    <h3>Stock Market</h3><table><tr><th>Company</th><th>Price</th><th>Avail</th><th>Buy</th><th>Own</th></tr>
    ${G.comps.map(c=>{const pt=p.portfolio[c.id];return`<tr><td>${c.name}</td><td>$${c.stock.toFixed(1)}</td><td>${fmt(c.avail)}</td><td><button class="btn btn1 bs" onclick="buyStock(${c.id},50)">50</button> <button class="btn btn1 bs" onclick="buyStock(${c.id},200)">200</button></td><td>${pt?pt.shares:'0'}</td></tr>`}).join('')}
    </table>
    ${Object.keys(p.portfolio).length>0?`<h3 class="mt8">Your Holdings</h3><table><tr><th>Company</th><th>Shares</th><th>Value</th><th>Sell</th></tr>${Object.entries(p.portfolio).map(([cid,pt])=>{const co=G.comps.find(c=>c.id===parseInt(cid));if(!co)return'';return`<tr><td>${co.name}</td><td>${pt.shares}</td><td>$${fmt(pt.shares*co.stock)}</td><td><button class="btn btn3 bs" onclick="sellStock(${co.id},${Math.floor(pt.shares/2)});openModal('finance',true)">50%</button> <button class="btn btn3 bs" onclick="sellStock(${co.id},${pt.shares});openModal('finance',true)">All</button></td></tr>`}).join('')}</table>`:''}
    <h3 class="mt8">Your Companies</h3>
    ${p.companies.length===0?'<div style="color:#5a6a80;font-size:10px">None. Found one for $20K at a city.</div>':p.companies.map((co,i)=>`<div class="card"><div class="sr"><span>${co.name}</span><span>${co.sector}</span></div><div class="sr"><span class="sl">Revenue</span><span class="sv">$${fmt(co.rev)}</span></div><div class="sr"><span class="sl">Cities</span><span class="sv">${co.cities.length}</span></div>${!co.ipo?`<button class="btn btn4 bs mt8" onclick="ipoCompany(${i});openModal('finance',true)">📈 IPO $50K</button>`:'<span style="color:#2ed573;font-size:10px">Public ✓</span>'}</div>`).join('')}
  </div>`;
}

// ─── PRESENTATION: CANVAS ───
const canvas=document.getElementById('mapCanvas'),ctx=canvas.getContext('2d');
let camX=600,camY=450,zoom=0.5,drag=false,dsx,dsy,dscx,dscy,particles=[];
function rz(){canvas.width=window.innerWidth;canvas.height=window.innerHeight-52}
window.addEventListener('resize',rz);
canvas.addEventListener('mousedown',e=>{if(e.button===0){const mx=(e.clientX-camX)/zoom,my=(e.clientY-camY)/zoom;drag=true;dsx=e.clientX;dsy=e.clientY;dscx=camX;dscy=camY;G.player.path=findPath(G.player.x,G.player.y,mx,my);G.player.moving=G.player.path.length>0}});
canvas.addEventListener('mousemove',e=>{if(drag){camX=dscx+(e.clientX-dsx);camY=dscy+(e.clientY-dsy)}});
canvas.addEventListener('mouseup',()=>{drag=false});
canvas.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(0.12,Math.min(2.0,zoom*(e.deltaY>0?0.92:1.08)))});
// Minimap click to move camera
const mmEl=document.getElementById('miniMap');mmEl.addEventListener('click',e=>{const rect=mmEl.getBoundingClientRect();const mx=(e.clientX-rect.left-2)/126*COLS*TILE,my=(e.clientY-rect.top-2)/86*ROWS*TILE;camX=-mx*zoom+canvas.width/2;camY=-my*zoom+canvas.height/2});
window.addEventListener('keydown',e=>{if(e.key==='c')interactCity();if(e.key==='i')openModal('inv');if(e.key==='m')openModal('market')});

let waterPhase=0;
function render(){
  waterPhase+=0.008;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#040810';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save();ctx.translate(camX,camY);ctx.scale(zoom,zoom);
  // Water animation - redraw water tiles with sinusoidal offset
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(terrain[y][x]===T.WATER){
    ctx.fillStyle='#1a3a5c';const wo=Math.sin(x*0.5+waterPhase)*Math.cos(y*0.4+waterPhase*0.7)*2;
    ctx.fillRect(x*TILE,y*TILE+wo,TILE,TILE);
    ctx.fillStyle='rgba(30,80,140,0.15)';ctx.fillRect(x*TILE+2,y*TILE+2+wo,TILE-4,TILE-4);
  }
  if(tCache)ctx.drawImage(tCache,0,0);
  // Terrain decorations
  trees.forEach(t=>{ctx.fillStyle='#1a4a1a';ctx.beginPath();ctx.moveTo(t.x,t.y-6*t.s);ctx.lineTo(t.x-3*t.s,t.y);ctx.lineTo(t.x+3*t.s,t.y);ctx.closePath();ctx.fill()});
  rocks.forEach(r=>{ctx.fillStyle='#3a3a3a';ctx.beginPath();ctx.arc(r.x,r.y,r.s*1.2,0,Math.PI*2);ctx.fill()});
  // Roads
  G.roads.forEach(r=>{const cond=(r.cond||100)/100;ctx.strokeStyle=`rgba(139,119,80,${0.3*cond})`;ctx.lineWidth=2*cond+1;ctx.setLineDash([5,3]);ctx.beginPath();ctx.moveTo(r.fx*TILE+TILE/2,r.fy*TILE+TILE/2);ctx.lineTo(r.tx*TILE+TILE/2,r.ty*TILE+TILE/2);ctx.stroke();ctx.setLineDash([])});
  // Train routes
  G.trains.forEach(t=>{ctx.strokeStyle='rgba(200,200,200,0.15)';ctx.lineWidth=1;ctx.setLineDash([2,6]);ctx.beginPath();const ca=G.cities.find(c=>c.id===t.cityA),cb=G.cities.find(c=>c.id===t.cityB);if(ca&&cb){ctx.moveTo(ca.x,ca.y);ctx.lineTo(cb.x,cb.y)}ctx.stroke();ctx.setLineDash([])});
  // Ship routes
  G.ships.forEach(s=>{ctx.strokeStyle='rgba(0,150,200,0.12)';ctx.lineWidth=1;ctx.setLineDash([2,8]);ctx.beginPath();const ca=G.cities.find(c=>c.id===s.cityA),cb=G.cities.find(c=>c.id===s.cityB);if(ca&&cb){ctx.moveTo(ca.x,ca.y);ctx.lineTo(cb.x,cb.y)}ctx.stroke();ctx.setLineDash([])});
  // Countries
  G.countries.forEach(co=>{if(co.cities.length>1){ctx.fillStyle=co.color.replace(/[\d.]+\)$/,'0.04)');ctx.beginPath();const pts=co.cities;for(let i=0;i<pts.length;i++){const a=(i/pts.length)*Math.PI*2;i===0?ctx.moveTo(co.cx+Math.cos(a)*110,co.cy+Math.sin(a)*110):ctx.lineTo(co.cx+Math.cos(a)*110,co.cy+Math.sin(a)*110)}ctx.closePath();ctx.fill();ctx.fillStyle=co.color.replace(/[\d.]+\)$/,'0.35)');ctx.font='16px sans-serif';ctx.textAlign='center';ctx.fillText(co.name,co.cx,co.cy-90)}});
  // Cities
  G.cities.forEach(ct=>{const r=6+ct.pop/150000,co=G.countries[ct.cIdx];if(G.player.vis.includes(ct.id)){const gl=ctx.createRadialGradient(ct.x,ct.y,2,ct.x,ct.y,16);gl.addColorStop(0,'rgba(0,212,255,0.15)');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(ct.x,ct.y,16,0,Math.PI*2);ctx.fill()}ctx.beginPath();ctx.arc(ct.x,ct.y,r,0,Math.PI*2);ctx.fillStyle=co.color;ctx.fill();ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1;ctx.stroke();ctx.fillStyle='#c0c8d4';ctx.font='9px sans-serif';ctx.textAlign='center';
    // Building silhouettes
    if(ct.bldgs)ct.bldgs.forEach(b=>{ctx.fillStyle=b.c;ctx.fillRect(ct.x+b.rx-b.w/2,ct.y+b.ry-b.h,b.w,b.h)});
    ctx.fillText(ct.name,ct.x,ct.y-r-4);if(co.atWar.length>0){ctx.fillStyle='#ff4757';ctx.font='11px sans-serif';ctx.fillText('⚔️',ct.x+r+4,ct.y+2)}});
  // Armies
  G.countries.forEach(co=>co.armies.forEach(a=>{ctx.fillStyle='rgba(255,100,100,0.5)';ctx.beginPath();ctx.arc(a.x,a.y,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='7px sans-serif';ctx.textAlign='center';ctx.fillText(co.name[0],a.x,a.y+3)}));
  // Bandits
  G.bandits.forEach(b=>{ctx.fillStyle='rgba(255,50,50,0.65)';ctx.beginPath();ctx.arc(b.x,b.y,5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='6px sans-serif';ctx.textAlign='center';ctx.fillText('☠',b.x,b.y+2)});
  // AI traders
  G.aiTraders.forEach(t=>{ctx.fillStyle='rgba(0,180,90,0.55)';ctx.beginPath();ctx.arc(t.x,t.y,4,0,Math.PI*2);ctx.fill()});
  // Player
  const p=G.player;const gl=ctx.createRadialGradient(p.x,p.y,3,p.x,p.y,16);gl.addColorStop(0,'rgba(255,215,0,0.45)');gl.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(p.x,p.y,16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffd700';ctx.beginPath();ctx.moveTo(p.x,p.y-9);ctx.lineTo(p.x-6,p.y+6);ctx.lineTo(p.x+6,p.y+6);ctx.closePath();ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=0.8;ctx.stroke();
  if(p.path.length>0){ctx.strokeStyle='rgba(255,215,0,0.2)';ctx.lineWidth=0.8;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(p.x,p.y);p.path.forEach(pt=>ctx.lineTo(pt.x,pt.y));ctx.stroke();ctx.setLineDash([])}
  if(p.camping){ctx.fillStyle='rgba(255,200,50,0.3)';ctx.beginPath();ctx.arc(p.x,p.y,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='12px sans-serif';ctx.textAlign='center';ctx.fillText('🏕️',p.x,p.y-16)}
  // Particles
  particles=particles.filter(pt=>pt.l>0);particles.forEach(pt=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.l-=0.012;ctx.fillStyle=`rgba(0,212,255,${pt.l})`;ctx.beginPath();ctx.arc(pt.x,pt.y,pt.s,0,Math.PI*2);ctx.fill()});
  if(RNG.next()<0.15)particles.push({x:p.x+rf(-12,12),y:p.y+rf(-12,12),vx:rf(-0.4,0.4),vy:rf(-0.4,0.4)-0.8,l:rf(0.2,0.6),s:rf(1,2)});
  ctx.restore();
  // Day/night cycle overlay
  const hour=(G.day*4+G.tick)%24;const night=hour<6||hour>20?Math.max(0,1-(Math.min(Math.abs(hour-3),Math.abs(hour-23))/3)):0;
  if(night>0){ctx.fillStyle=`rgba(5,5,30,${night*0.45})`;ctx.fillRect(0,0,canvas.width,canvas.height)}
  // Weather effects (render-only)
  if(G.weather&&G.weather.type==='rain'){const ri2=G.weather.intensity;ctx.fillStyle=`rgba(100,150,200,${ri2*0.12})`;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle=`rgba(150,190,230,${ri2*0.3})`;ctx.lineWidth=1;for(let i=0;i<80*ri2;i++){const rx=RNG.next()*canvas.width,ry=RNG.next()*canvas.height;ctx.beginPath();ctx.moveTo(rx,ry);ctx.lineTo(rx-1,ry+8*ri2);ctx.stroke()}}
  if(G.weather&&G.weather.type==='fog'){const fi2=G.weather.intensity;ctx.fillStyle=`rgba(180,190,200,${fi2*0.18})`;ctx.fillRect(0,0,canvas.width,canvas.height)}
}

// ─── LOOP ───
function loop(){render();requestAnimationFrame(loop)}
function start(){
  rz();AE.i();AE.am();
  if(localStorage.getItem('nd4_save')&&loadGame()){}else{document.getElementById('rm').style.display='flex'}
  setInterval(gameTick,1500);setInterval(saveGame,35000);
  requestAnimationFrame(loop);
  document.addEventListener('click',()=>{if(AE.c&&AE.c.state==='suspended')AE.c.resume()},{once:true});
}
window.onload=start;
