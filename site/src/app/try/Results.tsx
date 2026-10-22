"use client";
// The free Rapid Fire's results: pitch in your words (tap a word to hear it), the take's pitch line (with the last
// try under it), the numbers, one thing to try, and the rest behind "See more".
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { isHesitationSound } from "@/core/fillers";
import { textLift, type Phrase, type PitchWords } from "@/core/pitchPhrases";
import type { FreeTake } from "@/lib/freeTake";
import { WINDOW, clock } from "@/lib/rapidFire";

const ENDING = {
  rose: { mark: "↗", label: "rose", className: "text-orange" },
  fell: { mark: "↘", label: "fell", className: "text-accent" },
  held: { mark: "→", label: "held", className: "text-muted" },
} as const;

function Ring({ fraction, colour, children }: { fraction: number; colour: string; children: React.ReactNode }) {
  const size = 72;
  const r = size / 2 - 7;
  const around = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true" className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E4EDE6" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.max(0, Math.min(1, fraction)) * around} ${around}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="relative font-bold tabular-nums">{children}</span>
    </div>
  );
}

// Each word sits a little higher or lower with the voice; bold words were the peaks; grey words are pause words.
// Arrows show how each phrase ended. Tapping a word plays the recording from there.
function WordsView({ pitch, onPlay }: { pitch: PitchWords; onPlay: (seconds: number) => void }) {
  return (
    <p className="m-0 flex flex-col gap-1 text-base sm:text-lg" style={{ lineHeight: 2.6 }}>
      {pitch.phrases.map((phrase: Phrase) => (
        // One phrase per line, as in the app's phrase rows
        <span key={phrase.index} className="block">
          {phrase.pauseBefore !== null && phrase.pauseBefore >= 0.6 ? (
            <span className="mr-2 inline-block rounded-full bg-tint px-2 align-middle text-sm font-bold leading-6 text-accent">{phrase.pauseBefore.toFixed(1)} s pause</span>
          ) : null}
          {phrase.words.map((word, i) => {
            const filler = isHesitationSound(word.w);
            const last = i === phrase.words.length - 1;
            const ending = last && phrase.ending ? ENDING[phrase.ending] : null;
            return (
              <span key={`${phrase.index}-${i}`} className="whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onPlay(word.start)}
                  aria-label={`${word.text}, play from here`}
                  className={`inline-block rounded-md px-0.5 transition-colors hover:bg-tint ${filler ? "italic text-grey underline decoration-usual decoration-dotted decoration-2" : ""} ${word.peak ? "font-bold text-accent" : ""} ${!phrase.flat || filler ? "" : "text-muted"}`}
                  style={{ transform: `translateY(${textLift(word.step)}px)` }}
                >
                  {word.text}
                </button>
                {ending ? (
                  <span className={`ml-0.5 font-bold ${ending.className}`} title={`Ending ${ending.label}`} aria-label={`ending ${ending.label}`}>
                    {ending.mark}
                  </span>
                ) : null}{" "}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}

// The whole take's pitch as one line across, with the last try's line dashed underneath
function TakeLine({ pitch, last }: { pitch: PitchWords; last: PitchWords | null }) {
  const W = 600;
  const H = 120;
  const path = (p: PitchWords) => {
    const n = Math.max(1, p.curve.length - 1);
    let d = "";
    let open = false;
    p.curve.forEach((v, i) => {
      if (v === null) {
        open = false;
        return;
      }
      const x = (i / n) * W;
      const y = H / 2 - Math.max(-12, Math.min(12, v)) * 4.2;
      d += `${open ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
      open = true;
    });
    return d;
  };
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={last ? "Your pitch across this try, with the last try dashed underneath" : "Your pitch across the whole take"}>
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#B9C4BB" strokeWidth="1.5" strokeDasharray="7 6" />
        {last ? <path d={path(last)} stroke="#8C978F" strokeWidth="2.5" fill="none" strokeDasharray="9 7" strokeLinecap="round" /> : null}
        <path d={path(pitch)} stroke="#2E5B3E" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span>Dashed line: your usual pitch</span>
        {last ? <span>Grey dashes: last try</span> : null}
      </figcaption>
    </figure>
  );
}

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
