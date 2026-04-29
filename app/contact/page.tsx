"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const whatsappNumber = "919900000000";
  const whatsappMessage = encodeURIComponent(
    "Hello Banday Cloth House, I would like to know more about your collection."
  );

  const contactOptions = [
    ["Store Support", "Orders, stock checks, and product availability."],
    ["Style Guidance", "Occasion looks, sizes, and wardrobe pairing help."],
    ["Business Queries", "Bulk, partnership, and custom collection inquiries."],
  ];

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!form.name || !form.email || !form.message) {
      setStatus("Please fill in name, email, and message.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus("Message sent successfully.");
        setForm({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        setStatus(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Unable to send message right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcf9f8] text-[#1f1f1f]">
      {/* HERO */}
      <section className="relative flex h-[50vh] items-center justify-center overflow-hidden md:h-[60vh]">
        <Image
          src="https://images.unsplash.com/photo-1520975922323-5f8f4cbdc0f5?auto=format&fit=crop&w=1600&q=80"
          alt="Contact Banday Cloth House"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 px-6 text-center text-white">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/70">
            Contact
          </p>
          <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70 md:text-base">
            We’d love to hear from you. Reach out for collections, orders,
            styling queries, or business inquiries.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-6 pt-12 md:grid-cols-3 md:px-10">
        {contactOptions.map(([title, text], index) => (
          <div key={title} className="card-3d luxury-panel rounded-xl p-6">
            <span className="text-xs font-semibold text-black/35">
              0{index + 1}
            </span>
            <h2 className="mt-5 text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-black/58">{text}</p>
          </div>
        ))}
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-20">
        <div className="grid gap-10 md:grid-cols-2">
          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="luxury-panel card-3d rounded-xl p-8"
          >
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
              Send a Message
            </p>
            <h2 className="mt-3 text-3xl font-semibold">We’re Here to Help</h2>

            <div className="mt-8 space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
                className="focus-ring w-full rounded-full border border-black/10 px-5 py-3"
              />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email Address"
                type="email"
                className="focus-ring w-full rounded-full border border-black/10 px-5 py-3"
              />

              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone Number"
                type="tel"
                className="focus-ring w-full rounded-full border border-black/10 px-5 py-3"
              />

              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your message"
                className="focus-ring min-h-[160px] w-full rounded-lg border border-black/10 p-4"
              />

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-3d w-full rounded-full bg-black py-3 text-sm text-white disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-full border py-3 text-center text-sm"
                >
                  WhatsApp Us
                </a>
              </div>

              {status && <p className="text-sm text-black/60">{status}</p>}
            </div>
          </form>

          {/* INFO */}
          <div className="flex flex-col gap-8">
            <div className="luxury-panel rounded-xl p-8">
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/40">
                Contact Info
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Let’s Connect</h2>

              <p className="mt-4 text-sm text-black/60">
                Whether you have a question about our collection, an order, or a
                custom requirement, our team is ready to assist you.
              </p>

              <div className="mt-8 space-y-5 text-sm">
                <div>
                  <p className="text-black/40">Email</p>
                  <p className="font-medium">bandayclothhouse@gmail.com</p>
                </div>

                <div>
                  <p className="text-black/40">Phone</p>
                  <p className="font-medium">+91 99000 00000</p>
                </div>

                <div>
                  <p className="text-black/40">Location</p>
                  <p className="font-medium">Srinagar, Kashmir</p>
                </div>

                <div>
                  <p className="text-black/40">Response Time</p>
                  <p className="font-medium">Usually within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="card-3d overflow-hidden rounded-xl border bg-white shadow">
              <div className="relative h-[240px]">
                <Image
                  src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
                  alt="Banday fashion"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border bg-white shadow">
              <iframe
                title="Banday Cloth House Location"
                src="https://www.google.com/maps?q=Srinagar,Kashmir&z=13&output=embed"
                className="h-[280px] w-full border-0"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
