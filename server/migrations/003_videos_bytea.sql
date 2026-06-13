create table if not exists videos (
  id text primary key,
  exercise_id text,
  trainer_id text,
  mimetype text not null,
  size_bytes bigint not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
