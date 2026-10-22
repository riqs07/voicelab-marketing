"use client";
// The free Rapid Fire: a surprise question, ten seconds to think, then talk for one to two minutes.
// Words come from the browser's own speech recognition (Apple or Google, depending on the browser).
// Nothing is recorded or saved by VoiceLab.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { QUESTIONS, THINK_SECONDS, WINDOW, clock, takeStats, type TakeStats } from "@/lib/rapidFire";

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

type Stage = "intro" | "think" | "talk" | "done" | "unsupported" | "blocked";

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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colour}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(0, Math.min(1, fraction)) * around} ${around}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <span className="relative font-bold tabular-nums">{children}</span>
    </div>
  );
}

export function RapidFire() {
  const still = useReducedMotion();
  const [stage, setStage] = useState<Stage>("intro");
  const [question, setQuestion] = useState<string>(QUESTIONS[0]);
  const [left, setLeft] = useState(THINK_SECONDS);
  const [seconds, setSeconds] = useState(0);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [stats, setStats] = useState<TakeStats | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const talking = useRef(false);
  const startedAt = useRef(0);
  const finalRef = useRef("");
  // Words heard but not yet confirmed by the browser; kept if Stop is pressed mid-phrase
  const interimRef = useRef("");

  // Thinking countdown, then talk
  useEffect(() => {
    if (stage !== "think") return;
    if (left <= 0) {
      startTalking();
      return;
    }
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [stage, left]);

  // The talking clock, with an automatic stop
  useEffect(() => {
    if (stage !== "talk") return;
    const id = window.setInterval(() => {
      const now = (performance.now() - startedAt.current) / 1000;
      setSeconds(now);
      if (now >= AUTO_STOP) stopTalking();
    }, 250);
    return () => window.clearInterval(id);
  }, [stage]);

  // Stop listening if the page goes away mid-take
  useEffect(() => () => {
    talking.current = false;
    recognition.current?.stop();
  }, []);

  // Start thinking time; a fresh question unless they're trying the same one again
  function think(fresh: boolean) {
    if (!recognitionClass()) {
      setStage("unsupported");
      return;
    }
    if (fresh) {
      const others = QUESTIONS.filter((q) => q !== question);
      setQuestion(others[Math.floor(Math.random() * others.length)] ?? QUESTIONS[0]);
    }
    setLeft(THINK_SECONDS);
    setStage("think");
  }

  function startTalking() {
    const Recog = recognitionClass();
    if (!Recog) {
      setStage("unsupported");
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
      setFinalText(finalRef.current.trim());
      setInterim(live.trim());
    };
    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        talking.current = false;
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

  function stopTalking() {
    if (!talking.current) return;
    talking.current = false;
    recognition.current?.stop();
    const spoken = (performance.now() - startedAt.current) / 1000;
    // Give the last words a moment to arrive
    window.setTimeout(() => {
      setStats(takeStats(`${finalRef.current} ${interimRef.current}`.trim(), spoken));
      setStage("done");
    }, 700);
  }

  function another() {
    setStats(null);
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
            <p className="m-0 max-w-md text-sm text-muted">Your browser will ask to use the microphone. Its speech recognition (Apple or Google) turns your words into text; VoiceLab doesn’t record or keep anything.</p>
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
                <button type="button" onClick={startTalking} className="min-h-11 rounded-full border-2 border-line px-5 font-bold hover:border-accent">
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
                  <motion.button
                    type="button"
                    onClick={stopTalking}
                    whileTap={still ? undefined : { scale: 0.92 }}
                    transition={SPRING}
                    className="ml-auto min-h-13 rounded-full bg-ink px-8 text-lg font-bold text-paper"
                  >
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

        {stage === "done" && stats ? (
          <motion.div key="done" {...pop} className="flex flex-col gap-6">
            <div>
              <span className="text-sm font-semibold text-muted">Your question</span>
              <h2 className="m-0 mt-1 font-serif text-2xl font-semibold leading-tight sm:text-3xl">{question}</h2>
            </div>
            <div className="flex items-center gap-4">
              <Ring fraction={stats.seconds / WINDOW.long} colour={stats.window === "inside" ? "#2E5B3E" : "#C26A2C"} size={72}>
                {clock(stats.seconds)}
              </Ring>
              <span className="text-lg">
                {stats.window === "inside" ? "Inside the 1:00 to 2:00 window." : stats.window === "short" ? "A little short of a minute." : "Over two minutes."}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: stats.perMinute, label: "words a minute" },
                { value: stats.pauseWords, label: stats.pauseWords === 1 ? "pause word" : "pause words" },
                { value: stats.words, label: "words" },
              ].map((tile, i) => (
                <motion.div
                  key={tile.label}
                  className="rounded-2xl bg-paper p-4"
                  initial={still ? false : { opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.15 + i * 0.1 }}
                >
                  <div className="font-serif text-4xl font-semibold tabular-nums">{tile.value}</div>
                  <div className="text-sm text-muted">{tile.label}</div>
                </motion.div>
              ))}
            </div>
            <p className="m-0 rounded-2xl bg-peach px-5 py-4 text-lg leading-snug text-peach-ink">
              <b>One thing to try:</b> {stats.tip}
            </p>
            {stats.tokens.length > 0 ? (
              <div>
                <span className="text-sm font-semibold text-muted">What we heard (pause words in grey)</span>
                <p className="m-0 mt-2 text-lg leading-relaxed">
                  {stats.tokens.map((token, i) => (
                    <span key={i} className={token.pause ? "italic text-grey underline decoration-usual decoration-dotted decoration-2" : ""}>
                      {token.text}{" "}
                    </span>
                  ))}
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <motion.button type="button" onClick={() => think(false)} whileTap={still ? undefined : { scale: 0.94 }} transition={SPRING} className="min-h-12 rounded-full bg-accent px-6 text-lg font-bold text-white shadow-[0_6px_0_#1f4029]">
                Try it again
              </motion.button>
              <button type="button" onClick={another} className="min-h-12 rounded-full border-2 border-line px-6 text-lg font-bold hover:border-accent">
                Another question
              </button>
            </div>
            <div className="flex flex-col items-start gap-3 rounded-[1.5rem] bg-ink p-6 text-paper">
              <b className="font-serif text-2xl">The app goes further</b>
              <span className="text-[#D7DED9]">See where your voice rose and fell on every word, tap any word to hear it, tell stories, practise conversations, and hear your progress week to week.</span>
              <BouncyLink href="/waitlist" variant="light">
                Join the waitlist
              </BouncyLink>
            </div>
            <p className="m-0 text-sm text-muted">Nothing was saved. Your browser’s speech recognition turned your words into text.</p>
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
