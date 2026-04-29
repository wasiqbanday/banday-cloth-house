"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductStatus = "Active" | "Draft" | "Out of Stock";
type OrderStatus = "Pending" | "Paid" | "Shipped" | "Delivered";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  status: ProductStatus;
  image?: string;
  images?: string[];
  description?: string;
};

type ContactMessage = {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  createdAt?: string;
};

type CustomDesign = {
  fabric?: string;
  color?: string;
  pattern?: string;
  sleeve?: string;
  neckline?: string;
  length?: string;
  notes?: string;
  measurements?: Record<string, string>;
};

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  customDesign?: CustomDesign;
};

type Order = {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

type Stats = {
  productsCount: number;
  ordersCount: number;
  messagesCount: number;
  revenue: number;
  pendingOrders: number;
};

type CartItem = {
  id?: string;
  _id?: string;
  name?: string;
  price?: number | string;
  customDesign?: CustomDesign;
};

const emptyForm = {
  name: "",
  price: "",
  category: "",
  stock: "",
  status: "Active" as ProductStatus,
  image: "",
  description: "",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(value?: string) {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDesignDetails(design?: CustomDesign) {
  if (!design) return "";

  return [
    design.fabric,
    design.pattern,
    design.sleeve,
    design.neckline,
    design.length,
  ]
    .filter(Boolean)
    .join(" / ");
}

function formatMeasurements(measurements?: Record<string, string>) {
  if (!measurements) return "";

  return Object.entries(measurements)
    .filter(([, value]) => value.trim())
    .map(([key, value]) => `${key}: ${value}cm`)
    .join(" / ");
}

async function readJsonResponse(res: Response) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned ${res.status} ${res.statusText || "response"} instead of JSON.`
    );
  }
}

function statusClass(status: OrderStatus) {
  switch (status) {
    case "Paid":
      return "bg-black text-white";
    case "Pending":
      return "bg-[#f4efe9] text-black";
    case "Shipped":
      return "bg-zinc-200 text-black";
    case "Delivered":
      return "bg-green-100 text-green-900";
    default:
      return "bg-zinc-100 text-black";
  }
}

function productStatusClass(status?: ProductStatus) {
  switch (status) {
    case "Active":
      return "bg-black text-white";
    case "Draft":
      return "bg-zinc-200 text-black";
    case "Out of Stock":
      return "bg-red-100 text-red-900";
    default:
      return "bg-zinc-100 text-black";
  }
}

function ProductThumb({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[#f5f1ed] text-xs text-black/35 ${className}`}
      >
        No image
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#f5f1ed] ${className}`}>
      <Image src={src} alt={alt} fill sizes="120px" className="object-cover" />
    </div>
  );
}

