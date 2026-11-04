// The header and footer on every page
import Link from "next/link";
import { BouncyLink } from "./Bouncy";
import { Blob } from "./Characters";

// The logo: the orange blob, the learner from the app, looking out and blinking now and then; it hops when the logo is
// hovered or focused. Drawn from the same outline and colours as Characters.tsx's Blob, framed tightly for the header
const LOGO_BLOB = "M0 -100C58.8 -100 106 -53.2 106 0C106 50.4 61.6 94 0 94C-58.8 94 -103 53.2 -103 0C-103 -56 -56 -100 0 -100Z";
export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-112 -108 220 210" aria-hidden="true" className="logo-blob block shrink-0 overflow-visible">
      {/* The shaded body, the lit body nudged up and left, and the highlight from the upper left */}
      <path fill="#D9844C" d={LOGO_BLOB} />
      <path fill="#F4A86E" transform="translate(-9 -8) scale(0.93)" d={LOGO_BLOB} />
      <ellipse fill="#FFF6E6" opacity="0.5" cx="-50" cy="-54" rx="20" ry="12" transform="rotate(-35 -50 -54)" />
      {/* The usual face: two eyes that blink, and a small smile */}
      <ellipse className="ch-blink" fill="#1E2320" cx="-23.8" cy="-35.8" rx="9.9" ry="14.8" />
      <ellipse className="ch-blink" fill="#1E2320" cx="23.7" cy="-35.8" rx="9.9" ry="14.8" />
      <path fill="none" stroke="#1E2320" strokeWidth="7.9" strokeLinecap="round" d="M-15.8 -4.1q15.8 13.9 31.7 0" />
    </svg>
  );
}

export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <Link href="/" className="logo flex items-center gap-2.5 text-ink no-underline">
        <LogoMark />
        {/* The name in the app's rounded face, as in the redesign */}
        <span className="font-round text-[25px] font-semibold leading-none">VoiceLab</span>
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
