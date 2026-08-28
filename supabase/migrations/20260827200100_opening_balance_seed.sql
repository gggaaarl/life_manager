-- Seed separado: PostgreSQL no permite usar un enum recién añadido en la misma transacción.

-- Usuario de prueba: jcacerespdl@gmail.com
-- Capital inicial S/ 11 → Yape S/ 1 + Efectivo S/ 10
-- Medalla manejar + job DRIVER desbloqueado y activo
do $$
declare
  v_user_id uuid;
  v_manejar_id uuid;
  v_driver_job_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  if v_user_id is null then
    raise notice 'Usuario jcacerespdl@gmail.com no encontrado; omitiendo seed de billetera.';
    return;
  end if;

  select id into v_manejar_id from public.medals where code = 'manejar';
  select id into v_driver_job_id from public.jobs where code = 'DRIVER';

  insert into public.user_medals (user_id, medal_id)
  values (v_user_id, v_manejar_id)
  on conflict (user_id, medal_id) do nothing;

  update public.user_jobs
  set status = 'active',
      unlocked_at = coalesce(unlocked_at, now()),
      activated_at = coalesce(activated_at, now())
  where user_id = v_user_id and job_id = v_driver_job_id;

  if not exists (
    select 1 from public.finance_movements
    where user_id = v_user_id and source = 'opening_balance'
  ) then
    insert into public.finance_movements (
      user_id, occurred_at, direction, amount_soles, payment_method, source, label
    ) values
      (v_user_id, now(), 'in', 1.00, 'yape', 'opening_balance', 'Capital inicial Yape'),
      (v_user_id, now(), 'in', 10.00, 'efectivo', 'opening_balance', 'Capital inicial efectivo');
  end if;
end $$;
