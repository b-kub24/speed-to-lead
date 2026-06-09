-- LeadFlash: Speed-to-Lead Instant Follow-Up
-- Run this SQL in your Supabase SQL Editor to create all tables

-- Enable UUID extension (usually enabled by default)
create extension if not exists "pgcrypto";

-- ============================================
-- CLIENTS TABLE
-- ============================================
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_email text not null,
  owner_phone text not null,
  twilio_phone_number text not null,
  brand_voice_prompt text,
  business_hours jsonb default '{"monday":{"open":"09:00","close":"17:00"},"tuesday":{"open":"09:00","close":"17:00"},"wednesday":{"open":"09:00","close":"17:00"},"thursday":{"open":"09:00","close":"17:00"},"friday":{"open":"09:00","close":"17:00"},"saturday":null,"sunday":null}'::jsonb,
  booking_link text,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- LEAD SOURCES TABLE
-- ============================================
create table public.lead_sources (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  source_type text not null check (source_type in ('webform','fb_leadads','google_lead','crm_webhook','manual')),
  webhook_secret text not null,
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- LEADS TABLE
-- ============================================
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  source_id uuid references public.lead_sources(id) on delete set null,
  prospect_name text,
  prospect_phone text,
  prospect_email text,
  inquiry_text text,
  raw_payload jsonb,
  received_at timestamptz default now(),
  first_sms_sent_at timestamptz,
  first_email_sent_at timestamptz,
  time_to_contact_seconds integer,
  status text default 'new' check (status in ('new','contacted','replied','booked','dead'))
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  channel text not null check (channel in ('sms','email')),
  direction text not null check (direction in ('outbound','inbound')),
  body text not null,
  twilio_sid text,
  sent_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_lead_sources_client on public.lead_sources(client_id);
create index idx_leads_client on public.leads(client_id);
create index idx_leads_source on public.leads(source_id);
create index idx_leads_status on public.leads(status);
create index idx_leads_received on public.leads(received_at desc);
create index idx_messages_lead on public.messages(lead_id);
create index idx_messages_sent on public.messages(sent_at desc);

-- ============================================
-- ROW LEVEL SECURITY (optional, enable per-table)
-- ============================================
alter table public.clients enable row level security;
alter table public.lead_sources enable row level security;
alter table public.leads enable row level security;
alter table public.messages enable row level security;

-- Service role bypass — API routes use service role key
create policy "Service role full access on clients"
  on public.clients for all
  using (true)
  with check (true);

create policy "Service role full access on lead_sources"
  on public.lead_sources for all
  using (true)
  with check (true);

create policy "Service role full access on leads"
  on public.leads for all
  using (true)
  with check (true);

create policy "Service role full access on messages"
  on public.messages for all
  using (true)
  with check (true);
