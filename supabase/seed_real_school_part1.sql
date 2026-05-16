-- ==============================================================================================
-- EduCore – Complete Schema + Seed Data for Brilliant Academy
-- Run in Supabase SQL Editor (service_role) or via supabase db reset
-- Safe for re-run: uses IF NOT EXISTS / DO  EXCEPTION blocks
-- ==============================================================================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- CUSTOM ENUMS
-- ==========================================
DO  BEGIN CREATE TYPE user_role AS ENUM ('school_admin','class_teacher','subject_teacher','bursar','parent','student'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE student_status_type AS ENUM ('Active','Inactive','Alumni','Withdrawn','Graduated'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE attendance_status AS ENUM ('Present','Absent','Late','Excused'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE payment_method_type AS ENUM ('Cash','Mobile Money','Bank Transfer','Card','Other'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE fee_status_type AS ENUM ('Unpaid','Partial','Paid'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE gender_type AS ENUM ('Male','Female'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE year_status_type AS ENUM ('active','closed'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE term_status_type AS ENUM ('upcoming','active','closed'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE history_outcome_type AS ENUM ('promoted','repeated','graduated','withdrawn','active'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE announcement_target_type AS ENUM ('all','class'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE notification_channel_type AS ENUM ('sms','whatsapp','email'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE TYPE notification_status_type AS ENUM ('sent','failed','pending'); EXCEPTION WHEN duplicate_object THEN null; END ;

-- ==========================================
-- TRIGGER FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_fee_status()
RETURNS TRIGGER AS 
BEGIN
    IF NEW.amount_paid >= NEW.amount_owed THEN NEW.status = 'Paid';
    ELSIF NEW.amount_paid > 0 THEN NEW.status = 'Partial';
    ELSE NEW.status = 'Unpaid';
    END IF;
    RETURN NEW;
END;
 LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS 
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
 LANGUAGE plpgsql SECURITY DEFINER;

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
