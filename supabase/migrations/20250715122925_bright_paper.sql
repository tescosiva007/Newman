/*
  # Create Newman application tables

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `created_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `title` (text)
      - `body` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    - `stores`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can insert their own messages"
  ON messages
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can update their own messages"
  ON messages
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

CREATE POLICY "Users can delete their own messages"
  ON messages
  FOR DELETE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));

-- Stores policies (readable by all authenticated users)
CREATE POLICY "Authenticated users can read stores"
  ON stores
  FOR SELECT
  USING (true);

-- Insert sample stores
INSERT INTO stores (name, code) VALUES
  ('Downtown Store', 'DT001'),
  ('Mall Location', 'ML002'),
  ('Airport Branch', 'AB003'),
  ('Suburban Center', 'SC004'),
  ('Business District', 'BD005')
ON CONFLICT (code) DO NOTHING;

-- Insert sample user for testing
INSERT INTO users (email, password) VALUES
  ('test@example.com', 'password123')
ON CONFLICT (email) DO NOTHING;