-- The age can no longer be typed in: it only follows from the date of birth
-- (see the previous migration). Kept separate so a running app that still
-- writes the age keeps working until its next release is live.
revoke update (age) on public.profiles from authenticated;
