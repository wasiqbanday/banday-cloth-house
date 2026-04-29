import { NextResponse } from "next/server";
import {
  getStoreKV,
  newStoreId,
  nowIso,
  readStoreList,
  writeStoreList,
} from "@/lib/cloudflare-store";

type StoredOrder = {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: unknown[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: "Pending" | "Paid" | "Shipped" | "Delivered";
  createdAt: string;
  updatedAt: string;
};

const ORDERS_KEY = "orders:list";

export async function GET() {
  try {
    const kv = await getStoreKV();

    if (kv) {
      const orders = await readStoreList<StoredOrder>(kv, ORDERS_KEY);

      return NextResponse.json({
        success: true,
        orders: orders.sort((a, b) =>
          String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
        ),
      });
    }

    const [{ connectDB }, { default: Order }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/Order"),
    ]);

    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerName,
      email,
      phone,
      address,
      items,
      subtotal,
      shipping,
      discount,
      total,
    } = body;

    if (
      !customerName ||
      !email ||
      !phone ||
      !address ||
      !Array.isArray(items) ||
      items.length === 0 ||
      total == null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required order fields.",
        },
        { status: 400 }
      );
    }

    const orderData = {
      customerName: String(customerName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      items,
      subtotal: Number(subtotal),
      shipping: Number(shipping ?? 0),
      discount: Number(discount ?? 0),
      total: Number(total),
      status: "Pending" as const,
    };

    const kv = await getStoreKV();

    if (kv) {
      const orders = await readStoreList<StoredOrder>(kv, ORDERS_KEY);
      const timestamp = nowIso();
      const order: StoredOrder = {
        _id: newStoreId(),
        ...orderData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await writeStoreList(kv, ORDERS_KEY, [order, ...orders]);

      return NextResponse.json(
        {
          success: true,
          order,
        },
        { status: 201 }
      );
    }

    const [{ connectDB }, { default: Order }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/Order"),
    ]);

    await connectDB();
    const order = await Order.create(orderData);

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to place order",
      },
      { status: 500 }
    );
  }
}
