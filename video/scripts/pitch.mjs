// Measures pitch in voice files with the app's own tracker (Table-Topics src/core/pitch.ts and pitchClean.ts),
// so the video's lines match what the app would draw. Writes src/content/pitch.json.
// Usage: node scripts/pitch.mjs /path/to/Table-Topics audio/sound-check/take1.mp3 [more files]
import {execFileSync} from 'node:child_process';
import {mkdirSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const [app, ...files] = process.argv.slice(2);
const vendor = join(process.cwd(), 'out/vendor');
mkdirSync(vendor, {recursive: true});
writeFileSync(join(vendor, 'pitch.ts'), readFileSync(join(app, 'src/core/pitch.ts'), 'utf8'));
writeFileSync(
  join(vendor, 'pitchClean.ts'),
  readFileSync(join(app, 'src/core/pitchClean.ts'), 'utf8').replace('"@/core/pitch"', '"./pitch.ts"'),
);
const {detectPitch} = await import(pathToFileURL(join(vendor, 'pitch.ts')).href);
const {cleanSteps, smoothForDrawing} = await import(pathToFileURL(join(vendor, 'pitchClean.ts')).href);

const RATE = 16000;
const TICK_MS = 10;
const WINDOW = 0.04 * RATE;
const outFile = 'src/content/pitch.json';
const out = existsSync(outFile) ? JSON.parse(readFileSync(outFile, 'utf8')) : {};
for (const file of files) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', join('public', file), '-ac', '1', '-ar', String(RATE), '-f', 'f32le', '-']);
  const pcm = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  const readings = [];
  for (let at = 0; at + WINDOW <= pcm.length; at += (TICK_MS / 1000) * RATE) readings.push(detectPitch(pcm.subarray(at, at + WINDOW), RATE));
  const {steps, usualHz} = cleanSteps(readings, TICK_MS);
  const smooth = smoothForDrawing(steps).map((v) => (v === null ? null : Math.round(v * 100) / 100));
  out[file] = {tickMs: TICK_MS, usualHz: usualHz && Math.round(usualHz), steps: smooth};
  const voiced = smooth.filter((v) => v !== null);
  console.log(file, 'readings', smooth.length, 'voiced', voiced.length, 'range', Math.min(...voiced).toFixed(1), Math.max(...voiced).toFixed(1));
}
writeFileSync(outFile, JSON.stringify(out) + '\n');
