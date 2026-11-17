-- Run in Supabase SQL Editor. auth.users is the "users" table; user_profiles extends it.
create table user_profiles(id uuid primary key references auth.users on delete cascade, user_id uuid generated always as (id) stored, display_name text, start_weight_kg numeric, target_weight_min numeric default 75, target_weight_max numeric default 80, seeded boolean default false, created_at timestamptz default now());
create table habit_categories(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, name text not null, color text);
create table habits(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, category_id uuid references habit_categories on delete set null, slug text not null, name text not null, target numeric default 1, unit text default 'done', active boolean default true, sort int default 0, created_at timestamptz default now(), unique(user_id,slug));
create table daily_habit_logs(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, habit_id uuid not null references habits on delete cascade, log_date date not null default current_date, value numeric default 0, completed boolean default false, note text, missed_reason text, updated_at timestamptz default now(), unique(habit_id,log_date));
create table habit_subtasks(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, habit_id uuid references habits on delete cascade, name text not null, target_minutes int);
create table daily_subtask_logs(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, subtask_id uuid references habit_subtasks on delete cascade, log_date date default current_date, minutes int default 0, unique(subtask_id,log_date));
create table daily_schedules(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, weekday int, start_time time, end_time time, activity text not null, counts_in_score boolean default false);
create table study_subjects(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, name text not null, unique(user_id,name));
create table study_topics(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, subject_id uuid references study_subjects on delete cascade, name text not null);
create table study_sessions(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, subject_id uuid references study_subjects on delete set null, topic_id uuid references study_topics on delete set null, log_date date not null default current_date, started_at timestamptz, ended_at timestamptz, focus_seconds int not null check(focus_seconds>=0), break_seconds int default 0);
create table pyq_records(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, log_date date default current_date, subject_id uuid references study_subjects on delete set null, topic text, attempted int not null check(attempted>=0), correct int not null check(correct>=0 and correct<=attempted), minutes int default 0);
create table workout_sessions(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, log_date date default current_date, routine text, muscle_group text, duration_min int);
create table workout_exercises(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, session_id uuid references workout_sessions on delete cascade, name text not null, sets int, reps int, weight_kg numeric, done boolean default true);
create table walking_sessions(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, log_date date default current_date, minutes int, steps int, km numeric);
create table weight_records(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, log_date date default current_date, kg numeric not null check(kg>20), unique(user_id,log_date));
create table daily_plans(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, plan_date date not null, priorities text, tasks jsonb default '[]', gate_target_hours numeric, exercise_target text, completed boolean default false, unique(user_id,plan_date));
create table achievements(code text primary key, name text, description text, metric text, threshold int);
create table user_achievements(id uuid primary key default gen_random_uuid(), user_id uuid not null default auth.uid() references auth.users on delete cascade, code text references achievements, earned_at timestamptz default now(), unique(user_id,code));
create table motivational_messages(id serial primary key, message text not null, tone text default 'general');
create table habit_audit(id uuid primary key default gen_random_uuid(), user_id uuid, habit_id uuid, log_date date, old_row jsonb, new_row jsonb, changed_at timestamptz default now());

create index on daily_habit_logs(user_id,log_date); create index on study_sessions(user_id,log_date);
create index on pyq_records(user_id,log_date); create index on walking_sessions(user_id,log_date); create index on workout_sessions(user_id,log_date);

-- RLS: every user-owned table isolated by user_id
do $$ declare t text; begin
 foreach t in array array['user_profiles','habit_categories','habits','daily_habit_logs','habit_subtasks','daily_subtask_logs','daily_schedules','study_subjects','study_topics','study_sessions','pyq_records','workout_sessions','workout_exercises','walking_sessions','weight_records','daily_plans','user_achievements','habit_audit'] loop
  execute format('alter table %I enable row level security',t);
  execute format('create policy own_%1$s on %1$I for all using (user_id=auth.uid()) with check (user_id=auth.uid())',t);
 end loop;
 alter table achievements enable row level security; alter table motivational_messages enable row level security;
 create policy read_ach on achievements for select using (true);
 create policy read_msg on motivational_messages for select using (true);
end $$;

-- Audit trail: edits to past logs are recorded, never silent
create function audit_log() returns trigger language plpgsql security definer as $$
begin if tg_op='UPDATE' then insert into habit_audit(user_id,habit_id,log_date,old_row,new_row) values(old.user_id,old.habit_id,old.log_date,to_jsonb(old),to_jsonb(new)); end if; new.updated_at=now(); return new; end $$;
create trigger t_audit before update on daily_habit_logs for each row execute function audit_log();

-- One cumulative study timer drives GATE 3h / 5h / 7h habits automatically
create function sync_gate() returns trigger language plpgsql security definer as $$
declare u uuid; d date; hrs numeric; h record;
begin
 u:=coalesce(new.user_id,old.user_id); d:=coalesce(new.log_date,old.log_date);
 select coalesce(sum(focus_seconds),0)/3600.0 into hrs from study_sessions where user_id=u and log_date=d;
 for h in select id,target from habits where user_id=u and slug in ('gate3','gate5','gate7') loop
  insert into daily_habit_logs(user_id,habit_id,log_date,value,completed) values(u,h.id,d,round(hrs,2),hrs>=h.target)
  on conflict(habit_id,log_date) do update set value=excluded.value, completed=excluded.completed;
 end loop; return null; end $$;
create trigger t_gate after insert or update or delete on study_sessions for each row execute function sync_gate();

-- First-login setup: creates the 10 core habits
create function seed_user() returns void language plpgsql security definer as $$
declare u uuid:=auth.uid();
begin
 insert into user_profiles(id) values(u) on conflict do nothing;
 if exists(select 1 from habits where user_id=u) then return; end if;
 insert into habits(user_id,slug,name,target,unit,sort) values
 (u,'wake','Wake up at 6 AM',1,'done',1),(u,'meditation','Meditation (20 min)',20,'min',2),(u,'exercise','Exercise routine',1,'done',3),
 (u,'gate3','GATE 3 hours',3,'h',4),(u,'gate5','GATE 5 hours',5,'h',5),(u,'gate7','GATE 7 hours',7,'h',6),
 (u,'walking','Walking',1,'done',7),(u,'gym','Gym / home workout',1,'done',8),(u,'pyq','PYQ practice',1,'done',9),(u,'plan','Plan next day',1,'done',10);
end $$;

insert into achievements values('first','First Step','Complete your first day','days',1),('streak3','3-Day Warrior','3 successful days in a row','streak',3),('streak7','7-Day Discipline','7-day streak','streak',7),('streak30','30-Day Consistency','30-day streak','streak',30),('gate100','GATE Focus','100 study hours','gate_hours',100),('fit10','Fitness Starter','10 workouts','workouts',10),('pyq500','PYQ Master','500 questions solved','pyq',500);
insert into motivational_messages(message,tone) values('Small steps every day create extraordinary results.','general'),('You don''t need a perfect day. You need a consistent one.','general'),('One more day closer to GATE 2027.','general'),('Your future is built by what you do today.','general'),('A missed day is just data. Restart with one small habit now.','recovery');
