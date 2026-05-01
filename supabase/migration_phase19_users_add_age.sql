-- Phase 19: add optional age to users profile
alter table public.users
add column if not exists age integer
check (age is null or (age >= 13 and age <= 120));

comment on column public.users.age is
'Optional user age (13-120). Null when not provided.';
