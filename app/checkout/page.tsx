"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id?: number | string;
  _id?: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  quantity?: number;
  size?: string;
  customDesign?: {
    fabric?: string;
    color?: string;
    pattern?: string;
    sleeve?: string;
    neckline?: string;
    length?: string;
    notes?: string;
    measurements?: Record<string, string>;
  };
};

type CheckoutForm = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
};

const paymentOptions = ["Cash on Delivery", "UPI on confirmation", "Card at store"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDesignDetails(design?: CartItem["customDesign"]) {
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

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [form, setForm] = useState<CheckoutForm>({
    customerName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(paymentOptions[0]);

  useEffect(() => {
    try {
      const storedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      ) as CartItem[];

      setCart(
        storedCart.map((item) => ({
          ...item,
          quantity: item.quantity ?? 1,
        }))
      );
      setPromoCode(new URLSearchParams(window.location.search).get("promo") || "");
    } catch {
      setCart([]);
    }
  }, []);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
        0
      ),
    [cart]
  );
  const shipping = cart.length > 0 ? 499 : 0;
  const discount =
    promoCode.trim().toUpperCase() === "BANDAY10"
      ? Math.round(subtotal * 0.1)
      : 0;
  const total = subtotal + shipping - discount;

  const updateForm = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const placeOrder = async () => {
    if (!cart.length) {
      setStatus("Your cart is empty.");
      return;
    }

    if (!form.customerName || !form.email || !form.phone || !form.address) {
      setStatus("Please fill in all checkout details.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.map((item, index) => ({
            productId: String(item._id || item.id || index),
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity ?? 1,
            image: item.image || "",
            size: item.size || "",
            customDesign: item.customDesign,
          })),
          subtotal,
          shipping,
          discount,
          total,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to place order");
      }

      localStorage.removeItem("cart");
      setCart([]);
      setStatus("Order placed successfully.");
      window.setTimeout(() => router.push("/shop"), 1200);
    } catch (error) {
      console.error(error);
      setStatus(
        error instanceof Error
          ? error.message
          : "Unable to place order right now."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] pt-24 text-[#1f1f1f]">
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="flex flex-col gap-4 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
              Checkout
            </p>
            <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
              Complete Your Order
            </h1>
          </div>
          <Link
            href="/cart"
            className="w-fit rounded-full border border-black/10 px-5 py-3 text-sm"
          >
            Back to Cart
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="mt-10 rounded-[1.5rem] border border-black/10 bg-white p-8 text-center">
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-3 text-sm text-black/55">
              Add a few pieces before starting checkout.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-black px-6 py-3 text-sm text-white"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="luxury-panel rounded-xl p-6 md:p-8">
              <h2 className="text-2xl font-semibold">Delivery Details</h2>
              <div className="mt-6 grid gap-4">
                <input
                  value={form.customerName}
                  onChange={(e) => updateForm("customerName", e.target.value)}
                  placeholder="Full name"
                  className="focus-ring rounded-full border border-black/10 px-5 py-3 text-sm"
                />
                <input
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="focus-ring rounded-full border border-black/10 px-5 py-3 text-sm"
                />
                <input
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="Phone number"
                  type="tel"
                  className="focus-ring rounded-full border border-black/10 px-5 py-3 text-sm"
                />
                <textarea
                  value={form.address}
                  onChange={(e) => updateForm("address", e.target.value)}
                  placeholder="Complete delivery address"
                  className="focus-ring min-h-[150px] rounded-lg border border-black/10 p-5 text-sm"
                />
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="mt-6 w-full rounded-full bg-black px-6 py-4 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>

              {status && <p className="mt-4 text-sm text-black/60">{status}</p>}
            </div>

            <aside className="luxury-panel h-fit rounded-xl p-6 md:p-8 lg:sticky lg:top-28">
              <h2 className="text-2xl font-semibold">Order Summary</h2>

              <div className="mt-6 space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={`${item._id || item.id || item.name}-${index}`}
                    className="flex gap-4 border-b border-black/8 pb-4"
                  >
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f0ebe5]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-black/50">
                        Qty {item.quantity ?? 1}
                        {item.size ? ` · Size ${item.size}` : ""}
                      </p>
                      {item.customDesign && (
                        <div className="mt-2 rounded-lg border border-black/5 bg-[#fcf9f8] p-2 text-xs leading-5 text-black/55">
                          <p className="font-medium text-black">
                            Custom Atelier
                          </p>
                          <p>{formatDesignDetails(item.customDesign)}</p>
                          {formatMeasurements(item.customDesign.measurements) && (
                            <p>
                              {formatMeasurements(
                                item.customDesign.measurements
                              )}
                            </p>
                          )}
                          {item.customDesign.notes && (
                            <p className="line-clamp-2">
                              {item.customDesign.notes}
                            </p>
                          )}
                        </div>
                      )}
                      <p className="mt-2 text-sm font-semibold">
                        {formatPrice(Number(item.price) * (item.quantity ?? 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-black/50">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-black/50">Discount</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between border-t border-black/10 pt-4 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 border-t border-black/10 pt-5">
                <p className="text-sm font-medium">Preferred Payment</p>
                <div className="mt-3 grid gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setPaymentMethod(option)}
                      className={`rounded-full border px-4 py-3 text-left text-sm transition ${
                        paymentMethod === option
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black/65 hover:border-black/25"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
