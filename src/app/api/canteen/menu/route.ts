import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuItemModel } from "@/lib/models";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const canteenId = searchParams.get("canteenId");
    const category = searchParams.get("category");

    if (!canteenId) {
      return NextResponse.json({ error: "canteenId is required" }, { status: 400 });
    }

    const query: any = { canteenId };
    if (category && category !== "all") query.category = category;

    const count = await MenuItemModel.countDocuments(query);
    if (count === 0) {
      // Auto-seeder
      const { demoMenuItems } = await import("@/lib/sample-menu-data");
      const seededData = demoMenuItems.map((item) => {
        const { _id, ...rest } = item;
        return { ...rest, canteenId };
      });
      await MenuItemModel.insertMany(seededData);
    }

    const items = await MenuItemModel.find(query).sort({ category: 1, name: 1 });
    return NextResponse.json({ data: items });
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { canteenId, name, price, category } = body;

    if (!canteenId || !name || !price || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newItem = await MenuItemModel.create(body);
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding menu item:", error);
    return NextResponse.json({ error: "Failed to add menu item" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Missing _id" }, { status: 400 });
    }

    const updatedItem = await MenuItemModel.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await MenuItemModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
