/*
  # Create allowed users table

  1. New Tables
    - `allowed_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `allowed_users` table
    - Add policy for authenticated users to read their own data
*/

CREATE TABLE IF NOT EXISTS allowed_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON allowed_users
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = email);