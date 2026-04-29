import { NextResponse } from "next/server";
import {
  getStoreKV,
  newStoreId,
  nowIso,
  readStoreList,
  writeStoreList,
} from "@/lib/cloudflare-store";

type ProductBody = Record<string, unknown>;
type StoredProduct = ReturnType<typeof normalizeProduct> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const PRODUCTS_KEY = "products:list";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProduct(body: ProductBody) {
  const name = textValue(body.name);
  const category = textValue(body.category);
  const description = textValue(body.description);
  const image = textValue(body.image);
  const images = Array.isArray(body.images)
    ? body.images.map((item: unknown) => String(item).trim()).filter(Boolean)
    : image
      ? [image]
      : [];

  return {
    name,
    price: Number(body.price),
    category,
    stock: Number(body.stock ?? 0),
    status: body.status || "Active",
    image,
    images,
    description,
    featured: Boolean(body.featured),
  };
}

function validateProduct(product: ReturnType<typeof normalizeProduct>) {
  if (!product.name || !product.category) {
    return "Name and category are required.";
  }

  if (!Number.isFinite(product.price) || product.price < 0) {
    return "Price must be a valid number.";
  }

  if (!Number.isFinite(product.stock) || product.stock < 0) {
    return "Stock must be a valid number.";
  }

  return "";
}

export async function GET() {
  try {
    const kv = await getStoreKV();

    if (kv) {
      const products = await readStoreList<StoredProduct>(kv, PRODUCTS_KEY);

      return NextResponse.json({
        success: true,
        products: products.sort((a, b) =>
          String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
        ),
      });
    }

    const [{ connectDB }, { default: Product }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/product"),
    ]);

    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProductBody;
    const productData = normalizeProduct(body);
    const validationMessage = validateProduct(productData);

    if (validationMessage) {
      return NextResponse.json(
        {
          success: false,
          message: validationMessage,
        },
        { status: 400 }
      );
    }

    const kv = await getStoreKV();

    if (kv) {
      const products = await readStoreList<StoredProduct>(kv, PRODUCTS_KEY);
      const timestamp = nowIso();
      const product: StoredProduct = {
        _id: newStoreId(),
        ...productData,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      await writeStoreList(kv, PRODUCTS_KEY, [product, ...products]);

      return NextResponse.json(
        {
          success: true,
          product,
        },
        { status: 201 }
      );
    }

    const [{ connectDB }, { default: Product }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/product"),
    ]);

    await connectDB();
    const product = await Product.create(productData);

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
