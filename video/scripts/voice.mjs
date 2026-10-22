// Makes any missing voice files with ElevenLabs, one take per line, then measures them.
// Needs ELEVENLABS_API_KEY in a file named .env.local next to package.json (never commit it, never paste it in chat).
// Usage: node scripts/voice.mjs [video]     e.g. node scripts/voice.mjs talk-share
// Add --dry to list what would be made, and its rough cost, without spending anything.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = args.find((a) => !a.startsWith('--'));
const env = existsSync('.env.local')
  ? Object.fromEntries(
      readFileSync('.env.local', 'utf8')
        .split('\n')
        .filter((l) => l.includes('=') && !l.startsWith('#'))
        .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
    )
  : {};
const key = env.ELEVENLABS_API_KEY ?? process.env.ELEVENLABS_API_KEY;
const model = env.VOICE_MODEL ?? 'eleven_multilingual_v2';

// The content files are TypeScript; Node 22.18+ reads them directly (types are stripped).
const load = (name) => import(pathToFileURL(join(process.cwd(), `src/content/${name}.ts`)).href);
const brand = await load('brand');
const videos = [];
for (const name of ['soundCheck', 'stressShift', 'talkShare', 'pausePower', 'demo']) {
  const mod = await load(name);
  videos.push(Object.values(mod)[0]);
}

const todo = [];
for (const v of videos) {
  if (only && v.video !== only) continue;
  for (const b of v.beats) {
    const file = `public/audio/${v.video}/${b.id}.mp3`;
    if (!existsSync(file)) todo.push({file, voice: brand.voices[b.voice], text: b.text});
  }
}
const chars = todo.reduce((a, t) => a + t.text.length, 0);
console.log(`${todo.length} lines to make, ${chars} characters (about ${chars} credits at one credit per character).`);
for (const t of todo) console.log(`  ${t.file}  [${t.voice.name}]  ${t.text}`);
if (dry || todo.length === 0) process.exit(0);
if (!key) {
  console.error('No ELEVENLABS_API_KEY in .env.local. Add it there (not in chat) and run again.');
  process.exit(1);
}
for (const t of todo) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${t.voice.id}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {'xi-api-key': key, 'content-type': 'application/json'},
    body: JSON.stringify({text: t.text, model_id: model}),
  });
  if (!res.ok) {
    console.error(`Failed on ${t.file}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  mkdirSync(t.file.slice(0, t.file.lastIndexOf('/')), {recursive: true});
  writeFileSync(t.file, Buffer.from(await res.arrayBuffer()));
  console.log(`Made ${t.file}`);
}
execFileSync('node', ['scripts/durations.mjs'], {stdio: 'inherit'});
