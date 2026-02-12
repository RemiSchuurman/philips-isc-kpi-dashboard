-- Philips ISC PH KPI Dashboard - starter schema
-- Run dit script in Supabase SQL Editor.

create table if not exists value_streams (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists weekly_updates (
  id bigint generated always as identity primary key,
  value_stream_id bigint not null references value_streams(id) on delete cascade,
  week_label text not null, -- bijvoorbeeld: Week 6 - 2026
  created_at timestamptz not null default now()
);

create table if not exists kpi_groups (
  id bigint generated always as identity primary key,
  code text not null unique,
  display_name text not null
);

create table if not exists kpi_entries (
  id bigint generated always as identity primary key,
  weekly_update_id bigint not null references weekly_updates(id) on delete cascade,
  kpi_group_id bigint not null references kpi_groups(id),
  metric_label text not null,
  metric_value text not null,
  status text not null check (status in ('green', 'yellow', 'red')),
  sort_order int not null default 0
);

create table if not exists update_notes (
  id bigint generated always as identity primary key,
  weekly_update_id bigint not null references weekly_updates(id) on delete cascade,
  note_type text not null check (note_type in ('highlight', 'lowlight', 'help')),
  note_text text not null,
  sort_order int not null default 0
);

-- Seed value streams
insert into value_streams(name) values
  ('Shaving'),
  ('Power toothbrush'),
  ('IPL')
on conflict (name) do nothing;

-- Seed KPI groups
insert into kpi_groups(code, display_name) values
  ('fillrate', 'Fillrate'),
  ('unconstrained_demand_fulfillment', 'Unconstrained demand fulfillment'),
  ('usp_csp', 'USP-CSP'),
  ('safety_stock_fulfillment', 'Safety stock fulfillment'),
  ('uvap', 'UVAP'),
  ('ottr', 'OTTR')
on conflict (code) do nothing;
