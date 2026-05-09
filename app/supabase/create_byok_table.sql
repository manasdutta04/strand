-- Run this in your Supabase SQL editor to create the `byok` table
create table if not exists public.byok (
  wallet text primary key,
  provider text,
  api_key text,
  base_url text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists byok_updated_at_idx on public.byok(updated_at desc);

-- Note: current app route uses Supabase service-role key server-side,
-- and wallet-signed verification in `app/src/app/api/byok/route.ts`.
-- If you later move to direct client Supabase access, add RLS + policies.