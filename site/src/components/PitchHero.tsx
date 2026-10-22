"use client";
// The hero card: the real pitch of two recordings ("Then the gorilla just stared at me"), measured with the
// app's tracker, drawing itself on a loop. The first try rises at the end, the second falls. "Hear it"
// plays the actual recordings in time with the line.
import { useAnimationFrame, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import gorilla from "@/data/gorilla.json";

type Take = { label: string; steps: (number | null)[]; words: { text: string; start: number; end: number }[]; badge: string };
const TAKES = gorilla.takes as Take[];
const TICK = gorilla.tickMs / 1000;

// The loop, in seconds
const T1 = 0.5;
const SPAN = 2.95;
const T2 = 5.6;
const CYCLE = 11.5;

// Drawing box
const W = 640;
const H = 330;
const LEFT = 34;
const RIGHT = W - 30;
const MID = 196;
const PER_STEP = 8.6;
const x = (s: number) => LEFT + (s / SPAN) * (RIGHT - LEFT);
const y = (v: number) => MID - Math.max(-13, Math.min(10, v)) * PER_STEP;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
// A pop with a little overshoot
const backOut = (p: number) => {
  const c = 1.9;
  const q = clamp01(p) - 1;
  return 1 + (c + 1) * q * q * q + c * q * q;
};

// The voiced stretches up to `upTo` seconds, plus thin dashed bridges over short creaky gaps
function lines(take: Take, upTo: number) {
  let d = "";
  let bridges = "";
  let open = false;
  let head: { x: number; y: number } | null = null;
  let lastT = -1;
  take.steps.forEach((v, i) => {
    const t = i * TICK;
    if (t > upTo) return;
    if (v === null) {
      open = false;
      return;
    }
    const px = x(t);
    const py = y(v);
    if (!open && head && t - lastT < 0.7) bridges += `M${head.x.toFixed(1)} ${head.y.toFixed(1)} L${px.toFixed(1)} ${py.toFixed(1)} `;
    d += `${open ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)} `;
    open = true;
    head = { x: px, y: py };
    lastT = t;
  });
  return { d, bridges, head: head as { x: number; y: number } | null };
}

// Where a word sits: the middle of its pitch readings, or between its neighbours when it has none
function heightOf(take: Take, start: number, end: number): number {
  const rows = take.steps.map((v, i) => ({ v, t: i * TICK })).filter((r): r is { v: number; t: number } => r.v !== null);
  const inside = rows.filter((r) => r.t >= start && r.t <= end).map((r) => r.v).sort((a, b) => a - b);
  if (inside.length) return inside[Math.floor(inside.length / 2)] ?? 0;
  const before = [...rows].reverse().find((r) => r.t < start);
  const after = rows.find((r) => r.t > end);
  if (before && after) return (before.v + after.v) / 2;
  return (before ?? after)?.v ?? 0;
}

const [FIRST, SECOND] = TAKES as [Take, Take];
const END1 = lines(FIRST, 99).head ?? { x: RIGHT, y: MID };
const END2 = lines(SECOND, 99).head ?? { x: RIGHT, y: MID };

export function PitchHero() {
  const still = useReducedMotion();
  const [t, setT] = useState(still ? CYCLE - 1 : 0);
  // Seconds since the loop (re)started, counted frame by frame
  const elapsed = useRef(0);
  const first = useRef<HTMLAudioElement>(null);
  const second = useRef<HTMLAudioElement>(null);
  const timer = useRef<number | null>(null);

  useAnimationFrame((_time, delta) => {
    if (still) return;
    elapsed.current += delta / 1000;
    setT(elapsed.current % CYCLE);
  });

  // Restart the loop with the two recordings playing in time
  function hearIt() {
    elapsed.current = 0;
    if (timer.current) window.clearTimeout(timer.current);
    const one = first.current;
    const two = second.current;
    if (!one || !two) return;
    two.pause();
    one.currentTime = 0;
    two.currentTime = 0;
    window.setTimeout(() => void one.play().catch(() => undefined), T1 * 1000);
    timer.current = window.setTimeout(() => void two.play().catch(() => undefined), T2 * 1000);
  }

  const since1 = t - T1;
  const since2 = t - T2;
  const line1 = lines(FIRST, since1);
  const line2 = since2 > 0 ? lines(SECOND, since2) : { d: "", bridges: "", head: null };
  const grey = clamp01((t - (T2 - 0.6)) / 0.4);
  const pop1 = backOut((t - (T1 + SPAN - 0.25)) / 0.45);
  const pop2 = backOut((t - (T2 + SPAN - 0.25)) / 0.45);
  const fadeOut = 1 - clamp01((t - (CYCLE - 0.6)) / 0.5);
  const second2 = t >= T2 - 0.4;

  const words = (take: Take, startAt: number, opacity: number, boldLast: boolean) =>
    take.words.map((w, i) => {
      const p = still ? 1 : clamp01((t - (startAt + w.start - 0.04)) / 0.3);
      const hop = backOut(p);
      const last = i === take.words.length - 1;
      return (
        <text
          key={`${take.label}${i}`}
          x={x(w.start)}
          y={y(heightOf(take, w.start, w.end)) - 18 - (1 - hop) * 26}
          fontSize={last ? 23 : 19}
          fontWeight={last && boldLast ? 700 : 400}
          fill="#1E2620"
          opacity={Math.min(p * 2, 1) * opacity}
          style={{ fontFamily: "var(--font-atkinson), sans-serif" }}
        >
          {w.text}
        </text>
      );
    });

  return (
    <figure className="relative m-0 rounded-[2rem] bg-card p-5 shadow-[0_10px_0_#e4ede6,0_20px_40px_rgba(30,38,32,0.08)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-muted">{second2 ? "Same phrase · second try" : "One phrase · first try"}</span>
        <button
          type="button"
          onClick={hearIt}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-tint px-4 font-bold text-accent transition-transform hover:scale-105 active:scale-95"
        >
          <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
            <path d="M1 1 L13 8 L1 15 Z" fill="currentColor" />
          </svg>
          Hear it
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="The pitch of “Then the gorilla just stared at me”, said twice: the first time it rises at the end, the second time it falls." className="mt-2 block w-full" style={{ opacity: still ? 1 : fadeOut }}>
        <line x1={LEFT} y1={MID} x2={RIGHT} y2={MID} stroke="#B9C4BB" strokeWidth="2" strokeDasharray="9 7" />
        {grey < 1 ? <path d={line1.d} stroke="#2E5B3E" strokeWidth="20" opacity={0.12 * (1 - grey)} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        <path d={line1.bridges} stroke={grey > 0 ? "#8C978F" : "#2E5B3E"} strokeWidth="3" fill="none" strokeDasharray="5 8" strokeLinecap="round" opacity="0.6" />
        <path d={line1.d} stroke={grey > 0 ? "#8C978F" : "#2E5B3E"} strokeWidth={grey > 0 ? 4 : 7} strokeDasharray={grey > 0 ? "12 9" : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={1 - 0.3 * grey} />
        <path d={line2.d} stroke="#2E5B3E" strokeWidth="20" opacity="0.12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line2.bridges} stroke="#2E5B3E" strokeWidth="3" fill="none" strokeDasharray="5 8" strokeLinecap="round" opacity="0.7" />
        <path d={line2.d} stroke="#2E5B3E" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {line1.head && since1 > 0 && since1 < SPAN ? <circle cx={line1.head.x} cy={line1.head.y} r="8" fill="#1E2620" /> : null}
        {line2.head && since2 > 0 && since2 < SPAN ? <circle cx={line2.head.x} cy={line2.head.y} r="8" fill="#1E2620" /> : null}
        <circle cx={END1.x} cy={END1.y} r={16 * Math.max(0, pop1)} fill="none" stroke="#C26A2C" strokeWidth="4" opacity={1 - grey} />
        {words(FIRST, T1, 1 - grey, false)}
        {words(SECOND, T2, 1, pop2 > 0.5)}
        <g transform={`translate(${END1.x - 64} ${END1.y - 74}) scale(${Math.max(0, pop1)})`} opacity={1 - grey}>
          <rect x="-8" y="-28" width="96" height="40" rx="20" fill="#FCE3CF" />
          <text x="40" y="0" textAnchor="middle" fontSize="22" fontWeight="700" fill="#7A3A10">↗ Rose</text>
        </g>
        <g transform={`translate(${Math.min(W - 96, END2.x + 14)} ${Math.min(H - 14, END2.y + 40)}) scale(${Math.max(0, pop2)})`}>
          <rect x="-8" y="-28" width="90" height="40" rx="20" fill="#E4EDE6" />
          <text x="37" y="0" textAnchor="middle" fontSize="22" fontWeight="700" fill="#2E5B3E">↘ Fell</text>
        </g>
      </svg>
      <figcaption className="mt-1 min-h-7 text-base text-muted">
        {second2 ? "Second try: the ending falls, and the story lands." : "First try: the voice goes up at the end, so it sounds like a question."}
      </figcaption>
      <audio ref={first} src="/audio/gorilla-1.mp3" preload="none" />
      <audio ref={second} src="/audio/gorilla-2.mp3" preload="none" />
    </figure>
  );
}
