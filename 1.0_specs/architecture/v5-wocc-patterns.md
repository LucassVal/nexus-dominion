# ARCHITECTURE v5: Nexus Dominion — WoCC-Extracted Engine

## Source Analysis: World of ClaudeCraft (levy-street/world-of-claudecraft)
- 2,539 commits, 1.4K stars, 409 forks
- `src/main.ts`: 248KB entry point
- `src/sim/sim.ts`: 221KB simulation engine
- `src/sim/types.ts`: 82KB type definitions
- `src/render/`: visual engine directory
- `src/sim/`: deterministic simulation

---

## KEY EXTRACTIONS FOR NEXUS DOMINION

### 1. DETERMINISTIC PRNG (Extracted from WoCC rng.ts)
Replace all `Math.random()` with seeded Mulberry32 PRNG:
```javascript
// Seeded RNG - same seed = same world every time
function createRNG(seed) {
  let state = seed | 0;
  return {
    next() { state |= 0; state = state + 0x6D2B79F5 | 0; let t = Math.imul(state ^ state >>> 15, 1 | state); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; },
    nextInt(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; },
    pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  };
}
```
Impact: Same world every time. Reproducible gameplay. Deterministic testing.

### 2. ENTITY SYSTEM (Extracted from WoCC entity.ts)
Every game object inherits from a base Entity:
```
Entity { id, type, x, y, hp, maxHp, faction, level, flags }
  ├── PlayerEntity { class, talents, equipment[], inventory[], gold, xp }
  ├── MobEntity { family, abilities[], lootTable, aggroRange }
  ├── NpcEntity { dialogue, shopInventory, questGiver }
  ├── ItemEntity { itemId, quantity, owner }
  └── ProjectileEntity { source, target, speed, spellId }
```

### 3. VISUAL ENGINE (Extracted from WoCC render/)
WoCC uses a layered render pipeline:
1. **WorldRenderer**: terrain tiles, biome coloring, shadows
2. **EntityRenderer**: creature rigs, player models, spell effects
3. **UIRenderer**: HUD, tooltips, action bars, minimap
4. **WeatherRenderer**: biome-driven rain/snow/fog (render-only, not in sim)
5. **SpellIconRenderer**: canvas-drawn procedural spell icons
6. **AudioRenderer**: WebAudio procedural sound effects

Key Pattern: Render layer is completely separate from simulation. The sim produces state snapshots; the render layer reads them. This means visual effects (weather, particles) never affect game logic.

### 4. CHARACTER CREATION (Extracted from WoCC classes)
9 classes, each with:
- **Resource system**: Rage (Warrior), Energy (Rogue), Mana (Mage/Priest/etc)
- **Ability ranks**: Spells upgrade at specific levels (R2 at 8, R3 at 14, R4 at 20)
- **Talent trees**: 3 specs per class (27 total variants)
- **Equipment slots**: Head, Shoulders, Chest, Hands, Legs, Feet, Weapon, Off-hand, Rings, Trinkets

### 5. PROCEDURAL CONTENT GENERATION
- **Towns**: timber-framed, generated at runtime
- **Creatures**: rigged families with procedural variants
- **Spell icons**: painted on canvas at runtime (no image assets!)
- **Audio**: WebAudio synthesized (no audio files!)
- **Terrain**: procedurally generated with biome blending

### 6. SIM/RENDER SEPARATION (Architecture Pattern)
```
┌──────────────────────────────────────┐
│              SIM LAYER               │
│  (Pure logic, no DOM, no Canvas)     │
│  - Deterministic PRNG               │
│  - Entity updates                   │
│  - Combat resolution                │
│  - Quest state                      │
│  - Economy simulation               │
│  → Produces StateSnapshot           │
├──────────────────────────────────────┤
│           RENDER LAYER               │
│  (Canvas, DOM, Audio)               │
│  - WorldRenderer                    │
│  - EntityRenderer                   │
│  - UIRenderer                       │
│  - WeatherRenderer                  │
│  - AudioRenderer                    │
│  ← Consumes StateSnapshot           │
└──────────────────────────────────────┘
```

---

## DDD v5: REFINED BOUNDED CONTEXTS

### Context 1: World (Terrain, Cities, Resources)
- Deterministic terrain generation (seeded PRNG)
- Biome system with weather (render-only weather)
- Resource nodes (mines, farms, forests)

### Context 2: Entity (Player, Mobs, NPCs)
- Base Entity with common properties
- PlayerEntity with class, equipment, talents
- MobEntity with family, abilities, loot
- NpcEntity with dialogue, shops, quests

### Context 3: Combat (Turn-based, Threat, Abilities)
- Attack/defend/flee actions
- Ability system with cooldowns
- Threat table for PvE
- Crit/dodge/block rolls (deterministic PRNG)

### Context 4: Economy (Goods, Trade, Markets)
- 110+ goods catalog (already built)
- Dynamic pricing per city
- Supply/demand simulation
- Caravan and transport system

