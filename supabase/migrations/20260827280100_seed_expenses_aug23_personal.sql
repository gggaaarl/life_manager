-- Gastos personales dom 23-ago-2026 · jcacerespdl@gmail.com

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  if v_user_id is null then
    return;
  end if;

  if exists (
    select 1 from public.finance_movements
    where user_id = v_user_id
      and label = 'bismutol'
      and occurred_at >= '2026-08-23T05:00:00Z'
      and occurred_at < '2026-08-24T05:00:00Z'
  ) then
    return;
  end if;

  insert into public.finance_movements (
    user_id, occurred_at, direction, amount_soles, source, category, label, affects_wallet
  ) values
    (v_user_id, '2026-08-23T10:00:00-05:00', 'out', 3.00, 'expense', 'medicina', 'bismutol', false),
    (v_user_id, '2026-08-23T11:30:00-05:00', 'out', 4.00, 'expense', 'higiene', 'paños humedos', false),
    (v_user_id, '2026-08-23T15:00:00-05:00', 'out', 3.00, 'expense', 'ocio', 'rislas', false),
    (v_user_id, '2026-08-23T16:00:00-05:00', 'out', 3.00, 'expense', 'bebida', 'liquido hey fit', false),
    (v_user_id, '2026-08-23T18:00:00-05:00', 'out', 3.00, 'expense', 'bebida', 'liquido hey fit', false),
    (v_user_id, '2026-08-23T20:00:00-05:00', 'out', 2.50, 'expense', 'bebida', 'san luis manzana', false);
end $$;
