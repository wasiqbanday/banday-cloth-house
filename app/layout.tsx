import type { Metadata } from "next";
import "./globals.css";
import SiteShell from "@/components/site-shell";

export const metadata: Metadata = {
  title: {
    default: "Banday Cloth House",
    template: "%s | Banday Cloth House",
  },
  description:
    "Premium fashion destination for menswear, womenswear, and traditional collections in Kashmir.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