### Context 5: Politics (Countries, Diplomacy, Wars)
- Country AI with personality types
- Diplomatic relations
- Army movement and warfare
- Investment and bonds

### Context 6: Progression (Levels, Skills, Talents)
- Level-up system with XP
- Skill trees (5 skills: trading, combat, leadership, stealth, diplomacy)
- Equipment progression
- Achievement tracking

---

## KISS PRINCIPLES APPLIED

### What to SIMPLIFY:
1. **One PRNG for everything** → seeded Mulberry32, not Math.random
2. **Entity system**: flat objects, not deep inheritance
3. **Combat**: turn-based modal, not real-time
4. **Trade**: simple supply/demand formula, not complex economic model
5. **UI**: modal-based, not complex SPA framework
6. **Save**: single JSON blob to localStorage

### What to DROP (80/20 Pareto):
1. ❌ Real-time combat → Keep turn-based modal
2. ❌ Multiplayer networking → Keep offline single-player
3. ❌ 3D rendering → Keep 2D Canvas
4. ❌ RL agent training → Out of scope
5. ❌ Web3/Solana integration → Out of scope
6. ❌ 21 locale translations → Keep English
7. ❌ Dungeon/raid instances → Future feature

### What to FOCUS ON (20% effort, 80% impact):
1. ✅ Deterministic world generation → Every game unique but reproducible
2. ✅ Procedural terrain with biomes → Beautiful maps
3. ✅ Class/role system → Replayability
4. ✅ Turn-based combat with abilities → Engaging gameplay
5. ✅ Dynamic economy → Living world feel
6. ✅ Country AI with wars → Emergent storytelling
7. ✅ Canvas-drawn spell/item icons → Zero external assets
8. ✅ WebAudio procedural sounds → Zero audio files

---

## TESTING HARNESS v5

### Unit Tests (domain logic, no DOM)
```javascript
// test_rng.js
function testRNGDeterminism() {
  const rng1 = createRNG(42), rng2 = createRNG(42);
  for (let i = 0; i < 100; i++) {
    assert(rng1.next() === rng2.next(), 'RNG not deterministic');
  }
}

// test_terrain.js
function testTerrainReproducibility() {
  const terrain1 = genTerrain(42), terrain2 = genTerrain(42);
  assert(deepEqual(terrain1, terrain2), 'Terrain not reproducible');
}

// test_combat.js
function testCombatFormula() {
  // Fixed RNG for deterministic test
  const rng = createRNG(12345);
  const result = resolveCombat({atk:10,def:5}, {atk:8,def:3}, rng);
  assert(result.damage >= 1, 'Min damage violated');
  assert(result.damage <= 20, 'Max damage exceeded');
}

// test_economy.js
function testPriceConvergence() {
  // Buy lots → price rises. Sell lots → price drops.
  const market = createMarket();
  const initialPrice = market.getPrice('grain');
  market.buy('grain', 100);
  assert(market.getPrice('grain') > initialPrice, 'Price should rise on demand');
}

// test_save_roundtrip.js
function testSaveRoundtrip() {
  const original = createGameState();
  const saved = JSON.stringify(original);
  const loaded = JSON.parse(saved);
  assert(deepEqual(original, loaded), 'Save/load not symmetric');
}
```

### Integration Tests (full game tick)
```javascript
function testGameTickDeterminism() {
  const g1 = startGame('warrior', 42);
  const g2 = startGame('warrior', 42);
  for (let i = 0; i < 100; i++) { gameTick(g1); gameTick(g2); }
  assert(g1.day === g2.day, 'Day diverged');
  assert(g1.player.gold === g2.player.gold, 'Gold diverged');
}
```

---

## IMPLEMENTATION PRIORITY (Pareto: 80/20)

### Phase A: Seeded PRNG (2 hours)
- Replace all Math.random with createRNG(seed)
- Deterministic terrain, world gen, combat, loot
- Impact: Reproducible worlds, testable gameplay

### Phase B: Entity System Refactor (3 hours)
- Extract Entity base from player/bandit/mob
- Standardize HP, ATK, DEF, faction, level
- Impact: Cleaner code, easier to add new entities

### Phase C: Procedural Content (4 hours)
- Canvas-drawn item icons (simple shapes + colors)
- Procedural town generation (timber-framed style)
- Creature variants from base families
- Impact: Zero external assets, unique every game

### Phase D: Visual Polish (3 hours)
- Biome weather (rain/snow/fog overlay)
- Particle effects (spell impacts, gold drops)
- Smooth entity movement (lerp interpolation)
- Day/night cycle (ambient color shift)
- Impact: Massive visual improvement

### Phase E: Testing Harness (2 hours)
- Unit tests for RNG, terrain, combat, economy
- Integration test for game tick determinism
- Save/load roundtrip test
- Quality gate expansion
