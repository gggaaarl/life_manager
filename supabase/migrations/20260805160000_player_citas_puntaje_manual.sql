-- Rediseño de puntuación en player_citas:
-- belleza / top / bottom pasan de score numérico a opción fija.
-- paciencia pasa a minutos. puntaje pasa a valor único asignado a mano.

create type public.player_belleza as enum ('regular', 'modelo');
create type public.player_top as enum ('regular', 'mega');
create type public.player_bottom as enum ('regular', 'mega');

drop trigger if exists player_citas_set_promedio on public.player_citas;
drop function if exists public.player_citas_set_promedio();

alter table public.player_citas
  drop column if exists puntaje_tightening,
  drop column if exists puntaje_bottom,
  drop column if exists puntaje_top,
  drop column if exists puntaje_belleza,
  drop column if exists puntaje_paciencia;

alter table public.player_citas
  add column if not exists belleza public.player_belleza not null default 'regular',
  add column if not exists top public.player_top not null default 'regular',
  add column if not exists bottom public.player_bottom not null default 'regular',
  add column if not exists paciencia_minutos smallint not null default 0
    check (paciencia_minutos >= 0),
  add column if not exists puntaje smallint not null default 50
    check (puntaje between 1 and 100);

alter table public.player_citas
  drop column if exists puntaje_promedio;

grant usage on type public.player_belleza to anon, authenticated;
grant usage on type public.player_top to anon, authenticated;
grant usage on type public.player_bottom to anon, authenticated;
