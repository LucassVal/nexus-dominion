# SPEC: Nexus Dominion v6 — Economic Empire

## SDD (Spec-Driven Development) | DDD | Harness | Decay

---

## PART A: CURRENT STATE (V5)

### Implemented (KEPT)
- Terrain grid 60×45, 6 countries, 24 cities, roads/trains/ships
- 110+ goods catalog, dynamic pricing, supply/demand
- RPG player (HP, skills, equipment, inventory, caravan)
- Combat (turn-based modal, abilities per role)
- Diplomacy (relations, embassy, gifts, sanctions)
- Finance (stock market, private companies, IPO)
- Country AI (war/peace, armies that fight + capture)
- AI traders (buy low, sell high between cities)
- Visual: terrain decorations, water animation, day/night, weather, building silhouettes
- PRNG: Mulberry32 deterministic (0 Math.random)
- DevTools: Eruda + log server + console interceptor

### Gaps (TO BE FIXED BEFORE V6)
- `newState()` calls `ri()` before `seedRNG()` — USE Math.random for seed only
- `gameTick()`, `render()`, `updateUI()` missing G guards — ADD `if(!G)return`
- `saveGame()` missing G guard
- City visuals all identical (no distinction by size/type)

---

## PART B: EXPANSION DESIGN

---

## FEATURE 1: CITY TYPE SYSTEM

### Data
```
CITY_TYPES = {
  village:  { minPop: 0,     maxPop: 50000,   icon: '🏘️', color: '#8a7a5a', ringSize: 5,  facilities: 1, bldgColor: '#6a5a3a' },
  town:     { minPop: 50000, maxPop: 200000,  icon: '🏙️', color: '#9a8a6a', ringSize: 8,  facilities: 2, bldgColor: '#7a6a4a' },
  city:     { minPop: 200000,maxPop: 1000000, icon: '🌆', color: '#aa9a7a', ringSize: 12, facilities: 4, bldgColor: '#8a7a5a' },
  metropolis:{ minPop: 1000000,maxPop:Infinity,icon:'🌃',color: '#ffd700', ringSize: 16, facilities: 6, bldgColor: '#9a8a6a' }
}

// Per-city type field
city.type = 'village'|'town'|'city'|'metropolis'  // derived from population
city.facilities = []  // production facilities assigned to this city
```

### Mechanics
1. City type derived from `pop` field on every tick
2. Type determines:
   - Visual ring size + color on map
   - Building count (villages=3-5, towns=6-10, cities=12-20, metropolis=25-40)
   - Building color palette
   - Number of production facility slots
3. City can upgrade if pop crosses threshold (village→town→city→metropolis)
4. Population grows naturally (+0.5%/day base, modified by stability, food supply, war)

### UI
- Map: distinct ring size/color per type
- Buildings: count + color change with type
- City modal: shows type icon + name + tier label
- Minimap: larger dots for bigger cities

---

## FEATURE 2: PRODUCTION FACILITIES

