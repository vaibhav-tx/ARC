import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { ClassroomModel } from "@/lib/models";
import mongoose from "mongoose";

const mockClassrooms = [
    {
        classroomId: "CS301",
        title: "Data Structures - Sec A",
        subject: "Computer Science",
        description: "Core DSA concepts for Section A.",
        maxStudents: 60,
        studentsCount: 48,
        status: "active",
        schedule: [
            { day: "Monday", startTime: "09:00", endTime: "10:30" },
            { day: "Wednesday", startTime: "09:00", endTime: "10:30" }
        ],
        teacherId: "teacher", // Fallback
        inviteCode: "DSA-301-A",
        isActive: true,
    },
    {
        classroomId: "CS305",
        title: "DBMS - Sec B",
        subject: "Database Systems",
        description: "Database Management Systems for Section B.",
        maxStudents: 60,
        studentsCount: 42,
        status: "active",
        schedule: [
            { day: "Tuesday", startTime: "11:00", endTime: "12:30" },
            { day: "Thursday", startTime: "11:00", endTime: "12:30" }
        ],
        teacherId: "teacher", // Fallback
        inviteCode: "DBMS-305-B",
        isActive: true,
    }
];

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId");

        // --- AUTO-SEEDER FOR HACKATHON DEMO ---
        const count = await ClassroomModel.countDocuments({ teacherId: teacherId || "teacher" });
        if (count === 0) {
            console.log(`[SEEDER] Seeding classrooms for teacher: ${teacherId || "teacher"}`);
            const seedData = mockClassrooms.map(c => ({
                ...c,
                teacherId: teacherId || "teacher"
            }));
            await ClassroomModel.insertMany(seedData);
        }
        // --------------------------------------

        const classrooms = await ClassroomModel.find({ teacherId: teacherId || "teacher" })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        return NextResponse.json({ classrooms });
    } catch (error: any) {
        console.error("[TEACHER_CLASSROOMS_GET_ERROR]", error);
        return NextResponse.json({ error: "Failed to load classrooms." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const payload = await req.json();
        const { searchParams } = new URL(req.url);
        const teacherId = searchParams.get("teacherId") || payload.teacherId || "teacher";

        const newClassroom = new ClassroomModel({
            ...payload,
            teacherId,
            classroomId: payload.classroomId || `CLASS-${Math.floor(Math.random()*10000)}`,
            inviteCode: payload.inviteCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
            studentsCount: 0,
            status: "active",
            isActive: true,
        });

        await newClassroom.save();
        return NextResponse.json({ classroom: newClassroom }, { status: 201 });
    } catch (error: any) {
        console.error("[TEACHER_CLASSROOMS_POST_ERROR]", error);
        return NextResponse.json({ error: "Failed to create classroom." }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const payload = await req.json();

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Valid Classroom id is required" }, { status: 400 });
        }

        const updated = await ClassroomModel.findByIdAndUpdate(id, payload, { new: true });
        if (!updated) {
            return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
        }

        return NextResponse.json({ classroom: updated });
    } catch (error: any) {
        console.error("[TEACHER_CLASSROOMS_PUT_ERROR]", error);
        return NextResponse.json({ error: "Failed to update classroom." }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Valid Classroom id is required" }, { status: 400 });
        }

        const deleted = await ClassroomModel.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: "Classroom not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[TEACHER_CLASSROOMS_DELETE_ERROR]", error);
        return NextResponse.json({ error: "Failed to delete classroom." }, { status: 500 });
    }
}
