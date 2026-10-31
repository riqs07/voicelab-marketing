// Waitlist sign-ups: checking what the form sent, and the request that adds someone to Buttondown.
// Kept free of Next.js so it can be unit tested.

// What people can pick on the form (same as the mockup)
export const GOALS = ["Telling stories", "Small talk", "Thinking on my feet", "How I sound", "Speaking at work", "A talk coming up"] as const;

export type Goal = (typeof GOALS)[number];

export type Signup = { email: string; goals: Goal[] };

export type Parsed =
  // A real sign-up
  | { kind: "signup"; signup: Signup }
  // The hidden field was filled in: almost certainly a bot, so pretend it worked and do nothing
  | { kind: "bot" }
  // Something to show the person
  | { kind: "invalid"; message: string };

// A plain, permissive email check: something@something.something, no spaces, sensible length
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Check what the form sent. Anything unexpected is dropped rather than trusted.
export function parseSignup(body: unknown): Parsed {
  if (typeof body !== "object" || body === null) return { kind: "invalid", message: "Something went wrong. Please try again." };
  const record = body as Record<string, unknown>;
  // The hidden "website" field is invisible to people; bots fill every field
  if (typeof record.website === "string" && record.website.trim() !== "") return { kind: "bot" };
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) return { kind: "invalid", message: "That email doesn't look right." };
  const goals = Array.isArray(record.goals) ? GOALS.filter((goal) => (record.goals as unknown[]).includes(goal)) : [];
  return { kind: "signup", signup: { email, goals } };
}

// The Buttondown request that adds a subscriber (https://docs.buttondown.com, "Create a subscriber").
// The key stays on the server; the browser only ever talks to our own /api/waitlist.
export function buttondownRequest(signup: Signup, apiKey: string): { url: string; init: RequestInit } {
  return {
    url: "https://api.buttondown.com/v1/subscribers",
    init: {
      method: "POST",
      headers: { Authorization: `Token ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: signup.email,
        // Notes kept with the subscriber, to see what people want before launch
        metadata: { source: "website", goals: signup.goals.join(", ") },
      }),
    },
  };
}

// Buttondown answers 400 when the address is already on the list; to the person that's a success.
export function alreadySubscribed(status: number, text: string): boolean {
  return status === 400 && /already|exists/i.test(text);
}
