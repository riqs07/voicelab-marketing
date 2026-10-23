// Turns a list of spoken lines (beats) into a timeline.
// With no voice yet, each line's length is estimated from its words (silent drafts).
// Once `npm run voice:durations` has measured the files in public/audio/<video>/,
// the real lengths are used and the audio plays.
import durations from '../content/durations.json';
import {FPS} from './theme';

export type Voice = 'narrator' | 'speaker' | 'maya' | 'chris';

export type Beat = {
  // Short id; the voice file is public/audio/<video>/<id>.mp3
  id: string;
  voice: Voice;
  // What is spoken (also sent to ElevenLabs)
  text: string;
  // On-screen caption, when it should differ from the spoken text ('' hides it)
  caption?: string;
  // Italic caption, for sample speech
  quote?: boolean;
  // Words per second for the estimate (fast or slow delivery)
  wps?: number;
  // Silence after this line, seconds (default 0.3)
  gapAfter?: number;
  // Fast-forward: play only the first `audioFor` seconds aloud, then race through the rest at `speed`
  fastForward?: {audioFor: number; speed: number};
  // Cut off: play only the first `cutAt` seconds, then stop dead (someone interrupts). Use gapAfter: 0 or less.
  cutAt?: number;
  // Play quieter than the narration (0 to 1), for sample clips under a voiceover
  volume?: number;
};

export type TimedBeat = Beat & {start: number; end: number; audio: string | null; full: number};

const known = durations as Record<string, number>;

const LEAD = 0.25;
const TAIL = 0.8;

// Rough spoken length: words at a natural pace, plus time for dramatic pauses.
export const estimate = (b: Beat) => {
  const words = b.text.split(/\s+/).filter(Boolean).length;
  const pauses = (b.text.match(/\.\.\.|…/g) ?? []).length;
  return words / (b.wps ?? 2.9) + pauses * 0.45 + 0.25;
};

export type Timeline = {beats: TimedBeat[]; total: number; frames: number; voiced: boolean};

export const buildTimeline = (video: string, beats: Beat[], voiced = true): Timeline => {
  let t = LEAD;
  let anyAudio = false;
  const out = beats.map((b) => {
    const file = `audio/${video}/${b.id}.mp3`;
    const real = voiced ? known[file] : undefined;
    if (real) anyAudio = true;
    const full = real ?? estimate(b);
    // A fast-forwarded line takes less screen time than its recording.
    const dur = b.cutAt ? Math.min(b.cutAt, full) : b.fastForward ? b.fastForward.audioFor + (full - b.fastForward.audioFor) / b.fastForward.speed : full;
    const timed: TimedBeat = {...b, start: t, end: t + dur, audio: real ? file : null, full};
    t += dur + (b.gapAfter ?? 0.3);
    return timed;
  });
  const last = out[out.length - 1];
  const total = last.end + TAIL;
  return {beats: out, total, frames: Math.ceil(total * FPS), voiced: anyAudio};
};

// Look up a beat by id (throws on a typo so templates fail loudly).
export const beat = (tl: Timeline, id: string) => {
  const b = tl.beats.find((x) => x.id === id);
  if (!b) throw new Error(`No beat "${id}"`);
  return b;
};

// Where in a line's recording we are at video time t (seconds), allowing for fast-forward.
export const mediaTime = (b: TimedBeat, t: number) => {
  const into = t - b.start;
  if (!b.fastForward || into <= b.fastForward.audioFor) return into;
  return b.fastForward.audioFor + (into - b.fastForward.audioFor) * b.fastForward.speed;
};
