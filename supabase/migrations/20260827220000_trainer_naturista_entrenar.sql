-- Medalla entrenar + jobs Trainer / Naturista + seed usuario prueba

insert into public.medals (code, name, description, sort_order) values
  ('entrenar', 'Entrenar', 'Habilidad para rutinas de entrenamiento.', 2)
on conflict (code) do nothing;

insert into public.jobs (code, name, description, sort_order) values
  ('TRAINER', 'Trainer', 'Entrenamiento físico y rutinas.', 4),
  ('NATURISTA', 'Naturista', 'Nutrición y registro alimentario.', 5)
on conflict (code) do nothing;

-- Backfill user_jobs para perfiles existentes
insert into public.user_jobs (user_id, job_id, status)
select p.id, j.id, 'locked'::public.job_status
from public.profiles p
cross join public.jobs j
where j.code in ('TRAINER', 'NATURISTA')
on conflict (user_id, job_id) do nothing;

-- Nuevos usuarios: incluir todos los jobs
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

  insert into public.user_jobs (user_id, job_id, status, unlocked_at, activated_at)
  select
    new.id,
    j.id,
    case
      when j.code = 'TRAINEE' then 'active'::public.job_status
      else 'locked'::public.job_status
    end,
    case when j.code = 'TRAINEE' then now() else null end,
    case when j.code = 'TRAINEE' then now() else null end
  from public.jobs j
  where j.is_active = true;

  return new;
end;
$$;

-- jcacerespdl@gmail.com: medalla entrenar + jobs Trainer y Naturista activos
do $$
declare
  v_user_id uuid;
  v_entrenar_id uuid;
  v_trainer_job_id uuid;
  v_naturista_job_id uuid;
begin
  select id into v_user_id from public.profiles where email = 'jcacerespdl@gmail.com';
  if v_user_id is null then
    raise notice 'Usuario jcacerespdl@gmail.com no encontrado.';
    return;
  end if;

  select id into v_entrenar_id from public.medals where code = 'entrenar';
  select id into v_trainer_job_id from public.jobs where code = 'TRAINER';
  select id into v_naturista_job_id from public.jobs where code = 'NATURISTA';

  insert into public.user_medals (user_id, medal_id)
  values (v_user_id, v_entrenar_id)
  on conflict (user_id, medal_id) do nothing;

  update public.user_jobs
  set status = 'active',
      unlocked_at = coalesce(unlocked_at, now()),
      activated_at = coalesce(activated_at, now())
  where user_id = v_user_id
    and job_id in (v_trainer_job_id, v_naturista_job_id);
end $$;
