-- ==============================================================================================
-- EduCore - Complete Database Schema
-- Run this in a fresh Supabase project via SQL Editor or Supabase CLI
-- ==============================================================================================

-- 0. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- CUSTOM ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN', 
    'SCHOOL_ADMIN', 
    'CLASS_TEACHER', 
    'SUBJECT_TEACHER', 
    'BURSAR', 
    'PARENT', 
    'STUDENT'
);

CREATE TYPE student_status_type AS ENUM (
    'Active', 
    'Inactive', 
    'Alumni', 
    'Withdrawn', 
    'Graduated'
);

CREATE TYPE attendance_status AS ENUM (
    'Present', 
    'Absent', 
    'Late', 
    'Excused'
);

CREATE TYPE payment_method_type AS ENUM (
    'Cash', 
    'Mobile Money', 
    'Bank Transfer', 
    'Card', 
    'Other'
);

CREATE TYPE fee_status_type AS ENUM (
    'Unpaid', 
    'Partial', 
    'Paid'
);

CREATE TYPE gender_type AS ENUM (
    'Male', 
    'Female'
);

CREATE TYPE year_status_type AS ENUM (
    'active', 
    'closed'
);

CREATE TYPE term_status_type AS ENUM (
    'upcoming', 
    'active', 
    'closed'
);

CREATE TYPE history_outcome_type AS ENUM (
    'promoted', 
    'repeated', 
    'graduated', 
    'withdrawn', 
    'active'
);

CREATE TYPE announcement_target_type AS ENUM (
    'all', 
    'class'
);

CREATE TYPE notification_channel_type AS ENUM (
    'sms', 
    'whatsapp', 
    'email'
);

CREATE TYPE notification_status_type AS ENUM (
    'sent', 
    'failed', 
    'pending'
);

-- ==========================================
-- TRIGGER FUNCTIONS (Utility)
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TABLES
-- ==========================================

-- 1. schools
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    motto TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. profiles (links to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    whatsapp_number TEXT,
    role user_role NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. academic_years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status year_status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. terms
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    term_number INTEGER NOT NULL CHECK (term_number IN (1, 2, 3)),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    fee_due_date DATE NOT NULL,
    status term_status_type DEFAULT 'upcoming',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. classes
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 50,
    class_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. class_subjects
CREATE TABLE class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, subject_id, academic_year_id)
);

-- 8. students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    admission_number TEXT NOT NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    photo_url TEXT,
    address TEXT,
    blood_group TEXT,
    medical_notes TEXT,
    previous_school TEXT,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status student_status_type DEFAULT 'Active',
    withdrawal_date DATE,
    withdrawal_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, admission_number)
);

-- 9. student_class_history
CREATE TABLE student_class_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    outcome history_outcome_type DEFAULT 'active',
    is_current BOOLEAN DEFAULT false,
    enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. guardians
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp_number TEXT,
    email TEXT,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. student_guardians
CREATE TABLE student_guardians (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, guardian_id)
);

-- 12. assessment_types
CREATE TABLE assessment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weight NUMERIC NOT NULL CHECK (weight > 0 AND weight <= 100),
    max_score NUMERIC DEFAULT 100 CHECK (max_score > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    assessment_type_id UUID NOT NULL REFERENCES assessment_types(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    max_score NUMERIC NOT NULL CHECK (max_score > 0),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. grades
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC CHECK (score >= 0),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (assessment_id, student_id)
);

-- 15. attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status NOT NULL,
    remarks TEXT,
    marked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (student_id, date)
);

