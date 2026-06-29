# SPEC: Nexus Dominion v2 — Expansion Design Document

## SDD (Spec-Driven Development)
Espec escrita ANTES da implementacao. Cada feature abaixo tem:
- Estrutura de dados
- Mecanica de gameplay
- Integracao com sistemas existentes
- UI necessaria

---

## 1. RIVAL AI SYSTEM

### Data
```
rivals[] = cada company ganha:
  aiState: { aggression: 0-1, cashReserve: 0-1, expansionPriority, lastActionTick }
```

### Behavior (executa a cada 5 game days)
1. **Expandir**: Se cash > 50000 e tem < 4 cidades, expande para cidade aleatoria no mesmo pais
2. **Investir**: Se cash > 100000, compra acoes de outra empresa
3. **Vender**: Se portfolio caiu >20%, vende metade
4. **Contratar Mercenarios**: Se jogador controla cidade no pais da rival, contrata 1 unidade
5. **Aceitar Missoes**: 30% chance de aceitar missao disponivel
6. **Atacar**: Se aggression > 0.7, envia mercenarios para cidade do jogador

### UI
- Empresas rivais agora tem status (expandindo, investindo, hostil)
- Indicador visual no mapa: cidades com presenca rival tem anel vermelho

---

## 2. COMPANY UPGRADES

### Data
```
playerCompany.upgrades = {
  rnd:        { level: 0-5, baseCost: 15000 },
  marketing:  { level: 0-5, baseCost: 12000 },
  security:   { level: 0-5, baseCost: 18000 },
  logistics:  { level: 0-5, baseCost: 10000 },
  finance:    { level: 0-5, baseCost: 20000 }
}
```

### Effects (por level)
| Upgrade     | Effect                                     |
|-------------|--------------------------------------------|
| R&D         | Revenue * (1 + level * 0.15)               |
| Marketing   | Expansion cost -level*10%                  |
| Security    | Block espionage missions level*20% chance  |
| Logistics   | Mission success +level*8%                  |
| Finance     | Stock buy/sell cost -level*5% fee          |

### Cost Formula
`cost = baseCost * (level + 1) * 1.5`

### UI
- Nova tab "Upgrades" no modal Companies
- Progress bars + botoes de upgrade

---

## 3. WORLD EVENTS

### Data
```
activeEvents[] = { id, type, target, effectDesc, startDay, duration, modifiers }
```

### Event Types
| Type             | Effect                                      | Duration |
|------------------|---------------------------------------------|----------|
| economic_boom    | +25% stock prices no pais                   | 5 days   |
| recession        | -20% revenue, -15% stock                    | 5 days   |
| corporate_scandal| Empresa alvo perde 40% stock                | 3 days   |
| natural_disaster | Cidade perde 40 stability, -30% GDP          | 1 day    |
| golden_age       | +10% todas stocks global                    | 7 days   |
| war_tensions     | Mercenarios 2x efetivos no pais             | 8 days   |
| market_crash     | -30% todas stocks global                    | 3 days   |
| tech_breakthrough| +50% R&D efetivo global                     | 5 days   |

### Trigger
A cada 8-12 game days, 1 evento aleatorio dispara.
Max 3 eventos ativos simultaneos.

### UI
- News ticker mostra eventos ativos
- Indicadores visuais no mapa (icones de evento nas cidades/paises)

---

## 4. LOAN SYSTEM

### Data
```
playerLoans[] = { id, principal, interestRate, remaining, dailyPayment }
creditRating: 0-100 (afeta interest rate disponivel)
```

### Mechanics
- Emprestimos de $10K a $500K
- Juros: 8-25% baseado no credit rating
- Pagamento diario automatico
- Default = credit rating cai, nao pode pedir mais emprestimo por 30 dias

### UI
- Nova secao no modal Dashboard
- Slider de quanto pedir emprestado
- Tabela de emprestimos ativos com pagamentos restantes

---

## 5. TAX SYSTEM

### Data
```
country.taxRate: 15-40 (% aplicado na receita diaria)
country.taxPaid: acumulado pago pelo jogador
```

