"use client";
// The Rapid Fire topic draw, as in the app (decision 133): other questions flick past from below, fast at first and slowing
// over about a second and a half, then the real one pops in. The area keeps the real question's height throughout.
// With reduced motion the question simply appears.
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

// The gaps between flicks, in milliseconds: quick, then slowing down (about 1.5 s in all)
const GAPS = [70, 70, 80, 90, 100, 115, 135, 160, 195, 240, 300];

export function TopicDraw({ question, pool, onDone, className = "" }: { question: string; pool: readonly string[]; onDone: () => void; className?: string }) {
  const still = useReducedMotion();
  // How many flicks have shown; past the last gap, the real question
  const [step, setStep] = useState(0);
  // The decoys: other questions in a shuffled order, picked once per draw
  const [decoys] = useState(() => {
    const others = pool.filter((q) => q !== question);
    return GAPS.map((_, i) => others[(i * 7 + Math.floor(Math.random() * others.length)) % others.length] ?? question);
  });
  const done = still || step >= GAPS.length;

  useEffect(() => {
    if (done) {
      onDone();
      return;
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), GAPS[step]);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per flick
  }, [step, done]);

  return (
    <div className={`relative overflow-y-clip ${className}`}>
      {/* The real question: invisible during the draw, so the area keeps its height */}
      {done ? (
        <motion.span className="block" initial={still ? false : { opacity: 0, x: -14, scale: 0.97 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 14 }}>
          {question}
        </motion.span>
      ) : (
        <>
          <span className="invisible block" aria-hidden="true">
            {question}
          </span>
          {/* The decoy of the moment, flicking up from below, muted and a little blurred */}
          <motion.span
            key={step}
            aria-hidden="true"
            className="absolute inset-x-0 top-0 block text-muted"
            initial={{ y: "55%", opacity: 0.2, filter: "blur(2px)" }}
            animate={{ y: "0%", opacity: 0.85, filter: "blur(0.5px)" }}
            transition={{ duration: Math.min(0.09, (GAPS[step] ?? 90) / 1000), ease: [0.2, 0.8, 0.2, 1] }}
          >
            {decoys[step]}
          </motion.span>
        </>
      )}
    </div>
  );
}
