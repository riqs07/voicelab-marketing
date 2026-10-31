"use client";
// A guided story, built up in two hops: the flat facts the app gives you, then the nudges that tuck in between them.
// Plays once in view; "Again" replays.
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// "The lost phone", from the app's guided stories
const FACTS = ["You lost your phone.", "You looked everywhere.", "It was in the fridge."];
const NUDGES = ["Where did you look first?", "How did it get in the fridge?", "Who found it?"];
export function GuidedStory() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-120px" });
  const still = useReducedMotion();
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);

  // Facts first, then the nudges
  useEffect(() => {
    if (!seen || still) return;
    const timers = [window.setTimeout(() => setStep(1), 1500)];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [seen, still, run]);

  const shown = still ? 1 : seen ? step : -1;
  const pop = (delay: number) => (still ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 16, delay });

  return (
    <div ref={box} className="flex h-full flex-col gap-5 rounded-[2rem] bg-card p-6 shadow-[0_8px_0_#fce3cf]">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="m-0 font-serif text-2xl font-semibold">You get the facts. You make it a story.</h3>
          <p className="m-0 mt-1 text-muted">Guided story: “The lost phone”</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep(0);
            setRun((r) => r + 1);
          }}
          className="min-h-11 shrink-0 rounded-full px-3 font-bold text-accent hover:underline"
        >
          Again
        </button>
      </div>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {FACTS.map((fact, i) => (
          <li key={`${run}-${fact}`} className="flex flex-col gap-2">
            <motion.span
              className="rounded-xl bg-sand px-4 py-2.5 font-semibold"
              initial={still ? false : { opacity: 0, y: 12 }}
              animate={shown >= 0 ? { opacity: 1, y: 0 } : undefined}
              transition={pop(i * 0.2)}
            >
              {fact}
            </motion.span>
            <motion.span
              className={`ml-6 w-fit rounded-xl bg-peach px-3 py-1.5 text-sm font-bold text-peach-ink ${i % 2 ? "rotate-1" : "-rotate-1"}`}
              initial={still ? false : { opacity: 0, scale: 0.4 }}
              animate={shown >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              transition={pop(i * 0.25)}
            >
              + {NUDGES[i]}
            </motion.span>
          </li>
        ))}
      </ol>
    </div>
  );
}
