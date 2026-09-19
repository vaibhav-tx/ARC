import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StudentModel, TeacherModel, CanteenModel } from "@/lib/models";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing credentials" },
        { status: 400 }
      );
    }

    // --- HACKATHON DEMO BYPASS ---
    // Allow our hardcoded demo accounts to log in without needing to exist in the database
    const demoAccounts: Record<string, any> = {
      "rahul.sharma@student.edu": { role: "student", name: "Rahul Sharma", id: "demo-student-1", avatarInitials: "RS" },
      "priya.verma@college.edu": { role: "teacher", name: "Priya Verma", id: "demo-teacher-1", avatarInitials: "PV" },
      "sanjay.canteen@campus.in": { role: "canteen", name: "Sanjay Kumar", id: "demo-canteen-1", avatarInitials: "SK" }
    };
    
    if (demoAccounts[email.toLowerCase()] && demoAccounts[email.toLowerCase()].role === role) {
      const user = demoAccounts[email.toLowerCase()];
      return NextResponse.json({
        id: user.id,
        name: user.name,
        email: email,
        role: user.role,
        avatarInitials: user.avatarInitials,
      });
    }
    // -----------------------------

    let Model;
    if (role === "student") {
      Model = StudentModel;
    } else if (role === "teacher") {
      Model = TeacherModel;
    } else if (role === "canteen") {
      Model = CanteenModel;
    } else {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const user = await Model.findOne({ email });
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    // Handle different name formats for different user types
    let userName = "";
    if (role === "canteen") {
      userName = user.ownerName || "";
    } else {
      userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }

    return NextResponse.json({
      id: String(user._id),
      name: userName,
      email: user.email,
      role,
      avatarInitials: user.avatarInitials || "",
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}
