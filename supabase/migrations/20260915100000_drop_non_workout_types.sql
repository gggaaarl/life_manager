-- Quita columnas y tipos que quedaron de finanzas, jobs y citas.

alter table public.profiles
  drop column if exists role,
  drop column if exists experimental_profiles;

drop type if exists public.expense_category cascade;
drop type if exists public.job_status cascade;
drop type if exists public.movement_direction cascade;
drop type if exists public.movement_source cascade;
drop type if exists public.payment_method cascade;
drop type if exists public.player_belleza cascade;
drop type if exists public.player_bottom cascade;
drop type if exists public.player_color cascade;
drop type if exists public.player_comentario_tipo cascade;
drop type if exists public.player_figura cascade;
drop type if exists public.player_presion cascade;
drop type if exists public.player_talla cascade;
drop type if exists public.player_top cascade;
drop type if exists public.player_categoria_color cascade;
drop type if exists public.player_categoria_contextura cascade;
drop type if exists public.player_categoria_talla cascade;
drop type if exists public.profile_role cascade;
