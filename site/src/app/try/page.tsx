import type { Metadata } from "next";
import Link from "next/link";
import { ModeInfo } from "@/components/ModeInfo";
import { RapidFire } from "./RapidFire";
import { ReadAloud } from "./ReadAloud";

export const metadata: Metadata = { title: "Try it free · VoiceLab" };

// The two free modes, picked with the toggle at the top (?mode=read opens Read aloud); the "?" beside each explains it
const MODES = [
  {
    id: "rapid",
    href: "/try",
    name: "Rapid Fire",
    heading: "A surprise question. Ten seconds to think. Then talk.",
    intro: "Aim for one to two minutes. Afterwards you’ll see where your voice rose, fell and paused, word by word, with one thing to try. Tap any word to hear it back.",
  },
  {
    id: "read",
    href: "/try?mode=read",
    name: "Read aloud",
    heading: "Pick a famous speech. Read it out loud.",
    intro: "The words light up as you read. Afterwards you’ll see which words came through, your pace and pauses, and how your voice moved, with one thing to try.",
  },
] as const;

export default async function TryPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-8 lg:pt-12">
      <h1 className="sr-only">Try VoiceLab free: {current.name}</h1>
      {/* The two modes: just their names, each with a "?" that explains it */}
      <nav aria-label="Free modes" className="grid grid-cols-2 gap-2 rounded-[1.75rem] bg-sand p-2">
        {MODES.map((m) => {
          const on = m.id === current.id;
          return (
            <div key={m.id} className={`flex items-center gap-2 rounded-[1.4rem] pr-3 transition-all duration-200 ${on ? "bg-accent text-white shadow-[0_6px_0_#1f4029]" : "text-ink hover:bg-white/70"}`}>
              <Link href={m.href} scroll={false} aria-current={on ? "page" : undefined} className="flex-1 px-4 py-4 font-serif text-2xl font-semibold leading-tight text-current no-underline sm:px-6 sm:text-3xl">
                {m.name}
              </Link>
              <ModeInfo name={m.name} heading={m.heading} intro={m.intro} onDark={on} />
            </div>
          );
        })}
      </nav>
      {current.id === "read" ? <ReadAloud /> : <RapidFire />}
    </section>
  );
}
