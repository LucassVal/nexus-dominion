# ARCHITECTURE: Nexus Dominion v4 — DDD Living World

## Domain-Driven Design (DDD)

### Layer Architecture
```
┌─────────────────────────────────────────┐
│  PRESENTATION LAYER                     │
│  Canvas renderer, UI modals, HUD, DOM  │
├─────────────────────────────────────────┤
│  APPLICATION LAYER                      │
│  GameLoop, SaveManager, EventBus,       │
│  Use Cases (Trade, Combat, Travel)      │
├─────────────────────────────────────────┤
│  DOMAIN LAYER                           │
│  Entities, Value Objects, Aggregates,   │
│  Domain Events, Domain Services         │
├─────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                   │
│  localStorage, AudioContext, Canvas API │
│  TerrainGenerator, Pathfinder (A*)      │
└─────────────────────────────────────────┘
```

---

## BOUNDED CONTEXTS (8)

### 1. WORLD CONTEXT
**Aggregate Root**: WorldMap
```
WorldMap
  ├── TerrainGrid[60][45] — tile types, elevation
  ├── ResourceNode[] — farms, mines, forests, ports
  ├── Road[] — connections between cities
  └── City[] (refs Economy, Politics)
```

**Domain Events**: TerrainGenerated, ResourceDepleted, RoadDamaged

### 2. ECONOMY CONTEXT
**Aggregate Root**: Market (per city)
```
Market
  ├── Good[] — 110+ product types in 12 categories
  ├── PriceHistory — time series per good
  ├── SupplyChain — production → consumption model
  └── Shop[] — weaponShop, armorShop, magicShop, generalStore, blackMarket
```

**Categories**: Food(15), Materials(12), Metals(10), Weapons(12), Armor(10), Magic(12), Alchemy(10), Tools(8), Luxury(10), Books(8), Exotic(8), Transport(5)

**Domain Events**: PriceChanged, GoodTraded, ShopRestocked, GoodSpoiled

### 3. POLITICS CONTEXT
**Aggregate Root**: Nation
```
Nation
  ├── Government — type, policies, stability
  ├── Diplomacy — relations, alliances, sanctions, tradeAgreements
  ├── Army[] — units, deployments, battles
  ├── Faction[] — internal politics, influence
  └── Investment[] — foreign investment, bonds, infrastructure
```

**Diplomacy Types**: Alliance, NonAggression, TradeAgreement, Sanction, War, Vassalage
**Domain Events**: WarDeclared, TreatySigned, SanctionImposed, InvestmentMade, CoupAttempted

### 4. PLAYER CONTEXT
**Aggregate Root**: PlayerCharacter
```
PlayerCharacter
  ├── Identity — name, role, reputation{}, bounty
  ├── VitalStats — HP, maxHP, level, XP, skillPoints
  ├── Skills — trading, combat, leadership, stealth, diplomacy, crafting
  ├── Equipment — weapon, armor, accessory (with durability)
  ├── Inventory — goods[], items[], capacity
  ├── Wallet — gold, investments[], privateCompanies[]
  ├── Caravan — capacity, guards, goods[]
  └── Position — x, y, path[], moving, speedMod
```

**Domain Events**: LevelUp, ItemEquipped, ItemBroken, GoldEarned, BountyPlaced

### 5. COMBAT CONTEXT
**Aggregate Root**: Battle
```
Battle
  ├── Combatant[] — player, enemies, allies
  ├── TurnManager — initiative order
  ├── DamageCalculator — ATK/DEF/crit formula
  ├── LootTable — per enemy type
  └── BattleLog — message history
```

**Domain Events**: AttackLanded, CritHit, EnemyDefeated, PlayerFled, PlayerDied

### 6. TRANSPORT CONTEXT
**Aggregate Root**: TransportNetwork
```
TransportNetwork
  ├── TrainRoute[] — between major cities (>100K pop)
  ├── ShipRoute[] — between port cities (coastal tiles)
  ├── Caravan — player-owned, flexible routing
  ├── Schedule — departure times, cost, travel duration
  └── PublicTransport — trains/ships NPCs can use
```

**Domain Events**: JourneyStarted, ArrivedAtDestination, Ambushed, RouteDamaged

