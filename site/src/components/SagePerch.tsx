"use client";
// Sage, the coach, peeking over the top of the Practice menu's phone: it waves once when the section scrolls into view
// and says one short line, then just breathes and blinks while the menu glides
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Sage } from "./Characters";

export function SagePerch({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-120px" });
  const still = useReducedMotion();
  // The wave: the arm goes up as Sage rises into view, waves, and comes back down about four seconds later
  const [waved, setWaved] = useState(false);
  useEffect(() => {
    if (!seen || still) return;
    const id = window.setTimeout(() => setWaved(true), 4200);
    return () => window.clearTimeout(id);
  }, [seen, still]);
  const waving = seen && !still && !waved;
  return (
    <div ref={box} className="relative mx-auto w-full max-w-[22rem] pt-[4.5rem]">
      {/* Sage, behind the phone, so the phone's top edge hides its lower half */}
      <motion.div
        className="absolute right-6 -top-3 z-0"
        aria-hidden="true"
        initial={still ? false : { y: 60 }}
        animate={seen ? { y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.3 }}
      >
        <Sage size={110} face="calm" wave={waving} />
      </motion.div>
      {/* Its line, in a small bubble beside it */}
      <motion.p
        className="absolute right-[8.5rem] top-3 z-20 m-0 rounded-2xl rounded-br-md bg-card px-3 py-2 text-sm font-semibold shadow-[0_6px_16px_rgba(30,38,32,0.12)]"
        initial={still ? false : { opacity: 0, scale: 0.8, y: 6 }}
        animate={seen ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.9 }}
      >
        Pick one. Start small.
      </motion.p>
      {/* The phone, in front */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
