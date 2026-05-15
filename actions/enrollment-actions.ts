"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { schoolConfig } from "@/lib/env";
import { sendSMS, sendWhatsApp } from "@/lib/twilio";
import { welcomeEnrollment } from "@/lib/notifications/templates";
import { features } from "@/lib/env";
import type { ActionResponse } from "@/types";
import { z } from "zod";

const enrollmentSchema = z.object({
   admissionApplicationId: z.string().uuid(),
   studentName: z.string().min(1),
   dateOfBirth: z.string().min(1),
   gender: z.enum(["Male", "Female"]),
   classId: z.string().uuid(),
   enrollmentDate: z.string().min(1),
   address: z.string().optional(),
   guardianName: z.string().min(1),
   guardianPhone: z.string().min(10),
   guardianWhatsapp: z.string().optional(),
   guardianEmail: z.string().optional(),
   guardianRelationship: z.string().min(1),
});

export async function enrollFromApplicationAction(
   formData: z.infer<typeof enrollmentSchema>
): Promise<ActionResponse<{ studentId: string; admissionNumber: string }>> {
   // STEP 1: Always verify authentication first
   const supabase = await createClient();
   const { data: { user }, error: authError } = await (supabase.auth as any).getUser();
   
   if (authError || !user) {
     return { success: false, message: 'Authentication required.' };
   }

   // STEP 2: Get user role and school_id from profiles
   const { data: profile } = await supabase
     .from('profiles')
     .select('role, school_id, is_active')
     .eq('id', user.id)
     .single();
   
   if (!profile) {
     return { success: false, message: 'Profile not found.' };
   }
   
   if (!profile.is_active) {
     return { success: false, message: 'Account is inactive.' }
   }
   
   if (!profile.school_id) {
     return { success: false, message: 'No school assigned to this account.' }
   }
   
   // STEP 3: Check role permission - only school_admin or bursar can enroll from application
   if (!['school_admin', 'bursar'].includes(profile.role)) {
     return { success: false, message: 'You do not have permission for this action.' }
   }

   try {
     const parsed = enrollmentSchema.safeParse(formData);
     if (!parsed.success) {
       return { success: false, message: 'Validation failed' };
     }

     const data = parsed.data;
     const supabase = await createClient();
     if (!supabase) return { success: false, message: 'Supabase not configured' };
     
     // Verify the admission application belongs to the user's school (defense in depth)
     const { data: existingApp, error: appError } = await supabase
       .from("admission_applications")
       .select("*")
       .eq("id", data.admissionApplicationId)
       .single();
     if (appError || !existingApp) return { success: false, message: 'Application not found' };
     if (existingApp.status !== "pending") return { success: false, message: 'Application already processed' };
     
     // Verify the application belongs to the user's school
     const { data: appSchoolCheck, error: appSchoolError } = await supabase
       .from("admission_applications")
       .select("school_id")
       .eq("id", data.admissionApplicationId)
       .single();
     if (appSchoolError || !appSchoolCheck) return { success: false, message: 'Application not found' };
     if (appSchoolCheck.school_id !== profile.school_id) return { success: false, message: 'Access denied.' };

     const { data: currentYear, error: yearError } = await supabase
       .from("academic_years")
       .select("id")
       .eq("school_id", profile.school_id)
       .eq("is_current", true)
       .single();
     if (yearError || !currentYear) return { success: false, message: 'No active academic year found' };

     const { data: activeTerm, error: termError } = await supabase
       .from("terms")
       .select("id, name")
       .eq("academic_year_id", currentYear.id)
       .in("status", ["upcoming", "active"])
       .limit(1)
       .single();

     // Use crypto-secure random for admission number instead of Math.random()
     const { randomBytes } = await import('crypto');
     const randomPart = parseInt(
       randomBytes(2).toString('hex'), 16
     ).toString().padStart(4, '0');
     const admissionNumber = `ADM-${new Date().getFullYear()}-${randomPart}`;

// For creating student, we use regular client with RLS
      // We've already verified the user is authenticated and authorized (school_admin or bursar)
      
      // Verify the student doesn't already exist with this admission number (defense in depth)
      const { data: existingStudentCheck } = await supabase
        .from("students")
        .select("id")
        .eq("admission_number", admissionNumber)
        .single();
      if (existingStudentCheck) {
        // Generate a new one if collision occurs
        const randomPart2 = parseInt(
          randomBytes(2).toString('hex'), 16
        ).toString().padStart(4, '0');
        const admissionNumber = `ADM-${new Date().getFullYear()}-${randomPart2}`;
      }
      
      const { data: student, error: studentError } = await supabase
        .from("students")
        .insert({
          school_id: profile.school_id,
          admission_number: admissionNumber,
          full_name: data.studentName,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          enrollment_date: data.enrollmentDate,
          address: data.address || null,
          previous_school: existingApp.previous_school,
          status: "Active" as const,
        })
        .select("id")
        .single();
      
      if (studentError || !student) {
        console.error('Error in enrollFromApplicationAction - student creation:', studentError);
        return { success: false, message: 'Failed to create student' };
      }
      
      await supabase.from("student_class_history").insert({
        student_id: student.id,
        class_id: data.classId,
        academic_year_id: currentYear.id,
        is_current: true,
        outcome: "active" as const,
        enrolled_date: data.enrollmentDate,
      });
      
      await supabase.from("student_guardians").insert({
        student_id: student.id,
        guardian_id: null,
      });
      
      // For guardian creation, we use regular client with RLS
      const { data: guardian, error: guardianError } = await supabase
        .from("guardians")
        .insert({
          school_id: profile.school_id,
          full_name: data.guardianName,
          phone: data.guardianPhone,
          whatsapp_number: data.guardianWhatsapp || null,
          email: data.guardianEmail || null,
          relationship: data.guardianRelationship,
          is_primary: true,
        })
        .select("id")
        .single();
      
      if (!guardianError && guardian) {
        await supabase.from("student_guardians").update({ guardian_id: guardian.id }).eq("student_id", student.id);
      }
      
      if (activeTerm) {
        const { data: feeAssignments, error: feeError } = await supabase
          .from("fee_assignments")
          .select("id, amount, due_date")
          .eq("class_id", data.classId)
          .eq("term_id", activeTerm.id);
        
        if (!feeError && feeAssignments?.length) {
          const feeRecords = feeAssignments.map((fa: any) => ({
            student_id: student.id,
            fee_assignment_id: fa.id,
            amount_owed: fa.amount,
            amount_paid: 0,
            balance: fa.amount,
            status: "Unpaid" as const,
          }));
          await supabase.from("student_fees").insert(feeRecords);
        }
      }
      
      await supabase.from("admission_applications")
        .update({ status: "approved" as const, admin_notes: `Enrolled as ${admissionNumber}` } as any)
        .eq("id", data.admissionApplicationId);

     // Use crypto-secure random for password instead of Math.random()
     const randomPasswordBytes = randomBytes(4);
     const password = randomPasswordBytes.toString('base64url').slice(0, 8);
     
     const message = welcomeEnrollment(
       data.guardianName, data.studentName, "", `${process.env.NEXT_PUBLIC_APP_URL}/login`, password, schoolConfig.name
     );

     const phone = data.guardianWhatsapp || data.guardianPhone;
     if (phone) {
       await sendWhatsApp({ to: phone, message, recipientName: data.guardianName, type: "enrollment" }).catch(() => {});
       if (!features.smsEnabled) {
         await sendSMS({ to: phone, message, recipientName: data.guardianName, type: "enrollment" }).catch(() => {});
       }
     }

     return {
       success: true,
       message: `${data.studentName} enrolled successfully. Admission No: ${admissionNumber}`,
       data: { studentId: student.id, admissionNumber },
     };
   } catch (err: any) {
     console.error('Error in enrollFromApplicationAction:', err);
     return { success: false, message: 'An unexpected error occurred' };
   }
 }
