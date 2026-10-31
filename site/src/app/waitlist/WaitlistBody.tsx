"use client";
// The waitlist page's two sides, sharing what you've picked: the form on the right tells the left which goals are
// ticked and when you've joined, so the course tile and the mascots can react
import { useState } from "react";
import { BounceWords } from "@/components/Bouncy";
import type { Goal } from "@/lib/waitlist";
import { WaitlistAside } from "./WaitlistAside";
import { WaitlistForm } from "./WaitlistForm";

export function WaitlistBody() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [joined, setJoined] = useState(false);
  return (
    <section className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-6 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:pt-12">
      <div className="flex flex-col gap-5">
        <h1 className="m-0 font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl">
          <BounceWords text="Join the waitlist." />
        </h1>
        <p className="m-0 max-w-md text-lg leading-relaxed text-muted">VoiceLab is being tested now. Leave your email and we’ll tell you the day it opens.</p>
      </div>
      {/* On a computer the form sits on the right across both rows; on a phone it comes straight after the heading */}
      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <WaitlistForm onGoals={setGoals} onJoined={() => setJoined(true)} />
      </div>
      <WaitlistAside goals={goals} joined={joined} />
    </section>
  );
}
