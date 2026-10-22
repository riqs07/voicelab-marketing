import { describe, expect, it } from "vitest";
import { clock, takeStats, tipFor, tokenize } from "./rapidFire";
import { alreadySubscribed, buttondownRequest, parseSignup } from "./waitlist";

describe("parseSignup", () => {
  it("accepts an email and keeps only known goals and phones", () => {
    const parsed = parseSignup({ email: "  Me@Example.com ", goals: ["Small talk", "Hacking"], phone: "iPhone" });
    expect(parsed).toEqual({ kind: "signup", signup: { email: "me@example.com", goals: ["Small talk"], phone: "iPhone" } });
  });

  it("rejects a bad email", () => {
    expect(parseSignup({ email: "not-an-email" }).kind).toBe("invalid");
    expect(parseSignup({ email: "a@b" }).kind).toBe("invalid");
    expect(parseSignup(null).kind).toBe("invalid");
  });

  it("treats a filled hidden field as a bot", () => {
    expect(parseSignup({ email: "me@example.com", website: "spam.biz" })).toEqual({ kind: "bot" });
  });

  it("ignores an unknown phone", () => {
    const parsed = parseSignup({ email: "me@example.com", phone: "Nokia" });
    expect(parsed.kind === "signup" && parsed.signup.phone).toBe(null);
  });
});

describe("buttondownRequest", () => {
  it("sends the key only in the header and the choices as metadata", () => {
    const { url, init } = buttondownRequest({ email: "me@example.com", goals: ["Small talk", "How I sound"], phone: null }, "secret");
    expect(url).toBe("https://api.buttondown.com/v1/subscribers");
    expect((init.headers as Record<string, string>).Authorization).toBe("Token secret");
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({ email_address: "me@example.com", metadata: { source: "website", goals: "Small talk, How I sound", phone: "" } });
    expect(String(init.body)).not.toContain("secret");
  });

  it("treats an already-subscribed answer as success", () => {
    expect(alreadySubscribed(400, '{"detail":"That email address already exists"}')).toBe(true);
    expect(alreadySubscribed(400, "invalid email")).toBe(false);
    expect(alreadySubscribed(500, "already")).toBe(false);
  });
});

describe("Rapid Fire", () => {
  it("marks clear pause words only", () => {
    expect(tokenize("So um I like tea, uh, a lot").filter((t) => t.pause).map((t) => t.text)).toEqual(["um", "uh,"]);
  });

  it("works out pace, pause words and the window", () => {
    const stats = takeStats("um I am a morning person because the light is calm and uh quiet", 72);
    expect(stats.pauseWords).toBe(2);
    expect(stats.words).toBe(12);
    expect(stats.perMinute).toBe(10);
    expect(stats.window).toBe("inside");
    expect(takeStats("short", 30).window).toBe("short");
    expect(takeStats("long", 130).window).toBe("long");
  });

  it("gives one tip, most useful first", () => {
    expect(tipFor({ seconds: 60, words: 2, perMinute: 2, pauseWords: 0, window: "inside" })).toMatch(/didn't catch/);
    expect(tipFor({ seconds: 60, words: 150, perMinute: 150, pauseWords: 6, window: "inside" })).toMatch(/pause/);
    expect(tipFor({ seconds: 40, words: 100, perMinute: 150, pauseWords: 0, window: "short" })).toMatch(/full minute/);
    expect(tipFor({ seconds: 90, words: 300, perMinute: 200, pauseWords: 0, window: "inside" })).toMatch(/quick/);
  });

  it("formats a clock", () => {
    expect(clock(65)).toBe("1:05");
    expect(clock(0)).toBe("0:00");
  });
});
