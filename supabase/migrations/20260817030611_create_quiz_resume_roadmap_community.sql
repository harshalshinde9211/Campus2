/*
# CampusSphere Schema Part 2 — Quizzes, Resumes, Roadmaps, Community, Gamification

1. New Tables
- `quizzes` — quiz metadata created by faculty/admin.
- `quiz_questions` — MCQ questions with options, correct answer, explanation.
- `quiz_attempts` — student quiz attempts with score, percentage, time spent.
- `resumes` — saved resume versions with JSON data.
- `career_roadmaps` — predefined roadmap data per career (stored as JSONB phases).
- `roadmap_progress` — user progress on roadmap tasks.
- `hackathons` — hackathon listings.
- `hackathon_registrations` — user registrations for hackathons.
- `community_posts` — community discussion posts.
- `community_comments` — comments on community posts.
- `mentorship_requests` — junior-to-senior mentorship requests.
- `notifications` — user notifications.
- `user_notes` — saved/bookmarked notes per user (likes/saves).
2. Security
- Enable RLS on all tables.
- Quizzes/questions: authenticated read all; faculty insert/update/delete.
- Quiz attempts: authenticated read own, insert own, update own.
- Resumes: authenticated CRUD own.
- Career roadmaps: authenticated read all.
- Roadmap progress: authenticated CRUD own.
- Hackathons: authenticated read all; faculty insert/update/delete; registrations read own/insert own/delete own.
- Community posts/comments: authenticated read all, insert own, update/delete own.
- Mentorship requests: requester can read own + insert; senior can read requests targeting them + update status.
- Notifications: authenticated CRUD own.
- User notes (likes/saves): authenticated read own, insert own, delete own.
*/

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  subject text NOT NULL,
  topic text DEFAULT '',
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
  duration_minutes int NOT NULL DEFAULT 30,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quizzes_select" ON quizzes;
CREATE POLICY "quizzes_select" ON quizzes FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "quizzes_insert_faculty" ON quizzes;
CREATE POLICY "quizzes_insert_faculty" ON quizzes FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "quizzes_update_faculty" ON quizzes;
CREATE POLICY "quizzes_update_faculty" ON quizzes FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "quizzes_delete_faculty" ON quizzes;
CREATE POLICY "quizzes_delete_faculty" ON quizzes FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_index int NOT NULL,
  explanation text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_questions_select" ON quiz_questions;
CREATE POLICY "quiz_questions_select" ON quiz_questions FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "quiz_questions_insert_faculty" ON quiz_questions;
CREATE POLICY "quiz_questions_insert_faculty" ON quiz_questions FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "quiz_questions_update_faculty" ON quiz_questions;
CREATE POLICY "quiz_questions_update_faculty" ON quiz_questions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "quiz_questions_delete_faculty" ON quiz_questions;
CREATE POLICY "quiz_questions_delete_faculty" ON quiz_questions FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

-- Quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  total_questions int NOT NULL DEFAULT 0,
  percentage numeric NOT NULL DEFAULT 0,
  time_spent_seconds int NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_attempts_select_own" ON quiz_attempts;
CREATE POLICY "quiz_attempts_select_own" ON quiz_attempts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempts_insert_own" ON quiz_attempts;
CREATE POLICY "quiz_attempts_insert_own" ON quiz_attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempts_update_own" ON quiz_attempts;
CREATE POLICY "quiz_attempts_update_own" ON quiz_attempts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_attempts_delete_own" ON quiz_attempts;
CREATE POLICY "quiz_attempts_delete_own" ON quiz_attempts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Resumes
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Resume',
  template text NOT NULL DEFAULT 'modern' CHECK (template IN ('modern','minimal','professional','developer','student','internship')),
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resumes_select_own" ON resumes;
CREATE POLICY "resumes_select_own" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_insert_own" ON resumes;
CREATE POLICY "resumes_insert_own" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_update_own" ON resumes;
CREATE POLICY "resumes_update_own" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "resumes_delete_own" ON resumes;
CREATE POLICY "resumes_delete_own" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Career roadmaps (predefined content)
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  career_key text NOT NULL UNIQUE,
  career_name text NOT NULL,
  description text DEFAULT '',
  phases jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "career_roadmaps_select" ON career_roadmaps;
CREATE POLICY "career_roadmaps_select" ON career_roadmaps FOR SELECT
  TO authenticated USING (true);

