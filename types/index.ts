// ==========================================
// Enum Types (matching database enums)
// ==========================================

export type UserRole =
  | 'SUPER_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'CLASS_TEACHER'
  | 'SUBJECT_TEACHER'
  | 'BURSAR'
  | 'PARENT'
  | 'STUDENT';

export type StudentStatusType = 'Active' | 'Inactive' | 'Alumni' | 'Withdrawn' | 'Graduated';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';
export type PaymentMethodType = 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Card' | 'Other';
export type FeeStatusType = 'Unpaid' | 'Partial' | 'Paid';
export type GenderType = 'Male' | 'Female';
export type YearStatusType = 'active' | 'closed';
export type TermStatusType = 'upcoming' | 'active' | 'closed';
export type HistoryOutcomeType = 'promoted' | 'repeated' | 'graduated' | 'withdrawn' | 'active';
export type AnnouncementTargetType = 'all' | 'class';
export type NotificationChannelType = 'sms' | 'whatsapp' | 'email';
export type NotificationStatusType = 'sent' | 'failed' | 'pending';

// ==========================================
// Database Row Types
// ==========================================

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  whatsapp_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  school_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  motto: string | null;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  status: YearStatusType;
  created_at: string;
}

export interface Term {
  id: string;
  academic_year_id: string;
  school_id: string;
  name: string;
  term_number: number;
  start_date: string;
  end_date: string;
  fee_due_date: string;
  status: TermStatusType;
  created_at: string;
}

