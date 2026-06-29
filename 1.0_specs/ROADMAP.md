# ROADMAP — Nexus Dominion v5.7 Living World Empire

## STATUS: v5.7 ✅ Production Empire Complete

### ✅ CORE SYSTEMS (v5.0-v5.7)

```
MAP:          60×45 tiles, 5 biomes, 6 countries, 24 cities
TERRAIN:      Value noise generation, biome blending, beach strips
DECORATIONS:  Trees, rocks, water animation
BACKGROUND:   Starfield parallax, border glow, vignette, day/night
```

```
ENTITIES:     Player, Bandits (10), AI Traders (6), Armies (per country)
PLAYER:       5 roles (Merchant, Warrior, Mercenary, CEO, Wanderer)
              Race system (Human, Elf, Dwarf, Orc) with bonuses
              Skills: trading, combat, leadership, stealth, diplomacy
              Level 1-20, XP from combat/missions, skill points
```

```
ECONOMY:      110+ goods catalog (15 categories)
              Dynamic pricing (supply/demand × 0.003 + jitter)
              Trade (buy/sell in cities), caravan system
              Food spoilage, durability decay
              Loans (15% interest, daily payments)
```

```
COMBAT:       Turn-based modal, attack/defend/flee
              6 enemy types + bounty hunters
              Status effects (poison/bleed/stun)
              Equipment (weapon/armor/accessory) with durability
              Role-specific abilities (5 unique)
```

```
POLITICS:     6 countries with governments/personalities
              Diplomacy (gift, embassy, alliance, trade, sanction)
              Country investments with ROI
              War declaration, army movement, city capture
              Peace treaties, passive relations
```

```
TRANSPORT:    Train routes (cities >150K pop), Ship routes (coastal)
              Fast travel between connected cities
```

### ✅ FACILITIES & CEO (v5.6)

```
13 FACILITIES:   🌾 Agri: Farm→Mill→Food Plant
                 ⛏️ Mine: Mine→Smelter→Refinery
                 🔧 Manu: Workshop→Factory
                 ⚡ Energy: Wind Farm→Power Plant
                 🍺 Services: Inn→Bar→Bank

BUILD:        Player builds facilities in cities (one per type)
UPGRADE:      Level 1→5, cost scales, +12% efficiency/level
REVENUE:      Services generate gold/day (Inn $8, Bar $15, Bank $30)
TECH TREE:    🔬 Modal viewer with all chains + revenue chart
```

```
CEO SYSTEM:   Found company with sector selection (10 sectors)
              Expand to other cities, IPO, hostile takeover
              Stock market (8 public companies)
              Portfolio tracking, buy/sell shares
```

### ✅ MOUNTS & TRANSPORT v2 (v5.7)

```
8 MOUNTS:     Mule ($300), Camel ($600), Horse ($800)
              War Horse ($2K), Wagon ($1.2K), Carriage ($5K)
              Griffin ($15K), Airship ($50K)

FEATURES:     Terrain-aware speed modifiers
              Durability system (decay + repair)
              Cargo bonuses (wagon/carriage/airship)
              Combat bonuses (War Horse +3 ATK/DEF)
              Flee bonus scaling with mount speed
              Flying mounts ignore terrain (pathfinding)
              Canvas-drawn mount visuals on map
              Mount shop with effective speed display
```

### ✅ VISUAL SYSTEMS (v5.7)

```
BACKGROUND:   Starfield (200 stars, parallax, flicker)
              Border glow (radial gradient spotlight)
              Vignette (dark edges)
              Day/night cycle (blue overlay at night)
              Weather effects (rain particles, fog overlay)

MAP:          Minimap Pro (6-layer: terrain, fog, cities, entities, player, frustum)
              City type rings (village→metro, sized by population)
              Building silhouettes per city
              Country-colored cities + war indicators
              Click marker (pulsing ring + crosshair)
              Player path (dashed line)

ENTITIES:     Player: gold triangle + glow + mount shape
              Bandits: red circle + white X
              Traders: green circle + gold $
              Armies: per-country shield shapes
              All Canvas-drawn (zero image assets)

TEXT:         Country names: bold white + black stroke (lineWidth=6)
              City names: bold 11px white + double-pass black outline
              100% readable on all terrain types

CONTROLS:     Zoom +/- buttons in HUD
              Mouse scroll zoom
              Minimap click to navigate
              Touch + mouse dual support
```

### ✅ UI/MODALS

```
12 MODALS:    Combat, City, Market, Inventory, Skills, Transport
              Diplomacy, Finance, Settings, Achievements
              Tech Tree, Profile, Found Company

FEATURES:     Search/filter in market, category tabs
              Save/load with 18 persisted fields
              Log overlay (last 10 messages)
              News ticker (world events)
              Notifications (toast-style)
              Eruda DevTools integration
              Log server (:8099) + console interceptor
```

### ✅ QUALITY

```
LINT:         Ruff 0 errors (Python)
              node --check pass (JavaScript)
              Braces balanced (verified)
              Gate guards: 13 functions protected

SIZE:         117KB, ~1370 lines, 108 functions
              Zero external assets (100% self-contained)
              Single HTML file

PLATFORMS:    Web (HTTP server :8100)
              Android (Termux, shared storage)
              Any modern browser
```

---

## ⏳ v6.0 ROADMAP (future)

### Combat Depth
- [ ] Weapon skill system (proficiency per weapon type)
- [ ] Spell casting (consume scrolls/books)
- [ ] Companion system (hire mercenaries)

### Economy Depth
- [ ] Supply chain bonuses (own all 3 facilities in a chain)
- [ ] Trade routes automation (assign caravan to auto-trade)
- [ ] City specialization (production focus, tax incentives)

### World Depth
- [ ] Faction reputation system
- [ ] Random dungeons (delves)
- [ ] Seasonal events (harvest festival, war season)

### Polish
- [ ] Sound effects for all actions
- [ ] Achievement notifications with animation
- [ ] Keyboard shortcuts reference card
- [ ] Tutorial/intro quest chain
