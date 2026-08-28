-- Catálogo de ítems de gasto personal + enlace en finance_movements
-- Patrón análogo a food_items: id canónico, label denormalizado en el movimiento.

create table public.expense_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  brand text,
  default_category public.expense_category not null default 'otro',
  default_price_soles numeric(10, 2) not null default 0 check (default_price_soles >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expense_items_name_idx on public.expense_items (lower(trim(name)));
create index expense_items_category_idx on public.expense_items (default_category);
create index expense_items_user_idx on public.expense_items (user_id);

create unique index expense_items_global_name_category_uidx
  on public.expense_items (lower(trim(name)), default_category)
  where user_id is null;

create unique index expense_items_user_name_category_uidx
  on public.expense_items (user_id, lower(trim(name)), default_category)
  where user_id is not null;

create trigger expense_items_set_updated_at
before update on public.expense_items
for each row execute function public.set_updated_at();

-- Variantes de texto → ítem canónico (backfill + autocomplete futuro)
create table public.expense_item_aliases (
  id uuid primary key default gen_random_uuid(),
  expense_item_id uuid not null references public.expense_items (id) on delete cascade,
  alias text not null,
  created_at timestamptz not null default now()
);

create unique index expense_item_aliases_alias_uidx
  on public.expense_item_aliases (lower(trim(alias)));

create index expense_item_aliases_item_idx
  on public.expense_item_aliases (expense_item_id);

alter table public.finance_movements
  add column expense_item_id uuid references public.expense_items (id) on delete set null;

create index finance_movements_expense_item_idx
  on public.finance_movements (expense_item_id)
  where expense_item_id is not null;

-- ---------------------------------------------------------------------------
-- Catálogo global inicial (bebidas sin calorías + ítems ya usados en seeds)
-- ---------------------------------------------------------------------------
insert into public.expense_items (name, brand, default_category, default_price_soles) values
  ('Hey Fit', null, 'bebida', 3.00),
  ('Seven Up', 'Seven Up', 'bebida', 1.50),
  ('Coca Cola Zero', 'Coca-Cola', 'bebida', 0),
  ('Inka Cola Zero', 'Inca Kola', 'bebida', 0),
  ('San Luis', 'San Luis', 'bebida', 4.80),
  ('San Luis Manzana', 'San Luis', 'bebida', 2.50),
  ('Maracuyá líquido', null, 'bebida', 1.80),
  ('Yogurt Gloria 200ml', 'Gloria', 'comida', 2.50),
  ('Gloria Pro Power', 'Gloria', 'comida', 7.00),
  ('Frutos secos 50g', null, 'comida', 2.50),
  ('Bismutol', null, 'medicina', 3.00),
  ('Paños húmedos', null, 'higiene', 4.00),
  ('Rislas', null, 'ocio', 3.00);

insert into public.expense_item_aliases (expense_item_id, alias)
select ei.id, v.alias
from public.expense_items ei
join (
  values
    ('Hey Fit', 'liquido hey fit'),
    ('Hey Fit', 'hey fit'),
    ('Hey Fit', 'liquido heyfit'),
    ('Seven Up', 'liquido seven up'),
    ('Seven Up', 'seven up'),
    ('Coca Cola Zero', 'coca cola zero'),
    ('Coca Cola Zero', 'coca zero'),
    ('Inka Cola Zero', 'inka cola zero'),
    ('Inka Cola Zero', 'inca kola zero'),
    ('Inka Cola Zero', 'inka zero'),
    ('San Luis', 'liquido san luis'),
    ('San Luis Manzana', 'san luis manzana'),
    ('Maracuyá líquido', 'liquido maracuya'),
    ('Paños húmedos', 'paños humedos'),
    ('Paños húmedos', 'panos humedos')
) as v(item_name, alias) on v.item_name = ei.name;

-- ---------------------------------------------------------------------------
-- Backfill: movimientos personales existentes → expense_item_id
-- 1) Por alias (texto libre previo)
-- 2) Por nombre exacto del catálogo
-- ---------------------------------------------------------------------------
update public.finance_movements fm
set
  expense_item_id = ei.id,
  label = ei.name,
  category = ei.default_category
from public.expense_item_aliases a
join public.expense_items ei on ei.id = a.expense_item_id
where fm.expense_item_id is null
  and fm.source in ('expense', 'food')
  and lower(trim(fm.label)) = lower(trim(a.alias));

update public.finance_movements fm
set
  expense_item_id = ei.id,
  label = ei.name,
  category = ei.default_category
from public.expense_items ei
where fm.expense_item_id is null
  and fm.source in ('expense', 'food')
  and lower(trim(fm.label)) = lower(trim(ei.name));

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
grant select on public.expense_items to authenticated;
grant select, insert, update on public.expense_items to authenticated;
grant select on public.expense_item_aliases to authenticated;

alter table public.expense_items enable row level security;
alter table public.expense_item_aliases enable row level security;

create policy "expense_items_select"
  on public.expense_items for select to authenticated
  using (user_id is null or user_id = auth.uid());

create policy "expense_items_insert_own"
  on public.expense_items for insert to authenticated
  with check (user_id = auth.uid());

create policy "expense_items_update_own"
  on public.expense_items for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "expense_item_aliases_select"
  on public.expense_item_aliases for select to authenticated
  using (true);
