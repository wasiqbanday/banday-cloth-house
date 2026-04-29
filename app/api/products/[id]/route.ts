import { NextResponse } from "next/server";
import {
  getStoreKV,
  nowIso,
  readStoreList,
  writeStoreList,
} from "@/lib/cloudflare-store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type ProductBody = Record<string, unknown>;
type StoredProduct = ReturnType<typeof normalizeProduct> & {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
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

export async function PUT(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
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
      const productIndex = products.findIndex((product) => product._id === id);

      if (productIndex === -1) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found",
          },
          { status: 404 }
        );
      }

      const product: StoredProduct = {
        ...products[productIndex],
        ...productData,
        _id: id,
        updatedAt: nowIso(),
      };

      products[productIndex] = product;
      await writeStoreList(kv, PRODUCTS_KEY, products);

      return NextResponse.json({
        success: true,
        product,
      });
    }

    const [{ connectDB }, { default: Product }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/product"),
    ]);

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const kv = await getStoreKV();

    if (kv) {
      const products = await readStoreList<StoredProduct>(kv, PRODUCTS_KEY);
      const product = products.find((item) => item._id === id);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found",
          },
          { status: 404 }
        );
      }

      await writeStoreList(
        kv,
        PRODUCTS_KEY,
        products.filter((item) => item._id !== id)
      );

      return NextResponse.json({
        success: true,
        product,
      });
    }

    const [{ connectDB }, { default: Product }] = await Promise.all([
      import("@/lib/db"),
      import("@/models/product"),
    ]);

    await connectDB();
    const product = await Product.findByIdAndDelete(id).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete product";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
