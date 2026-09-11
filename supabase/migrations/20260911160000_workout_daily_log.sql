-- Registro diario de ejercicios (sets + sub sets myorep / drop set / cluster)

create type public.muscle_group as enum (
  'pecho',
  'espalda',
  'hombros',
  'biceps',
  'triceps',
  'cuadriceps',
  'isquiotibiales',
  'gluteos',
  'pantorrillas',
  'core',
  'antebrazos',
  'cardio',
  'otro'
);

create type public.set_kind as enum (
  'regular',
  'myorep',
  'drop_set',
  'cluster'
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  name text not null,
  muscle_group public.muscle_group not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index exercises_catalog_name_idx
  on public.exercises (lower(name))
  where user_id is null;

create unique index exercises_user_name_idx
  on public.exercises (user_id, lower(name))
  where user_id is not null;

create index exercises_muscle_idx on public.exercises (muscle_group, name);

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, session_date)
);

create trigger workout_sessions_set_updated_at
before update on public.workout_sessions
for each row execute function public.set_updated_at();

create table public.workout_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id, exercise_id)
);

create index workout_entries_session_idx
  on public.workout_entries (session_id, sort_order);

create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.workout_entries (id) on delete cascade,
  set_number int not null check (set_number >= 1),
  subset_number int not null default 1 check (subset_number >= 1),
  set_kind public.set_kind not null default 'regular',
  weight_kg numeric(8, 2),
  reps int check (reps is null or reps >= 0),
  rir numeric(4, 1) check (rir is null or (rir >= 0 and rir <= 10)),
  created_at timestamptz not null default now(),
  unique (entry_id, set_number, subset_number)
);

create index workout_sets_entry_idx
  on public.workout_sets (entry_id, set_number, subset_number);

insert into public.exercises (name, muscle_group) values
  ('Press banca', 'pecho'),
  ('Press banca inclinado', 'pecho'),
  ('Press banca declinado', 'pecho'),
  ('Aperturas con mancuernas', 'pecho'),
  ('Aperturas en máquina', 'pecho'),
  ('Fondos en paralelas', 'pecho'),
  ('Crossover en polea', 'pecho'),
  ('Dominadas', 'espalda'),
  ('Jalón al pecho', 'espalda'),
  ('Remo con barra', 'espalda'),
  ('Remo con mancuerna', 'espalda'),
  ('Remo sentado', 'espalda'),
  ('Peso muerto', 'espalda'),
  ('Face pull', 'espalda'),
  ('Press militar', 'hombros'),
  ('Press arnold', 'hombros'),
  ('Elevaciones laterales', 'hombros'),
  ('Elevaciones frontales', 'hombros'),
  ('Pájaros', 'hombros'),
  ('Curl con barra', 'biceps'),
  ('Curl con mancuernas', 'biceps'),
  ('Curl martillo', 'biceps'),
  ('Curl predicador', 'biceps'),
  ('Press francés', 'triceps'),
  ('Extensión en polea', 'triceps'),
  ('Patada de tríceps', 'triceps'),
  ('Fondos de tríceps', 'triceps'),
  ('Sentadilla', 'cuadriceps'),
  ('Sentadilla frontal', 'cuadriceps'),
  ('Prensa', 'cuadriceps'),
  ('Zancadas', 'cuadriceps'),
  ('Extensión de cuádriceps', 'cuadriceps'),
  ('Peso muerto rumano', 'isquiotibiales'),
  ('Curl femoral', 'isquiotibiales'),
  ('Buenos días', 'isquiotibiales'),
  ('Hip thrust', 'gluteos'),
  ('Puente de glúteo', 'gluteos'),
  ('Patada de glúteo', 'gluteos'),
  ('Elevación de gemelos de pie', 'pantorrillas'),
  ('Elevación de gemelos sentado', 'pantorrillas'),
  ('Plancha', 'core'),
  ('Crunch', 'core'),
  ('Elevación de piernas', 'core'),
  ('Rueda abdominal', 'core'),
  ('Curl de muñeca', 'antebrazos'),
  ('Cinta', 'cardio'),
  ('Bicicleta', 'cardio'),
  ('Elíptica', 'cardio');

alter table public.exercises enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_entries enable row level security;
alter table public.workout_sets enable row level security;

create policy "exercises_select"
  on public.exercises for select to authenticated
  using (user_id is null or user_id = auth.uid());

create policy "exercises_insert_own"
  on public.exercises for insert to authenticated
  with check (user_id = auth.uid());

create policy "exercises_update_own"
  on public.exercises for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "exercises_delete_own"
  on public.exercises for delete to authenticated
  using (user_id = auth.uid());

create policy "workout_sessions_select_own"
  on public.workout_sessions for select to authenticated
  using (user_id = auth.uid());

create policy "workout_sessions_insert_own"
  on public.workout_sessions for insert to authenticated
  with check (user_id = auth.uid());

create policy "workout_sessions_update_own"
  on public.workout_sessions for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "workout_sessions_delete_own"
  on public.workout_sessions for delete to authenticated
  using (user_id = auth.uid());

create policy "workout_entries_select_own"
  on public.workout_entries for select to authenticated
  using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "workout_entries_insert_own"
  on public.workout_entries for insert to authenticated
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "workout_entries_update_own"
  on public.workout_entries for update to authenticated
  using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "workout_entries_delete_own"
  on public.workout_entries for delete to authenticated
  using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "workout_sets_select_own"
  on public.workout_sets for select to authenticated
  using (
    exists (
      select 1
      from public.workout_entries e
      join public.workout_sessions s on s.id = e.session_id
      where e.id = entry_id and s.user_id = auth.uid()
    )
  );

create policy "workout_sets_insert_own"
  on public.workout_sets for insert to authenticated
  with check (
    exists (
      select 1
      from public.workout_entries e
      join public.workout_sessions s on s.id = e.session_id
      where e.id = entry_id and s.user_id = auth.uid()
    )
  );

create policy "workout_sets_update_own"
  on public.workout_sets for update to authenticated
  using (
    exists (
      select 1
      from public.workout_entries e
      join public.workout_sessions s on s.id = e.session_id
      where e.id = entry_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.workout_entries e
      join public.workout_sessions s on s.id = e.session_id
      where e.id = entry_id and s.user_id = auth.uid()
    )
  );

create policy "workout_sets_delete_own"
  on public.workout_sets for delete to authenticated
  using (
    exists (
      select 1
      from public.workout_entries e
      join public.workout_sessions s on s.id = e.session_id
      where e.id = entry_id and s.user_id = auth.uid()
    )
  );

grant usage on type public.muscle_group to anon, authenticated;
grant usage on type public.set_kind to anon, authenticated;

grant select, insert, update, delete on table public.exercises to authenticated;
grant select, insert, update, delete on table public.workout_sessions to authenticated;
grant select, insert, update, delete on table public.workout_entries to authenticated;
grant select, insert, update, delete on table public.workout_sets to authenticated;
