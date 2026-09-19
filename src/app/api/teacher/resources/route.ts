import { NextResponse } from "next/server";
import { connectToDatabase } from "@/services/database";
import { ResourceModel } from "@/lib/models";
import mongoose from "mongoose";

const mockResources = [
  {
    title: "Data Structures Notes - Unit 1",
    subject: "CS301 — Data Structures",
    description: "Comprehensive notes covering arrays, linked lists, stacks, and queues with examples and diagrams.",
    content: "# Unit 1: Linear Data Structures\n\n## Arrays\n- Static vs Dynamic arrays\n- Time complexity of operations\n\n## Linked Lists\n- Singly, Doubly, Circular\n\n## Stacks & Queues\n- Implementation and applications",
    category: "notes",
    postedBy: "teacher", // Fallback ID
    postedByName: "Priya Verma",
    location: "digital", // Required by ResourceSchema common fields
    fileSize: "2.4 MB",
    downloads: 142,
    createdAt: new Date().toISOString(),
  },
  {
    title: "DBMS ER Diagram Slides",
    subject: "CS401 — Database Management Systems",
    description: "Slide deck covering ER model concepts, cardinality, participation constraints, and extended ER features.",
    content: "# ER Diagram Slides\n\n- Entity & Attribute types\n- Relationships & Cardinality\n- Weak entities\n- Extended ER: Specialization & Generalization\n- Mapping ER to Relational Schema",
    category: "slides", // Not explicitly in the original ResourceSchema category enum ("book", "equipment", "facility"), wait, I need to check the schema!
    // If the schema doesn't match the frontend's category, I will store it under a generic tag and map it on the fly.
    postedBy: "teacher",
    postedByName: "Priya Verma",
    location: "digital",
    fileSize: "5.1 MB",
    downloads: 98,
    createdAt: new Date().toISOString(),
  }
];

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    // --- AUTO-SEEDER FOR HACKATHON DEMO ---
    const count = await ResourceModel.countDocuments({ postedBy: teacherId || "teacher" });
    if (count === 0) {
      console.log(`[SEEDER] Seeding resources for teacher: ${teacherId || "teacher"}`);
      const seedData = mockResources.map(r => ({ ...r, postedBy: teacherId || "teacher" }));
      
      // Note: The ResourceModel in models.ts is primarily for Library/Equipment.
      // However, it has dynamic fields. To ensure schema validation passes:
      const safeSeedData = seedData.map(r => ({
        ...r,
        name: r.title, // map title to name
        category: "book", // map to valid enum
        tags: [r.category], // keep real category in tags
      }));

      await ResourceModel.insertMany(safeSeedData);
    }
    // --------------------------------------

    const resources = await ResourceModel.find({ postedBy: teacherId || "teacher" }).sort({ createdAt: -1 }).lean().exec();
    
    // Map backend schema to frontend expectations
    const mappedResources = resources.map((r: any) => ({
        _id: r._id,
        title: r.name || r.title,
        subject: r.subject || "General",
        description: r.description,
        content: r.content || "",
        category: (r.tags && r.tags.length > 0) ? r.tags[0] : "notes",
        postedBy: r.postedBy,
        postedByName: r.postedByName || "Teacher",
        fileSize: r.fileSize || "1.0 MB",
        downloads: r.downloads || 0,
        createdAt: r.createdAt
    }));

    return NextResponse.json({ resources: mappedResources });
  } catch (error: any) {
    console.error("[TEACHER_RESOURCES_GET_ERROR]", error);
    return NextResponse.json({ error: "Failed to load resources." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const payload = await req.json();

    const newResource = new ResourceModel({
      name: payload.title,
      description: payload.description || "No description provided.",
      category: "book", // Valid enum for ResourceSchema
      location: "digital",
      tags: [payload.category || "notes"],
      
      // Extend with dynamic frontend payload properties
      subject: payload.subject,
      content: payload.content,
      postedBy: payload.postedBy,
      postedByName: payload.postedByName,
      fileSize: `${Math.round(payload.content.length / 100) / 10} KB`,
      downloads: 0,
    });

    await newResource.save();

    const mappedResource = {
        _id: newResource._id,
        title: newResource.name,
        subject: (newResource as any).subject || "General",
        description: newResource.description,
        content: (newResource as any).content || "",
        category: newResource.tags[0],
        postedBy: (newResource as any).postedBy,
        postedByName: (newResource as any).postedByName,
        fileSize: (newResource as any).fileSize,
        downloads: (newResource as any).downloads,
        createdAt: newResource.createdAt
    }

    return NextResponse.json({ resource: mappedResource }, { status: 201 });
  } catch (error: any) {
    console.error("[TEACHER_RESOURCES_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to create resource." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Resource id is required" }, { status: 400 });
    }

    const deleted = await ResourceModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[TEACHER_RESOURCES_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete resource." }, { status: 500 });
  }
}
