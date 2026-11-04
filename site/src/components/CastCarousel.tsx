"use client";
// "Meet the cast": the redesign's characters in a row you can swipe, or step through with the arrows. Tap one to say hi:
// it hops once and changes face (Bun, hard to draw out, finally opens its eyes). Everyone's line is always showing.
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { CastMember, type CastName } from "./Cast";

const CAST: { name: CastName; title: string; role: string; line: string; stage: string; blink: { every: number; delay: number } }[] = [
  { name: "you", title: "You", role: "The learner", line: "That’s me. I mean, you!", stage: "bg-peach", blink: { every: 4.6, delay: 0.4 } },
  { name: "sage", title: "Sage", role: "Your coach", line: "One note at a time. That’s all you need.", stage: "bg-tint", blink: { every: 5.4, delay: 1.8 } },
  { name: "friend", title: "The friend", role: "Your conversation partner", line: "Okay, I have to tell someone. I got the job!", stage: "bg-[#d5f0ec]", blink: { every: 3.9, delay: 1.1 } },
  { name: "wobbly", title: "Wobbly", role: "Boss of Stop freezing", line: "Quick one! Best thing you ate this week? Go!", stage: "bg-[#fbdcec]", blink: { every: 3.4, delay: 0.7 } },
  { name: "bun", title: "Bun", role: "Boss of Beyond “good, you?”", line: "Good. You?", stage: "bg-[#fcebc4]", blink: { every: 6, delay: 0 } },
  { name: "squircle", title: "Squircle", role: "Boss of Explain it simply", line: "Point first, please. Then one example.", stage: "bg-[#dde2fa]", blink: { every: 5, delay: 2.6 } },
];

export function CastCarousel() {
  const still = useReducedMotion();
  const row = useRef<HTMLUListElement>(null);
  // Who is saying hi, and a count so tapping the same one again hops again
  const [hi, setHi] = useState<{ name: CastName; n: number } | null>(null);

  // Step the row by one card
  const step = (dir: 1 | -1) => {
    const el = row.current;
    const card = el?.querySelector("li");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 16), behavior: still ? "auto" : "smooth" });
  };

  return (
    <div className="flex flex-col gap-4">
      <ul ref={row} className="-mx-4 my-0 flex snap-x snap-mandatory list-none gap-4 overflow-x-auto px-4 pb-4 pt-2 [scrollbar-width:thin] sm:mx-0 sm:px-0" aria-label="The VoiceLab cast">
        {CAST.map((c) => {
          const saying = hi?.name === c.name;
          return (
            <li key={c.name} className="w-[15rem] shrink-0 snap-start sm:w-[16.5rem]">
              <button
                type="button"
                onClick={() => setHi({ name: c.name, n: (hi?.n ?? 0) + 1 })}
                aria-label={`Say hi to ${c.title}`}
                className="flex h-full w-full cursor-pointer flex-col gap-3 rounded-[1.75rem] border-2 border-line bg-card p-4 text-left transition-transform duration-300 hover:-translate-y-1"
              >
                {/* The character on its own coloured stage, with its line in a speech bubble */}
                <div className={`relative flex h-48 items-end justify-center overflow-hidden rounded-[1.25rem] ${c.stage}`}>
                  <p className="absolute left-3 right-3 top-3 m-0 rounded-2xl bg-card px-3 py-2 text-sm font-bold leading-snug shadow-[0_3px_0_rgba(30,38,32,0.08)]">{c.line}</p>
                  <motion.div
                    key={saying ? `hi-${hi?.n}` : "rest"}
                    initial={false}
                    animate={saying && !still ? { y: [0, -18, 0], scaleY: [0.92, 1.05, 1], scaleX: [1.06, 0.97, 1] } : { y: 0 }}
                    transition={{ duration: 0.6, ease: [0.3, 1.6, 0.5, 1] }}
                    style={{ transformOrigin: "50% 100%" }}
                    className="-mb-3"
                  >
                    <CastMember name={c.name} size={130} hi={saying} blink={c.blink} />
                  </motion.div>
                </div>
                <div className="flex flex-col gap-0.5 px-1">
                  <span className="font-serif text-2xl font-semibold">{c.title}</span>
                  <span className="text-sm font-bold uppercase tracking-wider text-muted">{c.role}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => step(-1)} aria-label="Previous character" className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-line bg-card text-xl font-bold hover:border-accent">
          ‹
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Next character" className="grid size-11 cursor-pointer place-items-center rounded-full border-2 border-line bg-card text-xl font-bold hover:border-accent">
          ›
        </button>
      </div>
    </div>
  );
}
