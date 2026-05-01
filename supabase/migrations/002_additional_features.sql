-- FEATURE 1: TIMETABLE
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
  day_of_week INTEGER NOT NULL 
    CHECK (day_of_week BETWEEN 1 AND 5),
  room TEXT,
  academic_year_id UUID REFERENCES academic_years(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (class_id, time_slot_id, day_of_week, academic_year_id)
);

-- FEATURE 2: EXPENSES & PAYROLL
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
    CHECK (payment_method IN 
      ('cash', 'bank_transfer', 'momo', 'cheque', 'other')),
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
  net_salary INTEGER GENERATED ALWAYS AS 
    (gross_salary - deductions) STORED,
  paid_on DATE,
  payment_method TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (teacher_id, month, year)
);

-- FEATURE 3: HOMEWORK & ASSIGNMENTS
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
    CHECK (status IN 
      ('submitted', 'late', 'graded', 'returned')),
  UNIQUE (assignment_id, student_id)
);

-- FEATURE 4: BEHAVIOUR TRACKER
CREATE TABLE IF NOT EXISTS behavior_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('positive', 'negative')),
  severity INTEGER DEFAULT 1 
    CHECK (severity BETWEEN 1 AND 3),
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

-- FEATURE 5: STAFF ATTENDANCE
CREATE TABLE IF NOT EXISTS staff_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present'
    CHECK (status IN 
      ('present', 'absent', 'late', 'on_leave')),
  arrival_time TIME,
  remarks TEXT,
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (staff_id, date)
);

-- FEATURE 6: LIBRARY
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
    CHECK (status IN ('issued', 'returned', 'overdue')),
  issued_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FEATURE 7: SCHOOL EVENTS CALENDAR
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
    CHECK (event_type IN (
      'general', 'exam', 'holiday', 'sports',
      'pta', 'cultural', 'graduation', 'other'
    )),
  target TEXT DEFAULT 'all'
    CHECK (target IN ('all', 'class', 'staff', 'parents')),
  class_id UUID REFERENCES classes(id),
  notify_parents BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS: authenticated users access their school's data
CREATE POLICY "Users can read time_slots in own school" ON time_slots FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin can manage time_slots" ON time_slots FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');

CREATE POLICY "Users can read timetables in own school" ON timetables FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin can manage timetables" ON timetables FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');

CREATE POLICY "Users can read expense_categories in own school" ON expense_categories FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin/bursar can manage expense_categories" ON expense_categories FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar'));

CREATE POLICY "Users can read expenses in own school" ON expenses FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin/bursar can manage expenses" ON expenses FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar'));

CREATE POLICY "Users can read payroll_records in own school" ON payroll_records FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin/bursar can manage payroll_records" ON payroll_records FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar'));

CREATE POLICY "Users can read assignments in own school" ON assignments FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Staff can manage assignments" ON assignments FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher'));

CREATE POLICY "Users can read assignment_submissions in own school" ON assignment_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.school_id = auth_user_school_id()));
CREATE POLICY "Staff can manage assignment_submissions" ON assignment_submissions FOR ALL USING (EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher'));
CREATE POLICY "Students can insert own submissions" ON assignment_submissions FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE id = student_id AND school_id = auth_user_school_id()));
CREATE POLICY "Students can update own submissions" ON assignment_submissions FOR UPDATE USING (student_id IN (SELECT id FROM students WHERE id = student_id AND school_id = auth_user_school_id()));

CREATE POLICY "Users can read behavior_categories in own school" ON behavior_categories FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin can manage behavior_categories" ON behavior_categories FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');

CREATE POLICY "Users can read behavior_logs in own school" ON behavior_logs FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Staff can manage behavior_logs" ON behavior_logs FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher'));

CREATE POLICY "Users can read staff_attendance in own school" ON staff_attendance FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin can manage staff_attendance" ON staff_attendance FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');

CREATE POLICY "Users can read books in own school" ON books FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin can manage books" ON books FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');

CREATE POLICY "Users can read book_issues in own school" ON book_issues FOR SELECT USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_issues.book_id AND books.school_id = auth_user_school_id()));
CREATE POLICY "Admin can manage book_issues" ON book_issues FOR ALL USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_issues.book_id AND books.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin');

CREATE POLICY "Users can read school_events in own school" ON school_events FOR SELECT USING (school_id = auth_user_school_id());
CREATE POLICY "Admin can manage school_events" ON school_events FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin');
