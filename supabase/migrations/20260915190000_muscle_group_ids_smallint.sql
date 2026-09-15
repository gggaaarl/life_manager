-- Catálogo de referencia (id int) + array de ids en exercises. Sin tabla puente.

create table if not exists public.muscle_groups (
  id smallint primary key,
  code text not null unique,
  label text not null,
  sort_order smallint not null unique check (sort_order >= 1)
);

insert into public.muscle_groups (id, code, label, sort_order) values
  (1, 'pecho', 'Pecho', 1),
  (2, 'espalda', 'Espalda', 2),
  (3, 'deltoide_lateral', 'Deltoide lateral', 3),
  (14, 'deltoide_frontal', 'Deltoide frontal', 4),
  (15, 'deltoide_posterior', 'Deltoide posterior', 5),
  (4, 'biceps', 'Bíceps', 6),
  (5, 'triceps', 'Tríceps', 7),
  (6, 'cuadriceps', 'Cuádriceps', 8),
  (7, 'isquiotibiales', 'Isquiotibiales', 9),
  (8, 'gluteos', 'Glúteos', 10),
  (9, 'pantorrillas', 'Pantorrillas', 11),
  (10, 'core', 'Core', 12),
  (11, 'antebrazos', 'Antebrazos', 13),
  (12, 'cardio', 'Cardio', 14),
  (13, 'otro', 'Otro', 15)
on conflict (id) do update
set code = excluded.code,
    label = excluded.label,
    sort_order = excluded.sort_order;

alter table public.exercises
  add column if not exists muscle_group_ids smallint[] not null default '{}';

-- Pasar de jsonb (strings) a smallint[] (ids del catálogo).
update public.exercises e
set muscle_group_ids = coalesce(
  (
    select array_agg(mg.id order by mg.sort_order)
    from jsonb_array_elements_text(e.muscle_groups) as t(code)
    join public.muscle_groups mg on mg.code = t.code
  ),
  '{}'::smallint[]
)
where jsonb_typeof(e.muscle_groups) = 'array';

update public.exercises
set muscle_group_ids = '{13}'::smallint[]
where muscle_group_ids = '{}'::smallint[];

alter table public.exercises
  drop column if exists muscle_groups;

drop index if exists public.exercises_muscle_groups_gin_idx;

create index if not exists exercises_muscle_group_ids_gin_idx
  on public.exercises using gin (muscle_group_ids);

alter table public.muscle_groups enable row level security;

drop policy if exists "muscle_groups_select" on public.muscle_groups;
create policy "muscle_groups_select"
  on public.muscle_groups for select to authenticated
  using (true);

grant select on table public.muscle_groups to authenticated;
