import Link from "next/link";

const expertise = [
  "Menswear",
  "Womenswear",
  "Traditional Wear",
  "Occasion Styling",
];

const navigation = [
  { href: "/", label: "Home Base" },
  { href: "/shop", label: "Signature Collections" },
  { href: "/customize", label: "Custom Atelier" },
  { href: "/about", label: "The House" },
  { href: "/contact", label: "Contact Desk" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-zinc-200 bg-white px-7 pb-12 pt-24 md:px-16">
      <div className="pointer-events-none absolute -bottom-10 -right-10 font-display text-[20vw] font-black uppercase italic text-zinc-900/[0.035]">
        Luxe
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <div className="mb-20 grid gap-14 md:grid-cols-4">
          <div>
            <h4 className="font-display text-2xl font-bold uppercase tracking-[0.24em] text-zinc-900">
              Banday <span className="italic text-[var(--rose)]">Luxe</span>
            </h4>
            <p className="mt-7 max-w-[260px] text-xs font-light leading-7 text-zinc-500">
              A refined fashion destination blending heritage, modern retail,
              and polished styling for every occasion.
            </p>
            <div className="mt-8 flex gap-6">
              {["Ig", "X", "Fb"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs uppercase tracking-[0.24em] text-zinc-600 transition hover:text-[var(--gold)]"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--rose)]">
              Our Expertise
            </h5>
            <ul className="space-y-4 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              {expertise.map((item) => (
                <li key={item}>
                  <Link href="/shop" className="transition hover:text-zinc-800">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--rose)]">
              Navigation
            </h5>
            <ul className="space-y-4 text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-zinc-800">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-8 text-[10px] font-bold uppercase tracking-[0.34em] text-[var(--rose)]">
              Visit Us
            </h5>
            <p className="mb-6 text-[10px] uppercase leading-loose tracking-[0.22em] text-zinc-500">
              Srinagar,
              <br />
              Kashmir
            </p>
            <a
              href="mailto:bandayclothhouse@email.com"
              className="border-b border-[var(--gold)]/35 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-900 transition hover:border-[var(--gold)]"
            >
              bandayclothhouse@email.com
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-5 border-t border-zinc-100 pt-10 text-center text-[9px] uppercase tracking-[0.28em] text-zinc-500 md:flex-row">
          <div>&copy; 2026 Banday Cloth House. Luxury Retail Experience.</div>
          <div className="flex gap-8">
            <a href="#" className="transition hover:text-[var(--gold)]">
              Privacy Policy
            </a>
            <a href="#" className="transition hover:text-[var(--gold)]">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
