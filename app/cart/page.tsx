"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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

const serviceNotes = [
  "Premium packaging",
  "Size review before dispatch",
  "Secure checkout",
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [hasLoadedCart, setHasLoadedCart] = useState(false);

  useEffect(() => {
    try {
      const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");

      setCart(
        existingCart.map((item: CartItem) => ({
          ...item,
          quantity: item.quantity ?? 1,
        }))
      );
    } catch {
      setCart([]);
    } finally {
      setHasLoadedCart(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hasLoadedCart]);

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const nextQty = Math.max(1, (item.quantity ?? 1) + delta);
        return { ...item, quantity: nextQty };
      })
    );
  };

  const removeItem = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

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

  return (
    <main className="min-h-screen bg-[#fcf9f8] text-[#1f1f1f]">
      {/* HERO */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Cart
          </p>
          <h1 className="mt-3 text-4xl font-semibold md:text-6xl">
            Your Luxury Cart
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/55 md:text-base">
            Review your selected pieces, adjust quantities, and continue to
            checkout with a refined shopping experience.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        {cart.length === 0 ? (
          <div className="luxury-panel card-3d rounded-xl p-8 text-center md:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-lg border border-black/10 bg-[#fcf9f8] text-3xl">
              Bag
            </div>
            <h2 className="mt-6 text-3xl font-semibold">Your cart is empty</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-black/55 md:text-base">
              Start exploring our premium collection and add your favorite
              pieces to create your perfect fashion selection.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="rounded-full bg-black px-8 py-3 text-sm text-white"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="rounded-full border border-black/10 px-8 py-3 text-sm"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            {/* CART ITEMS */}
            <div className="space-y-5">
              <div className="luxury-panel rounded-xl p-5 md:flex md:items-center md:justify-between md:p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
                    Selected Items
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {cart.length} item{cart.length > 1 ? "s" : ""} in cart
                  </h2>
                </div>

                <button
                  onClick={clearCart}
                  className="rounded-full border border-black/10 px-5 py-3 text-sm text-black/70 transition hover:border-black/20 hover:text-black"
                >
                  Clear Cart
                </button>
              </div>

              {cart.map((item, index) => (
                <div
                  key={`${item._id || item.id}-${index}`}
                  className="card-3d overflow-hidden rounded-xl border border-black/5 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.05)]"
                >
                  <div className="grid gap-5 p-5 md:grid-cols-[140px_1fr_auto] md:items-center md:p-6">
                    {/* IMAGE */}
                    <div className="relative h-[180px] overflow-hidden rounded-lg bg-[#f4f0ec] md:h-[160px]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-black/35">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* DETAILS */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
                        {item.category ?? "premium wear"}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">
                        {item.name}
                      </h3>

                      {item.size && (
                        <p className="mt-2 text-sm text-black/55">
                          Size: <span className="font-medium">{item.size}</span>
                        </p>
                      )}

                      <p className="mt-2 text-sm text-black/55">
                        Curated premium styling with a refined luxury finish.
                      </p>

                      {item.customDesign && (
                        <div className="mt-4 rounded-lg border border-black/5 bg-[#fcf9f8] p-3 text-xs leading-6 text-black/58">
                          <p className="font-medium text-black">
                            Custom Atelier Request
                          </p>
                          <p>
                            {[
                              item.customDesign.fabric,
                              item.customDesign.pattern,
                              item.customDesign.sleeve,
                              item.customDesign.neckline,
                              item.customDesign.length,
                            ]
                              .filter(Boolean)
                              .join(" / ")}
                          </p>
                          {item.customDesign.notes && (
                            <p className="mt-1 line-clamp-2">
                              {item.customDesign.notes}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="mt-4 text-lg font-semibold">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col gap-4 md:items-end">
                      <div className="flex items-center rounded-full border border-black/10 bg-[#fcf9f8] p-1">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-black/70 transition hover:bg-white hover:text-black"
                        >
                          −
                        </button>
                        <span className="min-w-[40px] text-center text-sm font-medium">
                          {item.quantity ?? 1}
                        </span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-black/70 transition hover:bg-white hover:text-black"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-lg font-semibold">
                        ₹
                        {(
                          Number(item.price) * (item.quantity ?? 1)
                        ).toLocaleString("en-IN")}
                      </p>

                      <button
                        onClick={() => removeItem(index)}
                        className="text-sm text-black/45 transition hover:text-black"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/shop"
                  className="rounded-full border border-black/10 px-6 py-3 text-center text-sm"
                >
                  Continue Shopping
                </Link>
                <Link
                  href={`/checkout?promo=${encodeURIComponent(
                    promoCode.trim()
                  )}`}
                  className="rounded-full bg-black px-6 py-3 text-center text-sm text-white"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <aside className="luxury-panel h-fit rounded-xl p-6 md:p-7 lg:sticky lg:top-28">
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
                Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Order Details</h2>

              <div className="mt-6 rounded-lg bg-[#fcf9f8] p-4">
                <label className="text-sm font-medium">Promo Code</label>
                <div className="mt-3 flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="w-full rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                  />
                  <button className="rounded-full border border-black/10 px-5 py-3 text-sm">
                    Apply
                  </button>
                </div>
                <p className="mt-3 text-xs text-black/45">
                  Try{" "}
                  <span className="font-medium text-black">BANDAY10</span> for
                  demo discount.
                </p>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-black/50">Subtotal</span>
                  <span className="font-medium">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-black/50">Shipping</span>
                  <span className="font-medium">
                    ₹{shipping.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-black/50">Discount</span>
                  <span className="font-medium">
                    − ₹{discount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">Total</span>
                    <span className="text-xl font-semibold">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/checkout?promo=${encodeURIComponent(
                  promoCode.trim()
                )}`}
                className="mt-7 block w-full rounded-full bg-black py-3 text-center text-sm text-white"
              >
                Secure Checkout
              </Link>

              <div className="mt-6 rounded-lg border border-black/5 bg-[#fcf9f8] p-4">
                <p className="text-sm font-medium">Why shop with us</p>
                <div className="mt-3 space-y-2 text-sm text-black/55">
                  <p>• Premium curated fashion pieces</p>
                  <p>• Luxury packaging experience</p>
                  <p>• Secure and smooth checkout</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {serviceNotes.map((note, index) => (
            <div key={note} className="luxury-panel rounded-xl p-5">
              <span className="text-xs font-semibold text-black/35">
                0{index + 1}
              </span>
              <p className="mt-4 text-lg font-semibold">{note}</p>
              <p className="mt-2 text-sm leading-6 text-black/55">
                Your order is reviewed for a cleaner, more confident shopping
                experience.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
