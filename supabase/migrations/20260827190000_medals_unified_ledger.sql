-- Medallas (gamificación) + libro contable unificado (comida/gastos/ingresos chofer)

-- ---------------------------------------------------------------------------
-- Medallas y requisitos de jobs
-- ---------------------------------------------------------------------------
create table public.medals (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_medals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  medal_id uuid not null references public.medals (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, medal_id)
);

create index user_medals_user_idx on public.user_medals (user_id);

create table public.job_medal_requirements (
  job_id uuid not null references public.jobs (id) on delete cascade,
  medal_id uuid not null references public.medals (id) on delete cascade,
  primary key (job_id, medal_id)
);

insert into public.medals (code, name, description, sort_order) values
  ('manejar', 'Manejar', 'Habilidad para conducir. Requisito para ser Chofer.', 1);

insert into public.job_medal_requirements (job_id, medal_id)
select j.id, m.id
from public.jobs j
cross join public.medals m
where j.code = 'DRIVER' and m.code = 'manejar';

-- ---------------------------------------------------------------------------
-- Catálogo de productos / comidas (global + personal por usuario)
-- ---------------------------------------------------------------------------
create table public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  brand text,
  default_price_soles numeric(10, 2) not null default 0 check (default_price_soles >= 0),
  default_kcal numeric(10, 2) not null default 0 check (default_kcal >= 0),
  serving_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index catalog_items_user_idx on public.catalog_items (user_id);
create index catalog_items_name_idx on public.catalog_items (lower(name));

create trigger catalog_items_set_updated_at
before update on public.catalog_items
for each row execute function public.set_updated_at();

-- Global seed
insert into public.catalog_items (user_id, name, brand, default_price_soles, default_kcal, serving_label)
values
  (null, 'Inka Zero pequeña', 'Inka Kola', 1.80, 0, '350 ml'),
  (null, 'Agua sin gas 625ml', null, 1.50, 0, '625 ml'),
  (null, 'Pan con pollo', null, 8.00, 450, '1 unidad');

-- ---------------------------------------------------------------------------
-- Movimientos financieros unificados
-- Un registro = visible en los dashboards que correspondan (filtros por columnas)
-- ---------------------------------------------------------------------------
create type public.payment_method as enum ('yape', 'plin', 'efectivo', 'otro');
create type public.movement_direction as enum ('in', 'out');
create type public.movement_source as enum (
  'food',
  'expense',
  'income',
  'driver_income',
  'driver_expense'
);

create type public.expense_category as enum (
  'comida_bebida',
  'combustible_gnv',
  'combustible_gasolina',
  'llantas',
  'mantenimiento',
  'otro'
);

create table public.finance_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  occurred_at timestamptz not null default now(),
  direction public.movement_direction not null,
  amount_soles numeric(10, 2) not null check (amount_soles >= 0),
  payment_method public.payment_method,
  kcal numeric(10, 2) check (kcal is null or kcal >= 0),
  catalog_item_id uuid references public.catalog_items (id) on delete set null,
  job_id uuid references public.jobs (id) on delete set null,
  source public.movement_source not null,
  category public.expense_category,
  label text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index finance_movements_user_date_idx
  on public.finance_movements (user_id, occurred_at desc);

create index finance_movements_user_direction_idx
  on public.finance_movements (user_id, direction, occurred_at desc);

create index finance_movements_user_job_idx
  on public.finance_movements (user_id, job_id, occurred_at desc)
  where job_id is not null;

create trigger finance_movements_set_updated_at
before update on public.finance_movements
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.medals enable row level security;
alter table public.user_medals enable row level security;
alter table public.job_medal_requirements enable row level security;
alter table public.catalog_items enable row level security;
alter table public.finance_movements enable row level security;

create policy "medals_select_authenticated"
  on public.medals for select to authenticated using (true);

create policy "job_medal_requirements_select_authenticated"
  on public.job_medal_requirements for select to authenticated using (true);

create policy "user_medals_select_own"
  on public.user_medals for select to authenticated using (user_id = auth.uid());

create policy "user_medals_insert_own"
  on public.user_medals for insert to authenticated
  with check (user_id = auth.uid());

create policy "catalog_items_select"
  on public.catalog_items for select to authenticated
  using (user_id is null or user_id = auth.uid());

create policy "catalog_items_insert_own"
  on public.catalog_items for insert to authenticated
  with check (user_id = auth.uid());

create policy "catalog_items_update_own"
  on public.catalog_items for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "catalog_items_delete_own"
  on public.catalog_items for delete to authenticated
  using (user_id = auth.uid());

create policy "finance_movements_select_own"
  on public.finance_movements for select to authenticated
  using (user_id = auth.uid());

create policy "finance_movements_insert_own"
  on public.finance_movements for insert to authenticated
  with check (user_id = auth.uid());

create policy "finance_movements_update_own"
  on public.finance_movements for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "finance_movements_delete_own"
  on public.finance_movements for delete to authenticated
  using (user_id = auth.uid());

-- user_jobs: permitir update own para desbloquear jobs desde la app
-- (policy ya existe update_own desde migración jobs)

grant usage on type public.payment_method to anon, authenticated;
grant usage on type public.movement_direction to anon, authenticated;
grant usage on type public.movement_source to anon, authenticated;
grant usage on type public.expense_category to anon, authenticated;

grant select on public.medals to anon, authenticated;
grant select on public.job_medal_requirements to anon, authenticated;
grant select, insert on public.user_medals to anon, authenticated;
grant select, insert, update, delete on public.catalog_items to anon, authenticated;
grant select, insert, update, delete on public.finance_movements to anon, authenticated;
