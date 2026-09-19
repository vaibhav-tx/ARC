import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StockItemModel } from "@/lib/models";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const canteenId = searchParams.get("canteenId");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    if (!canteenId) {
      return NextResponse.json({ error: "canteenId is required" }, { status: 400 });
    }

    const query: any = { canteenId };
    if (category && category !== "all") query.category = category;
    if (status && status !== "all") query.status = status;

    const count = await StockItemModel.countDocuments(query);
    if (count === 0 && (!category || category === "all") && (!status || status === "all")) {
      // Auto-seeder
      const { sampleStockItems } = await import("@/lib/sample-stock-data");
      const seededData = sampleStockItems.map((item: any) => {
        const { _id, ...rest } = item;
        return { ...rest, canteenId };
      });
      await StockItemModel.insertMany(seededData);
    }

    const items = await StockItemModel.find(query).sort({ status: 1, name: 1 });
    return NextResponse.json({ data: items });
  } catch (error: any) {
    console.error("Error fetching stock items:", error);
    return NextResponse.json({ error: "Failed to fetch stock items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { canteenId, name, currentStock, minimumStock, costPerUnit } = body;

    if (!canteenId || !name || currentStock === undefined || minimumStock === undefined || costPerUnit === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newItem = await StockItemModel.create(body);
    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding stock item:", error);
    return NextResponse.json({ error: "Failed to add stock item" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { _id, action, quantity, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Missing _id" }, { status: 400 });
    }

    let updatedItem;
    if (action === "restock" && quantity) {
      const item = await StockItemModel.findById(_id);
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      
      const newStock = item.currentStock + Number(quantity);
      let newStatus = item.status;
      if (newStock <= 0) newStatus = "out_of_stock";
      else if (newStock <= item.minimumStock) newStatus = "critical";
      else if (newStock <= item.minimumStock * 1.5) newStatus = "low";
      else newStatus = "good";

      updatedItem = await StockItemModel.findByIdAndUpdate(
        _id, 
        { 
          ...updateData, 
          currentStock: newStock,
          status: newStatus,
          lastRestocked: new Date()
        }, 
        { new: true }
      );
    } else {
      // Normal update (e.g. edit item details)
      let newStatus = updateData.status;
      if (updateData.currentStock !== undefined && updateData.minimumStock !== undefined) {
        if (updateData.currentStock <= 0) newStatus = "out_of_stock";
        else if (updateData.currentStock <= updateData.minimumStock) newStatus = "critical";
        else if (updateData.currentStock <= updateData.minimumStock * 1.5) newStatus = "low";
        else newStatus = "good";
        updateData.status = newStatus;
      }
      updatedItem = await StockItemModel.findByIdAndUpdate(_id, updateData, { new: true });
    }

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error: any) {
    console.error("Error updating stock item:", error);
    return NextResponse.json({ error: "Failed to update stock item" }, { status: 500 });
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

    await StockItemModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting stock item:", error);
    return NextResponse.json({ error: "Failed to delete stock item" }, { status: 500 });
  }
}
