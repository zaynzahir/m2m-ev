-- Host-selected charger OEM (matches Supported chargers slugs in the app).
alter table public.chargers
  add column if not exists charger_brand_slug text;
