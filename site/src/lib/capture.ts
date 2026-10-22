// The microphone, as the app reads it: a recording kept in memory for listening back, and loudness and pitch
// read ten times a second with the app's pitch tracker. Nothing is uploaded.
import { detectPitch } from "@/core/pitch";

export type Capture = {
  level: () => number;
  pitch: () => number | null;
  stop: () => Promise<Blob>;
};

// Loudness of a slice of the waveform (root mean square, 0 to 1), as in the app
function rms(samples: Float32Array): number {
  let total = 0;
  for (const sample of samples) total += sample * sample;
  return Math.min(1, Math.sqrt(total / Math.max(1, samples.length)));
}

// Open the microphone and start recording. Throws if the person says no.
export async function openCapture(): Promise<Capture> {
  // The app turns off the browser's automatic levelling so loudness readings mean something
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { autoGainControl: false, noiseSuppression: true, echoCancellation: true } });
  const chunks: Blob[] = [];
  const recorder = typeof MediaRecorder !== "undefined" ? new MediaRecorder(stream, { audioBitsPerSecond: 32_000 }) : null;
  if (recorder) {
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.start(1000);
  }
  const context = new AudioContext();
  const source = context.createMediaStreamSource(stream);
  const levelReader = context.createAnalyser();
  levelReader.fftSize = 512;
  source.connect(levelReader);
  const pitchReader = context.createAnalyser();
  // About 40 ms, long enough for a deep voice
  pitchReader.fftSize = 2048;
  source.connect(pitchReader);
  const levelSamples = new Float32Array(levelReader.fftSize);
  const pitchSamples = new Float32Array(pitchReader.fftSize);

  return {
    level: () => {
      levelReader.getFloatTimeDomainData(levelSamples);
      return rms(levelSamples);
    },
    pitch: () => {
      pitchReader.getFloatTimeDomainData(pitchSamples);
      return detectPitch(pitchSamples, context.sampleRate);
    },
    stop: () =>
      new Promise((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          stream.getTracks().forEach((track) => track.stop());
          void context.close();
          resolve(new Blob(chunks, { type: recorder?.mimeType || "audio/webm" }));
        };
        if (recorder && recorder.state !== "inactive") {
          recorder.onstop = finish;
          window.setTimeout(finish, 3000);
          recorder.stop();
        } else finish();
      }),
  };
}
