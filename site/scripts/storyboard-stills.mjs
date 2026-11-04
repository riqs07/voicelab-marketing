// Takes the home page's stills straight from the app's redesign storyboard, so the site shows exactly the storyboard's
// screens. Usage: node scripts/storyboard-stills.mjs /path/to/Table-Topics
// Opens documents/design/redesign/storyboard.html in Chromium and saves each screen in STILLS below (phone and all, with
// see-through corners) to public/stills/<name>.png at twice its size. Re-run after the storyboard changes.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const app = process.argv[2];
if (!app) {
  console.error("Usage: node scripts/storyboard-stills.mjs /path/to/Table-Topics");
  process.exit(1);
}
const site = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(site, "public", "stills");
mkdirSync(out, { recursive: true });

// The storyboard's screen numbers (as printed on it) and the file each is saved as; the user picked these five
const STILLS = [
  [12, "practice"],
  [9, "good-take"],
  [22, "myth-or-fact"],
  [23, "todays-mission"],
  [29, "then-and-now"],
];

// The same Chromium Playwright uses; CHROMIUM_PATH points at another one, as for the browser tests
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(join(app, "documents/design/redesign/storyboard.html")).href);
// Let the fonts load, hide the storyboard's sticky chapter bar (it would cover a phone), and clear every background
// around the phones so only the phone is drawn
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: ".bar { display: none !important; }" });
await page.evaluate(() => {
  for (const phone of document.querySelectorAll(".p")) {
    for (let el = phone.parentElement; el; el = el.parentElement) el.style.background = "transparent";
  }
});
for (const [n, name] of STILLS) {
  const phone = page.locator(`.p[data-s="${n - 1}"]`);
  await phone.screenshot({ path: join(out, `${name}.png`), omitBackground: true, animations: "disabled" });
  console.log(`Saved screen ${n} as public/stills/${name}.png`);
}
await browser.close();
