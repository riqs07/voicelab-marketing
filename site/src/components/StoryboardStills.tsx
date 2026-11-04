"use client";
// Five screens from the app's redesign storyboard, in place of the old demo video: what you practise, what you get back,
// why it works, trying it for real, and the change you can hear. The pictures come from scripts/storyboard-stills.mjs.
// On a phone they sit in a row you swipe; on a wide screen all five fan out side by side.
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const STILLS = [
  { file: "practice", title: "Pick what to practise", line: "Speaking on the spot, stories, conversations and your voice, each with its own picture." },
  { file: "good-take", title: "See where you paused", line: "Your words come back with your real pauses marked, then one thing to try." },
  { file: "myth-or-fact", title: "Learn why it works", line: "Short cards from the research. Guess first, then see what they found." },
  { file: "todays-mission", title: "Try it for real", line: "One small thing to do in a real conversation today. Sage checks in tomorrow." },
  { file: "then-and-now", title: "Hear the change", line: "Your first day beside today: play both, and see the numbers that moved." },
];

// A slight lean for each phone, alternating, so the row fans out
const TILT = [-3, 2, -1.5, 2.5, -2];

export function StoryboardStills() {
  const still = useReducedMotion();
  return (
    <ol className="-mx-4 my-0 flex snap-x snap-mandatory list-none gap-5 overflow-x-auto px-4 pb-4 pt-4 [scrollbar-width:thin] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:overflow-visible">
      {STILLS.map((s, i) => (
        <motion.li
          key={s.file}
          className="w-[62vw] max-w-[15rem] shrink-0 snap-center lg:w-auto lg:max-w-none"
          initial={still ? false : { opacity: 0, y: 50, rotate: TILT[i] }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={still ? undefined : { y: -10, rotate: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: i * 0.08 }}
          style={{ rotate: TILT[i] }}
        >
          <figure className="m-0 flex flex-col gap-3">
            <Image
              src={`/stills/${s.file}.png`}
              alt={`The VoiceLab app: ${s.title.toLowerCase()}. ${s.line}`}
              width={600}
              height={1282}
              sizes="(min-width: 1024px) 220px, 62vw"
              className="block h-auto w-full drop-shadow-[0_14px_22px_rgba(30,38,32,0.18)]"
            />
            <figcaption className="px-1">
              <span className="block font-serif text-xl font-semibold leading-tight">{s.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">{s.line}</span>
            </figcaption>
          </figure>
        </motion.li>
      ))}
    </ol>
  );
}
