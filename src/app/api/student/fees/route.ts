import { NextResponse } from "next/server"
import { connectToDatabase } from "@/services/database"
import { StudentFeesModel, StudentModel } from "@/lib/models"
import mongoose from "mongoose"

// Fallback Mock Data for Auto-Seeder
const mockStudentFees = [
  {
    semester: 6,
    academicYear: "2025-26",
    totalFees: 150000,
    paidAmount: 150000,
    dueAmount: 0,
    paymentStatus: "paid",
    dueDateLimit: new Date("2025-12-31"),
    paymentRecords: [
      {
        amount: 70000,
        paymentDate: new Date("2025-01-15"),
        paymentMethod: "online",
        transactionId: "TXN20250115001",
        reference: "Semester 6 Fees",
      },
      {
        amount: 80000,
        paymentDate: new Date("2025-02-01"),
        paymentMethod: "online",
        transactionId: "TXN20250201001",
        reference: "Semester 6 Fees",
      },
    ],
  },
  {
    semester: 7,
    academicYear: "2025-26",
    totalFees: 150000,
    paidAmount: 100000,
    dueAmount: 50000,
    paymentStatus: "partial",
    dueDateLimit: new Date("2025-07-31"),
    paymentRecords: [
      {
        amount: 100000,
        paymentDate: new Date("2025-06-10"),
        paymentMethod: "online",
        transactionId: "TXN20250610001",
        reference: "Semester 7 Fees",
      },
    ],
  },
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId")

  if (!studentId) {
    return NextResponse.json({ error: "studentId query parameter is required" }, { status: 400 })
  }

  try {
    await connectToDatabase()

    // --- AUTO-SEEDER FOR HACKATHON DEMO ---
    // If a valid studentId is provided but they have no fee records, auto-seed them
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      const count = await StudentFeesModel.countDocuments({ studentId })
      if (count === 0) {
        console.log(`[SEEDER] Auto-seeding fees for student: ${studentId}`)
        const seedData = mockStudentFees.map(fee => ({
          ...fee,
          studentId: new mongoose.Types.ObjectId(studentId)
        }))
        await StudentFeesModel.insertMany(seedData)
      }
    }
    // --------------------------------------

    const query = mongoose.Types.ObjectId.isValid(studentId) 
      ? { studentId } 
      : { _id: null } // Force empty result if invalid ObjectId passed from old frontend code

    const fees = await StudentFeesModel.find(query).sort({ semester: -1 }).lean().exec()

    return NextResponse.json({ fees, total: fees.length })
  } catch (error: any) {
    console.error("[FEES_GET_ERROR]", error)
    return NextResponse.json({ error: "Failed to fetch fees. Please try again later." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase()
    const { feesId, amount, paymentMethod, transactionId } = await req.json()
    
    if (!feesId || !amount) {
       return NextResponse.json({ error: "feesId and amount are required." }, { status: 400 })
    }

    const feeRecord = await StudentFeesModel.findById(feesId)
    if (!feeRecord) {
      return NextResponse.json({ error: "Fees record not found" }, { status: 404 })
    }

    if (amount > feeRecord.dueAmount) {
      return NextResponse.json({ error: "Payment amount exceeds due amount" }, { status: 400 })
    }

    feeRecord.paymentRecords.push({
      amount,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || "online",
      transactionId: transactionId || `TXN-${Date.now()}`,
      reference: `Payment for Sem ${feeRecord.semester}`,
    })
    
    feeRecord.paidAmount += amount
    feeRecord.dueAmount -= amount
    feeRecord.paymentStatus = feeRecord.dueAmount === 0 ? "paid" : "partial"

    await feeRecord.save()

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      fees: feeRecord,
    })
  } catch (error: any) {
    console.error("[FEES_POST_ERROR]", error)
    return NextResponse.json({ error: "Failed to process payment. Our team has been notified." }, { status: 500 })
  }
}
