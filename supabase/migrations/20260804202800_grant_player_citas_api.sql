-- Fix API access: tables created via SQL need GRANTs for anon/authenticated roles.
-- Without this, PostgREST returns "permission denied for table player_citas".

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.player_citas to authenticated;
grant select, insert, update, delete on table public.player_citas_comentarios to authenticated;
grant select on table public.jobs to authenticated;
grant select, update on table public.user_jobs to authenticated;

grant usage on type public.player_color to anon, authenticated;
grant usage on type public.player_figura to anon, authenticated;
grant usage on type public.player_talla to anon, authenticated;
grant usage on type public.player_comentario_tipo to anon, authenticated;
grant usage on type public.profile_role to anon, authenticated;
grant usage on type public.job_status to anon, authenticated;