function CustomDesignBlock({ design }: { design?: CustomDesign }) {
  if (!design) return null;

  const measurements = formatMeasurements(design.measurements);

  return (
    <div className="mt-3 rounded-xl border border-black/5 bg-white p-3 text-xs leading-5 text-black/58">
      <p className="font-semibold text-black">Custom Atelier</p>
      <p>{formatDesignDetails(design)}</p>
      {measurements && <p>{measurements}</p>}
      {design.color && (
        <div className="mt-2 flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-black/10"
            style={{ backgroundColor: design.color }}
          />
          <span>{design.color}</span>
        </div>
      )}
      {design.notes && <p className="mt-2 line-clamp-3">{design.notes}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "messages"
  >("overview");

  const [productForm, setProductForm] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const fetchDashboardData = async () => {
    try {
      setDashboardLoading(true);

      const [productRes, orderRes, messageRes, statsRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/contact", { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" }),
      ]);

      const [productData, orderData, messageData, statsData] =
        await Promise.all([
          readJsonResponse(productRes),
          readJsonResponse(orderRes),
          readJsonResponse(messageRes),
          readJsonResponse(statsRes),
        ]);

      if (productData.success) setProducts(productData.products || []);
      if (orderData.success) setOrders(orderData.orders || []);
      if (messageData.success) setMessages(messageData.messages || []);
      if (statsData.success) setStats(statsData.stats);

      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(Array.isArray(storedCart) ? storedCart : []);
      setStatusMessage("");
    } catch (error) {
      console.error("Admin fetch error:", error);
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to load dashboard data."
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const paidRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.status === "Paid" || order.status === "Delivered")
        .reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.stock > 0 && product.stock <= 5),
    [products]
  );

  const customOrders = useMemo(
    () =>
      orders.filter((order) =>
        order.items.some((item) => Boolean(item.customDesign))
      ),
    [orders]
  );

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const term = search.toLowerCase();

    return products.filter((product) =>
      [product.name, product.category, product.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [products, search]);

  const totalInventory = useMemo(
    () => products.reduce((sum, product) => sum + Number(product.stock || 0), 0),
    [products]
  );

  const resetForm = () => {
    setProductForm(emptyForm);
    setEditingProductId(null);
    setSelectedImageFile(null);
    setImagePreview("");
  };

  const openAddProductModal = () => {
    resetForm();
    setActiveTab("products");
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    resetForm();
  };

  const handleFormChange = (field: keyof typeof productForm, value: string) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (file: File | null) => {
    setSelectedImageFile(file);

    if (!file) {
      setImagePreview(productForm.image || "");
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  };

  const uploadToCloudinary = async () => {
    if (!selectedImageFile) return productForm.image.trim();

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedImageFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await readJsonResponse(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Image upload failed.");
      }

      return data.url as string;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async () => {
    if (
      !productForm.name.trim() ||
      !productForm.price.trim() ||
      !productForm.category.trim() ||
      !productForm.stock.trim()
    ) {
      alert("Please fill all required product fields.");
      return;
    }

    try {
      setLoading(true);

      const uploadedImageUrl = await uploadToCloudinary();
      const finalImage = uploadedImageUrl || productForm.image.trim();

      const payload = {
        name: productForm.name.trim(),
        price: Number(productForm.price),
        category: productForm.category.trim(),
        stock: Number(productForm.stock),
        status: productForm.status,
        image: finalImage,
        images: finalImage ? [finalImage] : [],
        description: productForm.description.trim(),
        featured: false,
      };

      const res = await fetch(
        editingProductId ? `/api/products/${editingProductId}` : "/api/products",
        {
          method: editingProductId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            (editingProductId
              ? "Failed to update product."
              : "Failed to add product.")
        );
      }

      await fetchDashboardData();
      closeProductModal();
      setStatusMessage(
        editingProductId ? "Product updated." : "Product created."
      );
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving product."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      status: product.status,
      image: product.image || "",
      description: product.description || "",
    });
    setImagePreview(product.image || "");
    setSelectedImageFile(null);
    setActiveTab("products");
    setIsProductModalOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await readJsonResponse(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete product.");
      }

      await fetchDashboardData();
      setStatusMessage("Product deleted.");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting product."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await readJsonResponse(res);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update order.");
      }

      await fetchDashboardData();
      setStatusMessage("Order status updated.");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating order."
      );
    }
  };

  const statCards = [
    ["Total Products", stats?.productsCount ?? products.length, "Active catalog"],
    ["Total Orders", stats?.ordersCount ?? orders.length, "Customer entries"],
    ["Gross Revenue", formatPrice(stats?.revenue ?? 0), "Tracked order value"],
    ["Custom Requests", customOrders.length, "Atelier designs"],
  ];

  return (
    <main className="min-h-screen bg-[#f8f5f2] text-[#1f1f1f]">
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
                Admin Dashboard
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold md:text-6xl">
                Banday Control Panel
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-black/55 md:text-base">
                Manage products, orders, custom atelier requests, customer
                messages, and store performance from one dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full border border-black/10 px-5 py-3 text-sm"
              >
                View Store
              </Link>
              <Link
                href="/customize"
                className="rounded-full border border-black/10 px-5 py-3 text-sm"
              >
                Customize Page
              </Link>
              <button
                onClick={openAddProductModal}
                className="rounded-full bg-black px-5 py-3 text-sm text-white"
              >
                Add Product
              </button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              ["overview", "Overview"],
              ["products", "Products"],
              ["orders", "Orders"],
              ["messages", "Messages"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(
                    key as "overview" | "products" | "orders" | "messages"
                  )
                }
                className={`rounded-full px-5 py-3 text-sm transition ${
                  activeTab === key
                    ? "bg-black text-white"
                    : "border border-black/10 bg-white text-black/70 hover:border-black/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        {statusMessage && (
          <p className="mb-5 rounded-xl border border-black/5 bg-white px-5 py-4 text-sm text-black/60">
            {statusMessage}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map(([label, value, detail]) => (
            <div
              key={label}
              className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)]"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                {label}
              </p>
              <h2 className="mt-3 text-4xl font-semibold">{value}</h2>
              <p className="mt-3 text-sm text-black/50">{detail}</p>
            </div>
          ))}
        </div>

        {dashboardLoading && (
          <p className="mt-6 rounded-xl bg-white p-5 text-sm text-black/50">
            Loading dashboard data...
          </p>
        )}

        {activeTab === "overview" && (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                  Performance Overview
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Store Insights</h3>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-[#fcf9f8] p-5">
                    <p className="text-sm text-black/45">Paid Revenue</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {formatPrice(paidRevenue)}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#fcf9f8] p-5">
                    <p className="text-sm text-black/45">Inventory Units</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {totalInventory}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#fcf9f8] p-5">
                    <p className="text-sm text-black/45">Low Stock Alerts</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {lowStockProducts.length}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#fcf9f8] p-5">
                    <p className="text-sm text-black/45">Pending Orders</p>
                    <p className="mt-2 text-3xl font-semibold">
                      {stats?.pendingOrders ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                  Recent Orders
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Latest Activity</h3>

                <div className="mt-6 space-y-4">
                  {orders.slice(0, 4).map((order) => (
                    <div
                      key={order._id}
                      className="rounded-[1.5rem] border border-black/5 bg-[#fcf9f8] p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium">{order._id}</p>
                          <p className="mt-1 text-sm text-black/50">
                            {order.customerName} - {formatDate(order.createdAt)}
                          </p>
                          {order.items.some((item) => item.customDesign) && (
                            <p className="mt-2 w-fit rounded-full bg-black px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white">
                              Custom Atelier
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${statusClass(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                          <span className="text-sm font-medium">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {orders.length === 0 && (
                    <p className="text-sm text-black/50">No orders yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                  Custom Atelier
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Design Requests</h3>

                <div className="mt-6 space-y-4">
                  {customOrders.slice(0, 3).map((order) => (
                    <div
                      key={order._id}
                      className="rounded-[1.5rem] bg-[#fcf9f8] p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium">
                            {order.customerName}
                          </p>
                          <p className="mt-1 text-xs text-black/45">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span className="rounded-full bg-black px-3 py-1 text-xs text-white">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      {order.items
                        .filter((item) => item.customDesign)
                        .slice(0, 2)
                        .map((item, index) => (
                          <CustomDesignBlock
                            key={`${item.productId}-${index}`}
                            design={item.customDesign}
                          />
                        ))}
                    </div>
                  ))}

                  {customOrders.length === 0 && (
                    <p className="text-sm text-black/50">
                      No custom dress requests yet.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                  Quick Actions
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Manage Store</h3>

                <div className="mt-6 grid gap-3">
                  <Link
                    href="/shop"
                    className="rounded-full border border-black/10 px-5 py-3 text-sm transition hover:border-black/20"
                  >
                    Open Shop Page
                  </Link>
                  <Link
                    href="/customize"
                    className="rounded-full border border-black/10 px-5 py-3 text-sm transition hover:border-black/20"
                  >
                    Open Customize Page
                  </Link>
                  <Link
                    href="/checkout"
                    className="rounded-full bg-black px-5 py-3 text-sm text-white"
                  >
                    Open Checkout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="mt-8 rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                  Inventory
                </p>
                <h3 className="mt-2 text-2xl font-semibold">Products</h3>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products"
                  className="rounded-full border border-black/10 px-4 py-3 text-sm outline-none"
                />
                <button
                  onClick={openAddProductModal}
                  className="rounded-full bg-black px-5 py-3 text-sm text-white"
                >
                  Add Product
                </button>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-black/5 text-sm text-black/45">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Image</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product._id}
                      className={
                        index !== filteredProducts.length - 1
                          ? "border-b border-black/5"
                          : ""
                      }
                    >
                      <td className="py-4 font-medium">{product.name}</td>
                      <td className="py-4 capitalize text-black/60">
                        {product.category}
                      </td>
                      <td className="py-4">{formatPrice(product.price)}</td>
                      <td className="py-4">{product.stock}</td>
                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${productStatusClass(
                            product.status
                          )}`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <ProductThumb
                          src={product.image}
                          alt={product.name}
                          className="h-14 w-14 rounded-xl border border-black/10"
                        />
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="rounded-full border border-black/10 px-3 py-2 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            disabled={loading}
                            className="rounded-full border border-red-200 px-3 py-2 text-xs text-red-700 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="mt-8 rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
              Orders
            </p>
            <h3 className="mt-2 text-2xl font-semibold">Order Management</h3>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b border-black/5 text-sm text-black/45">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Items</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order._id}
                      className={
                        index !== orders.length - 1
                          ? "border-b border-black/5"
                          : ""
                      }
                    >
                      <td className="py-4 align-top font-medium">{order._id}</td>
                      <td className="py-4 align-top">
                        <p>{order.customerName}</p>
                        <p className="mt-1 text-xs text-black/45">{order.phone}</p>
                        <p className="mt-1 text-xs text-black/45">{order.email}</p>
                      </td>
                      <td className="py-4 align-top">
                        <div className="max-w-[340px] space-y-2">
                          <p className="text-sm font-medium">
                            {order.items.length} item
                            {order.items.length === 1 ? "" : "s"}
                          </p>
                          {order.items.slice(0, 3).map((item, itemIndex) => (
                            <div
                              key={`${item.productId}-${itemIndex}`}
                              className="rounded-xl bg-[#fcf9f8] p-3 text-xs leading-5 text-black/58"
                            >
                              <p className="font-medium text-black">
                                {item.name} x {item.quantity}
                              </p>
                              {item.size && <p>Size: {item.size}</p>}
                              <CustomDesignBlock design={item.customDesign} />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 align-top text-black/60">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 align-top">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-4 align-top">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${statusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 align-top">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(
                              order._id,
                              e.target.value as OrderStatus
                            )
                          }
                          className="rounded-full border border-black/10 px-3 py-2 text-xs outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                Inquiries
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Customer Messages</h3>

              {messages.length === 0 ? (
                <p className="mt-5 text-sm text-black/50">
                  No contact messages stored yet.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={msg._id || index}
                      className="rounded-[1.5rem] border border-black/5 bg-[#fcf9f8] p-5"
                    >
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {msg.name || "Unnamed visitor"}
                          </p>
                          <p className="mt-1 text-sm text-black/50">
                            {msg.email || "No email"}
                            {msg.phone ? ` - ${msg.phone}` : ""}
                          </p>
                        </div>
                        <p className="text-xs text-black/40">
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>

                      <p className="mt-4 text-sm leading-7 text-black/60">
                        {msg.message || "No message content"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)] md:p-7">
              <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                Cart Storage
              </p>
              <h3 className="mt-2 text-2xl font-semibold">Saved Cart Items</h3>

              {cartItems.length === 0 ? (
                <p className="mt-5 text-sm text-black/50">
                  No items currently saved in cart.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id || item._id || item.name}-${index}`}
                      className="rounded-[1.25rem] bg-[#fcf9f8] p-4"
                    >
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-sm text-black/50">
                        {formatPrice(Number(item.price || 0))}
                      </p>
                      <CustomDesignBlock design={item.customDesign} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-black/5 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/90 px-6 py-5 backdrop-blur md:px-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                  {editingProductId ? "Edit Product" : "Add Product"}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {editingProductId
                    ? "Update Product Details"
                    : "Create Product Listing"}
                </h3>
              </div>

              <button
                onClick={closeProductModal}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-xl text-black/60 transition hover:text-black"
                aria-label="Close"
              >
                x
              </button>
            </div>

            <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.1fr] md:p-8">
              <div className="space-y-5">
                <div className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#fcf9f8]">
                  <div className="relative h-[360px]">
                    {imagePreview ? (
                      imagePreview.startsWith("blob:") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={imagePreview}
                          alt="Product preview"
                          fill
                          sizes="380px"
                          className="object-cover"
                        />
                      )
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                        Image preview will appear here
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-black/5 bg-[#fcf9f8] p-4">
                  <p className="text-sm font-medium">Product Image</p>

                  <div className="mt-4 space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageSelect(e.target.files?.[0] || null)
                      }
                      className="block w-full text-sm text-black/60 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:text-white"
                    />

                    <input
                      value={productForm.image}
                      onChange={(e) => {
                        handleFormChange("image", e.target.value);
                        if (!selectedImageFile) setImagePreview(e.target.value);
                      }}
                      placeholder="Or paste image URL"
                      className="w-full rounded-full border border-black/10 px-4 py-3 text-sm outline-none"
                    />

                    <p className="text-xs leading-6 text-black/45">
                      Upload from your computer or paste an existing image URL.
                      Uploaded files are stored through Cloudinary.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  value={productForm.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Product name"
                  className="w-full rounded-full border border-black/10 px-5 py-3 text-sm outline-none"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={productForm.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                    placeholder="Price"
                    type="number"
                    className="w-full rounded-full border border-black/10 px-5 py-3 text-sm outline-none"
                  />
                  <input
                    value={productForm.stock}
                    onChange={(e) => handleFormChange("stock", e.target.value)}
                    placeholder="Stock quantity"
                    type="number"
                    className="w-full rounded-full border border-black/10 px-5 py-3 text-sm outline-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    value={productForm.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                    placeholder="Category"
                    className="w-full rounded-full border border-black/10 px-5 py-3 text-sm outline-none"
                  />
                  <select
                    value={productForm.status}
                    onChange={(e) =>
                      handleFormChange("status", e.target.value as ProductStatus)
                    }
                    className="w-full rounded-full border border-black/10 px-5 py-3 text-sm outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <textarea
                  value={productForm.description}
                  onChange={(e) => handleFormChange("description", e.target.value)}
                  placeholder="Write a professional product description"
                  className="min-h-[180px] w-full rounded-[1.5rem] border border-black/10 px-5 py-4 text-sm outline-none"
                />

                <div className="rounded-[1.5rem] border border-black/5 bg-[#fcf9f8] p-5">
                  <p className="text-sm font-medium">Product Summary</p>
                  <div className="mt-4 space-y-3 text-sm text-black/60">
                    <div className="flex items-center justify-between gap-4">
                      <span>Name</span>
                      <span className="text-right font-medium text-black">
                        {productForm.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Category</span>
                      <span className="text-right font-medium capitalize text-black">
                        {productForm.category || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Price</span>
                      <span className="text-right font-medium text-black">
                        {productForm.price
                          ? formatPrice(Number(productForm.price))
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Status</span>
                      <span className="text-right font-medium text-black">
                        {productForm.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleSaveProduct}
                    disabled={loading || uploadingImage}
                    className="w-full rounded-full bg-black py-3 text-sm text-white disabled:opacity-60"
                  >
                    {loading || uploadingImage
                      ? editingProductId
                        ? "Updating..."
                        : "Creating..."
                      : editingProductId
                        ? "Update Product"
                        : "Add Product"}
                  </button>

                  <button
                    onClick={closeProductModal}
                    className="w-full rounded-full border border-black/10 py-3 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
