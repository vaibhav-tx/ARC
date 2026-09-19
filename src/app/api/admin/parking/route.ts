import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { ParkingModel } from "@/lib/models";
import { sampleParkingData } from "@/lib/sample-parking-data";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Auto-seeding logic
    const count = await ParkingModel.countDocuments();
    if (count === 0) {
      console.log("Seeding parking data...");
      await ParkingModel.insertMany(sampleParkingData);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query = {};
    if (status && status !== "all") {
      query = { status };
    }

    const requests = await ParkingModel.find(query).sort({ createdAt: -1 });

    // For demo purposes, we will hardcode the capacities.
    const slots = [
      { zone: "Student Block A", total: 120, occupied: 89 },
      { zone: "Student Block B", total: 100, occupied: 64 },
      { zone: "Faculty Parking", total: 60, occupied: 43 },
    ];

    // If a request is approved, we increment the occupied slots of the respective zone
    requests.forEach(req => {
      if (req.status === 'approved') {
        const slot = slots.find(s => s.zone === req.zone);
        if (slot) {
           // We just mock it out since it's demo.
           // slot.occupied += 1;
        }
      }
    });

    return NextResponse.json({ success: true, requests, slots });
  } catch (error: any) {
    console.error("Error fetching parking data:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch parking data" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const { id, status } = data;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const requestItem = await ParkingModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!requestItem) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, requestItem });
  } catch (error: any) {
    console.error("Error updating parking status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update parking request" },
      { status: 500 }
    );
  }
}
