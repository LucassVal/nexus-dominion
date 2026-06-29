# SPEC: Nexus Dominion v3 — Living World Sandbox

## SDD (Spec-Driven Development)
Espec escrita ANTES da implementacao.

---

## PARTE A: ESTADO ATUAL (v2 Implementado)

### A1. ARQUITETURA BASE
- Single HTML file (~67KB, 903 linhas)
- Canvas API para mapa 2D com pan/zoom
- CSS Grid/Flexbox para UI corporativa
- Web Audio API para sons
- localStorage para save/load

### A2. SISTEMAS IMPLEMENTADOS

#### Mapa
- 6 paises, 24 cidades, posicoes procedural
- Territorios coloridos, conexoes entre cidades
- Pan (drag) e zoom (scroll)
- Mini-mapa no canto inferior direito
- Tooltip hover nas cidades
- Particulas flutuantes nas cidades do jogador

#### Player (CEO Mode)
- Empresa propria com nome gerado
- Expansao para cidades (custo varia por populacao)
- 5 setores: Finance (+25% stock), Tech (+30% R&D), Military (-30% merc cost), Logistics (+40% mission), General (+10% tudo)
- 5 upgrades: R&D Lab, Marketing, Security, Logistics, Finance (5 niveis cada)
- Employee morale (0-100, afeta receita, salario low/medium/high)
- 8 ranks de Nobody ate Global Puppeteer

#### Stock Market
- 8 empresas rivais com precos dinamicos
- Compra/venda de acoes
- Historico de precos (30 ticks)
- Hostile takeover (>50% ownership + premium pago)
- Portfolio tracking com P&L

#### Rival AI
- Expansao para cidades (cada 5 dias)
- Compra/venda de acoes
- Contrata mercenarios se ameacado
- Vende acoes em queda >20%

#### Missoes
- 8 tipos: Cargo, Market Manipulation, Espionage, Political Donation, Sabotage, Logistics Contract, Mercenary Escort, Tax Evasion
- Aceitar/completar com chance de sucesso baseada em risco + upgrades + sector
- Recompensa em cash + influencia

#### Mercenarios
- Contratar unidades com nome e forca
- Deploy em cidades para reduzir estabilidade
- Rebeliao: stability < 15% → chance de tomar cidade
- Controlar 60%+ das cidades = dominar pais

#### Economia
- Emprestimos com juros e credit rating
- Taxas por pais com lobby governamental
- Receita diaria baseada em cidades operadas

#### Eventos Mundiais
- 8 tipos: boom, recessao, escandalo, desastre, golden age, guerra, crash, breakthrough
- Afetam stock prices, estabilidade, receita

#### UI
- Barra superior: cash, portfolio, loans, data, net worth, rank
- Painel lateral com 8 abas + New Game
- News ticker rolando
- Log bar
- Achievements (12, com popups)
- Modal system para todas as abas

#### Audio
- Ticks de stock, alertas, sucesso/fracasso, compra, ambient hum

### A3. LIMITACOES ATUAIS
- Player eh sempre CEO, nao pode escolher outro caminho
- Mapa sem terreno (apenas grid + territorios)
- Sem movimento do player no mapa
- Sem combate direto
- Paises sao estaticos (nao guerreiam entre si)
- Sem sistema de trade/comercio entre cidades
- Sem bandidos ou perigos no mapa
- Rivais AI limitados (so empresas, nao personagens)

---

## PARTE B: v3 — LIVING WORLD SANDBOX

### B1. VISAO GERAL
Transformar de "corporate dashboard simulator" para "living world sandbox RPG/strategy".
Player escolhe seu caminho: comerciante, guerreiro, mercenario, soldado, CEO, ou wanderer.
Paises sao organismos vivos que guerreiam, comerciam, evoluem.
Mapa ganha terreno, recursos, estradas, e perigos.

### B2. PLAYER IDENTITY

#### Roles (escolha no inicio)
| Role        | Icon | Bonus                                      | Start With            |
|-------------|------|--------------------------------------------|-----------------------|
| Merchant    | 🐪   | +30% trade profit, extra caravan capacity  | Caravan (50 cap), 500 gold |
| Warrior     | ⚔️   | +25% combat, +15% HP                      | Sword (+10 atk), 200 gold  |
| Mercenary   | 🛡️   | -30% hire cost, reputation bonus          | 3 free mercs, 300 gold     |
| CEO         | 🏢   | Current corporate bonuses                  | Company + 100K cash        |
| Wanderer    | 🎒   | +10% all skills, versatile                | Nothing, 100 gold          |

