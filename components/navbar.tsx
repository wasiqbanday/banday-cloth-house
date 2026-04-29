"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/customize", label: "Customize" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="glass-nav fixed left-0 top-0 z-[1100] w-full px-7 py-4 md:px-16 md:py-3">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="relative z-[1200] flex items-center gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex h-9 w-9 items-center justify-center border border-zinc-900/10 bg-white font-display text-xl font-bold italic text-[var(--rose)] shadow-sm">
              B
            </div>
            <div className="leading-none">
              <span className="block font-display text-2xl font-bold uppercase tracking-[0.12em] text-zinc-900 md:text-3xl">
                Banday
              </span>
              <span className="block text-[9px] font-bold uppercase tracking-[0.34em] text-zinc-500">
                Cloth House
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-12 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link text-[11px] font-bold uppercase tracking-[0.24em] text-zinc-800"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/customize"
              className="btn-luxe hidden px-7 py-3 sm:inline-flex"
            >
              Atelier
            </Link>
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="relative z-[1300] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span
                className={`h-[1.5px] w-6 bg-zinc-900 transition duration-500 ${
                  menuOpen ? "translate-y-1 rotate-45" : ""
                }`}
              />
              <span
                className={`h-[1.5px] w-6 bg-zinc-900 transition duration-500 ${
                  menuOpen ? "-translate-y-1 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-[1050] flex h-screen w-full flex-col items-center justify-center bg-white transition-transform duration-500 md:hidden ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col items-center gap-11 text-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-xl font-light uppercase tracking-[0.3em] text-zinc-900 transition hover:text-[var(--rose)]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/cart"
            onClick={() => setMenuOpen(false)}
            className="btn-luxe mt-6 inline-flex"
          >
            Cart
          </Link>
        </div>

        <div className="absolute bottom-14 flex gap-10 text-zinc-900/40">
          <span className="text-[10px] uppercase tracking-[0.24em]">
            Instagram
          </span>
          <span className="text-[10px] uppercase tracking-[0.24em]">
            Kashmir
          </span>
        </div>
      </div>
    </>
  );
}
