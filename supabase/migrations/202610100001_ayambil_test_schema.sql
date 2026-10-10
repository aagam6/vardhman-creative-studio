begin;
create schema ayambil_private;
revoke all on schema ayambil_private from public, anon, authenticated;

create table public.ayambil_test_settings (
  singleton boolean primary key default true check (singleton),
  registration_open boolean not null default false
);
insert into public.ayambil_test_settings default values;
create table public.ayambil_test_admins (
  user_id uuid primary key references auth.users(id),
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.ayambil_test_sessions (
  event_date date primary key check (event_date in ('2026-11-02','2026-11-03')),
  snapshot jsonb not null
);
insert into public.ayambil_test_sessions values
 ('2026-11-02','{"date":"2026-11-02","label":"2 November 2026","time":"8:00 PM IST","performer":"Manan Sanghvi","programme":"એક શામ દાદા ઋષભ કે નામ","venue":"Shri Chandramauleshwar Hall","address":"Smruti Villa, Narayan Nagar, Ahmedabad, Gujarat."}'),
 ('2026-11-03','{"date":"2026-11-03","label":"3 November 2026","time":"8:00 PM IST","performer":"Sairam Dave","programme":"મારી મા... મારો પ્રાણ","venue":"Tagore Hall","address":"Opposite Sanskar Kendra Museum, Pritam Rai Cross Road, Kocharab, Paldi, Ahmedabad, Gujarat – 380006."}');
create table public.ayambil_test_bookings (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  request_hash text not null unique check (request_hash ~ '^[a-f0-9]{64}$'),
  payload_hash text not null,
  contact_name text not null check (length(contact_name) between 2 and 120),
  mobile text not null check (mobile ~ '^\+[1-9][0-9]{7,14}$'),
  event_date date not null references public.ayambil_test_sessions,
  status text not null default 'active' check (status in ('active','cancelled')),
  whatsapp_consent boolean not null check (whatsapp_consent),
  consent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(id,event_date)
);
create table public.ayambil_test_attendees (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.ayambil_test_bookings,
  full_name text not null check (length(full_name) between 2 and 120),
  status text not null default 'active' check (status in ('active','cancelled')),
  ordinal integer not null,
  created_at timestamptz not null default now(),
  unique(id,booking_id), unique(booking_id,ordinal)
);
create table public.ayambil_test_registrations (
  attendee_id uuid primary key,
  booking_id uuid not null,
  event_date date not null,
  foreign key(attendee_id,booking_id) references public.ayambil_test_attendees(id,booking_id),
  foreign key(booking_id,event_date) references public.ayambil_test_bookings(id,event_date)
);
create table public.ayambil_test_passes (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid not null references public.ayambil_test_attendees,
  number text not null unique,
  snapshot jsonb not null,
  status text not null default 'active' check(status in ('active','cancelled','superseded')),
  created_at timestamptz not null default now()
);
create unique index ayambil_test_current_pass on public.ayambil_test_passes(attendee_id) where status <> 'superseded';
create table public.ayambil_test_messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.ayambil_test_bookings,
  status text not null default 'queued' check(status in ('queued','sending','accepted','sent','delivered','read','failed','uncertain','cancelled')),
  provider_ref text,
  failure text,
  history jsonb not null default '[]',
  attempts integer not null default 0,
  attempt_id uuid,
  attempted_at timestamptz,
  accepted_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);
create table ayambil_private.downloads (
  pass_id uuid primary key references public.ayambil_test_passes,
  token_hash text not null unique,
  -- Raw access key is server-only, needed by the approved messaging worker.
  token text not null,
  expires_at timestamptz not null default now() + interval '7 days'
);
create table public.ayambil_test_audit (
  id uuid primary key default gen_random_uuid(),
  actor uuid not null references public.ayambil_test_admins,
  booking_id uuid not null references public.ayambil_test_bookings,
  action text not null,
  created_at timestamptz not null default now()
);
create table ayambil_private.rate_limits (
  bucket text primary key, started_at timestamptz not null default now(), attempts integer not null
);

-- Deny all direct browser access, including authenticated ordinary users/admins.
-- Reviewed RPCs are executable by service_role ONLY; Edge Functions check auth.
do $$ declare t text; begin
  foreach t in array array['settings','admins','sessions','bookings','attendees','registrations','passes','messages','audit'] loop
    execute format('alter table public.%I enable row level security', 'ayambil_test_'||t);
    execute format('create policy ayambil_test_deny_browser on public.%I as restrictive for all to anon, authenticated using (false) with check (false)', 'ayambil_test_'||t);
    execute format('revoke all on public.%I from public, anon, authenticated', 'ayambil_test_'||t);
    execute format('grant all on public.%I to service_role', 'ayambil_test_'||t);
  end loop;
end $$;
alter table ayambil_private.downloads enable row level security;
alter table ayambil_private.rate_limits enable row level security;
create policy deny_browser on ayambil_private.downloads as restrictive for all to anon,authenticated using(false) with check(false);
create policy deny_browser on ayambil_private.rate_limits as restrictive for all to anon,authenticated using(false) with check(false);
revoke all on all tables in schema ayambil_private from public, anon, authenticated;
commit;