#### Player Stats
```
player = {
  name, role, gold, x, y,  // position on world map
  health: 100, maxHealth: 100,
  attack: 5, defense: 3, speed: 10,
  level: 1, experience: 0, skillPoints: 0,
  skills: { trading:1, combat:1, leadership:1, stealth:1, diplomacy:1 },
  inventory: [{ itemId, qty }],
  equipment: { weapon: null, armor: null, accessory: null },
  caravan: { capacity: 50, goods: [], guards: 0 },  // only if has caravan
  units: [],  // followers/mercs [{name, hp, atk, def, cost/day}]
  reputation: {},  // { countryName: -100..100, faction: -100..100 }
  path: [],  // waypoints for movement
  moving: false, speedMod: 1.0,
  goldSpent: 0, enemiesDefeated: 0, citiesVisited: 0, caravansRaided: 0
}
```

#### Player Movement
- Click no mapa → player caminha ate o ponto
- Velocidade afetada por terreno: plains 1x, forest 0.7x, mountain 0.4x, desert 0.8x
- Estradas: 1.5x speed
- Tempo passa durante viagem (ticks avancam mais rapido)
- Encontros aleatorios durante viagem (bandidos, mercadores, eventos)

#### Equipment
```
equipmentDB = [
  { id:'rusty_sword', name:'Rusty Sword', slot:'weapon', atk:3, cost:50 },
  { id:'iron_sword', name:'Iron Sword', slot:'weapon', atk:7, cost:200 },
  { id:'steel_blade', name:'Steel Blade', slot:'weapon', atk:12, cost:500 },
  { id:'legendary_sword', name:'Legendary Sword', slot:'weapon', atk:20, cost:2000 },
  { id:'leather_armor', name:'Leather Armor', slot:'armor', def:3, cost:80 },
  { id:'chainmail', name:'Chainmail', slot:'armor', def:7, cost:300 },
  { id:'plate_armor', name:'Plate Armor', slot:'armor', def:12, cost:800 },
  { id:'lucky_charm', name:'Lucky Charm', slot:'accessory', bonus:'+10% trade', cost:150 },
  { id:'war_medal', name:'War Medal', slot:'accessory', bonus:'+15% combat', cost:200 },
]
```

### B3. TERRAIN MAP

#### Tile System
- Mundo: 2400 x 1800 pixels
- Grid de tiles: 60 x 45 tiles (40px cada)
- Tipos de terreno:
  - WATER (0): inavegavel, azul escuro
  - PLAINS (1): verde claro, speed 1x, produz grain
  - FOREST (2): verde escuro, speed 0.7x, produz wood
  - MOUNTAIN (3): cinza, speed 0.4x, produz iron/gems
  - DESERT (4): bege, speed 0.8x, produz spice
  - ROAD (5): marrom sobre outro terreno, speed 1.5x

#### Geracao Procedural
- Algoritmo: value noise simples (grid random + interpolacao)
- Water: elevacao < 0.3 (20% do mapa, bordas)
- Mountain: elevacao > 0.75 (15%)
- Forest: elevacao 0.5-0.75 (20%)
- Desert: latitude media + elevacao 0.3-0.45 (15%)
- Plains: resto (30%)
- Roads: conectam cidades do mesmo pais (pathfinding A* evitando water/mountain)

#### Recursos no Mapa
- Mines (⛏): produzem iron/gems, +income para cidade proxima
- Farms (🌾): produzem grain, +food
- Lumber mills (🪓): produzem wood
- Ports (⚓): produzem fish, conectam cidades costeiras

#### Renderizacao (ordem de camadas)
1. Fundo do oceano (azul escuro)
2. Tiles de terreno (water, plains, forest, mountain, desert)
3. Roads (linhas marrom sobre terreno)
4. Recursos (icones pequenos)
5. Cidades (circulos com nome)
6. Exercitos/bandidos (icones moveis)
7. Player (triangulo direcional com glow)
8. Efeitos (particulas, clima)
9. Fog of war (opcional, areas nao visitadas)

### B4. LIVING COUNTRIES (Organismos Vivos)

#### AI Loop (cada 3-5 game days)
1. **Economia**: produz goods baseado em recursos, consome baseado em populacao
2. **Diplomacia**: avalia vizinhos, declara guerra/peace, forma aliancas
3. **Militar**: recruta exercitos, move para fronteiras, ataca inimigos
4. **Comercio**: estabelece rotas comerciais com paises amigos
5. **Politica interna**: facoes disputam poder, afeta estabilidade

#### Army System
```
army = {
  id, countryName,
  size: 100-5000,  // numero de soldados
  attack, defense, morale,
  x, y,  // posicao atual
  targetX, targetY,  // destino
  orders: 'patrol' | 'attack_city' | 'defend' | 'invade',
  targetCountry: null
}
```

#### War System
- Pais em guerra: exercitos se movem para cidades inimigas
- Batalha: size comparison + randomness + terrain bonus
- Vencedor ocupa/libera cidade
- Guerra termina quando: peace treaty (50%+ cities capturadas ou gold exhaustion)
- Player pode: juntar-se a um exercito, lutar como mercenario, ou ficar neutro

