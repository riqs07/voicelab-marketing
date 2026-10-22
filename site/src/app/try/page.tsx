import type { Metadata } from "next";
import { BounceWords } from "@/components/Bouncy";
import { RapidFire } from "./RapidFire";

export const metadata: Metadata = { title: "Try a free Rapid Fire · VoiceLab" };

export default function TryPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-8 lg:pt-12">
      <div className="flex flex-col gap-3">
        <span className="font-bold text-accent">Free · Rapid Fire</span>
        <h1 className="m-0 font-serif text-4xl font-semibold leading-[1.08] sm:text-5xl">
          <BounceWords text="A surprise question. Ten seconds to think. Then talk." />
        </h1>
        <p className="m-0 text-lg leading-relaxed text-muted">Aim for one to two minutes. Afterwards you’ll see your time, your pace, your pause words, and one thing to try.</p>
      </div>
      <RapidFire />
    </section>
  );
}
