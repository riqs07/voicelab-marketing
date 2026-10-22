"use client";
// A guided story, built up in three hops: the flat facts the app gives you, the nudges that tuck in between them,
// then the Classic story shape drawn as an arc with the facts placed on it. Plays once in view; "Again" replays.
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// "The lost phone", from the app's guided stories
const FACTS = ["You lost your phone.", "You looked everywhere.", "It was in the fridge."];
const NUDGES = ["Where did you look first?", "How did it get in the fridge?", "Who found it?"];
// The app's Classic shape
const BEATS = ["Where and who", "What went wrong", "The turn", "How it ended", "What it meant"];
// One point per beat on a 100 × 24 grid, centred over each label: up to the turn, then down
const SPOTS = [
  { x: 10, y: 20 },
  { x: 30, y: 14 },
  { x: 50, y: 4 },
  { x: 70, y: 10 },
  { x: 90, y: 18 },
];
// A smooth line through the points (Catmull-Rom turned into curves)
const ARC = SPOTS.map((pt, i) => {
  if (i === 0) return `M${pt.x} ${pt.y}`;
  const a = SPOTS[i - 2] ?? SPOTS[i - 1]!;
  const b = SPOTS[i - 1]!;
  const c = SPOTS[i + 1] ?? pt;
  return `C${b.x + (pt.x - a.x) / 6} ${b.y + (pt.y - a.y) / 6} ${pt.x - (c.x - b.x) / 6} ${pt.y - (c.y - b.y) / 6} ${pt.x} ${pt.y}`;
}).join(" ");

export function GuidedStory() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-120px" });
  const still = useReducedMotion();
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);

  // Facts first, then the nudges, then the shape
  useEffect(() => {
    if (!seen || still) return;
    const timers = [window.setTimeout(() => setStep(1), 1500), window.setTimeout(() => setStep(2), 3300)];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [seen, still, run]);

  const shown = still ? 2 : seen ? step : -1;
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
      {/* The story shape */}
      <div className="mx-auto mt-auto w-full max-w-md">
        <p className="m-0 text-sm font-bold uppercase tracking-wider text-muted">Story shape: Classic</p>
        <div className="relative mt-2">
          <svg viewBox="0 0 100 24" className="block h-auto w-full overflow-visible" aria-hidden="true">
            <motion.path
              key={run}
              d={ARC}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={still ? false : { pathLength: 0 }}
              animate={{ pathLength: shown >= 2 ? 1 : 0 }}
              transition={still ? { duration: 0 } : { duration: 1.2, ease: "easeInOut" }}
            />
          </svg>
          {SPOTS.map((spot, i) => (
            <motion.span
              key={`${run}-${BEATS[i]}`}
              className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-orange"
              style={{ left: `${spot.x}%`, top: `${(spot.y / 24) * 100}%` }}
              initial={still ? false : { scale: 0 }}
              animate={{ scale: shown >= 2 ? 1 : 0 }}
              transition={pop(0.25 + i * 0.22)}
              aria-hidden="true"
            />
          ))}
        </div>
        <ol className="m-0 mt-2 grid list-none grid-cols-5 gap-1 p-0 text-center text-xs font-semibold leading-tight text-muted sm:text-sm">
          {BEATS.map((beat) => (
            <li key={beat}>{beat}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
