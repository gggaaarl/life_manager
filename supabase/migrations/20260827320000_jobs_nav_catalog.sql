-- Catálogo de jobs para navegación: desarrollador, trainer, taxi, botánico, player

insert into public.jobs (code, name, description, sort_order, is_active) values
  ('DEVELOPER', 'Desarrollador', 'Desarrollo de software.', 1, true),
  ('BOTANICO', 'Botánico', 'Nutrición y registro alimentario.', 5, true)
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true;

update public.jobs set is_active = false where code in ('TRAINEE', 'NATURISTA');

update public.jobs set name = 'Taxi', description = 'Conducción y carreras.' where code = 'DRIVER';

-- Nuevos usuarios: solo jobs activos del catálogo, todos locked
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

  insert into public.user_jobs (user_id, job_id, status)
  select new.id, j.id, 'locked'::public.job_status
  from public.jobs j
  where j.is_active = true
  on conflict (user_id, job_id) do nothing;

  return new;
end;
$$;

-- jcacerespdl@gmail.com: exactamente 5 jobs activos
do $$
declare
  v_user_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  if v_user_id is null then
    return;
  end if;

  delete from public.user_jobs
  where user_id = v_user_id
    and job_id in (
      select id from public.jobs where code in ('TRAINEE', 'NATURISTA')
    );

  insert into public.user_jobs (user_id, job_id, status, unlocked_at, activated_at)
  select v_user_id, j.id, 'active'::public.job_status, now(), now()
  from public.jobs j
  where j.code in ('DEVELOPER', 'TRAINER', 'DRIVER', 'BOTANICO', 'PLAYER')
  on conflict (user_id, job_id) do update set
    status = 'active'::public.job_status,
    unlocked_at = coalesce(public.user_jobs.unlocked_at, now()),
    activated_at = coalesce(public.user_jobs.activated_at, now());
end $$;
