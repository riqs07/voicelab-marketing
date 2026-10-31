"use client";
// The free Rapid Fire: a surprise question, ten seconds to think, then talk for one to two minutes.
// While you talk, the page records in memory and reads loudness and pitch ten times a second with the app's own
// code; words come from the browser's speech recognition (Apple or Google). Nothing is uploaded or kept.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { TopicDraw } from "@/components/TopicDraw";
import { LiveShape, StartShape, StatusShape } from "@/components/VoiceShape";
import { analyseTake, type FreeTake } from "@/lib/freeTake";
import { QUESTIONS, THINK_SECONDS, WINDOW, clock } from "@/lib/rapidFire";
import { canListen, useTake } from "@/lib/useTake";
import { Results } from "./Results";

type Stage = "intro" | "think" | "talk" | "working" | "done" | "unsupported" | "blocked";

const AUTO_STOP = 150;

// The timing light: grey until a minute, then green, yellow, red
function light(seconds: number) {
  if (seconds >= WINDOW.long) return { colour: "#C2412C", text: "Time to land it" };
  if (seconds >= 90) return { colour: "#E0A526", text: "Start wrapping up" };
  if (seconds >= WINDOW.short) return { colour: "#2E5B3E", text: "You're in the window" };
  // Before the window the voice shape stays warm, as in the app
  return { colour: "#F4A86E", text: "Keep going: aim for a minute" };
}

export function RapidFire() {
  const still = useReducedMotion();
  const [stage, setStage] = useState<Stage>("intro");
  const [question, setQuestion] = useState<string>(QUESTIONS[0]);
  const [left, setLeft] = useState(THINK_SECONDS);
  // Whether the topic draw has landed on the question (thinking time starts then)
  const [drawn, setDrawn] = useState(false);
  const [take, setTake] = useState<FreeTake | null>(null);
  const [lastTake, setLastTake] = useState<FreeTake | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorder = useTake();
  const { seconds, level, finalText, interim } = recorder;
  // The browser can take the microphone away mid-take
  const view: Stage = stage === "talk" && recorder.blocked ? "blocked" : stage;

  // Thinking countdown, then talk
  useEffect(() => {
    if (stage !== "think" || !drawn) return;
    if (left <= 0) {
      void startTalking();
      return;
    }
    const id = window.setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on each tick of the countdown only
  }, [stage, left, drawn]);

  // Stop at the limit
  useEffect(() => {
    if (stage !== "talk") return;
    const id = window.setTimeout(() => void stopTalking(), AUTO_STOP * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per take, set when talking starts
  }, [stage]);

  // Free the in-memory recording when a new one replaces it or the page goes away
  useEffect(() => () => (audioUrl ? URL.revokeObjectURL(audioUrl) : undefined), [audioUrl]);

  // Start thinking time; a fresh question unless they're trying the same one again
  function think(fresh: boolean) {
    if (!canListen()) {
      setStage("unsupported");
      return;
    }
    if (fresh) {
      const others = QUESTIONS.filter((q) => q !== question);
      setQuestion(others[Math.floor(Math.random() * others.length)] ?? QUESTIONS[0]);
      setLastTake(null);
      setDrawn(false);
    } else {
      if (take) setLastTake(take);
      // Trying the same question again: no draw
      setDrawn(true);
    }
    setLeft(THINK_SECONDS);
    setStage("think");
  }

  async function startTalking() {
    const started = await recorder.start();
    setStage(started === "ok" ? "talk" : started);
  }

  async function stopTalking() {
    setStage("working");
    const finished = await recorder.stop();
    if (!finished) return;
    setTake(analyseTake(finished.raw));
    setAudioUrl(finished.audio ? URL.createObjectURL(finished.audio) : null);
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
        {view === "intro" ? (
          <motion.div key="intro" {...pop} className="flex flex-col items-center gap-6 text-center">
            <p className="m-0 text-lg text-muted">Your question is hidden until you start. You get {THINK_SECONDS} seconds to think, then talk for one to two minutes.</p>
            {/* The voice shape is the start button, as in the app */}
            <StartShape label="Show my question" detail={`then ${THINK_SECONDS} s to think`} onStart={() => think(true)} />
            <p className="m-0 max-w-md text-sm text-muted">
              Your browser will ask to use the microphone. Your voice is measured right here in the page; the recording stays on your device for you to play back and is never uploaded. Your browser’s speech recognition (Apple or Google) turns your words into text.
            </p>
          </motion.div>
        ) : null}

        {view === "think" || view === "talk" ? (
          <motion.div key="live" {...pop} className="flex flex-col gap-6">
            <div>
              <span className="text-sm font-semibold text-muted">Your question</span>
              <h2 className="m-0 mt-1 font-serif text-3xl font-semibold leading-tight sm:text-4xl" aria-live="polite">
                {stage === "think" && !drawn ? <TopicDraw key={question} question={question} pool={QUESTIONS} onDone={() => setDrawn(true)} /> : question}
              </h2>
            </div>
            {stage === "think" ? (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                {/* The faded shape, thinking: picking a question, then counting down */}
                {drawn ? <StatusShape label={left} detail="seconds to think" /> : <StatusShape label="Get ready" detail="picking a question" />}
                <button type="button" onClick={() => void startTalking()} disabled={!drawn} className="min-h-11 rounded-full border-2 border-line px-5 font-bold hover:border-accent disabled:opacity-40">
                  Start now
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
                  {/* The live voice shape: grows with your voice, takes the timing light's colour, and is the stop button */}
                  <LiveShape level={level} colour={now.colour} clock={clock(seconds)} onStop={() => void stopTalking()} />
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="flex items-center gap-2 font-semibold">
                      <motion.span className="inline-block h-3 w-3 rounded-full bg-[#C2412C]" animate={still ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                      Listening…
                    </span>
                    <span className="text-muted">{now.text}</span>
                  </div>
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

        {view === "working" ? (
          <motion.div key="working" {...pop} className="flex flex-col items-center gap-4 py-10 text-center">
            <StatusShape label="Measuring…" detail="your voice" />
          </motion.div>
        ) : null}

        {view === "done" && take ? (
          <motion.div key="done" {...pop}>
            <Results question={question} take={take} last={lastTake} audioUrl={audioUrl} onAgain={() => think(false)} onAnother={another} />
          </motion.div>
        ) : null}

        {view === "unsupported" ? (
          <motion.div key="unsupported" {...pop} className="flex flex-col items-start gap-4">
            <h2 className="m-0 font-serif text-3xl font-semibold">This browser can’t listen yet.</h2>
            <p className="m-0 text-lg text-muted">The free Rapid Fire uses your browser’s speech recognition. Try Chrome, Edge or Safari (on a Mac, iPhone or iPad).</p>
            <BouncyLink href="/waitlist">Join the waitlist instead</BouncyLink>
          </motion.div>
        ) : null}

        {view === "blocked" ? (
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
