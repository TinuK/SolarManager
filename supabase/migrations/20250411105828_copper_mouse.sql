/*
  # Add INSERT policy for solar measurements

  1. Security Changes
    - Add policy to allow inserting data into solar_measurements table
    - Policy allows authenticated users to insert new measurements
*/

CREATE POLICY "Allow insert access to authenticated users"
  ON solar_measurements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);