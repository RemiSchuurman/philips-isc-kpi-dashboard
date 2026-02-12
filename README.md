# Philips ISC PH KPI Dashboard (starter)

Eerste statische MVP van een Daily Management KPI Dashboard, geschikt voor deploy op Vercel.

## Inhoud

- `index.html`: de dashboard pagina
- `style.css`: styling
- `script.js`: data + interactie (value stream selectie en inklapbare KPI-blokken)
- `vercel.json`: basis Vercel configuratie
- `supabase/schema.sql`: SQL startpunt voor database
- `supabase/setup.md`: Supabase setup instructies

## Lokaal starten

Open `index.html` direct in je browser, of run een simpele lokale server.

Voorbeeld met Node:

```bash
npx serve .
```

## GitHub nieuw project aanmaken en pushen

Run dit in deze map (`c:\Users\conta\Desktop\dashboard`):

```bash
git init
git add .
git commit -m "Initial MVP: Philips ISC PH KPI dashboard"
```

### Optie A - via GitHub CLI (`gh`)

```bash
gh repo create philips-isc-kpi-dashboard --public --source=. --remote=origin --push
```

### Optie B - handmatig via GitHub website

1. Maak een lege repo aan in GitHub (zonder README).
2. Koppel remote en push:

```bash
git remote add origin https://github.com/<jouw-gebruiker>/philips-isc-kpi-dashboard.git
git branch -M main
git push -u origin main
```

## Deploy naar Vercel

### Via Vercel dashboard

1. Ga naar vercel.com en klik **Add New... > Project**.
2. Selecteer je GitHub repo.
3. Framework preset: **Other** (of auto-detect).
4. Build command: leeg laten.
5. Output directory: leeg laten.
6. Deploy.

### Via Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## Volgende stap

Bij volgende iteratie koppelen we deze KPI data aan Supabase tabellen zodat updates per week en value stream vanuit database geladen worden.
