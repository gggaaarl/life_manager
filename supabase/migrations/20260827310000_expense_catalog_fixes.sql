-- Catálogo bebidas: unificar San Luis, precios, categorías y marcas redundantes

-- 1) Unir "San Luis" → "San Luis saborizada" (sáb 22 liquido san luis S/4.80)
do $$
declare
  v_san_luis_id uuid;
  v_saborizada_id uuid;
begin
  select id into v_san_luis_id
  from public.expense_items
  where name = 'San Luis' and user_id is null;

  select id into v_saborizada_id
  from public.expense_items
  where name = 'San Luis saborizada' and user_id is null;

  if v_san_luis_id is not null and v_saborizada_id is not null then
    update public.finance_movements
    set expense_item_id = v_saborizada_id,
        label = 'San Luis saborizada',
        category = 'bebida'
    where expense_item_id = v_san_luis_id;

    update public.expense_item_aliases
    set expense_item_id = v_saborizada_id
    where expense_item_id = v_san_luis_id;

    delete from public.expense_items where id = v_san_luis_id;
  end if;
end $$;

insert into public.expense_item_aliases (expense_item_id, alias)
select ei.id, 'liquido san luis'
from public.expense_items ei
where ei.name = 'San Luis saborizada' and ei.user_id is null
on conflict do nothing;

update public.finance_movements fm
set
  expense_item_id = ei.id,
  label = 'San Luis saborizada',
  category = 'bebida'
from public.expense_items ei
where ei.name = 'San Luis saborizada' and ei.user_id is null
  and fm.source in ('expense', 'food')
  and lower(trim(fm.label)) in ('san luis', 'liquido san luis');

-- 2) Precios por defecto S/3 en bebidas zero / referencia
update public.expense_items
set default_price_soles = 3.00
where user_id is null
  and name in ('Hey Fit', 'Coca Cola Zero', 'Inka Cola Zero', 'Seven Up');

update public.expense_items
set default_price_soles = 4.80
where user_id is null and name = 'San Luis saborizada';

-- 3) Quitar marcas redundantes (el nombre ya basta)
update public.expense_items
set brand = null
where user_id is null
  and name in ('Coca Cola Zero', 'Inka Cola Zero', 'Seven Up', 'San Luis saborizada');

-- 4) Yogurt Gloria → bebida
update public.expense_items
set default_category = 'bebida', brand = null
where user_id is null
  and name in ('Yogurt Gloria 200ml', 'Gloria Pro Power');

update public.finance_movements fm
set category = 'bebida'
from public.expense_items ei
where fm.expense_item_id = ei.id
  and ei.name in ('Yogurt Gloria 200ml', 'Gloria Pro Power');

update public.finance_movements
set category = 'bebida'
where source in ('expense', 'food')
  and lower(trim(label)) in ('yogurt gloria 200ml', 'gloria pro power');
