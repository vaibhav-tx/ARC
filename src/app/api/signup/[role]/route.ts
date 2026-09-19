import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { StudentModel, TeacherModel, CanteenModel } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const roleModels = {
  student: StudentModel,
  teacher: TeacherModel,
  canteen: CanteenModel,
};

const requiredFields: Record<string, string[]> = {
  student: [
    "firstName",
    "lastName",
    "email",
    "password",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
    "studentId",
    "course",
    "branch",
    "year",
    "semester",
    "rollNumber",
    "section",
    "emergencyContactName",
    "emergencyContactPhone",
    "emergencyContactRelation",
    "parentGuardianName",
    "parentGuardianPhone",
    "securityQuestion",
    "securityAnswer",
  ],
  teacher: [
    "firstName",
    "lastName",
    "email",
    "password",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
    "employeeId",
    "department",
    "designation",
    "qualification",
    "experience",
    "joiningDate",
    "emergencyContactName",
    "emergencyContactPhone",
    "emergencyContactRelation",
    "securityQuestion",
    "securityAnswer",
  ],
  canteen: [
    "ownerName",
    "email",
    "password",
    "phone",
    "seatingCapacity",
    "servingCapacity",
    "emergencyContactName",
    "emergencyContactPhone",
    "bankAccountNumber",
    "bankIFSC",
    "panNumber",
    "securityQuestion",
    "securityAnswer",
  ],
};

const allowedFields: Record<string, string[]> = {
  student: [
    "firstName",
    "lastName",
    "email",
    "password",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
    "studentId",
    "course",
    "branch",
    "year",
    "semester",
    "rollNumber",
    "section",
    "emergencyContactName",
    "emergencyContactPhone",
    "emergencyContactRelation",
    "parentGuardianName",
    "parentGuardianPhone",
    "bio",
    "interests",
    "skills",
    "securityQuestion",
    "securityAnswer",
  ],
  teacher: [
    "firstName",
    "lastName",
    "email",
    "password",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
    "employeeId",
    "department",
    "designation",
    "qualification",
    "experience",
    "subjects",
    "joiningDate",
    "emergencyContactName",
    "emergencyContactPhone",
    "emergencyContactRelation",
    "bio",
    "specializations",
    "securityQuestion",
    "securityAnswer",
  ],
  canteen: [
    "ownerName",
    "email",
    "password",
    "phone",
    "alternatePhone",
    "address",
    "gstNumber",
    "cuisineTypes",
    "seatingCapacity",
    "servingCapacity",
    "emergencyContactName",
    "emergencyContactPhone",
    "bankAccountNumber",
    "bankIFSC",
    "panNumber",
    "description",
    "specialities",
    "securityQuestion",
    "securityAnswer",
  ],
};

function getAvatarInitials(firstName: string, lastName: string) {
  const firstInitial = firstName?.trim()?.charAt(0)?.toUpperCase() || "";
  const lastInitial = lastName?.trim()?.charAt(0)?.toUpperCase() || "";
  return `${firstInitial}${lastInitial}`.trim();
}

export async function POST(
  request: Request,
  { params }: { params: { role: string } },
) {
  const role = params?.role?.toLowerCase();
  const Model = role ? roleModels[role] : undefined;

  // 1. Rate Limiting Protection (Security Hardening)
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const { success, headers } = rateLimit(ip, 3, 60000); // Max 3 signups per minute per IP
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429, headers }
    );
  }

  if (!Model) {
    return NextResponse.json(
      { error: "Invalid signup role." },
      { status: 404 },
    );
  }

  await connectToDatabase();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const missingFields = requiredFields[role].filter((field) => {
    const value = body[field];
    return (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim().length === 0) ||
      (Array.isArray(value) && value.length === 0)
    );
  });

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missingFields.join(", ")}` },
      { status: 400 },
    );
  }

  const safeData = allowedFields[role].reduce<Record<string, unknown>>(
    (acc, field) => {
      if (body[field] !== undefined) {
        acc[field] = body[field];
      }
      return acc;
    },
    {},
  );

  if (
    role === "student" &&
    typeof body.firstName === "string" &&
    typeof body.lastName === "string"
  ) {
    safeData.avatarInitials = getAvatarInitials(body.firstName, body.lastName);
  }

  if (
    role === "teacher" &&
    typeof body.firstName === "string" &&
    typeof body.lastName === "string"
  ) {
    safeData.avatarInitials = getAvatarInitials(body.firstName, body.lastName);
  }

  if (role === "canteen" && typeof body.ownerName === "string") {
    const ownerParts = body.ownerName.trim().split(" ");
    safeData.avatarInitials = getAvatarInitials(
      ownerParts[0] || "",
      ownerParts[ownerParts.length - 1] || "",
    );
  }

  // 3. Security Hardening: Hash password before database insertion
  if (typeof safeData.password === "string") {
    safeData.password = await bcrypt.hash(safeData.password, 10);
  }

  try {
    const record = await Model.create(safeData);
    return NextResponse.json(
      { success: true, id: record._id },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to create account.";

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      const duplicateField = Object.keys((error as any).keyValue || {}).join(
        ", ",
      );
      return NextResponse.json(
        { error: `Duplicate field detected: ${duplicateField}` },
        { status: 409 },
      );
    }

    // 2. Prevent Silent Failures: Log detailed error to console (or Sentry in prod)
    console.error("[SIGNUP_API_ERROR]", {
      message: (error as any)?.message,
      stack: (error as any)?.stack,
      role: role,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: "Internal server error during registration. Our engineering team has been notified." },
      { status: 500 },
    );
  }
}
