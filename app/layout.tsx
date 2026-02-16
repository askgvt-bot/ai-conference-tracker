import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Conference Tracker — Every AI conference worldwide, ranked and searchable",
  description: "Discover and compare 80+ AI conferences worldwide. Filter by region, type, size, date, and price. Ranked by speaker quality, relevance, and networking value.",
  openGraph: {
    title: "AI Conference Tracker",
    description: "Every AI conference worldwide, ranked and searchable",
    type: "website",
  },
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white hover:text-cyan-400 transition-colors">
          <span className="text-xl">🌐</span>
          <span>AI Conference Tracker</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            Conferences
          </Link>
          <Link href="/speakers" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            Speakers
          </Link>
          <Link href="/calendar" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            Calendar
          </Link>
          <Link href="/about" className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 text-center text-sm text-gray-500">
        <p>Built by GVTLabs • Data may not be complete • <a href="mailto:nick@nickhalstead.com" className="text-cyan-500 hover:text-cyan-400">Submit corrections</a></p>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
