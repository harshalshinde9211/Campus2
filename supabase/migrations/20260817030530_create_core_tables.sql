/*
# CampusSphere Core Schema

1. New Tables
- `profiles` — extends auth.users with role (student/senior/faculty), college, department, branch, semester, graduation year, bio, skills, programming languages, projects, certifications, achievements, social links, XP, level, badges, learning streak, profile completion.
- `notes` — uploaded notes with metadata, approval workflow (pending/approved/rejected), views, downloads, likes, saves, ratings.
- `note_comments` — comments on notes.
- `resources` — study resource center items (chapter notes, important questions, PYQs, reference materials) added by faculty/admin.
- `doubts` — community doubt discussion posts.
- `doubt_answers` — answers to doubts with upvotes/downvotes and best-answer marking.
2. Security
- Enable RLS on all tables.
- Profiles: users can read all profiles, update only their own.
- Notes: anyone authenticated can read approved notes; owners can read their own pending/rejected; owners can insert/update/delete their own.
- Note comments: authenticated can read all, insert own, update/delete own.
- Resources: authenticated can read all; only faculty/admin can insert/update/delete (enforced via profile role check).
- Doubts: authenticated can read all, insert own, update/delete own.
- Doubt answers: authenticated can read all, insert own, update/delete own.
3. Notes
- Owner columns default to auth.uid() so inserts omitting user_id still satisfy RLS.
- Role checks use a profiles.role lookup.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','senior','faculty')),
  avatar_url text DEFAULT '',
  college text DEFAULT '',
  department text DEFAULT '',
  branch text DEFAULT '',
  semester int DEFAULT 1,
  graduation_year int DEFAULT NULL,
  bio text DEFAULT '',
  skills text[] DEFAULT '{}',
  programming_languages text[] DEFAULT '{}',
  projects text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  achievements text[] DEFAULT '{}',
  github text DEFAULT '',
  linkedin text DEFAULT '',
  portfolio text DEFAULT '',
  xp int NOT NULL DEFAULT 0,
  level int NOT NULL DEFAULT 1,
  learning_streak int NOT NULL DEFAULT 0,
  last_activity_date date DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  file_url text NOT NULL,
  file_type text DEFAULT '',
  file_name text DEFAULT '',
  file_size bigint DEFAULT 0,
  subject text DEFAULT '',
  branch text DEFAULT '',
  semester int DEFAULT NULL,
  department text DEFAULT '',
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  rejection_reason text DEFAULT '',
  views int NOT NULL DEFAULT 0,
  downloads int NOT NULL DEFAULT 0,
  likes int NOT NULL DEFAULT 0,
  saves int NOT NULL DEFAULT 0,
  rating_sum numeric NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes_select" ON notes;
CREATE POLICY "notes_select" ON notes FOR SELECT
  TO authenticated USING (
    status = 'approved' OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "notes_insert_own" ON notes;
CREATE POLICY "notes_insert_own" ON notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_update_own" ON notes;
CREATE POLICY "notes_update_own" ON notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notes_delete_own" ON notes;
CREATE POLICY "notes_delete_own" ON notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Note comments
CREATE TABLE IF NOT EXISTS note_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE note_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "note_comments_select" ON note_comments;
CREATE POLICY "note_comments_select" ON note_comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "note_comments_insert_own" ON note_comments;
CREATE POLICY "note_comments_insert_own" ON note_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "note_comments_update_own" ON note_comments;
CREATE POLICY "note_comments_update_own" ON note_comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "note_comments_delete_own" ON note_comments;
CREATE POLICY "note_comments_delete_own" ON note_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  resource_type text NOT NULL DEFAULT 'chapter_notes' CHECK (resource_type IN ('chapter_notes','important_questions','previous_year_questions','reference_materials','study_materials')),
  subject text NOT NULL,
  branch text DEFAULT '',
  semester int DEFAULT NULL,
  department text DEFAULT '',
  file_url text DEFAULT '',
  external_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  views int NOT NULL DEFAULT 0,
  downloads int NOT NULL DEFAULT 0,
  rating_sum numeric NOT NULL DEFAULT 0,
  rating_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resources_select" ON resources;
CREATE POLICY "resources_select" ON resources FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "resources_insert_faculty" ON resources;
CREATE POLICY "resources_insert_faculty" ON resources FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "resources_update_faculty" ON resources;
CREATE POLICY "resources_update_faculty" ON resources FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "resources_delete_faculty" ON resources;
CREATE POLICY "resources_delete_faculty" ON resources FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

-- Doubts
CREATE TABLE IF NOT EXISTS doubts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  subject text DEFAULT '',
  topic text DEFAULT '',
  tags text[] DEFAULT '{}',
  views int NOT NULL DEFAULT 0,
  upvotes int NOT NULL DEFAULT 0,
  downvotes int NOT NULL DEFAULT 0,
  answer_count int NOT NULL DEFAULT 0,
  best_answer_id uuid DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doubts_select" ON doubts;
CREATE POLICY "doubts_select" ON doubts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "doubts_insert_own" ON doubts;
CREATE POLICY "doubts_insert_own" ON doubts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "doubts_update_own" ON doubts;
CREATE POLICY "doubts_update_own" ON doubts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "doubts_delete_own" ON doubts;
CREATE POLICY "doubts_delete_own" ON doubts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Doubt answers
CREATE TABLE IF NOT EXISTS doubt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doubt_id uuid NOT NULL REFERENCES doubts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  upvotes int NOT NULL DEFAULT 0,
  downvotes int NOT NULL DEFAULT 0,
  is_best boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doubt_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doubt_answers_select" ON doubt_answers;
CREATE POLICY "doubt_answers_select" ON doubt_answers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "doubt_answers_insert_own" ON doubt_answers;
CREATE POLICY "doubt_answers_insert_own" ON doubt_answers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "doubt_answers_update_own" ON doubt_answers;
CREATE POLICY "doubt_answers_update_own" ON doubt_answers FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "doubt_answers_delete_own" ON doubt_answers;
CREATE POLICY "doubt_answers_delete_own" ON doubt_answers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notes_status ON notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON notes(subject);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON resources(subject);
CREATE INDEX IF NOT EXISTS idx_doubts_subject ON doubts(subject);
CREATE INDEX IF NOT EXISTS idx_doubt_answers_doubt ON doubt_answers(doubt_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_note ON note_comments(note_id);
