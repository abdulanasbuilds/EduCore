"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStudentAction } from "@/actions/student-actions";
import { createClient } from "@/lib/supabase/client";

const studentSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"]),
  classId: z.string().uuid("Class is required"),
  enrollmentDate: z.string().optional(),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianPhone: z.string().min(10, "Valid phone number required"),
  guardianRelationship: z.string().min(1, "Relationship is required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function NewStudentPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      enrollmentDate: new Date().toISOString().split("T")[0],
    }
  });

  useEffect(() => {
    async function loadClasses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", user.id).single() as any;
      if (!profile) return;
      
      const { data } = await supabase
        .from("classes")
        .select("id, name")
        .eq("school_id", profile.school_id)
        .order("level");
        
      if (data) setClasses(data);
    }
    loadClasses();
  }, [supabase]);

  const onSubmit = async (data: StudentFormValues) => {
    setLoading(true);
    setError("");
    
    const result = await createStudentAction(data);
    
    setLoading(false);
    
    if (result.success) {
      router.push("/admin/students");
    } else {
      setError(result.message || "Failed to enroll student");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Enroll New Student</h1>
        <Link href="/admin/students" className="text-sm text-slate-500 hover:text-slate-700 min-h-[44px] flex items-center">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 md:p-6 rounded-lg shadow-sm border space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-slate-800">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input {...register("fullName")} className="w-full px-3 py-2 border rounded-md min-h-[44px]" placeholder="John Doe" />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" {...register("dateOfBirth")} className="w-full px-3 py-2 border rounded-md min-h-[44px]" />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select {...register("gender")} className="w-full px-3 py-2 border rounded-md min-h-[44px]">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-slate-800">Academic details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assign to Class</label>
              <select {...register("classId")} className="w-full px-3 py-2 border rounded-md min-h-[44px]">
                <option value="">Select a Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Enrollment Date</label>
              <input type="date" {...register("enrollmentDate")} className="w-full px-3 py-2 border rounded-md min-h-[44px]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 text-slate-800">Primary Guardian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Guardian Full Name</label>
              <input {...register("guardianName")} className="w-full px-3 py-2 border rounded-md min-h-[44px]" />
              {errors.guardianName && <p className="text-red-500 text-xs mt-1">{errors.guardianName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number (SMS)</label>
              <input {...register("guardianPhone")} placeholder="024..." className="w-full px-3 py-2 border rounded-md min-h-[44px]" />
              {errors.guardianPhone && <p className="text-red-500 text-xs mt-1">{errors.guardianPhone.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Relationship</label>
              <select {...register("guardianRelationship")} className="w-full px-3 py-2 border rounded-md min-h-[44px]">
                <option value="">Select</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Uncle">Uncle</option>
                <option value="Aunt">Aunt</option>
                <option value="Grandparent">Grandparent</option>
                <option value="Other">Other</option>
              </select>
              {errors.guardianRelationship && <p className="text-red-500 text-xs mt-1">{errors.guardianRelationship.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto bg-primary-800 text-white px-8 py-2.5 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Enrolling..." : "Enroll Student"}
          </button>
        </div>

      </form>
    </div>
  );
}
