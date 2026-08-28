-- Catálogo nutricional TPCA + billeteras por método de pago + saldo inicial

-- ---------------------------------------------------------------------------
-- Fuente: Tablas Peruanas de Composición de Alimentos (INS / CENAN), valores por 100 g
-- ---------------------------------------------------------------------------
create table public.food_items (
  id uuid primary key default gen_random_uuid(),
  tpca_code text unique,
  name text not null,
  food_group text not null,
  kcal_per_100g numeric(10, 2) not null check (kcal_per_100g >= 0),
  protein_g numeric(10, 2),
  fat_g numeric(10, 2),
  carbs_g numeric(10, 2),
  default_serving_g numeric(10, 2) not null default 100 check (default_serving_g > 0),
  serving_label text not null default '100 g',
  default_price_soles numeric(10, 2) not null default 0 check (default_price_soles >= 0),
  brand text,
  user_id uuid references public.profiles (id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index food_items_name_idx on public.food_items (lower(name));
create index food_items_group_idx on public.food_items (food_group);
create index food_items_user_idx on public.food_items (user_id);

create trigger food_items_set_updated_at
before update on public.food_items
for each row execute function public.set_updated_at();

-- Migrar catálogo previo
insert into public.food_items (
  name, food_group, kcal_per_100g, default_serving_g, serving_label,
  default_price_soles, brand, user_id, tpca_code
)
select
  name,
  'BEBIDAS',
  case when default_kcal = 0 then 0 else default_kcal end,
  350,
  coalesce(serving_label, '1 porción'),
  default_price_soles,
  brand,
  user_id,
  null
from public.catalog_items;

-- Copiar referencias de movimientos
alter table public.finance_movements
  add column food_item_id uuid references public.food_items (id) on delete set null;

update public.finance_movements fm
set food_item_id = fi.id
from public.catalog_items ci
join public.food_items fi on fi.name = ci.name
  and coalesce(fi.brand, '') = coalesce(ci.brand, '')
  and fi.user_id is not distinct from ci.user_id
where fm.catalog_item_id = ci.id;

alter table public.finance_movements drop column if exists catalog_item_id;
drop table if exists public.catalog_items;

update public.food_items set tpca_code = 'BEB-003' where name = 'Inka Zero pequeña' and tpca_code is null;
update public.food_items set tpca_code = 'BEB-001' where name ilike 'Agua sin gas%' and tpca_code is null;
update public.food_items set tpca_code = 'PRE-005' where name = 'Pan con pollo' and tpca_code is null;

-- ---------------------------------------------------------------------------
-- Seed alimentos peruanos principales (TPCA — valores referenciales por 100 g)
-- ---------------------------------------------------------------------------
insert into public.food_items (
  tpca_code, name, food_group, kcal_per_100g, protein_g, fat_g, carbs_g,
  default_serving_g, serving_label, default_price_soles, brand
) values
  ('CER-001', 'Arroz blanco cocido', 'CEREALES Y DERIVADOS', 130, 2.7, 0.3, 28.0, 150, '1 plato (150 g)', 0, null),
  ('CER-002', 'Arroz integral cocido', 'CEREALES Y DERIVADOS', 123, 2.7, 1.0, 25.6, 150, '1 plato (150 g)', 0, null),
  ('CER-003', 'Pan francés', 'CEREALES Y DERIVADOS', 280, 8.0, 3.5, 52.0, 80, '1 pan (80 g)', 1.50, null),
  ('CER-004', 'Fideos spaghetti cocidos', 'CEREALES Y DERIVADOS', 158, 5.8, 0.9, 30.9, 200, '1 plato (200 g)', 0, null),
  ('CER-005', 'Quinua cocida', 'CEREALES Y DERIVADOS', 120, 4.4, 1.9, 21.3, 150, '1 plato (150 g)', 0, null),
  ('CER-006', 'Kiwicha cocida', 'CEREALES Y DERIVADOS', 102, 3.8, 1.6, 18.9, 150, '1 plato (150 g)', 0, null),
  ('TUB-001', 'Papa amarilla cocida', 'TUBÉRCULOS', 85, 2.0, 0.1, 19.0, 200, '1 papa mediana (200 g)', 0, null),
  ('TUB-002', 'Papa blanca cocida', 'TUBÉRCULOS', 77, 2.0, 0.1, 17.0, 200, '1 papa mediana (200 g)', 0, null),
  ('TUB-003', 'Camote cocido', 'TUBÉRCULOS', 90, 1.6, 0.1, 20.7, 150, '1 porción (150 g)', 0, null),
  ('TUB-004', 'Yuca cocida', 'TUBÉRCULOS', 160, 1.4, 0.3, 38.0, 150, '1 porción (150 g)', 0, null),
  ('LEG-001', 'Lentejas cocidas', 'LEGUMINOSAS', 116, 9.0, 0.4, 20.0, 150, '1 plato (150 g)', 0, null),
  ('LEG-002', 'Frijoles cocidos', 'LEGUMINOSAS', 127, 8.7, 0.5, 22.8, 150, '1 plato (150 g)', 0, null),
  ('LEG-003', 'Garbanzos cocidos', 'LEGUMINOSAS', 164, 8.9, 2.6, 27.4, 150, '1 plato (150 g)', 0, null),
  ('CAR-001', 'Pollo pechuga sin piel cocida', 'CARNES', 165, 31.0, 3.6, 0, 120, '1 porción (120 g)', 0, null),
  ('CAR-002', 'Pollo entero asado', 'CARNES', 239, 27.0, 14.0, 0, 150, '1 porción (150 g)', 0, null),
  ('CAR-003', 'Carne res magra cocida', 'CARNES', 250, 26.0, 15.0, 0, 120, '1 porción (120 g)', 0, null),
  ('CAR-004', 'Cerdo lomo cocido', 'CARNES', 242, 27.0, 14.0, 0, 120, '1 porción (120 g)', 0, null),
  ('CAR-005', 'Chicharrón de cerdo', 'CARNES', 468, 36.0, 35.0, 0, 80, '1 porción (80 g)', 0, null),
  ('PES-001', 'Atún en agua (drenado)', 'PESCADOS', 116, 26.0, 0.8, 0, 80, '1 lata pequeña (80 g)', 4.50, null),
  ('PES-002', 'Jurel en conserva', 'PESCADOS', 127, 18.0, 5.5, 0, 80, '1 porción (80 g)', 0, null),
  ('PES-003', 'Ceviche de pescado', 'PESCADOS', 120, 18.0, 3.0, 5.0, 200, '1 porción (200 g)', 0, null),
  ('PES-004', 'Arroz con mariscos', 'PESCADOS', 175, 12.0, 5.0, 22.0, 250, '1 plato (250 g)', 0, null),
  ('LAC-001', 'Leche evaporada', 'LÁCTEOS', 134, 6.8, 7.6, 10.0, 100, '100 ml', 0, null),
  ('LAC-002', 'Queso fresco', 'LÁCTEOS', 265, 18.0, 20.0, 2.0, 50, '1 rebanada (50 g)', 0, null),
  ('LAC-003', 'Yogurt natural', 'LÁCTEOS', 61, 3.5, 3.3, 4.7, 125, '1 vaso (125 g)', 0, null),
  ('HUE-001', 'Huevo entero cocido', 'HUEVOS', 155, 13.0, 11.0, 1.1, 50, '1 huevo (50 g)', 0, null),
  ('FRU-001', 'Plátano de seda', 'FRUTAS', 90, 1.1, 0.3, 22.8, 120, '1 unidad (120 g)', 0, null),
  ('FRU-002', 'Palta', 'FRUTAS', 160, 2.0, 15.0, 8.5, 80, '1/2 palta (80 g)', 0, null),
  ('FRU-003', 'Chirimoya pulpa', 'FRUTAS', 75, 1.6, 0.7, 17.7, 150, '1 porción (150 g)', 0, null),
  ('FRU-004', 'Piña pulpa', 'FRUTAS', 50, 0.5, 0.1, 13.0, 150, '1 porción (150 g)', 0, null),
  ('VER-001', 'Lechuga', 'VERDURAS', 15, 1.4, 0.2, 2.9, 50, '1 porción (50 g)', 0, null),
  ('VER-002', 'Tomate', 'VERDURAS', 18, 0.9, 0.2, 3.9, 100, '100 g', 0, null),
  ('VER-003', 'Cebolla', 'VERDURAS', 40, 1.1, 0.1, 9.3, 50, '50 g', 0, null),
  ('VER-004', 'Ají amarillo', 'VERDURAS', 40, 2.0, 0.4, 8.0, 30, '30 g', 0, null),
  ('PRE-001', 'Arroz con pollo', 'PREPARACIONES', 180, 12.0, 7.0, 20.0, 300, '1 plato (300 g)', 0, null),
  ('PRE-002', 'Lomo saltado', 'PREPARACIONES', 190, 15.0, 9.0, 14.0, 300, '1 plato (300 g)', 0, null),
  ('PRE-003', 'Ají de gallina', 'PREPARACIONES', 165, 14.0, 8.0, 10.0, 300, '1 plato (300 g)', 0, null),
  ('PRE-004', 'Seco de res', 'PREPARACIONES', 175, 16.0, 9.0, 8.0, 300, '1 plato (300 g)', 0, null),
  ('PRE-005', 'Pan con pollo', 'PREPARACIONES', 265, 14.0, 10.0, 30.0, 250, '1 sándwich', 8.00, null),
  ('PRE-006', 'Causa limeña', 'PREPARACIONES', 155, 8.0, 6.0, 18.0, 200, '1 porción (200 g)', 0, null),
  ('PRE-007', 'Tallarín saltado', 'PREPARACIONES', 185, 13.0, 8.0, 18.0, 300, '1 plato (300 g)', 0, null),
  ('BEB-001', 'Agua sin gas', 'BEBIDAS', 0, 0, 0, 0, 625, '625 ml', 1.50, null),
  ('BEB-002', 'Inca Kola regular', 'BEBIDAS', 42, 0, 0, 10.5, 350, '350 ml', 2.00, 'Inca Kola'),
  ('BEB-003', 'Inka Zero pequeña', 'BEBIDAS', 0, 0, 0, 0, 350, '350 ml', 1.80, 'Inka Kola'),
  ('BEB-004', 'Chicha morada', 'BEBIDAS', 55, 0.2, 0.1, 13.5, 300, '300 ml', 0, null),
  ('BEB-005', 'Emoliente', 'BEBIDAS', 45, 0.5, 0.1, 11.0, 300, '300 ml', 2.00, null),
  ('BEB-006', 'Café pasado sin azúcar', 'BEBIDAS', 2, 0.3, 0, 0, 200, '200 ml', 0, null),
  ('GRA-001', 'Aceite vegetal', 'GRASAS', 884, 0, 100, 0, 10, '1 cda (10 g)', 0, null),
  ('GRA-002', 'Mantequilla', 'GRASAS', 717, 0.9, 81.0, 0.1, 10, '1 cdta (10 g)', 0, null),
  ('AZU-001', 'Azúcar blanca', 'AZUCARES', 387, 0, 0, 99.8, 10, '1 cdta (10 g)', 0, null)
on conflict (tpca_code) do nothing;

-- ---------------------------------------------------------------------------
-- Billeteras: saldo actual por Yape / Plin / Efectivo
-- ---------------------------------------------------------------------------
alter type public.movement_source add value if not exists 'opening_balance';

create table public.user_wallet_balances (
  user_id uuid not null references public.profiles (id) on delete cascade,
  payment_method public.payment_method not null,
  balance_soles numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, payment_method)
);

create or replace function public.apply_movement_to_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.payment_method is null then
    return NEW;
  end if;

  insert into public.user_wallet_balances (user_id, payment_method, balance_soles)
  values (NEW.user_id, NEW.payment_method, 0)
  on conflict (user_id, payment_method) do nothing;

  if NEW.direction = 'in' then
    update public.user_wallet_balances
    set balance_soles = balance_soles + NEW.amount_soles,
        updated_at = now()
    where user_id = NEW.user_id and payment_method = NEW.payment_method;
  else
    update public.user_wallet_balances
    set balance_soles = balance_soles - NEW.amount_soles,
        updated_at = now()
    where user_id = NEW.user_id and payment_method = NEW.payment_method;
  end if;

  return NEW;
end;
$$;

create trigger finance_movements_wallet_sync
after insert on public.finance_movements
for each row execute function public.apply_movement_to_wallet();

alter table public.user_wallet_balances enable row level security;

create policy "wallet_balances_select_own"
  on public.user_wallet_balances for select to authenticated
  using (user_id = auth.uid());

create policy "wallet_balances_update_own"
  on public.user_wallet_balances for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, update on public.user_wallet_balances to authenticated;
grant select on public.food_items to authenticated;

alter table public.food_items enable row level security;

create policy "food_items_select"
  on public.food_items for select to authenticated
  using (user_id is null or user_id = auth.uid());

create policy "food_items_insert_own"
  on public.food_items for insert to authenticated
  with check (user_id = auth.uid());

create policy "food_items_update_own"
  on public.food_items for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
