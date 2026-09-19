import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { EventModel } from "@/lib/models";

// Fallback Mock Data for Auto-Seeder
const mockEvents = [
  {
    title: "Campus Tech Expo",
    description: "A showcase of student projects, startups, and campus innovation.",
    eventType: "academic", // Changed to match enum
    startDate: new Date(Date.now() + 2 * 86400000),
    endDate: new Date(Date.now() + 2 * 86400000),
    startTime: "10:00",
    endTime: "18:00",
    venue: "Main Auditorium",
    organizer: "Student Council",
    contactEmail: "tech.expo@campus.edu",
    contactPhone: "9876543210",
    maxParticipants: 250,
    registrationDeadline: new Date(Date.now() + 1 * 86400000),
    fee: 0,
    status: "published", // changed to match enum
    imageUrl: "/images/events/tech-expo.jpg",
    tags: ["technology", "innovation"],
    requirements: ["Bring student ID", "Register in advance"],
    isPublic: true,
  },
  {
    title: "Entrepreneurship Bootcamp",
    description: "A weekend workshop series for aspiring student entrepreneurs.",
    eventType: "workshop",
    startDate: new Date(Date.now() + 7 * 86400000),
    endDate: new Date(Date.now() + 9 * 86400000),
    startTime: "09:00",
    endTime: "17:00",
    venue: "Innovation Lab",
    organizer: "Placement Cell",
    contactEmail: "bootcamp@campus.edu",
    contactPhone: "9123456780",
    maxParticipants: 100,
    registrationDeadline: new Date(Date.now() + 5 * 86400000),
    fee: 500,
    status: "published",
    imageUrl: "/images/events/bootcamp.jpg",
    tags: ["entrepreneurship", "startup"],
    requirements: ["Laptop", "Motivation"],
    isPublic: false,
  },
];

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    // --- AUTO-SEEDER FOR HACKATHON DEMO ---
    const count = await EventModel.countDocuments();
    if (count === 0) {
      console.log("[SEEDER] Seeding admin events collection...");
      await EventModel.insertMany(mockEvents);
    }
    // --------------------------------------

    const events = await EventModel.find().sort({ createdAt: -1 }).lean().exec();

    // Map `bookingStats` since the frontend expects them even if schema doesn't have them
    const processedEvents = events.map((event: any) => ({
      ...event,
      bookingStats: {
        totalBookings: Math.floor(Math.random() * 100),
        paidBookings: Math.floor(Math.random() * 80),
        pendingBookings: Math.floor(Math.random() * 20),
        totalRevenue: Math.floor(Math.random() * 10000),
        pendingRevenue: Math.floor(Math.random() * 1000),
      }
    }));

    return NextResponse.json({ events: processedEvents });
  } catch (error: any) {
    console.error("[EVENTS_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to load events. Please try again later." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const payload = await req.json();

    const newEvent = new EventModel({
      ...payload,
      eventType: payload.eventType || "academic",
      status: payload.status || "draft"
    });

    await newEvent.save();

    return NextResponse.json({ event: newEvent });
  } catch (error: any) {
    console.error("[EVENTS_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to create event." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const payload = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 });
    }

    const updatedEvent = await EventModel.findByIdAndUpdate(id, payload, { new: true });
    
    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event: updatedEvent });
  } catch (error: any) {
    console.error("[EVENTS_PUT_ERROR]", error);
    return NextResponse.json({ error: "Failed to update event." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Event id is required" }, { status: 400 });
    }

    const deleted = await EventModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[EVENTS_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete event." }, { status: 500 });
  }
}
