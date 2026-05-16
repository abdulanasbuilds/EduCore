"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { schoolConfig } from "@/lib/env";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitAdmissionApplication } from "@/actions/registration-actions";

const applicationSchema = z.object({
  student_full_name: z.string().min(3, "Full name must be at least 3 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female"]),
  class_applied_for: z.string().uuid("Please select a class"),
  previous_school: z.string().optional(),
  parent_full_name: z.string().min(3, "Full name must be at least 3 characters"),
  parent_relationship: z.string().min(1, "Relationship is required"),
  parent_phone: z.string().min(10, "Valid phone number is required"),
  parent_whatsapp: z.string().optional(),
  parent_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  home_address: z.string().min(5, "Address is required"),
  how_heard: z.string().min(1, "Please tell us how you heard about us"),
  medical_notes: z.string().optional(),
});

type ApplicationValues = z.infer<typeof applicationSchema>;

export default function AdmissionApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [classes, setClasses] = useState<{ id: string, name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [submitError, setSubmitError] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      gender: "Male",
      how_heard: "Word of mouth",
      parent_relationship: "Father",
    }
  });

  const studentName = watch("student_full_name");
  const parentPhone = watch("parent_phone");

  useEffect(() => {
    async function fetchClasses() {
      const supabase = createClient();
      // We use a specific public query or RPC if RLS blocks us. 
      // For now, we'll try fetching from the classes table.
      // In production, we should have a public view or relaxed RLS for this specific use case.
      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .order("level", { ascending: true });
      
      if (!error && data) {
        setClasses(data);
      }
      setLoadingClasses(false);
    }
    fetchClasses();
  }, []);

  const onSubmit = async (data: ApplicationValues) => {
    setSubmitError("");
    try {
      // Find class name for the text field in DB
      const className = classes.find(c => c.id === data.class_applied_for)?.name || "";
      
      const res = await submitAdmissionApplication({
        ...data,
        class_applied_name: className,
        parent_email: data.parent_email || null,
        parent_whatsapp: data.parent_whatsapp || null,
        medical_notes: data.medical_notes || null,
        previous_school: data.previous_school || null,
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setSubmitError(res.message);
      }
    } catch (err) {
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm p-10 border border-slate-200">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Application Submitted!</h2>
            <p className="text-slate-600 mb-2">
              We have received your application for <strong>{studentName}</strong>.
            </p>
            <p className="text-slate-600 mb-8 text-sm">
              Our admissions team will review it and contact you at <strong>{parentPhone}</strong> within 2-3 working days.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity w-full"
              style={{ backgroundColor: schoolConfig.primaryColor }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{schoolConfig.name}</h1>
          <p className="text-slate-600 text-lg">Admission Application Form</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
          {submitError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* STUDENT SECTION */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200"></span>
                Student Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    {...register("student_full_name")}
                    placeholder="Enter student's full name"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.student_full_name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.student_full_name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.student_full_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                  <input 
                    type="date"
                    {...register("date_of_birth")}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.date_of_birth ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.date_of_birth && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.date_of_birth.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                  <select 
                    {...register("gender")}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Class Applying For</label>
                  <select 
                    {...register("class_applied_for")}
                    disabled={loadingClasses}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white transition-all ${errors.class_applied_for ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  >
                    <option value="">{loadingClasses ? "Loading classes..." : "Select Class"}</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.class_applied_for && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.class_applied_for.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Previous School (if any)</label>
                  <input 
                    {...register("previous_school")}
                    placeholder="Previous school name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* PARENT SECTION */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200"></span>
                Parent/Guardian Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    {...register("parent_full_name")}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.parent_full_name ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.parent_full_name && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.parent_full_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship</label>
                  <select 
                    {...register("parent_relationship")}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    {...register("parent_phone")}
                    placeholder="024XXXXXXX"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.parent_phone ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.parent_phone && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.parent_phone.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number (Optional)</label>
                  <input 
                    type="tel"
                    {...register("parent_whatsapp")}
                    placeholder="Optional"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address (Optional)</label>
                  <input 
                    type="email"
                    {...register("parent_email")}
                    placeholder="example@mail.com"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all ${errors.parent_email ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.parent_email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.parent_email.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Home Address</label>
                  <textarea 
                    {...register("home_address")}
                    rows={2}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none ${errors.home_address ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                  />
                  {errors.home_address && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.home_address.message}</p>}
                </div>
              </div>
            </section>

            {/* ADDITIONAL SECTION */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-8 h-px bg-slate-200"></span>
                Additional Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">How did you hear about us?</label>
                  <select 
                    {...register("how_heard")}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option value="Word of mouth">Word of mouth</option>
                    <option value="Social media">Social media</option>
                    <option value="Passed by the school">Passed by the school</option>
                    <option value="Recommended by another parent">Recommended by another parent</option>
                    <option value="Online search">Online search</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Any medical conditions or special needs? (Optional)</label>
                  <textarea 
                    {...register("medical_notes")}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary-900/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 hover:brightness-110"
              style={{ backgroundColor: schoolConfig.primaryColor }}
            >
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                "Submit Application"
              )}
            </button>
          </form>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-slate-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
