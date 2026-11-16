-- HUSTLE: усиление защиты. Выполните целиком в Supabase: SQL Editor -> New query -> Run.
-- Можно запускать повторно. Данные не удаляет и не меняет.
-- Нужны уже выполненные schema.sql, team.sql и team_roles.sql.

-- 1. Нельзя «забрать» чужой проект.
-- Без этого правила редактор командного проекта мог бы поменять в строке проекта владельца (user_id)
-- на свой номер, и проект перешёл бы к нему. Теперь владельца менять нельзя никому.
create or replace function public.projects_keep_owner() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'owner_change_forbidden';
  end if;
  return new;
end $$;
drop trigger if exists projects_keep_owner on public.projects;
create trigger projects_keep_owner before update on public.projects
  for each row execute function public.projects_keep_owner();

-- 2. Ограничение числа активных приглашений (чтобы нельзя было забить таблицу мусором).
create or replace function public.invites_limit() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.project_invites where owner_id = new.owner_id and expires_at < now();
  if (select count(*) from public.project_invites where owner_id = new.owner_id) >= 20 then
    raise exception 'too_many_invites';
  end if;
  return new;
end $$;
drop trigger if exists invites_limit on public.project_invites;
create trigger invites_limit before insert on public.project_invites
  for each row execute function public.invites_limit();

-- 3. Служебные функции недоступны постороннему коду.
revoke all on function public.projects_keep_owner() from public, anon, authenticated;
revoke all on function public.invites_limit() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- 4. Таблица тарифов: пользователь может только читать свою строку, менять тариф самому себе нельзя.
revoke insert, update, delete on public.profiles from anon, authenticated;
revoke insert, update, delete on public.content from anon, authenticated;
