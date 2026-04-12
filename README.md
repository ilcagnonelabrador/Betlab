# ⚽ GoalRadar

**Rilevatore di probabilità gol in tempo reale** — analizza le statistiche live delle partite di calcio e segnala quando un gol è imminente, con analisi AI integrata.

---

## 🚀 Deploy rapido su Vercel (consigliato)

### 1. Carica su GitHub

```bash
# Nella cartella del progetto
git init
git add .
git commit -m "Initial commit - GoalRadar"

# Crea un nuovo repo su github.com, poi:
git remote add origin https://github.com/TUO_USERNAME/goalradar.git
git branch -M main
git push -u origin main
```

### 2. Deploy su Vercel

1. Vai su [vercel.com](https://vercel.com) → **New Project**
2. Importa il repo GitHub appena creato
3. Nella sezione **Environment Variables** aggiungi:
   - `ANTHROPIC_API_KEY` → la tua chiave da [console.anthropic.com](https://console.anthropic.com)
   - `FOOTBALL_API_KEY` → *(opzionale)* da [api-football.com](https://www.api-football.com)
4. Clicca **Deploy** — il sito sarà online in ~1 minuto!

---

## 🛠 Sviluppo locale

```bash
# Installa dipendenze
npm install

# Copia il file di configurazione
cp .env.local.example .env.local
# → Modifica .env.local con le tue chiavi API

# Avvia il server di sviluppo
npm run dev
# → Apri http://localhost:3000
```

---

## 🔑 API Keys necessarie

### Anthropic (obbligatoria per analisi AI)
1. Vai su [console.anthropic.com](https://console.anthropic.com)
2. Crea un account → **API Keys** → **Create Key**
3. Incolla in `ANTHROPIC_API_KEY`

### API-Football (opzionale — per dati reali)
1. Vai su [api-football.com](https://www.api-football.com)
2. Piano Free: **100 richieste/giorno** (sufficiente per test)
3. Incolla in `FOOTBALL_API_KEY`

> **Senza API-Football** l'app funziona in **modalità demo** con 5 partite simulate che si aggiornano in tempo reale.

---

## 📊 Come funziona l'algoritmo

Il **Goal Probability Score** (0–100%) si calcola così:

| Indicatore             | Peso max |
|------------------------|----------|
| Tiri in porta          | +30 pts  |
| Attacchi pericolosi    | +20 pts  |
| Sbilancio possesso     | +10 pts  |
| Calci d'angolo         | +15 pts  |
| Momentum (gol recente) | +25 pts  |
| Pressione temporale    | +10 pts  |

### Soglie di allerta
| Colore  | Range   | Significato         |
|---------|---------|---------------------|
| 🔴 Rosso | 75–100% | Pericolo imminente  |
| 🟡 Giallo | 50–74%  | Alta tensione        |
| 🔵 Blu   | 25–49%  | Da monitorare        |
| 🟢 Verde | 0–24%   | Situazione calma     |

---

## 📁 Struttura progetto

```
goalradar/
├── pages/
│   ├── index.js          # Pagina principale
│   └── api/
│       ├── matches.js    # Endpoint dati partite
│       └── analyze.js    # Endpoint analisi AI (Claude)
├── components/
│   ├── MatchCard.js      # Card partita con stats
│   ├── GaugeMeter.js     # Indicatore SVG circolare
│   └── StatBar.js        # Barre statistiche
├── lib/
│   └── matches.js        # Logica algoritmo + fetch API
├── styles/
│   └── globals.css       # Stili globali
└── .env.local.example    # Template variabili d'ambiente
```

---

## 🌐 Alternative al deploy

### Netlify
```bash
npm run build
# Trascina la cartella `.next` su netlify.com/drop
```

### Railway / Render
- Supportano Next.js nativamente
- Stessa configurazione delle env vars di Vercel

---

## 📝 Note
- I dati reali vengono aggiornati ogni **30 secondi**
- In modalità demo le statistiche vengono simulate ogni **7 secondi**
- L'analisi AI usa il modello `claude-sonnet-4-20250514`
