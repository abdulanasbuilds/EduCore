export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          whatsapp_number: string | null;
          role: UserRole;
          avatar_url: string | null;
          is_active: boolean | null;
          school_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'> & { created_at?: string, updated_at?: string };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      schools: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          motto: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['schools']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string };
        Update: Partial<Database['public']['Tables']['schools']['Insert']>;
      };
      academic_years: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean | null;
          status: YearStatusType | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['academic_years']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['academic_years']['Insert']>;
      };
      terms: {
        Row: {
          id: string;
          academic_year_id: string;
          school_id: string;
          name: string;
          term_number: number;
          start_date: string;
          end_date: string;
          fee_due_date: string;
          status: TermStatusType | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['terms']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['terms']['Insert']>;
      };
      classes: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          level: number;
          capacity: number;
          class_teacher_id: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['classes']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['classes']['Insert']>;
      };
      subjects: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          code: string;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['subjects']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['subjects']['Insert']>;
      };
      class_subjects: {
        Row: {
          id: string;
          class_id: string;
          subject_id: string;
          teacher_id: string;
          academic_year_id: string;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['class_subjects']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['class_subjects']['Insert']>;
      };
      students: {
        Row: {
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
          status: StudentStatusType | null;
          withdrawal_date: string | null;
          withdrawal_reason: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['students']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string };
        Update: Partial<Database['public']['Tables']['students']['Insert']>;
      };
      student_class_history: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          academic_year_id: string;
          outcome: HistoryOutcomeType | null;
          is_current: boolean | null;
          enrolled_date: string;
          completed_date: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['student_class_history']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['student_class_history']['Insert']>;
      };
      guardians: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          phone: string;
          whatsapp_number: string | null;
          email: string | null;
          relationship: string;
          is_primary: boolean | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['guardians']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['guardians']['Insert']>;
      };
      student_guardians: {
        Row: {
          student_id: string;
          guardian_id: string;
        };
        Insert: Database['public']['Tables']['student_guardians']['Row'];
        Update: Partial<Database['public']['Tables']['student_guardians']['Insert']>;
      };
      assessment_types: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          weight: number;
          max_score: number | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['assessment_types']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['assessment_types']['Insert']>;
      };
      assessments: {
        Row: {
          id: string;
          term_id: string;
          class_id: string;
          subject_id: string;
          assessment_type_id: string;
          title: string;
          date: string;
          max_score: number;
          is_published: boolean | null;
          published_at: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>;
      };
      grades: {
        Row: {
          id: string;
          assessment_id: string;
          student_id: string;
          score: number | null;
          remarks: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['grades']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string };
        Update: Partial<Database['public']['Tables']['grades']['Insert']>;
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          class_id: string;
          term_id: string;
          date: string;
          status: AttendanceStatus;
          remarks: string | null;
          marked_by: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>;
      };
      fee_types: {
        Row: {
          id: string;
          school_id: string;
          name: string;
          description: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['fee_types']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['fee_types']['Insert']>;
      };
      fee_assignments: {
        Row: {
          id: string;
          term_id: string;
          class_id: string;
          fee_type_id: string;
          amount: number;
          due_date: string;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['fee_assignments']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['fee_assignments']['Insert']>;
      };
      student_fees: {
        Row: {
          id: string;
          student_id: string;
          fee_assignment_id: string;
          amount_owed: number;
          amount_paid: number | null;
          balance: number | null;
          status: FeeStatusType | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['student_fees']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string };
        Update: Partial<Database['public']['Tables']['student_fees']['Insert']>;
      };
      fee_payments: {
        Row: {
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
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['fee_payments']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['fee_payments']['Insert']>;
      };
      announcements: {
        Row: {
          id: string;
          school_id: string;
          created_by: string | null;
          title: string;
          body: string;
          target: AnnouncementTargetType;
          class_id: string | null;
          send_sms: boolean | null;
          send_whatsapp: boolean | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
      notification_logs: {
        Row: {
          id: string;
          school_id: string;
          recipient_phone: string;
          recipient_name: string;
          channel: NotificationChannelType;
          type: string;
          message_body: string;
          status: NotificationStatusType | null;
          error_message: string | null;
          sent_at: string | null;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['notification_logs']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string };
        Update: Partial<Database['public']['Tables']['notification_logs']['Insert']>;
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Profile = Tables<'profiles'>;
export type School = Tables<'schools'>;
export type AcademicYear = Tables<'academic_years'>;
export type Term = Tables<'terms'>;
export type Class = Tables<'classes'>;
export type Subject = Tables<'subjects'>;
export type ClassSubject = Tables<'class_subjects'>;
export type Student = Tables<'students'>;
export type StudentClassHistory = Tables<'student_class_history'>;
export type Guardian = Tables<'guardians'>;
export type AssessmentType = Tables<'assessment_types'>;
export type Assessment = Tables<'assessments'>;
export type Grade = Tables<'grades'>;
export type Attendance = Tables<'attendance'>;
export type FeeType = Tables<'fee_types'>;
export type FeeAssignment = Tables<'fee_assignments'>;
export type StudentFee = Tables<'student_fees'>;
export type FeePayment = Tables<'fee_payments'>;
export type Announcement = Tables<'announcements'>;
export type NotificationLog = Tables<'notification_logs'>;

export type StudentWithGuardians = Student & {
  guardians: Guardian[];
};

export type GradeWithAssessment = Grade & {
  assessment: Assessment;
};
