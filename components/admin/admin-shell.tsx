"use client";

import { AdminSidebar } from "@/components/admin/sidebar";
import { Menu, LogOut } from "lucide-react";
import { useState } from "react";

interface AdminShellProps {
  children: React.ReactNode;
  profileName: string;
  currentTerm: string;
}

export function AdminShell({ children, profileName, currentTerm }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-slate-800 truncate">
              {currentTerm}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">
              {profileName}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium min-h-[44px] px-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        </header>

        <main className="p-4 md:p-6 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
