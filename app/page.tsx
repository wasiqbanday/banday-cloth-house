"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  _id?: string;
  id?: number;
  name: string;
  price?: number;
  category?: string;
  image?: string;
  images?: string[];
  description?: string;
  featured?: boolean;
};

const fallbackHeroImages = [
  "https://lh4.googleusercontent.com/-XY5BUdTsab0/UV6Ycw8yxTI/AAAAAAAALQM/OLcuyAOY3RI/s1000/1.jpg",
  "https://lh6.googleusercontent.com/-KyU014fnQeI/UV6YerKF2BI/AAAAAAAALQU/_2mJwc7cllg/s1000/2.jpg",
  "https://lh5.googleusercontent.com/-iJF4OZ72Ndg/UV6YmQXhfII/AAAAAAAALQc/ImKjCv17_d8/s1000/3.jpg",
];

const fallbackCategoryImages = {
  men: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=85",
  women:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85",
  traditional:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
};

const fallbackEditorialImages = [
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=85",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85",
];

const heroCopy = [
  {
    kicker: "Bespoke Fashion House",
    title: "Sculpt Your Timeless Style",
    accent: "Timeless Style",
    text: "Curated menswear, womenswear, and traditional silhouettes selected with a luxury eye and a retail-first sense of fit.",
    cta: "Private Styling",
  },
  {
    kicker: "The Kashmir Atelier",
    title: "Luxury Re-Imagined",
    accent: "Re-Imagined",
    text: "Step into a refined fashion destination where heritage textures meet modern wardrobe architecture.",
    cta: "Explore Drops",
  },
  {
    kicker: "Scientific Grace of Detail",
    title: "Defined by Fine Craft",
    accent: "Fine Craft",
    text: "Premium fabrics, considered finishes, and polished occasion looks built for the discerning customer.",
    cta: "View Collection",
  },
];

const atelierStats = [
  ["22+", "Years retail craft"],
  ["500+", "Seasonal styles"],
  ["3", "Signature edits"],
  ["24h", "Styling support"],
];

const protocolStages = [
  {
    label: "Stage One",
    title: "Discovery",
    text: "We learn your occasion, fit preferences, palette, and the mood you want the outfit to carry.",
  },
  {
    label: "Stage Two",
    title: "Curation",
    text: "The collection is narrowed into considered silhouettes, textures, and pairings that feel intentional.",
  },
  {
    label: "Stage Three",
    title: "Fitting",
    text: "Sizing, comfort, layering, and finishing details are checked before the final selection is confirmed.",
  },
  {
    label: "Stage Four",
    title: "Care",
    text: "Clear order support, dispatch guidance, and after-care notes keep the experience polished end to end.",
  },
];

const testimonials = [
  {
    initials: "AM",
    quote:
      "The collection feels refined and easy to shop. The styling has a proper premium finish.",
    name: "Aaliya Mir",
    role: "Customer, Srinagar",
  },
  {
    initials: "SK",
    quote:
      "Banday helped me choose a full occasion look with excellent attention to fit and detail.",
    name: "Sameer Khan",
    role: "Customer, Kashmir",
  },
  {
    initials: "ZA",
    quote:
      "The experience feels personal, calm, and beautifully curated from the first look to checkout.",
    name: "Zara Amin",
    role: "Wedding Guest",
  },
  {
    initials: "FR",
    quote:
      "Their traditional edit carries heritage without feeling heavy. The finishing is excellent.",
    name: "Faizan Rather",
    role: "Customer, Kashmir",
  },
];

function collectProductImages(products: Product[]) {
  return products
    .flatMap((product) => {
      const imgs = Array.isArray(product.images) ? product.images : [];
      const primary = product.image ? [product.image] : [];
      return [...primary, ...imgs];
    })
    .filter(Boolean);
}

