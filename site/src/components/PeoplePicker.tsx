"use client";
// "Talk with someone": the app's four people, each with the same personality in every situation. Tap a face to
// hear their real recorded opening line; the situation and how hard they make it can be shuffled.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Blob, type BlobColours, type BlobFace } from "./Characters";
import { playClip } from "@/lib/play";

// From the app's conversation content
const PEOPLE = [
  { id: "maya", name: "Maya", tagline: "Bright and curious. Asks about you, laughs easily", line: "Hi! I don’t think we’ve properly met. I’m Maya, I just joined your team.", colour: "bg-warm" },
  { id: "theo", name: "Theo", tagline: "Quiet and thoughtful. Opens up to good questions", line: "Oh, hi. Are you here for the ten o’clock too?", colour: "bg-accent" },
  { id: "chris", name: "Chris", tagline: "Down-to-earth and dry. Easy-going, tired lately", line: "Hey. Sorry I’m late. It’s been… a week.", colour: "bg-grey" },
  { id: "priya", name: "Priya", tagline: "Bright and expressive. Wears her feelings openly", line: "Oh my gosh, hi! You won’t believe this. I got into the design programme in Copenhagen!", colour: "bg-orange" },
];
// Each person as a blob in their colour, with a face that fits them: Maya beaming, Theo shy, Chris tired and dry, Priya bursting
const LOOKS: Record<string, { face: BlobFace; colours: BlobColours }> = {
  maya: { face: "happy", colours: { body: "#F4A86E", shade: "#D9844C", ink: "#1E2320" } },
  theo: { face: "shy", colours: { body: "#2E5B3E", shade: "#20432C", ink: "#FCFCFB" } },
  chris: { face: "tired", colours: { body: "#8C978F", shade: "#6F7A72", ink: "#1E2320" } },
  priya: { face: "sing", colours: { body: "#C26A2C", shade: "#9E531F", ink: "#FFF6E6" } },
};

const SITUATIONS = ["At the office party", "Monday at the coffee machine", "Early for a meeting", "Before an evening class", "Coffee with a friend", "Walking out of work", "Bumping into each other", "Lunch with a friend"];
const LEVELS = [
  { name: "Easy", blurb: "Warm and chatty, with details to pick up." },
  { name: "Normal", blurb: "As the situation goes." },
  { name: "Hard", blurb: "Short answers, and they may cut in." },
];

export function PeoplePicker() {
  const still = useReducedMotion();
  const [who, setWho] = useState(0);
  const [where, setWhere] = useState(1);
  const [level, setLevel] = useState(1);
  const person = PEOPLE[who] ?? PEOPLE[0]!;
  // Who is saying their line right now (their mouth moves for about as long as the recording)
  const [speaking, setSpeaking] = useState<string | null>(null);
  useEffect(() => {
    if (!speaking) return;
    const id = window.setTimeout(() => setSpeaking(null), 3600);
    return () => window.clearTimeout(id);
  }, [speaking]);
  const hop = still ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 16 };

  return (
    <div className="flex h-full flex-col gap-5 rounded-[2rem] bg-card p-6 shadow-[0_8px_0_#efe8dc]">
      <div>
        <h3 className="m-0 font-serif text-2xl font-semibold">Four people. Out loud. Three minutes.</h3>
        <p className="m-0 mt-1 text-muted">They answer in their own voices and remember who they are. Tap a face to hear them.</p>
      </div>
      <div role="group" aria-label="Who to talk with" className="flex flex-wrap gap-3">
        {PEOPLE.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            aria-pressed={who === i}
            aria-label={`${p.name}: play their opening line`}
            onClick={() => {
              setWho(i);
              setSpeaking(p.id);
              playClip(`/audio/people/${p.id}-01.mp3`);
            }}
            whileHover={still ? undefined : { y: -4, rotate: -3 }}
            whileTap={still ? undefined : { scale: 0.9 }}
            transition={hop}
            className={`flex flex-col items-center rounded-2xl px-1 pb-1 transition-opacity ${who === i ? "bg-sand" : "opacity-60 hover:opacity-100"}`}
          >
            <Blob size={76} face={LOOKS[p.id]?.face} colours={LOOKS[p.id]?.colours} talking={speaking === p.id && !still} className="-my-1" />
            <span className={`text-sm font-bold ${who === i ? "text-ink" : "text-muted"}`}>{p.name}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={person.id}
          initial={still ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={still ? undefined : { opacity: 0, y: -8 }}
          transition={hop}
          className="flex flex-col gap-2"
        >
          <p className="m-0">
            <span className="font-bold">{person.name}.</span> <span className="text-muted">{person.tagline}.</span>
          </p>
          <p className={`relative m-0 w-fit max-w-full rounded-2xl rounded-tl-sm px-4 py-3 font-semibold text-white ${person.colour}`}>“{person.line}”</p>
        </motion.div>
      </AnimatePresence>
      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-muted">Situation</span>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={where}
              className="rounded-full bg-tint px-3 py-1 font-semibold text-accent"
              initial={still ? false : { opacity: 0, y: 14, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={still ? undefined : { opacity: 0, y: -14 }}
              transition={hop}
            >
              {SITUATIONS[where]}
            </motion.span>
          </AnimatePresence>
          <button type="button" onClick={() => setWhere((w) => (w + 1) % SITUATIONS.length)} className="min-h-11 rounded-full px-3 font-bold text-accent hover:underline">
            Shuffle
          </button>
        </div>
        <div role="group" aria-label="How hard" className="flex w-fit gap-1 rounded-full bg-sand p-1">
          {LEVELS.map((l, i) => (
            <button
              key={l.name}
              type="button"
              aria-pressed={level === i}
              onClick={() => setLevel(i)}
              className={`min-h-10 rounded-full px-4 text-sm font-bold transition-colors ${level === i ? "bg-accent text-white" : "text-ink"}`}
            >
              {l.name}
            </button>
          ))}
        </div>
        <p className="m-0 text-sm text-muted" aria-live="polite">
          {LEVELS[level]?.blurb} Afterwards: your share of the talking, the questions you asked back, and one thing to try.
        </p>
      </div>
    </div>
  );
}
