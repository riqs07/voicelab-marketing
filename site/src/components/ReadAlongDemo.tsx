"use client";
// Read aloud, played back: the opening of "We choose to go to the moon" lights up word by word as if being read, the
// way the app follows a reader. One word is skipped, and the end card scores it with the app's own reading check.
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BouncyLink } from "./Bouncy";
import { alignReading } from "@/core/readAlong";

const TEXT = "We choose to go to the moon. We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard.";
const WORDS = TEXT.split(" ");
// The word the reader skips in the replay
const SKIPPED = WORDS.indexOf("decade");
const CHECK = alignReading(TEXT, WORDS.filter((_, i) => i !== SKIPPED).join(" "));
// About 150 words a minute
const WORD_MS = 400;

export function ReadAlongDemo() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { margin: "-120px" });
  const still = useReducedMotion();
  const [at, setAt] = useState(0);

  // Step through the words while the card is on screen, hold on the score, then start again
  useEffect(() => {
    if (!seen || still) return;
    const id = window.setInterval(() => setAt((a) => (a >= WORDS.length + 8 ? 0 : a + 1)), WORD_MS);
    return () => window.clearInterval(id);
  }, [seen, still]);

  const shown = still ? WORDS.length : at;
  const done = shown >= WORDS.length;

  return (
    <div ref={box} className="flex h-full flex-col gap-5 rounded-[2rem] bg-card p-6 shadow-[0_8px_0_#fce3cf]">
      <div>
        <h3 className="m-0 font-serif text-2xl font-semibold">Read the greats out loud</h3>
        <p className="m-0 mt-1 text-muted">Eighteen famous speeches, a part at a time. The words light up as you read, and afterwards you see which ones came through.</p>
      </div>
      <p className="m-0 font-serif text-xl leading-[1.8] sm:text-2xl" aria-label={TEXT}>
        {WORDS.map((word, i) => {
          const missed = done && i === SKIPPED;
          const read = i < shown && i !== SKIPPED;
          const next = !done && i === shown;
          return (
            <span key={i} aria-hidden="true">
              <span className={`rounded-md transition-colors duration-200 ${missed ? "bg-peach px-0.5 text-peach-ink line-through decoration-2" : read ? "text-ink" : "text-usual"} ${next ? "bg-peach text-peach-ink" : ""}`}>{word}</span>{" "}
            </span>
          );
        })}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
        <motion.p
          className="m-0 font-serif text-2xl font-semibold text-accent"
          animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.8 }}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 14 }}
          aria-live="polite"
        >
          {done ? `You read ${CHECK.percentRead}% of the words.` : " "}
        </motion.p>
        <BouncyLink href="/try?mode=read" variant="quiet">
          Try Read aloud free
        </BouncyLink>
      </div>
      <p className="m-0 -mt-2 text-sm text-muted">From “We choose to go to the moon”, John F. Kennedy, 1962.</p>
    </div>
  );
}
