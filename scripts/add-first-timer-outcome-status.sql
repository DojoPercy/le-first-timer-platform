alter table first_timers
add column if not exists followup_outcome_status text
  default 'pending'
  check (followup_outcome_status in ('pending', 'still_deciding', 'fully_joined', 'not_continuing'));

alter table first_timers
add column if not exists joined_confirmed_at timestamptz;

alter table first_timers
add column if not exists outcome_updated_at timestamptz;

update first_timers
set followup_outcome_status = coalesce(followup_outcome_status, 'pending')
where followup_outcome_status is null;
