"use client";
// The voice shape, as in the app (Table-Topics: src/components/script/VoiceShapes.tsx and BlobFace.tsx): a soft warm shape
// with the blob's face that is the recording control. Still before (the start button), faded while waiting, and live while
// you talk (it grows with your voice, takes the timing light's colour and is the stop button).
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { SPRING } from "./Bouncy";

// The face's moods: ready to start, listening while you speak, thinking while it waits
export type ShapeMood = "ready" | "listening" | "thinking";

// The blob's face: two eyes and a mouth, drawn 48 by 34 in the current colour
export function ShapeFace({ mood, className = "" }: { mood: ShapeMood; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 34" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" className={`overflow-visible ${className}`}>
      {/* Ready: open eyes that blink, and a small smile */}
      {mood === "ready" && (
        <>
          <ellipse className="ch-blink" cx="12" cy="10" rx="5" ry="7.5" fill="currentColor" stroke="none" />
          <ellipse className="ch-blink" cx="36" cy="10" rx="5" ry="7.5" fill="currentColor" stroke="none" />
          <path d="M16 26q8 7 16 0" />
        </>
      )}
      {/* Listening: focused eyes, a little round mouth */}
      {mood === "listening" && (
        <>
          <ellipse className="ch-blink" cx="12" cy="11" rx="5.5" ry="4.5" fill="currentColor" stroke="none" />
          <ellipse className="ch-blink" cx="36" cy="11" rx="5.5" ry="4.5" fill="currentColor" stroke="none" />
          <ellipse cx="24" cy="28" rx="4.5" ry="5" fill="currentColor" stroke="none" />
        </>
      )}
      {/* Thinking: eyes glancing up, a flat mouth */}
      {mood === "thinking" && (
        <>
          <circle cx="14" cy="7" r="4.5" fill="currentColor" stroke="none" />
          <circle cx="38" cy="7" r="4.5" fill="currentColor" stroke="none" />
          <path d="M18 28h12" />
        </>
      )}
    </svg>
  );
}

// The words inside a shape: the face, a label and a short detail
function Inside({ mood, label, detail }: { mood: ShapeMood; label: ReactNode; detail?: ReactNode }) {
  return (
    <span className="relative flex max-w-[80%] flex-col items-center gap-0.5 text-center text-ink">
      <ShapeFace mood={mood} className="mb-1.5 w-11" />
      <span className="font-serif text-xl font-semibold leading-tight">{label}</span>
      {detail ? <span className="text-sm leading-tight">{detail}</span> : null}
    </span>
  );
}

// Before recording: the still shape as a round start button, its face ready
export function StartShape({ label, detail, onStart }: { label: string; detail?: string; onStart: () => void }) {
  const still = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onStart}
      whileHover={still ? undefined : { scale: 1.04 }}
      whileTap={still ? undefined : { scale: 0.93 }}
      transition={SPRING}
      className="relative flex size-56 items-center justify-center rounded-full"
    >
      {/* The dashed halo, still */}
      <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-dashed border-warm opacity-60" />
      {/* The shape, slowly changing its outline */}
      <span aria-hidden="true" className="vs-morph absolute inset-4 bg-warm shadow-[0_6px_16px_rgba(30,38,32,0.12)]" />
      <Inside mood="ready" label={label} detail={detail} />
    </motion.button>
  );
}

// While waiting (thinking time, measuring): the faded shape with what is happening, not a button
export function StatusShape({ label, detail, mood = "thinking" }: { label: ReactNode; detail?: ReactNode; mood?: ShapeMood }) {
  return (
    <div role="status" className="relative flex size-56 items-center justify-center rounded-full">
      {/* The dashed halo, turning slowly */}
      <span aria-hidden="true" className="vs-spin absolute inset-0 rounded-full border-2 border-dashed border-warm opacity-60" />
      {/* The shape, faded */}
      <span aria-hidden="true" className="vs-morph absolute inset-4 bg-warm opacity-70" />
      <Inside mood={mood} label={label} detail={detail} />
    </div>
  );
}

// While talking: the live shape, growing with the voice and taking the timing light's colour, with the clock; it is the stop button
export function LiveShape({ level, colour, clock, onStop }: { level: number; colour: string; clock: string; onStop: () => void }) {
  const still = useReducedMotion();
  // How loud, from 0 to 1 (the recorder's level is small: about 0.15 when speaking up)
  const loud = Math.min(1, level * 6);
  // Bigger as the voice gets louder
  const scale = still ? 1 : 0.82 + loud * 0.3;
  return (
    <motion.button type="button" onClick={onStop} aria-label="Stop" whileTap={still ? undefined : { scale: 0.93 }} transition={SPRING} className="relative flex size-64 shrink-0 items-center justify-center rounded-full">
      {/* The dashed halo, turning slowly, in the light's colour */}
      <span aria-hidden="true" className="vs-spin absolute inset-0 rounded-full border-2 border-dashed opacity-60" style={{ borderColor: colour }} />
      {/* The shape, growing with the voice */}
      <span aria-hidden="true" className="vs-morph absolute inset-6 transition-[transform,background-color] duration-150 ease-out" style={{ background: colour, transform: `scale(${scale})` }} />
      {/* The face, the clock and the action */}
      <span className="relative flex flex-col items-center text-ink">
        <ShapeFace mood="listening" className="mb-2 w-12" />
        <span aria-hidden="true" className="font-serif text-4xl font-semibold tabular-nums tracking-tight">
          {clock}
        </span>
        <span className="text-sm font-semibold">Stop</span>
      </span>
    </motion.button>
  );
}
