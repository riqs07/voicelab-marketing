// The free Read aloud: two short passages from the app, and what one reading shows, worked out in the browser with
// the app's own code (which words were caught, from src/core/readAlong; the voice, from freeTake). Nothing leaves the device.
import { alignReading, type ReadingCheck } from "@/core/readAlong";
import passages from "@/data/passages.json";
import { analyseTake, type FreeTake, type RawTake } from "./freeTake";

export type Passage = { id: string; kind: string; title: string; source: string; body: string };

// Copied word for word from the app by scripts/sync-core.mjs
export const PASSAGES: readonly Passage[] = passages;

// Stop on its own this long after the last word is read, or at the time limit
export const FINISH_SECONDS = 1.5;
export const READ_LIMIT = 180;

// A steady reading pace, in words a minute
export const PACE = { slow: 110, fast: 170 } as const;

export type ReadTake = FreeTake & { check: ReadingCheck };

export function analyseReading(raw: RawTake, body: string): ReadTake {
  const take = analyseTake(raw);
  const check = alignReading(body, raw.transcript);
  return { ...take, check, tip: readingTip(check, take) };
}

// The headline, in the app's words
export function readingHeadline(check: ReadingCheck): string {
  return check.stoppedEarly ? `You read the first ${check.readTo} words.` : `You read ${check.percentRead}% of the words.`;
}

// The single most useful change for a reading, most important first; otherwise the voice tip from the take
export function readingTip(check: ReadingCheck, take: Pick<FreeTake, "perMinute" | "seconds" | "pauses" | "tip">): string {
  if (check.stoppedEarly) return "Read on to the end next time, even if you stumble: carry on from the next word instead of going back.";
  if (check.percentRead < 85) return "Some words weren’t caught. Slow down a little and finish the last sound of every word.";
  if (take.perMinute > PACE.fast) return `You read at ${take.perMinute} words a minute. Aim for about 140: let each sentence finish before the next one starts.`;
  if (take.seconds >= 20 && take.pauses.count === 0) return "You didn’t pause once. Take a breath at each full stop; it lets the line land.";
  if (take.perMinute > 0 && take.perMinute < PACE.slow) return `You read at ${take.perMinute} words a minute, a careful pace. Next time, keep the words moving and save your pauses for the full stops.`;
  return take.tip;
}