-- Roadmap progress
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  career_key text NOT NULL,
  task_id text NOT NULL,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, career_key, task_id)
);

ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roadmap_progress_select_own" ON roadmap_progress;
CREATE POLICY "roadmap_progress_select_own" ON roadmap_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmap_progress_insert_own" ON roadmap_progress;
CREATE POLICY "roadmap_progress_insert_own" ON roadmap_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmap_progress_update_own" ON roadmap_progress;
CREATE POLICY "roadmap_progress_update_own" ON roadmap_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmap_progress_delete_own" ON roadmap_progress;
CREATE POLICY "roadmap_progress_delete_own" ON roadmap_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Hackathons
CREATE TABLE IF NOT EXISTS hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  organizer text DEFAULT '',
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  location text DEFAULT 'Online',
  website_url text DEFAULT '',
  prize text DEFAULT '',
  tags text[] DEFAULT '{}',
  max_team_size int DEFAULT 4,
  registration_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hackathons_select" ON hackathons;
CREATE POLICY "hackathons_select" ON hackathons FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "hackathons_insert_faculty" ON hackathons;
CREATE POLICY "hackathons_insert_faculty" ON hackathons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "hackathons_update_faculty" ON hackathons;
CREATE POLICY "hackathons_update_faculty" ON hackathons FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

DROP POLICY IF EXISTS "hackathons_delete_faculty" ON hackathons;
CREATE POLICY "hackathons_delete_faculty" ON hackathons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'faculty')
  );

-- Hackathon registrations
CREATE TABLE IF NOT EXISTS hackathon_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  team_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE (hackathon_id, user_id)
);

ALTER TABLE hackathon_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hackathon_registrations_select" ON hackathon_registrations;
CREATE POLICY "hackathon_registrations_select" ON hackathon_registrations FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "hackathon_registrations_insert_own" ON hackathon_registrations;
CREATE POLICY "hackathon_registrations_insert_own" ON hackathon_registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "hackathon_registrations_delete_own" ON hackathon_registrations;
CREATE POLICY "hackathon_registrations_delete_own" ON hackathon_registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  upvotes int NOT NULL DEFAULT 0,
  downvotes int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts_select" ON community_posts;
CREATE POLICY "community_posts_select" ON community_posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "community_posts_insert_own" ON community_posts;
CREATE POLICY "community_posts_insert_own" ON community_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_posts_update_own" ON community_posts;
CREATE POLICY "community_posts_update_own" ON community_posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_posts_delete_own" ON community_posts;
CREATE POLICY "community_posts_delete_own" ON community_posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Community comments
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_comments_select" ON community_comments;
CREATE POLICY "community_comments_select" ON community_comments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "community_comments_insert_own" ON community_comments;
CREATE POLICY "community_comments_insert_own" ON community_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_comments_update_own" ON community_comments;
CREATE POLICY "community_comments_update_own" ON community_comments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "community_comments_delete_own" ON community_comments;
CREATE POLICY "community_comments_delete_own" ON community_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Mentorship requests
CREATE TABLE IF NOT EXISTS mentorship_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  junior_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  senior_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mentorship_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentorship_select" ON mentorship_requests;
CREATE POLICY "mentorship_select" ON mentorship_requests FOR SELECT
  TO authenticated USING (auth.uid() = junior_id OR auth.uid() = senior_id);

DROP POLICY IF EXISTS "mentorship_insert_own" ON mentorship_requests;
CREATE POLICY "mentorship_insert_own" ON mentorship_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = junior_id);

DROP POLICY IF EXISTS "mentorship_update_own" ON mentorship_requests;
CREATE POLICY "mentorship_update_own" ON mentorship_requests FOR UPDATE
  TO authenticated USING (auth.uid() = junior_id OR auth.uid() = senior_id) WITH CHECK (auth.uid() = junior_id OR auth.uid() = senior_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  message text DEFAULT '',
  link text DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- User notes (likes/saves/bookmarks)
CREATE TABLE IF NOT EXISTS user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  note_id uuid NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  liked boolean NOT NULL DEFAULT false,
  saved boolean NOT NULL DEFAULT false,
  rated int DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, note_id)
);

ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_notes_select_own" ON user_notes;
CREATE POLICY "user_notes_select_own" ON user_notes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_notes_insert_own" ON user_notes;
CREATE POLICY "user_notes_insert_own" ON user_notes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_notes_update_own" ON user_notes;
CREATE POLICY "user_notes_update_own" ON user_notes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_notes_delete_own" ON user_notes;
CREATE POLICY "user_notes_delete_own" ON user_notes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_user ON roadmap_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hackathons_start ON hackathons(start_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id);
