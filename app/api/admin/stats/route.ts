import { NextResponse } from "next/server";
import { getStoreKV, readStoreList } from "@/lib/cloudflare-store";

type OrderSummary = {
  total?: number;
  status?: string;
};

const PRODUCTS_KEY = "products:list";
const ORDERS_KEY = "orders:list";
const CONTACT_KEY = "contact:list";

export async function GET() {
  try {
    const kv = await getStoreKV();

    if (kv) {
      const [products, orders, messages] = await Promise.all([
        readStoreList<unknown>(kv, PRODUCTS_KEY),
        readStoreList<OrderSummary>(kv, ORDERS_KEY),
        readStoreList<unknown>(kv, CONTACT_KEY),
      ]);

      const revenue = orders.reduce(
        (sum, order) => sum + Number(order.total || 0),
        0
      );

      const pendingOrders = orders.filter(
        (order) => order.status === "Pending"
      ).length;

      return NextResponse.json({
        success: true,
        stats: {
          productsCount: products.length,
          ordersCount: orders.length,
          messagesCount: messages.length,
          revenue,
          pendingOrders,
        },
      });
    }

    const [
      { connectDB },
      { default: Product },
      { default: Order },
      { default: ContactMessage },
    ] = await Promise.all([
      import("@/lib/db"),
      import("@/models/product"),
      import("@/models/Order"),
      import("@/models/ContactMessage"),
    ]);

    await connectDB();

    const [productsCount, orders, messagesCount] = await Promise.all([
      Product.countDocuments(),
      Order.find().lean(),
      ContactMessage.countDocuments(),
    ]);

    const orderSummaries = orders as OrderSummary[];

    const revenue = orderSummaries.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    const pendingOrders = orderSummaries.filter(
      (order) => order.status === "Pending"
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        productsCount,
        ordersCount: orders.length,
        messagesCount,
        revenue,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard stats",
      },
      { status: 500 }
    );
  }
}
