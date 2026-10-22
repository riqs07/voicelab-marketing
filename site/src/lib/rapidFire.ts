// The free Rapid Fire on the website: questions, and what a take's words and length show.
// A light taster of the app: timing, pace and pause words. The app adds pitch, pauses and coaching.

export const QUESTIONS = [
  "Morning person or night person, and why?",
  "What food would you defend to anyone?",
  "Cats or dogs?",
  "Which app could you not live without?",
  "What is your favourite way to spend a Sunday?",
  "What would you name a boat?",
  "Which superpower would you choose?",
  "Beach holiday or city break?",
  "What is a song you would sing at karaoke?",
  "Which era would you visit for one day?",
  "What makes a perfect sandwich?",
  "What would your dream job be for one week?",
] as const;

// Seconds to think before recording starts, and the window to aim for
export const THINK_SECONDS = 10;
export const WINDOW = { short: 60, long: 120 } as const;

// Pause words: the clear ones only ("like" and "so" are often real words, so they don't count)
const PAUSE_WORD = /^(um+|uh+|erm*|ah+|hmm+|mm+)$/i;

export type Token = { text: string; pause: boolean };

export type TakeStats = {
  seconds: number;
  words: number;
  perMinute: number;
  pauseWords: number;
  window: "short" | "inside" | "long";
  tokens: Token[];
  tip: string;
};

// Split a transcript into words, marking the pause words
export function tokenize(transcript: string): Token[] {
  return transcript
    .split(/\s+/)
    .filter(Boolean)
    .map((text) => ({ text, pause: PAUSE_WORD.test(text.replace(/[^a-z]/gi, "")) }));
}

// What one take shows. `seconds` is how long they spoke.
export function takeStats(transcript: string, seconds: number): TakeStats {
  const tokens = tokenize(transcript);
  const pauseWords = tokens.filter((token) => token.pause).length;
  const words = tokens.length - pauseWords;
  const perMinute = seconds > 0 ? Math.round((words / seconds) * 60) : 0;
  const window = seconds < WINDOW.short ? "short" : seconds > WINDOW.long ? "long" : "inside";
  return { seconds, words, perMinute, pauseWords, window, tokens, tip: tipFor({ seconds, words, perMinute, pauseWords, window }) };
}

// One thing to try next time: the most useful single change, in plain words.
export function tipFor(stats: Pick<TakeStats, "seconds" | "words" | "perMinute" | "pauseWords" | "window">): string {
  if (stats.words < 5) return "We didn't catch much. Try again somewhere quiet, a little closer to the microphone.";
  const perMinuteOfPauses = stats.seconds > 0 ? (stats.pauseWords / stats.seconds) * 60 : 0;
  if (perMinuteOfPauses >= 4) return "When you feel an “um” coming, stop for a second instead. A pause sounds like you meant it.";
  if (stats.window === "short") return "Aim for a full minute: give one example, then say why it matters to you.";
  if (stats.window === "long") return "Land it inside two minutes: make your point first, then one example, then stop.";
  if (stats.perMinute > 180) return "You're quick. Slow down on your key sentence and let it land.";
  if (stats.perMinute < 110) return "Pick up the pace a little between your points, and keep the pauses for the big ones.";
  return "Nicely inside the window. Next time, start with your answer in the first sentence.";
}

// Minutes and seconds, as 1:05
export function clock(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
