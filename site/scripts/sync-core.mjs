// Copies the app's measuring code into the site, unchanged, so the free Rapid Fire measures exactly as the app does.
// Usage: node scripts/sync-core.mjs /path/to/Table-Topics
// The files land in src/core/ (the same "@/core/..." paths the app uses). Re-run after the app's analysis changes.
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const app = process.argv[2];
if (!app) {
  console.error("Usage: node scripts/sync-core.mjs /path/to/Table-Topics");
  process.exit(1);
}

// The app files the free Rapid Fire uses, and what they need
const FILES = [
  "core/pitch.ts", // pitch tracker (YIN) and endings
  "core/pitchClean.ts", // cleaning and smoothing the readings
  "core/pitchPhrases.ts", // phrases, endings, peaks, flat phrases, word heights
  "core/wordAlign.ts", // placing words in time from when the browser heard them
  "core/pauses.ts", // pauses and fading endings from loudness
  "core/liveReading.ts", // noting when each word was first heard
  "core/readAlong.ts", // used by the two above
  "core/fillers.ts", // pause-word counting
  "core/analysis/lexicon.ts", // small words vs words that carry meaning
];

for (const file of FILES) {
  const to = join("src", file);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(join(app, "src", file), to);
  console.log("copied", file);
}

// wordAlign imports one type from the app's database code; this stands in for it
writeFileSync(
  "src/data/records.ts",
  `// Stand-in for the one type the copied app code needs from the app's database code (see scripts/sync-core.mjs)\nexport interface ServerWord {\n  text: string;\n  w: string;\n  s: number;\n  e: number;\n}\n`,
);
writeFileSync(
  "src/core/README.md",
  "# Copied from the VoiceLab app\n\nThese files are copied unchanged from the app (`riqs07/table-topics`, `src/core/`) by `scripts/sync-core.mjs`, so the free Rapid Fire measures exactly as the app does. Don't edit them here: change them in the app and re-run the script.\n",
);
