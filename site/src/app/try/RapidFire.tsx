"use client";
// The free Rapid Fire: a surprise question, ten seconds to think, then talk for one to two minutes.
// While you talk, the page records in memory and reads loudness and pitch ten times a second with the app's own
// code; words come from the browser's speech recognition (Apple or Google). Nothing is uploaded or kept.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { stampSpoken } from "@/core/liveReading";
import { openCapture, type Capture } from "@/lib/capture";
import { analyseTake, TICK_MS, type FreeTake } from "@/lib/freeTake";
import { QUESTIONS, THINK_SECONDS, WINDOW, clock } from "@/lib/rapidFire";
import { Results } from "./Results";

// The small part of the Web Speech API we use (it isn't in TypeScript's built-in types everywhere)
type Alternative = { transcript: string };
type ResultItem = { isFinal: boolean; 0: Alternative };
type ResultEvent = { resultIndex: number; results: ArrayLike<ResultItem> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type RecognitionClass = new () => Recognition;

function recognitionClass(): RecognitionClass | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Stage = "intro" | "think" | "talk" | "working" | "done" | "unsupported" | "blocked";

const AUTO_STOP = 150;

// The timing light: grey until a minute, then green, yellow, red
function light(seconds: number) {
  if (seconds >= WINDOW.long) return { colour: "#C2412C", text: "Time to land it" };
  if (seconds >= 90) return { colour: "#E0A526", text: "Start wrapping up" };
  if (seconds >= WINDOW.short) return { colour: "#2E5B3E", text: "You're in the window" };
  return { colour: "#B9C4BB", text: "Keep going: aim for a minute" };
}

function Ring({ fraction, colour, size = 72, children }: { fraction: number; colour: string; size?: number; children?: React.ReactNode }) {
  const r = size / 2 - 7;
  const around = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true" className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E4EDE6" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.max(0, Math.min(1, fraction)) * around} ${around}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="relative font-bold tabular-nums">{children}</span>
    </div>
  );
}

// A small live loudness meter, so people can see the page hearing them
function Meter({ level }: { level: number }) {
  const bars = [0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25];
  return (
    <div className="flex h-8 items-center gap-1" aria-hidden="true">
      {bars.map((shape, i) => (
        <span key={i} className="w-1.5 rounded-full bg-accent transition-[height] duration-100" style={{ height: `${Math.max(12, Math.min(100, level * 600 * shape))}%` }} />
      ))}
    </div>
  );
}

