import type { Metadata } from "next";
import Link from "next/link";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { ShellAuthControls } from "@/components/auth/ShellAuthControls";

import "./globals.css";

const headingFont = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Availability",
  description: "A calm social planning app for friends and weekly availability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="relative min-h-screen bg-background text-foreground">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.08),transparent_28%)]" />
          <div className="relative mx-auto flex min-h-screen max-w-360 flex-col">
            <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
              <div className="flex items-center justify-between rounded-full border border-black/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-neutral-950/70">
                <Link href="/" className="font-serif text-2xl tracking-tight">
                  Affidability
                </Link>
                <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                  <nav className="flex items-center gap-2">
                    <Link
                      href="/friends"
                      className="rounded-full px-3 py-2 transition hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      Friends
                    </Link>
                    <Link
                      href="/availability"
                      className="rounded-full px-3 py-2 transition hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      Availability
                    </Link>
                  </nav>
                  <ShellAuthControls />
                </div>
              </div>
            </header>

            <div className="flex-1">{children}</div>

            <footer className="px-4 pb-8 pt-4 text-sm text-neutral-500 sm:px-6 dark:text-neutral-400">
              <div className="flex flex-col gap-2 border-t border-black/10 pt-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <p>Social availability for calmer planning.</p>
                <p>Friends first. Weekly rhythm. Less back-and-forth.</p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
