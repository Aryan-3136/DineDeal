import type { Metadata } from "next";
import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";
import "./globals.css";

export const metadata: Metadata = {
  title: "DineDeal Mumbai | BestDiningDeal",
  description: "Compare estimated Mumbai restaurant dining savings across EazyDiner, Swiggy Dineout, District, Zomato Dining, direct and bank offers."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 border-b border-ink/10 bg-linen/92 backdrop-blur">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf text-white">
                <UtensilsCrossed size={20} />
              </span>
              <span>DineDeal Mumbai</span>
            </Link>
            <div className="flex items-center gap-4 text-sm text-ink/70">
              <Link className="hover:text-ink" href="/">Compare</Link>
              <Link className="hover:text-ink" href="/best-restaurant-deals/mumbai">Restaurants</Link>
              <Link className="hover:text-ink" href="/admin/dashboard">Admin</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-ink/10 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-ink/65">
            Offers may change anytime. Please verify on the platform before booking or payment.
          </div>
        </footer>
      </body>
    </html>
  );
}
