-- Backfill categorías de pago (enum en migración anterior)

update public.expense_items
set default_category = 'pago_mensual'
where user_id is null and name = 'Gym mensual';

update public.expense_items
set default_category = 'pago_no_fijo'
where user_id is null and name = 'Corte de cabello';

update public.finance_movements
set category = 'pago_mensual'
where source = 'expense'
  and label = 'Gym mensual';

update public.finance_movements
set category = 'pago_no_fijo'
where source = 'expense'
  and label = 'Corte de cabello';
