import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { Footer, Header } from "@/components/Chrome";
import "./globals.css";

// The two fonts from the app and the videos, served from this site
const fraunces = localFont({ src: "./fonts/Fraunces-latin.woff2", variable: "--font-fraunces", weight: "100 900", display: "swap" });
const atkinson = localFont({ src: "./fonts/AtkinsonHyperlegibleNext-latin.woff2", variable: "--font-atkinson", weight: "200 800", display: "swap" });

// The site's own address, for social preview images: SITE_URL if set, else the Vercel production address
const siteUrl = process.env.SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "VoiceLab: see how you sound",
  description: "Speak for a minute. VoiceLab shows you, word by word, where your voice rose, fell and paused, then gives you one thing to change.",
  openGraph: {
    title: "VoiceLab: see how you sound",
    description: "Speak for a minute and see where your voice rose, fell and paused. Join the waitlist.",
    images: ["/videos/demo-poster.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${atkinson.variable}`}>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
