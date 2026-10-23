// Copies Learn cards from the app into src/content/learnCards.json, word for word, for the carousels.
// Usage: node scripts/learn-card.mjs /path/to/Table-Topics card-id [card-id...]
// Each card is one line in the app's src/content/learn.ts; the object is read as written there.
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';

const [app, ...ids] = process.argv.slice(2);
if (!app || ids.length === 0) {
  console.error('Usage: node scripts/learn-card.mjs /path/to/Table-Topics card-id [card-id...]');
  process.exit(1);
}
const source = readFileSync(join(app, 'src/content/learn.ts'), 'utf8');
const out = 'src/content/learnCards.json';
const cards = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {};
for (const id of ids) {
  const line = source.split('\n').find((l) => l.trim().startsWith(`{ id: "${id}"`));
  if (!line) throw new Error(`No Learn card "${id}" in the app`);
  // The line is a plain object literal from our own app's content file
  cards[id] = Function(`return (${line.trim().replace(/,$/, '')});`)();
  console.log('copied', id);
}
writeFileSync(out, `${JSON.stringify(cards, null, 2)}\n`);
