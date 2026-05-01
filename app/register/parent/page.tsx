"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import Link from "next/link";
import { schoolConfig } from "@/lib/env";
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { verifyStudentForRegistration } from "@/actions/registration-actions";

export default function ParentRegistrationPage() {
  const [step, setStep] = useState<"find" | "register" | "success">("find");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Find child
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [studentName, setStudentName] = useState("");
  const [foundStudent, setFoundStudent] = useState<any>(null);

  // Step 2: Create account
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleFindStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await verifyStudentForRegistration(admissionNumber, { name: studentName });

    if (!result.success || !result.student) {
      setError(result.message || "No active student found with those details. Please check the admission number or contact the school office.");
      setLoading(false);
      return;
    }

    setFoundStudent(result.student);
    setStep("register");
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundStudent) return;
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    // Call server action for parent registration logic
    // We import a specific server action to handle this, as instructed in Fix 8.
    // For now we simulate success since auth logic was specified to be via server action.
    try {
        const { submitParentRegistration } = await import("@/actions/registration-actions");
        const res = await submitParentRegistration({
            studentId: foundStudent.id,
            fullName,
            phone,
            whatsapp,
            email,
            relationship,
            password
        });
        
        if (!res.success) {
            setError(res.message);
            setLoading(false);
            return;
        }
        
        setStep("success");
    } catch(err: any) {
        setError("Something went wrong. Please try again or contact the school office.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{schoolConfig.name}</h1>
          <p className="text-slate-500 mt-1 text-sm">Parent Registration</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          {step === "find" && (
            <>
              <h2 className="text-lg font-semibold mb-1 text-slate-800">Find Your Child</h2>
              <p className="text-sm text-slate-500 mb-5">
                Enter your child&apos;s admission number and name.
              </p>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-medium">{error}</div>
              )}

              <form onSubmit={handleFindStudent} className="space-y-4">
                <div>
                  <label htmlFor="admissionNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Child&apos;s Admission Number
                  </label>
                  <input
                    id="admissionNumber"
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="e.g. GFA-2025-0023"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="studentName" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Child&apos;s Full Name
                  </label>
                  <input
                    id="studentName"
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="Enter student&apos;s full name"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: schoolConfig.primaryColor }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Searching..." : "Find My Child"}
                </button>
              </form>
            </>
          )}

          {step === "register" && foundStudent && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
                <p className="text-green-800 text-sm font-medium">✓ Found: {foundStudent.full_name}</p>
                <p className="text-green-700 text-sm">Class: {foundStudent.class?.name || "Assigned"}</p>
              </div>

              <h2 className="text-lg font-semibold mb-1 text-slate-800">Your Details</h2>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 font-medium">{error}</div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    minLength={2}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Relationship to Child</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Stepfather">Stepfather</option>
                    <option value="Stepmother">Stepmother</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone Number <span className="text-xs text-slate-500 font-normal ml-1">(This will be your login)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    placeholder="e.g. 024XXXXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    WhatsApp Number <span className="text-xs text-slate-500 font-normal ml-1">(Leave blank if same as phone)</span>
                  </label>
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address <span className="text-xs text-slate-500 font-normal ml-1">(Optional)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    minLength={8}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setStep("find"); setError(""); }}
                    className="px-4 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90"
                    style={{ backgroundColor: schoolConfig.primaryColor }}
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Creating Account..." : "Create My Account"}
                  </button>
                </div>
              </form>
            </>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome!</h2>
              <p className="text-slate-600 mb-8">
                Your account has been created successfully. An SMS has been sent to your phone.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center text-white px-8 py-3.5 rounded-xl font-medium hover:opacity-90 transition-opacity w-full"
                style={{ backgroundColor: schoolConfig.primaryColor }}
              >
                Login to Portal
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
