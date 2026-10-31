"use client";
// Phone-shaped players for three of the app's own lesson clips (copied from the app's public/lessons). Nothing plays by
// itself: tap a phone to play that lesson with sound; starting one pauses the others, so only one ever plays.
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const REELS = [
  { id: "stop-freezing-point", title: "Point first", course: "Stop freezing · Lesson 2" },
  { id: "stories-that-land-middle", title: "Start in the middle", course: "Stories that land · Lesson 2" },
  { id: "beyond-good-you-hook", title: "Answer with a hook", course: "Beyond “good, you?” · Lesson 1" },
];

// A slight, alternating tilt for each phone as it rises into place
const TILT = [-4, 0, 4];

function Phone({ id, title, course, playing, onToggle, onEnded, index }: { id: string; title: string; course: string; playing: boolean; onToggle: () => void; onEnded: () => void; index: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const still = useReducedMotion();

  // Only the one you chose plays, with its voice; the others pause where they are
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) void el.play().catch(() => onEnded());
    else el.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- follows the chosen clip only
  }, [playing]);

  // Stop playing when it scrolls well out of view
  useEffect(() => {
    const el = video.current;
    if (!el || !playing) return;
    const watch = new IntersectionObserver(([entry]) => {
      if (entry && !entry.isIntersecting) onEnded();
    }, { threshold: 0 });
    watch.observe(el);
    return () => watch.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one watcher while playing
  }, [playing]);

  return (
    <motion.figure
      className="m-0 flex flex-col items-center gap-3"
      initial={still ? false : { opacity: 0, y: 60, rotate: TILT[index % TILT.length] }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={still ? undefined : { y: -10, rotate: (TILT[index % TILT.length] ?? 0) / 2 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 200, damping: 13, delay: index * 0.12 }}
    >
      {/* The phone is the play button: tap to play this lesson with sound, tap again to pause */}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={playing}
        aria-label={`${playing ? "Pause" : "Play"} the lesson clip: ${title}`}
        className="group relative block w-full max-w-[18rem] cursor-pointer rounded-[2.4rem] bg-ink p-2.5 shadow-[0_24px_50px_rgba(30,38,32,0.18)]"
      >
        <video
          ref={video}
          className="block aspect-[4/5] w-full rounded-[1.9rem] bg-paper"
          src={`/lessons/${id}.mp4`}
          poster={`/lessons/${id}-poster.jpg`}
          playsInline
          preload="none"
          onEnded={onEnded}
          aria-hidden="true"
        />
        {/* The play button over the paused clip */}
        <span className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${playing ? "opacity-0" : "opacity-100"}`} aria-hidden="true">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-paper/95 shadow-[0_8px_24px_rgba(30,38,32,0.25)] transition-transform duration-300 group-hover:scale-110">
            <svg width="28" height="32" viewBox="0 0 14 16" className="ml-1">
              <path d="M1 1 L13 8 L1 15 Z" fill="#2E5B3E" />
            </svg>
          </span>
        </span>
      </button>
      <figcaption className="flex flex-col items-center gap-1 text-center">
        <span className="font-serif text-xl font-semibold">{title}</span>
        <span className="text-sm text-muted">{course}</span>
        <span className="text-sm font-bold text-accent">{playing ? "Playing · tap to pause" : "Tap to play, sound on"}</span>
      </figcaption>
    </motion.figure>
  );
}

export function Reels() {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
      {REELS.map((reel, i) => (
        <Phone
          key={reel.id}
          {...reel}
          index={i}
          playing={playing === reel.id}
          onToggle={() => setPlaying(playing === reel.id ? null : reel.id)}
          onEnded={() => setPlaying((p) => (p === reel.id ? null : p))}
        />
      ))}
    </div>
  );
}
