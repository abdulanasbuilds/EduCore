"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import Link from "next/link";
import { schoolConfig } from "@/lib/env";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AdmissionApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Student info
  const [studentName, setStudentName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("Male");
  const [previousSchool, setPreviousSchool] = useState("");
  const [classAppliedFor, setClassAppliedFor] = useState("");

  // Guardian info
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentWhatsapp, setParentWhatsapp] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [address, setAddress] = useState("");
  
  // Additional info
  const [howHeard, setHowHeard] = useState("Word of mouth");
  const [medicalNotes, setMedicalNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const { submitAdmissionApplication } = await import("@/actions/registration-actions");
        const res = await submitAdmissionApplication({
            student_full_name: studentName,
            date_of_birth: dateOfBirth,
            gender: gender,
            previous_school: previousSchool,
            class_applied_name: classAppliedFor,
            parent_full_name: parentName,
            parent_phone: parentPhone,
            parent_whatsapp: parentWhatsapp,
            parent_email: parentEmail,
            parent_relationship: relationship,
            home_address: address,
            how_heard: howHeard,
            medical_notes: medicalNotes
        });

        if (!res.success) {
            setError(res.message);
            setLoading(false);
            return;
        }

        setSubmitted(true);
    } catch(err: any) {
        setError("Failed to submit application. Please try again or contact the school office.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-sm p-10 border border-slate-200">
            <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Application Submitted Successfully!</h2>
            <p className="text-slate-600 mb-2">
              We have received your application for <strong>{studentName}</strong>.
            </p>
            <p className="text-slate-600 mb-8">
              Our admissions team will review it and contact you at <strong>{parentPhone}</strong> within 2-3 working days. Thank you for choosing {schoolConfig.name}.
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{schoolConfig.name} — Admission Application</h1>
          <p className="text-slate-600 text-lg">
            Fill in this form to apply for admission. Our admissions team will contact you within 2-3 working days.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 font-medium">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STUDENT INFO */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Student Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date of Birth</label>
                  <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Class Applying For</label>
                  <input type="text" value={classAppliedFor} onChange={(e) => setClassAppliedFor(e.target.value)} required placeholder="e.g. Primary 1, JHS 2" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Previous School <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="text" value={previousSchool} onChange={(e) => setPreviousSchool(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
              </div>
            </div>

            {/* PARENT INFO */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Parent/Guardian Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Parent Full Name</label>
                  <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Relationship</label>
                  <select value={relationship} onChange={(e) => setRelationship(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500">
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required placeholder="e.g. 024XXXXXXX" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="tel" value={parentWhatsapp} onChange={(e) => setParentWhatsapp(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Home Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows={2} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 resize-none" />
                </div>
              </div>
            </div>

            {/* ADDITIONAL INFO */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Additional Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">How did you hear about us?</label>
                  <select value={howHeard} onChange={(e) => setHowHeard(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500">
                    <option value="Word of mouth">Word of mouth</option>
                    <option value="Social media">Social media</option>
                    <option value="Passed by the school">Passed by the school</option>
                    <option value="Recommended by another parent">Recommended by another parent</option>
                    <option value="Online search">Online search</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Any medical conditions or special needs? <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea value={medicalNotes} onChange={(e) => setMedicalNotes(e.target.value)} rows={3} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 resize-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
              style={{ backgroundColor: schoolConfig.primaryColor }}
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
