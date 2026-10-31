"use client";
// The small "?" beside a free mode's name: it opens a box where Sage, the coach, explains the mode in a few lines
import { useRef } from "react";
import { Sage } from "./Characters";

export function ModeInfo({ name, heading, intro, onDark = false }: { name: string; heading: string; intro: string; onDark?: boolean }) {
  const box = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => box.current?.showModal()}
        aria-label={`What is ${name}?`}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-lg font-semibold transition-transform hover:scale-110 ${onDark ? "bg-white/20 text-white" : "bg-white text-accent"}`}
      >
        ?
      </button>
      <dialog
        ref={box}
        aria-labelledby={`about-${name}`}
        // A click on the backdrop (outside the box) closes it
        onClick={(e) => e.target === box.current && box.current?.close()}
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-[2rem] bg-card p-0 text-ink shadow-[0_24px_60px_rgba(30,38,32,0.3)] backdrop:bg-ink/40"
      >
        <div className="flex flex-col gap-4 p-7">
          <div className="flex items-end gap-3">
            <Sage size={92} face="calm" className="-mb-2 shrink-0" />
            <h2 id={`about-${name}`} className="m-0 font-serif text-3xl font-semibold leading-tight">
              {name}
            </h2>
          </div>
          <p className="m-0 font-serif text-xl font-semibold leading-snug">{heading}</p>
          <p className="m-0 text-lg leading-relaxed text-muted">{intro}</p>
          <form method="dialog">
            <button className="min-h-12 rounded-full bg-accent px-6 text-lg font-bold text-white">Got it</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
