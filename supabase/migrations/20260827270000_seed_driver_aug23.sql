-- Dom 23-ago-2026 · jcacerespdl@gmail.com (histórico, affects_wallet = false)

do $$
declare
  v_user_id uuid;
  v_job_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  select id into v_job_id from public.jobs where code = 'DRIVER';

  if v_user_id is null or v_job_id is null then
    raise notice 'Usuario o job DRIVER no encontrado; omitiendo seed 23-ago.';
    return;
  end if;

  if exists (
    select 1 from public.finance_movements
    where user_id = v_user_id
      and source = 'driver_income'
      and amount_soles = 10.40
      and occurred_at >= '2026-08-23T05:00:00Z'
      and occurred_at < '2026-08-24T05:00:00Z'
  ) then
    raise notice 'Seed 23-ago ya aplicado.';
    return;
  end if;

  insert into public.finance_movements (
    user_id, job_id, occurred_at, direction, amount_soles,
    payment_method, source, category, label, affects_wallet
  ) values
    -- Ingresos Yape (23 carreras)
    (v_user_id, v_job_id, '2026-08-23T08:00:00-05:00', 'in', 10.40, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T08:35:00-05:00', 'in', 10.70, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T09:10:00-05:00', 'in', 16.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T09:45:00-05:00', 'in', 20.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T10:20:00-05:00', 'in', 16.80, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T10:55:00-05:00', 'in', 14.60, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T11:30:00-05:00', 'in', 14.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T12:05:00-05:00', 'in', 15.30, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T12:40:00-05:00', 'in', 27.40, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T13:15:00-05:00', 'in', 11.40, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T13:50:00-05:00', 'in', 32.60, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T14:25:00-05:00', 'in', 16.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T15:00:00-05:00', 'in', 25.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T15:35:00-05:00', 'in', 15.60, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T16:10:00-05:00', 'in', 13.30, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T16:45:00-05:00', 'in', 11.20, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T17:20:00-05:00', 'in', 12.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T17:55:00-05:00', 'in', 11.50, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T18:30:00-05:00', 'in', 11.70, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T19:05:00-05:00', 'in', 14.50, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T19:40:00-05:00', 'in', 23.50, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_job_id, '2026-08-23T20:50:00-05:00', 'in', 21.50, 'yape', 'driver_income', null, 'Carrera Yape', false),
    -- Egresos saldo app
    (v_user_id, v_job_id, '2026-08-23T09:00:00-05:00', 'out',  5.70, 'yape', 'driver_expense', 'app_saldo', 'Saldo', false),
    (v_user_id, v_job_id, '2026-08-23T14:00:00-05:00', 'out', 15.70, 'yape', 'driver_expense', 'app_saldo', 'Saldo', false),
    (v_user_id, v_job_id, '2026-08-23T19:00:00-05:00', 'out', 20.70, 'yape', 'driver_expense', 'app_saldo', 'Saldo', false),
    -- Egresos GNV
    (v_user_id, v_job_id, '2026-08-23T11:00:00-05:00', 'out', 24.00, 'yape', 'driver_expense', 'combustible_gnv', 'GNV', false),
    (v_user_id, v_job_id, '2026-08-23T17:00:00-05:00', 'out', 21.00, 'yape', 'driver_expense', 'combustible_gnv', 'GNV', false),
    (v_user_id, v_job_id, '2026-08-23T21:00:00-05:00', 'out', 15.00, 'yape', 'driver_expense', 'combustible_gnv', 'GNV', false);
end $$;