### Data
```
FACILITY_TYPES = {
  // AGRICULTURE CHAIN
  farm:        { sector:'agriculture', tier:1, name:'Farm',        icon:'🌾', cost:5000,   inputs:[],           outputs:[{id:'grain',qty:10}], labor:5,  upkeep:200 },
  mill:        { sector:'agriculture', tier:2, name:'Mill',        icon:'🏭', cost:15000,  inputs:[{id:'grain',qty:5}], outputs:[{id:'bread',qty:3}], labor:8, upkeep:500 },
  food_plant:  { sector:'agriculture', tier:3, name:'Food Plant',  icon:'🏗️', cost:50000, inputs:[{id:'grain',qty:8},{id:'meat',qty:3}], outputs:[{id:'bread',qty:5},{id:'cheese',qty:2}], labor:15, upkeep:1500 },
  biotech_lab: { sector:'agriculture', tier:4, name:'Biotech Lab', icon:'🧬', cost:200000, inputs:[{id:'herb',qty:5},{id:'mushroom',qty:3}], outputs:[{id:'health_potion',qty:2},{id:'elixir_life',qty:0.1}], labor:30, upkeep:5000 },

  // MINING CHAIN
  mine:        { sector:'mining', tier:1, name:'Mine',          icon:'⛏️', cost:8000,  inputs:[], outputs:[{id:'iron_ore',qty:8},{id:'coal',qty:5}], labor:10, upkeep:300 },
  smelter:     { sector:'mining', tier:2, name:'Smelter',       icon:'🔥', cost:25000, inputs:[{id:'iron_ore',qty:4},{id:'coal',qty:2}], outputs:[{id:'iron',qty:3}], labor:12, upkeep:800 },
  refinery:    { sector:'mining', tier:3, name:'Refinery',      icon:'⚗️', cost:80000, inputs:[{id:'iron',qty:3},{id:'coal',qty:2}], outputs:[{id:'steel',qty:2}], labor:20, upkeep:2500 },
  adv_material:{ sector:'mining', tier:4, name:'Adv Materials', icon:'💎', cost:300000,inputs:[{id:'steel',qty:2},{id:'gold_ingot',qty:1}], outputs:[{id:'mithril',qty:1}], labor:40, upkeep:8000 },

  // MANUFACTURING CHAIN
  workshop:    { sector:'manufacturing', tier:1, name:'Workshop',    icon:'🔧', cost:6000,  inputs:[{id:'wood',qty:3},{id:'iron',qty:1}], outputs:[{id:'hammer',qty:2}], labor:5, upkeep:150 },
  factory:     { sector:'manufacturing', tier:2, name:'Factory',     icon:'🏭', cost:30000, inputs:[{id:'steel',qty:2},{id:'wood',qty:3}], outputs:[{id:'sword',qty:2},{id:'shield',qty:1}], labor:20, upkeep:1000 },
  ind_plant:   { sector:'manufacturing', tier:3, name:'Indust Plant',icon:'🏗️', cost:100000,inputs:[{id:'steel',qty:3},{id:'copper',qty:2}], outputs:[{id:'crossbow',qty:1},{id:'plate',qty:1}], labor:40, upkeep:3000 },
  robotics:    { sector:'manufacturing', tier:4, name:'Robotics',    icon:'🤖', cost:500000,inputs:[{id:'steel',qty:5},{id:'gold_ingot',qty:2}], outputs:[{id:'enchanted_blade',qty:1}], labor:60, upkeep:10000 },

  // ENERGY CHAIN
  wind_farm:   { sector:'energy', tier:1, name:'Wind Farm',  icon:'🌬️', cost:10000, inputs:[], outputs:[{id:'coal',qty:0,energy:10}], labor:3, upkeep:100 },
  power_plant: { sector:'energy', tier:2, name:'Power Plant',icon:'⚡', cost:40000, inputs:[{id:'coal',qty:5}], outputs:[{id:'coal',qty:0,energy:30}], labor:10, upkeep:1200 },
  grid:        { sector:'energy', tier:3, name:'Grid Station',icon:'🔌',cost:120000,inputs:[], outputs:[{id:'coal',qty:0,energy:80}], labor:15, upkeep:3000 },
  fusion:      { sector:'energy', tier:4, name:'Fusion Plant',icon:'☀️',cost:800000,inputs:[{id:'platinum',qty:2}], outputs:[{id:'coal',qty:0,energy:200}], labor:50, upkeep:20000 },
}

// Instance
facility = {
  id: 'fac_001',
  type: 'farm',
  cityId: 12,
  owner: 'auto'|'player'|companyName,
  level: 1,          // 1-5, affects output multiplier
  efficiency: 1.0,   // 0-1, affected by labor, morale, energy
  stock: 10000,      // total shares for public facilities
  availableStock: 4000,
  laborHired: 5,
  upgradeCost: 0,
  built: day
}
```

### Mechanics — Auto-Management
1. Every game day (every 3 ticks):
   - **Buy inputs**: Check city market for required inputs, auto-buy at market price
   - **Produce**: Convert inputs to outputs (qty × level × efficiency)
   - **Sell outputs**: List on city market, increase supply
   - **Pay upkeep**: Deduct from facility treasury
   - **Pay labor**: Deduct wages (labor × 50g/day)
2. Facility treasury = gold accumulated from sales
3. If treasury < 0 for 3 consecutive days → facility shuts down (efficiency=0)
4. Facility efficiency affected by:
   - Energy availability (from energy facilities in same country)
   - City stability
   - Labor morale (if player-owned)
5. Energy flows through country grid:
   - Total energy produced in country - total consumed = surplus/deficit
   - Deficit → all facilities in country lose 20% efficiency

### Mechanics — Player Intervention
1. **Stock Market Buy-In**:
   - Every facility has 10000 shares, 4000 publicly available
   - Player can buy shares like regular companies
   - At 51% ownership → player gains control:
     - Can set production targets
     - Can upgrade facility (cost gold, increases level)
     - Can change labor allocation
     - Receives 51% of profits as dividend
   - AI traders also buy facility stocks

2. **Direct Management** (if player-owned company):
   - Build new facility: select type, pay cost, assign to city
   - Upgrade: pay upgradeCost, level +1, output ×1.3
   - Shut down / restart: manual control
   - Sell facility: liquidate for 50% of total invested

3. **Hostile Takeover Prevention**:
   - If player buys aggressively (>10%/day), facility owner can do stock buyback
   - AI companies fight back by buying their own shares

### UI
- **New modal: "Production"** — shows all facilities in current city
- Each facility card: icon + name + tier badge + production rate + efficiency bar + stock %
- Player-owned: green border + "Manage" button
- Public: "Buy Stock" button with % ownership shown
- **New modal: "Supply Chain"** — tree view of all production chains
- **Map overlay toggle**: shows facility icons on cities (🌾🏭⛏️⚡)

---

## FEATURE 3: MAP VISUAL OVERHAUL