### Mechanics
- Todo dia: `tax = revenue * taxRate / 100`
- Lobby: gasta $X para reduzir taxa em Y% por Z dias
- Cost do lobby: `20000 + 5000 * (taxRate - 15)`

### UI
- Coluna "Tax Rate" no modal Politics
- Botao "Lobby Government" com custo

---

## 6. EMPLOYEE MORALE

### Data
```
playerCompany.morale: 0-100
playerCompany.salaryLevel: 'low' | 'medium' | 'high'
```

### Effects
- Morale afeta revenue: multiplo de 0.5 a 1.5
- Salary level afeta:
  - Low:  -5 morale/dia, custo 0
  - Medium: +1 morale/dia, custo $2000/employee/dia
  - High:  +4 morale/dia, custo $5000/employee/dia
- City stability afeta morale (-0.5/dia se < 30 stability)

### UI
- Dashboard mostra morale com barra colorida
- Botoes para mudar salary level

---

## 7. NEWS TICKER

### Data
```
newsFeed[] = { day, headline, importance: 1-3, category }
```

### Sources
- World events geram headlines
- Player actions (takeover, rebellion) geram headlines
- Rival actions geram headlines

### UI
- Barra no topo (entre topBar e canvas) com texto rolando
- Pausa no hover

---

## 8. ACHIEVEMENTS

### Data
```
achievements[] = { id, name, desc, unlocked, unlockedDay }
```

### List
| ID              | Name                  | Condition                        |
|-----------------|-----------------------|----------------------------------|
| first_million   | First Million         | Net worth >= 1M                  |
| takeover_1      | Corporate Raider      | First hostile takeover           |
| city_5          | Urban Planner         | Operate in 5 cities              |
| city_10         | Metro Mogul           | Operate in 10 cities             |
| country_control | Puppet Master         | Control a country (>60% cities)  |
| stock_100k      | Wall Street Wolf      | Portfolio value > 100K           |
| stock_1m        | Market Whale          | Portfolio value > 1M             |
| merc_5          | Private Army          | 5 mercenary units                |
| mission_10      | Contract Killer       | Complete 10 missions             |
| rank_kingpin    | Shadow Director       | Reach Shadow Director rank       |
| loan_free       | Debt Free             | Pay off all loans                |
| all_upgrades    | Full Stack            | All upgrades at level 3+         |

### UI
- Toast notification quando desbloqueia
- Nova tab "Achievements" no menu

---

## 9. MAP ENHANCEMENTS

### Visual
- Cidades do jogador: anel dourado pulsante
- Cidades com rebelião ativa: icone de fogo/chama
- Cidades com evento: icone do evento
- Paises dominados: cor do territorio muda para dourado
- Conexoes entre cidades com trafego (linhas mais grossas = mais comercio)

### Interaction
- Tooltip ao passar o mouse na cidade (info rapida)
- Mini-mapa no canto (overview de todos paises)

---

## 10. COMPANY SECTORS

### Data
```
playerCompany.sector: 'finance' | 'tech' | 'military' | 'logistics' | 'general'
```

### Bonuses
| Sector    | Bonus                                          |
|-----------|-------------------------------------------------|
| Finance   | +25% stock trading profit, -10% loan interest  |
| Tech      | +30% R&D effectiveness, -20% upgrade cost       |
| Military  | -30% mercenary cost, +20% rebellion chance      |
| Logistics | +40% mission success, -20% expansion cost       |
| General   | +10% everything (balanced)                      |

### UI
- Escolha no inicio do jogo (modal de criacao de empresa)
- Mostrado no Dashboard

---

## SAVE/LOAD COMPATIBILITY

Manter compatibilidade com saves v1:
- Novos campos tem defaults
- Versao no save: `saveVersion: 2`
- Migracao automatica na carga

---

## IMPLEMENTATION ORDER

1. Estruturas de dados + save/load v2
2. Rival AI
3. Company Upgrades
4. Loan System + Tax System
5. Employee Morale
6. World Events
7. News Ticker
8. Achievements
9. Map Visual Enhancements
10. Company Sectors (startup modal)

---

## FILE SIZE ESTIMATE

Original: ~55KB, 1400 linhas JS
Expanded: ~90KB, 2400 linhas JS