-- 16. fee_types
CREATE TABLE fee_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. fee_assignments
CREATE TABLE fee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    fee_type_id UUID NOT NULL REFERENCES fee_types(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. student_fees
CREATE TABLE student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    fee_assignment_id UUID NOT NULL REFERENCES fee_assignments(id) ON DELETE CASCADE,
    amount_owed INTEGER NOT NULL CHECK (amount_owed >= 0),
    amount_paid INTEGER DEFAULT 0 CHECK (amount_paid >= 0),
    balance INTEGER GENERATED ALWAYS AS (amount_owed - amount_paid) STORED,
    status fee_status_type DEFAULT 'Unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. fee_payments
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_fee_id UUID NOT NULL REFERENCES student_fees(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method_type NOT NULL,
    reference_number TEXT,
    receipt_number TEXT UNIQUE NOT NULL,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. announcements
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target announcement_target_type NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    send_sms BOOLEAN DEFAULT false,
    send_whatsapp BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. notification_logs
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    recipient_phone TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    channel notification_channel_type NOT NULL,
    type TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status notification_status_type DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_profiles_school_id ON profiles(school_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_academic_years_school_id ON academic_years(school_id);
CREATE INDEX idx_academic_years_is_current ON academic_years(school_id, is_current);
CREATE INDEX idx_terms_school_id ON terms(school_id);
CREATE INDEX idx_terms_academic_year_id ON terms(academic_year_id);
CREATE INDEX idx_terms_status ON terms(school_id, status);
CREATE INDEX idx_classes_school_id ON classes(school_id);
CREATE INDEX idx_classes_teacher ON classes(class_teacher_id);
CREATE INDEX idx_subjects_school_id ON subjects(school_id);
CREATE INDEX idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX idx_class_subjects_teacher ON class_subjects(teacher_id);
CREATE INDEX idx_class_subjects_year ON class_subjects(academic_year_id);
CREATE INDEX idx_students_school_id ON students(school_id);
CREATE INDEX idx_students_admission_number ON students(admission_number);
CREATE INDEX idx_students_status ON students(school_id, status);
CREATE INDEX idx_student_class_history_student ON student_class_history(student_id);
CREATE INDEX idx_student_class_history_class ON student_class_history(class_id);
CREATE INDEX idx_student_class_history_year ON student_class_history(academic_year_id);
CREATE INDEX idx_student_class_history_current ON student_class_history(is_current);
CREATE INDEX idx_guardians_user_id ON guardians(user_id);
CREATE INDEX idx_guardians_school_id ON guardians(school_id);
CREATE INDEX idx_student_guardians_guardian ON student_guardians(guardian_id);
CREATE INDEX idx_assessment_types_school ON assessment_types(school_id);
CREATE INDEX idx_assessments_term ON assessments(term_id);
CREATE INDEX idx_assessments_class ON assessments(class_id);
CREATE INDEX idx_assessments_subject ON assessments(subject_id);
CREATE INDEX idx_assessments_published ON assessments(is_published);
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_assessment_id ON grades(assessment_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_term ON attendance(term_id);
CREATE INDEX idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX idx_fee_types_school ON fee_types(school_id);
CREATE INDEX idx_fee_assignments_term ON fee_assignments(term_id);
CREATE INDEX idx_fee_assignments_class ON fee_assignments(class_id);
CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_student_fees_assignment ON student_fees(fee_assignment_id);
CREATE INDEX idx_student_fees_status ON student_fees(status);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX idx_fee_payments_date ON fee_payments(payment_date);
CREATE INDEX idx_fee_payments_student_fee ON fee_payments(student_fee_id);
CREATE INDEX idx_announcements_school ON announcements(school_id);
CREATE INDEX idx_notification_logs_school ON notification_logs(school_id);
CREATE INDEX idx_notification_logs_type ON notification_logs(type);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Updated At Triggers
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_schools_modtime BEFORE UPDATE ON schools FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_grades_modtime BEFORE UPDATE ON grades FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER update_student_fees_modtime BEFORE UPDATE ON student_fees FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Trigger: auto-update fee status based on payment amounts
CREATE OR REPLACE FUNCTION update_fee_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount_paid >= NEW.amount_owed THEN
        NEW.status = 'Paid';
    ELSIF NEW.amount_paid > 0 THEN
        NEW.status = 'Partial';
    ELSE
        NEW.status = 'Unpaid';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_fees_status
BEFORE INSERT OR UPDATE OF amount_paid, amount_owed ON student_fees
FOR EACH ROW
EXECUTE PROCEDURE update_fee_status();

-- Trigger: create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, school_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT'),
        (NEW.raw_user_meta_data->>'school_id')::uuid
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_class_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS HELPER FUNCTIONS
-- ==========================================

CREATE OR REPLACE FUNCTION auth_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ==========================================
-- RLS POLICIES - SELECT (all authenticated users in same school)
-- ==========================================

-- Schools
CREATE POLICY "Users can read own school" ON schools
  FOR SELECT USING (id = auth_user_school_id());
CREATE POLICY "Super admin can read all schools" ON schools
  FOR SELECT USING (auth_user_role() = 'SUPER_ADMIN');

-- Profiles
CREATE POLICY "Users can read profiles in own school" ON profiles
  FOR SELECT USING (school_id = auth_user_school_id() OR id = auth.uid());
CREATE POLICY "Super admin can read all profiles" ON profiles
  FOR SELECT USING (auth_user_role() = 'SUPER_ADMIN');

-- Academic Years
CREATE POLICY "Users can read academic years in own school" ON academic_years
  FOR SELECT USING (school_id = auth_user_school_id());

-- Terms
CREATE POLICY "Users can read terms in own school" ON terms
  FOR SELECT USING (school_id = auth_user_school_id());

-- Classes
CREATE POLICY "Users can read classes in own school" ON classes
  FOR SELECT USING (school_id = auth_user_school_id());

-- Subjects
CREATE POLICY "Users can read subjects in own school" ON subjects
  FOR SELECT USING (school_id = auth_user_school_id());

-- Class Subjects
CREATE POLICY "Users can read class subjects in own school" ON class_subjects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_subjects.class_id AND classes.school_id = auth_user_school_id())
  );

-- Students
CREATE POLICY "Users can read students in own school" ON students
  FOR SELECT USING (school_id = auth_user_school_id());

-- Student Class History
CREATE POLICY "Users can read student history in own school" ON student_class_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = student_class_history.student_id AND students.school_id = auth_user_school_id())
  );

-- Guardians
CREATE POLICY "Users can read guardians in own school" ON guardians
  FOR SELECT USING (school_id = auth_user_school_id() OR user_id = auth.uid());

