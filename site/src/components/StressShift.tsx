"use client";
// "Same sentence, different stress" from the Pitch and stress drills: one sentence, and the meaning moves with
// the stressed word. The stressed word jumps up on a taller bar; it steps through on its own when it scrolls
// into view, and tapping a take plays the real recording from the Stress shift video.
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { playClip } from "@/lib/play";

const WORDS = ["I", "didn’t", "say", "she", "stole", "it."];
const TAKES = [
  { stress: 0, meaning: "Someone else said it." },
  { stress: 2, meaning: "I only hinted it." },
  { stress: 3, meaning: "Someone else did." },
  { stress: 4, meaning: "She borrowed it." },
  { stress: 5, meaning: "She stole something else." },
];

export function StressShift() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-120px" });
  const still = useReducedMotion();
  const [pick, setPick] = useState(0);
  const [touched, setTouched] = useState(false);
  const take = TAKES[pick] ?? TAKES[0]!;

  // Step through the takes until someone picks one
  useEffect(() => {
    if (!seen || touched || still) return;
    const id = window.setInterval(() => setPick((p) => (p + 1) % TAKES.length), 2600);
    return () => window.clearInterval(id);
  }, [seen, touched, still]);

  return (
    <div ref={box} className="flex h-full flex-col gap-5 rounded-[2rem] bg-card p-6 shadow-[0_8px_0_#e4ede6]">
      <div>
        <h3 className="m-0 font-serif text-2xl font-semibold">One sentence, five meanings</h3>
        <p className="m-0 mt-1 text-muted">Lift a different word each time. VoiceLab shows whether your highest pitch landed on the word you meant. Tap a take to hear it.</p>
      </div>
      {/* Bars for how high each word went, with the word under it */}
      <div className="flex items-end justify-between gap-1 sm:gap-2" aria-hidden="true">
        {WORDS.map((word, i) => {
          const lifted = i === take.stress;
          return (
            <div key={word} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end justify-center">
                <motion.div
                  className={`w-full max-w-10 rounded-t-xl ${lifted ? "bg-orange" : "bg-usual"}`}
                  animate={{ height: lifted ? "100%" : `${28 + ((i * 17) % 20)}%` }}
                  transition={still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 13 }}
                />
              </div>
              <motion.span
                className={`font-serif text-lg font-semibold sm:text-2xl ${lifted ? "text-orange" : "text-ink"}`}
                animate={{ y: lifted ? -4 : 0, scale: lifted ? 1.18 : 1 }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 12 }}
              >
                {word}
              </motion.span>
            </div>
          );
        })}
      </div>
      <motion.p
        key={take.meaning}
        className="m-0 rounded-2xl bg-peach px-4 py-3 text-lg font-semibold text-peach-ink"
        initial={still ? false : { opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        aria-live="polite"
      >
        “{WORDS.map((w, i) => (i === take.stress ? w.toUpperCase() : w)).join(" ")}” means: {take.meaning}
      </motion.p>
      <div role="group" aria-label="Hear a take" className="mt-auto flex flex-wrap gap-2">
        {TAKES.map((t, i) => (
          <button
            key={t.stress}
            type="button"
            aria-pressed={pick === i}
            onClick={() => {
              setTouched(true);
              setPick(i);
              playClip(`/audio/stress-shift/s${i + 1}.mp3`);
            }}
            className={`min-h-11 rounded-full px-4 font-bold transition-colors ${pick === i ? "bg-accent text-white" : "bg-sand text-ink hover:bg-tint"}`}
          >
            ▶ “{WORDS[t.stress]?.replace(/\W+$/, "")}”
          </button>
        ))}
      </div>
    </div>
  );
}
