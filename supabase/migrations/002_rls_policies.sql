-- ============================================================
-- Row Level Security Policies
-- Run this AFTER 001_initial_schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE moons ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notebook_entries ENABLE ROW LEVEL SECURITY;


-- ========================
-- PROFILES
-- ========================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ========================
-- WORLDS
-- ========================

CREATE POLICY "Users can view own worlds"
  ON worlds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own worlds"
  ON worlds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own worlds"
  ON worlds FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own worlds"
  ON worlds FOR DELETE
  USING (auth.uid() = user_id);


-- ========================
-- MOONS
-- ========================

CREATE POLICY "Users can view own moons"
  ON moons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own moons"
  ON moons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moons"
  ON moons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own moons"
  ON moons FOR DELETE
  USING (auth.uid() = user_id);


-- ========================
-- TASKS
-- ========================

CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);


-- ========================
-- WORLD SECTIONS
-- ========================

CREATE POLICY "Users can view own world sections"
  ON world_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM worlds WHERE worlds.id = world_sections.world_id AND worlds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own world sections"
  ON world_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM worlds WHERE worlds.id = world_sections.world_id AND worlds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own world sections"
  ON world_sections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM worlds WHERE worlds.id = world_sections.world_id AND worlds.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own world sections"
  ON world_sections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM worlds WHERE worlds.id = world_sections.world_id AND worlds.user_id = auth.uid()
    )
  );


-- ========================
-- NOTEBOOK ENTRIES
-- ========================

CREATE POLICY "Users can view own notebook entries"
  ON notebook_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notebook entries"
  ON notebook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notebook entries"
  ON notebook_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notebook entries"
  ON notebook_entries FOR DELETE
  USING (auth.uid() = user_id);
