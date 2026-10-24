// Copies finished posts into the scheduler's library (the voicelab-content repository), one folder per post,
// in the layout it expects: <name>.mp4 + cover.png + caption.md for a Reel, numbered images + caption.md for
// a carousel. Only the 9:16 video goes; the 4:5 version stays in renders/ for other platforms.
// Usage, from video/ (voicelab-content cloned next to voicelab-marketing):
//   node scripts/to-library.mjs Overview TalkBack        Reels, by their name in renders/batch-*/
//   node scripts/to-library.mjs --carousel nerves-um      a carousel from renders/carousels/
//   add --to /path/to/voicelab-content/library to put them somewhere else
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const toAt = args.indexOf("--to");
const library = resolve(toAt >= 0 ? args[toAt + 1] : "../../voicelab-content/library");
const names = args.filter((arg, i) => !arg.startsWith("--") && args[i - 1] !== "--to");
const carousel = args.includes("--carousel");
if (names.length === 0) {
  console.error("Usage: node scripts/to-library.mjs <ReelName>... | --carousel <id>... [--to <library folder>]");
  process.exit(1);
}
if (!existsSync(library)) throw new Error(`No library at ${library}. Clone voicelab-content next to voicelab-marketing, or pass --to.`);

const renders = resolve("../renders");
const kebab = (name) => name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

// The "## N. Title" section of a batch's captions.md that names this video, with its caption block
function captionFor(batch, file) {
  const path = join(renders, batch, "captions.md");
  if (!existsSync(path)) return null;
  for (const section of readFileSync(path, "utf8").split(/\n(?=## )/)) {
    const video = /Video:\s*`([^`]+\.mp4)`/.exec(section);
    const heading = /^## (?:\d+\.\s*)?(.+)$/m.exec(section);
    const caption = /```[^\n]*\n([\s\S]*?)\n```/.exec(section);
    if (video?.[1] === file && heading && caption) return `# ${heading[1].trim()}\n\n\`\`\`\n${caption[1].trim()}\n\`\`\`\n`;
  }
  return null;
}

for (const name of names) {
  if (carousel) {
    const from = join(renders, "carousels", name);
    if (!existsSync(from)) throw new Error(`No carousel renders/carousels/${name}`);
    const to = join(library, name);
    mkdirSync(to, { recursive: true });
    for (const file of readdirSync(from).filter((file) => /\.(png|jpe?g|md|txt)$/i.test(file))) copyFileSync(join(from, file), join(to, file));
    console.log("copied carousel", name, "→", to);
    continue;
  }
  const batch = readdirSync(renders)
    .filter((dir) => dir.startsWith("batch-"))
    .find((dir) => existsSync(join(renders, dir, `${name}-story.mp4`)));
  if (!batch) throw new Error(`No ${name}-story.mp4 in renders/batch-*/ (render the 9:16 version first)`);
  const to = join(library, kebab(name));
  mkdirSync(to, { recursive: true });
  copyFileSync(join(renders, batch, `${name}-story.mp4`), join(to, `${kebab(name)}.mp4`));
  const cover = join(renders, batch, "covers", `${name}-cover.png`);
  if (existsSync(cover)) copyFileSync(cover, join(to, "cover.png"));
  else console.warn(`  no cover: render covers/${name}-cover.png too (see Guidelines for new videos)`);
  const caption = captionFor(batch, `${name}-story.mp4`);
  if (caption) writeFileSync(join(to, "caption.md"), caption);
  else console.warn(`  no caption: add a section for ${name}-story.mp4 to renders/${batch}/captions.md`);
  console.log("copied Reel", name, "→", to);
}
console.log("Open the scheduler (pnpm schedule in voicelab-content) to schedule them.");
