"use client";
// "Um rain": when the card scrolls into view, each pause word from a real 20-second recording drops into a jar
// with a bounce, the counter ticks up, and the total lands. "Again" replays it.
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import words from "@/data/umWords.json";

const PAUSE = /^(um|uh|like)\W*$/i;
const UMS = words.rushed.filter((w) => PAUSE.test(w.text)).map((w) => w.text.replace(/\W+$/, ""));
const SECONDS = Math.floor((words.rushed.at(-1)?.end ?? 0) - (words.rushed[0]?.start ?? 0));
const PER_ROW = 4;
const GAP = 0.32;

export function UmJar() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-120px" });
  const still = useReducedMotion();
  const [run, setRun] = useState(0);
  const [landed, setLanded] = useState(0);

  // Count up as each one lands
  useEffect(() => {
    if (still || !seen) return;
    const timers = UMS.map((_, i) => window.setTimeout(() => setLanded(i + 1), (i * GAP + 0.55) * 1000));
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [seen, run, still]);

  // People who asked for less motion see the full jar straight away
  const count = still ? UMS.length : landed;
  const done = count === UMS.length;

  return (
    <div ref={box} className="flex h-full flex-col gap-4 rounded-[2rem] bg-card p-6 shadow-[0_8px_0_#fce3cf]">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="m-0 font-serif text-2xl font-semibold">Um rain</h3>
        <button
          type="button"
          onClick={() => {
            setLanded(0);
            setRun((r) => r + 1);
          }} className="min-h-11 rounded-full px-3 font-bold text-accent hover:underline">
          Again
        </button>
      </div>
      <p className="m-0 text-base leading-relaxed">
        “So, <mark className="rounded bg-peach px-1 text-peach-ink">um</mark>, the plan was to launch on Monday, and, <mark className="rounded bg-peach px-1 text-peach-ink">uh</mark>, we thought the team was ready, but, <mark className="rounded bg-peach px-1 text-peach-ink">um</mark>…”
      </p>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div aria-live="polite">
          <span className="font-serif text-6xl font-semibold tabular-nums text-orange">{count}</span>
          <span className="ml-2 text-muted">{count === 1 ? "pause word" : "pause words"}</span>
        </div>
        {/* The jar */}
        <div className="relative h-40 w-48 shrink-0 rounded-b-[2rem] border-4 border-t-0 border-muted bg-white/60" aria-hidden="true">
          <div className="absolute -left-2 -right-2 -top-1 h-1.5 rounded-full bg-muted" />
          {seen || still
            ? UMS.map((label, i) => (
                <motion.span
                  key={`${run}-${i}`}
                  className="absolute rounded-full bg-warm px-2.5 py-0.5 text-sm font-bold text-peach-ink"
                  style={{ left: 6 + (i % PER_ROW) * 44, bottom: 8 + Math.floor(i / PER_ROW) * 30 }}
                  initial={still ? false : { y: -260, opacity: 0, rotate: 0 }}
                  animate={{ y: 0, opacity: 1, rotate: ((i * 37) % 17) - 8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 11, delay: i * GAP }}
                >
                  {label}
                </motion.span>
              ))
            : null}
        </div>
      </div>
      <AnimatePresence>
        {done ? (
          <motion.p
            key={`done-${run}`}
            className="m-0 font-serif text-2xl font-semibold"
            initial={still ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
          >
            {UMS.length} pause words in {SECONDS} seconds.
          </motion.p>
        ) : null}
      </AnimatePresence>
      <p className="m-0 mt-auto text-sm text-muted">Counted in a real recording. VoiceLab marks every one in your take, so you can swap them for a pause.</p>
    </div>
  );
}
