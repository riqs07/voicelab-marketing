// Films the demo's raw material from the real app: phone-size screenshots at 3x, plus where the
// interesting parts are on each one (for zooms and taps). Run with capture/run.sh, never in the app's CI.
import {writeFileSync, mkdirSync} from 'node:fs';
import type {Locator, Page} from '@playwright/test';
import {expect, test, useStandIns} from './support/fixtures';
import {seedTakes} from './support/seed';
import {zooSeed} from './support/pitchSeeds';

const OUT = process.env.DEMO_OUT as string;
const shots: Record<string, {file: string; boxes: Record<string, {x: number; y: number; w: number; h: number}>}> = {};

test.use({viewport: {width: 390, height: 844}, deviceScaleFactor: 3});

// A viewport screenshot plus the boxes of the given parts, in screenshot points (390 x 844).
async function shot(page: Page, name: string, parts: Record<string, Locator> = {}) {
  await page.waitForTimeout(400);
  const boxes: Record<string, {x: number; y: number; w: number; h: number}> = {};
  for (const [k, loc] of Object.entries(parts)) {
    const b = await loc.first().boundingBox();
    if (b) boxes[k] = {x: b.x, y: b.y, w: b.width, h: b.height};
  }
  await page.screenshot({path: `${OUT}/${name}.png`, animations: 'disabled', caret: 'hide'});
  shots[name] = {file: `demo/${name}.png`, boxes};
}

// Put a part near the top third of the screen.
async function bring(page: Page, loc: Locator) {
  await loc.first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    window.scrollBy({top: r.top - 150, behavior: 'instant'});
  });
}

test('demo capture', async ({page}) => {
  test.setTimeout(120_000);
  mkdirSync(OUT, {recursive: true});
  // What the stand-in microphone "hears", matching the question
  await useStandIns(page, 'Honestly I am a morning person now but only because my dog wakes me at six every single day');
  // Sample takes: the zoo story told once (ending rose) and again (ending fell)
  await seedTakes(page, zooSeed());

  // 1. A Rapid Fire question
  await page.goto('/session?mode=talk&prompt=t001');
  await shot(page, '01-start', {show: page.getByRole('button', {name: /Show my topic/})});
  await page.getByRole('button', {name: /Show my topic/}).click();
  await page.waitForTimeout(1200);
  await shot(page, '02-think', {});
  // 2. Talking, with the timing lights
  const stop = page.getByRole('button', {name: /Stop/});
  await expect(stop).toBeVisible({timeout: 15_000});
  await page.waitForTimeout(4000);
  await shot(page, '03-talking', {stop});

  // 3. A take's results, then its pitch in the words
  await page.goto('/sessions?id=seeded-zoo');
  const voice = page.getByRole('region', {name: 'Your voice'});
  await expect(voice.locator('[data-pitch-text]')).toBeVisible();
  await shot(page, '04-results', {});
  await bring(page, voice.locator('[data-pitch-text]'));
  await shot(page, '05-pitch', {
    text: voice.locator('[data-pitch-text]'),
    rose: voice.getByRole('img', {name: 'ending rose'}),
  });

  // 4. The one change
  const change = page.getByText('Let “me” drop at the end.');
  await bring(page, change);
  await shot(page, '06-change', {change});

  // Tap a word to hear it
  await page.goto('/sessions/voice?id=seeded-zoo');
  const me = page.getByRole('button', {name: /^me, 0:\d\d, play from here$/});
  await bring(page, page.locator('[data-phrase-row="3"]'));
  await shot(page, '07-phrases', {me, row: page.locator('[data-phrase-row="3"]')});
  await me.click();
  await page.waitForTimeout(150);
  await shot(page, '08-tapped', {me, row: page.locator('[data-current]')});

  // 5. Say it again: the second try over the first
  await page.goto('/sessions?id=seeded-again');
  const card = page.getByRole('region', {name: 'Your ending used to rise. Now it falls.'});
  await expect(card).toBeVisible();
  await bring(page, card);
  await shot(page, '09-again', {card});

  writeFileSync(`${OUT}/shots.json`, JSON.stringify(shots, null, 2));
});
