-- Catálogo 1–14 en orden acordado. Sin "otro". deltoide_frontal → deltoide_anterior.

create or replace function public.remap_muscle_group_id(old_id smallint)
returns smallint
language sql
immutable
as $$
  select case old_id
    when 1 then 1
    when 2 then 2
    when 3 then 4
    when 14 then 3
    when 15 then 5
    when 5 then 6
    when 4 then 7
    when 11 then 8
    when 10 then 9
    when 6 then 10
    when 7 then 11
    when 8 then 12
    when 9 then 13
    when 12 then 14
    else null
  end;
$$;

update public.exercises e
set muscle_group_ids = coalesce(
  (
    select array_agg(distinct mapped.new_id order by mapped.new_id)
    from unnest(e.muscle_group_ids) as old_id
    cross join lateral (
      select public.remap_muscle_group_id(old_id) as new_id
    ) mapped
    where mapped.new_id is not null
  ),
  '{}'::smallint[]
);

update public.exercises
set muscle_group_ids = '{1}'::smallint[]
where muscle_group_ids = '{}'::smallint[];

delete from public.muscle_groups;

insert into public.muscle_groups (id, code, label, sort_order) values
  (1, 'pecho', 'Pecho', 1),
  (2, 'espalda', 'Espalda', 2),
  (3, 'deltoide_anterior', 'Deltoide anterior', 3),
  (4, 'deltoide_lateral', 'Deltoide lateral', 4),
  (5, 'deltoide_posterior', 'Deltoide posterior', 5),
  (6, 'triceps', 'Tríceps', 6),
  (7, 'biceps', 'Bíceps', 7),
  (8, 'antebrazos', 'Antebrazos', 8),
  (9, 'core', 'Core', 9),
  (10, 'cuadriceps', 'Cuádriceps', 10),
  (11, 'isquiotibiales', 'Isquiotibiales', 11),
  (12, 'gluteos', 'Glúteos', 12),
  (13, 'pantorrillas', 'Pantorrillas', 13),
  (14, 'cardio', 'Cardio', 14);

drop function public.remap_muscle_group_id(smallint);
