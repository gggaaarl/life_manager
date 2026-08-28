-- Quitar capital inicial de prueba; saldos en cero hasta registrar movimientos reales.

do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  if v_user_id is null then
    return;
  end if;

  delete from public.finance_movements
  where user_id = v_user_id
    and source = 'opening_balance';

  update public.user_wallet_balances
  set balance_soles = 0,
      updated_at = now()
  where user_id = v_user_id;

  update public.user_account_balances
  set balance_soles = 0,
      updated_at = now()
  where user_id = v_user_id;
end $$;
