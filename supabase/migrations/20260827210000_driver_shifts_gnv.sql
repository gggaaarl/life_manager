-- Turnos de chofer, barras GNV por carrera, categoría saldo app

create table public.driver_shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  work_date date not null,
  shift_number int not null check (shift_number >= 1),
  started_at timestamptz not null,
  ended_at timestamptz,
  break_minutes int not null default 0 check (break_minutes >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, work_date, shift_number)
);

create index driver_shifts_user_date_idx
  on public.driver_shifts (user_id, work_date desc);

alter table public.finance_movements
  add column driver_shift_id uuid references public.driver_shifts (id) on delete set null,
  add column gnv_bar smallint check (gnv_bar is null or (gnv_bar >= 1 and gnv_bar <= 5)),
  add column affects_wallet boolean not null default true;

create index finance_movements_shift_idx
  on public.finance_movements (driver_shift_id)
  where driver_shift_id is not null;

alter type public.expense_category add value if not exists 'app_saldo';

create or replace function public.apply_movement_to_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.payment_method is null or NEW.affects_wallet = false then
    return NEW;
  end if;

  insert into public.user_wallet_balances (user_id, payment_method, balance_soles)
  values (NEW.user_id, NEW.payment_method, 0)
  on conflict (user_id, payment_method) do nothing;

  if NEW.direction = 'in' then
    update public.user_wallet_balances
    set balance_soles = balance_soles + NEW.amount_soles,
        updated_at = now()
    where user_id = NEW.user_id and payment_method = NEW.payment_method;
  else
    update public.user_wallet_balances
    set balance_soles = balance_soles - NEW.amount_soles,
        updated_at = now()
    where user_id = NEW.user_id and payment_method = NEW.payment_method;
  end if;

  return NEW;
end;
$$;

alter table public.driver_shifts enable row level security;

create policy "driver_shifts_select_own"
  on public.driver_shifts for select to authenticated
  using (user_id = auth.uid());

create policy "driver_shifts_insert_own"
  on public.driver_shifts for insert to authenticated
  with check (user_id = auth.uid());

create policy "driver_shifts_update_own"
  on public.driver_shifts for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.driver_shifts to authenticated;
