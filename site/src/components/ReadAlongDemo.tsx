"use client";
// Read aloud, played back: a reader reads the opening of "We choose to go to the moon" and the words light up as
// they're heard, worked out by the app's own follow-along code (followReading) from the reader's real word timings.
// The reader skips "decade" on purpose; the app's reading check strikes it and scores the reading at the end.
// "Hear it" plays the voice; otherwise the same reading replays silently at its real pace while the card is on screen.
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BouncyLink } from "./Bouncy";
import { followReading, readingTokens, scriptWords } from "@/core/liveReading";
import { alignReading } from "@/core/readAlong";
import reading from "@/data/readAlongWords.json";

const TEXT = "We choose to go to the moon. We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard.";
const TOKENS = readingTokens(TEXT);
const EXPECTED = scriptWords(TOKENS);
const SPOKEN = reading.words;
const LENGTH = SPOKEN.at(-1)?.end ?? 9;
const CHECK = alignReading(TEXT, SPOKEN.map((w) => w.text).join(" "));
// How long the score stays up before a silent replay starts again
const HOLD = 3.5;

// The words heard by time t (a word counts once it has been said), as the browser would pass them on
const heardBy = (t: number) =>
  SPOKEN.filter((w) => w.end <= t)
    .map((w) => w.text)
    .join(" ");

export function ReadAlongDemo() {
  const box = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const seen = useInView(box, { margin: "-120px" });
  const still = useReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);

  // The clock: the voice's own position while it plays, otherwise a silent replay at the reading's real pace
  useEffect(() => {
    if (still || (!seen && !playing)) return;
    let frame = 0;
    const began = performance.now() - t * 1000;
    const tick = () => {
      const el = audio.current;
      if (playing && el) setT(el.currentTime);
      else setT(((performance.now() - began) / 1000) % (LENGTH + HOLD));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart the clock only when the source changes
  }, [seen, still, playing]);

  function hear() {
    const el = audio.current;
    if (!el) return;
    el.currentTime = 0;
    setT(0);
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }

  const now = still ? LENGTH : t;
  const follow = followReading(EXPECTED, heardBy(now));
  const done = now >= LENGTH;

  return (
    <div ref={box} className="flex h-full flex-col gap-5 rounded-[2rem] bg-card p-6 shadow-[0_8px_0_#fce3cf]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="m-0 font-serif text-2xl font-semibold">Read the greats out loud</h3>
          <p className="m-0 mt-1 text-muted">Eighteen famous speeches, a part at a time. The words light up as you read, and afterwards you see which ones came through.</p>
        </div>
        <motion.button
          type="button"
          onClick={hear}
          whileHover={still ? undefined : { scale: 1.05 }}
          whileTap={still ? undefined : { scale: 0.92 }}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-accent px-5 font-bold text-white shadow-[0_4px_0_#1f4029]"
        >
          <span aria-hidden="true">{playing ? "♪" : "▶"}</span> {playing ? "Listening…" : "Hear it read"}
        </motion.button>
      </div>
      <audio ref={audio} src="/audio/read-along/moon.mp3" preload="none" onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />
      <p className="m-0 font-serif text-xl leading-[1.8] sm:text-2xl" aria-label={TEXT}>
        {TOKENS.map((token, i) => {
          if (token.kind !== "text" || token.word === null) return <span key={i}>{token.kind === "text" ? token.text : " "}</span>;
          const read = follow.read[token.word];
          const missed = done && CHECK.words[token.word] && !CHECK.words[token.word]!.read;
          const next = !done && token.word === follow.next;
          return (
            <span
              key={i}
              aria-hidden="true"
              data-read={read ? "true" : undefined}
              className={`rounded-md transition-colors duration-150 ${missed ? "bg-peach px-0.5 text-peach-ink line-through decoration-2" : read ? "text-ink" : "text-usual"} ${next ? "bg-peach text-peach-ink" : ""}`}
            >
              {token.text}
            </span>
          );
        })}
      </p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
        <motion.p
          className="m-0 font-serif text-2xl font-semibold text-accent"
          animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.8 }}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 14 }}
          aria-live="polite"
        >
          {done ? `You read ${CHECK.percentRead}% of the words.` : " "}
        </motion.p>
        <BouncyLink href="/try?mode=read" variant="quiet">
          Try Read aloud free
        </BouncyLink>
      </div>
      <p className="m-0 -mt-2 text-sm text-muted">From “We choose to go to the moon”, John F. Kennedy, 1962. Read by an AI voice, which skips one word on purpose.</p>
    </div>
  );
}
