-- Migration 2 tables
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 5),
  room TEXT,
  academic_year_id UUID REFERENCES academic_years(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, time_slot_id, day_of_week, academic_year_id)
);

CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id),
  description TEXT NOT NULL,
  amount INTEGER NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash'
    CHECK (payment_method IN ('cash','bank_transfer','momo','cheque','other')),
  reference TEXT,
  recorded_by UUID REFERENCES profiles(id),
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  gross_salary INTEGER NOT NULL,
  deductions INTEGER DEFAULT 0,
  net_salary INTEGER GENERATED ALWAYS AS (gross_salary - deductions) STORED,
  paid_on DATE,
  payment_method TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, month, year)
);

CREATE TABLE IF NOT EXISTS assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  max_score INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  file_url TEXT,
  text_response TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  score INTEGER,
  feedback TEXT,
  graded_at TIMESTAMPTZ,
  graded_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'submitted'
    CHECK (status IN ('submitted','late','graded','returned')),
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS behavior_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('positive', 'negative')),
  severity INTEGER DEFAULT 1 CHECK (severity BETWEEN 1 AND 3),
  notify_parent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS behavior_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  category_id UUID REFERENCES behavior_categories(id),
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('positive', 'negative')),
  severity INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_by UUID REFERENCES profiles(id),
  parent_notified BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present'
    CHECK (status IN ('present','absent','late','on_leave')),
  arrival_time TIME,
  remarks TEXT,
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, date)
);

CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  category TEXT,
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS book_issues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  issued_on DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  returned_on DATE,
  status TEXT DEFAULT 'issued'
    CHECK (status IN ('issued','returned','overdue')),
  issued_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  location TEXT,
  event_type TEXT DEFAULT 'general'
    CHECK (event_type IN ('general','exam','holiday','sports','pta','cultural','graduation','other')),
  target TEXT DEFAULT 'all'
    CHECK (target IN ('all','class','staff','parents')),
  class_id UUID REFERENCES classes(id),
  notify_parents BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration 4 tables
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

-- Migration 4: admission_applications enhancements
ALTER TABLE admission_applications ADD COLUMN IF NOT EXISTS class_applied_for_id UUID REFERENCES classes(id) ON DELETE SET NULL;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL;

-- Migration 4 helper functions
CREATE OR REPLACE FUNCTION get_grade_letter(score DECIMAL, passmark DECIMAL DEFAULT 50.00)
RETURNS TEXT AS 
DECLARE grade TEXT;
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
 LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_year_result_outcome(p_student_id UUID, p_year_id UUID, p_outcome TEXT)
RETURNS VOID AS 
BEGIN
  UPDATE year_results
  SET outcome = p_outcome, computed_at = NOW()
  WHERE student_id = p_student_id AND academic_year_id = p_year_id;
END;
 LANGUAGE plpgsql;
