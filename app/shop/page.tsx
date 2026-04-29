"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
};

type Filter = "all" | "men" | "women" | "traditional";
type SortMode = "featured" | "price-low" | "price-high" | "name";

const filterLabels: Record<Filter, string> = {
  all: "All",
  men: "Men",
  women: "Women",
  traditional: "Traditional",
};

const sizes = ["S", "M", "L", "XL"];

const fallbackImage =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function getProductImages(product: Product) {
  const images = Array.isArray(product.images) ? product.images : [];
  return [product.image, ...images].filter(Boolean).filter((item, index, arr) => {
    return arr.indexOf(item) === index;
  });
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const byCategory =
      filter === "all"
        ? products
        : products.filter((product) =>
            product.category?.toLowerCase().includes(filter)
          );

    const bySearch = query.trim()
      ? byCategory.filter((product) =>
          [product.name, product.category, product.description]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
        )
      : byCategory;

    return [...bySearch].sort((a, b) => {
      if (sortMode === "price-low") return Number(a.price) - Number(b.price);
      if (sortMode === "price-high") return Number(b.price) - Number(a.price);
      if (sortMode === "name") return a.name.localeCompare(b.name);
      return 0;
    });
  }, [filter, products, query, sortMode]);

  const selectedImages = selectedProduct
    ? getProductImages(selectedProduct)
    : [];
  const activeImage =
    selectedImages[activeImageIndex] || selectedProduct?.image || fallbackImage;

  const addToCart = (product: Product, size = selectedSize) => {
    let existingCart: Array<Product & { quantity?: number; size?: string }> = [];

    try {
      existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    } catch {
      existingCart = [];
    }

    existingCart.push({
      ...product,
      size,
      quantity: 1,
      image: product.image || fallbackImage,
    });
    localStorage.setItem("cart", JSON.stringify(existingCart));
    setNotice(`${product.name} added to cart`);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const openFullView = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageIndex(0);
    setSelectedSize("M");
  };

  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#1f1f1f]">
      <section className="relative min-h-[58vh] overflow-hidden bg-black md:min-h-[68vh]">
        <Image
          src="https://images.unsplash.com/photo-1520975922323-5f8f4cbdc0f5?auto=format&fit=crop&w=1800&q=80"
          alt="Banday fashion collection"
          fill
          priority
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-5 pb-10 pt-28 text-white md:min-h-[68vh] md:px-10 md:pb-14">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/70">
            Banday Collection
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Shop refined everyday and occasion wear.
          </h1>
          <div className="mt-6 flex max-w-4xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">
              Discover premium pieces with clean silhouettes, detailed
              finishing, and a wardrobe-first approach to modern style.
            </p>
            <Link
              href="/cart"
              className="inline-flex w-fit items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-[#f2e7dc]"
            >
              View Cart
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">
        <div className="flex flex-col gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
              Collection
            </p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">
              Premium Pieces
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/55">
              Filter by collection and open any piece for a complete view with
              gallery, sizing, fabric notes, and checkout actions.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-wrap gap-2 rounded-full border border-black/10 bg-white p-1">
              {(Object.keys(filterLabels) as Filter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    filter === cat
                      ? "bg-black text-white"
                      : "text-black/60 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {filterLabels[cat]}
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search collection"
                className="focus-ring rounded-full border border-black/10 bg-white px-5 py-3 text-sm lg:w-64"
              />
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                className="focus-ring rounded-full border border-black/10 bg-white px-5 py-3 text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-black/50">
          <span>{filteredProducts.length} products available</span>
          <span>{query ? `Search: ${query}` : "Curated in Kashmir"}</span>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[560px] animate-pulse rounded-[1.5rem] bg-white"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mt-12 border-y border-black/10 py-16 text-center">
            <h3 className="text-2xl font-semibold">No products found</h3>
            <p className="mt-3 text-sm text-black/55">
              Try another collection or add products from the admin dashboard.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => {
              const productImages = getProductImages(product);
              const image = productImages[0] || fallbackImage;

              return (
                <article
                  key={product._id}
                  className="card-3d group overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_18px_50px_rgba(30,20,10,0.08)]"
                >
                  <button
                    onClick={() => openFullView(product)}
                    className="relative block aspect-[4/5] w-full overflow-hidden bg-[#e9e2da] text-left"
                  >
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-black/60">
                      {product.category || "Collection"}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 opacity-0 transition group-hover:opacity-100">
                      <span className="inline-flex rounded-full bg-white px-5 py-2 text-sm font-medium text-black">
                        Full View
                      </span>
                    </div>
                  </button>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold leading-snug">
                          {product.name}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-black/52">
                          {product.description ||
                            "A refined wardrobe piece selected for comfort, fit, and everyday polish."}
                        </p>
                      </div>
                      <p className="shrink-0 text-base font-semibold">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => addToCart(product, "M")}
                        className="flex-1 rounded-full bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6b4f3f]"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => openFullView(product)}
                        className="rounded-full border border-black/15 px-5 py-3 text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {notice && (
        <div className="fixed bottom-5 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-black px-5 py-3 text-sm text-white shadow-2xl">
          {notice}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-black/75 p-3 backdrop-blur-sm md:p-6">
          <div className="mx-auto my-4 grid w-full max-w-6xl overflow-hidden rounded-xl bg-[#fbf8f4] shadow-[0_30px_90px_rgba(0,0,0,0.35)] lg:grid-cols-[1.15fr_0.85fr]">
            <div className="bg-[#e9e2da] p-3 md:p-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white lg:aspect-[5/6]">
                <Image
                  src={activeImage}
                  alt={selectedProduct.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>

              {selectedImages.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {selectedImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-square overflow-hidden rounded-lg border bg-white ${
                        activeImageIndex === index
                          ? "border-black"
                          : "border-black/10"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${selectedProduct.name} view ${index + 1}`}
                        fill
                        sizes="90px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex flex-col p-6 md:p-8">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl leading-none transition hover:bg-black hover:text-white"
                aria-label="Close product view"
              >
                x
              </button>

              <p className="pr-12 text-[11px] uppercase tracking-[0.32em] text-black/40">
                {selectedProduct.category || "Banday"}
              </p>
              <h2 className="mt-3 pr-12 text-3xl font-semibold leading-tight md:text-4xl">
                {selectedProduct.name}
              </h2>
              <p className="mt-4 text-2xl font-semibold">
                {formatPrice(selectedProduct.price)}
              </p>

              <p className="mt-5 text-sm leading-7 text-black/58">
                {selectedProduct.description ||
                  "Designed as a premium everyday essential with a considered fit, clean finishing, and versatile styling potential."}
              </p>

              <div className="mt-7 border-y border-black/10 py-6">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-black/45">
                  Select Size
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full border px-4 py-3 text-sm font-medium transition ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-black/12 bg-white text-black hover:border-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-black/62">
                <div className="flex justify-between border-b border-black/8 pb-3">
                  <span>Fit</span>
                  <span className="font-medium text-black">Regular comfort</span>
                </div>
                <div className="flex justify-between border-b border-black/8 pb-3">
                  <span>Care</span>
                  <span className="font-medium text-black">Gentle wash</span>
                </div>
                <div className="flex justify-between">
                  <span>Dispatch</span>
                  <span className="font-medium text-black">2-4 business days</span>
                </div>
              </div>

              <div className="mt-auto pt-8">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => addToCart(selectedProduct, selectedSize)}
                    className="rounded-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-[#6b4f3f]"
                  >
                    Add to Cart
                  </button>
                  <Link
                    href="/cart"
                    onClick={() => addToCart(selectedProduct, selectedSize)}
                    className="rounded-full border border-black/15 px-6 py-4 text-center text-sm font-medium transition hover:border-black hover:bg-black hover:text-white"
                  >
                    Buy Now
                  </Link>
                </div>
                <p className="mt-4 text-xs leading-5 text-black/42">
                  Saved with selected size. You can review quantity and final
                  details in the cart before placing your order.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
