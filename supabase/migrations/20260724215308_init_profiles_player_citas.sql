-- Life Manager: profiles + PLAYER citas + comentarios
-- Auth: Google via Supabase Auth (auth.users)

-- ---------------------------------------------------------------------------
-- Enums (PLAYER categorías)
-- ---------------------------------------------------------------------------
create type public.player_categoria_color as enum (
  'blanca_palida',
  'blanca_perla',
  'chocolate_claro',
  'chocolate_oscuro',
  'marron'
);

create type public.player_categoria_contextura as enum (
  'bbw',
  'chubby',
  'vedette',
  'fit',
  'flaca'
);

create type public.player_categoria_talla as enum (
  'caballona',
  'mediana',
  'chata'
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles (usuarios de app = auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Crear perfil automáticamente al registrarse (Google u otro provider)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- player_citas
-- ---------------------------------------------------------------------------
create table public.player_citas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  fecha timestamptz not null,
  lugar text not null,
  codigo_identificador text not null,
  nombre text not null,
  descripcion text,
  categoria_1 public.player_categoria_color not null,
  categoria_2 public.player_categoria_contextura not null,
  categoria_3 public.player_categoria_talla not null,
  puntaje_tightening smallint not null check (puntaje_tightening between 1 and 100),
  puntaje_bottom smallint not null check (puntaje_bottom between 1 and 100),
  puntaje_top smallint not null check (puntaje_top between 1 and 100),
  puntaje_belleza smallint not null check (puntaje_belleza between 1 and 100),
  puntaje_paciencia smallint not null check (puntaje_paciencia between 1 and 100),
  puntaje_promedio numeric(5, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.player_citas_set_promedio()
returns trigger
language plpgsql
as $$
begin
  new.puntaje_promedio := round(
    (
      new.puntaje_tightening
      + new.puntaje_bottom
      + new.puntaje_top
      + new.puntaje_belleza
      + new.puntaje_paciencia
    ) / 5.0,
    2
  );
  return new;
end;
$$;

create trigger player_citas_set_promedio
before insert or update of
  puntaje_tightening,
  puntaje_bottom,
  puntaje_top,
  puntaje_belleza,
  puntaje_paciencia
on public.player_citas
for each row execute function public.player_citas_set_promedio();

create trigger player_citas_set_updated_at
before update on public.player_citas
for each row execute function public.set_updated_at();

create index player_citas_user_fecha_idx
  on public.player_citas (user_id, fecha desc);

create index player_citas_user_codigo_idx
  on public.player_citas (user_id, codigo_identificador);

create index player_citas_user_promedio_idx
  on public.player_citas (user_id, puntaje_promedio desc);

-- ---------------------------------------------------------------------------
-- player_citas_comentarios (n comentarios por cita)
-- ---------------------------------------------------------------------------
create table public.player_citas_comentarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cita_id uuid not null references public.player_citas (id) on delete cascade,
  codigo_identificador text not null,
  fecha timestamptz not null default now(),
  contenido text not null check (char_length(trim(contenido)) > 0),
  orden int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger player_citas_comentarios_set_updated_at
before update on public.player_citas_comentarios
for each row execute function public.set_updated_at();

create index player_citas_comentarios_cita_fecha_idx
  on public.player_citas_comentarios (cita_id, fecha);

create index player_citas_comentarios_user_codigo_idx
  on public.player_citas_comentarios (user_id, codigo_identificador);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.player_citas enable row level security;
alter table public.player_citas_comentarios enable row level security;

-- profiles: cada usuario ve/edita solo el suyo
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- player_citas
create policy "player_citas_select_own"
  on public.player_citas for select
  to authenticated
  using (user_id = auth.uid());

create policy "player_citas_insert_own"
  on public.player_citas for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "player_citas_update_own"
  on public.player_citas for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "player_citas_delete_own"
  on public.player_citas for delete
  to authenticated
  using (user_id = auth.uid());

-- player_citas_comentarios
create policy "player_citas_comentarios_select_own"
  on public.player_citas_comentarios for select
  to authenticated
  using (user_id = auth.uid());

create policy "player_citas_comentarios_insert_own"
  on public.player_citas_comentarios for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.player_citas c
      where c.id = cita_id
        and c.user_id = auth.uid()
    )
  );

create policy "player_citas_comentarios_update_own"
  on public.player_citas_comentarios for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "player_citas_comentarios_delete_own"
  on public.player_citas_comentarios for delete
  to authenticated
  using (user_id = auth.uid());
