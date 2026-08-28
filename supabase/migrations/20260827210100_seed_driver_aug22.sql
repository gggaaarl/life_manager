-- Ejemplo histórico sáb 22-ago-2026 (no altera billetera actual: affects_wallet = false)

do $$
declare
  v_user_id uuid;
  v_job_id uuid;
  v_shift1 uuid;
  v_shift2 uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  select id into v_job_id from public.jobs where code = 'DRIVER';

  if v_user_id is null or v_job_id is null then
    raise notice 'Usuario o job DRIVER no encontrado; omitiendo seed 22-ago.';
    return;
  end if;

  if exists (
    select 1 from public.driver_shifts
    where user_id = v_user_id and work_date = '2026-08-22'
  ) then
    raise notice 'Seed 22-ago ya aplicado.';
    return;
  end if;

  insert into public.driver_shifts (
    id, user_id, job_id, work_date, shift_number, started_at, ended_at, break_minutes, notes
  ) values (
    gen_random_uuid(), v_user_id, v_job_id, '2026-08-22', 1,
    '2026-08-22T14:45:00-05:00', '2026-08-22T19:45:00-05:00', 0,
    'Primera vuelta · barras 5→2 verdes, barra 1 roja'
  ) returning id into v_shift1;

  insert into public.driver_shifts (
    id, user_id, job_id, work_date, shift_number, started_at, ended_at, break_minutes, notes
  ) values (
    gen_random_uuid(), v_user_id, v_job_id, '2026-08-22', 2,
    '2026-08-22T19:45:00-05:00', '2026-08-22T23:30:00-05:00', 90,
    'Segunda vuelta · descansos 1h (21→22) y 30min (22:30→23)'
  ) returning id into v_shift2;

  insert into public.finance_movements (
    user_id, job_id, driver_shift_id, occurred_at, direction, amount_soles,
    payment_method, source, gnv_bar, label, affects_wallet
  ) values
    -- Vuelta 1 ingresos (Yape)
    (v_user_id, v_job_id, v_shift1, '2026-08-22T14:50:00-05:00', 'in', 12.80, 'yape', 'driver_income', 5, 'Carrera Yape · barra 5', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T15:20:00-05:00', 'in',  9.60, 'yape', 'driver_income', 4, 'Carrera Yape · barra 4', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T15:50:00-05:00', 'in', 18.00, 'yape', 'driver_income', 4, 'Carrera Yape · barra 4', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T16:20:00-05:00', 'in', 18.90, 'yape', 'driver_income', 4, 'Carrera Yape · barra 4', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T16:50:00-05:00', 'in', 20.00, 'yape', 'driver_income', 3, 'Carrera Yape · barra 3', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T17:10:00-05:00', 'in',  5.00, 'yape', 'driver_income', 3, 'Carrera Yape · barra 3', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T17:30:00-05:00', 'in', 13.70, 'yape', 'driver_income', 3, 'Carrera Yape · barra 3', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T18:00:00-05:00', 'in', 10.70, 'yape', 'driver_income', 2, 'Carrera Yape · barra 2', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T18:30:00-05:00', 'in',  8.60, 'yape', 'driver_income', 2, 'Carrera Yape · barra 2', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T19:15:00-05:00', 'in', 30.00, 'yape', 'driver_income', 1, 'Carrera Yape · barra 1', false),
    -- Vuelta 1 gastos
    (v_user_id, v_job_id, v_shift1, '2026-08-22T15:00:00-05:00', 'out', 15.70, 'yape', 'driver_expense', null, 'Recarga saldo app', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T16:00:00-05:00', 'out', 10.70, 'yape', 'driver_expense', null, 'Recarga saldo app', false),
    (v_user_id, v_job_id, v_shift1, '2026-08-22T17:00:00-05:00', 'out', 19.00, 'yape', 'driver_expense', null, 'Recarga GNV', false),
    -- Vuelta 2 ingresos
    (v_user_id, v_job_id, v_shift2, '2026-08-22T19:50:00-05:00', 'in', 19.00, 'yape', 'driver_income', 5, 'Carrera Yape · barra 5', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T20:30:00-05:00', 'in', 10.30, 'yape', 'driver_income', 4, 'Carrera Yape · barra 4', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T22:00:00-05:00', 'in', 25.60, 'yape', 'driver_income', 4, 'Carrera Yape · barra 4', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T22:35:00-05:00', 'in', 10.90, 'yape', 'driver_income', 3, 'Carrera Yape · barra 3', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T22:50:00-05:00', 'in', 19.00, 'yape', 'driver_income', 3, 'Carrera Yape · barra 3', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T23:00:00-05:00', 'in',  8.30, 'yape', 'driver_income', 2, 'Carrera Yape · barra 2', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T23:05:00-05:00', 'in', 39.10, 'yape', 'driver_income', 2, 'Carrera Yape · barra 2', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T23:10:00-05:00', 'in', 11.00, 'yape', 'driver_income', 2, 'Carrera Yape · barra 2', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T23:20:00-05:00', 'in', 19.00, 'yape', 'driver_income', 2, 'Carrera Yape · barra 2', false),
    -- Vuelta 2 gastos
    (v_user_id, v_job_id, v_shift2, '2026-08-22T20:00:00-05:00', 'out',  5.00, 'yape', 'driver_expense', null, 'Recarga saldo app', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T21:00:00-05:00', 'out', 17.70, 'yape', 'driver_expense', null, 'Recarga saldo app', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T21:30:00-05:00', 'out', 10.00, 'yape', 'driver_expense', null, 'Recarga saldo app', false),
    (v_user_id, v_job_id, v_shift2, '2026-08-22T22:15:00-05:00', 'out', 24.00, 'yape', 'driver_expense', null, 'Recarga GNV', false);

  update public.finance_movements
  set category = 'app_saldo'
  where user_id = v_user_id
    and driver_shift_id in (v_shift1, v_shift2)
    and direction = 'out'
    and label = 'Recarga saldo app';

  update public.finance_movements
  set category = 'combustible_gnv'
  where user_id = v_user_id
    and driver_shift_id in (v_shift1, v_shift2)
    and direction = 'out'
    and label = 'Recarga GNV';
end $$;
