"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const loginImage =
  "https://lh4.googleusercontent.com/-XY5BUdTsab0/UV6Ycw8yxTI/AAAAAAAALQM/OLcuyAOY3RI/s1000/1.jpg";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setStatus("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setStatus(data.message || "Invalid login.");
        return;
      }

      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_logged_in", "true");

      router.push("/admin");
    } catch (error) {
      console.error(error);
      setStatus("Unable to login right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Image
        src={loginImage}
        alt="Banday inventory login background"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.64]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/36 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      <div className="hero-texture" />

      <div className="relative z-10 flex min-h-screen w-full">
        <section className="hidden flex-1 flex-col justify-between p-10 lg:flex xl:p-14">
          <div>
            <div className="flex h-12 w-12 items-center justify-center border border-white/18 bg-white/10 font-display text-3xl font-bold italic text-[var(--rose)] backdrop-blur-xl">
              B
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.36em] text-[var(--rose)]">
              Banday Inventory
            </p>
          </div>

          <div className="max-w-xl pb-10">
            <p className="mb-5 h-1.5 w-14 rounded-full bg-[var(--rose)] shadow-[0_0_18px_rgba(255,155,155,0.45)]" />
            <h1 className="font-display text-7xl font-light leading-[0.9] text-white xl:text-8xl">
              Retail control,
              <span className="block italic text-[var(--gold)]">
                privately kept.
              </span>
            </h1>
            <p className="mt-7 max-w-md text-sm font-light leading-7 text-white/62">
              Manage collections, orders, uploads, and customer messages from a
              focused workspace built for the Banday team.
            </p>
          </div>
        </section>

        <aside className="ml-auto flex min-h-screen w-full items-center justify-center border-l border-white/10 bg-black/45 p-7 shadow-[-24px_0_70px_-24px_rgba(0,0,0,0.72)] backdrop-blur-2xl sm:p-10 lg:max-w-[500px]">
          <div className="w-full max-w-sm">
            <div className="space-y-4">
              <div className="h-1.5 w-12 rounded-full bg-[var(--rose)] shadow-[0_0_14px_rgba(255,155,155,0.45)]" />
              <h2 className="font-display text-5xl font-light leading-none text-white">
                Login
              </h2>
              <div className="space-y-1">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--rose)]">
                  Banday Cloth House
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/62">
                  Premium Fashion Inventory
                </p>
              </div>
            </div>

            <form
              className="mt-9 flex flex-col gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                handleLogin();
              }}
            >
              <div className="space-y-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-white/55">
                    E-mail
                  </span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="focus-ring w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--rose)]/60"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-white/55">
                    Password
                  </span>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="focus-ring w-full rounded-md border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[var(--rose)]/60"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-white/42 transition hover:text-white"
                    >
                      {showPassword ? (
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M3 3l18 18" strokeLinecap="round" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.4 5.4A10.7 10.7 0 0 1 12 5c5 0 8.7 4 10 7-0.5 1.2-1.4 2.6-2.6 3.8" />
                          <path d="M6.1 6.8C4.2 8.1 2.8 10.1 2 12c1.3 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8" />
                        </svg>
                      ) : (
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-[var(--rose)] px-4 text-base font-semibold text-white shadow-[0_4px_24px_rgba(255,155,155,0.32)] transition hover:bg-[#ff8080] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

              {status && (
                <p className="rounded-md border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/68">
                  {status}
                </p>
              )}
            </form>

            <div className="mt-10 border-t border-white/14 pt-8">
              <p className="text-center text-[10px] uppercase tracking-[0.28em] text-white/54">
                Authorized Personnel Only
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
