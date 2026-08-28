-- Finanzas lun 24 – jue 27 ago-2026 · jcacerespdl@gmail.com

-- Catálogo de ítems nuevos
insert into public.expense_items (name, default_category, default_price_soles)
select v.name, v.default_category::public.expense_category, v.default_price_soles
from (
  values
    ('Salir', 'ocio', 50.00),
    ('Menú', 'comida', 8.50),
    ('Verdura', 'comida', 4.50),
    ('Fruta', 'comida', 5.00),
    ('Sporade', 'bebida', 3.00),
    ('Plátano', 'comida', 1.00),
    ('Gym mensual', 'otro', 115.00),
    ('Chicha', 'bebida', 2.00),
    ('Pollo', 'comida', 42.00),
    ('Huevo 1kg', 'comida', 8.00),
    ('Empanizado', 'comida', 6.00),
    ('Agua sola', 'bebida', 1.20),
    ('Corte de cabello', 'otro', 25.00),
    ('Chicharrón de cerdo', 'comida', 2.50),
    ('Pescado frito', 'comida', 2.00),
    ('Avena', 'comida', 2.00),
    ('Emoliente', 'bebida', 4.00)
) as v(name, default_category, default_price_soles)
where not exists (
  select 1
  from public.expense_items ei
  where ei.user_id is null
    and lower(trim(ei.name)) = lower(trim(v.name))
    and ei.default_category = v.default_category::public.expense_category
);

