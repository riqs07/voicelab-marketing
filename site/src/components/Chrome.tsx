// The header and footer on every page
import Link from "next/link";
import { BouncyLink } from "./Bouncy";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="9" fill="#2E5B3E" />
      <path d="M6 22 C 11 22, 12 12, 17 12 C 22 12, 23 20, 28 15" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5 text-ink no-underline">
        <LogoMark />
        <span className="font-serif text-2xl font-semibold">VoiceLab</span>
      </Link>
      <nav aria-label="Main" className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/#how" className="hidden font-semibold text-ink underline-offset-4 hover:underline sm:inline">
          How it works
        </Link>
        <Link href="/try" className="font-semibold text-ink underline-offset-4 hover:underline">
          Try it free
        </Link>
        <BouncyLink href="/waitlist" className="min-h-11 px-5 text-base">
          Join the waitlist
        </BouncyLink>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto mt-24 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-8 text-sm text-muted sm:px-8">
      <span>© {new Date().getFullYear()} VoiceLab</span>
      <nav aria-label="Footer" className="flex gap-6">
        <Link href="/privacy" className="text-muted underline-offset-4 hover:underline">
          Privacy
        </Link>
        <Link href="/waitlist" className="text-muted underline-offset-4 hover:underline">
          Waitlist
        </Link>
      </nav>
    </footer>
  );
}
