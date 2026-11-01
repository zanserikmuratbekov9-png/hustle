-- HUSTLE: командная работа. Выполните целиком в Supabase: SQL Editor -> New query -> Run.
-- Ничего не удаляет из ваших данных: только добавляет таблицы, правила доступа и две функции.

-- 1. Участники чужого проекта
create table if not exists public.project_members (
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  member_name text,
  member_email text,
  joined_at timestamptz not null default now(),
  primary key (owner_id, member_id)
);
alter table public.project_members enable row level security;
drop policy if exists pm_read on public.project_members;
create policy pm_read on public.project_members for select to authenticated
  using ((select auth.uid()) = owner_id or (select auth.uid()) = member_id);
drop policy if exists pm_delete on public.project_members;
create policy pm_delete on public.project_members for delete to authenticated
  using ((select auth.uid()) = owner_id or (select auth.uid()) = member_id);

-- 2. Ссылки-приглашения (живут 14 дней)
create table if not exists public.project_invites (
  token text primary key check (length(token) >= 20),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '14 days'
);
alter table public.project_invites enable row level security;
drop policy if exists inv_own on public.project_invites;
create policy inv_own on public.project_invites for all to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

-- 3. Участники могут читать и менять проект владельца
drop policy if exists projects_team_read on public.projects;
create policy projects_team_read on public.projects for select to authenticated
  using (exists (select 1 from public.project_members m where m.owner_id = projects.user_id and m.member_id = (select auth.uid())));
drop policy if exists projects_team_update on public.projects;
create policy projects_team_update on public.projects for update to authenticated
  using (exists (select 1 from public.project_members m where m.owner_id = projects.user_id and m.member_id = (select auth.uid())))
  with check (exists (select 1 from public.project_members m where m.owner_id = projects.user_id and m.member_id = (select auth.uid())));

-- 4. Присоединиться по ссылке
create or replace function public.join_project(p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid; v_me uuid := auth.uid(); v_name text; v_email text;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select owner_id into v_owner from public.project_invites where token = p_token and expires_at > now();
  if v_owner is null then raise exception 'invite_invalid'; end if;
  if v_owner = v_me then return v_owner; end if;
  select coalesce(raw_user_meta_data->>'name', ''), email into v_name, v_email from auth.users where id = v_me;
  insert into public.project_members (owner_id, member_id, member_name, member_email)
  values (v_owner, v_me, v_name, v_email)
  on conflict (owner_id, member_id) do nothing;
  return v_owner;
end $$;
revoke all on function public.join_project(text) from public, anon;
grant execute on function public.join_project(text) to authenticated;

-- 5. Проекты, в которых я участник
create or replace function public.my_teams()
returns table(owner_id uuid, owner_name text, owner_email text, project_name text)
language sql stable security definer set search_path = '' as $$
  select m.owner_id, coalesce(u.raw_user_meta_data->>'name', ''), u.email, coalesce(p.data->>'name', '')
  from public.project_members m
  join auth.users u on u.id = m.owner_id
  left join public.projects p on p.user_id = m.owner_id
  where m.member_id = auth.uid()
  order by m.joined_at;
$$;
revoke all on function public.my_teams() from public, anon;
grant execute on function public.my_teams() to authenticated;
