# Supabase setup instructies

## 1) Project aanmaken

1. Ga naar https://supabase.com
2. Klik **New project**
3. Kies organization, projectnaam en sterk database password
4. Wacht tot project klaar is

## 2) Database schema uitvoeren

1. Open in Supabase: **SQL Editor**
2. Kopieer inhoud van `supabase/schema.sql`
3. Klik **Run**

## 3) API keys ophalen

In **Project Settings > API**:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- (later server-side) `SUPABASE_SERVICE_ROLE_KEY` (niet in frontend gebruiken)

## 4) (Later) frontend koppelen

Als we van static mock data naar live data gaan:

1. Voeg `@supabase/supabase-js` toe
2. Gebruik `SUPABASE_URL` en `SUPABASE_ANON_KEY` via env vars
3. Query flow:
   - value streams ophalen
   - laatste weekly update per stream ophalen
   - KPI entries + notes laden

## 5) Security baseline (aanbevolen)

Zet Row Level Security aan zodra we user login toevoegen. Voor nu (MVP) kan read-only zonder auth voor demo-data, maar productie moet met policies.