#### Dynamic Population
- Crescimento: +0.5% por dia base, +food bonus, -war penalty
- Cidades sitiadas perdem populacao
- Fome se food supply < consumo

#### Factions
```
faction = {
  name: 'Nobles' | 'Merchants' | 'Military' | 'Peasants' | 'Clergy',
  power: 0-100,
  loyalty: 0-100,  // to current government
  demands: 'lower_taxes' | 'war' | 'peace' | 'trade'
}
```

### B5. TRADE SYSTEM

#### Goods Database
```
goodsDB = [
  { id:'grain',  name:'Grain',   price:10,  wt:1, cat:'food' },
  { id:'fish',   name:'Fish',    price:12,  wt:1, cat:'food' },
  { id:'wood',   name:'Timber',  price:15,  wt:2, cat:'material' },
  { id:'iron',   name:'Iron',    price:35,  wt:3, cat:'material' },
  { id:'spice',  name:'Spices',  price:60,  wt:1, cat:'luxury' },
  { id:'gems',   name:'Gems',    price:120, wt:1, cat:'luxury' },
  { id:'wine',   name:'Wine',    price:40,  wt:2, cat:'luxury' },
  { id:'cloth',  name:'Cloth',   price:25,  wt:1, cat:'material' },
  { id:'weapons',name:'Weapons', price:80,  wt:4, cat:'military' },
  { id:'medicine',name:'Medicine',price:45,wt:1, cat:'special' },
  { id:'relics', name:'Relics',  price:200, wt:1, cat:'special' },
]
```

#### Dynamic Pricing
- Cada cidade tem supply/demand para cada good
- Preco = basePrice * (1 + demandRating - supplyRating)
- Supply baseado em recursos no raio da cidade
- Demand baseado em populacao e tipo de cidade
- Precos atualizam a cada 2 game days
- Player influencia precos comprando/vendendo grandes quantidades

#### City Markets
- Ao entrar na cidade: ve tabela de precos
- Comprar: adiciona ao inventory/caravan
- Vender: remove do inventory, recebe gold
- Capacidade: inventory 30 slots, caravan 50+ slots
- Trade skill bonus: +skill*2% profit per transaction

#### Caravan Management
- Comprar caravan: 500 gold no mercado da cidade
- Upgrade capacity: +25 slots por 300 gold
- Contratar guards: 10 gold/dia por guard, reduz chance de bandit attack
- Velocidade da caravan: 0.7x player speed

#### AI Traders
- 5-10 AI merchants viajando entre cidades
- Compran low, vendem high
- Player pode atacar AI merchants (pirataria/banditry)
- AI merchants tem guards, podem revidar

### B6. COMBAT SYSTEM

#### Modal de Combate (popup)
```
┌──────────────────────────────────┐
│  ⚔️ COMBAT                      │
│                                  │
│  You (HP: 85/100)  vs  Bandit (HP: 40/60) │
│  [████████░░]          [██████░░░░]       │
│                                  │
│  Your turn:                      │
│  [⚔️ Attack] [🛡️ Defend]       │
│  [🏃 Flee]    [🎒 Use Item]     │
│                                  │
│  Combat log:                     │
│  > You hit Bandit for 12 damage  │
│  > Bandit attacks for 5 damage   │
└──────────────────────────────────┘
```

#### Combat Formula
```
playerAttack = (player.attack + weapon.atk) * (1 + player.skills.combat * 0.05)
playerDefense = (player.defense + armor.def) * (1 + player.skills.combat * 0.03)
enemyAttack = enemy.baseAtk + random(-3, 3)
enemyDefense = enemy.baseDef + random(-2, 2)

damage = max(1, attacker.attack - defender.defense + random(-3, 5))
critChance = 0.1 + player.skills.combat * 0.02
critDamage = damage * 1.8
```

#### Enemy Types
| Enemy       | HP  | ATK | DEF | Loot          | Locations        |
|-------------|-----|-----|-----|---------------|------------------|
| Bandit      | 40  | 8   | 3   | 30-80 gold    | Roads, forests   |
| Raider      | 70  | 12  | 6   | 100-200 gold  | Mountains, desert|
| Wolf Pack   | 50  | 10  | 2   | Pelts (15g)   | Forests          |
| Mercenary   | 90  | 14  | 8   | Equipment     | Anywhere (rare)  |
| Army Scout  | 60  | 11  | 7   | Intel         | Borders          |
| Army Soldier| 100 | 16  | 10  | 200-400 gold  | War zones        |
| Boss        | 200 | 20  | 15  | 500-1000 gold | Special events   |

#### Army Combat (player joins)
- Player pode se alistar no exercito de um pais
- Ganha gold/dia como soldado
- Batalhas maiores: player luta ondas de inimigos
- Sobreviveu = promotion, bonus gold
- Morreu = game over (ou重伤 com gold penalty)

