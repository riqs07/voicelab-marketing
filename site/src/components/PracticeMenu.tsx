"use client";
// The app's new Practice screen in a phone, as drawn in the redesign storyboard (Table-Topics:
// documents/design/redesign/storyboard.html, screen 12): a Rapid Fire quick start, four jobs with pictures, and
// role-play packs, over the tab bar. The cards pop in when the phone scrolls into view, then the screen glides down
// and back like a screen recording. Rapid Fire opens the free one; each job links to its showcase further down.
import { animate, motion, useInView, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

// The storyboard's colours for the phone and its pictures
const P = {
  bg: "#fff7ef",
  card: "#ffffff",
  ink: "#2b2320",
  muted: "#7a6c64",
  line: "#f0e2d6",
  accent: "#3fa66b",
  accentDark: "#2c8050",
  sky: "#4a68e0",
  skyLight: "#8095e9",
  sun: "#f4b73b",
  bloom: "#e86aae",
  leaf: "#7cc46a",
  plum: "#8a63e0",
  coral: "#ec6a55",
  cream: "#fff6e6",
  faceInk: "#2a2420",
} as const;

// The two outlines in these pictures: you (the round) and the friend (an egg)
const ROUND = "M0 -100C58.8 -100 106 -53.2 106 0C106 50.4 61.6 94 0 94C-58.8 94 -103 53.2 -103 0C-103 -56 -56 -100 0 -100Z";
const EGG = "M0 -114C52 -114 92 -42 92 10C92 62 52 94 0 94C-52 94 -92 62 -92 10C-92 -42 -52 -114 0 -114Z";

type Face = "ready" | "happy" | "sing" | "wow";

// A face: two dark eyes and a simple mouth, placed by how low (dy) and how far apart (gap)
function Face({ face, dy = 0, gap = 24 }: { face: Face; dy?: number; gap?: number }) {
  const y = -34 + dy;
  const line = { fill: "none", stroke: P.faceInk, strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 7.5 } as const;
  const arched = `M${-gap - 14} ${y + 5}L${-gap} ${y - 9} ${-gap + 14} ${y + 5}M${gap - 14} ${y + 5}L${gap} ${y - 9} ${gap + 14} ${y + 5}`;
  if (face === "happy")
    return (
      <>
        <path {...line} d={arched} />
        <path fill={P.faceInk} d={`M-23 ${y + 22}h46q0 23 -23 23t-23 -23z`} />
      </>
    );
  if (face === "sing")
    return (
      <>
        <path {...line} d={arched} />
        <ellipse fill={P.faceInk} cx="0" cy={y + 36} rx="12" ry="13" />
      </>
    );
  if (face === "wow")
    return (
      <>
        <circle fill={P.faceInk} cx={-gap} cy={y - 2} r="12" />
        <circle fill={P.faceInk} cx={gap} cy={y - 2} r="12" />
        <circle fill="#fff" cx={-gap + 4} cy={y - 7} r="3.5" />
        <circle fill="#fff" cx={gap + 4} cy={y - 7} r="3.5" />
        <ellipse fill={P.faceInk} cx="0" cy={y + 36} rx="8" ry="10" />
      </>
    );
  return (
    <>
      <ellipse fill={P.faceInk} cx={-gap} cy={y} rx="10" ry="14.5" />
      <ellipse fill={P.faceInk} cx={gap} cy={y} rx="10" ry="14.5" />
      <circle fill="#fff" cx={-gap + 4} cy={y - 6} r="3.4" />
      <circle fill="#fff" cx={gap + 4} cy={y - 6} r="3.4" />
      <path {...line} d={`M-15 ${y + 30}q15 13 30 0`} />
    </>
  );
}

// You or the friend, centred at (x, y) with radius r: the shaded body (lit from the upper left) and a face
function Person({ who, x, y, r, face = "ready" }: { who: "you" | "friend"; x: number; y: number; r: number; face?: Face }) {
  const [shape, body, shade, hl] = who === "you" ? [ROUND, "#e8935c", "#cf7440", 0.5] : [EGG, "#2fb3a4", "#1f8d80", 0.45];
  return (
    <g transform={`translate(${x} ${y}) scale(${r / 100})`}>
      <path fill={shade} d={shape} />
      <path fill={body} transform="translate(-9 -8) scale(0.93)" d={shape} />
      <ellipse fill={P.cream} opacity={hl} cx="-48" cy="-56" rx="18" ry="11" transform="rotate(-35 -48 -56)" />
      {who === "friend" && <path fill="none" stroke={shade} strokeWidth="9" strokeLinecap="round" d="M2 -112q-4 -22 14 -26q14 -2 10 12" />}
      <Face face={face} dy={who === "you" ? 0 : 6} gap={who === "you" ? 24 : 22} />
    </g>
  );
}

// A four-pointed sparkle
function Twinkle({ x, y, s }: { x: number; y: number; s: number }) {
  return <path fill={P.cream} d={`M${x} ${y - s}l${s * 0.24} ${s * 0.76} ${s * 0.76} ${s * 0.24}-${s * 0.76} ${s * 0.24}-${s * 0.24} ${s * 0.76}-${s * 0.24}-${s * 0.76}-${s * 0.76}-${s * 0.24} ${s * 0.76}-${s * 0.24}z`} />;
}

// Each job's one prop, drawn on a 200-unit square
type Prop = "bolt" | "fire" | "chat" | "waves";
function PropArt({ prop }: { prop: Prop }) {
  if (prop === "bolt") return <path d="M150 46 L122 100 h22 l-10 46 34 -60 h-22 z" fill={P.sun} stroke={P.cream} strokeWidth="5" strokeLinejoin="round" />;
  if (prop === "fire")
    return (
      <>
        <path d="M150 58c14 18 24 30 24 46a24 24 0 0 1-48 0c0-12 8-20 12-28 4 10 8 12 12 12 0-10-4-20 0-30z" fill={P.sun} />
        <path d="M128 132h44" stroke={P.cream} strokeWidth="7" strokeLinecap="round" />
      </>
    );
  if (prop === "chat")
    return (
      <>
        <rect x="114" y="40" width="68" height="48" rx="16" fill={P.cream} />
        <path d="M130 86l-6 16 18-14z" fill={P.cream} />
        <circle cx="134" cy="64" r="5" fill={P.bloom} />
        <circle cx="148" cy="64" r="5" fill={P.bloom} />
        <circle cx="162" cy="64" r="5" fill={P.bloom} />
      </>
    );
  return <path d="M140 70q14 24 0 48M156 58q22 36 0 72M172 46q30 48 0 96" stroke={P.cream} strokeWidth="8" fill="none" strokeLinecap="round" />;
}

// A job's picture: its ground colour, a soft circle, its prop and you, cropped to a wide strip
function Scene({ ground, prop, face }: { ground: string; prop: Prop; face: Face }) {
  return (
    <svg viewBox="0 0 200 110" className="block h-[84px] w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="200" height="110" fill={ground} />
      <circle cx="170" cy="8" r="48" fill={P.cream} opacity="0.15" />
      <g transform="translate(6 -20)">
        <PropArt prop={prop} />
      </g>
      <Person who="you" x={72} y={78} r={30} face={face} />
      <Twinkle x={24} y={24} s={8} />
    </svg>
  );
}

// The four jobs, in the app's words, each linking to its showcase on this page
const JOBS: { name: string; detail: string; ground: string; prop: Prop; face: Face; see: string }[] = [
  { name: "Speak on the spot", detail: "5 ways", ground: P.sun, prop: "bolt", face: "ready", see: "#mode-read" },
  { name: "Tell stories", detail: "8 ways", ground: P.coral, prop: "fire", face: "happy", see: "#mode-stories" },
  { name: "Conversations", detail: "Talk, scenes, units", ground: P.bloom, prop: "chat", face: "ready", see: "#mode-people" },
  { name: "Your voice", detail: "Pitch, pace, pauses", ground: P.leaf, prop: "waves", face: "sing", see: "#mode-voice" },
];

// Role-play packs: you and the friend, on the pack's colour
const PACKS = [
  { name: "The Lisbon offer", detail: "News", ground: P.plum },
  { name: "The long week", detail: "Listening", ground: P.sky },
];

// The tab bar's icons, on a 24-unit grid
const TABS: { label: string; icon: ReactNode }[] = [
  { label: "Today", icon: <path strokeLinejoin="round" d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /> },
  { label: "Practice", icon: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></> },
  { label: "Courses", icon: <path strokeLinejoin="round" d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6z" /> },
  { label: "Me", icon: <><circle cx="12" cy="9" r="4" /><path d="M5 20c1-4 4-6 7-6s6 2 7 6" /></> },
];

const cardLook = { background: P.card, border: `2px solid ${P.line}`, boxShadow: `0 4px 0 ${P.line}` } as const;

export function PracticeMenu() {
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-100px" });
  const still = useReducedMotion();
  const glide = useRef<AnimationPlaybackControls | null>(null);

  // Glide down the screen and back up, pausing at each end, for as long as the page is open
  useEffect(() => {
    const screen = box.current;
    const rows = list.current;
    if (!seen || still || !screen || !rows) return;
    const distance = Math.max(0, rows.scrollHeight - screen.clientHeight);
    const controls = animate(rows, { y: [0, 0, -distance, -distance, 0] }, { duration: 12, times: [0, 0.15, 0.45, 0.65, 1], ease: "easeInOut", repeat: Infinity, delay: 1.2 });
    glide.current = controls;
    return () => controls.stop();
  }, [seen, still]);

  // Each card springs in a beat after the one before
  const pop = (i: number) => ({
    initial: still ? false : { opacity: 0, y: 18, scale: 0.94 },
    animate: seen || still ? { opacity: 1, y: 0, scale: 1 } : undefined,
    transition: { type: "spring" as const, stiffness: 380, damping: 20, delay: 0.15 + i * 0.08 },
  });

  return (
    <div className="mx-auto w-full max-w-[22rem] rounded-[2.8rem] bg-ink p-3 shadow-[0_24px_60px_-24px_rgba(30,38,32,0.6)]">
      <div className="relative overflow-hidden rounded-[2.2rem]" style={{ background: P.bg, color: P.ink, fontFamily: "var(--font-nunito), system-ui, sans-serif" }}>
        <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" aria-hidden="true" />
        <div
          ref={box}
          // Hold still while someone is pointing at or tabbing through the cards
          onPointerEnter={() => glide.current?.pause()}
          onPointerLeave={() => glide.current?.play()}
          onFocus={() => glide.current?.pause()}
          onBlur={() => glide.current?.play()}
          className={`h-[34rem] ${still ? "overflow-y-auto" : "overflow-hidden"}`}
        >
          <div ref={list} className="flex flex-col gap-3 px-3.5 pb-24 pt-10">
            <p className="m-0 text-[26px] font-semibold leading-tight" style={{ fontFamily: "var(--font-fredoka), system-ui, sans-serif" }}>
              Practice
            </p>

            {/* The quick start: Rapid Fire, which visitors can try free here */}
            <motion.a
              {...pop(0)}
              href="/try"
              className="flex items-center gap-2.5 rounded-[20px] p-2.5 text-white no-underline"
              style={{ background: P.sky, boxShadow: "0 5px 0 #33479a" }}
            >
              <svg viewBox="0 0 200 200" width="80" height="80" aria-hidden="true" className="shrink-0">
                <g transform="rotate(4 100 100)">
                  <rect x="14" y="14" width="172" height="172" rx="34" fill={P.skyLight} />
                  <circle cx="160" cy="36" r="54" fill={P.cream} opacity="0.16" />
                </g>
                <PropArt prop="bolt" />
                <Person who="you" x={86} y={132} r={38} face="wow" />
                <Twinkle x={42} y={48} s={10} />
              </svg>
              <span className="flex flex-col items-start">
                <span className="text-[10.5px] font-extrabold uppercase tracking-[0.07em] text-white/80">Quick start · 1–2 min</span>
                <span className="text-[17px] font-semibold leading-tight" style={{ fontFamily: "var(--font-fredoka), system-ui, sans-serif" }}>
                  Rapid Fire
                </span>
                <span className="mt-1.5 rounded-[11px] bg-white px-3.5 py-1.5 text-[13px] font-semibold uppercase tracking-[0.03em]" style={{ color: P.sky, boxShadow: "0 4px 0 #2b3c85", fontFamily: "var(--font-fredoka), system-ui, sans-serif" }}>
                  Go
                </span>
              </span>
            </motion.a>

            {/* The four jobs, as picture tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              {JOBS.map((job, i) => (
                <motion.a key={job.name} {...pop(i + 1)} href={job.see} className="flex min-w-0 flex-col gap-1 rounded-[20px] p-2 no-underline hover:outline hover:outline-2 hover:outline-accent" style={{ ...cardLook, color: P.ink }}>
                  <span className="block overflow-hidden rounded-[13px]">
                    <Scene ground={job.ground} prop={job.prop} face={job.face} />
                  </span>
                  <span className="text-[13.5px] font-semibold leading-tight" style={{ fontFamily: "var(--font-fredoka), system-ui, sans-serif" }}>
                    {job.name}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: P.muted }}>
                    {job.detail}
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Role-play packs: you and the friend */}
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.07em]" style={{ color: P.muted }}>
              Role play
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PACKS.map((pack, i) => (
                <motion.div key={pack.name} {...pop(i + 5)} className="flex min-w-0 flex-col gap-1 rounded-[20px] p-2" style={cardLook}>
                  <svg viewBox="0 0 200 110" className="block h-[70px] w-full overflow-hidden rounded-[13px]" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                    <rect width="200" height="110" fill={pack.ground} />
                    <Person who="you" x={64} y={86} r={26} />
                    <Person who="friend" x={132} y={84} r={26} face="happy" />
                  </svg>
                  <span className="text-[13.5px] font-semibold leading-tight" style={{ fontFamily: "var(--font-fredoka), system-ui, sans-serif" }}>
                    {pack.name}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: P.muted }}>
                    {pack.detail}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* The tab bar stays put while the screen glides */}
        <nav aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 flex justify-around px-1 pb-3.5 pt-2" style={{ background: P.card, borderTop: `2px solid ${P.line}` }}>
          {TABS.map((tab) => {
            const on = tab.label === "Practice";
            return (
              <span key={tab.label} className="flex min-w-14 flex-col items-center gap-0.5 text-[10.5px] font-extrabold" style={{ color: on ? P.accent : P.muted }}>
                <span className="grid h-6 w-[38px] place-items-center rounded-[9px]" style={{ background: on ? "#3fa66b2e" : "transparent" }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    {tab.icon}
                  </svg>
                </span>
                {tab.label}
              </span>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
