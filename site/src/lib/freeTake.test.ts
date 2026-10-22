import { describe, expect, it } from "vitest";
import { analyseTake, TICK_MS, type RawTake } from "./freeTake";

// A made-up take: "Then the gorilla just stared at me" rising at the end, a pause, then "and it walked away" falling
function syntheticTake(): RawTake {
  const seconds = 6.5;
  const ticks = Math.round((seconds * 1000) / TICK_MS);
  const levels: number[] = [];
  const pitches: (number | null)[] = [];
  for (let i = 0; i < ticks; i++) {
    const t = (i * TICK_MS) / 1000;
    const first = t >= 0.5 && t < 3.0;
    const second = t >= 3.9 && t < 6.0;
    levels.push(first || second ? 0.2 + 0.02 * Math.sin(i) : 0.004);
    if (first) pitches.push(t < 2.4 ? 150 + 4 * Math.sin(i / 2) : 150 + ((t - 2.4) / 0.6) * 90);
    else if (second) pitches.push(t < 5.3 ? 150 + 4 * Math.sin(i / 2) : 150 - ((t - 5.3) / 0.7) * 45);
    else pitches.push(null);
  }
  const firstWords = "Then the gorilla just stared at me".split(" ");
  const secondWords = "and it walked away".split(" ");
  const spokenTimes = [
    ...firstWords.map((_, i) => 0.5 + (i + 1) * (2.5 / firstWords.length) + 0.6),
    ...secondWords.map((_, i) => 3.9 + (i + 1) * (2.1 / secondWords.length) + 0.6),
  ];
  return { transcript: [...firstWords, ...secondWords].join(" "), spokenTimes, levels, pitches, seconds };
}

describe("analyseTake (the app's measuring code, in the browser)", () => {
  it("finds the phrases, the rising statement and the pause", () => {
    const take = analyseTake(syntheticTake());
    expect(take.pitch).not.toBeNull();
    const endings = take.pitch!.phrases.map((p) => p.ending);
    expect(endings).toContain("rose");
    expect(take.rising).toBeGreaterThanOrEqual(1);
    expect(take.pauses.count).toBeGreaterThanOrEqual(1);
    expect(take.tip).toMatch(/went up at the end of a statement/);
    expect(take.words).toBe(11);
  });

  it("copes with a take that has no voice readings", () => {
    const take = analyseTake({ transcript: "hello there", spokenTimes: [1, 2], levels: [0, 0, 0], pitches: [null, null, null], seconds: 3 });
    expect(take.pitch).toBeNull();
    expect(take.notes).toEqual([]);
    expect(take.tip).toMatch(/didn't catch much/);
  });

  it("counts pause words with the app's rules", () => {
    const take = analyseTake({ transcript: "I um think uh it was erm fine", spokenTimes: [], levels: [], pitches: [], seconds: 10 });
    expect(take.pauseWords).toBe(3);
  });
});
