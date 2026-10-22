import type { Metadata } from "next";
import Link from "next/link";
import { BounceWords } from "@/components/Bouncy";
import { RapidFire } from "./RapidFire";
import { ReadAloud } from "./ReadAloud";

export const metadata: Metadata = { title: "Try it free · VoiceLab" };

// The two free modes, picked with the big toggle at the top (?mode=read opens Read aloud)
const MODES = [
  {
    id: "rapid",
    href: "/try",
    name: "Rapid Fire",
    line: "A surprise question. Talk for 1 to 2 minutes.",
    heading: "A surprise question. Ten seconds to think. Then talk.",
    intro: "Aim for one to two minutes. Afterwards you’ll see where your voice rose, fell and paused, word by word, with one thing to try. Tap any word to hear it back.",
  },
  {
    id: "read",
    href: "/try?mode=read",
    name: "Read aloud",
    line: "A famous speech. Read it out in about a minute.",
    heading: "Pick a famous speech. Read it out loud.",
    intro: "The words light up as you read. Afterwards you’ll see which words came through, your pace and pauses, and how your voice moved, with one thing to try.",
  },
] as const;

export default async function TryPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-8 lg:pt-12">
      <nav aria-label="Free modes" className="grid grid-cols-2 gap-2 rounded-[1.75rem] bg-sand p-2">
        {MODES.map((m) => {
          const on = m.id === current.id;
          return (
            <Link
              key={m.id}
              href={m.href}
              scroll={false}
              aria-current={on ? "page" : undefined}
              className={`flex flex-col gap-1 rounded-[1.4rem] px-4 py-4 no-underline transition-all duration-200 sm:px-6 sm:py-5 ${on ? "bg-accent text-white shadow-[0_6px_0_#1f4029]" : "text-ink hover:bg-white/70"}`}
            >
              <span className="font-serif text-2xl font-semibold leading-tight sm:text-3xl">{m.name}</span>
              <span className={`text-sm sm:text-base ${on ? "text-[#D7DED9]" : "text-muted"}`}>{m.line}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-3">
        <span className="font-bold text-accent">Free · {current.name}</span>
        <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.08] sm:text-5xl">
          <BounceWords key={current.id} text={current.heading} />
        </h1>
        <p className="m-0 text-lg leading-relaxed text-muted">{current.intro}</p>
      </div>
      {current.id === "read" ? <ReadAloud /> : <RapidFire />}
    </section>
  );
}