#### PvE (Player vs Environment)
- Bandidos spawnam em tiles sem estrada longe de cidades
- Respawn a cada 5 dias
- Dificuldade escala com player level
- Loot table baseada no tipo de inimigo

#### Crime System
- Player pode atacar caravanas de AI merchants
- Player pode saquear cidades (se exercito forte o suficiente)
- Crime gera bounty: pais coloca recompensa pela cabeca do player
- Bounty hunters aparecem para cacar o player
- Reputation drops com o pais afetado

### B7. CITY INTERACTION

#### Ao entrar na cidade (modal expandido)
```
┌──────────────────────────────────────┐
│  🏙️ Goldcrest, Aurelia              │
│  Pop: 245K | Stab: 72% | Tax: 18%   │
├──────────────────────────────────────┤
│  [🏪 Market]  Buy/sell goods         │
│  [🍺 Tavern]   Missions, rumors      │
│  [⚔️ Barracks] Recruit, join army   │
│  [🏦 Bank]     Loans, deposit        │
│  [🏥 Healer]   Restore health (cost) │
│  [🏛️ Gov]      Politics, lobby      │
│  [🚶 Leave]    Exit city             │
└──────────────────────────────────────┘
```

### B8. STOCK MARKET (Legacy, opcional)
- Acessivel via Bank nas cidades grandes
- Funciona como v2 mas eh side-activity
- CEOs tem acesso direto, outros precisam visitar cidade com bolsa

### B9. UI REDESIGN

#### Top Bar
```
[Player Name] [❤️ HP] [⭐ Lvl] [💰 Gold] [📅 Date] [🎒 Inventory] [🗺️ Pos]
```

#### Bottom HUD
```
[Quick Slots: ⚔️Attack 🛡️Defend 🏃Travel 🏕️Camp]
```

#### Side Panel (contextual)
- Muda baseado na role e no que esta acontecendo
- Merchant: trade prices, caravan status
- Warrior: combat stats, enemies nearby
- Mercenary: active contracts, unit status

#### Map Changes
- Terreno colorido (tiles)
- Player icon (triangulo) com rastro
- Army icons (escudos com bandeira do pais)
- Bandit icons (caveiras vermelhas)
- City icons com indicadores: market (💰), quest (❗), war (⚔️)
- Roads visiveis

### B10. SAVE/LOAD v3

```
saveData = {
  version: 3,
  player: { ... },
  countries: [ ... ],  // com armies, factions, tradeRoutes
  terrain: [ ... ],    // tile types (60x45 = 2700 bytes)
  aiTraders: [ ... ],
  bandits: [ ... ],
  day, worldSeed, activeEvents, achievements, logs, news
}
```

---

## IMPLEMENTATION ORDER

### Fase 1: Fundacao (arquivos: terrain + player movement)
1. Terrain generation (noise-based procedural map)
2. Terrain rendering no canvas
3. Road generation (A* pathfinding entre cidades do mesmo pais)
4. Player icon no mapa + movement (click-to-move)
5. Speed affected by terrain
6. Resource nodes no mapa

### Fase 2: Player Identity
7. Role selection screen (redesign do sector modal)
8. Player stats + inventory system
9. Equipment system
10. Level up + skills
11. Top bar redesign
12. Save/load v3 migration

### Fase 3: Trade & Economy
13. Goods database
14. Dynamic pricing per city (supply/demand)
15. City market modal
16. Buy/sell with inventory
17. Caravan system (buy, upgrade, hire guards)
18. AI traders roaming

### Fase 4: Combat
19. Combat modal popup
20. Enemy types + spawn system
21. Turn-based combat logic
22. Loot + experience from combat
23. Crime/bounty system
24. Army joining + larger battles

### Fase 5: Living Countries
25. Country AI loop (economy, diplomacy, military)
26. Army creation and movement
27. War declaration and resolution
28. Dynamic population and stability
29. Factions system

### Fase 6: Polish
30. Weather effects (rain overlay)
31. Day/night cycle visual
32. Enhanced particles
33. Sound effects for new systems
34. Achievement expansion
35. News ticker expansion

---

## ESTIMATIVA DE TAMANHO

- v2 atual: ~67KB, 903 linhas
- v3 estimado: ~150KB, 2500+ linhas
- Terrain data (60x45 tiles): ~3KB em JSON
- Maior arquivo, mas ainda single-file viável

---

## NOTAS TECNICAS

- Terrain noise: usar algoritmo simples (grid de pontos aleatorios com interpolacao cosenoidal)
- Pathfinding: A* adaptado para grid com custos por terreno
- Render performance: cachear terrain em offscreen canvas, redraw so quando camera move
- Save size: terrain array 60x45 = 2700 numeros = ~8KB em JSON
