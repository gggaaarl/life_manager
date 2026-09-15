-- Sustituir "hombros" por deltoide lateral / frontal / posterior.

-- Liberar sort_order 4 y 5 (dos pasos para no chocar con unique sort_order).
update public.muscle_groups
set sort_order = sort_order + 100
where id between 4 and 13;

update public.muscle_groups
set sort_order = sort_order - 98
where id between 4 and 13;

update public.muscle_groups
set code = 'deltoide_lateral',
    label = 'Deltoide lateral'
where id = 3;

insert into public.muscle_groups (id, code, label, sort_order) values
  (14, 'deltoide_frontal', 'Deltoide frontal', 4),
  (15, 'deltoide_posterior', 'Deltoide posterior', 5)
on conflict (id) do update
set code = excluded.code,
    label = excluded.label,
    sort_order = excluded.sort_order;

-- Reasignar ejercicios que apuntaban a hombros (id 3).
update public.exercise_muscle_groups emg
set muscle_group_id = case
  when e.name ilike '%lateral%' then 3
  when e.name ilike '%frontal%' then 14
  when e.name ilike '%militar%' then 14
  when e.name ilike '%pájar%' or e.name ilike '%pajar%' or e.name ilike '%posterior%' then 15
  else 3
end
from public.exercises e
where e.id = emg.exercise_id
  and emg.muscle_group_id = 3;

-- Press arnold trabaja los tres deltoides.
insert into public.exercise_muscle_groups (exercise_id, muscle_group_id)
select e.id, mg.id
from public.exercises e
cross join public.muscle_groups mg
where e.name ilike '%arnold%'
  and mg.id in (3, 14, 15)
on conflict do nothing;
