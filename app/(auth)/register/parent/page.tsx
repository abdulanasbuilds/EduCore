"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GraduationCap, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerParentAction } from "@/actions/parent-registration-actions";

const schema = z.object({
  studentAdmissionNumber: z.string().min(1, "Admission number is required"),
  studentFullName: z.string().min(1, "Student name is required"),
  parentFullName: z.string().min(1, "Your full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  relationship: z.string().min(1, "Relationship is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function ParentRegistrationPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setSuccess(null);

    const result = await registerParentAction(data);
    
    if (result.success) {
      setSuccess(result.message);
      // Give them a moment to read the success message before redirecting
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 3000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary-100 flex items-center justify-center rounded-xl mb-4">
          <GraduationCap className="w-6 h-6 text-primary-700" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Parent Registration</h2>
        <p className="mt-2 text-sm text-slate-500">
          Link your account to your child's profile to monitor their progress.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start gap-3 border border-green-100">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm font-medium">
            <p>{success}</p>
            <p className="mt-1 font-normal opacity-90">Redirecting to login...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">1. Student Information</h3>
            <p className="text-xs text-slate-500 mb-2">We use this to find and link your child's records.</p>
            
            <div className="space-y-2">
              <Label htmlFor="studentAdmissionNumber">Admission Number</Label>
              <Input
                id="studentAdmissionNumber"
                placeholder="e.g. ANA-2025-0001"
                {...register("studentAdmissionNumber")}
                className={errors.studentAdmissionNumber ? "border-red-500" : ""}
              />
              {errors.studentAdmissionNumber && <p className="text-xs text-red-500">{errors.studentAdmissionNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentFullName">Student Full Name</Label>
              <Input
                id="studentFullName"
                placeholder="e.g. Kofi Mensah"
                {...register("studentFullName")}
                className={errors.studentFullName ? "border-red-500" : ""}
              />
              {errors.studentFullName && <p className="text-xs text-red-500">{errors.studentFullName.message}</p>}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
            <h3 className="font-semibold text-sm text-slate-700">2. Your Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="parentFullName">Your Full Name</Label>
              <Input
                id="parentFullName"
                placeholder="e.g. Ama Mensah"
                {...register("parentFullName")}
                className={errors.parentFullName ? "border-red-500" : ""}
              />
              {errors.parentFullName && <p className="text-xs text-red-500">{errors.parentFullName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <select
                  id="relationship"
                  {...register("relationship")}
                  className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.relationship ? "border-red-500" : "border-slate-200"}`}
                >
                  <option value="">Select...</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
                {errors.relationship && <p className="text-xs text-red-500">{errors.relationship.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="e.g. 0244123456"
                  {...register("phone")}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary-700 hover:bg-primary-800 h-11"
          disabled={isSubmitting || !!success}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying and Creating Account...
            </>
          ) : (
            <>
              Register as Parent
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-500">
          Sign in here
        </Link>
      </p>
    </div>
  );
}
