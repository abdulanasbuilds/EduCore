"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, XCircle, Clock, Eye, X } from "lucide-react";

type Application = {
  id: string;
  student_name: string;
  date_of_birth: string;
  gender: string;
  previous_school: string | null;
  class_applied_for: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string | null;
  guardian_relationship: string;
  address: string | null;
  additional_notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
};

export default function AdmissionsClient({
  applications: initialApplications,
}: {
  applications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const filtered = filter === "all"
    ? applications
    : applications.filter((a) => a.status === filter);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    setUpdating(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("admission_applications")
        .update({ status, admin_notes: adminNotes || null })
        .eq("id", id);

      if (!error) {
        setApplications((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status, admin_notes: adminNotes || null } : a
          )
        );
        setSelectedApp(null);
        setAdminNotes("");
      }
    } finally {
      setUpdating(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admission Applications</h1>
          <p className="text-sm text-slate-500 mt-1">
            {applications.length} total &middot; {applications.filter((a) => a.status === "pending").length} pending
          </p>
        </div>

        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500">No {filter === "all" ? "" : filter} applications found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Class</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Guardian</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{app.student_name}</td>
                    <td className="px-4 py-3 text-slate-600">{app.class_applied_for}</td>
                    <td className="px-4 py-3 text-slate-600">{app.guardian_name}</td>
                    <td className="px-4 py-3 text-slate-600">{app.guardian_phone}</td>
                    <td className="px-4 py-3">{statusBadge(app.status)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setAdminNotes(app.admin_notes || "");
                        }}
                        className="text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Application Details</h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Student Name</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.student_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Date of Birth</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Gender</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.gender}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Class Applied For</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.class_applied_for}</p>
                </div>
              </div>

              {selectedApp.previous_school && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Previous School</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.previous_school}</p>
                </div>
              )}

              <hr className="border-slate-200" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Guardian</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.guardian_name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Relationship</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.guardian_relationship}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.guardian_phone}</p>
                </div>
                {selectedApp.guardian_email && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                    <p className="text-sm text-slate-900 mt-0.5">{selectedApp.guardian_email}</p>
                  </div>
                )}
              </div>

              {selectedApp.address && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Address</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.address}</p>
                </div>
              )}

              {selectedApp.additional_notes && (
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase">Additional Notes</p>
                  <p className="text-sm text-slate-900 mt-0.5">{selectedApp.additional_notes}</p>
                </div>
              )}

              <hr className="border-slate-200" />

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Status</p>
                {statusBadge(selectedApp.status)}
              </div>

              {selectedApp.status === "pending" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Admin Notes <span className="text-slate-400">(optional)</span>
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                      placeholder="Reason for decision..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, "approved")}
                      disabled={updating}
                      className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, "rejected")}
                      disabled={updating}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {updating ? "Updating..." : "Reject"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
