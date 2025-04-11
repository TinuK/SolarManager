/*
  # Create Solar Measurements Schema

  1. New Tables
    - `solar_measurements`
      - `id` (uuid, primary key)
      - `timestamp` (timestamptz, not null)
      - `production_kw` (numeric, not null)
      - `consumption_kw` (numeric, not null)
      - `grid_import_kw` (numeric, not null)
      - `grid_export_kw` (numeric, not null)
      - `self_consumption_percent` (numeric, not null)
      - `self_sufficiency_percent` (numeric, not null)
      - `co2_saved_kg` (numeric, not null)
      - `additional_consumer_kw` (numeric, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `solar_measurements` table
    - Add policy for authenticated users to read all data
*/

CREATE TABLE IF NOT EXISTS solar_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL,
  production_kw numeric NOT NULL,
  consumption_kw numeric NOT NULL,
  grid_import_kw numeric NOT NULL,
  grid_export_kw numeric NOT NULL,
  self_consumption_percent numeric NOT NULL,
  self_sufficiency_percent numeric NOT NULL,
  co2_saved_kg numeric NOT NULL,
  additional_consumer_kw numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS solar_measurements_timestamp_idx ON solar_measurements(timestamp);

ALTER TABLE solar_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users"
  ON solar_measurements
  FOR SELECT
  TO authenticated
  USING (true);