alter table first_timers
add column if not exists form_submitted_at timestamptz;
