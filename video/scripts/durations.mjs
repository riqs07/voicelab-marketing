// Measures every voice file in public/audio/<video>/ and writes src/content/durations.json,
// so the videos time themselves to the real voice. Run after adding or changing voice files.
import {execFileSync} from 'node:child_process';
import {readdirSync, statSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const root = 'public/audio';
const out = {};
for (const video of readdirSync(root)) {
  const dir = join(root, video);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.mp3'))) {
    const secs = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', join(dir, file)])
      .toString()
      .trim();
    out[`audio/${video}/${file}`] = Math.round(parseFloat(secs) * 1000) / 1000;
  }
}
writeFileSync('src/content/durations.json', JSON.stringify(out, null, 2) + '\n');
console.log(`${Object.keys(out).length} voice files measured.`);
