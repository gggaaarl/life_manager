-- Pecho implica deltoide anterior en el mismo ejercicio.

update public.exercises
set muscle_group_ids = (
  select array_agg(distinct id order by id)
  from unnest(muscle_group_ids || array[3::smallint]) as id
)
where 1 = any (muscle_group_ids)
  and not (3 = any (muscle_group_ids));
