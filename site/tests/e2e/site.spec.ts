import { expect, test, type Page } from "@playwright/test";
import passages from "../../src/data/passages.json" with { type: "json" };

// Fail on any console error or uncaught exception
function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") problems.push(message.text());
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}

// A stand-in for the browser's speech recognition that "hears" one word every 120 ms
async function standInSpeech(page: Page, spoken: string) {
  await page.addInitScript((words: string) => {
    class StandIn {
      continuous = false;
      interimResults = false;
      lang = "en-US";
      onresult: ((e: unknown) => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onend: (() => void) | null = null;
      private timer: number | null = null;
      private said: string[] = [];
      start() {
        const list = words.split(" ");
        this.timer = window.setInterval(() => {
          const next = list[this.said.length];
          if (next === undefined) return;
          this.said.push(next);
          const item = { isFinal: true, 0: { transcript: ` ${next}` }, length: 1 };
          this.onresult?.({ resultIndex: this.said.length - 1, results: Object.assign([], this.said.map(() => item), { length: this.said.length }) });
        }, 120);
      }
      stop() {
        if (this.timer) window.clearInterval(this.timer);
      }
    }
    Object.assign(window, { SpeechRecognition: StandIn, webkitSpeechRecognition: StandIn });
  }, spoken);
}

test("home page: hero, animations, videos and calls to action", async ({ page }) => {
  const problems = watchConsole(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Hear how you really sound." })).toBeVisible();
  await expect(page.getByRole("img", { name: /The blob running toward a finish flag/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Try a free Rapid Fire" }).first()).toHaveAttribute("href", "/try");
  await expect(page.getByRole("link", { name: "Join the waitlist" }).first()).toHaveAttribute("href", "/waitlist");
  // The jar fills when scrolled into view
  await page.getByRole("heading", { name: "Um rain" }).scrollIntoViewIfNeeded();
  await expect(page.getByText("12 pause words in 20 seconds.")).toBeVisible({ timeout: 10_000 });
  // The talk lanes switch tries
  await page.getByRole("button", { name: "Second try" }).click();
  await expect(page.getByText("About even, and you asked back.")).toBeVisible();
  await expect(page.getByText("59%")).toBeVisible({ timeout: 5_000 });
  // Three reels and the demo
  await expect(page.locator("video")).toHaveCount(4);
  expect(problems).toEqual([]);
});

test("home page: the Practice menu and the mode showcases", async ({ page }) => {
  const problems = watchConsole(page);
  // Count clips started instead of playing sound
  await page.addInitScript(() => {
    (window as unknown as { played: string[] }).played = [];
    HTMLMediaElement.prototype.play = function () {
      (window as unknown as { played: string[] }).played.push(this.src);
      return Promise.resolve();
    };
  });
  await page.goto("/");
  await page.getByRole("heading", { name: "Inside the app" }).scrollIntoViewIfNeeded();
  // The menu shows the app's groups, and its rows link to their showcase
  await expect(page.getByText("Everyday conversation", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Talk with someone/ })).toHaveAttribute("href", "#mode-people");
  await expect(page.getByRole("link", { name: /Read aloud/ }).first()).toHaveAttribute("href", "#mode-read");
  await expect(page.getByRole("link", { name: "Try Read aloud free" })).toHaveAttribute("href", "/try?mode=read");
  // The read-along tile plays its reader
  await page.getByRole("button", { name: /Hear it read/ }).click();
  // Stress shift: picking a take moves the meaning and plays its recording
  await page.getByRole("button", { name: "▶ “stole”" }).click();
  await expect(page.getByText("means: She borrowed it.")).toBeVisible();
  // The guided story's nudges arrive after its facts
  await page.getByRole("heading", { name: "You get the facts. You make it a story." }).scrollIntoViewIfNeeded();
  await expect(page.getByText("+ How did it get in the fridge?")).toBeVisible({ timeout: 5_000 });
  // Each person plays their own opening line
  await page.getByRole("button", { name: "Theo: play their opening line" }).click();
  await expect(page.getByText("“Oh, hi. Are you here for the ten o’clock too?”")).toBeVisible();
  await page.getByRole("button", { name: "Shuffle" }).click();
  await expect(page.getByText("Early for a meeting")).toBeVisible();
  const played = await page.evaluate(() => (window as unknown as { played: string[] }).played);
  // Videos on the page may also call play(); only the sound clips matter here
  expect(played.map((src) => new URL(src, "http://localhost").pathname).filter((path) => path.startsWith("/audio/"))).toEqual(["/audio/read-along/moon.mp3", "/audio/stress-shift/s4.mp3", "/audio/people/theo-01.mp3"]);
  expect(problems).toEqual([]);
});

test("waitlist: join with goals and see the success state", async ({ page }) => {
  const problems = watchConsole(page);
  let sent: unknown = null;
  await page.route("**/api/waitlist", async (route) => {
    sent = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/waitlist");
  await page.getByLabel("Email").fill("me@example.com");
  await page.getByRole("button", { name: "Small talk" }).click();
  await page.getByRole("button", { name: "iPhone" }).click();
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.getByRole("status")).toHaveText("You’re on the list.");
  expect(sent).toEqual({ email: "me@example.com", goals: ["Small talk"], phone: "iPhone", website: "" });
  expect(problems).toEqual([]);
});

test("waitlist: the real route checks the email and needs a key", async ({ page, request }) => {
  expect((await request.post("/api/waitlist", { data: { email: "nope" } })).status()).toBe(400);
  const noKey = await request.post("/api/waitlist", { data: { email: "me@example.com" } });
  expect(noKey.status()).toBe(503);
  // A filled hidden field is treated as a bot: a quiet yes, nothing sent anywhere
  expect((await request.post("/api/waitlist", { data: { email: "me@example.com", website: "x" } })).status()).toBe(200);
  // The page shows the route's message
  await page.goto("/waitlist");
  await page.getByLabel("Email").fill("me@example.com");
  await page.getByRole("button", { name: "Join the waitlist" }).click();
  await expect(page.locator("#waitlist-error")).toHaveText("The waitlist isn't open yet. Please try again soon.");
});

test("free Rapid Fire: question, talk, stop, results measured in the browser", async ({ page }) => {
  const problems = watchConsole(page);
  await standInSpeech(page, "um I am a morning person because uh the light is calm and the coffee tastes better");
  await page.goto("/try");
  await page.getByRole("button", { name: "Show my question" }).click();
  await expect(page.getByText("Your question")).toBeVisible();
  await page.getByRole("button", { name: "Start now" }).click();
  await expect(page.getByText("Listening")).toBeVisible();
  await expect(page.getByText("coffee")).toBeVisible({ timeout: 5_000 });
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.getByText("One thing to try:")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("A little short of a minute.")).toBeVisible();
  await expect(page.getByText(/pause words? heard/)).toBeVisible();
  // The recording is there to play back, from memory
  await expect(page.locator("audio[src^='blob:']")).toHaveCount(1);
  // The note about the full version's deeper analysis
  await expect(page.getByText(/In the full version, portions of your voice are sent to our server for deeper analysis/)).toBeVisible();
  // More detail behind "See more"
  await page.getByRole("button", { name: "See more" }).click();
  await expect(page.getByText(/words at \d+ a minute/)).toBeVisible();
  // Try again keeps the question and compares with the last try
  await page.getByRole("button", { name: "Try it again" }).click();
  await expect(page.getByText("seconds to think")).toBeVisible();
  expect(problems).toEqual([]);
});

test("free Read aloud: the toggle, words lighting up, stopping by itself, and the reading checked", async ({ page }) => {
  const problems = watchConsole(page);
  // The stand-in reads the JFK passage but skips "decade"
  const moon = passages[0]!;
  await standInSpeech(page, moon.body.replace(" decade", ""));
  await page.goto("/try");
  // The big toggle switches to Read aloud
  await page.getByRole("navigation", { name: "Free modes" }).getByRole("link", { name: /Read aloud/ }).click();
  await expect(page).toHaveURL(/mode=read/);
  await expect(page.getByRole("button", { name: "We choose to go to the moon" })).toHaveAttribute("aria-pressed", "true");
  // The other passage can be picked, then back
  await page.getByRole("button", { name: "The man in the arena" }).click();
  await expect(page.getByRole("heading", { name: "The man in the arena" })).toBeVisible();
  await page.getByRole("button", { name: "We choose to go to the moon" }).click();
  // The example reading lights the words up as it plays, and can be stopped
  await page.getByRole("button", { name: /Hear it read first/ }).click();
  await expect(page.getByTestId("passage").locator("[data-read='true']").first()).toBeVisible({ timeout: 8_000 });
  await page.getByRole("button", { name: /Stop the example/ }).click();
  await expect(page.getByTestId("passage").locator("[data-read='true']")).toHaveCount(0);
  await page.getByRole("button", { name: "Start reading" }).click();
  await expect(page.getByText("Listening")).toBeVisible();
  // Words light up as they're heard
  await expect(page.getByTestId("passage").locator("[data-read='true']").first()).toBeVisible({ timeout: 5_000 });
  // It stops by itself after the last word
  await expect(page.getByTestId("reading-headline")).toHaveText("You read 98% of the words.", { timeout: 20_000 });
  await expect(page.locator("[data-read='false']")).toHaveText(["decade"]);
  await expect(page.getByText("One thing to try:")).toBeVisible();
  await expect(page.locator("audio[src^='blob:']")).toHaveCount(1);
  await expect(page.getByText(/In the full version, portions of your voice are sent to our server for deeper analysis/)).toBeVisible();
  await page.getByRole("button", { name: "See more" }).click();
  await expect(page.getByText(/1 word not heard/)).toBeVisible();
  // The other passage is one tap away
  await page.getByRole("button", { name: "Read “The man in the arena”" }).click();
  await expect(page.getByRole("button", { name: "Start reading" })).toBeVisible();
  expect(problems).toEqual([]);
});

test("free Rapid Fire: a browser without speech recognition is told so", async ({ page }) => {
  await page.addInitScript(() => {
    Object.assign(window, { SpeechRecognition: undefined, webkitSpeechRecognition: undefined });
  });
  await page.goto("/try");
  await page.getByRole("button", { name: "Show my question" }).click();
  await expect(page.getByRole("heading", { name: "This browser can’t listen yet." })).toBeVisible();
});

test("privacy page and phone layout have no sideways scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/waitlist", "/try", "/try?mode=read", "/privacy"]) {
    await page.goto(path);
    // Scroll through so every section has animated in before measuring
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 400) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(1500);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(wide, path).toBeLessThanOrEqual(0);
  }
});
