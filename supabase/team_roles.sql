-- HUSTLE: роли в команде (просмотр / редактор) и мгновенное обновление.
-- Выполните целиком в Supabase: SQL Editor -> New query -> Run. Данные не удаляются.
-- Нужен уже выполненный supabase/team.sql.

-- 1. Роль в приглашении и у участника
alter table public.project_invites add column if not exists role text not null default 'editor';
alter table public.project_members add column if not exists role text not null default 'editor';
alter table public.project_invites drop constraint if exists project_invites_role_chk;
alter table public.project_invites add constraint project_invites_role_chk check (role in ('viewer','editor'));
alter table public.project_members drop constraint if exists project_members_role_chk;
alter table public.project_members add constraint project_members_role_chk check (role in ('viewer','editor'));

-- 2. Менять проект может только редактор
drop policy if exists projects_team_update on public.projects;
create policy projects_team_update on public.projects for update to authenticated
  using (exists (select 1 from public.project_members m where m.owner_id = projects.user_id and m.member_id = (select auth.uid()) and m.role = 'editor'))
  with check (exists (select 1 from public.project_members m where m.owner_id = projects.user_id and m.member_id = (select auth.uid()) and m.role = 'editor'));

-- 3. Владелец может менять роль участника
drop policy if exists pm_update on public.project_members;
create policy pm_update on public.project_members for update to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- 4. Присоединение по ссылке: роль берётся из приглашения
create or replace function public.join_project(p_token text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare v_owner uuid; v_role text; v_me uuid := auth.uid(); v_name text; v_email text;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  select owner_id, role into v_owner, v_role from public.project_invites where token = p_token and expires_at > now();
  if v_owner is null then raise exception 'invite_invalid'; end if;
  if v_owner = v_me then return v_owner; end if;
  select coalesce(raw_user_meta_data->>'name', ''), email into v_name, v_email from auth.users where id = v_me;
  insert into public.project_members (owner_id, member_id, member_name, member_email, role)
  values (v_owner, v_me, v_name, v_email, coalesce(v_role, 'editor'))
  on conflict (owner_id, member_id) do update set role = excluded.role;
  return v_owner;
end $$;
revoke all on function public.join_project(text) from public, anon;
grant execute on function public.join_project(text) to authenticated;

-- 5. Мои командные проекты вместе с ролью
drop function if exists public.my_teams();
create function public.my_teams()
returns table(owner_id uuid, owner_name text, owner_email text, project_name text, role text)
language sql stable security definer set search_path = '' as $$
  select m.owner_id, coalesce(u.raw_user_meta_data->>'name', ''), u.email, coalesce(p.data->>'name', ''), m.role
  from public.project_members m
  join auth.users u on u.id = m.owner_id
  left join public.projects p on p.user_id = m.owner_id
  where m.member_id = auth.uid()
  order by m.joined_at;
$$;
revoke all on function public.my_teams() from public, anon;
grant execute on function public.my_teams() to authenticated;

-- 6. Мгновенные обновления (Realtime) для проектов
do $$ begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object then null; when undefined_object then null;
end $$;