export function RapidFire() {
  const still = useReducedMotion();
  const [stage, setStage] = useState<Stage>("intro");
  const [question, setQuestion] = useState<string>(QUESTIONS[0]);
  const [left, setLeft] = useState(THINK_SECONDS);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [take, setTake] = useState<FreeTake | null>(null);
  const [lastTake, setLastTake] = useState<FreeTake | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Everything the take collects while it runs
  const recognition = useRef<Recognition | null>(null);
  const capture = useRef<Capture | null>(null);
  const talking = useRef(false);
  const startedAt = useRef(0);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const spokenTimes = useRef<number[]>([]);
  const levels = useRef<number[]>([]);
  const pitches = useRef<(number | null)[]>([]);

  // Thinking countdown, then talk
  useEffect(() => {
    if (stage !== "think") return;
    if (left <= 0) {
      void startTalking();
      return;
    }
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [stage, left]);

  // While talking: read loudness and pitch ten times a second (as the app does), run the clock, stop at the limit
  useEffect(() => {
    if (stage !== "talk") return;
    const id = window.setInterval(() => {
      const now = (performance.now() - startedAt.current) / 1000;
      setSeconds(now);
      const mic = capture.current;
      if (mic) {
        const reading = mic.level();
        levels.current.push(reading);
        pitches.current.push(mic.pitch());
        setLevel(reading);
      }
      if (now >= AUTO_STOP) void stopTalking();
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [stage]);

  // Let go of the microphone if the page goes away mid-take
  useEffect(
    () => () => {
      talking.current = false;
      recognition.current?.stop();
      void capture.current?.stop();
    },
    [],
  );
  // Free the in-memory recording when a new one replaces it or the page goes away
  useEffect(() => () => (audioUrl ? URL.revokeObjectURL(audioUrl) : undefined), [audioUrl]);

  // Start thinking time; a fresh question unless they're trying the same one again
  function think(fresh: boolean) {
    if (!recognitionClass() || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStage("unsupported");
      return;
    }
    if (fresh) {
      const others = QUESTIONS.filter((q) => q !== question);
      setQuestion(others[Math.floor(Math.random() * others.length)] ?? QUESTIONS[0]);
      setLastTake(null);
    } else if (take) setLastTake(take);
    setLeft(THINK_SECONDS);
    setStage("think");
  }

  async function startTalking() {
    const Recog = recognitionClass();
    if (!Recog) {
      setStage("unsupported");
      return;
    }
    try {
      capture.current = await openCapture();
    } catch {
      setStage("blocked");
      return;
    }
    const rec = new Recog();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    rec.onresult = (event) => {
      let live = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (!item) continue;
        if (item.isFinal) finalRef.current += ` ${item[0].transcript}`;
        else live += ` ${item[0].transcript}`;
      }
      interimRef.current = live.trim();
      // Note when each word was first heard, as the app does, to place words against the pitch
      const heard = `${finalRef.current} ${interimRef.current}`.trim();
      const now = (performance.now() - startedAt.current) / 1000;
      spokenTimes.current = stampSpoken(spokenTimes.current, heard.split(/\s+/).filter(Boolean).length, now);
      setFinalText(finalRef.current.trim());
      setInterim(interimRef.current);
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        talking.current = false;
        void capture.current?.stop();
        setStage("blocked");
      }
    };
    // Some browsers stop listening after a silence; keep going until the person presses Stop
    rec.onend = () => {
      if (talking.current) {
        try {
          rec.start();
        } catch {
          // Already restarting
        }
      }
    };
    finalRef.current = "";
    interimRef.current = "";
    spokenTimes.current = [];
    levels.current = [];
    pitches.current = [];
    setFinalText("");
    setInterim("");
    setSeconds(0);
    recognition.current = rec;
    talking.current = true;
    startedAt.current = performance.now();
    setStage("talk");
    try {
      rec.start();
    } catch {
      setStage("unsupported");
    }
  }

  async function stopTalking() {
    if (!talking.current) return;
    talking.current = false;
    recognition.current?.stop();
    const spoken = (performance.now() - startedAt.current) / 1000;
    setStage("working");
    const blob = (await capture.current?.stop()) ?? null;
    capture.current = null;
    // Give the last words a moment to arrive
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    const transcript = `${finalRef.current} ${interimRef.current}`.trim();
    const count = transcript.split(/\s+/).filter(Boolean).length;
    const times = stampSpoken(spokenTimes.current, count, spoken).slice(0, count);
    setTake(analyseTake({ transcript, spokenTimes: times, levels: levels.current, pitches: pitches.current, seconds: spoken }));
    setAudioUrl(blob && blob.size > 0 ? URL.createObjectURL(blob) : null);
    setStage("done");
  }

  function another() {
    setTake(null);
    setLastTake(null);
    setStage("intro");
  }

  const pop = still ? {} : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -16 }, transition: { ...SPRING, stiffness: 260 } };
  const now = light(seconds);

  return (
    <div className="rounded-[2rem] bg-card p-6 shadow-[0_10px_0_#e4ede6] sm:p-10">
      <AnimatePresence mode="wait">
        {stage === "intro" ? (
          <motion.div key="intro" {...pop} className="flex flex-col items-center gap-6 text-center">
            <p className="m-0 text-lg text-muted">Your question is hidden until you start. You get {THINK_SECONDS} seconds to think, then talk for one to two minutes.</p>
            <motion.button
              type="button"
              onClick={() => think(true)}
              whileHover={still ? undefined : { scale: 1.06 }}
              whileTap={still ? undefined : { scale: 0.92 }}
              animate={still ? undefined : { boxShadow: ["0 0 0 0 rgba(244,168,110,0.5)", "0 0 0 22px rgba(244,168,110,0)"] }}
              transition={{ boxShadow: { duration: 1.6, repeat: Infinity }, default: SPRING }}
              className="flex h-48 w-48 flex-col items-center justify-center gap-1 rounded-full bg-warm font-serif text-2xl font-semibold text-ink"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
                <rect x="9" y="3" width="6" height="12" rx="3" fill="#1E2620" />
                <path d="M5 11 C 5 16, 19 16, 19 11 M12 16 L12 21" stroke="#1E2620" strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
              Show my question
            </motion.button>
            <p className="m-0 max-w-md text-sm text-muted">
              Your browser will ask to use the microphone. Your voice is measured right here in the page; the recording stays on your device for you to play back and is never uploaded. Your browser’s speech recognition (Apple or Google) turns your words into text.
            </p>
          </motion.div>
        ) : null}

        {stage === "think" || stage === "talk" ? (
          <motion.div key="live" {...pop} className="flex flex-col gap-6">
            <div>
              <span className="text-sm font-semibold text-muted">Your question</span>
              <h2 className="m-0 mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{question}</h2>
            </div>
            {stage === "think" ? (
              <div className="flex flex-wrap items-center gap-5">
                <Ring fraction={left / THINK_SECONDS} colour="#2E5B3E">
                  {left}
                </Ring>
                <span className="text-lg text-muted">seconds to think</span>
                <button type="button" onClick={() => void startTalking()} className="min-h-11 rounded-full border-2 border-line px-5 font-bold hover:border-accent">
                  Start now
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-5">
                  <Ring fraction={seconds / WINDOW.long} colour={now.colour} size={88}>
                    {clock(seconds)}
                  </Ring>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-2 font-semibold">
                      <motion.span className="inline-block h-3 w-3 rounded-full bg-[#C2412C]" animate={still ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                      Listening
                    </span>
                    <span className="text-muted">{now.text}</span>
                  </div>
                  <Meter level={level} />
                  <motion.button type="button" onClick={() => void stopTalking()} whileTap={still ? undefined : { scale: 0.92 }} transition={SPRING} className="ml-auto min-h-13 rounded-full bg-ink px-8 text-lg font-bold text-paper">
                    Stop
                  </motion.button>
                </div>
                <p className="m-0 min-h-24 rounded-2xl bg-paper p-4 text-lg leading-relaxed" aria-live="polite">
                  {finalText}
                  <span className="text-grey"> {interim}</span>
                  {!finalText && !interim ? <span className="text-muted">Your words appear here as you speak.</span> : null}
                </p>
              </>
            )}
          </motion.div>
        ) : null}

        {stage === "working" ? (
          <motion.div key="working" {...pop} className="flex flex-col items-center gap-4 py-10 text-center">
            <motion.span className="h-4 w-4 rounded-full bg-accent" animate={still ? undefined : { y: [0, -16, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
            <span className="text-lg text-muted">Measuring your voice…</span>
          </motion.div>
        ) : null}

        {stage === "done" && take ? (
          <motion.div key="done" {...pop}>
            <Results question={question} take={take} last={lastTake} audioUrl={audioUrl} onAgain={() => think(false)} onAnother={another} />
          </motion.div>
        ) : null}

        {stage === "unsupported" ? (
          <motion.div key="unsupported" {...pop} className="flex flex-col items-start gap-4">
            <h2 className="m-0 font-serif text-3xl font-semibold">This browser can’t listen yet.</h2>
            <p className="m-0 text-lg text-muted">The free Rapid Fire uses your browser’s speech recognition. Try Chrome, Edge or Safari (on a Mac, iPhone or iPad).</p>
            <BouncyLink href="/waitlist">Join the waitlist instead</BouncyLink>
          </motion.div>
        ) : null}

        {stage === "blocked" ? (
          <motion.div key="blocked" {...pop} className="flex flex-col items-start gap-4">
            <h2 className="m-0 font-serif text-3xl font-semibold">The microphone is switched off for this site.</h2>
            <p className="m-0 text-lg text-muted">Allow the microphone in your browser’s site settings (the icon next to the address), then try again.</p>
            <button type="button" onClick={() => setStage("intro")} className="min-h-12 rounded-full bg-accent px-6 text-lg font-bold text-white">
              Try again
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