### 7. FINANCE CONTEXT
**Aggregate Root**: StockExchange
```
StockExchange
  ├── PublicCompany[] — listed companies, shares, price history
  ├── PrivateCompany[] — player-founded, not traded
  ├── Portfolio — player's stock holdings
  ├── IPO — process to take company public
  └── Bond[] — government/corporate bonds
```

**Domain Events**: StockPriceChanged, TakeoverCompleted, DividendPaid, IPOListed, CompanyFounded

### 8. DECAY/ENTROPY CONTEXT
```
DecaySystem (Domain Service, no aggregate — runs on all contexts)
  ├── ItemDurability — weapons/armor lose durability on use
  ├── FoodSpoilage — perishable goods rot after N days
  ├── RoadCondition — roads degrade without maintenance
  ├── BuildingMaintenance — city buildings need repairs
  └── MarketStaleness — unsold goods lose value
```

**Domain Events**: ItemBroken, FoodRotted, RoadCollapsed, BuildingCrumbled

---

## DATA FLOW

```
User Input (click, keypress)
  → Application Layer (use case)
    → Domain Layer (entity method → domain event)
      → Infrastructure (persist)
    → Presentation Layer (re-render)
```

### Example: BuyGood Use Case
```
1. User clicks "Buy Grain x5" in Market modal
2. Application: TradeUseCase.buy('grain', 5)
3. Domain: Player.wallet.debit(cost)
4. Domain: Player.inventory.add('grain', 5)
5. Domain: City.market.removeSupply('grain', 5)
6. Domain Event: GoodTraded { good:'grain', qty:5, city:'Goldcrest', price:12 }
7. Infrastructure: mark dirty for save
8. Presentation: updateUI(), re-render market modal
```

---

## DECAY MECHANICS

| System        | Decay Rate            | Consequence                        |
|---------------|-----------------------|------------------------------------|
| Weapon dura   | -1 per combat round   | At 0 = breaks, -50% ATK            |
| Armor dura    | -1 per hit taken      | At 0 = breaks, -50% DEF            |
| Food spoilage | 5-15 days shelf life  | Rots, becomes worthless            |
| Roads         | -0.5% condition/day   | Below 50% = speed penalty          |
| Buildings     | -0.2% condition/day   | Below 30% = city stability penalty |
| Market goods  | -1% value/day unsold  | Overstocked goods lose value       |

---

## TESTING HARNESS

```
tests/
  ├── test_domain.js     — Pure domain logic (no DOM/Canvas)
  ├── test_combat.js     — Combat formulas, turn logic
  ├── test_economy.js    — Price dynamics, supply/demand
  ├── test_decay.js      — Decay calculations
  ├── test_diplomacy.js  — War/peace logic
  └── test_save.js       — Serialization round-trip
```

Approach: Unit tests run in browser console or via Node.js with jsdom.
Each test: Arrange → Act → Assert pattern.

---

## QUALITY GATE

Quality gate script (Python) runs:
1. HTML validation (tag matching, structure check)
2. CSS lint (duplicate rules, invalid properties)
3. JS syntax check (via Node or quick parse)
4. File size check (< 200KB)
5. Save/load round-trip test

---

## FILE STRUCTURE (single HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <meta...>
  <style>/* CSS */</style>
</head>
<body>
  <!-- DOM structure -->
  <canvas id="mapCanvas">
  <div id="ui">...</div>

  <script>
  // ═══ DOMAIN LAYER ═══
  // World Context
  // Economy Context  
  // Politics Context
  // Player Context
  // Combat Context
  // Transport Context
  // Finance Context
  // Decay System

  // ═══ APPLICATION LAYER ═══
  // GameLoop, SaveManager, EventBus
  // UseCases: Trade, Combat, Travel, Diplomacy, etc.

  // ═══ INFRASTRUCTURE LAYER ═══
  // CanvasRenderer, AudioEngine, Pathfinder
  // TerrainGenerator, localStorage

  // ═══ PRESENTATION LAYER ═══
  // UIManager, ModalRenderer, HUD

  // ═══ INIT ═══
  // window.onload = start
  </script>
</body>
</html>
```

---

## ESTIMATES

- Lines of code: 2800-3200
- File size: 140-170KB
- 110+ goods defined in data arrays
- 8 bounded contexts
- 6 decay systems
- 15+ test cases
