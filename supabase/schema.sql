-- Philips ISC PH KPI Dashboard - Fillrate data model
-- Run dit script in Supabase SQL Editor.

create table if not exists fillrate_rows (
  id bigint generated always as identity primary key,
  value_stream text not null,
  market text not null,
  week_label text not null, -- format: YYYY.WW, bijvoorbeeld 2026.06
  pag text not null,
  mag text not null,
  ag text not null,
  project text not null,
  requested_quantity numeric(14, 2) not null check (requested_quantity > 0),
  delivered numeric(14, 2) not null check (delivered >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_fillrate_business_key
  on fillrate_rows (value_stream, market, week_label, pag, mag, ag, project);

create index if not exists ix_fillrate_week on fillrate_rows (week_label);
create index if not exists ix_fillrate_stream on fillrate_rows (value_stream);
create index if not exists ix_fillrate_market on fillrate_rows (market);

create or replace function set_fillrate_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_fillrate_updated_at on fillrate_rows;
create trigger trg_fillrate_updated_at
before update on fillrate_rows
for each row
execute function set_fillrate_updated_at();

alter table fillrate_rows enable row level security;

-- MVP: open dashboard + open upload (iedereen met anon key mag lezen/schrijven)
drop policy if exists "fillrate_rows_select_all" on fillrate_rows;
create policy "fillrate_rows_select_all"
on fillrate_rows
for select
to anon
using (true);

drop policy if exists "fillrate_rows_insert_all" on fillrate_rows;
create policy "fillrate_rows_insert_all"
on fillrate_rows
for insert
to anon
with check (true);

create table if not exists kpi_actions (
  id bigint generated always as identity primary key,
  value_stream text not null,
  kpi_name text not null,
  issue_nr int not null check (issue_nr > 0),
  concern text not null default '',
  cause text not null default '',
  countermeasure text not null default '',
  deadline date null,
  owner text not null default '',
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_kpi_actions_business_key
  on kpi_actions (value_stream, kpi_name, issue_nr);

create index if not exists ix_kpi_actions_scope
  on kpi_actions (value_stream, kpi_name, status);

create or replace function set_kpi_actions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_kpi_actions_updated_at on kpi_actions;
create trigger trg_kpi_actions_updated_at
before update on kpi_actions
for each row
execute function set_kpi_actions_updated_at();

alter table kpi_actions enable row level security;

drop policy if exists "kpi_actions_select_all" on kpi_actions;
create policy "kpi_actions_select_all"
on kpi_actions
for select
to anon
using (true);

drop policy if exists "kpi_actions_insert_all" on kpi_actions;
create policy "kpi_actions_insert_all"
on kpi_actions
for insert
to anon
with check (true);

drop policy if exists "kpi_actions_update_all" on kpi_actions;
create policy "kpi_actions_update_all"
on kpi_actions
for update
to anon
using (true)
with check (true);

create table if not exists dashboard_notes (
  id bigint generated always as identity primary key,
  scope_type text not null check (scope_type in ('stream', 'market')),
  scope_name text not null,
  note_type text not null check (note_type in ('highlight', 'lowlight', 'help')),
  content text not null default '',
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_dashboard_notes_scope
  on dashboard_notes (scope_type, scope_name, note_type);

alter table dashboard_notes enable row level security;

drop policy if exists "dashboard_notes_select_all" on dashboard_notes;
create policy "dashboard_notes_select_all"
on dashboard_notes
for select
to anon
using (true);

drop policy if exists "dashboard_notes_insert_all" on dashboard_notes;
create policy "dashboard_notes_insert_all"
on dashboard_notes
for insert
to anon
with check (true);

drop policy if exists "dashboard_notes_update_all" on dashboard_notes;
create policy "dashboard_notes_update_all"
on dashboard_notes
for update
to anon
using (true)
with check (true);

drop policy if exists "fillrate_rows_update_all" on fillrate_rows;
create policy "fillrate_rows_update_all"
on fillrate_rows
for update
to anon
using (true)
with check (true);
