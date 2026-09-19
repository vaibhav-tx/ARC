import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { AttendanceModel } from "@/lib/models";
import mongoose from "mongoose";

// We'll keep enrollments mocked for the dropdown UI since full Classroom schedule mapping 
// requires a massive teacher-side refactor outside the current vertical slice scope.
const mockEnrollments = [
  {
    _id: "e1",
    classroomId: "mc1",
    classroom: {
      _id: "mc1",
      title: "Data Structures & Algorithms",
      subject: "Computer Science",
      teacherName: "Prof. Priya Verma",
    },
  },
  {
    _id: "e2",
    classroomId: "mc2",
    classroom: {
      _id: "mc2",
      title: "Database Management Systems",
      subject: "Computer Science",
      teacherName: "Prof. Rakesh Sharma",
    },
  },
  {
    _id: "e3",
    classroomId: "mc3",
    classroom: {
      _id: "mc3",
      title: "Operating Systems",
      subject: "Computer Science",
      teacherName: "Dr. Anita Desai",
    },
  },
];

const mockAttendanceRecords = [
  {
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    status: "present",
    subjectName: "Data Structures & Algorithms",
    className: "Data Structures & Algorithms",
    timeSlot: "09:00–10:30",
    remarks: "",
  },
  {
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    status: "present",
    subjectName: "Database Management Systems",
    className: "Database Management Systems",
    timeSlot: "10:00–11:30",
    remarks: "",
  },
  {
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    status: "late",
    subjectName: "Data Structures & Algorithms",
    className: "Data Structures & Algorithms",
    timeSlot: "09:00–10:30",
    remarks: "Bus delay",
  },
  {
    date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
    status: "present",
    subjectName: "Data Structures & Algorithms",
    className: "Data Structures & Algorithms",
    timeSlot: "09:00–10:30",
    remarks: "",
  },
  {
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    status: "absent",
    subjectName: "Database Management Systems",
    className: "Database Management Systems",
    timeSlot: "10:00–11:30",
    remarks: "Sick",
  },
];

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classroomId = searchParams.get("classroomId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Valid studentId is required" }, { status: 400 });
    }

    // --- AUTO-SEEDER FOR HACKATHON DEMO ---
    const count = await AttendanceModel.countDocuments({ studentId });
    if (count === 0) {
      console.log(`[SEEDER] Seeding attendance for student: ${studentId}`);
      // Give them a dummy teacher ID to satisfy schema
      const dummyTeacherId = new mongoose.Types.ObjectId();
      const seedData = mockAttendanceRecords.map(r => ({
        ...r,
        studentId: new mongoose.Types.ObjectId(studentId),
        teacherId: dummyTeacherId
      }));
      await AttendanceModel.insertMany(seedData);
    }
    // --------------------------------------

    const query: any = { studentId };
    
    if (classroomId) {
      const targetClass = mockEnrollments.find(e => e.classroomId === classroomId);
      if (targetClass) {
        query.subjectName = targetClass.classroom.title;
      }
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const attendanceRecords = await AttendanceModel.find(query).sort({ date: -1 }).lean().exec();

    // Calculate Real Statistics
    const statistics = {
      totalClasses: attendanceRecords.length,
      presentCount: attendanceRecords.filter(r => r.status === 'present').length,
      lateCount: attendanceRecords.filter(r => r.status === 'late').length,
      absentCount: attendanceRecords.filter(r => r.status === 'absent').length,
      attendancePercentage: 0
    };
    
    if (statistics.totalClasses > 0) {
       statistics.attendancePercentage = Math.round(((statistics.presentCount + (statistics.lateCount * 0.5)) / statistics.totalClasses) * 100);
    }

    const classroom = classroomId
      ? (mockEnrollments.find((e) => e.classroomId === classroomId)?.classroom ?? null)
      : null;

    return NextResponse.json({
      attendanceRecords,
      enrollments: mockEnrollments,
      statistics,
      classroom,
    });
  } catch (error: any) {
    console.error("[ATTENDANCE_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to load attendance records." }, { status: 500 });
  }
}
