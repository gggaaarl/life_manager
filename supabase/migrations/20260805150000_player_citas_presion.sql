-- Columna presión en salidas (player_citas)

create type public.player_presion as enum ('cocomordan', 'regular');

alter table public.player_citas
  add column if not exists presion public.player_presion;

update public.player_citas
set presion = 'regular'
where presion is null;

alter table public.player_citas
  alter column presion set not null,
  alter column presion set default 'regular';

grant usage on type public.player_presion to anon, authenticated;
