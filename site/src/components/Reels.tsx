"use client";
// Phone-shaped players for three of the app's own lesson clips (copied from the app's public/lessons): they play
// silently while on screen and pause when they leave. "Sound on" unmutes one at a time.
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const REELS = [
  { id: "stop-freezing-point", title: "Point first", course: "Stop freezing · Lesson 2" },
  { id: "stories-that-land-middle", title: "Start in the middle", course: "Stories that land · Lesson 2" },
  { id: "beyond-good-you-hook", title: "Answer with a hook", course: "Beyond “good, you?” · Lesson 1" },
];

// A slight, alternating tilt for each phone as it rises into place
const TILT = [-4, 0, 4];

function Phone({ id, title, course, loud, onSound, index }: { id: string; title: string; course: string; loud: boolean; onSound: () => void; index: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const still = useReducedMotion();

  // Play only while on screen (and never by itself for people who asked for less motion)
  useEffect(() => {
    const el = video.current;
    if (!el || still) return;
    const watch = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void el.play().catch(() => undefined);
      else el.pause();
    }, { threshold: 0.4 });
    watch.observe(el);
    return () => watch.disconnect();
  }, [still]);

  useEffect(() => {
    if (video.current) video.current.muted = !loud;
    if (loud) void video.current?.play().catch(() => undefined);
  }, [loud]);

  return (
    <motion.figure
      className="m-0 flex flex-col items-center gap-3"
      initial={still ? false : { opacity: 0, y: 60, rotate: TILT[index % TILT.length] }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={still ? undefined : { y: -10, rotate: (TILT[index % TILT.length] ?? 0) / 2 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 200, damping: 13, delay: index * 0.12 }}
    >
      <div className="w-full max-w-[18rem] rounded-[2.4rem] bg-ink p-2.5 shadow-[0_24px_50px_rgba(30,38,32,0.18)]">
        <video
          ref={video}
          className="block aspect-[4/5] w-full rounded-[1.9rem] bg-paper"
          src={`/lessons/${id}.mp4`}
          poster={`/lessons/${id}-poster.jpg`}
          muted
          loop
          playsInline
          preload="none"
          aria-label={`Lesson clip: ${title}`}
          controls={still ?? false}
        />
      </div>
      <figcaption className="flex flex-col items-center gap-1 text-center">
        <span className="font-serif text-xl font-semibold">{title}</span>
        <span className="text-sm text-muted">{course}</span>
        <button type="button" onClick={onSound} aria-pressed={loud} className="min-h-11 rounded-full px-3 text-sm font-bold text-accent hover:underline">
          {loud ? "Sound off" : "Sound on"}
        </button>
      </figcaption>
    </motion.figure>
  );
}

export function Reels() {
  const [loud, setLoud] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
      {REELS.map((reel, i) => (
        <Phone key={reel.id} {...reel} index={i} loud={loud === reel.id} onSound={() => setLoud(loud === reel.id ? null : reel.id)} />
      ))}
    </div>
  );
}
