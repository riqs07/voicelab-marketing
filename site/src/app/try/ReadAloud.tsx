"use client";
// The free Read aloud: pick one of two short passages, read it out, and the words light up as the browser hears them
// (the app's own read-along code). It stops by itself after the last word. Measured in the page; nothing is uploaded.
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { BouncyLink, SPRING } from "@/components/Bouncy";
import { Meter, Ring } from "@/components/TakeParts";
import { followReading, readingTokens, scriptWords } from "@/core/liveReading";
import { clock } from "@/lib/rapidFire";
import { FINISH_SECONDS, PASSAGES, READ_LIMIT, analyseReading, type ReadTake } from "@/lib/readAloud";
import { canListen, useTake } from "@/lib/useTake";
import { ReadResults } from "./ReadResults";

type Stage = "ready" | "read" | "working" | "done" | "unsupported" | "blocked";

export function ReadAloud() {
  const still = useReducedMotion();
  const [stage, setStage] = useState<Stage>("ready");
  const [pick, setPick] = useState(0);
  const [take, setTake] = useState<ReadTake | null>(null);
  const [lastTake, setLastTake] = useState<ReadTake | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recorder = useTake();
  const passage = PASSAGES[pick] ?? PASSAGES[0]!;
  const view: Stage = stage === "read" && recorder.blocked ? "blocked" : stage;

  // The passage split into words that can light up, and how far the reader has got
  const tokens = useMemo(() => readingTokens(passage.body), [passage.body]);
  const expected = useMemo(() => scriptWords(tokens), [tokens]);
  const follow = followReading(expected, `${recorder.finalText} ${recorder.interim}`);
  const finished = stage === "read" && follow.next >= expected.length;

  // Stop by itself a moment after the last word, or at the time limit
  useEffect(() => {
    if (stage !== "read") return;
    const id = window.setTimeout(() => void stopReading(), (finished ? FINISH_SECONDS : READ_LIMIT) * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one timer per take, reset once the last word is read
  }, [stage, finished]);

  // Free the in-memory recording when a new one replaces it or the page goes away
  useEffect(() => () => (audioUrl ? URL.revokeObjectURL(audioUrl) : undefined), [audioUrl]);

  async function startReading(again: boolean) {
    if (!canListen()) {
      setStage("unsupported");
      return;
    }
    setLastTake(again ? take : null);
    const started = await recorder.start();
    setStage(started === "ok" ? "read" : started);
  }

  async function stopReading() {
    setStage("working");
    const done = await recorder.stop();
    if (!done) return;
    setTake(analyseReading(done.raw, passage.body));
    setAudioUrl(done.audio ? URL.createObjectURL(done.audio) : null);
    setStage("done");
  }

  function choose(index: number) {
    setPick(index);
    setTake(null);
    setLastTake(null);
    setStage("ready");
  }

  const pop = still ? {} : { initial: { opacity: 0, y: 24, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -16 }, transition: { ...SPRING, stiffness: 260 } };

  return (
    <div className="rounded-[2rem] bg-card p-6 shadow-[0_10px_0_#fce3cf] sm:p-10">
      <AnimatePresence mode="wait">
        {view === "ready" || view === "read" ? (
          <motion.div key="text" {...pop} className="flex flex-col gap-6">
            {view === "ready" ? (
              <div role="group" aria-label="Pick a passage" className="flex flex-wrap gap-2">
                {PASSAGES.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={pick === i}
                    onClick={() => choose(i)}
                    className={`min-h-11 rounded-full px-5 font-bold transition-colors ${pick === i ? "bg-accent text-white" : "bg-sand text-ink hover:bg-tint"}`}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            ) : null}
            <div>
              <h2 className="m-0 font-serif text-3xl font-semibold leading-tight sm:text-4xl">{passage.title}</h2>
              <span className="text-muted">{passage.source}</span>
            </div>
            {/* The passage: words read turn dark, the next word is marked */}
            <p className="m-0 font-serif text-xl leading-[1.9] sm:text-2xl" data-testid="passage">
              {tokens.map((token, i) => {
                if (token.kind === "pause") return <span key={i}> / </span>;
                if (token.word === null) return <span key={i}>{token.text}</span>;
                const read = view === "read" && follow.read[token.word];
                const next = view === "read" && token.word === follow.next;
                return (
                  <span
                    key={i}
                    data-read={read ? "true" : undefined}
                    className={`rounded-md transition-colors duration-200 ${view === "ready" ? "text-ink" : read ? "text-ink" : "text-grey"} ${next ? "bg-peach text-peach-ink" : ""}`}
                  >
                    {token.text}
                  </span>
                );
              })}
            </p>
            {view === "ready" ? (
              <div className="flex flex-col items-start gap-3">
                <motion.button
                  type="button"
                  onClick={() => void startReading(false)}
                  whileHover={still ? undefined : { scale: 1.05, rotate: -1 }}
                  whileTap={still ? undefined : { scale: 0.92 }}
                  transition={SPRING}
                  className="min-h-14 rounded-full bg-warm px-8 font-serif text-2xl font-semibold text-ink shadow-[0_6px_0_#c26a2c]"
                >
                  Start reading
                </motion.button>
                <p className="m-0 max-w-xl text-sm text-muted">
                  Your browser will ask to use the microphone. Read at your own pace; it stops by itself after the last word. Your voice is measured right here in the page and the recording is never uploaded. Your browser’s speech recognition (Apple or Google) turns your words into text.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-5">
                <Ring fraction={expected.length ? follow.next / expected.length : 0} colour="#2E5B3E" size={80}>
                  {clock(recorder.seconds)}
                </Ring>
                <div className="flex flex-col">
                  <span className="flex items-center gap-2 font-semibold">
                    <motion.span className="inline-block h-3 w-3 rounded-full bg-[#C2412C]" animate={still ? undefined : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                    Listening
                  </span>
                  <span className="text-muted">{finished ? "That’s the end. Nicely done." : `${follow.next} of ${expected.length} words`}</span>
                </div>
                <Meter level={recorder.level} />
                <motion.button type="button" onClick={() => void stopReading()} whileTap={still ? undefined : { scale: 0.92 }} transition={SPRING} className="ml-auto min-h-13 rounded-full bg-ink px-8 text-lg font-bold text-paper">
                  Stop
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : null}

        {view === "working" ? (
          <motion.div key="working" {...pop} className="flex flex-col items-center gap-4 py-10 text-center">
            <motion.span className="h-4 w-4 rounded-full bg-accent" animate={still ? undefined : { y: [0, -16, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
            <span className="text-lg text-muted">Checking your reading…</span>
          </motion.div>
        ) : null}

        {view === "done" && take ? (
          <motion.div key="done" {...pop}>
            <ReadResults
              passage={passage}
              take={take}
              last={lastTake}
              audioUrl={audioUrl}
              onAgain={() => void startReading(true)}
              onOther={() => choose((pick + 1) % PASSAGES.length)}
              otherTitle={PASSAGES[(pick + 1) % PASSAGES.length]?.title ?? ""}
            />
          </motion.div>
        ) : null}

        {view === "unsupported" ? (
          <motion.div key="unsupported" {...pop} className="flex flex-col items-start gap-4">
            <h2 className="m-0 font-serif text-3xl font-semibold">This browser can’t listen yet.</h2>
            <p className="m-0 text-lg text-muted">Read aloud uses your browser’s speech recognition. Try Chrome, Edge or Safari (on a Mac, iPhone or iPad).</p>
            <BouncyLink href="/waitlist">Join the waitlist instead</BouncyLink>
          </motion.div>
        ) : null}

        {view === "blocked" ? (
          <motion.div key="blocked" {...pop} className="flex flex-col items-start gap-4">
            <h2 className="m-0 font-serif text-3xl font-semibold">The microphone is switched off for this site.</h2>
            <p className="m-0 text-lg text-muted">Allow the microphone in your browser’s site settings (the icon next to the address), then try again.</p>
            <button type="button" onClick={() => setStage("ready")} className="min-h-12 rounded-full bg-accent px-6 text-lg font-bold text-white">
              Try again
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
