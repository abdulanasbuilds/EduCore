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
-- RLS POLICIES (all wrapped in DO $$ for re-run safety)
-- ==========================================

DO $$ BEGIN CREATE POLICY "Users can read own school" ON schools FOR SELECT USING (id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read profiles in own school" ON profiles FOR SELECT USING (school_id = auth_user_school_id() OR id = auth.uid()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read academic years in own school" ON academic_years FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read terms in own school" ON terms FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read classes in own school" ON classes FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read subjects in own school" ON subjects FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read class subjects in own school" ON class_subjects FOR SELECT USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_subjects.class_id AND classes.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read students in own school" ON students FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read student history in own school" ON student_class_history FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_class_history.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read guardians in own school" ON guardians FOR SELECT USING (school_id = auth_user_school_id() OR user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read student guardians in own school" ON student_guardians FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_guardians.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read assessment types in own school" ON assessment_types FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read assessments in own school" ON assessments FOR SELECT USING (EXISTS (SELECT 1 FROM terms WHERE terms.id = assessments.term_id AND terms.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read grades in own school" ON grades FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = grades.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read attendance in own school" ON attendance FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = attendance.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read fee types in own school" ON fee_types FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read fee assignments in own school" ON fee_assignments FOR SELECT USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = fee_assignments.class_id AND classes.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read student fees in own school" ON student_fees FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read fee payments in own school" ON fee_payments FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = fee_payments.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read announcements in own school" ON announcements FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read notification logs in own school" ON notification_logs FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE POLICY "Admin can update own school" ON schools FOR UPDATE USING (id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can insert profiles" ON profiles FOR INSERT WITH CHECK (auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can update profiles in school" ON profiles FOR UPDATE USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage academic years" ON academic_years FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage terms" ON terms FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage classes" ON classes FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage subjects" ON subjects FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage class subjects" ON class_subjects FOR ALL USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_subjects.class_id AND classes.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage students" ON students FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage student history" ON student_class_history FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_class_history.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage guardians" ON guardians FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage student guardians" ON student_guardians FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_guardians.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage assessment types" ON assessment_types FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Staff can manage assessments" ON assessments FOR ALL USING (EXISTS (SELECT 1 FROM terms WHERE terms.id = assessments.term_id AND terms.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Teachers can manage grades" ON grades FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = grades.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Teachers can manage attendance" ON attendance FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = attendance.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/bursar can manage fee types" ON fee_types FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/bursar can manage fee assignments" ON fee_assignments FOR ALL USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = fee_assignments.class_id AND classes.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/bursar can manage student fees" ON student_fees FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/bursar can manage fee payments" ON fee_payments FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = fee_payments.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage announcements" ON announcements FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage notification logs" ON notification_logs FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Migration 2 RLS policies
DO $$ BEGIN CREATE POLICY "Users can read time_slots in own school" ON time_slots FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage time_slots" ON time_slots FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read timetables in own school" ON timetables FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage timetables" ON timetables FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read expense_categories in own school" ON expense_categories FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/bursar can manage expense_categories" ON expense_categories FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read expenses in own school" ON expenses FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/bursar can manage expenses" ON expenses FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read payroll_records in own school" ON payroll_records FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin/bursar can manage payroll_records" ON payroll_records FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read assignments in own school" ON assignments FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Staff can manage assignments" ON assignments FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read assignment_submissions in own school" ON assignment_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Staff can manage assignment_submissions" ON assignment_submissions FOR ALL USING (EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Students can insert own submissions" ON assignment_submissions FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE id = student_id AND school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Students can update own submissions" ON assignment_submissions FOR UPDATE USING (student_id IN (SELECT id FROM students WHERE id = student_id AND school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read behavior_categories in own school" ON behavior_categories FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage behavior_categories" ON behavior_categories FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read behavior_logs in own school" ON behavior_logs FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Staff can manage behavior_logs" ON behavior_logs FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read staff_attendance in own school" ON staff_attendance FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage staff_attendance" ON staff_attendance FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read books in own school" ON books FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage books" ON books FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read book_issues in own school" ON book_issues FOR SELECT USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_issues.book_id AND books.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage book_issues" ON book_issues FOR ALL USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_issues.book_id AND books.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Users can read school_events in own school" ON school_events FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Admin can manage school_events" ON school_events FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Migration 4 RLS policies
DO $$ BEGIN CREATE POLICY "School admin manages promotion_rules" ON promotion_rules FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated users read promotion_rules" ON promotion_rules FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Staff read term_results" ON term_results FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin','class_teacher','subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "School admin manages term_results" ON term_results FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Staff read year_results" ON year_results FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin','class_teacher','subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "School admin manages year_results" ON year_results FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "School admin manages graduation_records" ON graduation_records FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Parents read own children's graduation records" ON graduation_records FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() = 'parent' AND EXISTS (SELECT 1 FROM student_guardians sg WHERE sg.student_id = graduation_records.student_id AND sg.guardian_id IN (SELECT id FROM guardians WHERE user_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "School admin manages promotion_audits" ON promotion_audits FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin')); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Authenticated users read promotion_audits" ON promotion_audits FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "school_admin_all_applications" ON admission_applications FOR ALL TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "public_can_apply" ON admission_applications FOR INSERT TO anon WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================================
-- END SCHEMA - START SEED DATA
-- ==============================================================================================
-- ==============================================================================================
-- EduCore - Complete Schema + Seed Data for Brilliant Academy
-- Run in Supabase SQL Editor (service_role) or via `supabase db reset`
-- Safe for re-run: uses IF NOT EXISTS / DO $$ EXCEPTION blocks
-- ==============================================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- CUSTOM ENUMS
-- ==========================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('school_admin','class_teacher','subject_teacher','bursar','parent','student'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE student_status_type AS ENUM ('Active','Inactive','Alumni','Withdrawn','Graduated'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE attendance_status AS ENUM ('Present','Absent','Late','Excused'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE payment_method_type AS ENUM ('Cash','Mobile Money','Bank Transfer','Card','Other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE fee_status_type AS ENUM ('Unpaid','Partial','Paid'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE gender_type AS ENUM ('Male','Female'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE year_status_type AS ENUM ('active','closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE term_status_type AS ENUM ('upcoming','active','closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE history_outcome_type AS ENUM ('promoted','repeated','graduated','withdrawn','active'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE announcement_target_type AS ENUM ('all','class'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_channel_type AS ENUM ('sms','whatsapp','email'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE notification_status_type AS ENUM ('sent','failed','pending'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==========================================
-- TRIGGER FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_fee_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount_paid >= NEW.amount_owed THEN NEW.status = 'Paid';
    ELSIF NEW.amount_paid > 0 THEN NEW.status = 'Partial';
    ELSE NEW.status = 'Unpaid';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, school_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
        (NEW.raw_user_meta_data->>'school_id')::uuid
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- TABLES (from all 4 migrations)
-- ==========================================

CREATE TABLE IF NOT EXISTS schools (
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

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    whatsapp_number TEXT,
    role user_role NOT NULL DEFAULT 'student',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status year_status_type DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms (
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

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    level INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 50,
    class_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, subject_id, academic_year_id)
);

CREATE TABLE IF NOT EXISTS students (
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

CREATE TABLE IF NOT EXISTS student_class_history (
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

CREATE TABLE IF NOT EXISTS guardians (
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

CREATE TABLE IF NOT EXISTS student_guardians (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, guardian_id)
);

CREATE TABLE IF NOT EXISTS assessment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    weight NUMERIC NOT NULL CHECK (weight > 0 AND weight <= 100),
    max_score NUMERIC DEFAULT 100 CHECK (max_score > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
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

CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score NUMERIC CHECK (score >= 0),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (assessment_id, student_id)
);

CREATE TABLE IF NOT EXISTS attendance (
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

CREATE TABLE IF NOT EXISTS fee_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    fee_type_id UUID NOT NULL REFERENCES fee_types(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_fees (
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

CREATE TABLE IF NOT EXISTS fee_payments (
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

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    target announcement_target_type NOT NULL,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    send_sms BOOLEAN DEFAULT false,
    send_whatsapp BOOLEAN DEFAULT false,
    recipient_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    channels TEXT[] DEFAULT ARRAY['sms', 'whatsapp'],
    individual_guardian_id UUID REFERENCES guardians(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_logs (
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
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_year_result_outcome(p_student_id UUID, p_year_id UUID, p_outcome TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE year_results
  SET outcome = p_outcome, computed_at = NOW()
  WHERE student_id = p_student_id AND academic_year_id = p_year_id;
END;
$$ LANGUAGE plpgsql;
-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_academic_years_school_id ON academic_years(school_id);
CREATE INDEX IF NOT EXISTS idx_academic_years_is_current ON academic_years(school_id, is_current);
CREATE INDEX IF NOT EXISTS idx_terms_school_id ON terms(school_id);
CREATE INDEX IF NOT EXISTS idx_terms_academic_year_id ON terms(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_terms_status ON terms(school_id, status);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_teacher ON class_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_year ON class_subjects(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(school_id, status);
CREATE INDEX IF NOT EXISTS idx_student_class_history_student ON student_class_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_class_history_class ON student_class_history(class_id);
CREATE INDEX IF NOT EXISTS idx_student_class_history_year ON student_class_history(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_class_history_current ON student_class_history(is_current);
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON guardians(user_id);
CREATE INDEX IF NOT EXISTS idx_guardians_school_id ON guardians(school_id);
CREATE INDEX IF NOT EXISTS idx_student_guardians_guardian ON student_guardians(guardian_id);
CREATE INDEX IF NOT EXISTS idx_assessment_types_school ON assessment_types(school_id);
CREATE INDEX IF NOT EXISTS idx_assessments_term ON assessments(term_id);
CREATE INDEX IF NOT EXISTS idx_assessments_class ON assessments(class_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject_id);
CREATE INDEX IF NOT EXISTS idx_assessments_published ON assessments(is_published);
CREATE INDEX IF NOT EXISTS idx_grades_student_id ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_assessment_id ON grades(assessment_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_term ON attendance(term_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_fee_types_school ON fee_types(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_assignments_term ON fee_assignments(term_id);
CREATE INDEX IF NOT EXISTS idx_fee_assignments_class ON fee_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_assignment ON student_fees(fee_assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON student_fees(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_date ON fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_fee ON fee_payments(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_announcements_school ON announcements(school_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_school ON notification_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_term_results_student ON term_results(student_id);
CREATE INDEX IF NOT EXISTS idx_term_results_term ON term_results(term_id);
CREATE INDEX IF NOT EXISTS idx_term_results_class ON term_results(class_id);
CREATE INDEX IF NOT EXISTS idx_year_results_student ON year_results(student_id);
CREATE INDEX IF NOT EXISTS idx_year_results_year ON year_results(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_promotion_audits_student ON promotion_audits(student_id);
CREATE INDEX IF NOT EXISTS idx_promotion_audits_year ON promotion_audits(academic_year_id);

-- ==========================================
-- TRIGGERS
-- ==========================================
DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS update_schools_modtime ON schools;
CREATE TRIGGER update_schools_modtime BEFORE UPDATE ON schools FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS update_students_modtime ON students;
CREATE TRIGGER update_students_modtime BEFORE UPDATE ON students FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS update_grades_modtime ON grades;
CREATE TRIGGER update_grades_modtime BEFORE UPDATE ON grades FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS update_student_fees_modtime ON student_fees;
CREATE TRIGGER update_student_fees_modtime BEFORE UPDATE ON student_fees FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
DROP TRIGGER IF EXISTS update_student_fees_status ON student_fees;
CREATE TRIGGER update_student_fees_status BEFORE INSERT OR UPDATE OF amount_paid, amount_owed ON student_fees FOR EACH ROW EXECUTE PROCEDURE update_fee_status();
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ==========================================
-- ROW LEVEL SECURITY
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
ALTER TABLE promotion_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE year_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE graduation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;
-- ==========================================
-- 1. SCHOOL
-- ==========================================
INSERT INTO schools (id, name, address, phone, email, motto)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Brilliant Academy',
    '123 Education Lane, Accra, Ghana',
    '+233302123456',
    'info@brilliantacademy.edu.gh',
    'Excellence in Character and Learning'
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. AUTH USERS (trigger auto-creates profiles)
-- ==========================================
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud, confirmation_sent_at)
VALUES
('f1a2b3c4-d5e6-7890-fabc-456789012345', '00000000-0000-0000-0000-000000000000', 'admin@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{"full_name":"Admin User","role":"school_admin","school_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f2a3b4c5-d5e6-7890-fabc-456789012346', '00000000-0000-0000-0000-000000000000', 'teacher1@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{"full_name":"Kwame Adjei","role":"class_teacher","school_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f3a4b5c6-d5e6-7890-fabc-456789012347', '00000000-0000-0000-0000-000000000000', 'teacher2@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{"full_name":"Akua Sarpong","role":"class_teacher","school_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f4a5b6c7-d5e6-7890-fabc-456789012348', '00000000-0000-0000-0000-000000000000', 'bursar@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{"full_name":"Yaw Osei","role":"bursar","school_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f5a6b7c8-d5e6-7890-fabc-456789012349', '00000000-0000-0000-0000-000000000000', 'parent1@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{"full_name":"Yaw Frimpong","role":"parent","school_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f1a2b3c4-d5e6-7890-fabc-456789012350', '00000000-0000-0000-0000-000000000000', 'student1@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{"full_name":"Kwesi Agyemang","role":"student","school_id":"a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW());

-- Update auto-created profiles
UPDATE profiles SET phone = '+233201234501', is_active = true WHERE id = 'f1a2b3c4-d5e6-7890-fabc-456789012345';
UPDATE profiles SET phone = '+233201234502', is_active = true WHERE id = 'f2a3b4c5-d5e6-7890-fabc-456789012346';
UPDATE profiles SET phone = '+233201234503', is_active = true WHERE id = 'f3a4b5c6-d5e6-7890-fabc-456789012347';
UPDATE profiles SET phone = '+233201234504', is_active = true WHERE id = 'f4a5b6c7-d5e6-7890-fabc-456789012348';
UPDATE profiles SET phone = '+233201234505', is_active = true WHERE id = 'f5a6b7c8-d5e6-7890-fabc-456789012349';
UPDATE profiles SET phone = '+233201234506', is_active = true WHERE id = 'f1a2b3c4-d5e6-7890-fabc-456789012350';

-- ==========================================
-- 3. ACADEMIC YEAR & TERMS
-- ==========================================
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current, status)
VALUES ('b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2024/2025 Academic Year', '2025-01-13', '2025-12-05', true, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO terms (id, academic_year_id, school_id, name, term_number, start_date, end_date, fee_due_date, status) VALUES
('c1d2e3f4-a5b6-7890-cdef-123456789012', 'b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'First Term', 1, '2025-01-13', '2025-04-11', '2025-02-15', 'active'),
('c2d3e4f5-a5b6-7890-cdef-123456789013', 'b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Second Term', 2, '2025-05-05', '2025-08-01', '2025-05-20', 'upcoming'),
('c3d4e5f6-a5b6-7890-cdef-123456789014', 'b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Third Term', 3, '2025-09-01', '2025-12-05', '2025-09-15', 'upcoming')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 4. CLASSES
-- ==========================================
INSERT INTO classes (id, school_id, name, level, capacity) VALUES
('d1e2f3a4-b5c6-7890-defa-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Basic 1', 1, 45),
('d2e3f4a5-b5c6-7890-defa-234567890124', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Basic 2', 2, 45),
('d3e4f5a6-b5c6-7890-defa-234567890125', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Basic 3', 3, 45),
('d4e5f6a7-b5c6-7890-defa-234567890126', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Basic 4', 4, 50),
('d5e6f7a8-b5c6-7890-defa-234567890127', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Basic 5', 5, 50),
('d6e7f8a9-b5c6-7890-defa-234567890128', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Basic 6', 6, 50),
('d7e8f9b0-b5c6-7890-defa-234567890129', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JHS 1', 7, 40),
('d8e9f0b1-b5c6-7890-defa-234567890130', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JHS 2', 8, 40),
('d9e0f1b2-b5c6-7890-defa-234567890131', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'JHS 3', 9, 40)
ON CONFLICT (id) DO NOTHING;

UPDATE classes SET class_teacher_id = 'f2a3b4c5-d5e6-7890-fabc-456789012346' WHERE id = 'd4e5f6a7-b5c6-7890-defa-234567890126';
UPDATE classes SET class_teacher_id = 'f3a4b5c6-d5e6-7890-fabc-456789012347' WHERE id = 'd7e8f9b0-b5c6-7890-defa-234567890129';

-- ==========================================
-- 5. SUBJECTS (12)
-- ==========================================
INSERT INTO subjects (id, school_id, name, code) VALUES
('e1f2a3b4-c5d6-7890-efab-345678901234', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'English Language', 'ENG'),
('e1f2a3b5-c5d6-7890-efab-345678901235', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mathematics', 'MATH'),
('e1f2a3b6-c5d6-7890-efab-345678901236', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Science', 'SCI'),
('e1f2a3b7-c5d6-7890-efab-345678901237', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Social Studies', 'SOC'),
('e1f2a3b8-c5d6-7890-efab-345678901238', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Ghanaian Language (Twi)', 'GH'),
('e1f2a3b9-c5d6-7890-efab-345678901239', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Information Communication Technology', 'ICT'),
('e1f2a4b0-c5d6-7890-efab-345678901240', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Religious & Moral Education', 'RME'),
('e1f2a4b1-c5d6-7890-efab-345678901241', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Creative Arts', 'CA'),
('e1f2a4b2-c5d6-7890-efab-345678901242', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'French', 'FR'),
('e1f2a4b3-c5d6-7890-efab-345678901243', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Our World Our People', 'OWOP'),
('e2f3a4c1-c5d6-7890-efab-345678901244', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Physical & Health Education', 'PHE'),
('e2f3a4c5-c5d6-7890-efab-345678901245', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Career Technology', 'CT')
ON CONFLICT (id) DO NOTHING;
-- ==========================================
-- 6. STUDENTS (30)
-- ==========================================
INSERT INTO students (id, school_id, admission_number, full_name, date_of_birth, gender, enrollment_date, status) VALUES
('s0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-001', 'Ama Serwah', '2018-05-10', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-002', 'Kwame Asante', '2018-08-22', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-003', 'Efua Mensah', '2019-01-15', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-004', 'Kofi Boateng', '2017-03-30', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-005', 'Abena Osei', '2017-07-12', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-006', 'Yaw Frimpong', '2017-11-05', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-007', 'Akosua Darko', '2016-02-18', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-008', 'Nana Adjei', '2016-06-25', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000009', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-009', 'Ama Nyarkah', '2016-09-14', 'Female', '2025-01-13', 'Active'),
('f1a2b3c4-d5e6-7890-fabc-456789012350', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-010', 'Kwesi Agyemang', '2015-04-20', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000010', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-011', 'Adwoa Baah', '2015-08-10', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000011', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-012', 'Kweku Tetteh', '2015-12-01', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-013', 'Ama Kusi', '2015-10-22', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000013', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-014', 'Yaw Owusu', '2014-01-30', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000014', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-015', 'Efua Ansah', '2014-05-15', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000015', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-016', 'Kofi Asare', '2014-09-08', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000016', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-017', 'Abena Prempeh', '2013-03-12', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000017', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-018', 'Kwame Gyamfi', '2013-07-25', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000018', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-019', 'Ama Boakye', '2013-11-18', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000019', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-020', 'Nana Kwame', '2012-02-14', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000020', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-021', 'Akua Forson', '2012-06-28', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000021', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-022', 'Kwabena Ofori', '2012-10-05', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000022', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-023', 'Ama Serwaa', '2012-12-20', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000023', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-024', 'Kofi Yeboah', '2011-04-08', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000024', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-025', 'Adwoa Mensah', '2011-08-17', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000025', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-026', 'Yaw Acheampong', '2011-11-30', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000026', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-027', 'Ama Adjei', '2010-01-25', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000027', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-028', 'Kwame Frimpong', '2010-05-19', 'Male', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000028', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-029', 'Efua Boateng', '2010-09-02', 'Female', '2025-01-13', 'Active'),
('s0000001-0000-0000-0000-000000000029', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BA-2025-030', 'Kweku Ansah', '2010-12-14', 'Male', '2025-01-13', 'Active')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 7. STUDENT CLASS HISTORY
-- ==========================================
INSERT INTO student_class_history (id, student_id, class_id, academic_year_id, outcome, is_current, enrolled_date)
SELECT gen_random_uuid(), id,
  CASE
    WHEN id = 's0000001-0000-0000-0000-000000000001' THEN 'd1e2f3a4-b5c6-7890-defa-234567890123'
    WHEN id = 's0000001-0000-0000-0000-000000000002' THEN 'd1e2f3a4-b5c6-7890-defa-234567890123'
    WHEN id = 's0000001-0000-0000-0000-000000000003' THEN 'd1e2f3a4-b5c6-7890-defa-234567890123'
    WHEN id = 's0000001-0000-0000-0000-000000000004' THEN 'd2e3f4a5-b5c6-7890-defa-234567890124'
    WHEN id = 's0000001-0000-0000-0000-000000000005' THEN 'd2e3f4a5-b5c6-7890-defa-234567890124'
    WHEN id = 's0000001-0000-0000-0000-000000000006' THEN 'd2e3f4a5-b5c6-7890-defa-234567890124'
    WHEN id = 's0000001-0000-0000-0000-000000000007' THEN 'd3e4f5a6-b5c6-7890-defa-234567890125'
    WHEN id = 's0000001-0000-0000-0000-000000000008' THEN 'd3e4f5a6-b5c6-7890-defa-234567890125'
    WHEN id = 's0000001-0000-0000-0000-000000000009' THEN 'd3e4f5a6-b5c6-7890-defa-234567890125'
    WHEN id = 'f1a2b3c4-d5e6-7890-fabc-456789012350' THEN 'd4e5f6a7-b5c6-7890-defa-234567890126'
    WHEN id = 's0000001-0000-0000-0000-000000000010' THEN 'd4e5f6a7-b5c6-7890-defa-234567890126'
    WHEN id = 's0000001-0000-0000-0000-000000000011' THEN 'd4e5f6a7-b5c6-7890-defa-234567890126'
    WHEN id = 's0000001-0000-0000-0000-000000000012' THEN 'd4e5f6a7-b5c6-7890-defa-234567890126'
    WHEN id = 's0000001-0000-0000-0000-000000000013' THEN 'd5e6f7a8-b5c6-7890-defa-234567890127'
    WHEN id = 's0000001-0000-0000-0000-000000000014' THEN 'd5e6f7a8-b5c6-7890-defa-234567890127'
    WHEN id = 's0000001-0000-0000-0000-000000000015' THEN 'd5e6f7a8-b5c6-7890-defa-234567890127'
    WHEN id = 's0000001-0000-0000-0000-000000000016' THEN 'd6e7f8a9-b5c6-7890-defa-234567890128'
    WHEN id = 's0000001-0000-0000-0000-000000000017' THEN 'd6e7f8a9-b5c6-7890-defa-234567890128'
    WHEN id = 's0000001-0000-0000-0000-000000000018' THEN 'd6e7f8a9-b5c6-7890-defa-234567890128'
    WHEN id = 's0000001-0000-0000-0000-000000000019' THEN 'd7e8f9b0-b5c6-7890-defa-234567890129'
    WHEN id = 's0000001-0000-0000-0000-000000000020' THEN 'd7e8f9b0-b5c6-7890-defa-234567890129'
    WHEN id = 's0000001-0000-0000-0000-000000000021' THEN 'd7e8f9b0-b5c6-7890-defa-234567890129'
    WHEN id = 's0000001-0000-0000-0000-000000000022' THEN 'd7e8f9b0-b5c6-7890-defa-234567890129'
    WHEN id = 's0000001-0000-0000-0000-000000000023' THEN 'd8e9f0b1-b5c6-7890-defa-234567890130'
    WHEN id = 's0000001-0000-0000-0000-000000000024' THEN 'd8e9f0b1-b5c6-7890-defa-234567890130'
    WHEN id = 's0000001-0000-0000-0000-000000000025' THEN 'd8e9f0b1-b5c6-7890-defa-234567890130'
    WHEN id = 's0000001-0000-0000-0000-000000000026' THEN 'd9e0f1b2-b5c6-7890-defa-234567890131'
    WHEN id = 's0000001-0000-0000-0000-000000000027' THEN 'd9e0f1b2-b5c6-7890-defa-234567890131'
    WHEN id = 's0000001-0000-0000-0000-000000000028' THEN 'd9e0f1b2-b5c6-7890-defa-234567890131'
    WHEN id = 's0000001-0000-0000-0000-000000000029' THEN 'd9e0f1b2-b5c6-7890-defa-234567890131'
  END,
  'b1c2d3e4-f5a6-7890-bcde-f12345678901',
  'active', true, '2025-01-13'
FROM students WHERE school_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- ==========================================
-- 8. GUARDIANS (15)
-- ==========================================
INSERT INTO guardians (id, user_id, full_name, phone, relationship, is_primary, school_id) VALUES
('g0000001-0000-0000-0000-000000000001', 'f5a6b7c8-d5e6-7890-fabc-456789012349', 'Mr. Yaw Frimpong', '+233244100001', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000002', NULL, 'Mrs. Akua Mensah', '+233244100002', 'Mother', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000003', NULL, 'Mr. Kwame Asante', '+233244100003', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000004', NULL, 'Mr. Kofi Osei', '+233244100004', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000005', NULL, 'Mr. Yaw Darko', '+233244100005', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000006', NULL, 'Mr. Michael Adjei', '+233244100006', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000007', NULL, 'Mr. Kwesi Baah', '+233244100007', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000008', NULL, 'Mrs. Efua Tetteh', '+233244100008', 'Mother', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000009', NULL, 'Mr. Kofi Kusi', '+233244100009', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000010', NULL, 'Mr. Yaw Owusu Snr', '+233244100010', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000011', NULL, 'Mr. Kwame Asare', '+233244100011', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000012', NULL, 'Mr. Kwabena Prempeh', '+233244100012', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000013', NULL, 'Mr. Kwame Forson', '+233244100013', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000014', NULL, 'Mr. Yaw Mensah', '+233244100014', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
('g0000001-0000-0000-0000-000000000015', NULL, 'Mr. Yaw Adjei', '+233244100015', 'Father', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 9. STUDENT-GUARDIAN RELATIONSHIPS (sibling groupings)
-- ==========================================
INSERT INTO student_guardians (student_id, guardian_id) VALUES
-- Guardian #1 (Yaw Frimpong): Kwesi Agyemang, Kofi Boateng, Nana Kwame
('f1a2b3c4-d5e6-7890-fabc-456789012350', 'g0000001-0000-0000-0000-000000000001'),
('s0000001-0000-0000-0000-000000000004', 'g0000001-0000-0000-0000-000000000001'),
('s0000001-0000-0000-0000-000000000019', 'g0000001-0000-0000-0000-000000000001'),
-- Guardian #2 (Akua Mensah): Ama Serwah, Efua Mensah
('s0000001-0000-0000-0000-000000000001', 'g0000001-0000-0000-0000-000000000002'),
('s0000001-0000-0000-0000-000000000003', 'g0000001-0000-0000-0000-000000000002'),
-- Guardian #3 (Kwame Asante): Kwame Asante
('s0000001-0000-0000-0000-000000000002', 'g0000001-0000-0000-0000-000000000003'),
-- Guardian #4 (Kofi Osei): Abena Osei, Yaw Frimpong(B2)
('s0000001-0000-0000-0000-000000000005', 'g0000001-0000-0000-0000-000000000004'),
('s0000001-0000-0000-0000-000000000006', 'g0000001-0000-0000-0000-000000000004'),
-- Guardian #5 (Yaw Darko): Akosua Darko
('s0000001-0000-0000-0000-000000000007', 'g0000001-0000-0000-0000-000000000005'),
-- Guardian #6 (Michael Adjei): Nana Adjei, Ama Nyarkah
('s0000001-0000-0000-0000-000000000008', 'g0000001-0000-0000-0000-000000000006'),
('s0000001-0000-0000-0000-000000000009', 'g0000001-0000-0000-0000-000000000006'),
-- Guardian #7 (Kwesi Baah): Adwoa Baah
('s0000001-0000-0000-0000-000000000010', 'g0000001-0000-0000-0000-000000000007'),
-- Guardian #8 (Efua Tetteh): Kweku Tetteh
('s0000001-0000-0000-0000-000000000011', 'g0000001-0000-0000-0000-000000000008'),
-- Guardian #9 (Kofi Kusi): Ama Kusi
('s0000001-0000-0000-0000-000000000012', 'g0000001-0000-0000-0000-000000000009'),
-- Guardian #10 (Yaw Owusu Snr): Yaw Owusu, Efua Ansah
('s0000001-0000-0000-0000-000000000013', 'g0000001-0000-0000-0000-000000000010'),
('s0000001-0000-0000-0000-000000000014', 'g0000001-0000-0000-0000-000000000010'),
-- Guardian #11 (Kwame Asare): Kofi Asare
('s0000001-0000-0000-0000-000000000015', 'g0000001-0000-0000-0000-000000000011'),
-- Guardian #12 (Kwabena Prempeh): Abena Prempeh, Kwame Gyamfi, Ama Boakye
('s0000001-0000-0000-0000-000000000016', 'g0000001-0000-0000-0000-000000000012'),
('s0000001-0000-0000-0000-000000000017', 'g0000001-0000-0000-0000-000000000012'),
('s0000001-0000-0000-0000-000000000018', 'g0000001-0000-0000-0000-000000000012'),
-- Guardian #13 (Kwame Forson): Akua Forson, Kwabena Ofori, Ama Serwaa
('s0000001-0000-0000-0000-000000000020', 'g0000001-0000-0000-0000-000000000013'),
('s0000001-0000-0000-0000-000000000021', 'g0000001-0000-0000-0000-000000000013'),
('s0000001-0000-0000-0000-000000000022', 'g0000001-0000-0000-0000-000000000013'),
-- Guardian #14 (Yaw Mensah): Kofi Yeboah, Adwoa Mensah, Yaw Acheampong
('s0000001-0000-0000-0000-000000000023', 'g0000001-0000-0000-0000-000000000014'),
('s0000001-0000-0000-0000-000000000024', 'g0000001-0000-0000-0000-000000000014'),
('s0000001-0000-0000-0000-000000000025', 'g0000001-0000-0000-0000-000000000014'),
-- Guardian #15 (Yaw Adjei): Ama Adjei, Kwame Frimpong(J3), Efua Boateng, Kweku Ansah
('s0000001-0000-0000-0000-000000000026', 'g0000001-0000-0000-0000-000000000015'),
('s0000001-0000-0000-0000-000000000027', 'g0000001-0000-0000-0000-000000000015'),
('s0000001-0000-0000-0000-000000000028', 'g0000001-0000-0000-0000-000000000015'),
('s0000001-0000-0000-0000-000000000029', 'g0000001-0000-0000-0000-000000000015');
-- ==========================================
-- 10. CLASS SUBJECTS
-- ==========================================
-- Basic 4 with Teacher1 for all 12 subjects
INSERT INTO class_subjects (id, class_id, subject_id, teacher_id, academic_year_id) VALUES
('00000013-0000-0000-0000-000000000001', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000002', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000003', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000004', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b7-c5d6-7890-efab-345678901237', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000005', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b8-c5d6-7890-efab-345678901238', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000006', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b9-c5d6-7890-efab-345678901239', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000007', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b0-c5d6-7890-efab-345678901240', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000008', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b1-c5d6-7890-efab-345678901241', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000009', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b2-c5d6-7890-efab-345678901242', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000010', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a4b3-c5d6-7890-efab-345678901243', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000011', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e2f3a4c1-c5d6-7890-efab-345678901244', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000012', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e2f3a4c5-c5d6-7890-efab-345678901245', 'f2a3b4c5-d5e6-7890-fabc-456789012346', 'b1c2d3e4-f5a6-7890-bcde-f12345678901');

-- JHS 1 with Teacher2 for all 12 subjects
INSERT INTO class_subjects (id, class_id, subject_id, teacher_id, academic_year_id) VALUES
('00000013-0000-0000-0000-000000000013', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000014', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000015', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b6-c5d6-7890-efab-345678901236', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000016', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b7-c5d6-7890-efab-345678901237', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000017', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b8-c5d6-7890-efab-345678901238', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000018', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b9-c5d6-7890-efab-345678901239', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000019', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b0-c5d6-7890-efab-345678901240', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000020', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b1-c5d6-7890-efab-345678901241', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000021', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b2-c5d6-7890-efab-345678901242', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000022', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a4b3-c5d6-7890-efab-345678901243', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000023', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e2f3a4c1-c5d6-7890-efab-345678901244', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901'),
('00000013-0000-0000-0000-000000000024', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e2f3a4c5-c5d6-7890-efab-345678901245', 'f3a4b5c6-d5e6-7890-fabc-456789012347', 'b1c2d3e4-f5a6-7890-bcde-f12345678901');

-- ==========================================
-- 11. ASSESSMENT TYPES
-- ==========================================
INSERT INTO assessment_types (id, school_id, name, weight, max_score) VALUES
('00000011-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Class Test', 30, 100),
('00000011-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mid-Term Examination', 30, 100),
('00000011-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'End of Term Examination', 40, 100)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 12. ASSESSMENTS (8 for Term 1)
-- ==========================================
INSERT INTO assessments (id, term_id, class_id, subject_id, assessment_type_id, title, date, max_score, is_published, published_at, created_by) VALUES
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', '00000011-0000-0000-0000-000000000001', 'Basic 4 Math Class Test', '2025-01-27', 100, true, '2025-01-27 14:00:00+00', 'f2a3b4c5-d5e6-7890-fabc-456789012346'),
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b5-c5d6-7890-efab-345678901235', '00000011-0000-0000-0000-000000000002', 'Basic 4 Math Mid-Term', '2025-02-17', 100, true, '2025-02-17 14:00:00+00', 'f2a3b4c5-d5e6-7890-fabc-456789012346'),
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', '00000011-0000-0000-0000-000000000001', 'Basic 4 English Class Test', '2025-01-28', 100, true, '2025-01-28 14:00:00+00', 'f2a3b4c5-d5e6-7890-fabc-456789012346'),
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', 'e1f2a3b4-c5d6-7890-efab-345678901234', '00000011-0000-0000-0000-000000000002', 'Basic 4 English Mid-Term', '2025-02-18', 100, true, '2025-02-18 14:00:00+00', 'f2a3b4c5-d5e6-7890-fabc-456789012346'),
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', '00000011-0000-0000-0000-000000000001', 'JHS 1 Math Class Test', '2025-01-29', 100, true, '2025-01-29 14:00:00+00', 'f3a4b5c6-d5e6-7890-fabc-456789012347'),
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b5-c5d6-7890-efab-345678901235', '00000011-0000-0000-0000-000000000002', 'JHS 1 Math Mid-Term', '2025-02-19', 100, true, '2025-02-19 14:00:00+00', 'f3a4b5c6-d5e6-7890-fabc-456789012347'),
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', '00000011-0000-0000-0000-000000000001', 'JHS 1 English Class Test', '2025-01-30', 100, true, '2025-01-30 14:00:00+00', 'f3a4b5c6-d5e6-7890-fabc-456789012347'),
(gen_random_uuid(), 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', 'e1f2a3b4-c5d6-7890-efab-345678901234', '00000011-0000-0000-0000-000000000002', 'JHS 1 English Mid-Term', '2025-02-20', 100, true, '2025-02-20 14:00:00+00', 'f3a4b5c6-d5e6-7890-fabc-456789012347');

-- ==========================================
-- 13. GRADES (via PL/pgSQL loop)
-- ==========================================
DO $$
DECLARE
    asm RECORD;
    stu RECORD;
    rand_score INTEGER;
BEGIN
    FOR asm IN SELECT id, class_id FROM assessments WHERE is_published = true AND term_id = 'c1d2e3f4-a5b6-7890-cdef-123456789012' LOOP
        FOR stu IN SELECT student_id FROM student_class_history WHERE class_id = asm.class_id AND is_current = true LOOP
            rand_score := 35 + floor(random() * 61)::integer;
            INSERT INTO grades (assessment_id, student_id, score)
            VALUES (asm.id, stu.student_id, rand_score);
        END LOOP;
    END LOOP;
END;
$$;

-- ==========================================
-- 14. ATTENDANCE (via PL/pgSQL loop)
-- ==========================================
DO $$
DECLARE
    d DATE;
    stu_id UUID;
    stu_class_id UUID;
    status_arr TEXT[] := ARRAY['Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Present','Late','Late','Absent'];
    idx INTEGER;
BEGIN
    FOR d IN SELECT generate_series('2025-02-03'::date, '2025-02-14'::date, '1 day'::interval)::date LOOP
        IF EXTRACT(DOW FROM d) BETWEEN 1 AND 5 THEN
            FOR stu_id IN SELECT id FROM students WHERE school_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' LOOP
                SELECT class_id INTO stu_class_id FROM student_class_history WHERE student_id = stu_id AND is_current = true LIMIT 1;
                idx := 1 + floor(random() * 20)::integer;
                INSERT INTO attendance (student_id, class_id, term_id, date, status, marked_by)
                VALUES (stu_id, stu_class_id, 'c1d2e3f4-a5b6-7890-cdef-123456789012', d, (status_arr[idx])::attendance_status, 'f1a2b3c4-d5e6-7890-fabc-456789012345');
            END LOOP;
        END IF;
    END LOOP;
END;
$$;

-- ==========================================
-- 15. FEE TYPES
-- ==========================================
INSERT INTO fee_types (id, school_id, name, description) VALUES
('00000007-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tuition Fee', 'Termly tuition for academic instruction'),
('00000007-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'PTA Dues', 'Parent-Teacher Association contribution'),
('00000007-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Books and Materials', 'Textbooks, exercise books, and learning materials'),
('00000007-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ICT Fee', 'Computer lab and technology resources')
ON CONFLICT (id) DO NOTHING;
-- ==========================================
-- 16. FEE ASSIGNMENTS (4 per class for Term 1)
-- ==========================================
INSERT INTO fee_assignments (id, term_id, class_id, fee_type_id, amount, due_date) VALUES
-- Basic 1
('00000008-0000-0000-0000-000000000001', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd1e2f3a4-b5c6-7890-defa-234567890123', '00000007-0000-0000-0000-000000000001', 60000, '2025-02-15'),
('00000008-0000-0000-0000-000000000002', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd1e2f3a4-b5c6-7890-defa-234567890123', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000003', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd1e2f3a4-b5c6-7890-defa-234567890123', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000004', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd1e2f3a4-b5c6-7890-defa-234567890123', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- Basic 2
('00000008-0000-0000-0000-000000000005', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd2e3f4a5-b5c6-7890-defa-234567890124', '00000007-0000-0000-0000-000000000001', 60000, '2025-02-15'),
('00000008-0000-0000-0000-000000000006', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd2e3f4a5-b5c6-7890-defa-234567890124', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000007', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd2e3f4a5-b5c6-7890-defa-234567890124', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000008', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd2e3f4a5-b5c6-7890-defa-234567890124', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- Basic 3
('00000008-0000-0000-0000-000000000009', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd3e4f5a6-b5c6-7890-defa-234567890125', '00000007-0000-0000-0000-000000000001', 60000, '2025-02-15'),
('00000008-0000-0000-0000-000000000010', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd3e4f5a6-b5c6-7890-defa-234567890125', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000011', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd3e4f5a6-b5c6-7890-defa-234567890125', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000012', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd3e4f5a6-b5c6-7890-defa-234567890125', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- Basic 4
('00000008-0000-0000-0000-000000000013', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', '00000007-0000-0000-0000-000000000001', 60000, '2025-02-15'),
('00000008-0000-0000-0000-000000000014', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000015', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000016', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd4e5f6a7-b5c6-7890-defa-234567890126', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- Basic 5
('00000008-0000-0000-0000-000000000017', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd5e6f7a8-b5c6-7890-defa-234567890127', '00000007-0000-0000-0000-000000000001', 60000, '2025-02-15'),
('00000008-0000-0000-0000-000000000018', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd5e6f7a8-b5c6-7890-defa-234567890127', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000019', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd5e6f7a8-b5c6-7890-defa-234567890127', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000020', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd5e6f7a8-b5c6-7890-defa-234567890127', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- Basic 6
('00000008-0000-0000-0000-000000000021', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd6e7f8a9-b5c6-7890-defa-234567890128', '00000007-0000-0000-0000-000000000001', 60000, '2025-02-15'),
('00000008-0000-0000-0000-000000000022', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd6e7f8a9-b5c6-7890-defa-234567890128', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000023', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd6e7f8a9-b5c6-7890-defa-234567890128', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000024', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd6e7f8a9-b5c6-7890-defa-234567890128', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- JHS 1
('00000008-0000-0000-0000-000000000025', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', '00000007-0000-0000-0000-000000000001', 90000, '2025-02-15'),
('00000008-0000-0000-0000-000000000026', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000027', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000028', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd7e8f9b0-b5c6-7890-defa-234567890129', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- JHS 2
('00000008-0000-0000-0000-000000000029', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd8e9f0b1-b5c6-7890-defa-234567890130', '00000007-0000-0000-0000-000000000001', 90000, '2025-02-15'),
('00000008-0000-0000-0000-000000000030', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd8e9f0b1-b5c6-7890-defa-234567890130', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000031', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd8e9f0b1-b5c6-7890-defa-234567890130', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000032', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd8e9f0b1-b5c6-7890-defa-234567890130', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15'),
-- JHS 3
('00000008-0000-0000-0000-000000000033', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd9e0f1b2-b5c6-7890-defa-234567890131', '00000007-0000-0000-0000-000000000001', 90000, '2025-02-15'),
('00000008-0000-0000-0000-000000000034', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd9e0f1b2-b5c6-7890-defa-234567890131', '00000007-0000-0000-0000-000000000002', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000035', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd9e0f1b2-b5c6-7890-defa-234567890131', '00000007-0000-0000-0000-000000000003', 10000, '2025-02-15'),
('00000008-0000-0000-0000-000000000036', 'c1d2e3f4-a5b6-7890-cdef-123456789012', 'd9e0f1b2-b5c6-7890-defa-234567890131', '00000007-0000-0000-0000-000000000004', 5000, '2025-02-15');

-- ==========================================
-- 17. STUDENT FEES (generated via PL/pgSQL)
-- ==========================================
DO $$
DECLARE
    stu_rec RECORD;
    fa_rec RECORD;
    sf_counter INTEGER := 0;
    sf_id TEXT;
BEGIN
    FOR stu_rec IN SELECT id FROM students WHERE school_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' LOOP
        FOR fa_rec IN SELECT id, amount FROM fee_assignments WHERE term_id = 'c1d2e3f4-a5b6-7890-cdef-123456789012' AND class_id = (SELECT class_id FROM student_class_history WHERE student_id = stu_rec.id AND is_current = true LIMIT 1) LOOP
            sf_counter := sf_counter + 1;
            sf_id := '00000009-0000-0000-0000-' || lpad(sf_counter::text, 12, '0');
            INSERT INTO student_fees (id, student_id, fee_assignment_id, amount_owed, amount_paid, status)
            VALUES (sf_id::uuid, stu_rec.id, fa_rec.id, fa_rec.amount, 0, 'Unpaid');
        END LOOP;
    END LOOP;
END;
$$;

-- ==========================================
-- 18. FEE PAYMENTS (~40)
-- ==========================================
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000001';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000002';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000003';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000004';
UPDATE student_fees SET amount_paid = 30000 WHERE id = '00000009-0000-0000-0000-000000000005';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000009';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000010';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000013';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000014';
UPDATE student_fees SET amount_paid = 20000 WHERE id = '00000009-0000-0000-0000-000000000049';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000050';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000051';
UPDATE student_fees SET amount_paid = 50000 WHERE id = '00000009-0000-0000-0000-000000000097';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000098';
UPDATE student_fees SET amount_paid = amount_owed WHERE id = '00000009-0000-0000-0000-000000000099';
UPDATE student_fees SET amount_paid = 30000 WHERE id = '00000009-0000-0000-0000-000000000100';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000017';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000021';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000025';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000033';
UPDATE student_fees SET amount_paid = 10000 WHERE id = '00000009-0000-0000-0000-000000000034';
UPDATE student_fees SET amount_paid = 30000 WHERE id = '00000009-0000-0000-0000-000000000037';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000041';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000053';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000057';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000061';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000065';
UPDATE student_fees SET amount_paid = 60000 WHERE id = '00000009-0000-0000-0000-000000000069';
UPDATE student_fees SET amount_paid = 90000 WHERE id = '00000009-0000-0000-0000-000000000073';
UPDATE student_fees SET amount_paid = 90000 WHERE id = '00000009-0000-0000-0000-000000000077';
UPDATE student_fees SET amount_paid = 10000 WHERE id = '00000009-0000-0000-0000-000000000078';
UPDATE student_fees SET amount_paid = 90000 WHERE id = '00000009-0000-0000-0000-000000000081';
UPDATE student_fees SET amount_paid = 50000 WHERE id = '00000009-0000-0000-0000-000000000085';
UPDATE student_fees SET amount_paid = 90000 WHERE id = '00000009-0000-0000-0000-000000000089';
UPDATE student_fees SET amount_paid = 90000 WHERE id = '00000009-0000-0000-0000-000000000093';
UPDATE student_fees SET amount_paid = 90000 WHERE id = '00000009-0000-0000-0000-000000000101';
UPDATE student_fees SET amount_paid = 10000 WHERE id = '00000009-0000-0000-0000-000000000102';
UPDATE student_fees SET amount_paid = 90000 WHERE id = '00000009-0000-0000-0000-000000000105';
UPDATE student_fees SET amount_paid = 50000 WHERE id = '00000009-0000-0000-0000-000000000109';
UPDATE student_fees SET amount_paid = 10000 WHERE id = '00000009-0000-0000-0000-000000000110';

INSERT INTO fee_payments (id, student_fee_id, student_id, amount, payment_date, payment_method, reference_number, receipt_number, recorded_by) VALUES
(gen_random_uuid(), '00000009-0000-0000-0000-000000000001', 's0000001-0000-0000-0000-000000000001', 60000, '2025-01-25', 'Mobile Money', 'MOMO-REF-001', 'REC-2025-001', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000002', 's0000001-0000-0000-0000-000000000001', 10000, '2025-01-25', 'Cash', 'CASH-001', 'REC-2025-002', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000003', 's0000001-0000-0000-0000-000000000001', 10000, '2025-01-25', 'Cash', 'CASH-002', 'REC-2025-003', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000004', 's0000001-0000-0000-0000-000000000001', 5000, '2025-01-25', 'Cash', 'CASH-003', 'REC-2025-004', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000005', 's0000001-0000-0000-0000-000000000002', 30000, '2025-02-01', 'Mobile Money', 'MOMO-REF-002', 'REC-2025-005', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000009', 's0000001-0000-0000-0000-000000000003', 60000, '2025-01-28', 'Bank Transfer', 'BNK-TRF-001', 'REC-2025-006', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000010', 's0000001-0000-0000-0000-000000000003', 10000, '2025-01-28', 'Bank Transfer', 'BNK-TRF-002', 'REC-2025-007', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000013', 's0000001-0000-0000-0000-000000000004', 60000, '2025-02-05', 'Cash', 'CASH-004', 'REC-2025-008', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000014', 's0000001-0000-0000-0000-000000000004', 10000, '2025-02-05', 'Cash', 'CASH-005', 'REC-2025-009', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000049', 's0000001-0000-0000-0000-000000000013', 20000, '2025-02-10', 'Mobile Money', 'MOMO-REF-003', 'REC-2025-010', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000050', 's0000001-0000-0000-0000-000000000013', 10000, '2025-02-10', 'Mobile Money', 'MOMO-REF-004', 'REC-2025-011', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000051', 's0000001-0000-0000-0000-000000000013', 10000, '2025-02-10', 'Mobile Money', 'MOMO-REF-005', 'REC-2025-012', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000097', 's0000001-0000-0000-0000-000000000026', 50000, '2025-02-08', 'Cash', 'CASH-006', 'REC-2025-013', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000098', 's0000001-0000-0000-0000-000000000026', 10000, '2025-02-08', 'Cash', 'CASH-007', 'REC-2025-014', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000099', 's0000001-0000-0000-0000-000000000026', 10000, '2025-02-08', 'Cash', 'CASH-008', 'REC-2025-015', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000100', 's0000001-0000-0000-0000-000000000026', 30000, '2025-02-08', 'Cash', 'CASH-009', 'REC-2025-016', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000017', 's0000001-0000-0000-0000-000000000005', 60000, '2025-02-12', 'Mobile Money', 'MOMO-REF-006', 'REC-2025-017', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000021', 's0000001-0000-0000-0000-000000000006', 60000, '2025-02-03', 'Bank Transfer', 'BNK-TRF-003', 'REC-2025-018', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000025', 's0000001-0000-0000-0000-000000000007', 60000, '2025-01-30', 'Cash', 'CASH-010', 'REC-2025-019', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000033', 's0000001-0000-0000-0000-000000000010', 60000, '2025-02-06', 'Mobile Money', 'MOMO-REF-007', 'REC-2025-020', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000034', 's0000001-0000-0000-0000-000000000010', 10000, '2025-02-06', 'Mobile Money', 'MOMO-REF-008', 'REC-2025-021', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000037', 's0000001-0000-0000-0000-000000000011', 30000, '2025-02-14', 'Cash', 'CASH-011', 'REC-2025-022', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000041', 's0000001-0000-0000-0000-000000000012', 60000, '2025-01-20', 'Bank Transfer', 'BNK-TRF-004', 'REC-2025-023', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000053', 's0000001-0000-0000-0000-000000000014', 60000, '2025-02-11', 'Cash', 'CASH-012', 'REC-2025-024', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000057', 's0000001-0000-0000-0000-000000000015', 60000, '2025-01-22', 'Mobile Money', 'MOMO-REF-009', 'REC-2025-025', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000061', 's0000001-0000-0000-0000-000000000016', 60000, '2025-02-07', 'Cash', 'CASH-013', 'REC-2025-026', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000065', 's0000001-0000-0000-0000-000000000017', 60000, '2025-02-04', 'Bank Transfer', 'BNK-TRF-005', 'REC-2025-027', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000069', 's0000001-0000-0000-0000-000000000018', 60000, '2025-01-29', 'Mobile Money', 'MOMO-REF-010', 'REC-2025-028', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000073', 's0000001-0000-0000-0000-000000000019', 90000, '2025-02-02', 'Cash', 'CASH-014', 'REC-2025-029', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000077', 's0000001-0000-0000-0000-000000000020', 90000, '2025-02-09', 'Mobile Money', 'MOMO-REF-011', 'REC-2025-030', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000078', 's0000001-0000-0000-0000-000000000020', 10000, '2025-02-09', 'Mobile Money', 'MOMO-REF-012', 'REC-2025-031', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000081', 's0000001-0000-0000-0000-000000000021', 90000, '2025-01-26', 'Cash', 'CASH-015', 'REC-2025-032', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000085', 's0000001-0000-0000-0000-000000000022', 50000, '2025-02-13', 'Bank Transfer', 'BNK-TRF-006', 'REC-2025-033', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000089', 's0000001-0000-0000-0000-000000000023', 90000, '2025-01-21', 'Mobile Money', 'MOMO-REF-013', 'REC-2025-034', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000093', 's0000001-0000-0000-0000-000000000024', 90000, '2025-02-15', 'Cash', 'CASH-016', 'REC-2025-035', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000101', 's0000001-0000-0000-0000-000000000027', 90000, '2025-02-01', 'Bank Transfer', 'BNK-TRF-007', 'REC-2025-036', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000102', 's0000001-0000-0000-0000-000000000027', 10000, '2025-02-01', 'Bank Transfer', 'BNK-TRF-008', 'REC-2025-037', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000105', 's0000001-0000-0000-0000-000000000028', 90000, '2025-01-18', 'Mobile Money', 'MOMO-REF-014', 'REC-2025-038', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000109', 's0000001-0000-0000-0000-000000000029', 50000, '2025-02-14', 'Cash', 'CASH-017', 'REC-2025-039', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), '00000009-0000-0000-0000-000000000110', 's0000001-0000-0000-0000-000000000029', 10000, '2025-02-14', 'Cash', 'CASH-018', 'REC-2025-040', 'f4a5b6c7-d5e6-7890-fabc-456789012348');
-- ==========================================
-- 19. ANNOUNCEMENTS (3)
-- ==========================================
INSERT INTO announcements (id, school_id, created_by, title, body, target, send_sms, send_whatsapp, recipient_count, delivered_count, failed_count, channels) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', 'Welcome Back to School - 2025 Academic Year', 'Dear parents and guardians, we are excited to welcome all students back for the 2024/2025 academic year. Classes commence on Monday, 13th January 2025.', 'all', true, true, 450, 440, 10, ARRAY['sms', 'whatsapp']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', 'PTA Meeting Scheduled for February 20th', 'This is to inform all parents that the first PTA meeting of the year will be held on Thursday, 20th February 2025 at 3:00 PM in the school auditorium.', 'all', true, false, 450, 430, 20, ARRAY['sms']),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', 'Mid-Term Break Notice', 'Please be informed that the school will observe a mid-term break from Monday, 10th March to Friday, 14th March 2025.', 'all', true, true, 450, 445, 5, ARRAY['sms', 'whatsapp']);

-- ==========================================
-- 20. SCHOOL EVENTS (5)
-- ==========================================
INSERT INTO school_events (id, school_id, title, description, event_date, start_time, end_time, location, event_type, target, created_by) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Opening Ceremony', 'Official opening ceremony for the 2024/2025 academic year', '2025-01-13', '08:00:00', '10:00:00', 'School Assembly Hall', 'general', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'First PTA Meeting', 'Annual general meeting of the Parent-Teacher Association', '2025-02-20', '15:00:00', '17:00:00', 'School Auditorium', 'pta', 'parents', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Inter-House Sports Day', 'Annual sports competition among the four houses', '2025-03-15', '07:00:00', '16:00:00', 'School Sports Complex', 'sports', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cultural Day Celebration', 'Celebration of Ghanaian culture with performances, food, and displays', '2025-04-05', '09:00:00', '15:00:00', 'School Premises', 'cultural', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'End of Term Awards Ceremony', 'Recognition of outstanding students for Term 1', '2025-04-11', '09:00:00', '12:00:00', 'School Assembly Hall', 'general', 'all', 'f1a2b3c4-d5e6-7890-fabc-456789012345');

-- ==========================================
-- 21. BOOKS (10)
-- ==========================================
INSERT INTO books (id, school_id, title, author, isbn, category, total_copies, available_copies) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mathematics for Basic Schools 4', 'Adjei Mensah', '978-9988-0-1234-1', 'Mathematics', 15, 12),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Integrated Science for Primary', 'Kofi Annan', '978-9988-0-1234-2', 'Science', 12, 10),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'English Language for Basic 4', 'Ghana Education Service', '978-9988-0-1234-3', 'English', 20, 17),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Social Studies for Ghana', 'Ministry of Education', '978-9988-0-1234-4', 'Social Studies', 10, 9),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Twi for Beginners', 'Akua Sarpong', '978-9988-0-1234-5', 'Language', 8, 7),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ICT for Basic Schools', 'Kwame Nkrumah', '978-9988-0-1234-6', 'Technology', 10, 8),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Our World Our People', 'GES Curriculum', '978-9988-0-1234-7', 'Social Studies', 10, 10),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Religious & Moral Education', 'GES Publications', '978-9988-0-1234-8', 'RME', 10, 9),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Creative Arts for Primary', 'Ministry of Education', '978-9988-0-1234-9', 'Arts', 8, 7),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Physical Education Guide', 'Sports Council Ghana', '978-9988-0-1235-0', 'PE', 6, 6);

-- ==========================================
-- 22. BOOK ISSUES (5)
-- ==========================================
INSERT INTO book_issues (id, book_id, student_id, issued_on, due_date, returned_on, status, issued_by) VALUES
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE ''Mathematics for Basic Schools 4'' LIMIT 1), 's0000001-0000-0000-0000-000000000001', '2025-01-15', '2025-02-15', '2025-02-10', ''returned'', ''f1a2b3c4-d5e6-7890-fabc-456789012345''),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE ''Integrated Science for Primary'' LIMIT 1), ''s0000001-0000-0000-0000-000000000004'', ''2025-01-20'', ''2025-02-20'', ''2025-02-15'', ''returned'', ''f1a2b3c4-d5e6-7890-fabc-456789012345''),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE ''English Language for Basic 4'' LIMIT 1), ''s0000001-0000-0000-0000-000000000010'', ''2025-02-01'', ''2025-03-01'', NULL, ''issued'', ''f1a2b3c4-d5e6-7890-fabc-456789012345''),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE ''Social Studies for Ghana'' LIMIT 1), ''s0000001-0000-0000-0000-000000000019'', ''2025-02-05'', ''2025-03-05'', NULL, ''issued'', ''f1a2b3c4-d5e6-7890-fabc-456789012345''),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE ''ICT for Basic Schools'' LIMIT 1), ''s0000001-0000-0000-0000-000000000013'', ''2025-01-25'', ''2025-02-25'', ''2025-02-20'', ''returned'', ''f1a2b3c4-d5e6-7890-fabc-456789012345'');
-- Fix book_issues (previous insert had quoting issues)
DELETE FROM book_issues;
INSERT INTO book_issues (id, book_id, student_id, issued_on, due_date, returned_on, status, issued_by) VALUES
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'Mathematics for Basic Schools 4' LIMIT 1), 's0000001-0000-0000-0000-000000000001', '2025-01-15', '2025-02-15', '2025-02-10', 'returned', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'Integrated Science for Primary' LIMIT 1), 's0000001-0000-0000-0000-000000000004', '2025-01-20', '2025-02-20', '2025-02-15', 'returned', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'English Language for Basic 4' LIMIT 1), 's0000001-0000-0000-0000-000000000010', '2025-02-01', '2025-03-01', NULL, 'issued', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'Social Studies for Ghana' LIMIT 1), 's0000001-0000-0000-0000-000000000019', '2025-02-05', '2025-03-05', NULL, 'issued', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), (SELECT id FROM books WHERE title LIKE 'ICT for Basic Schools' LIMIT 1), 's0000001-0000-0000-0000-000000000013', '2025-01-25', '2025-02-25', '2025-02-20', 'returned', 'f1a2b3c4-d5e6-7890-fabc-456789012345');

-- ==========================================
-- 23. BEHAVIOR CATEGORIES (4)
-- ==========================================
INSERT INTO behavior_categories (id, school_id, name, type, severity, notify_parent) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Excellent', 'positive', 3, false),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Good Conduct', 'positive', 2, false),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Minor Infraction', 'negative', 1, true),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Serious Infraction', 'negative', 3, true);

-- ==========================================
-- 24. BEHAVIOR LOGS (6: 3 positive, 3 negative)
-- ==========================================
INSERT INTO behavior_logs (id, school_id, student_id, category_id, description, type, severity, date, logged_by, parent_notified, notification_sent_at) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012350', (SELECT id FROM behavior_categories WHERE name = 'Excellent' LIMIT 1), 'Top score in Math Class Test - demonstrated exceptional problem-solving skills', 'positive', 3, '2025-01-28', 'f2a3b4c5-d5e6-7890-fabc-456789012346', false, NULL),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000010', (SELECT id FROM behavior_categories WHERE name = 'Good Conduct' LIMIT 1), 'Helped organize classroom materials without being asked', 'positive', 2, '2025-01-30', 'f2a3b4c5-d5e6-7890-fabc-456789012346', false, NULL),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000019', (SELECT id FROM behavior_categories WHERE name = 'Good Conduct' LIMIT 1), 'Assisted a fellow student who was struggling with classwork', 'positive', 2, '2025-02-03', 'f3a4b5c6-d5e6-7890-fabc-456789012347', false, NULL),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000011', (SELECT id FROM behavior_categories WHERE name = 'Minor Infraction' LIMIT 1), 'Disrupted class by talking during lesson after multiple warnings', 'negative', 1, '2025-02-05', 'f2a3b4c5-d5e6-7890-fabc-456789012346', true, '2025-02-05 15:30:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000021', (SELECT id FROM behavior_categories WHERE name = 'Minor Infraction' LIMIT 1), 'Failed to complete homework for the third time this term', 'negative', 1, '2025-02-07', 'f3a4b5c6-d5e6-7890-fabc-456789012347', true, '2025-02-07 15:30:00+00'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 's0000001-0000-0000-0000-000000000025', (SELECT id FROM behavior_categories WHERE name = 'Minor Infraction' LIMIT 1), 'Caught using mobile phone during school hours', 'negative', 1, '2025-02-10', 'f3a4b5c6-d5e6-7890-fabc-456789012347', true, '2025-02-10 16:00:00+00');

-- ==========================================
-- 25. EXPENSE CATEGORIES (4)
-- ==========================================
INSERT INTO expense_categories (id, school_id, name) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maintenance'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Supplies'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Utilities'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Transport');

-- ==========================================
-- 26. EXPENSES (5)
-- ==========================================
INSERT INTO expenses (id, school_id, category_id, description, amount, expense_date, payment_method, reference, recorded_by) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Maintenance' LIMIT 1), 'Classroom desk and chair repairs', 1500, '2025-01-20', 'cash', 'EXP-2025-001', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Supplies' LIMIT 1), 'Office stationery and supplies', 800, '2025-01-25', 'cash', 'EXP-2025-002', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Utilities' LIMIT 1), 'Electricity bill - January 2025', 2500, '2025-02-05', 'bank_transfer', 'EXP-2025-003', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Transport' LIMIT 1), 'School bus fuel for February', 1200, '2025-02-10', 'cash', 'EXP-2025-004', 'f4a5b6c7-d5e6-7890-fabc-456789012348'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', (SELECT id FROM expense_categories WHERE name = 'Maintenance' LIMIT 1), 'Plumbing repairs - boys washroom', 2000, '2025-02-15', 'momo', 'EXP-2025-005', 'f4a5b6c7-d5e6-7890-fabc-456789012348');

-- ==========================================
-- 27. STAFF ATTENDANCE (10 records)
-- ==========================================
INSERT INTO staff_attendance (id, school_id, staff_id, date, status, arrival_time, marked_by) VALUES
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', '2025-02-03', 'present', '07:15:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '2025-02-03', 'present', '07:25:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '2025-02-04', 'present', '07:20:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '2025-02-04', 'late', '08:10:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', '2025-02-05', 'present', '07:10:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f4a5b6c7-d5e6-7890-fabc-456789012348', '2025-02-05', 'present', '07:30:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f3a4b5c6-d5e6-7890-fabc-456789012347', '2025-02-06', 'present', '07:30:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f2a3b4c5-d5e6-7890-fabc-456789012346', '2025-02-06', 'absent', NULL, 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f1a2b3c4-d5e6-7890-fabc-456789012345', '2025-02-07', 'late', '08:00:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345'),
(gen_random_uuid(), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f4a5b6c7-d5e6-7890-fabc-456789012348', '2025-02-07', 'present', '07:20:00', 'f1a2b3c4-d5e6-7890-fabc-456789012345');
