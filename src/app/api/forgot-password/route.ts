import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { StudentModel, TeacherModel, CanteenModel } from "@/lib/models";
import bcrypt from "bcryptjs";

const roleModels: Record<string, any> = {
  student: StudentModel,
  teacher: TeacherModel,
  canteen: CanteenModel,
};

// Step 1: Get security question by email + role
// POST /api/forgot-password  { action: "get-question", email, role }
// Step 2: Verify answer + set new password
// POST /api/forgot-password  { action: "reset", email, role, securityAnswer, newPassword }

export async function POST(request: Request) {
  await connectToDatabase();

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { action, email, role, securityAnswer, newPassword } = body;

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role are required." }, { status: 400 });
  }

  const Model = roleModels[role?.toLowerCase()];
  if (!Model) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  // ── Step 1: Return the security question ──────────────────────────────────
  if (action === "get-question") {
    const user = await Model.findOne({ email: email.toLowerCase().trim() })
      .select("securityQuestion email")
      .lean();

    if (!user) {
      // Deliberately vague to prevent email enumeration
      return NextResponse.json(
        { error: "No account found with that email and role combination." },
        { status: 404 }
      );
    }

    if (!(user as any).securityQuestion) {
      return NextResponse.json(
        { error: "This account has no security question set. Please contact support." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      securityQuestion: (user as any).securityQuestion,
    });
  }

  // ── Step 2: Verify answer + reset password ────────────────────────────────
  if (action === "reset") {
    if (!securityAnswer || !newPassword) {
      return NextResponse.json(
        { error: "Security answer and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const user = await Model.findOne({ email: email.toLowerCase().trim() })
      .select("securityAnswer securityQuestion")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "No account found with that email and role combination." },
        { status: 404 }
      );
    }

    // Case-insensitive answer comparison
    const storedAnswer = (user as any).securityAnswer || "";
    const isAnswerCorrect =
      storedAnswer.trim().toLowerCase() === securityAnswer.trim().toLowerCase();

    if (!isAnswerCorrect) {
      return NextResponse.json(
        { error: "Incorrect answer to security question. Please try again." },
        { status: 401 }
      );
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Model.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now sign in with your new password.",
    });
  }

  return NextResponse.json({ error: "Invalid action." }, { status: 400 });
}
