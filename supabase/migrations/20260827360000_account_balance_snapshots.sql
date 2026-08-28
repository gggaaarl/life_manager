-- Saldos por cuenta en una fecha concreta (snapshot al cerrar / asignar el día)

create table public.user_account_balance_snapshots (
  user_id uuid not null references public.profiles (id) on delete cascade,
  payment_account_id uuid not null references public.user_payment_accounts (id) on delete cascade,
  balance_date date not null,
  balance_soles numeric(12, 2) not null default 0 check (balance_soles >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, payment_account_id, balance_date)
);

create index user_account_balance_snapshots_date_idx
  on public.user_account_balance_snapshots (user_id, balance_date);

alter table public.user_account_balance_snapshots enable row level security;

create policy "account_balance_snapshots_select_own"
  on public.user_account_balance_snapshots for select to authenticated
  using (user_id = auth.uid());

create policy "account_balance_snapshots_insert_own"
  on public.user_account_balance_snapshots for insert to authenticated
  with check (user_id = auth.uid());

create policy "account_balance_snapshots_update_own"
  on public.user_account_balance_snapshots for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.user_account_balance_snapshots to authenticated;

-- Copiar asignaciones actuales como snapshot de hoy (Lima)
insert into public.user_account_balance_snapshots (user_id, payment_account_id, balance_date, balance_soles)
select uab.user_id, uab.payment_account_id, (now() at time zone 'America/Lima')::date, uab.balance_soles
from public.user_account_balances uab
where uab.balance_soles > 0
on conflict (user_id, payment_account_id, balance_date) do nothing;
