"use client"

import Link from "next/link"
import { ArcChatbot } from "@/components/arc-chatbot"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/student-sidebar"
import { UserMenu } from "@/components/user-menu"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts"
import {
  Calendar, Briefcase, Bell, Users, BookOpen, ShoppingBag,
  IndianRupee, Car, TrendingUp, ArrowUpRight, ArrowDownRight,
  CheckCircle, Clock, AlertCircle, Activity, Star, Code,
  Music, Trophy, Lightbulb, Palette, MapPin, FileText, Award, Megaphone
} from "lucide-react"
import { useEffect, useState } from "react"

// ── Icons mapping for dynamic data ──────────────────────────────────────────────
const ICON_MAP: Record<string, any> = {
  ShoppingBag, Calendar, Briefcase, Car, BookOpen, Code, Music, Trophy, Lightbulb, Palette
};

// ── Shared tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs shadow-xl">
      {label && <p className="text-zinc-400 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill || "#e78a53" }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KPI({ icon: Icon, label, value, sub, trend, up, color, bg }: any) {
  return (
    <Card className="bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-xl ${bg}`}><Icon className={`h-5 w-5 ${color}`} /></div>
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-400" : "text-red-400"}`}>
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}{trend}
          </span>
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-zinc-400 text-sm mt-0.5">{label}</p>
        <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

export default function StudentDashboard() {
  const [isClient, setIsClient] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    const loadUserAndData = async () => {
      try {
        const u = localStorage.getItem("currentUser")
        if (u) {
          const parsed = JSON.parse(u)
          setCurrentUser(parsed)
          
          const res = await fetch(`/api/student/dashboard?studentId=${parsed.id || parsed._id}&email=${encodeURIComponent(parsed.email || "")}`)
          const json = await res.json()
          if (!res.ok) throw new Error(json.error || "Failed to fetch dashboard data")
          setData(json)
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to backend")
      } finally {
        setIsLoading(false)
      }
    }
    loadUserAndData()
  }, [])

  if (!isClient) return null
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e78a53]"></div>
      </div>
    )
  }

  // Students have firstName/lastName from DB; admin has username='ADMIN1'
  // Never show admin username on student dashboard
  const isDummyUser = currentUser?.email === "rahul.sharma@student.edu" || false;
  const name = (() => {
    if (!currentUser) return "Rohit Sharma"
    if (currentUser.role === "admin") return "Rohit Sharma"
    if (currentUser.firstName) return `${currentUser.firstName}${currentUser.lastName ? " " + currentUser.lastName : ""}`
    if (currentUser.fullName) return currentUser.fullName
    if (currentUser.displayName) return currentUser.displayName
    if (currentUser.name) return currentUser.name
    if (currentUser.username && currentUser.username.toUpperCase() !== "ADMIN1") return currentUser.username
    return "Student"
  })()

  return (
    <div className="min-h-screen bg-black flex">
      <StudentSidebar />
      <ArcChatbot userRole="student" />
      <main className="flex-1 overflow-auto">

        {/* Header */}
        <header className="bg-zinc-900/30 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10 px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back, {name} 👋</h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs">
                <Activity className="h-3 w-3 mr-1 text-green-400" />Sem 6
              </Badge>
              <Bell className="h-5 w-5 text-zinc-400 cursor-pointer hover:text-white transition-colors" />
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm flex-1">{error}</p>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KPI icon={CheckCircle}  label="Avg Attendance"    value={data?.kpis?.attendance?.value || "0%"}  sub={data?.kpis?.attendance?.sub || "This semester"}         trend={data?.kpis?.attendance?.trend || "0%"}   up color="text-green-400"  bg="bg-green-500/10"  />
            <KPI icon={Calendar}     label="Events Registered" value={data?.kpis?.events?.value || "0"}    sub={data?.kpis?.events?.sub || "0 upcoming"}             trend={data?.kpis?.events?.trend || "0"}    up color="text-blue-400"   bg="bg-blue-500/10"   />
            <KPI icon={IndianRupee}  label="Fees Due"          value={data?.kpis?.fees?.value || "₹0"} sub={data?.kpis?.fees?.sub || "All clear"}                 trend={data?.kpis?.fees?.trend || "Clear"} up={false} color="text-red-400"   bg="bg-red-500/10"   />
            <KPI icon={ShoppingBag}  label="Food Orders"       value={data?.kpis?.orders?.value || "0"}   sub={data?.kpis?.orders?.sub || "This month"}             trend={data?.kpis?.orders?.trend || "0"}    up color="text-[#e78a53]"  bg="bg-[#e78a53]/10"  />
            <KPI icon={Briefcase}    label="Applications"      value={data?.kpis?.applications?.value || "0"}    sub={data?.kpis?.applications?.sub || "0 under review"}         trend={data?.kpis?.applications?.trend || "0"}    up color="text-purple-400" bg="bg-purple-500/10" />
            <KPI icon={BookOpen}     label="Resources"         value={data?.kpis?.resources?.value || "0"}    sub={data?.kpis?.resources?.sub || "0 downloaded"} trend={data?.kpis?.resources?.trend || "0"}    up color="text-teal-400"   bg="bg-teal-500/10"   />
          </div>

          {/* Row 2: Attendance trend + Subject breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-400" /> Attendance Trend (6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data?.attendanceTrend || []} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="attendance" name="Attendance %" stroke="#34d399" fill="url(#attGrad)" strokeWidth={2} dot={{ fill: "#34d399", r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" /> Subject-wise Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(data?.subjectAttendance || []).map((s: any) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300 font-medium">{s.subject}</span>
                      <span className={s.pct < 80 ? "text-red-400 font-bold" : "text-green-400 font-bold"}>{s.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${s.pct}%`, background: s.pct < 80 ? "#f87171" : s.pct > 90 ? "#34d399" : "#60a5fa" }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> OS below 80% threshold
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Event types + Today's schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" /> Events by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie data={data?.eventTypes || []} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                      {(data?.eventTypes || []).map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {(data?.eventTypes || []).map((e: any) => (
                    <div key={e.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: e.fill }} />
                      <span className="text-zinc-400">{e.name}</span>
                      <span className="text-zinc-500 ml-auto">{e.value}</span>
                    </div>
                  ))}
                </div>
                {/* Upcoming events */}
                <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5">
                  {(data?.upcomingEvents || []).map((ev: any) => {
                    const Icon = ICON_MAP[ev.icon] || Calendar
                    return (
                      <div key={ev.title} className="flex items-center gap-2 text-xs">
                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${ev.color}`} />
                        <span className="text-zinc-300 truncate flex-1">{ev.title}</span>
                        <span className="text-zinc-500">{ev.date}</span>
                        <Badge className={`text-[9px] py-0 px-1.5 ${ev.fee === 0 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                          {ev.fee === 0 ? "Free" : `₹${ev.fee}`}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Today's schedule */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-400" /> Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data?.todaySchedule || []).map((s: any, i: number) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${s.status === "break" ? "bg-zinc-800/30" : "bg-zinc-800/50"}`}>
                    <span className="text-xs text-zinc-500 w-16 flex-shrink-0">{s.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium truncate ${s.status === "break" ? "text-zinc-500 italic" : "text-white"}`}>{s.subject}</p>
                      {s.room !== "—" && (
                        <p className="text-[10px] text-zinc-600 flex items-center gap-0.5 mt-0.5">
                          <MapPin className="h-2.5 w-2.5" />{s.room}{s.teacher && s.teacher !== "—" ? ` · ${s.teacher}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <Link href="/student/timetable" className="block text-center text-xs text-[#e78a53] hover:underline mt-1">
                  Full timetable →
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Row 4: Recent activity + Quick links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 bg-zinc-900/60 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#e78a53]" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data?.recentActivity || []).map((a: any, i: number) => {
                  const Icon = ICON_MAP[a.icon] || Activity
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-xl hover:bg-zinc-800/70 transition-colors">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${a.bg}`}><Icon className={`h-4 w-4 ${a.color}`} /></div>
                      <p className="text-white text-sm flex-1 truncate">{a.text}</p>
                      <span className="text-zinc-600 text-xs flex-shrink-0 flex items-center gap-1"><Clock className="h-3 w-3" />{a.time}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* Internship status */}
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-purple-400" /> Internship Applications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(isDummyUser ? [
                    { company: "TechCorp India",    role: "Frontend Intern",   status: "Under Review", color: "text-yellow-400", bg: "bg-yellow-500/10" },
                    { company: "DataPulse Analytics",role: "Data Science Intern", status: "Applied",   color: "text-blue-400",   bg: "bg-blue-500/10"   },
                    { company: "Designify",          role: "UI/UX Intern",      status: "Shortlisted", color: "text-green-400",  bg: "bg-green-500/10"  },
                  ] : []).map(a => (
                    <div key={a.company} className="flex items-start gap-2 p-2 bg-zinc-800/40 rounded-lg">
                      <Briefcase className="h-3.5 w-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{a.role}</p>
                        <p className="text-zinc-500 text-[10px]">{a.company}</p>
                      </div>
                      <Badge className={`text-[9px] px-1.5 py-0 ${a.bg} ${a.color} border-0`}>{a.status}</Badge>
                    </div>
                  ))}
                  <Link href="/student/internships" className="block text-center text-xs text-[#e78a53] hover:underline mt-1">View all →</Link>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
