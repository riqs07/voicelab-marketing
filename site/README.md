# VoiceLab website

The marketing site: a home page with live versions of the video animations, a waitlist, and a free Rapid Fire.
Next.js 16, Tailwind 4 and Motion (for the springy animations). Colours and fonts match the app.

| Page | What it does |
|---|---|
| `/` | Hero with the real pitch line drawing itself ("Hear it" plays the recordings), how it works, the 30-second demo, the um jar and talk lanes (play as you scroll), three Reels, "Inside the app" (the app's Practice menu in a phone, plus four showcases: a read-along replay, stress shift with the real recordings, a guided story building into its story shape, and the four conversation people with their real opening lines), sign-up. |
| `/waitlist` | Email, optional goals and phone. Sends to `/api/waitlist`, which adds the person to Buttondown. Hidden field for bots. |
| `/try` | Both free modes, with a big toggle at the top (`/try?mode=read` opens Read aloud). **Rapid Fire:** a surprise question, measured in the browser with the app's own code (`src/core`, copied by `scripts/sync-core.mjs`): pitch in your words with rise/fall endings and peaks, pauses, pace, pause words, fading endings, tap any word to hear it, listen back, "try again" compared with the last try, and one tip. **Read aloud:** two short passages from the app ("We choose to go to the moon" and "The man in the arena"); the words light up as you read (the app's read-along code), it stops by itself after the last word, then shows which words were caught (missed ones struck through), pace, pauses, the voice view and one tip. Recordings stay in page memory and are never uploaded. Both explain the full version's more accurate server analysis. |
| `/privacy` | Short privacy notes. Replace `[Your contact email]` before launch. |

Everything respects "reduce motion": people who ask for less motion see the finished state without animation.

## Run it locally

The easy way, every time (from the repository's top folder or from `site`):

```sh
pnpm fresh          # pulls the latest commit, installs packages, clears the cache, starts http://localhost:3000
```

It stops with a message if a step fails (for example, if you have local changes that conflict with the new commit). Press Ctrl+C to stop the site. By hand, the same thing is:

```sh
cd site
git pull
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

## Keeping the free modes in step with the app

The measuring code in `src/core/` and the two Read aloud passages (`src/data/passages.json`) are copied unchanged from the app. After the app's analysis or passages change:

```sh
node scripts/sync-core.mjs /path/to/Table-Topics
pnpm check && pnpm build
```

## Where things come from

- Pitch line: `src/data/gorilla.json`, the real pitch of the two "drawn live" recordings, measured with the app's tracker.
- Um jar: `src/data/umWords.json`, the word timings of the "Um rain" recording.
- Talk lanes: turn lengths from the Talk share recordings (`src/components/TalkLanes.tsx`).
- Videos and posters in `public/videos/` are web-sized copies of `renders/batch-1`. Re-encode them if the videos change.
