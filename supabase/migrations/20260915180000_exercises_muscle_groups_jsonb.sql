-- Grupos musculares en la fila del ejercicio (jsonb). Sin tablas puente ni catálogo en BD.

alter table public.exercises
  add column if not exists muscle_groups jsonb not null default '[]'::jsonb;

update public.exercises e
set muscle_groups = coalesce(
  (
    select jsonb_agg(mg.code order by mg.sort_order)
    from public.exercise_muscle_groups emg
    join public.muscle_groups mg on mg.id = emg.muscle_group_id
    where emg.exercise_id = e.id
  ),
  '[]'::jsonb
);

update public.exercises
set muscle_groups = '["otro"]'::jsonb
where muscle_groups = '[]'::jsonb;

alter table public.exercises
  add constraint exercises_muscle_groups_is_array
  check (jsonb_typeof(muscle_groups) = 'array');

create index if not exists exercises_muscle_groups_gin_idx
  on public.exercises using gin (muscle_groups);

drop table if exists public.exercise_muscle_groups;
drop table if exists public.muscle_groups;
