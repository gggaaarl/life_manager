-- Renombra ítems de bebida y actualiza movimientos vinculados

update public.expense_items
set name = 'Agua de maracuyá'
where name = 'Maracuyá líquido';

update public.expense_items
set name = 'San Luis saborizada'
where name = 'San Luis Manzana';

update public.expense_item_aliases
set alias = 'agua de maracuya'
where alias = 'liquido maracuya';

update public.expense_item_aliases
set alias = 'san luis saborizada'
where alias = 'san luis manzana';

insert into public.expense_item_aliases (expense_item_id, alias)
select ei.id, 'liquido maracuya'
from public.expense_items ei
where ei.name = 'Agua de maracuyá'
on conflict do nothing;

insert into public.expense_item_aliases (expense_item_id, alias)
select ei.id, 'san luis manzana'
from public.expense_items ei
where ei.name = 'San Luis saborizada'
on conflict do nothing;

update public.finance_movements fm
set label = ei.name
from public.expense_items ei
where fm.expense_item_id = ei.id
  and ei.name in ('Agua de maracuyá', 'San Luis saborizada');

update public.finance_movements
set label = 'Agua de maracuyá'
where lower(trim(label)) in ('maracuyá líquido', 'liquido maracuya', 'maracuya liquido');

update public.finance_movements
set label = 'San Luis saborizada'
where lower(trim(label)) in ('san luis manzana', 'san luis saborizada');
