"use client";
// The hero picture: "The run", the course tile from the app's Stop freezing course (Table-Topics:
// src/components/scenes/tiles/stopFreezing.tsx), drawn large. The blob runs in a headband toward a finish flag, speed
// lines streaking past. It pops in when the page opens, then keeps its own small loops: the stride, the speed lines,
// the flag, a twinkle and a blink. Everything is still for people who ask for less motion.
import { motion, useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

// The app's course-tile colours (light theme), and the site's warm blob
const C = {
  coral: "#EC6A55",
  cream: "#FFF6E6",
  plum: "#8A63E0",
  sky: "#4A68E0",
  sun: "#F4B73B",
  warm: "#F4A86E",
  warmShade: "#D9844C",
  onWarm: "#1E2320",
} as const;

// The blob's one outline (the app's BLOB)
const BLOB = "M0 -100C58.8 -100 106 -53.2 106 0C106 50.4 61.6 94 0 94C-58.8 94 -103 53.2 -103 0C-103 -56 -56 -100 0 -100Z";

// A part that moves on one of the loops below, turning from its own pivot, starting after a delay
function Move({ loop, origin, delay, children }: { loop: string; origin?: string; delay?: number; children: ReactNode }) {
  const style: CSSProperties = { transformOrigin: origin, animationDelay: delay ? `${delay}s` : undefined };
  return (
    <g className={`run-move ${loop}`} style={style}>
      {children}
    </g>
  );
}

// A four-pointed sparkle that twinkles (the app's Twinkle)
function Twinkle({ x, y, size, delay = 0, fill = C.cream }: { x: number; y: number; size: number; delay?: number; fill?: string }) {
  const s = size;
  return (
    <path
      className="run-move run-twinkle"
      style={{ animationDelay: `${delay}s` }}
      fill={fill}
      d={`M${x} ${y - s}l${s * 0.24} ${s * 0.76} ${s * 0.76} ${s * 0.24}-${s * 0.76} ${s * 0.24}-${s * 0.24} ${s * 0.76}-${s * 0.24}-${s * 0.76}-${s * 0.76}-${s * 0.24} ${s * 0.76}-${s * 0.24}z`}
    />
  );
}

// The shaded blob looking ahead (the app's Body with the "side" face), at a place and radius
function Body({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r / 100})`}>
      {/* The shade, then the lit body nudged up and left so the shade is a crescent at the lower right */}
      <path fill={C.warmShade} d={BLOB} />
      <path fill={C.warm} transform="translate(-9 -8) scale(0.93)" d={BLOB} />
      {/* The highlight, lit from the upper left */}
      <ellipse fill={C.cream} opacity="0.5" cx="-50" cy="-54" rx="20" ry="12" transform="rotate(-35 -50 -54)" />
      {/* The face, looking ahead: eyes that blink, a small smile */}
      <g transform="translate(-47.5 -55.6) scale(1.979)" fill={C.onWarm} stroke={C.onWarm} strokeWidth={4} strokeLinecap="round">
        <ellipse className="run-blink" stroke="none" cx="17" cy="10" rx="5" ry="7.5" />
        <ellipse className="run-blink" stroke="none" cx="41" cy="10" rx="5" ry="7.5" />
        <path fill="none" d="M21 26q8 7 16 0" />
      </g>
    </g>
  );
}

export function RunHero() {
  const still = useReducedMotion();
  return (
    <motion.div
      className="mx-auto w-full max-w-[34rem]"
      initial={still ? false : { opacity: 0, scale: 0.86, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 13, delay: 0.15 }}
    >
      {/* The whole tile floats gently */}
      <div className="run-float">
        <svg viewBox="0 0 200 200" role="img" aria-label="The blob running toward a finish flag, in a headband, speed lines streaking past" className="block h-auto w-full overflow-visible drop-shadow-[0_18px_30px_rgba(30,38,32,0.14)]">
          <defs>
            {/* The tile's shape, for keeping the track inside it */}
            <clipPath id="run-tile">
              <rect x="14" y="14" width="172" height="172" rx="34" />
            </clipPath>
          </defs>
          {/* Everything leans together, as the tile does in the app */}
          <g transform="rotate(3 100 100)">
            {/* The ground */}
            <rect fill={C.coral} x="14" y="14" width="172" height="172" rx="34" />
            {/* A soft lighter circle behind, kept inside the tile */}
            <circle fill={C.cream} opacity="0.12" clipPath="url(#run-tile)" cx="44" cy="40" r="56" />
            {/* The track, darker, kept inside the tile, its lane line sliding past */}
            <g clipPath="url(#run-tile)">
              <path fill={C.onWarm} opacity="0.1" d="M14 152H186V186H14z" />
              <path className="run-lane" stroke={C.cream} opacity="0.6" strokeWidth={3} strokeDasharray="10 10" d="M4 168H196" />
            </g>
            {/* The flag's pole */}
            <path stroke={C.cream} strokeWidth={4} strokeLinecap="round" d="M160 70V152" />
            {/* The flag, rippling from the pole */}
            <Move loop="run-flag" origin="160px 70px">
              <rect fill={C.cream} x="160" y="70" width="30" height="22" />
              <path fill={C.plum} d="M160 70h10v11h-10zM180 70h10v11h-10zM170 81h10v11h-10z" />
            </Move>
            {/* Speed lines, one after another */}
            {["M22 92h24", "M14 110h30", "M24 128h20"].map((d, index) => (
              <Move key={d} loop="run-speed" delay={index * 0.35}>
                <path stroke={C.cream} strokeWidth={5} strokeLinecap="round" d={d} />
              </Move>
            ))}
            {/* The back foot */}
            <Move loop="run-patter">
              <ellipse fill={C.warmShade} cx="80" cy="150" rx="11" ry="6" />
            </Move>
            {/* The front foot, out of step */}
            <Move loop="run-patter" delay={0.25}>
              <ellipse fill={C.warmShade} cx="106" cy="150" rx="11" ry="6" />
            </Move>
            {/* The blob and its headband, bouncing along */}
            <Move loop="run-patter" delay={0.12}>
              {/* Leaning forward into the run */}
              <g transform="rotate(10 92 130)">
                <Body x={92} y={110} r={38} />
                {/* The headband */}
                <path stroke={C.sky} strokeWidth={7} strokeLinecap="round" fill="none" d="M58 86q34-14 70 0" />
                {/* Its tails, flying behind */}
                <Move loop="run-tails" origin="58px 87px">
                  <path stroke={C.sky} strokeWidth={5} strokeLinecap="round" d="M58 86l-14-4M58 88l-12 8" />
                </Move>
              </g>
            </Move>
            {/* Sparkles */}
            <Twinkle x={130} y={40} size={9} fill={C.sun} />
            <Twinkle x={34} y={50} size={6} delay={1.8} />
          </g>
        </svg>
      </div>
    </motion.div>
  );
}
