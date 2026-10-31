// The header and footer on every page
import Link from "next/link";
import { BouncyLink } from "./Bouncy";
import { Blob } from "./Characters";

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
    <footer className="relative mx-auto mt-24 flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-8 text-sm text-muted sm:px-8">
      {/* An Easter egg: the blob's eyes peek over the footer line */}
      <div className="absolute -top-[46px] right-[28%] h-[46px] overflow-hidden" aria-hidden="true">
        <Blob size={64} className="ch-peek block" />
      </div>
      <span>© {new Date().getFullYear()} VoiceLab</span>
      {/* Where it's made: a heart for "love", and an oak for the City of Oaks */}
      <span className="flex items-center gap-1.5">
        Made with
        <svg width="16" height="15" viewBox="0 0 24 22" role="img" aria-label="love" className="shrink-0">
          <path d="M12 21C5 15.6 1 12 1 7.2 1 3.8 3.6 1.2 6.8 1.2c2.1 0 3.9 1.1 5.2 2.9 1.3-1.8 3.1-2.9 5.2-2.9 3.2 0 5.8 2.6 5.8 6 0 4.8-4 8.4-11 13.8z" fill="#E8935C" />
        </svg>
        in the City of Oaks
        <svg width="18" height="20" viewBox="0 0 36 40" aria-hidden="true" className="shrink-0">
          {/* The trunk, branching into the crown */}
          <path d="M16 39V27l-5-5M20 39V27l5-4" stroke="#7A5232" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          {/* The crown: overlapping rounds, like an oak's lobed outline */}
          <g fill="#2E5B3E">
            <circle cx="18" cy="12" r="9" />
            <circle cx="9" cy="16" r="7" />
            <circle cx="27" cy="16" r="7" />
            <circle cx="12" cy="8" r="6" />
            <circle cx="24" cy="8" r="6" />
            <circle cx="18" cy="21" r="6" />
          </g>
          {/* A highlight on the crown, lit from the upper left like the drawings */}
          <circle cx="11" cy="8" r="2.5" fill="#FBF6EE" opacity="0.35" />
        </svg>
      </span>
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
