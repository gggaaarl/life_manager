-- Permite crear filas de saldo al asignar una cuenta por primera vez

create policy "account_balances_insert_own"
  on public.user_account_balances for insert to authenticated
  with check (user_id = auth.uid());
