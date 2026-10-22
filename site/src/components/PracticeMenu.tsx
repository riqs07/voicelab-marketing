"use client";
// The app's Practice menu in a phone: every way to practise, in the app's own groups and words. Rows pop in
// when the phone scrolls into view, then the screen glides down the list and back like a screen recording.
// Rows with a picture further down link to it.
import { animate, motion, useInView, useReducedMotion, type AnimationPlaybackControls } from "motion/react";
import { useEffect, useRef } from "react";

type Row = { name: string; detail: string; icon: keyof typeof ICONS; see?: string };

// Copied from the app's Practice screen (the rows a new person sees)
export const MENU: { title: string; rows: Row[] }[] = [
  {
    title: "Speak on the spot",
    rows: [
      { name: "Rapid Fire", detail: "A surprise question, 1 to 2 minutes", icon: "bolt", see: "/try" },
      { name: "Prepared speech", detail: "Plan for 2 minutes, speak for 2 to 4", icon: "note" },
      { name: "Read aloud", detail: "Famous speeches and passages", icon: "book", see: "#mode-read" },
      { name: "Free talk", detail: "Talk about anything, as long as you like", icon: "mic" },
      { name: "Short speech", detail: "Your topic and a few points, then speak", icon: "list" },
      { name: "Your talk", detail: "Rehearse a talk you’re giving", icon: "stage" },
    ],
  },
  {
    title: "Tell stories",
    rows: [
      { name: "Today’s story", detail: "A true story, 1 to 3 min", icon: "scroll" },
      { name: "Tell one again", detail: "Your stories, a little better each time", icon: "again" },
      { name: "Guided stories", detail: "You get the facts, you make it a story", icon: "sign", see: "#mode-stories" },
    ],
  },
  {
    title: "Everyday conversation",
    rows: [
      { name: "Talk with someone", detail: "Four people, 3 minutes, out loud", icon: "people", see: "#mode-people" },
      { name: "Small talk", detail: "Share, ask back, follow up, end well", icon: "chat" },
      { name: "One moment a day", detail: "A private note of something worth telling", icon: "sun" },
    ],
  },
  {
    title: "Your voice",
    rows: [
      { name: "Warm-up", detail: "Three moves, one minute, nothing recorded", icon: "wind" },
      { name: "Pitch and stress", detail: "Next: Same sentence, different stress", icon: "wave", see: "#mode-voice" },
      { name: "Volume", detail: "Next: Three rooms: the greeting", icon: "speaker" },
      { name: "Pausing", detail: "Pause where the text is marked, 1 min", icon: "pause" },
      { name: "Tone", detail: "Next: I have some news", icon: "mask" },
      { name: "Shadowing", detail: "Next: Ask not", icon: "repeat" },
      { name: "Clear sounds", detail: "Next: Word endings", icon: "aa" },
    ],
  },
];

// Simple line icons, drawn on a 24-unit grid
const ICONS = {
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  note: "M5 3h10l4 4v14H5zM9 11h6M9 15h6",
  book: "M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1zM12 6v14",
  mic: "M9 4a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3",
  list: "M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1",
  stage: "M3 4h18v11H3zM12 15v5M8 20h8",
  scroll: "M7 4h11v13a3 3 0 0 1-3 3H6a3 3 0 0 1 0-6h9M7 4a3 3 0 0 0-3 3",
  again: "M4 12a8 8 0 1 0 3-6M4 4v4h4",
  sign: "M12 3v18M5 6h12l3 3-3 3H5zM8 21h8",
  people: "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3 3-5 6-5s6 2 6 5M14 15c3 0 8 1 8 5",
  chat: "M4 5h16v10H9l-5 4z",
  sun: "M3 18h18M7 18a5 5 0 0 1 10 0M12 6v3M5 11l2 1M19 11l-2 1",
  wind: "M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3",
  wave: "M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0",
  speaker: "M4 9h4l5-4v14l-5-4H4zM17 9a4 4 0 0 1 0 6",
  pause: "M8 5v14M16 5v14",
  repeat: "M4 10V8a3 3 0 0 1 3-3h12l-3-3M20 14v2a3 3 0 0 1-3 3H5l3 3",
  mask: "M5 4h14v7a7 7 0 0 1-14 0zM9 9h.01M15 9h.01M9 14c2 2 4 2 6 0",
  aa: "M3 19 8 5l5 14M5 14h6M15 13a3 3 0 1 1 6 0v6M21 16h-4a2 2 0 0 0 0 3h4",
};

export function PracticeMenu() {
  const box = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "-100px" });
  const still = useReducedMotion();
  const glide = useRef<AnimationPlaybackControls | null>(null);

  // Glide down the list and back up, pausing at each end, for as long as the page is open
  useEffect(() => {
    const screen = box.current;
    const rows = list.current;
    if (!seen || still || !screen || !rows) return;
    const distance = Math.max(0, rows.scrollHeight - screen.clientHeight);
    const controls = animate(rows, { y: [0, 0, -distance, -distance, 0] }, { duration: 18, times: [0, 0.12, 0.5, 0.62, 1], ease: "easeInOut", repeat: Infinity, delay: 1.2 });
    glide.current = controls;
    return () => controls.stop();
  }, [seen, still]);

  let index = 0;
  return (
    <div className="mx-auto w-full max-w-[22rem] rounded-[2.8rem] bg-ink p-3 shadow-[0_24px_60px_-24px_rgba(30,38,32,0.6)]">
      <div className="relative overflow-hidden rounded-[2.2rem] bg-paper">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink" aria-hidden="true" />
        <div
          ref={box}
          // Hold still while someone is pointing at or tabbing through the rows
          onPointerEnter={() => glide.current?.pause()}
          onPointerLeave={() => glide.current?.play()}
          onFocus={() => glide.current?.pause()}
          onBlur={() => glide.current?.play()}
          className={`h-[34rem] ${still ? "overflow-y-auto" : "overflow-hidden"}`}>
          <div ref={list} className="px-4 pb-8 pt-10">
            <p className="m-0 font-serif text-3xl font-semibold">Practice</p>
            <p className="m-0 mt-1 text-sm text-muted">Anything, in any order.</p>
            {MENU.map((group) => (
              <section key={group.title} className="mt-5">
                <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-muted">{group.title}</h3>
                <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
                  {group.rows.map((row) => {
                    const delay = 0.15 + index++ * 0.05;
                    const inner = (
                      <>
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tint text-accent">
                          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d={ICONS[row.icon]} />
                          </svg>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold leading-tight">{row.name}</span>
                          <span className="block truncate text-sm text-muted">{row.detail}</span>
                        </span>
                        {row.see ? <span className="shrink-0 rounded-full bg-peach px-2 py-0.5 text-xs font-bold text-peach-ink">See it</span> : null}
                      </>
                    );
                    return (
                      <motion.li
                        key={row.name}
                        initial={still ? false : { opacity: 0, x: 24, scale: 0.96 }}
                        animate={seen || still ? { opacity: 1, x: 0, scale: 1 } : undefined}
                        transition={{ type: "spring", stiffness: 420, damping: 22, delay }}
                      >
                        {row.see ? (
                          <a href={row.see} className="flex items-center gap-3 rounded-2xl bg-card p-2.5 text-ink no-underline shadow-[0_3px_0_#efe8dc] hover:outline hover:outline-2 hover:outline-accent">
                            {inner}
                          </a>
                        ) : (
                          <div className="flex items-center gap-3 rounded-2xl bg-card p-2.5 shadow-[0_3px_0_#efe8dc]">{inner}</div>
                        )}
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
