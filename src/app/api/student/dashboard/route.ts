import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { EventModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    const email = searchParams.get("email");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const isDummyUser = email === "rahul.sharma@student.edu";

    // 1. Fetch live events
    const events = await EventModel.find({ status: "published" }).sort({ startDate: 1 }).limit(4).lean().exec();
    
    const upcomingEvents = events.map(e => ({
      _id: String(e._id),
      title: e.title,
      date: e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "TBA",
      type: e.eventType,
      fee: e.fee,
      icon: "Code",
      color: "text-blue-400"
    }));

    // 2. Mock some data for the charts (since we don't have historical months of data in the DB)
    // The user requested that we keep all charts/schedules the same for new users,
    // but clear the recent activity and food order KPIs since a new user hasn't ordered anything.
    const attendanceTrend = [
      { month: "Nov", attendance: 78 }, { month: "Dec", attendance: 82 },
      { month: "Jan", attendance: 88 }, { month: "Feb", attendance: 85 },
      { month: "Mar", attendance: 91 }, { month: "Apr", attendance: 87 },
    ];

    const subjectAttendance = [
      { subject: "DSA",    pct: 92, classes: 46 },
      { subject: "DBMS",   pct: 88, classes: 44 },
      { subject: "OS",     pct: 75, classes: 38 },
      { subject: "CN",     pct: 95, classes: 48 },
      { subject: "SE",     pct: 83, classes: 42 },
    ];

    const eventTypes = [
      { name: "Academic", value: 3, fill: "#60a5fa" },
      { name: "Cultural", value: 2, fill: "#a78bfa" },
      { name: "Workshop", value: 2, fill: "#34d399" },
      { name: "Sports",   value: 1, fill: "#f87171" },
    ];

    const todaySchedule = [
      { time: "9:00 AM",  subject: "Data Structures",  room: "Room 301", status: "upcoming", teacher: "Prof. Priya Verma" },
      { time: "11:00 AM", subject: "DBMS Lab",          room: "Lab 2",    status: "upcoming", teacher: "Prof. Priya Verma" },
      { time: "1:00 PM",  subject: "Lunch Break",       room: "—",        status: "break",    teacher: "—" },
      { time: "2:00 PM",  subject: "Computer Networks", room: "Room 205", status: "upcoming", teacher: "Prof. Anil Kulkarni" },
      { time: "4:00 PM",  subject: "SE Tutorial",       room: "Room 108", status: "upcoming", teacher: "Prof. Sneha Joshi" },
    ];

    const recentActivity = isDummyUser ? [
      { icon: "ShoppingBag", color: "text-[#e78a53]", bg: "bg-[#e78a53]/10", text: "Veg Thali ordered from Campus Cafe",    time: "1 hr ago"  },
      { icon: "Calendar",    color: "text-blue-400",   bg: "bg-blue-500/10",  text: "Registered for AI/ML Workshop",         time: "3 hr ago"  },
      { icon: "Briefcase",   color: "text-purple-400", bg: "bg-purple-500/10",text: "Applied to Frontend Intern at TechCorp", time: "Yesterday" },
      { icon: "Car",         color: "text-yellow-400", bg: "bg-yellow-500/10",text: "Parking slot A-B-031 requested",         time: "Yesterday" },
      { icon: "BookOpen",    color: "text-green-400",  bg: "bg-green-500/10", text: "Downloaded DSA Notes from Dr. Mehta",    time: "2 days ago"},
    ] : [];

    const kpis = {
      attendance: { value: "84%", sub: "This semester", trend: "+2%" },
      events: { value: "3", sub: "2 upcoming", trend: "+1" },
      fees: { value: "₹12k", sub: "Sem 6", trend: "Action" },
      orders: isDummyUser ? { value: "12", sub: "This month", trend: "+3" } : { value: "0", sub: "No orders", trend: "0" },
      applications: { value: "2", sub: "1 under review", trend: "+1" },
      resources: { value: "8", sub: "2 downloaded today", trend: "+2" },
    };

    return NextResponse.json({
      attendanceTrend,
      subjectAttendance,
      eventTypes,
      todaySchedule,
      upcomingEvents,
      recentActivity,
      kpis
    });

  } catch (error: any) {
    console.error("[STUDENT_DASHBOARD_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
