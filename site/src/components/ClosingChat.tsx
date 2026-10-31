"use client";
// The blob and Sage on the closing card, now and then trading a few short lines: a little joke about speaking, one
// bubble at a time, the speaker's face changing as they talk. Conversation is the whole point of VoiceLab, so they
// have one. It starts when the card scrolls into view; with reduced motion they just stand together.
// An Easter egg: click (or tap) either of them and they react: the blob beams and hops with its arms up, Sage smiles
// proudly and waves (Sage never hops; that's the blob's).
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Blob, Sage, type BlobFace, type SageFace } from "./Characters";

type Line = { who: "blob" | "sage"; text: string; blob?: BlobFace; sage?: SageFace };

// The little exchanges, in turn. Sage teases gently and never judges; the blob is earnest and gets the last laugh
const CHATS: Line[][] = [
  [
    { who: "blob", text: "Um…", blob: "puzzled" },
    { who: "sage", text: "Take a breath.", sage: "calm" },
    { who: "blob", text: "…Hi!", blob: "talk" },
    { who: "sage", text: "Better.", sage: "proud" },
  ],
  [
    { who: "blob", text: "How many ums was that?", blob: "talk" },
    { who: "sage", text: "Twelve.", sage: "calm" },
    { who: "blob", text: "Um.", blob: "puzzled" },
    { who: "sage", text: "Thirteen.", sage: "proud" },
  ],
  [
    { who: "blob", text: "I paused for three whole seconds!", blob: "wow" },
    { who: "sage", text: "And?", sage: "curious" },
    { who: "blob", text: "Nobody minded!", blob: "beam" },
  ],
  [
    { who: "blob", text: "Did that sound like a question?", blob: "talk" },
    { who: "sage", text: "Did it?", sage: "curious" },
    { who: "blob", text: "…No.", blob: "ready" },
    { who: "sage", text: "Nice landing.", sage: "proud" },
  ],
  [
    { who: "sage", text: "Tell me about your weekend.", sage: "curious" },
    { who: "blob", text: "Good.", blob: "ready" },
    { who: "sage", text: "…", sage: "curious" },
    { who: "blob", text: "I mean: I baked a cake. It fell over.", blob: "talk" },
    { who: "sage", text: "Now that's a story.", sage: "proud" },
  ],
];

// How long each line stays before the next, and the quiet between exchanges (milliseconds)
const LINE_MS = 1900;
const REST_MS = 5000;

export function ClosingChat() {
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { margin: "-80px" });
  const still = useReducedMotion();
  // Which exchange, and how far into it (-1: resting, no bubble)
  const [chat, setChat] = useState(0);
  const [step, setStep] = useState(-1);
  // Who was just clicked, and a count so each click starts the animation again
  const [poked, setPoked] = useState<{ who: "blob" | "sage"; n: number } | null>(null);
  useEffect(() => {
    if (!poked) return;
    const id = window.setTimeout(() => setPoked(null), 2200);
    return () => window.clearTimeout(id);
  }, [poked]);
  const poke = (who: "blob" | "sage") => setPoked((p) => ({ who, n: (p?.n ?? 0) + 1 }));

  useEffect(() => {
    if (!seen || still) return;
    const lines = CHATS[chat] ?? [];
    // Resting: start the exchange after a short wait (shorter the first time)
    if (step === -1) {
      const id = window.setTimeout(() => setStep(0), chat === 0 ? 900 : REST_MS);
      return () => window.clearTimeout(id);
    }
    // The last line: hold it, then rest and move on to the next exchange
    if (step >= lines.length - 1) {
      const id = window.setTimeout(() => {
        setStep(-1);
        setChat((c) => (c + 1) % CHATS.length);
      }, LINE_MS + 900);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), LINE_MS);
    return () => window.clearTimeout(id);
  }, [seen, still, chat, step]);

  const line = step >= 0 ? CHATS[chat]?.[step] : undefined;
  // Each keeps the face of their latest line in this exchange
  const said = step >= 0 ? (CHATS[chat] ?? []).slice(0, step + 1) : [];
  const blobFace = [...said].reverse().find((l) => l.who === "blob")?.blob ?? "ready";
  const sageFace = [...said].reverse().find((l) => l.who === "sage")?.sage ?? "calm";

  return (
    <div ref={box} className="pointer-events-none absolute bottom-10 right-10 hidden items-end gap-2 lg:flex">
      {/* The ground line they stand on */}
      <div className="absolute -bottom-1 left-0 right-0 h-1.5 rounded-full bg-[#2f3a32]" aria-hidden="true" />
      {/* Their bubble, above whoever is speaking, its tail pointing down at them */}
      <AnimatePresence mode="wait">
        {line ? (
          <motion.p
            key={`${chat}-${step}`}
            aria-hidden="true"
            className={`absolute bottom-[calc(100%+0.5rem)] m-0 w-max max-w-[15rem] rounded-2xl bg-paper px-4 py-2 text-base font-semibold text-ink shadow-[0_6px_16px_rgba(0,0,0,0.25)] ${line.who === "blob" ? "left-0 rounded-bl-md" : "right-0 rounded-br-md"}`}
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            style={{ transformOrigin: line.who === "blob" ? "bottom left" : "bottom right" }}
          >
            {line.text}
          </motion.p>
        ) : null}
      </AnimatePresence>
      {/* Each one is a button: a click makes them react */}
      <button type="button" onClick={() => poke("blob")} aria-label="Say hi to the blob" className="pointer-events-auto react-now cursor-pointer rounded-full">
        {poked?.who === "blob" ? (
          <Blob key={`b${poked.n}`} size={150} face="beam" arms hop={!still} />
        ) : (
          <Blob size={150} face={blobFace} talking={line?.who === "blob" && blobFace === "talk"} />
        )}
      </button>
      <button type="button" onClick={() => poke("sage")} aria-label="Say hi to Sage" className="pointer-events-auto react-now cursor-pointer rounded-full">
        {poked?.who === "sage" ? <Sage key={`s${poked.n}`} size={170} face="proud" wave={!still} /> : <Sage size={170} face={sageFace} />}
      </button>
    </div>
  );
}
