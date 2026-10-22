"use client";
// One recorded take, shared by the free Rapid Fire and Read aloud: the microphone recorded in page memory, loudness
// and pitch read ten times a second with the app's own code, and the words from the browser's speech recognition
// (Apple or Google), with when each word was first heard. Nothing is uploaded or kept.
import { useEffect, useRef, useState } from "react";
import { stampSpoken } from "@/core/liveReading";
import { openCapture, type Capture } from "./capture";
import { TICK_MS, type RawTake } from "./freeTake";

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

// Whether this browser can listen and record at all
export function canListen(): boolean {
  return recognitionClass() !== null && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

export type Finished = { raw: RawTake; audio: Blob | null };

export function useTake() {
  const [live, setLive] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");

  const recognition = useRef<Recognition | null>(null);
  const capture = useRef<Capture | null>(null);
  const talking = useRef(false);
  const startedAt = useRef(0);
  const finalRef = useRef("");
  const interimRef = useRef("");
  const spokenTimes = useRef<number[]>([]);
  const levels = useRef<number[]>([]);
  const pitches = useRef<(number | null)[]>([]);

  // While live: read loudness and pitch ten times a second (as the app does) and run the clock
  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      setSeconds((performance.now() - startedAt.current) / 1000);
      const mic = capture.current;
      if (mic) {
        const reading = mic.level();
        levels.current.push(reading);
        pitches.current.push(mic.pitch());
        setLevel(reading);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [live]);

  // Let go of the microphone if the page goes away mid-take
  useEffect(
    () => () => {
      talking.current = false;
      recognition.current?.stop();
      void capture.current?.stop();
    },
    [],
  );

  // Open the microphone and start listening. Says why if it can't.
  async function start(): Promise<"ok" | "unsupported" | "blocked"> {
    const Recog = recognitionClass();
    if (!Recog) return "unsupported";
    try {
      capture.current = await openCapture();
    } catch {
      return "blocked";
    }
    const rec = new Recog();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = navigator.language || "en-US";
    rec.onresult = (event) => {
      let heardNow = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (!item) continue;
        if (item.isFinal) finalRef.current += ` ${item[0].transcript}`;
        else heardNow += ` ${item[0].transcript}`;
      }
      interimRef.current = heardNow.trim();
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
        recognition.current?.stop();
        void capture.current?.stop();
        capture.current = null;
        setLive(false);
        setBlocked(true);
      }
    };
    // Some browsers stop listening after a silence; keep going until the take is stopped
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
    setBlocked(false);
    recognition.current = rec;
    talking.current = true;
    startedAt.current = performance.now();
    try {
      rec.start();
    } catch {
      talking.current = false;
      void capture.current?.stop();
      capture.current = null;
      return "unsupported";
    }
    setLive(true);
    return "ok";
  }

  // Stop, wait a moment for the last words, and hand back everything measured (null if no take was running)
  async function stop(): Promise<Finished | null> {
    if (!talking.current) return null;
    talking.current = false;
    recognition.current?.stop();
    const spoken = (performance.now() - startedAt.current) / 1000;
    setLive(false);
    const audio = (await capture.current?.stop()) ?? null;
    capture.current = null;
    // Give the last words a moment to arrive
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    const transcript = `${finalRef.current} ${interimRef.current}`.trim();
    const count = transcript.split(/\s+/).filter(Boolean).length;
    const spokenAt = stampSpoken(spokenTimes.current, count, spoken).slice(0, count);
    return { raw: { transcript, spokenTimes: spokenAt, levels: levels.current, pitches: pitches.current, seconds: spoken }, audio: audio && audio.size > 0 ? audio : null };
  }

  return { live, blocked, seconds, level, finalText, interim, start, stop };
}
