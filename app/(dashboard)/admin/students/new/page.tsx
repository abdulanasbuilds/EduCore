"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const studentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  classId: z.string().min(1, "Class is required"),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianPhone: z.string().min(10, "Valid phone number required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormValues) => {
    setLoading(true);
    // Real implementation would call a Server Action here
    // e.g. await createStudentAction(data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    router.push("/admin/students");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Enroll New Student</h1>
        <Link href="/admin/students" className="text-sm text-slate-500 hover:text-slate-700">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
        
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input {...register("firstName")} className="w-full px-3 py-2 border rounded-md" />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input {...register("lastName")} className="w-full px-3 py-2 border rounded-md" />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" {...register("dateOfBirth")} className="w-full px-3 py-2 border rounded-md" />
              {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select {...register("gender")} className="w-full px-3 py-2 border rounded-md">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Academic & Guardian</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Assign to Class</label>
              <select {...register("classId")} className="w-full px-3 py-2 border rounded-md">
                <option value="">Select a Class</option>
                <option value="temp-id-1">Primary 1</option>
                <option value="temp-id-2">Primary 2</option>
              </select>
              {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guardian Full Name</label>
              <input {...register("guardianName")} className="w-full px-3 py-2 border rounded-md" />
              {errors.guardianName && <p className="text-red-500 text-xs mt-1">{errors.guardianName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guardian Phone (SMS)</label>
              <input {...register("guardianPhone")} placeholder="+233..." className="w-full px-3 py-2 border rounded-md" />
              {errors.guardianPhone && <p className="text-red-500 text-xs mt-1">{errors.guardianPhone.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "Enrolling..." : "Enroll Student"}
          </button>
        </div>

      </form>
    </div>
  );
}