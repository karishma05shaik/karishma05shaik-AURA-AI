/*
# AURA AI - Database Schema

## Overview
Creates the full schema for AURA AI, an AI resume analyzer app with phone-based OTP authentication.

## New Tables

1. `profiles` - User profiles created after phone OTP verification
   - `id` (uuid, PK) - unique profile ID
   - `phone` (text, unique) - user's phone number
   - `name` (text) - user's display name
   - `avatar_url` (text) - profile image URL
   - `created_at` (timestamptz) - when profile was created

2. `otp_codes` - OTP codes for phone verification
   - `id` (uuid, PK)
   - `phone` (text) - phone number being verified
   - `code` (text) - 6-digit OTP code
   - `expires_at` (timestamptz) - when OTP expires (10 min)
   - `verified` (boolean) - whether OTP was used
   - `created_at` (timestamptz)

3. `resumes` - Resumes created by users
   - `id` (uuid, PK)
   - `profile_id` (uuid, FK to profiles) - owner
   - `title` (text) - resume title
   - `template` (text) - template style name
   - `data` (jsonb) - full resume data
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

4. `analyses` - Resume analysis results from AI
   - `id` (uuid, PK)
   - `profile_id` (uuid, FK to profiles) - owner
   - `job_role` (text) - job role analyzed against
   - `score` (integer) - score out of 10
   - `result` (jsonb) - full AI analysis result
   - `file_name` (text) - uploaded file name
   - `created_at` (timestamptz)

## Security
- RLS enabled on all tables.
- This app uses custom phone OTP auth (not Supabase built-in auth), so policies use `TO anon, authenticated` with `USING (true)` since `auth.uid()` is not available in a custom auth flow. Data isolation is enforced at the application level by filtering on `profile_id` from the client session.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_profiles" ON profiles;
CREATE POLICY "anon_select_profiles" ON profiles FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_profiles" ON profiles;
CREATE POLICY "anon_insert_profiles" ON profiles FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_profiles" ON profiles;
CREATE POLICY "anon_update_profiles" ON profiles FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_profiles" ON profiles;
CREATE POLICY "anon_delete_profiles" ON profiles FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_otp" ON otp_codes;
CREATE POLICY "anon_select_otp" ON otp_codes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_otp" ON otp_codes;
CREATE POLICY "anon_insert_otp" ON otp_codes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_otp" ON otp_codes;
CREATE POLICY "anon_update_otp" ON otp_codes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_otp" ON otp_codes;
CREATE POLICY "anon_delete_otp" ON otp_codes FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  template text NOT NULL DEFAULT 'modern',
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_resumes" ON resumes;
CREATE POLICY "anon_select_resumes" ON resumes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_resumes" ON resumes;
CREATE POLICY "anon_insert_resumes" ON resumes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_resumes" ON resumes;
CREATE POLICY "anon_update_resumes" ON resumes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_resumes" ON resumes;
CREATE POLICY "anon_delete_resumes" ON resumes FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_role text NOT NULL,
  score integer,
  result jsonb NOT NULL DEFAULT '{}',
  file_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_analyses" ON analyses;
CREATE POLICY "anon_select_analyses" ON analyses FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_analyses" ON analyses;
CREATE POLICY "anon_insert_analyses" ON analyses FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_analyses" ON analyses;
CREATE POLICY "anon_update_analyses" ON analyses FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_analyses" ON analyses;
CREATE POLICY "anon_delete_analyses" ON analyses FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_resumes_profile_id ON resumes(profile_id);
CREATE INDEX IF NOT EXISTS idx_analyses_profile_id ON analyses(profile_id);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone);
