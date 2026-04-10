-- ========================================
-- Galt Platform - Initial Schema
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------
-- Authorized emails (managed by admin via Supabase dashboard)
-- ----------------------------------------
CREATE TABLE authorized_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Professors
-- ----------------------------------------
CREATE TABLE professors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo_url TEXT,
  whatsapp TEXT,
  grande_area TEXT NOT NULL CHECK (grande_area IN (
    'Clínica Médica',
    'Cirurgia Geral',
    'Medicina Preventiva',
    'Pediatria',
    'Ginecologia e Obstetrícia'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Classes
-- ----------------------------------------
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
  grande_tema TEXT NOT NULL,
  subtema TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Class time slots
-- ----------------------------------------
CREATE TABLE class_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------
-- Row Level Security
-- ----------------------------------------
ALTER TABLE authorized_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_slots ENABLE ROW LEVEL SECURITY;

-- Authorized emails: read-only for authenticated
CREATE POLICY "authorized_emails_select"
  ON authorized_emails FOR SELECT
  TO authenticated
  USING (true);

-- Professors: public read, owner write
CREATE POLICY "professors_select_public"
  ON professors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "professors_insert_own"
  ON professors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "professors_update_own"
  ON professors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Classes: public read active, owner full access
CREATE POLICY "classes_select_public"
  ON classes FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "classes_select_authenticated"
  ON classes FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR professor_id IN (SELECT id FROM professors WHERE user_id = auth.uid())
  );

CREATE POLICY "classes_insert_own"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (professor_id IN (
    SELECT id FROM professors WHERE user_id = auth.uid()
  ));

CREATE POLICY "classes_update_own"
  ON classes FOR UPDATE
  TO authenticated
  USING (professor_id IN (
    SELECT id FROM professors WHERE user_id = auth.uid()
  ));

CREATE POLICY "classes_delete_own"
  ON classes FOR DELETE
  TO authenticated
  USING (professor_id IN (
    SELECT id FROM professors WHERE user_id = auth.uid()
  ));

-- Class slots: public read, owner write
CREATE POLICY "slots_select_public"
  ON class_slots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "slots_insert_own"
  ON class_slots FOR INSERT
  TO authenticated
  WITH CHECK (class_id IN (
    SELECT c.id FROM classes c
    JOIN professors p ON c.professor_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "slots_update_own"
  ON class_slots FOR UPDATE
  TO authenticated
  USING (class_id IN (
    SELECT c.id FROM classes c
    JOIN professors p ON c.professor_id = p.id
    WHERE p.user_id = auth.uid()
  ));

CREATE POLICY "slots_delete_own"
  ON class_slots FOR DELETE
  TO authenticated
  USING (class_id IN (
    SELECT c.id FROM classes c
    JOIN professors p ON c.professor_id = p.id
    WHERE p.user_id = auth.uid()
  ));

-- ----------------------------------------
-- Storage buckets
-- ----------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('professor-photos', 'professor-photos', true),
  ('class-thumbnails', 'class-thumbnails', true);

CREATE POLICY "storage_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('professor-photos', 'class-thumbnails'));

CREATE POLICY "storage_auth_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('professor-photos', 'class-thumbnails'));

CREATE POLICY "storage_auth_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('professor-photos', 'class-thumbnails'));

CREATE POLICY "storage_auth_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('professor-photos', 'class-thumbnails'));

-- ----------------------------------------
-- Indexes
-- ----------------------------------------
CREATE INDEX idx_classes_professor ON classes(professor_id);
CREATE INDEX idx_slots_class ON class_slots(class_id);
CREATE INDEX idx_slots_date ON class_slots(date);
CREATE INDEX idx_professors_user ON professors(user_id);

-- ----------------------------------------
-- Updated_at trigger
-- ----------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER professors_updated_at
  BEFORE UPDATE ON professors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
