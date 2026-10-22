import type { Metadata } from "next";
import { BounceWords } from "@/components/Bouncy";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = { title: "Join the waitlist · VoiceLab" };

export default function WaitlistPage() {
  return (
    <section className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-10 pt-6 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:pt-12">
      <div className="flex flex-col gap-5">
        <h1 className="m-0 font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl">
          <BounceWords text="Join the waitlist." />
        </h1>
        <p className="m-0 max-w-md text-lg leading-relaxed text-muted">VoiceLab is being tested now. Leave your email and we’ll tell you the day it opens.</p>
      </div>
      <WaitlistForm />
    </section>
  );
}
