-- ============================================================
-- LifeOS Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ========================
-- 1. CUSTOM ENUM TYPES
-- ========================

CREATE TYPE task_status AS ENUM (
  'pending', 'in_progress', 'completed', 'cancelled', 'deferred'
);

CREATE TYPE task_priority AS ENUM (
  'low', 'medium', 'high', 'urgent'
);

CREATE TYPE world_type AS ENUM (
  'general', 'finance', 'development', 'creative', 'health', 'education', 'social', 'gaming'
);

CREATE TYPE ai_personality AS ENUM (
  'manager', 'coach', 'strategist', 'mentor', 'analyst'
);

CREATE TYPE ai_tone AS ENUM (
  'professional', 'friendly', 'direct', 'encouraging', 'calm'
);

CREATE TYPE surface_texture AS ENUM (
  'rocky', 'oceanic', 'gaseous', 'crystalline', 'volcanic', 'lush', 'frozen', 'metallic'
);


-- ========================
-- 2. PROFILES TABLE
-- ========================
-- Auto-created from Supabase Auth users

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ========================
-- 3. WORLDS TABLE
-- ========================

CREATE TABLE worlds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  color_theme       TEXT NOT NULL DEFAULT '#3b82f6',
  icon              TEXT NOT NULL DEFAULT 'briefcase',
  world_type        world_type NOT NULL DEFAULT 'general',
  ai_personality    ai_personality NOT NULL DEFAULT 'manager',
  ai_tone           ai_tone NOT NULL DEFAULT 'professional',
  surface_texture   surface_texture NOT NULL DEFAULT 'rocky',
  is_pinned         BOOLEAN NOT NULL DEFAULT false,
  task_count        INTEGER NOT NULL DEFAULT 0,
  urgent_task_count INTEGER NOT NULL DEFAULT 0,
  completed_today   INTEGER NOT NULL DEFAULT 0,
  energy_used       INTEGER NOT NULL DEFAULT 0,
  energy_limit      INTEGER NOT NULL DEFAULT 100,
  position_x        REAL NOT NULL DEFAULT 0,
  position_y        REAL NOT NULL DEFAULT 0,
  position_z        REAL NOT NULL DEFAULT 0,
  size_factor       REAL NOT NULL DEFAULT 1,
  glow_intensity    REAL NOT NULL DEFAULT 0.5,
  orbit_speed       REAL NOT NULL DEFAULT 1,
  rotation_speed    REAL NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_worlds_user_id ON worlds(user_id);


-- ========================
-- 4. MOONS TABLE
-- ========================

CREATE TABLE moons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_world_id   UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  color_theme       TEXT NOT NULL DEFAULT '#8b5cf6',
  icon              TEXT NOT NULL DEFAULT 'star',
  task_count        INTEGER NOT NULL DEFAULT 0,
  urgent_task_count INTEGER NOT NULL DEFAULT 0,
  completed_today   INTEGER NOT NULL DEFAULT 0,
  energy_used       INTEGER NOT NULL DEFAULT 0,
  energy_limit      INTEGER NOT NULL DEFAULT 50,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_moons_parent_world ON moons(parent_world_id);
CREATE INDEX idx_moons_user_id ON moons(user_id);


-- ========================
-- 5. TASKS TABLE
-- ========================
-- Unified table: world tasks have world_id set, moon tasks have both world_id and moon_id set

CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id          UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  moon_id           UUID REFERENCES moons(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  status            task_status NOT NULL DEFAULT 'pending',
  priority          task_priority NOT NULL DEFAULT 'medium',
  energy_cost       INTEGER NOT NULL DEFAULT 1,
  due_date          TIMESTAMPTZ,
  scheduled_date    TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  parent_task_id    UUID REFERENCES tasks(id) ON DELETE SET NULL,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  notes             TEXT,
  is_recurring      BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern JSONB,
  estimated_minutes INTEGER,
  actual_minutes    INTEGER,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_world_id ON tasks(world_id);
CREATE INDEX idx_tasks_moon_id ON tasks(moon_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;


-- ========================
-- 6. WORLD SECTIONS TABLE
-- ========================

CREATE TABLE world_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id      UUID NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  color_theme   TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_world_sections_world_id ON world_sections(world_id);


-- ========================
-- 7. NOTEBOOK ENTRIES TABLE
-- ========================

CREATE TABLE notebook_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id    UUID REFERENCES worlds(id) ON DELETE CASCADE,
  moon_id     UUID REFERENCES moons(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT '',
  content     TEXT NOT NULL,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT notebook_has_parent CHECK (world_id IS NOT NULL OR moon_id IS NOT NULL)
);

CREATE INDEX idx_notebook_world_id ON notebook_entries(world_id);
CREATE INDEX idx_notebook_moon_id ON notebook_entries(moon_id);
CREATE INDEX idx_notebook_user_id ON notebook_entries(user_id);


-- ========================
-- 8. UPDATED_AT TRIGGER
-- ========================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_worlds_updated_at
  BEFORE UPDATE ON worlds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_moons_updated_at
  BEFORE UPDATE ON moons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_notebook_updated_at
  BEFORE UPDATE ON notebook_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
