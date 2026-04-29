import { NextResponse } from "next/server";
import { getStoreKV, nowIso, readStoreList, writeStoreList } from "@/lib/cloudflare-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type StoredOrder = {
  _id: string;
  status: "Pending" | "Paid" | "Shipped" | "Delivered";
  updatedAt?: string;
};

const allowedStatuses = ["Pending", "Paid", "Shipped", "Delivered"];
const ORDERS_KEY = "orders:list";

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order status",
        },
        { status: 400 }
      );
    }

    const kv = await getStoreKV();

    if (kv) {
      const orders = await readStoreList<StoredOrder>(kv, ORDERS_KEY);
      const orderIndex = orders.findIndex((order) => order._id === id);

      if (orderIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            message: "Order not found",
          },
          { status: 404 }
        );
      }

      const order = {
        ...orders[orderIndex],
        status: body.status,
        updatedAt: nowIso(),
      };

      orders[orderIndex] = order;
      await writeStoreList(kv, ORDERS_KEY, orders);

      return NextResponse.json({
        success: true,
        order,
      });
    }

    const [{ connectDB }, { default: Order }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/Order"),
    ]);

    await connectDB();
    const order = await Order.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    ).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update order",
      },
      { status: 500 }
    );
  }
}
