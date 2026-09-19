"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Navigation,
  UtensilsCrossed,
  BookOpen,
  Users,
  Briefcase,
  Car,
  UserCheck,
  ClipboardList,
  Settings,
  LogOut,
  IndianRupee,
  Award,
  Megaphone,
  Bot,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function StudentSidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    window.location.href = "/login";
  };

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: "/student/dashboard",               icon: Users,         label: "Dashboard" },
    { href: "/student/schedule",                icon: Calendar,      label: "Timetable" },
    { href: "/student/classroom",               icon: BookOpen,      label: "Classroom" },
    { href: "/student/materials",               icon: ClipboardList, label: "Tests & Exams" },
    { href: "/student/events",                  icon: Users,         label: "Events" },
    { href: "/student/food",                    icon: UtensilsCrossed, label: "Food Ordering" },
    { href: "/student/resources",               icon: BookOpen,      label: "Resources" },
    { href: "/student/ai-mentor",               icon: Bot,           label: "AI Mentor" },
    { href: "/student/map",                     icon: Navigation,    label: "Campus Map" },
    { href: "/student/attendance",              icon: UserCheck,     label: "Attendance" },
    { href: "/student/internships",             icon: Briefcase,     label: "Internships" },
    { href: "/student/parking",                 icon: Car,           label: "Parking" },
    { href: "/student/fees",                    icon: IndianRupee,   label: "Pay Fees" },
    { href: "/student/examination",             icon: Award,         label: "Exam Cell" },
    { href: "/student/announcements",           icon: Megaphone,     label: "Announcements" },
  ];

  return (
    <aside
      className={`w-64 bg-zinc-900/50 backdrop-blur-sm border-r border-zinc-800 flex flex-col ${className}`}
    >
      <div className="p-6">
        <Link
          href="/student/dashboard"
          className="text-[#e78a53] font-bold text-xl"
        >
          Arc Campus
        </Link>
        <p className="text-zinc-400 text-sm mt-1">Student Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  active
                    ? "text-white bg-[#e78a53]/10 border-l-2 border-[#e78a53]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-[#e78a53]" : ""}`} />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-zinc-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-zinc-400" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
