"use client";
// The waitlist page's left side: what you'll get (three lines, a lesson tile for each), then the course for the goal
// you just picked, with the blob and Sage beside it. Sage reacts to each goal in a bubble; when you join, Sage is proud
// and the blob hops.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Blob, Sage } from "@/components/Characters";
import { TILES, Tile, type TileName } from "@/components/Tile";
import type { Goal } from "@/lib/waitlist";

// What you'll get, each with a lesson tile as its picture
const PERKS: { tile: TileName; text: string }[] = [
  { tile: "key-word", text: "Short lessons you say out loud" },
  { tile: "point-first", text: "One thing to change, every time" },
  { tile: "buy-a-beat", text: "Your recordings stay on your phone" },
];

// Each goal's course, and what Sage says when you pick it
const FOR_GOAL: Record<Goal, { tile: TileName; line: string }> = {
  "Telling stories": { tile: "stories-that-land", line: "Stories? My favourite." },
  "Small talk": { tile: "beyond-good-you", line: "Small talk? Good choice." },
  "Thinking on my feet": { tile: "stop-freezing", line: "Surprise questions. You'll love them. Eventually." },
  "How I sound": { tile: "voice-lean-in", line: "We'll listen together." },
  "Speaking at work": { tile: "explain-it-simply", line: "Point first. You'll see." },
  "A talk coming up": { tile: "ready-by-the-day", line: "A talk coming up? We'll be ready." },
};

export function WaitlistAside({ goals, joined }: { goals: Goal[]; joined: boolean }) {
  const still = useReducedMotion();
  // The latest goal picked decides the course shown; before any pick, "The run" lectern (no goal's course, so the
  // first pick always changes it)
  const latest = goals[goals.length - 1];
  const pick = latest ? FOR_GOAL[latest] : null;
  const tile: TileName = pick?.tile ?? "speech-run";
  const line = joined ? "See you soon." : (pick?.line ?? "Pick what you'd like to work on.");
  const swap = still ? { duration: 0 } : { type: "spring" as const, stiffness: 260, damping: 18 };

  return (
    <div className="flex flex-col gap-8">
      {/* What you'll get */}
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {PERKS.map((perk) => (
          <li key={perk.text} className="flex items-center gap-3 text-lg font-semibold">
            <Tile name={perk.tile} className="h-12 w-12 shrink-0" />
            {perk.text}
          </li>
        ))}
      </ul>

      {/* The course for your goal, with the blob and Sage beside it */}
      <div className="flex flex-wrap items-end gap-4" aria-live="polite">
        <figure className="m-0 flex flex-col items-center gap-2">
          <div className="relative h-44 w-44">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={tile}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 6 }}
                transition={swap}
              >
                <Tile name={tile} className="h-full w-full drop-shadow-[0_12px_20px_rgba(30,38,32,0.12)]" />
              </motion.div>
            </AnimatePresence>
          </div>
          <figcaption className="text-center text-sm text-muted">
            {latest ? (
              <>
                Your course: <span className="font-semibold text-ink">{TILES[tile].label}</span>
              </>
            ) : (
              "Pick a goal to see its course"
            )}
          </figcaption>
        </figure>
        <div className="relative flex items-end gap-1 pb-8 pt-16" aria-hidden="true">
          {/* Sage's bubble, changing with each pick */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={line}
              className="absolute left-6 top-0 m-0 w-max max-w-[13rem] rounded-2xl rounded-bl-md bg-tint px-4 py-2 font-semibold leading-snug"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={swap}
            >
              {line}
            </motion.p>
          </AnimatePresence>
          <Sage key={joined ? "proud" : "calm"} size={96} face={joined ? "proud" : goals.length ? "curious" : "calm"} />
          <Blob key={joined ? "hop" : "rest"} size={80} face={joined ? "beam" : "ready"} arms={joined} hop={joined && !still} />
        </div>
      </div>
    </div>
  );
}
