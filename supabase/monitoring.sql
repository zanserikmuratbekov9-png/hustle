-- HUSTLE: сбор ошибок сайта. Выполните целиком в Supabase: SQL Editor -> New query -> Run.
-- Можно запускать повторно. Читать ошибки можно только вам: Table Editor -> client_errors.
-- Сайт отправляет сюда только техническое описание ошибки (текст, файл, строка, версия сайта, браузер).
-- Адреса страниц с # и ?, имена, почты, содержимое проектов НЕ отправляются.

create table if not exists public.client_errors (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  message text not null check (length(message) <= 500),
  source text check (length(source) <= 200),
  line int,
  col int,
  stack text check (length(stack) <= 2000),
  page text check (length(page) <= 100),
  ua text check (length(ua) <= 300),
  version text check (length(version) <= 20)
);
alter table public.client_errors enable row level security;
drop policy if exists client_errors_insert on public.client_errors;
create policy client_errors_insert on public.client_errors
  for insert to anon, authenticated with check (true);
-- читать, менять и удалять через сайт нельзя никому (политик на это нет)
revoke select, update, delete on public.client_errors from anon, authenticated;

create index if not exists client_errors_created_idx on public.client_errors (created_at desc);

-- Старые записи (старше 60 дней) чистятся при каждой новой записи, таблица не раздувается.
create or replace function public.client_errors_cleanup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.client_errors where created_at < now() - interval '60 days';
  return null;
end $$;
revoke all on function public.client_errors_cleanup() from public, anon, authenticated;
drop trigger if exists client_errors_cleanup on public.client_errors;
create trigger client_errors_cleanup after insert on public.client_errors
  for each statement execute function public.client_errors_cleanup();
