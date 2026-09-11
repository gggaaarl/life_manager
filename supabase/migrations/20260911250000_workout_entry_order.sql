-- Orden de ejercicios: 1..n por sesión, único, según el momento en que se agregaron.

update public.workout_entries
set sort_order = sort_order + 100000;

with ranked as (
  select
    id,
    row_number() over (
      partition by session_id
      order by created_at, id
    ) as n
  from public.workout_entries
)
update public.workout_entries e
set sort_order = ranked.n
from ranked
where e.id = ranked.id;

create unique index if not exists workout_entries_session_sort_uidx
  on public.workout_entries (session_id, sort_order);
