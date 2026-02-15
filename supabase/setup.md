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

De frontend is al gekoppeld op basis van:

1. Open de website
2. Klik op **Data uploaden**
3. Vul `SUPABASE_URL` en `SUPABASE_ANON_KEY` in
4. Upload Excel met kolommen:
   - Value stream
   - Markt
   - Week (`YYYY.WW`, bijvoorbeeld `2026.06`)
   - PAG
   - MAG
   - AG
   - Project
   - Requested quantity
   - Delivered
5. Na upload wordt Fillrate direct uit Supabase geladen in:
   - view per value stream
   - view per markt

## 5) Security baseline (aanbevolen)

Voor deze MVP staat upload open voor iedereen met de anon key (RLS policies in schema).
Voor productie: voeg authenticatie toe en maak policies restrictiever.
