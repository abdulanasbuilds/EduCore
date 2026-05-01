const fs = require('fs');
const path = require('path');

const fullPath = path.join(__dirname, 'supabase/migrations/001_initial_schema.sql');
let content = fs.readFileSync(fullPath, 'utf8');

const oldTablePattern = /CREATE TABLE admission_applications \([\s\S]*?\);\n\nCREATE INDEX idx_admission_applications_status ON admission_applications\(status\);\nCREATE TRIGGER update_admission_applications_modtime BEFORE UPDATE ON admission_applications FOR EACH ROW EXECUTE PROCEDURE set_updated_at\(\);\n\n-- RLS for admission_applications\nALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;\n\n-- Anyone can insert \(public form\)\nCREATE POLICY "Anyone can submit admission application" ON admission_applications\n  FOR INSERT WITH CHECK \(true\);\n\n-- Only school admins can read\/update\nCREATE POLICY "Admin can read admission applications" ON admission_applications\n  FOR SELECT USING \(auth_user_role\(\) = 'school_admin'\);\n\nCREATE POLICY "Admin can update admission applications" ON admission_applications\n  FOR UPDATE USING \(auth_user_role\(\) = 'school_admin'\);/g;

const newTableDDL = `CREATE TABLE IF NOT EXISTS admission_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  class_applied_for UUID REFERENCES classes(id),
  class_applied_name TEXT,
  previous_school TEXT,
  parent_full_name TEXT NOT NULL,
  parent_relationship TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_whatsapp TEXT,
  parent_email TEXT,
  home_address TEXT NOT NULL,
  how_heard TEXT,
  medical_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'info_requested')),
  admin_notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admission_applications ENABLE ROW LEVEL SECURITY;

-- School admin can see all applications
CREATE POLICY "school_admin_all_applications" 
ON admission_applications
FOR ALL
TO authenticated
USING (true);

-- Public can INSERT (to submit applications)
CREATE POLICY "public_can_apply"
ON admission_applications
FOR INSERT
TO anon
WITH CHECK (true);`;

if (content.includes("CREATE TABLE admission_applications")) {
    const parts = content.split("-- ==========================================\n-- ADMISSION APPLICATIONS (public submissions)\n-- ==========================================");
    if(parts.length > 1) {
        content = parts[0] + "-- ==========================================\n-- ADMISSION APPLICATIONS (public submissions)\n-- ==========================================\n\n" + newTableDDL + "\n";
    }
} else {
    content += "\n\n-- ==========================================\n-- ADMISSION APPLICATIONS (public submissions)\n-- ==========================================\n\n" + newTableDDL;
}

fs.writeFileSync(fullPath, content);
console.log("SQL Schema updated with new admission_applications.");
