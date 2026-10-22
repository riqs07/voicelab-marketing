// What the free Rapid Fire shows for one take, worked out in the browser with the app's own measuring code
// (src/core, copied from the app). Nothing here leaves the device.
import { countFillers } from "@/core/fillers";
import { fadingEnds, findPauses, type PauseSummary } from "@/core/pauses";
import { pitchSummary, pitchWords, type Phrase, type PitchLine, type PitchWords } from "@/core/pitchPhrases";
import { alignFromDevice } from "@/core/wordAlign";
import { WINDOW, tipFor } from "./rapidFire";

// Readings are taken ten times a second, as in the app
export const TICK_MS = 100;

export type RawTake = {
  transcript: string;
  // When each word was first heard, in seconds from the start (one per word)
  spokenTimes: number[];
  // Loudness and pitch (hertz, or null when unvoiced), one reading every TICK_MS
  levels: number[];
  pitches: (number | null)[];
  seconds: number;
};

export type FreeTake = {
  seconds: number;
  words: number;
  perMinute: number;
  pauseWords: number;
  window: "short" | "inside" | "long";
  pauses: PauseSummary;
  fading: { stretches: number; faded: number };
  // The take's pitch in its words, or null when there wasn't enough voice to read
  pitch: PitchWords | null;
  // The app's plain-language notes about the pitch (endings, flat phrases, peaks)
  notes: PitchLine[];
  // The one most useful thing to try
  tip: string;
  // For comparing tries
  rising: number;
  flat: number;
};

// Statements that went up at the end, which can sound unsure
const risingPhrases = (phrases: readonly Phrase[]) => phrases.filter((phrase) => phrase.risingStatement);

export function analyseTake(raw: RawTake): FreeTake {
  const transcript = raw.transcript.trim();
  const fillers = countFillers(transcript).total;
  const allWords = transcript.split(/\s+/).filter(Boolean).length;
  const words = Math.max(0, allWords - fillers);
  const perMinute = raw.seconds > 0 ? Math.round((words / raw.seconds) * 60) : 0;
  const window = raw.seconds < WINDOW.short ? "short" : raw.seconds > WINDOW.long ? "long" : "inside";
  const pauses = findPauses(raw.levels, TICK_MS);
  const fading = fadingEnds(raw.levels, TICK_MS);
  let pitch: PitchWords | null = null;
  if (allWords > 0 && raw.pitches.some((p) => p !== null)) {
    const alignment = alignFromDevice(transcript, raw.spokenTimes.slice(0, allWords), raw.levels, TICK_MS);
    pitch = pitchWords({ pitch: raw.pitches, alignment, tickMs: TICK_MS });
  }
  const phrases = pitch?.phrases ?? [];
  const notes = pitchSummary(phrases);
  const rising = risingPhrases(phrases).length;
  const flat = phrases.filter((phrase) => phrase.flat).length;
  const base = { seconds: raw.seconds, words, perMinute, pauseWords: fillers, window } as const;
  return { ...base, pauses, fading, pitch, notes, rising, flat, tip: chooseTip({ ...base, pauses, fading, phrases }) };
}

// The single most useful change, most important first (the app's focus-first rule: one thing at a time)
export function chooseTip(t: {
  seconds: number;
  words: number;
  perMinute: number;
  pauseWords: number;
  window: "short" | "inside" | "long";
  pauses: PauseSummary;
  fading: { stretches: number; faded: number };
  phrases: readonly Phrase[];
}): string {
  if (t.words < 5) return tipFor(t);
  const rising = risingPhrases(t.phrases);
  const first = rising[0];
  if (first) {
    const last = first.words.at(-1)?.text.replace(/[^\p{L}'’-]/gu, "") ?? "";
    return `Your voice went up at the end of a statement${last ? ` (on “${last}”)` : ""}, so it sounds like a question. Let the last word drop.`;
  }
  const flat = t.phrases.filter((phrase) => phrase.flat).length;
  if (t.phrases.length >= 2 && flat >= Math.ceil(t.phrases.length / 2)) return "Most of your phrases stayed flat. Lift one important word in each, and let your voice move.";
  if (t.seconds > 0 && (t.pauseWords / t.seconds) * 60 >= 4) return tipFor(t);
  if (t.seconds >= 30 && t.pauses.count === 0) return "You didn't pause once. Stop for a breath between points; it gives people time to keep up.";
  if (t.fading.stretches >= 3 && t.fading.faded / t.fading.stretches >= 0.5) return "Your voice faded at the end of most phrases. Keep your strength through the last word.";
  return tipFor(t);
}
