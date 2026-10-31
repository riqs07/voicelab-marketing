"use client";
// The hero card: the real pitch of two recordings ("Then the gorilla just stared at me"), measured with the
// app's tracker, drawing itself on a loop. The first try rises at the end, the second falls. "Hear it"
// plays the actual recordings in time with the line.
import { AnimatePresence, motion, useAnimationFrame, useReducedMotion } from "motion/react";
import { useRef, useState, type ReactNode } from "react";
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

// Smooth in and out (for fades and the grey-over)
const ease = (p: number) => {
  const q = clamp01(p);
  return q * q * (3 - 2 * q);
};

type Pt = { x: number; y: number; t: number };
// One cubic piece of a curve: from a, with controls c1 and c2, to b
type Piece = { a: Pt; c1: Pt; c2: Pt; b: Pt };

// The voiced stretches, each softened (a light 1-4-6-4-1 blur, twice, so the tracker's small wobbles don't show) and drawn as a
// smooth curve through its readings (Catmull-Rom as cubic pieces), worked out once per take
function runsOf(take: Take): Piece[][] {
  const runs: Pt[][] = [];
  let run: Pt[] = [];
  take.steps.forEach((v, i) => {
    if (v === null) {
      if (run.length) runs.push(run);
      run = [];
      return;
    }
    run.push({ x: 0, y: v, t: i * TICK });
  });
  if (run.length) runs.push(run);
  const weights = [1, 4, 6, 4, 1];
  return runs.map((r) => {
    // Two passes of the blur, then into drawing units
    const blur = (pts: Pt[]) =>
      pts.map((p, i) => {
        let sum = 0;
        let total = 0;
        weights.forEach((w, k) => {
          const near = pts[i + k - 2];
          if (near) {
            sum += near.y * w;
            total += w;
          }
        });
        return { ...p, y: sum / total };
      });
    const soft = blur(blur(r)).map((p) => ({ x: x(p.t), y: y(p.y), t: p.t }));
    if (soft.length === 1) return [{ a: soft[0]!, c1: soft[0]!, c2: soft[0]!, b: soft[0]! }];
    return soft.slice(0, -1).map((p1, i) => {
      const p0 = soft[i - 1] ?? p1;
      const p2 = soft[i + 1]!;
      const p3 = soft[i + 2] ?? p2;
      return { a: p1, c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6, t: p1.t }, c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6, t: p2.t }, b: p2 };
    });
  });
}

// The first part of a cubic piece, up to fraction f (de Casteljau), so a curve can grow smoothly between readings
function split(c: Piece, f: number): Piece {
  const mix = (p: Pt, q: Pt) => ({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f, t: p.t + (q.t - p.t) * f });
  const ab = mix(c.a, c.c1);
  const bc = mix(c.c1, c.c2);
  const cd = mix(c.c2, c.b);
  const abc = mix(ab, bc);
  const bcd = mix(bc, cd);
  return { a: c.a, c1: ab, c2: abc, b: mix(abc, bcd) };
}

const n = (v: number) => v.toFixed(1);

// The curves up to `upTo` seconds, growing continuously, plus soft dashed bridges over short creaky gaps
function lines(runs: Piece[][], upTo: number) {
  let d = "";
  let bridges = "";
  let head: Pt | null = null;
  for (const run of runs) {
    const start = run[0]!.a;
    if (start.t > upTo) break;
    // A bridge from the last stretch, once this one has begun: a gentle S-curve, level at both ends
    if (head && start.t - head.t < 0.7) {
      const mid = (start.x - head.x) / 2;
      bridges += `M${n(head.x)} ${n(head.y)} C${n(head.x + mid)} ${n(head.y)} ${n(start.x - mid)} ${n(start.y)} ${n(start.x)} ${n(start.y)} `;
    }
    d += `M${n(start.x)} ${n(start.y)} `;
    head = start;
    for (const piece of run) {
      if (piece.a.t >= upTo) break;
      const part = piece.b.t <= upTo ? piece : split(piece, (upTo - piece.a.t) / (piece.b.t - piece.a.t));
      d += `C${n(part.c1.x)} ${n(part.c1.y)} ${n(part.c2.x)} ${n(part.c2.y)} ${n(part.b.x)} ${n(part.b.y)} `;
      head = part.b;
    }
  }
  return { d, bridges, head };
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
const RUNS1 = runsOf(FIRST);
const RUNS2 = runsOf(SECOND);
const END1 = lines(RUNS1, 99).head ?? { x: RIGHT, y: MID };
const END2 = lines(RUNS2, 99).head ?? { x: RIGHT, y: MID };

// The first try's colour, from the accent green to grey as it greys out
function mixColour(p: number) {
  const from = [0x2e, 0x5b, 0x3e];
  const to = [0x8c, 0x97, 0x8f];
  return `rgb(${from.map((f, i) => Math.round(f + ((to[i] ?? f) - f) * p)).join(" ")})`;
}

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
  const line1 = lines(RUNS1, since1);
  const line2 = since2 > 0 ? lines(RUNS2, since2) : { d: "", bridges: "", head: null };
  // The first try greys out smoothly as the second begins
  const grey = ease((t - (T2 - 0.9)) / 0.8);
  const pop1 = backOut((t - (T1 + SPAN - 0.25)) / 0.45);
  const pop2 = backOut((t - (T2 + SPAN - 0.25)) / 0.45);
  const fadeOut = 1 - ease((t - (CYCLE - 0.8)) / 0.7);
  // The playhead dot grows in as a line starts and shrinks away as it finishes
  const dot = (since: number) => 8 * ease(since / 0.2) * (1 - ease((since - SPAN + 0.15) / 0.3));
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
        <span className="text-sm font-semibold text-muted">
          <Swap id={second2 ? "two" : "one"}>{second2 ? "Same phrase · second try" : "One phrase · first try"}</Swap>
        </span>
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
        <path d={line1.bridges} stroke={mixColour(grey)} strokeWidth="3" fill="none" strokeDasharray="5 8" strokeLinecap="round" opacity="0.6" />
        <path d={line1.d} stroke={mixColour(grey)} strokeWidth={7 - 3 * grey} strokeDasharray={grey > 0.5 ? "12 9" : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={1 - 0.3 * grey} />
        <path d={line2.d} stroke="#2E5B3E" strokeWidth="20" opacity="0.12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={line2.bridges} stroke="#2E5B3E" strokeWidth="3" fill="none" strokeDasharray="5 8" strokeLinecap="round" opacity="0.7" />
        <path d={line2.d} stroke="#2E5B3E" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {line1.head && since1 > 0 && since1 < SPAN + 0.2 ? <circle cx={line1.head.x} cy={line1.head.y} r={dot(since1)} fill="#1E2620" /> : null}
        {line2.head && since2 > 0 && since2 < SPAN + 0.2 ? <circle cx={line2.head.x} cy={line2.head.y} r={dot(since2)} fill="#1E2620" /> : null}
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
        <Swap id={second2 ? "two" : "one"}>{second2 ? "Second try: the ending falls, and the story lands." : "First try: the voice goes up at the end, so it sounds like a question."}</Swap>
      </figcaption>
      <audio ref={first} src="/audio/gorilla-1.mp3" preload="none" />
      <audio ref={second} src="/audio/gorilla-2.mp3" preload="none" />
    </figure>
  );
}

// Words that ease out and the new ones ease in when the try changes
function Swap({ id, children }: { id: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span key={id} className="inline-block" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
