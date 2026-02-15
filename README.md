# Philips ISC PH KPI Dashboard

MVP van een Daily Management KPI Dashboard (Vercel-ready) met:

- dashboard per value stream
- dashboard per markt
- Fillrate berekening vanuit Supabase data
- Excel upload flow in de frontend

## Inhoud

- `index.html`: de dashboard pagina
- `style.css`: styling
- `script.js`: dashboard logica, Supabase koppeling en Excel upload flow
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

## Supabase + Excel upload

1. Maak een Supabase project.
2. Run `supabase/schema.sql` in SQL Editor.
3. Open de website en klik **Data uploaden**.
4. Vul `SUPABASE_URL` en `SUPABASE_ANON_KEY` in.
5. Upload een Excel-bestand met kolommen:
   - `Value stream`
   - `Markt`
   - `Week` (format `YYYY.WW`, bv `2026.06`)
   - `PAG`
   - `MAG`
   - `AG`
   - `Project`
   - `Requested quantity`
   - `Delivered`

Fillrate wordt berekend als:

`sum(Delivered) / sum(Requested quantity) * 100`
