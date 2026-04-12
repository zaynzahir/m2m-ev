-- Optional seed: three Istanbul chargers (run after schema.sql).

insert into public.chargers (lat, lng, price_per_kwh, status, label, description)
values
  (41.0082, 28.9784, 0.15, 'active', 'Zayn''s Driveway Charger', '240V Level 2'),
  (41.0422, 29.0083, 0.18, 'active', 'Beşiktaş Marina', '240V Level 2'),
  (41.0369, 28.9850, 0.12, 'active', 'Sultanahmet Spot', '240V Level 2');
