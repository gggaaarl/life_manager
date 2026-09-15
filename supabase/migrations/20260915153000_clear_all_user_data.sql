-- Demo en blanco: quita todos los registros de usuarios.
-- Conserva el catálogo global de ejercicios (user_id is null).

truncate table public.workout_sessions cascade;

delete from public.exercises
where user_id is not null;

delete from public.profiles;

delete from auth.users;