export interface Class {
  id: string;
  school_id: string;
  name: string;
  level: number;
  capacity: number;
  class_teacher_id: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  admission_number: string;
  full_name: string;
  date_of_birth: string;
  gender: GenderType;
  photo_url: string | null;
  address: string | null;
  blood_group: string | null;
  medical_notes: string | null;
  previous_school: string | null;
  enrollment_date: string;
  status: StudentStatusType;
  withdrawal_date: string | null;
  withdrawal_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentClassHistory {
  id: string;
  student_id: string;
  class_id: string;
  academic_year_id: string;
  outcome: HistoryOutcomeType;
  is_current: boolean;
  enrolled_date: string;
  completed_date: string | null;
  created_at: string;
}

export interface Guardian {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string;
  whatsapp_number: string | null;
  email: string | null;
  relationship: string;
  is_primary: boolean;
  school_id: string | null;
  created_at: string;
}

export interface StudentGuardian {
  student_id: string;
  guardian_id: string;
}

export interface AssessmentType {
  id: string;
  school_id: string;
  name: string;
  weight: number;
  max_score: number;
  created_at: string;
}

export interface Assessment {
  id: string;
  term_id: string;
  class_id: string;
  subject_id: string;
  assessment_type_id: string;
  title: string;
  date: string;
  max_score: number;
  is_published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Grade {
  id: string;
  assessment_id: string;
  student_id: string;
  score: number | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  class_id: string;
  term_id: string;
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
  marked_by: string | null;
  created_at: string;
}

export interface FeeType {
  id: string;
  school_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface FeeAssignment {
  id: string;
  term_id: string;
  class_id: string;
  fee_type_id: string;
  amount: number;
  due_date: string;
  created_at: string;
}

export interface StudentFee {
  id: string;
  student_id: string;
  fee_assignment_id: string;
  amount_owed: number;
  amount_paid: number;
  balance: number;
  status: FeeStatusType;
  created_at: string;
  updated_at: string;
}

export interface FeePayment {
  id: string;
  student_fee_id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethodType;
  reference_number: string | null;
  receipt_number: string;
  recorded_by: string | null;
  receipt_url: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  school_id: string;
  created_by: string | null;
  title: string;
  body: string;
  target: AnnouncementTargetType;
  class_id: string | null;
  send_sms: boolean;
  send_whatsapp: boolean;
  created_at: string;
}

export interface NotificationLog {
  id: string;
  school_id: string;
  recipient_phone: string;
  recipient_name: string;
  channel: NotificationChannelType;
  type: string;
  message_body: string;
  status: NotificationStatusType;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

// ==========================================
// Composite / Joined Types
// ==========================================

export interface StudentWithClass extends Student {
  current_class?: Class;
  current_history?: StudentClassHistory;
}

export interface StudentWithGuardians extends Student {
  guardians: Guardian[];
}

export interface StudentFull extends Student {
  guardians: Guardian[];
  current_class?: Class;
  current_history?: StudentClassHistory;
}

export interface GradeWithAssessment extends Grade {
  assessment: Assessment;
}

export interface GradeWithStudent extends Grade {
  student: Student;
}

export interface AssessmentWithDetails extends Assessment {
  subject: Subject;
  class: Class;
  assessment_type: AssessmentType;
  term: Term;
}

export interface AttendanceWithStudent extends Attendance {
  student: Student;
}

export interface StudentFeeWithDetails extends StudentFee {
  fee_assignment: FeeAssignment & {
    fee_type: FeeType;
  };
}

export interface FeePaymentWithDetails extends FeePayment {
  student: Student;
  student_fee: StudentFee;
}

export interface ClassWithTeacher extends Class {
  class_teacher: Profile | null;
}

export interface TermWithYear extends Term {
  academic_year: AcademicYear;
}

export interface AnnouncementWithCreator extends Announcement {
  creator: Profile | null;
  class?: Class | null;
}

export interface ClassSubjectWithDetails extends ClassSubject {
  subject: Subject;
  teacher: Profile;
  class: Class;
}

export interface StudentClassHistoryWithDetails extends StudentClassHistory {
  class: Class;
  academic_year: AcademicYear;
}

// ==========================================
// Form / Action Types
// ==========================================

export interface ActionResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalStudents: number;
  todayAttendancePercent: number;
  feesCollectedThisTerm: number;
  outstandingFees: number;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  photoUrl: string | null;
  status: AttendanceStatus;
  remarks: string;
}

export interface GradeEntry {
  studentId: string;
  studentName: string;
  score: number | null;
  remarks: string;
}

export interface GradingScale {
  minScore: number;
  maxScore: number;
  grade: string;
  remarks: string;
}

// ==========================================
// Supabase Database type for client typing
// ==========================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; full_name: string };
        Update: Partial<Profile>;
      };
      schools: {
        Row: School;
        Insert: Partial<School> & { name: string };
        Update: Partial<School>;
      };
      academic_years: {
        Row: AcademicYear;
        Insert: Partial<AcademicYear> & { school_id: string; name: string; start_date: string; end_date: string };
        Update: Partial<AcademicYear>;
      };
      terms: {
        Row: Term;
        Insert: Partial<Term> & { academic_year_id: string; school_id: string; name: string; term_number: number; start_date: string; end_date: string; fee_due_date: string };
        Update: Partial<Term>;
      };
      classes: {
        Row: Class;
        Insert: Partial<Class> & { school_id: string; name: string; level: number };
        Update: Partial<Class>;
      };
      subjects: {
        Row: Subject;
        Insert: Partial<Subject> & { school_id: string; name: string; code: string };
        Update: Partial<Subject>;
      };
      class_subjects: {
        Row: ClassSubject;
        Insert: Partial<ClassSubject> & { class_id: string; subject_id: string; teacher_id: string; academic_year_id: string };
        Update: Partial<ClassSubject>;
      };
      students: {
        Row: Student;
        Insert: Partial<Student> & { school_id: string; admission_number: string; full_name: string; date_of_birth: string; gender: GenderType };
        Update: Partial<Student>;
      };
      student_class_history: {
        Row: StudentClassHistory;
        Insert: Partial<StudentClassHistory> & { student_id: string; class_id: string; academic_year_id: string };
        Update: Partial<StudentClassHistory>;
      };
      guardians: {
        Row: Guardian;
        Insert: Partial<Guardian> & { full_name: string; phone: string; relationship: string };
        Update: Partial<Guardian>;
      };
      student_guardians: {
        Row: StudentGuardian;
        Insert: StudentGuardian;
        Update: Partial<StudentGuardian>;
      };
      assessment_types: {
        Row: AssessmentType;
        Insert: Partial<AssessmentType> & { school_id: string; name: string; weight: number };
        Update: Partial<AssessmentType>;
      };
      assessments: {
        Row: Assessment;
        Insert: Partial<Assessment> & { term_id: string; class_id: string; subject_id: string; assessment_type_id: string; title: string; date: string; max_score: number };
        Update: Partial<Assessment>;
      };
      grades: {
        Row: Grade;
        Insert: Partial<Grade> & { assessment_id: string; student_id: string };
        Update: Partial<Grade>;
      };
      attendance: {
        Row: Attendance;
        Insert: Partial<Attendance> & { student_id: string; class_id: string; term_id: string; date: string; status: AttendanceStatus };
        Update: Partial<Attendance>;
      };
      fee_types: {
        Row: FeeType;
        Insert: Partial<FeeType> & { school_id: string; name: string };
        Update: Partial<FeeType>;
      };
      fee_assignments: {
        Row: FeeAssignment;
        Insert: Partial<FeeAssignment> & { term_id: string; class_id: string; fee_type_id: string; amount: number; due_date: string };
        Update: Partial<FeeAssignment>;
      };
      student_fees: {
        Row: StudentFee;
        Insert: Partial<StudentFee> & { student_id: string; fee_assignment_id: string; amount_owed: number };
        Update: Partial<StudentFee>;
      };
      fee_payments: {
        Row: FeePayment;
        Insert: Partial<FeePayment> & { student_fee_id: string; student_id: string; amount: number; payment_method: PaymentMethodType; receipt_number: string };
        Update: Partial<FeePayment>;
      };
      announcements: {
        Row: Announcement;
        Insert: Partial<Announcement> & { school_id: string; title: string; body: string; target: AnnouncementTargetType };
        Update: Partial<Announcement>;
      };
      notification_logs: {
        Row: NotificationLog;
        Insert: Partial<NotificationLog> & { school_id: string; recipient_phone: string; recipient_name: string; channel: NotificationChannelType; type: string; message_body: string };
        Update: Partial<NotificationLog>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      student_status_type: StudentStatusType;
      attendance_status: AttendanceStatus;
      payment_method_type: PaymentMethodType;
      fee_status_type: FeeStatusType;
      gender_type: GenderType;
      year_status_type: YearStatusType;
      term_status_type: TermStatusType;
      history_outcome_type: HistoryOutcomeType;
      announcement_target_type: AnnouncementTargetType;
      notification_channel_type: NotificationChannelType;
      notification_status_type: NotificationStatusType;
    };
  };
}
