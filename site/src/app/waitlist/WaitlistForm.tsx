"use client";
// The waitlist form: email and optional goals, then a bouncy "You're on the list".
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { GOALS, type Goal } from "@/lib/waitlist";
import { Blob } from "@/components/Characters";

const CHIP = "min-h-11 rounded-full border-2 px-4 font-semibold transition-colors";
const ON = "border-accent bg-accent text-white";
const OFF = "border-line bg-transparent text-ink hover:border-accent";

// A little burst of dots when someone joins
function Burst() {
  const dots = Array.from({ length: 14 }, (_, i) => i);
  const colours = ["#F4A86E", "#2E5B3E", "#C26A2C", "#B9C4BB"];
  return (
    <div className="pointer-events-none absolute left-1/2 top-10" aria-hidden="true">
      {dots.map((i) => {
        const angle = (i / dots.length) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute h-3 w-3 rounded-full"
            style={{ background: colours[i % colours.length] }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: Math.cos(angle) * 120, y: Math.sin(angle) * 90, scale: 1, opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function WaitlistForm({ onGoals, onJoined }: { onGoals?: (goals: Goal[]) => void; onJoined?: () => void } = {}) {
  const still = useReducedMotion();
  const [email, setEmail] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "joined">("idle");
  const [error, setError] = useState<string | null>(null);

  async function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setState("sending");
    const website = String(new FormData(event.currentTarget).get("website") ?? "");
    try {
      const answer = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, goals, website }),
      });
      const result = (await answer.json()) as { ok: boolean; message?: string };
      if (result.ok) {
        setState("joined");
        onJoined?.();
        return;
      }
      setError(result.message ?? "Something went wrong. Please try again.");
    } catch {
      setError("We couldn't reach the waitlist. Check your connection and try again.");
    }
    setState("idle");
  }

  if (state === "joined") {
    return (
      <motion.div
        className="relative flex flex-col items-start gap-5 rounded-[2rem] bg-card p-8 shadow-[0_10px_0_#e4ede6]"
        initial={still ? false : { scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...SPRING, stiffness: 260, damping: 12 }}
      >
        {still ? null : <Burst />}
        {/* The blob celebrates: its one hop, arms up */}
        <motion.span
          className="-mb-2 inline-flex"
          initial={still ? false : { scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.15 }}
        >
          <Blob size={96} face="happy" arms hop />
        </motion.span>
        <h2 className="m-0 font-serif text-4xl font-semibold" role="status">
          You’re on the list.
        </h2>
        <p className="m-0 text-lg leading-relaxed text-muted">
          We’ll email you the day VoiceLab opens. If an email arrives asking you to confirm, tap the link in it. While you wait, try one Rapid Fire and hear how you sound.
        </p>
        <div className="flex flex-wrap gap-3">
          <BouncyLink href="/try">Try a free Rapid Fire</BouncyLink>
          <button type="button" onClick={() => setState("idle")} className="min-h-12 rounded-full px-4 font-semibold text-accent hover:underline">
            Use a different email
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={join} className="flex flex-col gap-7 rounded-[2rem] bg-card p-6 shadow-[0_10px_0_#e4ede6] sm:p-8" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-semibold">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-describedby={error ? "waitlist-error" : undefined}
          className="min-h-13 rounded-2xl border-2 border-line bg-paper px-4 text-lg outline-none focus:border-accent"
        />
      </div>

      {/* Hidden from people; bots fill it in */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 font-semibold">
          What do you want to get better at? <span className="font-normal text-muted">Optional, pick any</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((goal) => {
            const on = goals.includes(goal);
            return (
              <motion.button
                key={goal}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  const next = on ? goals.filter((g) => g !== goal) : [...goals, goal];
                  setGoals(next);
                  onGoals?.(next);
                }}
                whileTap={still ? undefined : { scale: 0.9 }}
                animate={still ? undefined : { scale: on ? [1, 1.12, 1] : 1 }}
                // The pop has three steps, so it's timed (a spring can only go between two)
                transition={{ scale: { duration: 0.35, ease: "easeOut" }, default: SPRING }}
                className={`${CHIP} ${on ? ON : OFF}`}
              >
                {goal}
              </motion.button>
            );
          })}
        </div>
      </fieldset>

      {error ? (
        <p id="waitlist-error" role="alert" className="m-0 rounded-2xl bg-peach px-4 py-3 font-semibold text-peach-ink">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-start gap-3">
        <motion.button
          type="submit"
          disabled={state === "sending"}
          whileHover={still ? undefined : { scale: 1.04, rotate: -1 }}
          whileTap={still ? undefined : { scale: 0.94, y: 3 }}
          transition={SPRING}
          className="inline-flex min-h-13 items-center rounded-full bg-accent px-7 text-lg font-bold text-white shadow-[0_6px_0_#1f4029] disabled:opacity-60"
        >
          {state === "sending" ? "Joining…" : "Join the waitlist"}
        </motion.button>
        <p className="m-0 text-sm text-muted">
          We only use your email to tell you about VoiceLab. Unsubscribe any time. <Link href="/privacy" className="text-accent underline">Privacy</Link>
        </p>
      </div>
    </form>
  );
}
