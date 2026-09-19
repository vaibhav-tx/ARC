import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { OrderModel } from "@/lib/models";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const canteenId = searchParams.get("canteenId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    const query: any = {};
    if (canteenId) query.canteenId = canteenId;
    if (customerId) query.customerId = customerId;
    if (status && status !== "all") query.status = status;

    if (!canteenId && !customerId) {
      return NextResponse.json({ error: "canteenId or customerId is required" }, { status: 400 });
    }

    const count = await OrderModel.countDocuments(query);
    if (count === 0 && canteenId) {
      // Auto-seeder for demo purposes if it's the canteen dashboard
      const { demoOrders } = await import("@/lib/sample-order-data").catch(() => ({ demoOrders: [] }));
      if (demoOrders && demoOrders.length > 0) {
        const seededData = demoOrders.map((item: any) => {
          const { _id, ...rest } = item;
          return { ...rest, canteenId };
        });
        await OrderModel.insertMany(seededData);
      }
    }

    const orders = await OrderModel.find(query)
      .sort({ orderDate: -1 })
      .limit(limit);

    return NextResponse.json({ data: orders });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Generate a unique order ID
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;
    body.orderId = orderId;
    body.orderDate = new Date();

    const newOrder = await OrderModel.create(body);
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { orderId, status, note } = body; // Note: using orderId as the DB _id from client

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updateData: any = { status };
    if (status === "completed" || status === "cancelled") {
      updateData.completedAt = new Date();
    }
    if (note) {
      updateData.specialInstructions = note; // Just appending for demo
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, updateData, { new: true });
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
