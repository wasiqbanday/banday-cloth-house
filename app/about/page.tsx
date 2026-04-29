import Image from "next/image";
import Link from "next/link";

const milestones = [
  ["2010", "Built as a trusted local destination for daily and occasion wear."],
  ["2018", "Expanded into curated menswear, womenswear, and heritage selections."],
  ["2026", "Evolved into a digital-first fashion experience for modern shoppers."],
];

const promises = [
  "Clear collection curation",
  "Premium fabric-first selection",
  "Responsive customer guidance",
  "Elegant occasion-ready styling",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fcf9f8] text-[#1f1f1f]">
      {/* HERO */}
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden md:h-[65vh]">
        <Image
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80"
          alt="About Banday Cloth House"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />

        <div className="relative z-10 px-6 text-center text-white">
          <p className="text-[11px] uppercase tracking-[0.45em] text-white/70">
            About
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
            The Story of Banday Cloth House
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            A refined fashion destination shaped by timeless style, premium
            craftsmanship, and a deep appreciation for elegance.
          </p>
        </div>
      </section>

      <section className="border-y border-black/10 bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-3 md:px-10">
          {milestones.map(([year, text]) => (
            <div key={year}>
              <p className="text-4xl font-semibold">{year}</p>
              <p className="mt-3 text-sm leading-7 text-white/58">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
              Our Identity
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
              Luxury Fashion With Heritage at Its Core
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-8 text-black/60 md:text-base">
              <p>
                Banday Cloth House represents timeless style, premium
                craftsmanship, and a refined shopping experience built around
                elegance.
              </p>
              <p>
                Our collections are designed to blend heritage values with
                contemporary fashion language, delivering luxury for every
                occasion.
              </p>
              <p>
                From curated menswear to graceful women’s fashion and traditional
                attire, we create pieces that stand out with class and
                authenticity.
              </p>
            </div>
          </div>

          <div className="card-3d relative h-[420px] overflow-hidden rounded-[2rem] shadow-[0_12px_35px_rgba(0,0,0,0.08)] md:h-[560px]">
            <Image
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80"
              alt="Luxury fashion portrait"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
        <div className="mb-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
            Our Values
          </p>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
            Crafted Around Elegance
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="card-3d rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
              Quality
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Premium Craftsmanship</h3>
            <p className="mt-4 text-sm leading-7 text-black/60">
              Every collection is selected with a focus on detailing, fabric
              quality, and a premium fashion feel.
            </p>
          </div>

          <div className="card-3d rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
              Style
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Timeless Aesthetic</h3>
            <p className="mt-4 text-sm leading-7 text-black/60">
              We blend modern elegance with classic heritage to create pieces
              that remain relevant and refined.
            </p>
          </div>

          <div className="card-3d rounded-[2rem] border border-black/5 bg-white p-8 shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/35">
              Experience
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Refined Shopping</h3>
            <p className="mt-4 text-sm leading-7 text-black/60">
              Beyond products, we focus on a fashion experience that feels
              elegant, premium, and thoughtfully curated.
            </p>
          </div>
        </div>
      </section>

      {/* IMAGE STRIP */}
      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="card-3d relative h-[320px] overflow-hidden rounded-[2rem] md:col-span-7 md:h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80"
              alt="Fashion editorial"
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-6 md:col-span-5">
            <div className="card-3d relative h-[220px] overflow-hidden rounded-[2rem] md:h-[237px]">
              <Image
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury model"
                fill
                className="object-cover"
              />
            </div>

            <div className="card-3d relative h-[220px] overflow-hidden rounded-[2rem] md:h-[237px]">
              <Image
                src="https://images.unsplash.com/photo-1520975922323-5f8f4cbdc0f5?auto=format&fit=crop&w=1200&q=80"
                alt="Fashion portrait"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 md:px-10 md:pb-24">
        <div className="luxury-panel grid overflow-hidden rounded-xl lg:grid-cols-[0.85fr_1.15fr]">
          <div className="p-8 md:p-10">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
              Brand Promise
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
              Built for Confidence Before Checkout
            </h2>
            <p className="mt-5 text-sm leading-7 text-black/58">
              Every page, product, and interaction is shaped around helping
              customers decide faster with a more refined sense of trust.
            </p>
          </div>

          <div className="grid gap-3 border-t border-black/10 p-6 md:grid-cols-2 md:p-8 lg:border-l lg:border-t-0">
            {promises.map((promise, index) => (
              <div key={promise} className="rounded-lg bg-[#fcf9f8] p-5">
                <span className="text-xs font-semibold text-black/35">
                  0{index + 1}
                </span>
                <p className="mt-4 text-lg font-semibold">{promise}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-10 md:pb-28">
        <div className="rounded-[2rem] bg-black px-8 py-12 text-center text-white md:px-12 md:py-16">
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/55">
            Explore
          </p>
          <h2 className="mt-3 text-3xl font-semibold md:text-5xl">
            Discover the Banday Collection
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            Step into a world of curated luxury fashion designed with elegance,
            authenticity, and timeless style.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-full bg-white px-8 py-3 text-sm text-black"
            >
              Explore Collection
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/20 px-8 py-3 text-sm text-white"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
