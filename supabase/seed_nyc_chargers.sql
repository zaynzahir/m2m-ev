-- Sample chargers in New York (Manhattan / Brooklyn / Queens).
-- Run in Supabase SQL Editor after schema.sql (and other migrations).
-- Map default view is ~40.7128, -74.006 — these pins cluster nearby so users see markers immediately.

insert into public.chargers (
  lat,
  lng,
  price_per_kwh,
  status,
  label,
  title,
  plug_type,
  description,
  parking_instructions
)
values
  (
    40.7589,
    -73.9851,
    0.18,
    'active',
    'Times Square Block',
    'Midtown curbside · Level 2',
    'Level 2 · 240V',
    'Short-stay EV spot near Theater District.',
    'Street parking; respect posted limits.'
  ),
  (
    40.7484,
    -73.9857,
    0.22,
    'active',
    'Empire corridor host',
    'Koreatown driveway',
    'Level 2 · 240V',
    'Residential charger, 2 hr max when busy.',
    'Ring bell on arrival.'
  ),
  (
    40.7074,
    -74.0113,
    0.17,
    'active',
    'FiDi fast slot',
    'Lower Manhattan garage node',
    'Level 2 · 240V',
    'Covered garage; height limit 2.1m.',
    'Use visitor gate code in app notes.'
  ),
  (
    40.7282,
    -73.9942,
    0.16,
    'active',
    'East Village lane',
    'EVA 6th St driveway',
    'Level 2 · 240V',
    'Quiet block; overnight OK weekends.',
    'Pull forward to avoid sidewalk.'
  ),
  (
    40.6782,
    -73.9442,
    0.15,
    'active',
    'Clinton Hill charge',
    'Brooklyn brownstone',
    'Level 2 · 240V',
    'Shared driveway with 110V trickle second port.',
    'Do not block neighbor garage.'
  ),
  (
    40.7081,
    -73.9571,
    0.19,
    'active',
    'Williamsburg waterfront',
    'North 7th shared lot',
    'Level 2 · 240V',
    'Lot closes 11pm; overnight by request.',
    'Park in marked EV bay only.'
  ),
  (
    40.7447,
    -73.9485,
    0.20,
    'active',
    'LIC industrial row',
    'Queens courtyard',
    'Level 2 · 240V',
    'Commercial strip; weekend access.',
    'Gate arm opens on session start.'
  );
