"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Receipt,
  BarChart3,
  Megaphone,
  Settings,
  UserPlus,
  X,
  Calendar,
  BookMarked,
  Heart,
  UsersRound,
  Wallet,
  Clock,
  Library,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

type NavLink = { href: string; label: string; icon: LucideIcon } | { divider: true };

const navLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/admissions", label: "Admissions", icon: UserPlus },
  { href: "/admin/classes", label: "Classes & Timetable", icon: School },
  { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
  { divider: true },
  { href: "/admin/attendance", label: "Student Attendance", icon: ClipboardCheck },
  { href: "/admin/staff-attendance", label: "Staff Attendance", icon: UsersRound },
  { href: "/admin/grades", label: "Grades & Assessments", icon: BookOpen },
  { href: "/admin/assignments", label: "Homework", icon: BookMarked },
  { href: "/admin/behaviour", label: "Behaviour", icon: Heart },
  { divider: true },
  { href: "/admin/fees", label: "Fee Collections", icon: Receipt },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/payroll", label: "Payroll", icon: Wallet },
  { href: "/admin/finance", label: "Finance Overview", icon: BarChart3 },
  { divider: true },
  { href: "/admin/library", label: "Library", icon: Library },
  { href: "/admin/events", label: "Events & Calendar", icon: Calendar },
  { divider: true },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white flex flex-col transition-transform duration-200 md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "School"}</h1>
            <p className="text-sm opacity-80 mt-1">Admin Panel</p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-white/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link, idx) => {
            if ('divider' in link && link.divider) {
              return <div key={idx} className="my-4 border-t border-white/20" />;
            }
            const typedLink = link as { href: string; label: string; icon: LucideIcon };
            const Icon = typedLink.icon;
            return (
              <Link
                key={typedLink.href}
                href={typedLink.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px]",
                  isActive(typedLink.href)
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{typedLink.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
