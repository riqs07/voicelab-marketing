"use client";
// The header logo: the orange blob and the name, linking home. The blob blinks now and then and hops when the logo is
// hovered or focused (globals.css). An Easter egg on the home page: each click gets a new reaction, in a small speech
// bubble under the blob, a little more each time; it resets after a few quiet seconds. The blob is only ever happy or
// puzzled, never cross, as in the app. With "reduce motion" the bubble and face still change, without the movement.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import { useEffect, useState } from "react";

type Face = "ready" | "happy" | "puzzled";

// The reactions, in order; clicks past the last repeat it
const REACTIONS: { face: Face; line: string; move: TargetAndTransition }[] = [
  { face: "happy", line: "Hi!", move: { y: [0, -7, 0], scaleY: [0.92, 1.06, 1], transition: { duration: 0.55 } } },
  { face: "ready", line: "Um… hello again.", move: { y: [0, 3, 0, 3, 0], transition: { duration: 0.7 } } },
  { face: "puzzled", line: "Are you practising on me?", move: { rotate: [0, -12, -9], transition: { duration: 0.5 } } },
  { face: "happy", line: "That one had a nice pause.", move: { y: [0, -7, 0], scaleY: [0.92, 1.06, 1], transition: { duration: 0.55 } } },
  { face: "happy", line: "Okay, okay. Go record something.", move: { rotate: [0, 360], y: [0, -6, 0], transition: { duration: 0.8, ease: "easeInOut" } } },
];

// How long after the last click the blob settles and the count starts again
const QUIET_MS = 4000;

const OUTLINE = "M0 -100C58.8 -100 106 -53.2 106 0C106 50.4 61.6 94 0 94C-58.8 94 -103 53.2 -103 0C-103 -56 -56 -100 0 -100Z";
const INK = "#1E2320";

// The blob, drawn from the same outline and colours as Characters.tsx's Blob, framed tightly for the header
function LogoBlob({ face }: { face: Face }) {
  return (
    <svg width="38" height="38" viewBox="-112 -108 220 210" aria-hidden="true" className="block overflow-visible">
      {/* The shaded body, the lit body nudged up and left, and the highlight from the upper left */}
      <path fill="#D9844C" d={OUTLINE} />
      <path fill="#F4A86E" transform="translate(-9 -8) scale(0.93)" d={OUTLINE} />
      <ellipse fill="#FFF6E6" opacity="0.5" cx="-50" cy="-54" rx="20" ry="12" transform="rotate(-35 -50 -54)" />
      {face === "happy" && (
        <>
          {/* Smiling eyes and an open grin */}
          <path fill="none" stroke={INK} strokeWidth="7.9" strokeLinecap="round" strokeLinejoin="round" d="M-37.6 -29.9l13.9 -13.9 13.9 13.9M9.9 -29.9l13.9 -13.9 13.9 13.9" />
          <path fill={INK} d="M-23.8 -12h47.5q0 23.7-23.7 23.7t-23.8-23.7z" />
        </>
      )}
      {face === "puzzled" && (
        <>
          {/* One brow up, the eyes glancing aside, a wavy "hmm" mouth */}
          <path fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" d="M12 -66q12 -8 24 -2" />
          <ellipse className="ch-blink" fill={INK} cx="-16" cy="-35.8" rx="9.9" ry="13.5" />
          <ellipse className="ch-blink" fill={INK} cx="30" cy="-35.8" rx="9.9" ry="13.5" />
          <path fill="none" stroke={INK} strokeWidth="7.9" strokeLinecap="round" d="M-12 -2q6 -6 12 0t12 0" />
        </>
      )}
      {face === "ready" && (
        <>
          {/* The usual face: two eyes that blink, and a small smile */}
          <ellipse className="ch-blink" fill={INK} cx="-23.8" cy="-35.8" rx="9.9" ry="14.8" />
          <ellipse className="ch-blink" fill={INK} cx="23.7" cy="-35.8" rx="9.9" ry="14.8" />
          <path fill="none" stroke={INK} strokeWidth="7.9" strokeLinecap="round" d="M-15.8 -4.1q15.8 13.9 31.7 0" />
        </>
      )}
    </svg>
  );
}

export function Logo() {
  const home = usePathname() === "/";
  const still = useReducedMotion();
  // How many times the logo has been clicked in a row on the home page (0: at rest)
  const [clicks, setClicks] = useState(0);
  const reaction = clicks > 0 ? REACTIONS[Math.min(clicks, REACTIONS.length) - 1] : null;

  // Settle after a few quiet seconds
  useEffect(() => {
    if (clicks === 0) return;
    const id = window.setTimeout(() => setClicks(0), QUIET_MS);
    return () => window.clearTimeout(id);
  }, [clicks]);

  return (
    <div className="relative">
      <Link
        href="/"
        // Elsewhere the logo just goes home; on the home page it also gets a reaction
        onClick={() => {
          if (home) setClicks((n) => n + 1);
        }}
        className="logo flex items-center gap-2.5 text-ink no-underline"
      >
        <span className="logo-blob block shrink-0">
          <motion.span key={clicks} className="block" style={{ transformOrigin: "50% 100%" }} animate={reaction && !still ? reaction.move : undefined}>
            <LogoBlob face={reaction?.face ?? "ready"} />
          </motion.span>
        </span>
        {/* The name in the app's rounded face, as in the redesign */}
        <span className="font-round text-[25px] font-semibold leading-none">VoiceLab</span>
      </Link>
      {/* The blob's line, in a bubble just under it, pointing up at it */}
      <AnimatePresence>
        {reaction && (
          <motion.p
            key={clicks}
            role="status"
            initial={still ? false : { opacity: 0, scale: 0.7, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={still ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            style={{ transformOrigin: "18px 0" }}
            className="absolute left-0 top-[calc(100%+12px)] z-40 m-0 w-max max-w-[19rem] rounded-2xl rounded-tl-md border-2 border-line bg-card px-3 py-2 font-round text-base font-semibold leading-snug text-ink shadow-[0_6px_16px_rgba(30,38,32,0.12)]"
          >
            {reaction.line}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
