# VoiceLab website

The marketing site: a home page with live versions of the video animations, a waitlist, and a free Rapid Fire.
Next.js 16, Tailwind 4 and Motion (for the springy animations). Colours and fonts match the app.

| Page | What it does |
|---|---|
| `/` | Hero with the real pitch line drawing itself ("Hear it" plays the recordings), how it works, the 30-second demo, the um jar and talk lanes (play as you scroll), three Reels, features, sign-up. |
| `/waitlist` | Email, optional goals and phone. Sends to `/api/waitlist`, which adds the person to Buttondown. Hidden field for bots. |
| `/try` | A free Rapid Fire: surprise question, 10 seconds to think, talk with timing lights, then time, pace, pause words and one tip. Uses the browser's speech recognition; nothing is recorded or kept. |
| `/privacy` | Short privacy notes. Replace `[Your contact email]` before launch. |

Everything respects "reduce motion": people who ask for less motion see the finished state without animation.

## Run it locally

```sh
cd site
pnpm install
pnpm dev            # http://localhost:3000
```

Checks: `pnpm check` (lint, types, unit tests), `pnpm build`, then `pnpm e2e` (browser tests; set `CHROMIUM_PATH` if Playwright's browser isn't installed).

## Put it online (Vercel)

1. **Deploy:** on vercel.com choose **Add New → Project**, import `riqs07/voicelab-marketing`, set **Root Directory** to `site`, and press **Deploy**. You get a free `*.vercel.app` address straight away.
2. **Waitlist:** sign up at buttondown.com (free for a small list), copy the API key from **Settings → API**, and add it in Vercel under **Project → Settings → Environment Variables** as `BUTTONDOWN_API_KEY`. Redeploy. Until then the form says the waitlist isn't open yet.
3. **Domain:** buy one (in Vercel under **Domains**, or any registrar), add it under **Project → Settings → Domains**, and set `SITE_URL` to it.
4. **Last touches:** put your contact email on the privacy page, point your Instagram bio link at the site, and (optionally) put the web address on the video end cards (`video/src/content/brand.ts`).

Note: Vercel's free Hobby plan is for non-commercial projects; switch to Pro if VoiceLab starts charging.

## Where things come from

- Pitch line: `src/data/gorilla.json`, the real pitch of the two "drawn live" recordings, measured with the app's tracker.
- Um jar: `src/data/umWords.json`, the word timings of the "Um rain" recording.
- Talk lanes: turn lengths from the Talk share recordings (`src/components/TalkLanes.tsx`).
- Videos and posters in `public/videos/` are web-sized copies of `renders/batch-1`. Re-encode them if the videos change.
