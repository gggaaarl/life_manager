-- PLAYER citas: vocabulario real, roles, comentarios tipados, seed inaugural

-- ---------------------------------------------------------------------------
-- Nuevos enums
-- ---------------------------------------------------------------------------
create type public.player_color as enum ('blanca', 'canela', 'negra');
create type public.player_figura as enum ('bbw', 'chubby', 'vedette', 'fitness', 'delgada');
create type public.player_talla as enum ('caballo', 'mediana', 'chata');
create type public.player_comentario_tipo as enum ('dicho', 'pensamiento');
create type public.profile_role as enum ('admin', 'user');

-- ---------------------------------------------------------------------------
-- profiles: roles + perfiles experimentales
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column role public.profile_role not null default 'user',
  add column experimental_profiles text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- player_citas: renombrar columnas y enums
-- ---------------------------------------------------------------------------
alter table public.player_citas rename column nombre to persona;
alter table public.player_citas rename column descripcion to caracteristica;

alter table public.player_citas
  add column color public.player_color,
  add column figura public.player_figura,
  add column talla public.player_talla;

alter table public.player_citas
  drop column categoria_1,
  drop column categoria_2,
  drop column categoria_3;

alter table public.player_citas
  alter column color set not null,
  alter column figura set not null,
  alter column talla set not null;

drop type public.player_categoria_color;
drop type public.player_categoria_contextura;
drop type public.player_categoria_talla;

-- ---------------------------------------------------------------------------
-- player_citas_comentarios: tipo dicho / pensamiento
-- ---------------------------------------------------------------------------
alter table public.player_citas_comentarios
  add column tipo public.player_comentario_tipo not null default 'dicho';

alter table public.player_citas_comentarios
  alter column tipo drop default;

-- ---------------------------------------------------------------------------
-- Acceso inaugural: admin + perfil experimental player
-- ---------------------------------------------------------------------------
update public.profiles
set
  role = 'admin',
  experimental_profiles = array['player']
where id = 'f4689015-61af-4e89-81c3-00b00be1b1cb';

update public.user_jobs uj
set
  status = 'active',
  unlocked_at = coalesce(uj.unlocked_at, now()),
  activated_at = coalesce(uj.activated_at, now())
from public.jobs j
where uj.user_id = 'f4689015-61af-4e89-81c3-00b00be1b1cb'
  and uj.job_id = j.id
  and j.code = 'PLAYER';

-- ---------------------------------------------------------------------------
-- Cita inaugural (31-dic-2025)
-- ---------------------------------------------------------------------------
do $$
declare
  v_user_id uuid := 'f4689015-61af-4e89-81c3-00b00be1b1cb';
  v_codigo text := 'gladys-de-al-fondo-sitio-joven';
  v_cita_id uuid;
begin
  if not exists (select 1 from public.profiles where id = v_user_id) then
    return;
  end if;

  if exists (
    select 1
    from public.player_citas
    where user_id = v_user_id
      and codigo_identificador = v_codigo
      and fecha = '2025-12-31 00:00:00+00'::timestamptz
  ) then
    return;
  end if;

  insert into public.player_citas (
    user_id,
    fecha,
    lugar,
    codigo_identificador,
    persona,
    caracteristica,
    color,
    figura,
    talla,
    puntaje_tightening,
    puntaje_bottom,
    puntaje_top,
    puntaje_belleza,
    puntaje_paciencia
  )
  values (
    v_user_id,
    '2025-12-31 00:00:00+00'::timestamptz,
    'bote',
    v_codigo,
    'Gladys de al fondo sitio joven',
    'charapa pomulos pronunciados tetonas cuerpo fit',
    'canela',
    'vedette',
    'caballo',
    90,
    90,
    90,
    90,
    90
  )
  returning id into v_cita_id;

  insert into public.player_citas_comentarios (
    user_id,
    cita_id,
    codigo_identificador,
    fecha,
    contenido,
    tipo,
    orden
  )
  values
    (
      v_user_id,
      v_cita_id,
      v_codigo,
      '2025-12-31 00:00:00+00'::timestamptz,
      'se ve que me va a lastimar',
      'dicho',
      1
    ),
    (
      v_user_id,
      v_cita_id,
      v_codigo,
      '2025-12-31 00:00:00+00'::timestamptz,
      'que tal cocomordan en misionero',
      'pensamiento',
      2
    );
end;
$$;
