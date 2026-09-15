-- Solo datos: ejercicio Copa (tríceps) + glúteo en piernas/compuestos.

insert into public.exercises (name, muscle_group_ids, user_id, is_active)
select 'Copa', '{6}'::smallint[], null, true
where not exists (
  select 1 from public.exercises where lower(name) = 'copa'
);

update public.exercises
set muscle_group_ids = (
  select array_agg(distinct id order by id)
  from unnest(muscle_group_ids || array[12::smallint]) as id
)
where lower(name) in (
  'sentadilla',
  'sentadilla frontal',
  'zancadas',
  'peso muerto',
  'peso muerto rumano',
  'buenos días'
)
and not (12 = any (muscle_group_ids));
