-- HUSTLE: схема базы. Выполните целиком в Supabase: SQL Editor -> New query -> Run.

-- 1. Проект пользователя (один проект на аккаунт)
create table if not exists public.projects (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null check (octet_length(data::text) < 8000000),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
drop policy if exists projects_own on public.projects;
create policy projects_own on public.projects
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 2. Тариф пользователя (читать можно только свой, менять — только вы вручную или платёжная система)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Счётчик запросов к помощнику ИИ (доступен только серверной функции)
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  n int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;

create or replace function public.ai_take(p_user uuid, p_limit int) returns boolean
language plpgsql security definer set search_path = '' as $$
declare v int;
begin
  insert into public.ai_usage as u (user_id, day, n)
  values (p_user, (now() at time zone 'Asia/Almaty')::date, 1)
  on conflict (user_id, day) do update set n = u.n + 1 where u.n < p_limit
  returning n into v;
  return v is not null;
end $$;

create or replace function public.ai_refund(p_user uuid) returns void
language sql security definer set search_path = '' as $$
  update public.ai_usage set n = greatest(n - 1, 0)
  where user_id = p_user and day = (now() at time zone 'Asia/Almaty')::date;
$$;

revoke all on function public.ai_take(uuid, int) from public, anon, authenticated;
revoke all on function public.ai_refund(uuid) from public, anon, authenticated;
grant execute on function public.ai_take(uuid, int) to service_role;
grant execute on function public.ai_refund(uuid) to service_role;

-- 4. Контент сайта: цены, ренталы, фестивали, статьи, курсы. Читают все, менять можно только через панель Supabase.
create table if not exists public.content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.content enable row level security;
drop policy if exists content_read on public.content;
create policy content_read on public.content
  for select to anon, authenticated using (true);