function findCategory(products: Product[], category: string) {
  return products.find((product) =>
    (product.category || "").toLowerCase().includes(category)
  );
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroCopy.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();

        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Failed to load homepage products:", error);
      }
    };

    fetchProducts();
  }, []);

  const productImages = useMemo(() => collectProductImages(products), [products]);

  const heroImages = useMemo(
    () => [...fallbackHeroImages, ...productImages].slice(0, 3),
    [productImages]
  );

  const editorialImages = useMemo(() => {
    const images = productImages.length >= 6 ? productImages.slice(3, 6) : [];
    return [...images, ...fallbackEditorialImages].slice(0, 3);
  }, [productImages]);

  const menProduct = useMemo(() => findCategory(products, "men"), [products]);
  const womenProduct = useMemo(
    () => findCategory(products, "women"),
    [products]
  );
  const traditionalProduct = useMemo(
    () => findCategory(products, "traditional"),
    [products]
  );

  const collections = [
    {
      number: "01",
      eyebrow: "Structured Essentials",
      title: "Menswear",
      text: "Tailored everyday pieces with clean structure, polish, and quiet confidence.",
      image: menProduct?.image || fallbackCategoryImages.men,
    },
    {
      number: "02",
      eyebrow: "Fluid Statements",
      title: "Womenswear",
      text: "Elegant silhouettes with premium textures, graceful movement, and occasion-ready detail.",
      image: womenProduct?.image || fallbackCategoryImages.women,
    },
    {
      number: "03",
      eyebrow: "Heritage Edit",
      title: "Traditional",
      text: "Rich character, refined craft, and timeless pieces shaped for memorable gatherings.",
      image: traditionalProduct?.image || fallbackCategoryImages.traditional,
    },
  ];

  const featuredProduct = womenProduct || traditionalProduct || menProduct;
  const heroCardImage =
    productImages[activeSlide] ||
    heroImages[(activeSlide + 1) % heroImages.length] ||
    fallbackHeroImages[activeSlide];
  const heroCardTitle = featuredProduct?.name || heroCopy[activeSlide].accent;
  const heroCardDescription =
    featuredProduct?.description ||
    "A curated seasonal piece selected for texture, fit, and occasion-ready polish.";

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[var(--ink)]">
      <section
        id="hero"
        className="relative h-screen min-h-[720px] w-full overflow-hidden bg-black"
      >
        <div className="absolute inset-0 z-0 bg-black">
          {heroImages.map((image, index) => (
            <div
              key={`hero-bg-${image}`}
              className={`absolute inset-0 transition-opacity duration-[1600ms] ease-linear ${
                activeSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image}
                alt={`${heroCopy[index]?.kicker || "Banday"} fashion editorial`}
                fill
                priority={index === 0}
                sizes="100vw"
                className={`hero-slide-bg object-cover transition-transform duration-[6200ms] ease-linear ${
                  activeSlide === index ? "scale-100" : "scale-105"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/86 via-black/54 to-black/24" />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="hero-texture" />
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center overflow-hidden text-[20vw] font-black uppercase italic text-white/[0.06] mix-blend-screen">
          Banday
        </div>

        {heroCopy.map((slide, index) => (
          <section
            key={slide.kicker}
            className={`absolute inset-0 z-10 flex items-center transition-all duration-700 ${
              activeSlide === index
                ? "visible opacity-100"
                : "invisible opacity-0"
            }`}
          >
            <div className="relative z-10 mx-auto w-full max-w-[1400px] px-7 pt-20 text-white md:px-16">
              <div className="max-w-[640px]">
                <span className="line-accent mb-6 block text-[11px] font-bold uppercase tracking-[0.38em] text-[var(--gold)] md:text-xs">
                  {slide.kicker}
                </span>
                <h1 className="font-display text-5xl font-medium leading-[0.94] sm:text-6xl md:text-[6.2vw]">
                  {slide.title.replace(slide.accent, "").trim()}{" "}
                  <span className="block italic font-light text-[var(--gold)]">
                    {slide.accent}
                  </span>
                </h1>
                <p className="mt-7 max-w-md text-[13px] font-light leading-7 text-white/76 md:text-base md:leading-8">
                  {slide.text}
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-8">
                  <Link
                    href="/shop"
                    className="btn-luxe inline-flex items-center justify-center"
                  >
                    {slide.cta}
                  </Link>
                  <Link href="/about" className="btn-secondary text-white/72">
                    The House
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ))}

        <div className="hero-showcase-3d absolute bottom-16 right-[8vw] z-20 hidden lg:block">
          <div
            className="hero-card-3d relative w-[286px] rounded-md border border-white/20 bg-black/22 p-2.5 shadow-[0_35px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl xl:w-[318px]"
            style={{ transform: "rotateY(-10deg) rotateX(6deg)" }}
          >
            <div className="relative h-[354px] overflow-hidden rounded-[4px] bg-black xl:h-[398px]">
              {heroImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`absolute inset-0 transition-opacity duration-[1200ms] ease-linear ${
                    activeSlide === index
                      ? "scale-100 opacity-100"
                      : "opacity-0"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Banday hero card ${index + 1}`}
                    fill
                    sizes="370px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 left-4 right-4 rounded-[6px] border border-white/40 bg-[#f7efe5]/95 p-4 text-zinc-950 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--button)]">
                  New Season
                </p>
                <span className="text-[9px] uppercase tracking-[0.24em] text-zinc-400">
                  0{activeSlide + 1}
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold leading-none xl:text-2xl">
                {heroCardTitle}
              </h3>
              <p className="mt-2 line-clamp-2 text-[10px] font-light leading-5 text-zinc-600">
                {heroCardDescription}
              </p>
              <div className="mt-4 flex items-center gap-2">
                {heroImages.map((image, index) => (
                  <button
                    key={`card-dot-${image}`}
                    type="button"
                    aria-label={`Show hero slide ${index + 1}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      activeSlide === index
                        ? "w-8 bg-[var(--button)]"
                        : "w-2 bg-zinc-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="absolute -right-5 top-8 rounded-[6px] border border-[var(--gold)]/45 bg-black/72 px-3 py-4 text-center text-white shadow-xl backdrop-blur-xl">
              <p className="font-display text-3xl italic leading-none text-[var(--gold)]">
                Luxe
              </p>
              <p className="mt-2 text-[8px] uppercase tracking-[0.24em] text-white/62">
                Drop
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-20 right-5 z-20 hidden sm:block lg:hidden">
          <div
            className="hero-card-3d w-[150px] border border-white/20 bg-white/12 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl"
            style={{ transform: "rotateY(-10deg) rotateX(7deg)" }}
          >
            <div className="relative h-[190px] overflow-hidden">
              <Image
                src={heroCardImage}
                alt="Banday compact hero card"
                fill
                sizes="150px"
                className="object-cover"
              />
            </div>
            <div className="bg-[#f7efe5]/94 px-3 py-2 text-zinc-950">
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[var(--button)]">
                Luxe
              </p>
              <p className="mt-1 truncate font-display text-base font-bold">
                {heroCopy[activeSlide].accent}
              </p>
            </div>
          </div>
        </div>

        <div className="pagination-container hidden md:block">
          {heroCopy.map((slide, index) => (
            <button
              key={slide.kicker}
              type="button"
              aria-label={`Show ${slide.kicker}`}
              data-label={slide.kicker.split(" ")[0]}
              onClick={() => setActiveSlide(index)}
              className={`pagination-dot ${activeSlide === index ? "active" : ""}`}
            />
          ))}
        </div>

        <div className="absolute bottom-10 left-7 z-20 flex items-center gap-6 text-white/44 md:left-16">
          <div className="hidden gap-4 sm:flex">
            <a href="#" className="text-[9px] uppercase tracking-[0.28em]">
              Instagram
            </a>
            <a href="#" className="text-[9px] uppercase tracking-[0.28em]">
              X
            </a>
          </div>
          <div className="hidden h-px w-20 bg-white/24 sm:block" />
          <div className="text-[9px] uppercase tracking-[0.28em]">
            {String(activeSlide + 1).padStart(2, "0")} / 03
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-zinc-200 bg-white px-7 py-24 md:px-16 md:py-44">
        <div className="absolute right-0 top-0 h-full w-1/3 origin-top translate-x-20 -skew-x-12 bg-[var(--rose)]/5" />
        <div className="relative z-10 mx-auto grid max-w-[1400px] gap-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px w-12 bg-[var(--rose)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.48em] text-[var(--rose)]">
                The Essence of Banday
              </span>
            </div>
            <h2 className="font-display text-5xl font-bold leading-[0.92] md:text-8xl">
              Defining the{" "}
              <span className="block italic font-normal text-[var(--rose)]">
                Future of Fashion
              </span>
            </h2>
            <div className="mt-10 max-w-xl space-y-7 text-base font-light leading-8 text-zinc-600 md:text-lg">
              <p>
                Banday Cloth House bridges everyday retail clarity with the
                atmosphere of a private fashion atelier. Every collection is
                selected for texture, silhouette, fit, and the confidence it
                gives in the mirror.
              </p>
              <p className="border-l-2 border-[var(--rose)] pl-7 text-sm italic text-zinc-500">
                &quot;Style is not decoration. It is the quiet architecture of how a
                person arrives.&quot;
              </p>
            </div>

            <div className="mt-14 grid grid-cols-2 gap-8 border-t border-zinc-100 pt-12 md:grid-cols-4">
              {atelierStats.map(([value, label]) => (
                <div key={label}>
                  <h3 className="font-display text-4xl font-bold md:text-5xl">
                    {value}
                  </h3>
                  <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.28em] text-zinc-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="group relative">
            <div className="absolute -right-8 -top-8 -z-10 h-full w-full border border-[var(--rose)]/25 transition duration-700 group-hover:right-0 group-hover:top-0" />
            <div className="image-sheen relative overflow-hidden shadow-2xl">
              <Image
                src={editorialImages[0] || fallbackEditorialImages[0]}
                alt="Banday fashion atelier"
                width={900}
                height={1125}
                className="aspect-[4/5] w-full object-cover transition duration-1000 group-hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-10 -left-8 hidden max-w-xs border border-zinc-200 bg-white/92 p-9 shadow-xl backdrop-blur-xl md:block">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.36em] text-[var(--rose)]">
                Our Commitment
              </p>
              <p className="text-xs font-light italic leading-6 text-zinc-600">
                A fashion destination where every recommendation is selected
                with care, restraint, and occasion-aware polish.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-7 py-24 md:px-16 md:py-32">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <span className="mb-4 block text-[9px] font-bold uppercase tracking-[0.48em] text-[var(--rose)]">
            Sculpting Presence
          </span>
          <h2 className="font-display text-4xl font-bold uppercase md:text-6xl">
            Signature{" "}
            <span className="italic font-light text-[var(--rose)]">
              Collections
            </span>
          </h2>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.title}
              className="luxury-card group relative overflow-hidden border border-zinc-200 bg-zinc-50 transition duration-700 hover:border-[var(--rose)]/35"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={collection.image}
                  alt={`${collection.title} collection`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover grayscale transition duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
              <div className="relative p-8">
                <div className="absolute -top-10 right-8 font-display text-6xl font-black italic text-[var(--rose)]/10">
                  {collection.number}
                </div>
                <span className="mb-4 block text-[9px] font-bold uppercase tracking-[0.32em] text-[var(--gold)]">
                  {collection.eyebrow}
                </span>
                <h3 className="font-display text-2xl font-bold uppercase leading-tight">
                  {collection.title}
                </h3>
                <p className="mt-4 max-w-[220px] text-[12px] font-light leading-6 text-zinc-600">
                  {collection.text}
                </p>
                <Link
                  href="/shop"
                  className="mt-8 inline-flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.28em] text-[var(--rose)]"
                >
                  <span className="h-px w-7 bg-[var(--rose)] transition-all duration-500 group-hover:w-12" />
                  Explore
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--ink)] px-7 py-24 text-white md:px-16 md:py-32">
        <div className="pointer-events-none absolute right-[-5vw] top-8 font-display text-[18vw] font-black uppercase italic text-white/[0.04]">
          Craft
        </div>
        <div className="relative z-10 mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <span className="mb-5 block text-[10px] font-bold uppercase tracking-[0.48em] text-[var(--gold)]">
              The Styling Protocol
            </span>
            <h2 className="font-display text-5xl font-bold leading-[0.95] md:text-7xl">
              From first look to final fit.
            </h2>
            <p className="mt-8 max-w-md text-sm font-light leading-7 text-white/58">
              The reference mood becomes a fashion service here: precise,
              private, structured, and calm.
            </p>
            <div className="mt-10 flex items-center gap-7">
              <Link href="/contact" className="btn-luxe">
                Begin Consultation
              </Link>
              <div className="hidden items-center gap-4 text-white/46 sm:flex">
                <div className="h-px w-12 bg-[var(--gold)]/40" />
                <span className="text-[9px] uppercase tracking-[0.28em]">
                  Private & curated
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {protocolStages.map((stage, index) => (
              <article
                key={stage.title}
                className="group border border-white/10 bg-white/[0.04] p-7 transition duration-700 hover:border-[var(--gold)]/40 hover:bg-white/[0.07]"
              >
                <div className="mb-10 flex items-center justify-between">
                  <span className="font-display text-5xl italic text-white/10 transition duration-700 group-hover:text-[var(--gold)]/20">
                    0{index + 1}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center border border-[var(--gold)]/30 text-[var(--gold)]">
                    <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
                  </div>
                </div>
                <span className="mb-3 block text-[9px] uppercase tracking-[0.36em] text-[var(--gold)]">
                  {stage.label}
                </span>
                <h3 className="font-display text-2xl font-bold uppercase">
                  {stage.title}
                </h3>
                <p className="mt-4 text-[12px] font-light leading-6 text-white/55">
                  {stage.text}
                </p>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-[var(--gold)]/40 to-transparent transition duration-700 group-hover:from-[var(--gold)]" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white px-7 py-24 md:px-16 md:py-36">
        <div className="mx-auto grid max-w-[1400px] gap-16 md:grid-cols-2 md:items-start">
          <div className="group overflow-hidden">
            <div className="relative h-[420px] overflow-hidden">
              <Image
                src={editorialImages[1] || fallbackEditorialImages[1]}
                alt="Banday personal styling desk"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top transition duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
            </div>
            <div className="flex items-center justify-between border border-t-0 border-zinc-200 bg-white/85 p-6">
              <div>
                <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--rose)]">
                  Personal Styling Desk
                </p>
                <h4 className="font-display text-xl font-bold uppercase tracking-[0.12em]">
                  Banday Cloth House
                </h4>
              </div>
              <Link
                href="/contact"
                className="border border-zinc-200 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--gold)] transition hover:border-[var(--gold)]/40"
              >
                Book
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <span className="mb-4 block text-xs uppercase tracking-[0.42em] text-[var(--rose)]">
              The Vision
            </span>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Retail precision with{" "}
              <span className="italic font-light text-[var(--gold)]">
                atelier calm
              </span>
            </h2>
            <p className="mt-7 border-l border-[var(--rose)]/35 pl-6 text-sm font-light leading-7 text-zinc-600">
              The Banday experience is built around useful luxury: edited racks,
              clear categories, polished visual presentation, and guidance that
              helps customers choose with confidence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {["Occasion Wear", "Daily Luxury", "Traditional Edit", "Fit Guidance"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="border border-[var(--gold)]/30 px-4 py-2 text-[9px] uppercase tracking-[0.24em] text-[var(--gold)]"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>

            <div className="mt-10">
              <p className="mb-4 text-[9px] uppercase tracking-[0.36em] text-[var(--gold)]">
                Specialties
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Menswear", "Womenswear", "Heritage Styling", "Cart Support"].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="h-1 w-1 rounded-full bg-[var(--gold)]" />
                      <span className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-10 border-t border-zinc-100 pt-8">
              <p className="text-sm font-light italic leading-7 text-zinc-600">
                &quot;True luxury is the absence of confusion. A customer should feel
                the right piece before they need to explain it.&quot;
              </p>
              <p className="mt-3 text-[9px] uppercase tracking-[0.26em] text-[var(--gold)]">
                Banday Styling Note
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-zinc-200 bg-white py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[20vw] font-bold uppercase text-zinc-900/[0.04]">
          Voices
        </div>
        <div className="relative z-10 mx-auto mb-16 max-w-[1400px] px-7 text-center md:px-16">
          <span className="mb-4 block text-xs uppercase tracking-[0.42em] text-[var(--rose)]">
            Client Notes
          </span>
          <h2 className="font-display text-4xl font-bold md:text-6xl">
            Customer{" "}
            <span className="italic text-[var(--rose)]">Testimonials</span>
          </h2>
        </div>

        <div className="testimonial-wrapper relative z-10 overflow-x-auto px-7 pb-4 md:px-16">
          <div className="flex w-max gap-8">
            {testimonials.map((item) => (
              <figure key={item.name} className="testimonial-card">
                <div className="testimonial-quote">&quot;</div>
                <div className="mb-4 flex gap-1 text-[var(--gold)]">
                  <span>*</span>
                  <span>*</span>
                  <span>*</span>
                  <span>*</span>
                  <span>*</span>
                </div>
                <blockquote className="mb-6 whitespace-normal text-sm font-light italic leading-7 text-zinc-600">
                  &quot;{item.quote}&quot;
                </blockquote>
                <figcaption className="flex items-center">
                  <div className="client-avatar">{item.initials}</div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-900">
                      {item.name}
                    </h5>
                    <p className="mt-1 text-[8px] uppercase tracking-[0.24em] text-[var(--gold)]">
                      {item.role}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="relative flex min-h-[72vh] items-center overflow-hidden px-7 py-24 md:px-16">
        <div className="absolute inset-0 -z-10">
          <Image
            src={editorialImages[2] || fallbackEditorialImages[2]}
            alt="Banday luxury fashion detail"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/82" />
        </div>
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="max-w-xl">
            <span className="mb-4 block text-xs uppercase tracking-[0.42em] text-[var(--rose)]">
              The Modern Edge
            </span>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Heritage meets{" "}
              <span className="italic text-[var(--rose)]">digital ease</span>
            </h2>
            <p className="mt-7 text-base font-light leading-8 text-zinc-600 md:text-lg">
              Shop the same polished fashion language online, with product
              galleries, cart review, and direct support designed to make
              premium retail feel effortless.
            </p>
            <Link href="/shop" className="btn-luxe mt-10 inline-flex">
              Shop Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
