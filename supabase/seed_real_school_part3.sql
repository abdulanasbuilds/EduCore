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
