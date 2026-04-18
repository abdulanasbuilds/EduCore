export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | "SUPER_ADMIN"
  | "SCHOOL_ADMIN"
  | "CLASS_TEACHER"
  | "SUBJECT_TEACHER"
  | "BURSAR"
  | "PARENT"
  | "STUDENT";

export type StudentStatus =
  | "Active"
  | "Inactive"
  | "Alumni"
  | "Withdrawn"
  | "Graduated";

export type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

export type PaymentMethod = 
  | "Cash" 
  | "Bank Transfer" 
  | "Mobile Money" 
  | "Cheque" 
  | "Card";

export interface Tables {
  schools: {
    Row: {
      id: string;
      name: string;
      code: string;
      logo_url: string | null;
      address: string | null;
      phone: string | null;
      email: string | null;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<Schema["schools"]["Row"], "id" | "created_at" | "updated_at">;
    Update: Partial<Schema["schools"]["Insert"]>;
  };
  academic_years: {
    Row: {
      id: string;
      school_id: string;
      name: string;
      start_date: string;
      end_date: string;
      is_active: boolean;
      is_locked: boolean;
      created_at: string;
    };
    Insert: Omit<Schema["academic_years"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["academic_years"]["Insert"]>;
  };
  terms: {
    Row: {
      id: string;
      academic_year_id: string;
      school_id: string;
      name: string;
      start_date: string;
      end_date: string;
      is_locked: boolean;
      created_at: string;
    };
    Insert: Omit<Schema["terms"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["terms"]["Insert"]>;
  };
  classes: {
    Row: {
      id: string;
      school_id: string;
      name: string;
      level: number;
      class_teacher_id: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["classes"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["classes"]["Insert"]>;
  };
  subjects: {
    Row: {
      id: string;
      school_id: string;
      name: string;
      code: string;
      created_at: string;
    };
    Insert: Omit<Schema["subjects"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["subjects"]["Insert"]>;
  };
  class_subjects: {
    Row: {
      id: string;
      class_id: string;
      subject_id: string;
      teacher_id: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["class_subjects"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["class_subjects"]["Insert"]>;
  };
  students: {
    Row: {
      id: string;
      school_id: string;
      student_number: string;
      first_name: string;
      last_name: string;
      gender: "Male" | "Female";
      date_of_birth: string;
      photo_url: string | null;
      address: string | null;
      medical_info: string | null;
      emergency_contact_name: string | null;
      emergency_contact_phone: string | null;
      previous_school: string | null;
      class_id: string | null;
      status: StudentStatus;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<Schema["students"]["Row"], "id" | "student_number" | "created_at" | "updated_at">;
    Update: Partial<Schema["students"]["Insert"]>;
  };
  parents: {
    Row: {
      id: string;
      user_id: string;
      first_name: string;
      last_name: string;
      phone: string;
      whatsapp_number: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["parents"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["parents"]["Insert"]>;
  };
  student_parents: {
    Row: {
      student_id: string;
      parent_id: string;
      relationship: string;
    };
    Insert: Schema["student_parents"]["Row"];
    Update: never;
  };
  teachers: {
    Row: {
      id: string;
      user_id: string;
      first_name: string;
      last_name: string;
      phone: string | null;
      qualifications: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["teachers"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["teachers"]["Insert"]>;
  };
  profiles: {
    Row: {
      id: string;
      user_id: string;
      school_id: string | null;
      role: UserRole;
      created_at: string;
      updated_at: string;
    };
    Insert: Omit<Schema["profiles"]["Row"], "id" | "created_at" | "updated_at">;
    Update: Partial<Schema["profiles"]["Insert"]>;
  };
  attendance: {
    Row: {
      id: string;
      student_id: string;
      class_id: string;
      term_id: string;
      date: string;
      status: AttendanceStatus;
      reason: string | null;
      marked_by: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["attendance"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["attendance"]["Insert"]>;
  };
  assessment_types: {
    Row: {
      id: string;
      school_id: string;
      name: string;
      weight: number;
      created_at: string;
    };
    Insert: Omit<Schema["assessment_types"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["assessment_types"]["Insert"]>;
  };
  grades: {
    Row: {
      id: string;
      student_id: string;
      class_subject_id: string;
      assessment_type_id: string;
      term_id: string;
      score: number;
      entered_by: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["grades"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["grades"]["Insert"]>;
  };
  fee_types: {
    Row: {
      id: string;
      school_id: string;
      name: string;
      description: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["fee_types"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["fee_types"]["Insert"]>;
  };
  class_fees: {
    Row: {
      id: string;
      class_id: string;
      fee_type_id: string;
      term_id: string;
      amount: number;
      due_date: string;
      created_at: string;
    };
    Insert: Omit<Schema["class_fees"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["class_fees"]["Insert"]>;
  };
  student_fees: {
    Row: {
      id: string;
      student_id: string;
      class_fee_id: string;
      amount: number;
      is_paid: boolean;
      paid_at: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["student_fees"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["student_fees"]["Insert"]>;
  };
  payments: {
    Row: {
      id: string;
      student_fee_id: string;
      amount: number;
      method: PaymentMethod;
      reference: string | null;
      recorded_by: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["payments"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["payments"]["Insert"]>;
  };
  announcements: {
    Row: {
      id: string;
      school_id: string;
      title: string;
      message: string;
      target_type: "school" | "class";
      target_id: string | null;
      created_by: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["announcements"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["announcements"]["Insert"]>;
  };
  timetable: {
    Row: {
      id: string;
      class_id: string;
      subject_id: string;
      day_of_week: number;
      period: number;
      room: string | null;
      created_at: string;
    };
    Insert: Omit<Schema["timetable"]["Row"], "id" | "created_at">;
    Update: Partial<Schema["timetable"]["Insert"]>;
  };
}

export interface Database extends Json {
  public: {
    Tables: Tables;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Schema = Database["public"];