### Data
```
MAP_VISUAL = {
  cityRings: true,       // colored ring around city (size = type)
  facilityIcons: true,   // show facility icons near city name
  roadWidth: true,       // road thickness = trade volume
  territoryBlend: true,  // country colors blend at borders
  elevation: true,       // subtle hillshade on terrain
  minimapDetail: true    // terrain + cities + player on minimap
}
```

### Mechanics
1. **City rings**: size derived from city type, color from country, pulsing if player present
2. **Facility icons**: show 1-3 small icons below city name representing top facilities
3. **Road thickness**: base width + (total trade volume / 10000) px
4. **Territory blend**: radial gradient at country borders instead of hard lines
5. **Hillshade**: apply lightening/darkening based on elevation (terEle array)
6. **Minimap**: already has terrain colors, add city size differentiation

### UI
- All changes are render-only, no gameplay impact
- Performance: cache facility icons per city, redraw only on change

---

## FEATURE 4: PRODUCTION CHAIN VIEWER

### Data
```
CHAINS = {
  agriculture:    [farm, mill, food_plant, biotech_lab],
  mining:         [mine, smelter, refinery, adv_material],
  manufacturing:  [workshop, factory, ind_plant, robotics],
  energy:         [wind_farm, power_plant, grid, fusion]
}
```

### Mechanics
1. Tree view showing each chain from tier 1→4
2. Each node shows: icon + name + tier + input→output arrows
3. Color-coded by sector (green=agriculture, brown=mining, blue=manufacturing, yellow=energy)
4. Facilities player owns highlighted in gold
5. Click on node → show details (location, efficiency, stock price)

### UI
- New modal: "Supply Chains" accessible from Production tab
- Horizontal tree layout (fits mobile better than vertical)
- Collapsible per sector

---

## FEATURE 5: ENERGY GRID SYSTEM

### Data
```
country.energyProduced = 0    // sum of all energy facility output
country.energyConsumed = 0    // sum of all non-energy facility consumption
country.energySurplus = 0     // produced - consumed
country.powerOutages = false  // true if deficit
```

### Mechanics
1. Calculated per-country each game day
2. Energy facilities produce energy units (not physical goods)
3. All other facilities consume energy
4. Surplus → stored as "energy buffer" (max 3 days)
5. Deficit → facilities lose efficiency proportionally
6. Player can build energy facilities to fix deficits → profit opportunity

### Decay
- Energy facilities degrade: lose 0.5% efficiency/day without maintenance
- Maintenance cost: level × 500g/day

---

## FEATURE 6: CITY POPULATION DYNAMICS

### Data
```
city.popGrowth = 0         // daily growth rate
city.foodSupply = 0        // days of food available
city.employment = 0        // % of pop employed by facilities
city.migration = 0         // net migration (in/out)
```

### Mechanics
1. **Growth**: base +0.3%/day, modified by:
   - Food supply (0-2× multiplier based on food goods in city market)
   - Employment (+0.1% per facility in city)
   - Stability (0.5-1.5× multiplier)
   - War (-2%/day if at war)
2. **Migration**: pops move from low-employment to high-employment cities
3. **City type upgrades**: automatic when pop crosses threshold
4. **Degradation**: pop declines if food<3 days or stability<20

### UI
- City modal: population bar with growth rate indicator (+/-%)
- Map: cities growing have green ↑ arrow, shrinking have red ↓

---

## IMPLEMENTATION ORDER (6 phases)

### F1: Data Layer + Save/Load Migration
- FACILITY_TYPES catalog
- CITY_TYPES catalog
- Add `city.type`, `city.facilities[]`, `city.popGrowth`
- Add `country.energyProduced/Consumed/Surplus`
- Save version bump to 6, migration for v5 saves

### F2: City Type System
- Derive type from population
- Visual differentiation (rings, building count/color)
- Population growth dynamics
- City type upgrades

### F3: Production Facilities
- Facility instances per city
- Auto-management loop (buy inputs, produce, sell outputs, pay upkeep)
- Facility treasury + shutdown logic

### F4: Energy Grid
- Energy production/consumption per country
- Efficiency penalty for deficits
- Energy facility degradation (decay)

### F5: Player Intervention
- Stock market for facilities
- 51% takeover → control
- Direct management (build, upgrade, shutdown)
- Dividend system

### F6: Map Visual Overhaul + Supply Chain Viewer
- City rings, facility icons, road thickness
- Territory blend, hillshade
- Supply chain modal
- Minimap city size differentiation

---

## SAVE/LOAD COMPATIBILITY

```
saveVersion: 6  (was 5)

Migration v5→v6:
- Add city.type = deriveFromPop(city.pop)
- Add city.facilities = []
- Add city.popGrowth = 0
- Add country.energyProduced = 0
- Add country.energyConsumed = 0
- Add country.facilities = []

Defaults for new fields ensure backward compatibility.
```

---

## ESTIMATES

- New JS lines: ~400
- New catalog entries: 16 facilities × 10 fields each = 160 lines
- File growth: 73KB → ~110KB
- Render changes: 30 lines
- New modals: 2 (Production, Supply Chains)