do $$
declare
  v_user_id uuid;
  v_driver_job_id uuid;
  v_botanico_job_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  select id into v_driver_job_id from public.jobs where code = 'DRIVER';
  select id into v_botanico_job_id from public.jobs where code = 'BOTANICO';

  if v_user_id is null then
    return;
  end if;

  if exists (
    select 1 from public.finance_movements
    where user_id = v_user_id
      and source = 'driver_income'
      and amount_soles = 18.20
      and occurred_at >= '2026-08-24T05:00:00Z'
      and occurred_at < '2026-08-25T05:00:00Z'
  ) then
    return;
  end if;

  -- -------------------------------------------------------------------------
  -- Lun 24-ago
  -- -------------------------------------------------------------------------
  insert into public.finance_movements (
    user_id, job_id, occurred_at, direction, amount_soles,
    payment_method, source, category, label, affects_wallet
  ) values
    (v_user_id, v_driver_job_id, '2026-08-24T09:00:00-05:00', 'in', 18.20, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_driver_job_id, '2026-08-24T11:30:00-05:00', 'in',  9.60, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_botanico_job_id, '2026-08-24T15:00:00-05:00', 'in', 20.00, 'yape', 'income', null, 'Ingreso botánico', false);

  insert into public.finance_movements (
    user_id, occurred_at, direction, amount_soles, source, category, label, expense_item_id, affects_wallet
  )
  select v_user_id, v.occurred_at, 'out', v.amount, 'expense', v.category::public.expense_category, ei.name, ei.id, false
  from (
    values
      ('2026-08-24T10:00:00-05:00'::timestamptz, 1.80, 'bebida', 'Coca Cola Zero'),
      ('2026-08-24T12:00:00-05:00'::timestamptz, 50.00, 'ocio', 'Salir'),
      ('2026-08-24T13:00:00-05:00'::timestamptz,  2.50, 'bebida', 'San Luis saborizada'),
      ('2026-08-24T14:00:00-05:00'::timestamptz,  8.50, 'comida', 'Menú'),
      ('2026-08-24T15:30:00-05:00'::timestamptz,  4.50, 'comida', 'Verdura'),
      ('2026-08-24T17:00:00-05:00'::timestamptz,  5.00, 'comida', 'Fruta')
  ) as v(occurred_at, amount, category, item_name)
  join public.expense_items ei
    on ei.user_id is null
   and ei.name = v.item_name
   and ei.default_category = v.category::public.expense_category;

  -- -------------------------------------------------------------------------
  -- Mar 25-ago
  -- -------------------------------------------------------------------------
  insert into public.finance_movements (
    user_id, job_id, occurred_at, direction, amount_soles,
    payment_method, source, category, label, affects_wallet
  ) values
    (v_user_id, v_driver_job_id, '2026-08-25T09:00:00-05:00', 'in', 17.20, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_driver_job_id, '2026-08-25T12:00:00-05:00', 'in', 14.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_driver_job_id, '2026-08-25T10:00:00-05:00', 'out', 17.00, 'yape', 'driver_expense', 'combustible_gnv'::public.expense_category, 'GNV', false),
    (v_user_id, v_driver_job_id, '2026-08-25T11:00:00-05:00', 'out',  1.50, 'yape', 'driver_expense', 'bano'::public.expense_category, 'Baño', false),
    (v_user_id, v_driver_job_id, '2026-08-25T19:00:00-05:00', 'out',  1.00, 'yape', 'driver_expense', 'bano'::public.expense_category, 'Baño', false);

  insert into public.finance_movements (
    user_id, occurred_at, direction, amount_soles, source, category, label, expense_item_id, affects_wallet
  )
  select v_user_id, v.occurred_at, 'out', v.amount, 'expense', v.category::public.expense_category, ei.name, ei.id, false
  from (
    values
      ('2026-08-25T13:00:00-05:00'::timestamptz, 40.00, 'ocio', 'Salir'),
      ('2026-08-25T14:00:00-05:00'::timestamptz,  3.00, 'bebida', 'Sporade'),
      ('2026-08-25T14:30:00-05:00'::timestamptz,  1.00, 'comida', 'Plátano'),
      ('2026-08-25T15:00:00-05:00'::timestamptz, 115.00, 'otro', 'Gym mensual'),
      ('2026-08-25T16:00:00-05:00'::timestamptz,  2.00, 'bebida', 'Chicha'),
      ('2026-08-25T17:00:00-05:00'::timestamptz,  8.00, 'comida', 'Fruta'),
      ('2026-08-25T18:00:00-05:00'::timestamptz, 42.00, 'comida', 'Pollo'),
      ('2026-08-25T18:30:00-05:00'::timestamptz,  8.00, 'comida', 'Huevo 1kg'),
      ('2026-08-25T19:30:00-05:00'::timestamptz,  6.00, 'comida', 'Empanizado'),
      ('2026-08-25T20:00:00-05:00'::timestamptz,  1.20, 'bebida', 'Agua sola'),
      ('2026-08-25T20:30:00-05:00'::timestamptz, 25.00, 'otro', 'Corte de cabello'),
      ('2026-08-25T21:00:00-05:00'::timestamptz,  2.00, 'bebida', 'Agua de maracuyá')
  ) as v(occurred_at, amount, category, item_name)
  join public.expense_items ei
    on ei.user_id is null
   and ei.name = v.item_name
   and ei.default_category = v.category::public.expense_category;

  -- -------------------------------------------------------------------------
  -- Mié 26-ago
  -- -------------------------------------------------------------------------
  insert into public.finance_movements (
    user_id, job_id, occurred_at, direction, amount_soles,
    payment_method, source, category, label, affects_wallet
  ) values
    (v_user_id, v_driver_job_id, '2026-08-26T09:00:00-05:00', 'in', 21.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_driver_job_id, '2026-08-26T11:00:00-05:00', 'in', 22.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_driver_job_id, '2026-08-26T14:00:00-05:00', 'in', 17.00, 'yape', 'driver_income', null, 'Carrera Yape', false),
    (v_user_id, v_botanico_job_id, '2026-08-26T10:00:00-05:00', 'in', 10.00, 'yape', 'income', null, 'Ingreso botánico', false),
    (v_user_id, v_botanico_job_id, '2026-08-26T12:30:00-05:00', 'in',  5.00, 'yape', 'income', null, 'Ingreso botánico', false),
    (v_user_id, v_botanico_job_id, '2026-08-26T16:00:00-05:00', 'in', 10.00, 'yape', 'income', null, 'Ingreso botánico', false),
    (v_user_id, v_driver_job_id, '2026-08-26T10:30:00-05:00', 'out', 17.00, 'yape', 'driver_expense', 'combustible_gnv'::public.expense_category, 'GNV', false),
    (v_user_id, v_driver_job_id, '2026-08-26T15:00:00-05:00', 'out', 20.00, 'yape', 'driver_expense', 'combustible_gasolina'::public.expense_category, 'Gasolina', false);

  insert into public.finance_movements (
    user_id, occurred_at, direction, amount_soles, source, category, label, expense_item_id, affects_wallet
  )
  select v_user_id, v.occurred_at, 'out', v.amount, 'expense', v.category::public.expense_category, ei.name, ei.id, false
  from (
    values
      ('2026-08-26T11:30:00-05:00'::timestamptz, 2.50, 'bebida', 'San Luis saborizada'),
      ('2026-08-26T13:00:00-05:00'::timestamptz, 1.80, 'bebida', 'Inka Cola Zero'),
      ('2026-08-26T14:30:00-05:00'::timestamptz, 2.50, 'bebida', 'Agua de maracuyá'),
      ('2026-08-26T17:00:00-05:00'::timestamptz, 3.00, 'comida', 'Plátano'),
      ('2026-08-26T18:00:00-05:00'::timestamptz, 4.00, 'bebida', 'Emoliente')
  ) as v(occurred_at, amount, category, item_name)
  join public.expense_items ei
    on ei.user_id is null
   and ei.name = v.item_name
   and ei.default_category = v.category::public.expense_category;

  -- -------------------------------------------------------------------------
  -- Jue 27-ago
  -- -------------------------------------------------------------------------
  insert into public.finance_movements (
    user_id, occurred_at, direction, amount_soles, source, category, label, expense_item_id, affects_wallet
  )
  select v_user_id, v.occurred_at, 'out', v.amount, 'expense', v.category::public.expense_category, ei.name, ei.id, false
  from (
    values
      ('2026-08-27T10:00:00-05:00'::timestamptz, 2.50, 'comida', 'Chicharrón de cerdo'),
      ('2026-08-27T11:00:00-05:00'::timestamptz, 2.00, 'comida', 'Pescado frito'),
      ('2026-08-27T12:00:00-05:00'::timestamptz, 2.00, 'comida', 'Avena'),
      ('2026-08-27T13:00:00-05:00'::timestamptz, 2.50, 'bebida', 'San Luis saborizada'),
      ('2026-08-27T14:00:00-05:00'::timestamptz, 1.80, 'bebida', 'Inka Cola Zero'),
      ('2026-08-27T16:00:00-05:00'::timestamptz, 1.80, 'bebida', 'Inka Cola Zero')
  ) as v(occurred_at, amount, category, item_name)
  join public.expense_items ei
    on ei.user_id is null
   and ei.name = v.item_name
   and ei.default_category = v.category::public.expense_category;

end $$;
