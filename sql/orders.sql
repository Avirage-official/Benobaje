-- Run this once in Supabase → SQL Editor to create the table the checkout
-- and webhook functions read/write. Uses the service role key server-side
-- only (api/**), so RLS can stay locked down — nothing here is queried
-- from the browser with the anon key.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  external_ref text unique not null,       -- our own id, e.g. tyco_xxxxxxxx
  product_id text not null,
  variant_code text,
  quantity int not null default 1,
  currency text not null,
  amount_minor int not null,               -- charge amount in minor units (cents)
  customer jsonb not null,                 -- { email, firstName, lastName, phone }
  shipping jsonb not null,                 -- { address1, address2, city, region, postcode, countryCode }
  revolut_order_id text,
  revolut_status text default 'pending_payment',
  merchize_order_id text,
  merchize_status text,
  tracking_number text,
  tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_revolut_order_id_idx on orders (revolut_order_id);
create index if not exists orders_merchize_order_id_idx on orders (merchize_order_id);

alter table orders enable row level security;
-- No policies added: with RLS on and no policies, only the service role
-- key (used server-side in lib/supabase.js) can read/write this table.
-- The anon/public key — if you ever add one to a browser context — will
-- get nothing back, by design.
