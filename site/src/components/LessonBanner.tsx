"use client";
// A band of lessons from the courses, each with its tile from the app, gliding sideways on its own. Scrolling the page
// speeds it up (scrolling back up turns it round), and the tiles lean into the movement and settle when you stop.
// With reduced motion it's a still row you can swipe through.
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef } from "react";
import { COURSE_TILES, HERO_TILES, TILES, Tile, type TileName } from "./Tile";

// Every lesson tile in tiles.json: not the hero's, and not the course tiles
const LESSONS = (Object.keys(TILES) as TileName[]).filter((name) => ![...HERO_TILES, ...COURSE_TILES].includes(name as never));

// Keep a value inside a range, wrapping round (for the endless band)
const wrap = (min: number, max: number, v: number) => {
  const span = max - min;
  return ((((v - min) % span) + span) % span) + min;
};

function Lesson({ name, lean, copy = false }: { name: TileName; lean?: ReturnType<typeof useTransform<number, number>>; copy?: boolean }) {
  return (
    <motion.li aria-hidden={copy || undefined} className="flex w-36 shrink-0 flex-col items-center gap-2 sm:w-40" style={lean ? { skewX: lean } : undefined}>
      <Tile name={name} className="h-32 w-32 sm:h-36 sm:w-36" />
      <span className="text-center text-sm font-semibold leading-tight text-ink">{TILES[name].label}</span>
    </motion.li>
  );
}

export function LessonBanner() {
  const still = useReducedMotion();
  const { scrollY } = useScroll();
  const speed = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  // How much faster scrolling makes it, and which way
  const boost = useTransform(speed, [0, 1000], [0, 4], { clamp: false });
  // The tiles lean into the movement while you scroll
  const lean = useTransform(speed, [-2500, 0, 2500], [7, 0, -7]);
  const base = useMotionValue(0);
  const direction = useRef(1);
  // The band is the list twice over, so it can wrap round seamlessly at half its width
  const x = useTransform(base, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_t, delta) => {
    if (still) return;
    const b = boost.get();
    if (b < 0) direction.current = -1;
    else if (b > 0) direction.current = 1;
    // About 1.6% of the band a second, plus the scroll's push
    let move = direction.current * -1.6 * (delta / 1000);
    move += move * Math.abs(b);
    base.set(base.get() + move);
  });

  if (still) {
    return (
      <ul aria-label="Lessons from the courses" className="m-0 flex list-none gap-4 overflow-x-auto px-4 py-2 sm:px-8">
        {LESSONS.map((name) => (
          <Lesson key={name} name={name} />
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-clip py-2" aria-label="Lessons from the courses" role="region">
      <motion.ul className="m-0 flex w-max list-none gap-4 p-0" style={{ x }}>
        {[...LESSONS, ...LESSONS].map((name, i) => (
          <Lesson key={`${name}-${i}`} name={name} lean={lean} copy={i >= LESSONS.length} />
        ))}
      </motion.ul>
    </div>
  );
}
