-- Varias sesiones de entrenamiento por día + catálogo normalizado de grupos musculares.

-- ---------------------------------------------------------------------------
-- Sesiones múltiples por fecha
-- ---------------------------------------------------------------------------
alter table public.workout_sessions
  add column if not exists session_number smallint not null default 1 check (session_number >= 1);

alter table public.workout_sessions
  drop constraint if exists workout_sessions_user_id_session_date_key;

create unique index if not exists workout_sessions_user_date_number_uidx
  on public.workout_sessions (user_id, session_date, session_number);

-- ---------------------------------------------------------------------------
-- Catálogo de grupos musculares (smallint = joins compactos)
-- ---------------------------------------------------------------------------
create table if not exists public.muscle_groups (
  id smallint primary key,
  code text not null unique,
  label text not null,
  sort_order smallint not null unique check (sort_order >= 1)
);

insert into public.muscle_groups (id, code, label, sort_order) values
  (1, 'pecho', 'Pecho', 1),
  (2, 'espalda', 'Espalda', 2),
  (3, 'hombros', 'Hombros', 3),
  (4, 'biceps', 'Bíceps', 4),
  (5, 'triceps', 'Tríceps', 5),
  (6, 'cuadriceps', 'Cuádriceps', 6),
  (7, 'isquiotibiales', 'Isquiotibiales', 7),
  (8, 'gluteos', 'Glúteos', 8),
  (9, 'pantorrillas', 'Pantorrillas', 9),
  (10, 'core', 'Core', 10),
  (11, 'antebrazos', 'Antebrazos', 11),
  (12, 'cardio', 'Cardio', 12),
  (13, 'otro', 'Otro', 13)
on conflict (id) do update
set code = excluded.code,
    label = excluded.label,
    sort_order = excluded.sort_order;

create table if not exists public.exercise_muscle_groups (
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  muscle_group_id smallint not null references public.muscle_groups (id),
  primary key (exercise_id, muscle_group_id)
);

create index if not exists exercise_muscle_groups_group_idx
  on public.exercise_muscle_groups (muscle_group_id);

-- Migrar desde muscle_groups[] / muscle_group
insert into public.exercise_muscle_groups (exercise_id, muscle_group_id)
select distinct e.id, mg.id
from public.exercises e
cross join lateral unnest(
  case
    when coalesce(cardinality(e.muscle_groups), 0) > 0 then e.muscle_groups
    else array[e.muscle_group]::public.muscle_group[]
  end
) as muscle_code
join public.muscle_groups mg on mg.code = muscle_code::text
on conflict do nothing;

drop index if exists public.exercises_muscle_idx;

alter table public.exercises
  drop column if exists muscle_group,
  drop column if exists muscle_groups;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.muscle_groups enable row level security;
alter table public.exercise_muscle_groups enable row level security;

drop policy if exists "muscle_groups_select" on public.muscle_groups;
create policy "muscle_groups_select"
  on public.muscle_groups for select to authenticated
  using (true);

drop policy if exists "exercise_muscle_groups_select" on public.exercise_muscle_groups;
create policy "exercise_muscle_groups_select"
  on public.exercise_muscle_groups for select to authenticated
  using (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_id
        and (e.user_id is null or e.user_id = auth.uid())
    )
  );

drop policy if exists "exercise_muscle_groups_insert_own" on public.exercise_muscle_groups;
create policy "exercise_muscle_groups_insert_own"
  on public.exercise_muscle_groups for insert to authenticated
  with check (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_id and e.user_id = auth.uid()
    )
  );

drop policy if exists "exercise_muscle_groups_delete_own" on public.exercise_muscle_groups;
create policy "exercise_muscle_groups_delete_own"
  on public.exercise_muscle_groups for delete to authenticated
  using (
    exists (
      select 1 from public.exercises e
      where e.id = exercise_id and e.user_id = auth.uid()
    )
  );

grant select on table public.muscle_groups to authenticated;
grant select, insert, delete on table public.exercise_muscle_groups to authenticated;
