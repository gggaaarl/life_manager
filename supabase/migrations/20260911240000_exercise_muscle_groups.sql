-- Un ejercicio puede trabajar más de un músculo (ej. fondos en paralelas: pecho + tríceps).

alter table public.exercises
  add column if not exists muscle_groups public.muscle_group[] not null default '{}';

update public.exercises
set muscle_groups = array[muscle_group]::public.muscle_group[]
where coalesce(cardinality(muscle_groups), 0) = 0;

update public.exercises
set
  muscle_group = 'pecho',
  muscle_groups = array['pecho', 'triceps']::public.muscle_group[]
where lower(name) = 'fondos en paralelas';
