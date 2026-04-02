update first_timers
set form_submitted_at = created_at
where form_submitted_at is null;
