-- Migration 004: Academic Lifecycle — Promotion System, Results Computation, Graduation
-- Run in Supabase SQL Editor

-- ============================================================
-- 1. PROMOTION RULES (per-class pass/fail thresholds)
-- ============================================================
CREATE TABLE IF NOT EXISTS promotion_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  min_avg_score DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  min_subject_score DECIMAL(5,2) NOT NULL DEFAULT 40.00,
  require_all_subjects BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (school_id, class_id)
);

ALTER TABLE promotion_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School admin manages promotion_rules" ON promotion_rules
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin')
  );
CREATE POLICY "Authenticated users read promotion_rules" ON promotion_rules
  FOR SELECT USING (school_id = auth_user_school_id());

-- ============================================================
-- 2. TERM RESULTS (computed per-student per-term averages)
-- ============================================================
CREATE TABLE IF NOT EXISTS term_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  total_score DECIMAL(10,2) DEFAULT 0,
  max_score DECIMAL(10,2) DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  grade_letter TEXT DEFAULT 'F',
  position INTEGER,
  passed BOOLEAN DEFAULT false,
  subject_count INTEGER DEFAULT 0,
  subjects_passed INTEGER DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, term_id)
);

ALTER TABLE term_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read term_results" ON term_results
  FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin','class_teacher','subject_teacher'));
CREATE POLICY "School admin manages term_results" ON term_results
  FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');

CREATE INDEX IF NOT EXISTS idx_term_results_student ON term_results(student_id);
CREATE INDEX IF NOT EXISTS idx_term_results_term ON term_results(term_id);
CREATE INDEX IF NOT EXISTS idx_term_results_class ON term_results(class_id);

-- ============================================================
-- 3. YEAR RESULTS (computed per-student per-year aggregates)
-- ============================================================
CREATE TABLE IF NOT EXISTS year_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term1_avg DECIMAL(5,2) DEFAULT 0,
  term2_avg DECIMAL(5,2) DEFAULT 0,
  term3_avg DECIMAL(5,2) DEFAULT 0,
  yearly_avg DECIMAL(5,2) DEFAULT 0,
  max_score DECIMAL(10,2) DEFAULT 0,
  grade_letter TEXT DEFAULT 'F',
  position INTEGER,
  passed BOOLEAN DEFAULT false,
  outcome TEXT DEFAULT 'pending'
    CHECK (outcome IN ('promoted','repeated','graduated','withdrawn','pending')),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, academic_year_id)
);

ALTER TABLE year_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read year_results" ON year_results
  FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin','class_teacher','subject_teacher'));
CREATE POLICY "School admin manages year_results" ON year_results
  FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');

CREATE INDEX IF NOT EXISTS idx_year_results_student ON year_results(student_id);
CREATE INDEX IF NOT EXISTS idx_year_results_year ON year_results(academic_year_id);

-- ============================================================
-- 4. GRADUATION RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS graduation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  graduation_date DATE NOT NULL,
  certificate_number TEXT UNIQUE,
  class_completed UUID REFERENCES classes(id) ON DELETE SET NULL,
  final_avg DECIMAL(5,2) DEFAULT 0,
  grade_letter TEXT DEFAULT 'A',
  ceremony_attended BOOLEAN DEFAULT false,
  certificate_issued BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE graduation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School admin manages graduation_records" ON graduation_records
  FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin'));
CREATE POLICY "Parents read own children's graduation records" ON graduation_records
  FOR SELECT USING (
    school_id = auth_user_school_id() AND auth_user_role() = 'parent' AND
    EXISTS (
      SELECT 1 FROM student_guardians sg
      WHERE sg.student_id = graduation_records.student_id
        AND sg.guardian_id IN (
          SELECT id FROM guardians WHERE user_id = auth.uid()
        )
    )
  );

-- ============================================================
-- 5. PROMOTION AUDIT TRAIL
-- ============================================================
CREATE TABLE IF NOT EXISTS promotion_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  from_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  to_class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('promoted','repeated','graduated','withdrawn')),
  previous_avg DECIMAL(5,2),
  final_avg DECIMAL(5,2),
  promotion_rule_id UUID REFERENCES promotion_rules(id) ON DELETE SET NULL,
  fee_cleared BOOLEAN DEFAULT false,
  override_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  override_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE promotion_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "School admin manages promotion_audits" ON promotion_audits
  FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin'));
CREATE POLICY "Authenticated users read promotion_audits" ON promotion_audits
  FOR SELECT USING (school_id = auth_user_school_id());

CREATE INDEX IF NOT EXISTS idx_promotion_audits_student ON promotion_audits(student_id);
CREATE INDEX IF NOT EXISTS idx_promotion_audits_year ON promotion_audits(academic_year_id);

-- ============================================================
-- 6. ENHANCEMENT: attempt_number on grades (track repeats)
-- ============================================================
ALTER TABLE grades ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- ============================================================
-- 7. ENHANCEMENT: student withdrawal reason + date fields
-- ============================================================
ALTER TABLE students ALTER COLUMN withdrawal_date DROP NOT NULL;
ALTER TABLE students ALTER COLUMN withdrawal_reason DROP NOT NULL;

-- ============================================================
-- 8. ENHANCEMENT: admission applications FK to classes
-- ============================================================
ALTER TABLE admission_applications ADD COLUMN IF NOT EXISTS class_applied_for_id UUID REFERENCES classes(id) ON DELETE SET NULL;

-- ============================================================
-- 9. Helper function: grade letter from score
-- ============================================================
CREATE OR REPLACE FUNCTION get_grade_letter(score DECIMAL, passmark DECIMAL DEFAULT 50.00)
RETURNS TEXT AS $$
DECLARE
  grade TEXT;
BEGIN
  IF score >= 90 THEN grade := 'A+';
  ELSIF score >= 80 THEN grade := 'A';
  ELSIF score >= 75 THEN grade := 'B+';
  ELSIF score >= 70 THEN grade := 'B';
  ELSIF score >= 65 THEN grade := 'C+';
  ELSIF score >= 60 THEN grade := 'C';
  ELSIF score >= 55 THEN grade := 'D+';
  ELSIF score >= 50 THEN grade := 'D';
  ELSIF score >= passmark THEN grade := 'E';
  ELSE grade := 'F';
  END IF;
  RETURN grade;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 10. Helper function: update year_result outcome
-- ============================================================
CREATE OR REPLACE FUNCTION update_year_result_outcome(p_student_id UUID, p_year_id UUID, p_outcome TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE year_results
  SET outcome = p_outcome, computed_at = NOW()
  WHERE student_id = p_student_id AND academic_year_id = p_year_id;
END;
$$ LANGUAGE plpgsql;
