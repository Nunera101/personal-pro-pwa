create extension if not exists pgcrypto;

create table if not exists app_collections (
  name text primary key,
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists trainers (
  id text primary key,
  name text not null,
  email text unique,
  phone text,
  password_hash text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id text primary key,
  trainer_id text references trainers(id) on delete cascade,
  student_id text,
  role text not null check (role in ('manager', 'student')),
  name text not null,
  email text not null unique,
  password_hash text,
  status text not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists students (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  status text not null default 'active',
  objective text,
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists exercises (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  name text not null,
  muscle_group text,
  equipment text,
  description text,
  technical_notes text,
  video_url text,
  video_storage text,
  video_key text,
  video_name text,
  video_size bigint,
  status text not null default 'active',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workouts (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  student_id text references students(id) on delete set null,
  title text not null,
  description text,
  focus text,
  status text not null default 'draft',
  published_at timestamptz,
  archived_at timestamptz,
  exercises jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activities (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  student_id text references students(id) on delete set null,
  workout_id text references workouts(id) on delete set null,
  type text not null default 'workout',
  title text not null,
  activity_date date not null,
  start_time text,
  end_time text,
  status text not null default 'scheduled',
  completed_session_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists workout_sessions (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  student_id text references students(id) on delete set null,
  workout_id text references workouts(id) on delete set null,
  activity_id text references activities(id) on delete set null,
  started_at timestamptz,
  finished_at timestamptz,
  volume_load numeric not null default 0,
  exercises jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists updates (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  student_id text references students(id) on delete set null,
  status text not null default 'pending',
  due_date date,
  submitted_at timestamptz,
  viewed_at timestamptz,
  weight numeric,
  energy_level integer,
  discomfort_level integer,
  workout_notes text,
  diet_notes text,
  general_notes text,
  photos jsonb not null default '[]'::jsonb,
  response text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contracts (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  student_id text references students(id) on delete set null,
  title text not null,
  body text not null,
  version text not null default '1',
  status text not null default 'pending',
  viewed_at timestamptz,
  signed_at timestamptz,
  canceled_at timestamptz,
  technical_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  trainer_id text not null references trainers(id) on delete cascade,
  student_id text references students(id) on delete set null,
  sender_role text not null check (sender_role in ('manager', 'student')),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists media_uploads (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  trainer_id text references trainers(id) on delete set null,
  owner_type text not null,
  owner_id text,
  url text not null,
  original_name text,
  size_bytes bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id text primary key default encode(gen_random_bytes(12), 'hex'),
  trainer_id text references trainers(id) on delete set null,
  actor_id text,
  actor_role text,
  action text not null,
  entity_type text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into trainers (id, name, email, settings)
values (
  'trainer-demo',
  'Personal Pro',
  'admin@personalpro.app',
  '{"whatsappMessage":"Olá {aluno}, passando para lembrar sua atividade de {data} às {hora}: {atividade}."}'::jsonb
)
on conflict (id) do nothing;

create index if not exists users_trainer_id_idx on users(trainer_id);
create index if not exists users_student_id_idx on users(student_id);
create index if not exists students_trainer_id_idx on students(trainer_id);
create index if not exists exercises_trainer_id_status_idx on exercises(trainer_id, status);
create index if not exists workouts_trainer_student_idx on workouts(trainer_id, student_id);
create index if not exists workouts_status_idx on workouts(status);
create index if not exists activities_trainer_date_idx on activities(trainer_id, activity_date);
create index if not exists activities_student_date_idx on activities(student_id, activity_date);
create index if not exists workout_sessions_student_finished_idx on workout_sessions(student_id, finished_at);
create index if not exists updates_student_status_idx on updates(student_id, status);
create index if not exists contracts_student_status_idx on contracts(student_id, status);
create index if not exists messages_student_created_idx on messages(student_id, created_at);
