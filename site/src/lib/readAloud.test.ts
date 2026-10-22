import { describe, expect, it } from "vitest";
import { alignReading } from "@/core/readAlong";
import { PASSAGES, analyseReading, readingHeadline, readingTip } from "./readAloud";

const moon = PASSAGES[0]!;
const words = moon.body.split(/\s+/);
const pauses = { count: 2, averageSeconds: 0.8, longestSeconds: 1, speakingPercent: 80 };

describe("Read aloud passages", () => {
  it("offers the two passages copied from the app", () => {
    expect(PASSAGES.map((p) => p.title)).toEqual(["We choose to go to the moon", "The man in the arena"]);
    for (const passage of PASSAGES) expect(passage.body.split(/\s+/).length).toBeGreaterThan(50);
  });
});

describe("readingTip", () => {
  const steady = { perMinute: 140, seconds: 35, pauses, tip: "The voice tip." };

  it("asks for the end of the passage when the reading stopped early", () => {
    const check = alignReading(moon.body, words.slice(0, 30).join(" "));
    expect(check.stoppedEarly).toBe(true);
    expect(readingHeadline(check)).toBe("You read the first 30 words.");
    expect(readingTip(check, steady)).toMatch(/to the end/);
  });

  it("asks for clearer words when many weren't caught", () => {
    const check = alignReading(moon.body, words.filter((_, i) => i % 4 !== 0).join(" "));
    expect(check.percentRead).toBeLessThan(85);
    expect(readingTip(check, steady)).toMatch(/weren’t caught/);
  });

  it("slows a fast reader, then wants a pause, then falls back to the voice tip", () => {
    const check = alignReading(moon.body, moon.body);
    expect(readingHeadline(check)).toBe("You read 100% of the words.");
    expect(readingTip(check, { ...steady, perMinute: 190 })).toMatch(/190 words a minute/);
    expect(readingTip(check, { ...steady, pauses: { ...pauses, count: 0 } })).toMatch(/didn’t pause/);
    expect(readingTip(check, steady)).toBe("The voice tip.");
  });
});

describe("analyseReading", () => {
  it("measures the reading against the passage, and the voice as Rapid Fire does", () => {
    const heard = words.filter((w) => w !== "hard,").join(" ");
    const reading = analyseReading({ transcript: heard, spokenTimes: [], levels: [], pitches: [], seconds: 30 }, moon.body);
    expect(reading.check.missed).toBe(1);
    expect(reading.check.words.find((w) => !w.read)?.text).toBe("hard,");
    expect(reading.perMinute).toBe(Math.round(((words.length - 1) / 30) * 60));
    expect(reading.pitch).toBeNull();
  });
});
