"use client";
// Read aloud's results: how much of the passage was caught (missed words struck through, as in the app), the numbers,
// one thing to try, the last try against this one, how it sounded word by word, and the recording to play back.
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { TakeLine, WordsView } from "@/components/TakeParts";
import { readingHeadline, type Passage, type ReadTake } from "@/lib/readAloud";

export function ReadResults({
  passage,
  take,
  last,
  audioUrl,
  onAgain,
  onOther,
  otherTitle,
}: {
  passage: Passage;
  take: ReadTake;
  last: ReadTake | null;
  audioUrl: string | null;
  onAgain: () => void;
  onOther: () => void;
  otherTitle: string;
}) {
  const still = useReducedMotion();
  const audio = useRef<HTMLAudioElement>(null);
  const [more, setMore] = useState(false);
  const { check } = take;

  function playFrom(seconds: number) {
    const el = audio.current;
    if (!el) return;
    el.currentTime = Math.max(0, seconds - 0.15);
    void el.play().catch(() => undefined);
  }

  const tiles = [
    { value: take.perMinute, label: "words a minute" },
    { value: take.pauses.count, label: take.pauses.count === 1 ? "calm pause" : "calm pauses" },
    { value: check.stoppedEarly ? check.missedWithin : check.missed, label: "words not caught" },
  ];
  const changes = last
    ? [
        { label: "Words caught", before: `${last.check.percentRead}%`, now: `${check.percentRead}%`, better: check.percentRead > last.check.percentRead, same: check.percentRead === last.check.percentRead },
        { label: "Words a minute", before: last.perMinute, now: take.perMinute, better: Math.abs(take.perMinute - 140) < Math.abs(last.perMinute - 140), same: take.perMinute === last.perMinute },
        { label: "Calm pauses", before: last.pauses.count, now: take.pauses.count, better: take.pauses.count > last.pauses.count, same: take.pauses.count === last.pauses.count },
      ].filter((c) => !c.same)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-sm font-semibold text-muted">
          {passage.title} · {passage.source}
        </span>
        <motion.h2
          className="m-0 mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl"
          initial={still ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, stiffness: 300 }}
          data-testid="reading-headline"
        >
          {readingHeadline(check)}
        </motion.h2>
      </div>

      {/* The passage as read: struck-through words weren't heard; dimmed words come after where the reading stopped */}
      <p className="m-0 rounded-2xl bg-paper p-4 font-serif text-lg leading-relaxed sm:p-5 sm:text-xl">
        {check.words.map((word, i) => (
          <span key={i}>
            {check.stoppedEarly && i >= check.readTo ? (
              <span data-read="not-reached" className="text-grey">
                {word.text}
              </span>
            ) : (
              <span data-read={word.read ? "true" : "false"} className={word.read ? "" : "rounded bg-peach px-0.5 text-peach-ink line-through decoration-2"}>
                {word.text}
              </span>
            )}{" "}
          </span>
        ))}
      </p>
      <p className="-mt-3 m-0 text-sm text-muted">
        Struck-through words were not heard. Some may be the speech recognition mishearing you rather than a skipped word.{check.stoppedEarly ? " Grey words come after where you stopped." : ""}
      </p>

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

      <motion.p
        className="m-0 rounded-2xl bg-peach px-5 py-4 text-lg leading-snug text-peach-ink"
        initial={still ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING, delay: 0.35 }}
      >
        <b>One thing to try:</b> {take.tip}
      </motion.p>

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
          <p className="m-0 text-sm text-muted">Higher words: your voice went up. Bold: your peaks. Arrows: how each phrase ended.</p>
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
            <li>
              {check.missed} {check.missed === 1 ? "word" : "words"} not heard, {check.repeated} repeated, {check.extra} extra (pause words and added words).
            </li>
            {take.pauses.count > 0 ? (
              <li>
                {take.pauses.count} {take.pauses.count === 1 ? "pause" : "pauses"} of 0.6 seconds or more; the longest was {take.pauses.longestSeconds.toFixed(1)} s.
              </li>
            ) : (
              <li>No pauses of 0.6 seconds or more.</li>
            )}
            {take.fading.stretches > 0 ? (
              <li>
                {take.fading.faded === 0 ? "You kept your strength to the end of every phrase." : `Your voice faded at the end of ${take.fading.faded} of ${take.fading.stretches} phrases.`}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <motion.button type="button" onClick={onAgain} whileTap={still ? undefined : { scale: 0.94 }} transition={SPRING} className="min-h-12 rounded-full bg-accent px-6 text-lg font-bold text-white shadow-[0_6px_0_#1f4029]">
          Read it again
        </motion.button>
        <button type="button" onClick={onOther} className="min-h-12 rounded-full border-2 border-line px-6 text-lg font-bold hover:border-accent">
          Read “{otherTitle}”
        </button>
      </div>

      <aside className="rounded-2xl border-2 border-dashed border-usual p-4 text-base leading-relaxed">
        <b>How accurate is this?</b> Everything here was measured in your browser. Your browser’s speech recognition sometimes mishears a word you said clearly, and word positions are close but not exact. In the full version, portions of your voice are sent to our server for deeper analysis, which is more accurate: exact word timings and every word checked.
      </aside>

      <div className="flex flex-col items-start gap-3 rounded-[1.5rem] bg-ink p-6 text-paper">
        <b className="font-serif text-2xl">The app goes further</b>
        <span className="text-[#D7DED9]">Eighteen famous speeches read part by part, pause and stress drills, stories, real conversations, and your progress week to week.</span>
        <BouncyLink href="/waitlist" variant="light">
          Join the waitlist
        </BouncyLink>
      </div>
      <p className="m-0 text-sm text-muted">Nothing was uploaded or saved. Your recording stays in this page and is gone when you leave.</p>
    </div>
  );
}