-- Student Guardians
CREATE POLICY "Users can read student guardians in own school" ON student_guardians
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = student_guardians.student_id AND students.school_id = auth_user_school_id())
  );

-- Assessment Types
CREATE POLICY "Users can read assessment types in own school" ON assessment_types
  FOR SELECT USING (school_id = auth_user_school_id());

-- Assessments
CREATE POLICY "Users can read assessments in own school" ON assessments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM terms WHERE terms.id = assessments.term_id AND terms.school_id = auth_user_school_id())
  );

-- Grades
CREATE POLICY "Users can read grades in own school" ON grades
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = grades.student_id AND students.school_id = auth_user_school_id())
  );

-- Attendance
CREATE POLICY "Users can read attendance in own school" ON attendance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = attendance.student_id AND students.school_id = auth_user_school_id())
  );

-- Fee Types
CREATE POLICY "Users can read fee types in own school" ON fee_types
  FOR SELECT USING (school_id = auth_user_school_id());

-- Fee Assignments
CREATE POLICY "Users can read fee assignments in own school" ON fee_assignments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = fee_assignments.class_id AND classes.school_id = auth_user_school_id())
  );

-- Student Fees
CREATE POLICY "Users can read student fees in own school" ON student_fees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.school_id = auth_user_school_id())
  );

-- Fee Payments
CREATE POLICY "Users can read fee payments in own school" ON fee_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = fee_payments.student_id AND students.school_id = auth_user_school_id())
  );

-- Announcements
CREATE POLICY "Users can read announcements in own school" ON announcements
  FOR SELECT USING (school_id = auth_user_school_id());

-- Notification Logs
CREATE POLICY "Users can read notification logs in own school" ON notification_logs
  FOR SELECT USING (school_id = auth_user_school_id());

-- ==========================================
-- RLS POLICIES - INSERT/UPDATE/DELETE (role-based)
-- ==========================================

-- Schools: only super_admin can insert/update
CREATE POLICY "Super admin can insert schools" ON schools
  FOR INSERT WITH CHECK (auth_user_role() = 'SUPER_ADMIN');
CREATE POLICY "Super admin can update schools" ON schools
  FOR UPDATE USING (auth_user_role() = 'SUPER_ADMIN' OR id = auth_user_school_id());
CREATE POLICY "Admin can update own school" ON schools
  FOR UPDATE USING (id = auth_user_school_id() AND auth_user_role() = 'SCHOOL_ADMIN');

-- Profiles: admins manage profiles in their school
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admin can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );
CREATE POLICY "Admin can update profiles in school" ON profiles
  FOR UPDATE USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Academic Years: admin manages
CREATE POLICY "Admin can manage academic years" ON academic_years
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Terms: admin manages
CREATE POLICY "Admin can manage terms" ON terms
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Classes: admin manages
CREATE POLICY "Admin can manage classes" ON classes
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Subjects: admin manages
CREATE POLICY "Admin can manage subjects" ON subjects
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Class Subjects: admin manages
CREATE POLICY "Admin can manage class subjects" ON class_subjects
  FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = class_subjects.class_id AND classes.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Students: admin manages
CREATE POLICY "Admin can manage students" ON students
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Student Class History: admin manages
CREATE POLICY "Admin can manage student history" ON student_class_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = student_class_history.student_id AND students.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Guardians: admin manages
CREATE POLICY "Admin can manage guardians" ON guardians
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Student Guardians: admin manages
CREATE POLICY "Admin can manage student guardians" ON student_guardians
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = student_guardians.student_id AND students.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Assessment Types: admin manages
CREATE POLICY "Admin can manage assessment types" ON assessment_types
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN')
  );

-- Assessments: admin and teachers can manage
CREATE POLICY "Staff can manage assessments" ON assessments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM terms WHERE terms.id = assessments.term_id AND terms.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER')
  );

-- Grades: teachers can insert/update grades
CREATE POLICY "Teachers can manage grades" ON grades
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = grades.student_id AND students.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER')
  );

-- Attendance: class teachers can insert/update
CREATE POLICY "Teachers can manage attendance" ON attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = attendance.student_id AND students.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER')
  );

-- Fee Types: admin and bursar manage
CREATE POLICY "Admin/bursar can manage fee types" ON fee_types
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR')
  );

-- Fee Assignments: admin and bursar manage
CREATE POLICY "Admin/bursar can manage fee assignments" ON fee_assignments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM classes WHERE classes.id = fee_assignments.class_id AND classes.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR')
  );

-- Student Fees: admin and bursar manage
CREATE POLICY "Admin/bursar can manage student fees" ON student_fees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR')
  );

-- Fee Payments: admin and bursar can insert
CREATE POLICY "Admin/bursar can manage fee payments" ON fee_payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE students.id = fee_payments.student_id AND students.school_id = auth_user_school_id())
    AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR')
  );

-- Announcements: admin can manage
CREATE POLICY "Admin can manage announcements" ON announcements
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER')
  );

-- Notification Logs: admin can manage
CREATE POLICY "Admin can manage notification logs" ON notification_logs
  FOR ALL USING (
    school_id = auth_user_school_id() AND auth_user_role() IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'BURSAR')
  );
