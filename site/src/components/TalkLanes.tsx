"use client";
// "Who did the talking?": the app's two-lane conversation chart. Bars spring to each turn's real length
// (from the Talk share video), questions pop in as dots, and the share counts to its value.
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type Turn = { who: "them" | "you"; start: number; seconds: number; question?: boolean };

// Turn lengths measured from the Talk share recordings
const TRIES: { label: string; note: string; turns: Turn[] }[] = [
  {
    label: "First try",
    note: "Mostly you, and nothing asked back.",
    turns: [
      { who: "them", start: 0, seconds: 1.65 },
      { who: "you", start: 1.95, seconds: 5.64 },
    ],
  },
  {
    label: "Second try",
    note: "About even, and you asked back.",
    turns: [
      { who: "them", start: 0, seconds: 1.72 },
      { who: "you", start: 2.02, seconds: 3.4, question: true },
      { who: "them", start: 5.72, seconds: 2.27 },
      { who: "you", start: 8.29, seconds: 2.27, question: true },
    ],
  },
];
const LONGEST = 10.8;

const shareOf = (turns: Turn[]) => {
  const yours = turns.filter((t) => t.who === "you").reduce((a, t) => a + t.seconds, 0);
  const all = turns.reduce((a, t) => a + t.seconds, 0);
  return Math.round((100 * yours) / all);
};

export function TalkLanes() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-120px" });
  const still = useReducedMotion();
  const [pick, setPick] = useState(0);
  const [touched, setTouched] = useState(false);
  const [shown, setShown] = useState(0);
  const tryNow = TRIES[pick] ?? TRIES[0]!;
  const share = shareOf(tryNow.turns);
  const asked = tryNow.turns.filter((t) => t.question).length;

  // Show the second try by itself a few seconds after the first, unless someone has picked one
  useEffect(() => {
    if (!seen || touched || still) return;
    const id = window.setTimeout(() => setPick(1), 4200);
    return () => window.clearTimeout(id);
  }, [seen, touched, still]);

  // Count the share up or down to its value
  useEffect(() => {
    if (!seen || still) return;
    const controls = animate(shown, share, { duration: 0.9, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from wherever the number is now
  }, [share, seen, still]);

  return (
    <div ref={box} className="flex h-full flex-col gap-4 rounded-[2rem] bg-card p-6 shadow-[0_8px_0_#e4ede6]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 className="m-0 font-serif text-2xl font-semibold">Who did the talking?</h3>
        <div role="group" aria-label="Which conversation" className="flex gap-1 rounded-full bg-sand p-1">
          {TRIES.map((t, i) => (
            <button
              key={t.label}
              type="button"
              aria-pressed={pick === i}
              onClick={() => {
                setTouched(true);
                setPick(i);
              }}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${pick === i ? "bg-accent text-white" : "text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="m-0 text-base">Maya asks, “How was your weekend?”</p>
      <div className="flex flex-col gap-3" aria-hidden="true">
        {(["them", "you"] as const).map((who) => (
          <div key={who} className="flex items-center gap-3">
            <span className="w-12 shrink-0 font-semibold text-muted">{who === "you" ? "You" : "Maya"}</span>
            <div className="relative h-9 flex-1">
              {tryNow.turns.map((turn, i) =>
                turn.who === who ? (
                  <motion.div
                    key={`${pick}-${i}`}
                    className={`absolute top-0 h-9 rounded-lg ${who === "you" ? "bg-accent" : "bg-lane"}`}
                    style={{ left: `${(turn.start / LONGEST) * 100}%` }}
                    initial={still || !seen ? false : { width: 0 }}
                    animate={{ width: seen ? `${(turn.seconds / LONGEST) * 100 - 1}%` : 0 }}
                    transition={{ type: "spring", stiffness: 140, damping: 14, delay: turn.start * 0.12 }}
                  >
                    {turn.question ? (
                      <motion.span
                        className="absolute -bottom-3 right-1 h-3.5 w-3.5 rounded-full bg-warm"
                        initial={still ? false : { scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 10, delay: turn.start * 0.12 + 0.5 }}
                      />
                    ) : null}
                  </motion.div>
                ) : null,
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2" aria-live="polite">
        <div>
          <span className="font-serif text-5xl font-semibold tabular-nums">{still ? share : shown}%</span>
          <span className="ml-2 text-muted">of the talking was you</span>
        </div>
        <div>
          <span className="font-serif text-5xl font-semibold tabular-nums">{asked}</span>
          <span className="ml-2 text-muted">{asked === 1 ? "question back" : "questions back"}</span>
        </div>
      </div>
      <motion.p
        key={tryNow.note}
        className={`m-0 rounded-2xl px-4 py-3 font-semibold ${pick === 0 ? "bg-peach text-peach-ink" : "bg-tint text-accent"}`}
        initial={still ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
      >
        {tryNow.note}
      </motion.p>
      <p className="m-0 mt-auto flex items-center gap-2 text-sm text-muted">
        <span className="inline-block h-3 w-3 rounded-full bg-warm" aria-hidden="true" /> You asked a question
      </p>
    </div>
  );
}
