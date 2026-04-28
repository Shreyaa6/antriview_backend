CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  stats JSONB NOT NULL DEFAULT '{"dsa":{"sessions":0,"progress":0},"hr":{"sessions":0,"progress":0},"dev":{"sessions":0,"progress":0}}',
  history JSONB NOT NULL DEFAULT '[]',
  streak INTEGER NOT NULL DEFAULT 0,
  last_session_date DATE,
  selected_persona TEXT,
  resume_data JSONB,
  skills JSONB NOT NULL DEFAULT '[
    {"label":"OS & Networking","score":0,"color":"#3b82f6"},
    {"label":"Data Structures","score":0,"color":"#10b981"},
    {"label":"System Design","score":0,"color":"#f59e0b"},
    {"label":"Behavioral","score":0,"color":"#8b5cf6"}
  ]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  role TEXT NOT NULL,
  type TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('dsa', 'hr', 'dev')),
  score_text TEXT NOT NULL,
  report JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_email_created_at ON sessions(user_email, created_at DESC);

CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_role TEXT NOT NULL,
  latex_code TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resume_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL UNIQUE REFERENCES resumes(id) ON DELETE CASCADE,
  data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS resume_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  feedback JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_feedback_resume_id ON resume_feedback(resume_id);
