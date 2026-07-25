-- Jobs catalog + user_jobs (N jobs per user)
-- TRAINEE (1), DRIVER (2), PLAYER (3)

create type public.job_status as enum ('locked', 'unlocked', 'active');

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  status public.job_status not null default 'locked',
  unlocked_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index user_jobs_user_status_idx on public.user_jobs (user_id, status);

create trigger user_jobs_set_updated_at
before update on public.user_jobs
for each row execute function public.set_updated_at();

-- Seed catalog
insert into public.jobs (code, name, description, sort_order) values
  ('TRAINEE', 'Trainee', 'Job inicial del juego.', 1),
  ('DRIVER', 'Driver', 'Pendiente de especificar (logística / movilidad).', 2),
  ('PLAYER', 'Player', 'Historial de citas con categorías, puntajes y comentarios.', 3);

-- Seed jobs for every existing profile
-- TRAINEE starts active; DRIVER and PLAYER locked
insert into public.user_jobs (user_id, job_id, status, unlocked_at, activated_at)
select
  p.id,
  j.id,
  case
    when j.code = 'TRAINEE' then 'active'::public.job_status
    else 'locked'::public.job_status
  end,
  case when j.code = 'TRAINEE' then now() else null end,
  case when j.code = 'TRAINEE' then now() else null end
from public.profiles p
cross join public.jobs j;

-- On new signup: create profile (existing) + seed user_jobs
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
  );

  insert into public.user_jobs (user_id, job_id, status, unlocked_at, activated_at)
  select
    new.id,
    j.id,
    case
      when j.code = 'TRAINEE' then 'active'::public.job_status
      else 'locked'::public.job_status
    end,
    case when j.code = 'TRAINEE' then now() else null end,
    case when j.code = 'TRAINEE' then now() else null end
  from public.jobs j
  where j.is_active = true;

  return new;
end;
$$;

-- RLS
alter table public.jobs enable row level security;
alter table public.user_jobs enable row level security;

create policy "jobs_select_authenticated"
  on public.jobs for select
  to authenticated
  using (true);

create policy "user_jobs_select_own"
  on public.user_jobs for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_jobs_update_own"
  on public.user_jobs for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
