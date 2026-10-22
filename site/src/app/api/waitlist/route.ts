// POST /api/waitlist: checks the sign-up and adds it to Buttondown.
// Needs BUTTONDOWN_API_KEY in the hosting settings (never in the browser or in git).
import { alreadySubscribed, buttondownRequest, parseSignup } from "@/lib/waitlist";

export async function POST(request: Request): Promise<Response> {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    // Treated as an empty form below
  }
  const parsed = parseSignup(body);
  if (parsed.kind === "invalid") return Response.json({ ok: false, message: parsed.message }, { status: 400 });
  // Bots get a cheerful yes and nothing is stored
  if (parsed.kind === "bot") return Response.json({ ok: true });

  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) {
    console.error("Waitlist: BUTTONDOWN_API_KEY is not set");
    return Response.json({ ok: false, message: "The waitlist isn't open yet. Please try again soon." }, { status: 503 });
  }

  const { url, init } = buttondownRequest(parsed.signup, key);
  try {
    const answer = await fetch(url, { ...init, signal: AbortSignal.timeout(8000) });
    if (answer.ok) return Response.json({ ok: true });
    const text = await answer.text();
    if (alreadySubscribed(answer.status, text)) return Response.json({ ok: true, already: true });
    console.error("Waitlist: Buttondown answered", answer.status, text.slice(0, 300));
  } catch (error) {
    console.error("Waitlist: Buttondown could not be reached", error);
  }
  return Response.json({ ok: false, message: "We couldn't add you just now. Please try again in a minute." }, { status: 502 });
}
