"use client";
// The free Rapid Fire's results: pitch in your words (tap a word to hear it), the take's pitch line (with the last
// try under it), the numbers, one thing to try, and the rest behind "See more".
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { Ring, TakeLine, WordsView } from "@/components/TakeParts";
import type { FreeTake } from "@/lib/freeTake";
import { WINDOW, clock } from "@/lib/rapidFire";
import { Sage } from "@/components/Characters";

export function Results({
  question,
  take,
  last,
  audioUrl,
  onAgain,
  onAnother,
}: {
  question: string;
  take: FreeTake;
  last: FreeTake | null;
  audioUrl: string | null;
  onAgain: () => void;
  onAnother: () => void;
}) {
  const still = useReducedMotion();
  const audio = useRef<HTMLAudioElement>(null);
  const [more, setMore] = useState(false);

  function playFrom(seconds: number) {
    const el = audio.current;
    if (!el) return;
    el.currentTime = Math.max(0, seconds - 0.15);
    void el.play().catch(() => undefined);
  }

  const tiles = [
    { value: take.perMinute, label: "words a minute" },
    { value: take.pauses.count, label: take.pauses.count === 1 ? "calm pause" : "calm pauses" },
    { value: take.pauseWords, label: take.pauseWords === 1 ? "pause word heard" : "pause words heard" },
  ];
  const changes = last
    ? [
        { label: "Endings that went up", before: last.rising, now: take.rising, better: take.rising < last.rising },
        { label: "Calm pauses", before: last.pauses.count, now: take.pauses.count, better: take.pauses.count > last.pauses.count },
        { label: "Pause words heard", before: last.pauseWords, now: take.pauseWords, better: take.pauseWords < last.pauseWords },
      ].filter((c) => c.before !== c.now)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-sm font-semibold text-muted">Your question</span>
        <h2 className="m-0 mt-1 font-serif text-2xl font-semibold leading-tight sm:text-3xl">{question}</h2>
      </div>

      <div className="flex items-center gap-4">
        <Ring fraction={take.seconds / WINDOW.long} colour={take.window === "inside" ? "#2E5B3E" : "#C26A2C"}>
          {clock(take.seconds)}
        </Ring>
        <span className="text-lg">{take.window === "inside" ? "Inside the 1:00 to 2:00 window." : take.window === "short" ? "A little short of a minute." : "Over two minutes."}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            className="rounded-2xl bg-paper p-4"
            initial={still ? false : { opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.1 + i * 0.1 }}
          >
            <div className="font-serif text-4xl font-semibold tabular-nums">{tile.value}</div>
            <div className="text-sm text-muted">{tile.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Sage, the coach, gives the one tip: proud when this try beat the last, curious otherwise */}
      <motion.div
        className="flex items-end gap-2"
        initial={still ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 0.35 }}
      >
        <Sage size={84} face={changes.some((c) => c.better) ? "proud" : "curious"} className="-mb-1 shrink-0" />
        <p className="m-0 flex-1 rounded-2xl rounded-bl-md bg-peach px-5 py-4 text-lg leading-snug text-peach-ink">
          <b>One thing to try:</b> {take.tip}
        </p>
      </motion.div>

      {changes.length > 0 ? (
        <div className="rounded-2xl border-2 border-line p-4">
          <span className="font-semibold">Last try → this try</span>
          <ul className="m-0 mt-2 flex list-none flex-col gap-1 p-0">
            {changes.map((c) => (
              <li key={c.label} className="flex justify-between gap-3">
                <span>{c.label}</span>
                <span className={`font-bold tabular-nums ${c.better ? "text-accent" : "text-muted"}`}>
                  {c.before} → {c.now}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {take.pitch ? (
        <section aria-labelledby="sounded" className="flex flex-col gap-3 rounded-2xl bg-paper p-4 sm:p-5">
          <h3 id="sounded" className="m-0 text-sm font-semibold text-muted">
            How it sounded · tap any word to hear it
          </h3>
          <WordsView pitch={take.pitch} onPlay={playFrom} />
          <p className="m-0 text-sm text-muted">Higher words: your voice went up. Bold: your peaks. Grey: pause words. Arrows: how each phrase ended.</p>
          <TakeLine pitch={take.pitch} last={last?.pitch ?? null} />
        </section>
      ) : (
        <p className="m-0 rounded-2xl bg-paper p-4 text-muted">We couldn’t read enough of your voice to draw its pitch. Try again a little closer to the microphone, somewhere quiet.</p>
      )}

      {audioUrl ? (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-muted">Listen back</span>
          <audio ref={audio} src={audioUrl} controls className="w-full" />
        </div>
      ) : null}

      <div>
        <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="min-h-11 rounded-full px-1 font-bold text-accent hover:underline">
          {more ? "See less" : "See more"}
        </button>
        {more ? (
          <ul className="m-0 mt-2 flex flex-col gap-2 pl-5 leading-relaxed">
            {take.notes.map((note, i) => (
              <li key={i}>
                {note.parts.map((part, j) => (part.strong ? <b key={j}>{part.text}</b> : <span key={j}>{part.text}</span>))}
              </li>
            ))}
            {take.pauses.count > 0 ? (
              <li>
                {take.pauses.count} {take.pauses.count === 1 ? "pause" : "pauses"} of 0.6 seconds or more; the longest was {take.pauses.longestSeconds.toFixed(1)} s. You were speaking {take.pauses.speakingPercent}% of the time.
              </li>
            ) : (
              <li>No pauses of 0.6 seconds or more.</li>
            )}
            {take.fading.stretches > 0 ? (
              <li>
                {take.fading.faded === 0 ? "You kept your strength to the end of every phrase." : `Your voice faded at the end of ${take.fading.faded} of ${take.fading.stretches} phrases.`}
              </li>
            ) : null}
            <li>{take.words} words at {take.perMinute} a minute.</li>
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.button type="button" onClick={onAgain} whileTap={still ? undefined : { scale: 0.94 }} transition={SPRING} className="min-h-12 rounded-full bg-accent px-6 text-lg font-bold text-white shadow-[0_6px_0_#1f4029]">
          Try it again
        </motion.button>
        <button type="button" onClick={onAnother} className="min-h-12 rounded-full border-2 border-line px-6 text-lg font-bold hover:border-accent">
          Another question
        </button>
      </div>

      <aside className="rounded-2xl border-2 border-dashed border-usual p-4 text-base leading-relaxed">
        <b>How accurate is this?</b> Everything here was measured in your browser. Your browser’s speech recognition often leaves out “um” and “uh”, so the pause-word count is a minimum, and word positions are close but not exact. In the full version, portions of your voice are sent to our server for deeper analysis, which is more accurate: exact word timings and every pause word caught.
      </aside>

      <div className="flex flex-col items-start gap-3 rounded-[1.5rem] bg-ink p-6 text-paper">
        <b className="font-serif text-2xl">The app goes further</b>
        <span className="text-[#D7DED9]">Stories, real conversations, voice drills, your progress week to week, and coaching notes on what you said.</span>
        <BouncyLink href="/waitlist" variant="light">
          Join the waitlist
        </BouncyLink>
      </div>
      <p className="m-0 text-sm text-muted">Nothing was uploaded or saved. Your recording stays in this page and is gone when you leave.</p>
    </div>
  );
}
