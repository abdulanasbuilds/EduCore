-- Migration 2 RLS policies
DO  BEGIN CREATE POLICY ""Users can read time_slots in own school"" ON time_slots FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage time_slots"" ON time_slots FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read timetables in own school"" ON timetables FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage timetables"" ON timetables FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read expense_categories in own school"" ON expense_categories FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin/bursar can manage expense_categories"" ON expense_categories FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read expenses in own school"" ON expenses FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin/bursar can manage expenses"" ON expenses FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read payroll_records in own school"" ON payroll_records FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin/bursar can manage payroll_records"" ON payroll_records FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read assignments in own school"" ON assignments FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Staff can manage assignments"" ON assignments FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read assignment_submissions in own school"" ON assignment_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Staff can manage assignment_submissions"" ON assignment_submissions FOR ALL USING (EXISTS (SELECT 1 FROM assignments WHERE assignments.id = assignment_submissions.assignment_id AND assignments.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Students can insert own submissions"" ON assignment_submissions FOR INSERT WITH CHECK (student_id IN (SELECT id FROM students WHERE id = student_id AND school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Students can update own submissions"" ON assignment_submissions FOR UPDATE USING (student_id IN (SELECT id FROM students WHERE id = student_id AND school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read behavior_categories in own school"" ON behavior_categories FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage behavior_categories"" ON behavior_categories FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read behavior_logs in own school"" ON behavior_logs FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Staff can manage behavior_logs"" ON behavior_logs FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read staff_attendance in own school"" ON staff_attendance FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage staff_attendance"" ON staff_attendance FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read books in own school"" ON books FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage books"" ON books FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read book_issues in own school"" ON book_issues FOR SELECT USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_issues.book_id AND books.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage book_issues"" ON book_issues FOR ALL USING (EXISTS (SELECT 1 FROM books WHERE books.id = book_issues.book_id AND books.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read school_events in own school"" ON school_events FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage school_events"" ON school_events FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;

-- Migration 4 RLS policies
DO  BEGIN CREATE POLICY ""School admin manages promotion_rules"" ON promotion_rules FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Authenticated users read promotion_rules"" ON promotion_rules FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Staff read term_results"" ON term_results FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin','class_teacher','subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""School admin manages term_results"" ON term_results FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Staff read year_results"" ON year_results FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin','class_teacher','subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""School admin manages year_results"" ON year_results FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""School admin manages graduation_records"" ON graduation_records FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Parents read own children's graduation records"" ON graduation_records FOR SELECT USING (school_id = auth_user_school_id() AND auth_user_role() = 'parent' AND EXISTS (SELECT 1 FROM student_guardians sg WHERE sg.student_id = graduation_records.student_id AND sg.guardian_id IN (SELECT id FROM guardians WHERE user_id = auth.uid()))); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""School admin manages promotion_audits"" ON promotion_audits FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Authenticated users read promotion_audits"" ON promotion_audits FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""school_admin_all_applications"" ON admission_applications FOR ALL TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""public_can_apply"" ON admission_applications FOR INSERT TO anon WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END ;

-- ==============================================================================================
-- END SCHEMA — START SEED DATA
-- ==============================================================================================

-- FIXED UUIDs REFERENCE:
-- School:          a1b2c3d4-e5f6-7890-abcd-ef1234567890
-- Academic Year:   b1c2d3e4-f5a6-7890-bcde-f12345678901
-- Term 1:          c1d2e3f4-a5b6-7890-cdef-123456789012
-- Term 2:          c2d3e4f5-a5b6-7890-cdef-123456789013
-- Term 3:          c3d4e5f6-a5b6-7890-cdef-123456789014
-- Classes: d1e2f3a4..d9e0f1b2, Subjects: e1f2a3b4..e2f3a4c5
-- Auth Users: f1a2b3c4..f5a6b7c8, s1a2b3c4
-- Students: s0000001-...-000000000001 to 029, s1a2b3c4...

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
('f1a2b3c4-d5e6-7890-fabc-456789012345', '00000000-0000-0000-0000-000000000000', 'admin@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{\"full_name\":\"Admin User\",\"role\":\"school_admin\",\"school_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f2a3b4c5-d5e6-7890-fabc-456789012346', '00000000-0000-0000-0000-000000000000', 'teacher1@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{\"full_name\":\"Kwame Adjei\",\"role\":\"class_teacher\",\"school_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f3a4b5c6-d5e6-7890-fabc-456789012347', '00000000-0000-0000-0000-000000000000', 'teacher2@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{\"full_name\":\"Akua Sarpong\",\"role\":\"class_teacher\",\"school_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f4a5b6c7-d5e6-7890-fabc-456789012348', '00000000-0000-0000-0000-000000000000', 'bursar@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{\"full_name\":\"Yaw Osei\",\"role\":\"bursar\",\"school_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('f5a6b7c8-d5e6-7890-fabc-456789012349', '00000000-0000-0000-0000-000000000000', 'parent1@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{\"full_name\":\"Yaw Frimpong\",\"role\":\"parent\",\"school_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW()),
('s1a2b3c4-d5e6-7890-fabc-456789012350', '00000000-0000-0000-0000-000000000000', 'student1@brilliantacademy.edu.gh', crypt('Password123!', gen_salt('bf')), NOW(), '{\"full_name\":\"Kwesi Agyemang\",\"role\":\"student\",\"school_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated', NOW());

-- ==========================================
-- 3. UPDATE AUTO-CREATED PROFILES
-- ==========================================
UPDATE profiles SET phone = '+233201234501', is_active = true WHERE id = 'f1a2b3c4-d5e6-7890-fabc-456789012345';
UPDATE profiles SET phone = '+233201234502', is_active = true WHERE id = 'f2a3b4c5-d5e6-7890-fabc-456789012346';
UPDATE profiles SET phone = '+233201234503', is_active = true WHERE id = 'f3a4b5c6-d5e6-7890-fabc-456789012347';
UPDATE profiles SET phone = '+233201234504', is_active = true WHERE id = 'f4a5b6c7-d5e6-7890-fabc-456789012348';
UPDATE profiles SET phone = '+233201234505', is_active = true WHERE id = 'f5a6b7c8-d5e6-7890-fabc-456789012349';
UPDATE profiles SET phone = '+233201234506', is_active = true WHERE id = 's1a2b3c4-d5e6-7890-fabc-456789012350';

-- ==========================================
-- 4. ACADEMIC YEAR
-- ==========================================
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_current, status)
VALUES (
    'b1c2d3e4-f5a6-7890-bcde-f12345678901',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    '2024/2025 Academic Year',
    '2025-01-13',
    '2025-12-05',
    true,
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 5. TERMS
-- ==========================================
INSERT INTO terms (id, academic_year_id, school_id, name, term_number, start_date, end_date, fee_due_date, status)
VALUES
('c1d2e3f4-a5b6-7890-cdef-123456789012', 'b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'First Term', 1, '2025-01-13', '2025-04-11', '2025-02-15', 'active'),
('c2d3e4f5-a5b6-7890-cdef-123456789013', 'b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Second Term', 2, '2025-05-05', '2025-08-01', '2025-05-20', 'upcoming'),
('c3d4e5f6-a5b6-7890-cdef-123456789014', 'b1c2d3e4-f5a6-7890-bcde-f12345678901', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Third Term', 3, '2025-09-01', '2025-12-05', '2025-09-15', 'upcoming')
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 6. CLASSES
-- ==========================================
INSERT INTO classes (id, school_id, name, level, capacity)
VALUES
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

-- Assign class teachers
UPDATE classes SET class_teacher_id = 'f2a3b4c5-d5e6-7890-fabc-456789012346' WHERE id = 'd4e5f6a7-b5c6-7890-defa-234567890126';
UPDATE classes SET class_teacher_id = 'f3a4b5c6-d5e6-7890-fabc-456789012347' WHERE id = 'd7e8f9b0-b5c6-7890-defa-234567890129';

-- ==========================================
-- 7. SUBJECTS
-- ==========================================
INSERT INTO subjects (id, school_id, name, code)
VALUES
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
