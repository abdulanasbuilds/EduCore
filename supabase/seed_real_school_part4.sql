-- ==========================================
-- RLS HELPER FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION auth_user_school_id()
RETURNS UUID AS 
  SELECT school_id FROM profiles WHERE id = auth.uid() LIMIT 1;
 LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS user_role AS 
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
 LANGUAGE sql STABLE SECURITY DEFINER;

-- ==========================================
-- RLS POLICIES (all wrapped for re-run safety)
-- ==========================================

DO  BEGIN CREATE POLICY ""Users can read own school"" ON schools FOR SELECT USING (id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read profiles in own school"" ON profiles FOR SELECT USING (school_id = auth_user_school_id() OR id = auth.uid()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read academic years in own school"" ON academic_years FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read terms in own school"" ON terms FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read classes in own school"" ON classes FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read subjects in own school"" ON subjects FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read class subjects in own school"" ON class_subjects FOR SELECT USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_subjects.class_id AND classes.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read students in own school"" ON students FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read student history in own school"" ON student_class_history FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_class_history.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read guardians in own school"" ON guardians FOR SELECT USING (school_id = auth_user_school_id() OR user_id = auth.uid()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read student guardians in own school"" ON student_guardians FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_guardians.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read assessment types in own school"" ON assessment_types FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read assessments in own school"" ON assessments FOR SELECT USING (EXISTS (SELECT 1 FROM terms WHERE terms.id = assessments.term_id AND terms.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read grades in own school"" ON grades FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = grades.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read attendance in own school"" ON attendance FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = attendance.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read fee types in own school"" ON fee_types FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read fee assignments in own school"" ON fee_assignments FOR SELECT USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = fee_assignments.class_id AND classes.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read student fees in own school"" ON student_fees FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read fee payments in own school"" ON fee_payments FOR SELECT USING (EXISTS (SELECT 1 FROM students WHERE students.id = fee_payments.student_id AND students.school_id = auth_user_school_id())); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read announcements in own school"" ON announcements FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can read notification logs in own school"" ON notification_logs FOR SELECT USING (school_id = auth_user_school_id()); EXCEPTION WHEN duplicate_object THEN null; END ;

-- INSERT/UPDATE/DELETE policies
DO  BEGIN CREATE POLICY ""Admin can update own school"" ON schools FOR UPDATE USING (id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Users can update own profile"" ON profiles FOR UPDATE USING (id = auth.uid()); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can insert profiles"" ON profiles FOR INSERT WITH CHECK (auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can update profiles in school"" ON profiles FOR UPDATE USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage academic years"" ON academic_years FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage terms"" ON terms FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage classes"" ON classes FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage subjects"" ON subjects FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage class subjects"" ON class_subjects FOR ALL USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = class_subjects.class_id AND classes.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage students"" ON students FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage student history"" ON student_class_history FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_class_history.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage guardians"" ON guardians FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage student guardians"" ON student_guardians FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_guardians.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage assessment types"" ON assessment_types FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() = 'school_admin'); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Staff can manage assessments"" ON assessments FOR ALL USING (EXISTS (SELECT 1 FROM terms WHERE terms.id = assessments.term_id AND terms.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Teachers can manage grades"" ON grades FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = grades.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher', 'subject_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Teachers can manage attendance"" ON attendance FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = attendance.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'class_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin/bursar can manage fee types"" ON fee_types FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin/bursar can manage fee assignments"" ON fee_assignments FOR ALL USING (EXISTS (SELECT 1 FROM classes WHERE classes.id = fee_assignments.class_id AND classes.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin/bursar can manage student fees"" ON student_fees FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = student_fees.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin/bursar can manage fee payments"" ON fee_payments FOR ALL USING (EXISTS (SELECT 1 FROM students WHERE students.id = fee_payments.student_id AND students.school_id = auth_user_school_id()) AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage announcements"" ON announcements FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'class_teacher')); EXCEPTION WHEN duplicate_object THEN null; END ;
DO  BEGIN CREATE POLICY ""Admin can manage notification logs"" ON notification_logs FOR ALL USING (school_id = auth_user_school_id() AND auth_user_role() IN ('school_admin', 'bursar')); EXCEPTION WHEN duplicate_object THEN null; END ;
