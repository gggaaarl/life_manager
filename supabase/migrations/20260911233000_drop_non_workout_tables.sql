-- La app visible es solo registro de ejercicios. Quita jobs, finanzas, citas y comida.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop table if exists
  public.player_citas_comentarios,
  public.player_citas,
  public.job_medal_requirements,
  public.user_medals,
  public.user_jobs,
  public.medals,
  public.finance_movements,
  public.expense_item_aliases,
  public.expense_items,
  public.user_account_balance_snapshots,
  public.user_account_balances,
  public.user_wallet_balances,
  public.user_payment_accounts,
  public.food_items,
  public.jobs
cascade;

drop function if exists public.apply_movement_to_wallet() cascade;
