import type { 
  UserRole, 
  StudentStatusType, 
  AttendanceStatus, 
  PaymentMethodType, 
  FeeStatusType, 
  GenderType, 
  YearStatusType, 
  TermStatusType, 
  HistoryOutcomeType, 
  AnnouncementTargetType, 
  NotificationChannelType, 
  NotificationStatusType,
  Profile,
  School,
  AcademicYear,
  Term,
  Class,
  Subject,
  ClassSubject,
  Student,
  StudentClassHistory,
  Guardian,
  StudentGuardian,
  AssessmentType,
  Assessment,
  Grade,
  Attendance,
  FeeType,
  FeeAssignment,
  StudentFee,
  FeePayment,
  Announcement,
  NotificationLog
} from "./index";

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
