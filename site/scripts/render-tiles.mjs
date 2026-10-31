// Draws some of the app's course tiles as plain SVG for the site, straight from the app's own tile code, so the
// site's pictures are exactly the app's. Usage: node scripts/render-tiles.mjs /path/to/Table-Topics
// Writes src/data/tiles.json: each tile's SVG markup (theme classes kept; src/app/globals.css gives them colours)
// and its lesson name. Re-run after the app's tiles change, or to add one to TILES below.
import { cpSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

// Vite comes with Vitest (a dev dependency), so load it from there
const fromVitest = createRequire(createRequire(import.meta.url).resolve("vitest/package.json"));
const { createServer } = await import(pathToFileURL(fromVitest.resolve("vite")).href);

const app = process.argv[2];
if (!app) {
  console.error("Usage: node scripts/render-tiles.mjs /path/to/Table-Topics");
  process.exit(1);
}
const site = join(dirname(fileURLToPath(import.meta.url)), "..");

// The tiles the site uses: the hero's, then the lessons in the banner (tile name and lesson name)
const TILES = [
  ["speech-run", "The run"],
  ["buy-a-beat", "Buy a beat"],
  ["answer-with-a-hook", "Answer with a hook"],
  ["open-strong", "Open strong"],
  ["key-word", "Stress the key word"],
  ["start-in-the-middle", "Start in the middle"],
  ["point-first", "Point first"],
  ["one-level-deeper", "One level deeper"],
  ["slow-the-moment", "Slow down the moment"],
  ["star-answer", "The STAR answer"],
  ["land-it", "Land it"],
  ["react-to-the-moment", "React to the moment"],
  ["raise-the-glass", "Raise the glass"],
  ["bring-it-to-life", "Bring it to life"],
  ["land-it-low", "Land it low"],
];

// Copy the app's drawing code into a scratch folder inside the site, so it finds this site's React, then load it
// through Vite with the app's "@/" paths
const scratch = join(site, ".tiles-scratch");
rmSync(scratch, { recursive: true, force: true });
cpSync(join(app, "src/components/scenes"), join(scratch, "src/components/scenes"), { recursive: true });
const server = await createServer({
  root: site,
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
  resolve: { alias: [{ find: /^@\//, replacement: join(scratch, "src") + "/" }] },
  oxc: { jsx: { runtime: "automatic" } },
});
try {
  const { CourseTile } = await server.ssrLoadModule(join(scratch, "src/components/scenes/CourseTile.tsx"));
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const out = {};
  for (const [name, label] of TILES) {
    // Each tile's clip id made unique and readable
    const svg = renderToStaticMarkup(createElement(CourseTile, { name, motion: "loop" })).replace(/tile-[a-zA-Z0-9-]+/g, `tile-${name}`);
    out[name] = { label, svg };
  }
  writeFileSync(join(site, "src/data/tiles.json"), JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${TILES.length} tiles to src/data/tiles.json`);
} finally {
  await server.close();
  rmSync(scratch, { recursive: true, force: true });
}
