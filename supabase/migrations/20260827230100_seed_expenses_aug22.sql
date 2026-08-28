-- Gastos sáb 22-ago-2026 para jcacerespdl@gmail.com (histórico, sin mover billetera)

do $$
declare
  v_user_id uuid;
  v_driver_job_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  select id into v_driver_job_id from public.jobs where code = 'DRIVER';

  if v_user_id is null then
    return;
  end if;

  if exists (
    select 1 from public.finance_movements
    where user_id = v_user_id
      and label = 'frutos secos 50g'
      and occurred_at >= '2026-08-22T05:00:00Z'
      and occurred_at < '2026-08-23T05:00:00Z'
  ) then
    return;
  end if;

  insert into public.finance_movements (
    user_id, job_id, occurred_at, direction, amount_soles, source, category, label, affects_wallet
  ) values
    (v_user_id, null, '2026-08-22T12:00:00-05:00', 'out', 2.50, 'expense', 'comida_bebida', 'frutos secos 50g', false),
    (v_user_id, null, '2026-08-22T12:10:00-05:00', 'out', 2.50, 'expense', 'comida_bebida', 'yogurt gloria 200ml', false),
    (v_user_id, null, '2026-08-22T12:20:00-05:00', 'out', 7.00, 'expense', 'comida_bebida', 'gloria pro power', false),
    (v_user_id, null, '2026-08-22T13:00:00-05:00', 'out', 1.80, 'expense', 'comida_bebida', 'liquido maracuya', false),
    (v_user_id, null, '2026-08-22T13:10:00-05:00', 'out', 1.50, 'expense', 'comida_bebida', 'liquido seven up', false),
    (v_user_id, v_driver_job_id, '2026-08-22T14:00:00-05:00', 'out', 2.00, 'driver_expense', 'mantenimiento', 'taxi aire llantas', false),
    (v_user_id, null, '2026-08-22T14:30:00-05:00', 'out', 2.80, 'expense', 'comida_bebida', 'liquido hey fit', false),
    (v_user_id, null, '2026-08-22T15:00:00-05:00', 'out', 4.80, 'expense', 'comida_bebida', 'liquido san luis', false);
end $$;
