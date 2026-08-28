-- Mié 26-ago · botánico · mercadería S/50 · jcacerespdl@gmail.com

do $$
declare
  v_user_id uuid;
  v_botanico_job_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  select id into v_botanico_job_id from public.jobs where code = 'BOTANICO';

  if v_user_id is null or v_botanico_job_id is null then
    return;
  end if;

  if exists (
    select 1 from public.finance_movements
    where user_id = v_user_id
      and job_id = v_botanico_job_id
      and label = 'Mercadería'
      and occurred_at >= '2026-08-26T05:00:00Z'
      and occurred_at < '2026-08-27T05:00:00Z'
  ) then
    return;
  end if;

  insert into public.expense_items (name, default_category, default_price_soles)
  select 'Mercadería', 'otro', 50.00
  where not exists (
    select 1 from public.expense_items
    where user_id is null and lower(trim(name)) = 'mercadería'
  );

  insert into public.finance_movements (
    user_id, job_id, occurred_at, direction, amount_soles, source, category, label, expense_item_id, affects_wallet
  )
  select
    v_user_id,
    v_botanico_job_id,
    '2026-08-26T08:30:00-05:00',
    'out',
    50.00,
    'expense',
    'otro',
    'Mercadería',
    ei.id,
    false
  from public.expense_items ei
  where ei.user_id is null and ei.name = 'Mercadería'
  limit 1;
end $$;
