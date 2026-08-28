-- Cuentas de pago personalizables por usuario (BCP·Yape, BBVA·Plin, etc.)

create table public.user_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  slug text not null,
  label text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create index user_payment_accounts_user_idx on public.user_payment_accounts (user_id, sort_order);

create table public.user_account_balances (
  user_id uuid not null references public.profiles (id) on delete cascade,
  payment_account_id uuid not null references public.user_payment_accounts (id) on delete cascade,
  balance_soles numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, payment_account_id)
);

alter table public.finance_movements
  add column payment_account_id uuid references public.user_payment_accounts (id) on delete set null;

-- Cuentas default para cada perfil
insert into public.user_payment_accounts (user_id, slug, label, sort_order)
select p.id, defs.slug, defs.label, defs.sort_order
from public.profiles p
cross join (
  values
    ('bcp_yape', 'BCP · Yape', 1),
    ('bbva_plin', 'BBVA · Plin', 2),
    ('efectivo', 'Efectivo', 3)
) as defs(slug, label, sort_order)
on conflict (user_id, slug) do nothing;

-- Migrar saldos desde user_wallet_balances
insert into public.user_account_balances (user_id, payment_account_id, balance_soles)
select
  uw.user_id,
  ua.id,
  uw.balance_soles
from public.user_wallet_balances uw
join public.user_payment_accounts ua
  on ua.user_id = uw.user_id
 and ua.slug = case uw.payment_method
    when 'yape' then 'bcp_yape'
    when 'plin' then 'bbva_plin'
    when 'efectivo' then 'efectivo'
    else 'efectivo'
  end
on conflict (user_id, payment_account_id) do update
set balance_soles = excluded.balance_soles;

-- Enlazar movimientos existentes
update public.finance_movements fm
set payment_account_id = ua.id
from public.user_payment_accounts ua
where ua.user_id = fm.user_id
  and fm.payment_account_id is null
  and fm.payment_method is not null
  and ua.slug = case fm.payment_method
    when 'yape' then 'bcp_yape'
    when 'plin' then 'bbva_plin'
    when 'efectivo' then 'efectivo'
    else 'efectivo'
  end;

create or replace function public.apply_movement_to_wallet()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.affects_wallet = false then
    return NEW;
  end if;

  if NEW.payment_account_id is not null then
    insert into public.user_account_balances (user_id, payment_account_id, balance_soles)
    values (NEW.user_id, NEW.payment_account_id, 0)
    on conflict (user_id, payment_account_id) do nothing;

    if NEW.direction = 'in' then
      update public.user_account_balances
      set balance_soles = balance_soles + NEW.amount_soles,
          updated_at = now()
      where user_id = NEW.user_id and payment_account_id = NEW.payment_account_id;
    else
      update public.user_account_balances
      set balance_soles = balance_soles - NEW.amount_soles,
          updated_at = now()
      where user_id = NEW.user_id and payment_account_id = NEW.payment_account_id;
    end if;
    return NEW;
  end if;

  if NEW.payment_method is null then
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

alter table public.user_payment_accounts enable row level security;
alter table public.user_account_balances enable row level security;

create policy "payment_accounts_select_own"
  on public.user_payment_accounts for select to authenticated
  using (user_id = auth.uid());

create policy "payment_accounts_insert_own"
  on public.user_payment_accounts for insert to authenticated
  with check (user_id = auth.uid());

create policy "payment_accounts_update_own"
  on public.user_payment_accounts for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "account_balances_select_own"
  on public.user_account_balances for select to authenticated
  using (user_id = auth.uid());

create policy "account_balances_update_own"
  on public.user_account_balances for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.user_payment_accounts to authenticated;
grant select, insert, update on public.user_account_balances to authenticated;

-- Cuentas extra jcacerespdl@gmail.com
insert into public.user_payment_accounts (user_id, slug, label, sort_order)
select p.id, v.slug, v.label, v.sort_order
from public.profiles p
cross join (
  values
    ('bbva_mama', 'BBVA · mamá', 4),
    ('sip_mama', 'SIP · mamá', 5)
) as v(slug, label, sort_order)
where p.email = 'jcacerespdl@gmail.com'
on conflict (user_id, slug) do nothing;

insert into public.user_account_balances (user_id, payment_account_id, balance_soles)
select p.id, ua.id, 0
from public.profiles p
join public.user_payment_accounts ua on ua.user_id = p.id
where p.email = 'jcacerespdl@gmail.com'
  and ua.slug in ('bbva_mama', 'sip_mama')
on conflict (user_id, payment_account_id) do nothing;
