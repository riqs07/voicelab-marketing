# VoiceLab marketing

Everything for marketing VoiceLab (the app lives in `riqs07/table-topics`): social videos, the website demo, design mockups, and the finished renders.

| Folder | What's in it |
|---|---|
| `video/` | The Remotion project: 8 reusable video templates plus the website demo. Words, timings and chart data live in `video/src/content/`; voice files in `video/public/audio/`. See `video/README.md`. |
| `renders/batch-1/` | Finished MP4s, ready to post (9:16 for Reels/TikTok/Shorts, 4:5 for feed, 16:9 for the website), plus Reel covers (`covers/`) and captions (`captions.md`). |
| `site/` | The website: home, waitlist and a free Rapid Fire, with live versions of the animations. Run `pnpm fresh` (here or in `site`) to pull the latest and start it. See `site/README.md` for how to put it online. |
| `mockups/` | Design canvases: the website and waitlist, the feedback and chart ideas, and the hero-animation storyboards. |
| `video/scripts-v1.md` | The approved scripts for the first five videos. |

## The videos (batch 1)

| Video | Files | Length |
|---|---|---|
| Your voice, drawn live | `DrawnLive-story`, `DrawnLive-feed` | 20 s |
| Um rain | `UmRain-story`, `UmRain-feed` | 29 s |
| Conversation as a rally | `Rally-story`, `Rally-feed` | 32 s |
| They talk back (Maya and Chris react to how you talk) | `TalkBack-story`, `TalkBack-feed` | 66 s |
| Who is VoiceLab for? (overview) | `Overview-story`, `Overview-feed` | 47 s |
| Sound check (rising vs falling ending) | `SoundCheck-story`, `SoundCheck-feed` | 20 s |
| Stress shift (one sentence, five meanings) | `StressShift-story`, `StressShift-feed` | 25 s |
| Talk share (who did the talking) | `TalkShare-story`, `TalkShare-feed` | 32 s |
| Pause power | `PausePower-story`, `PausePower-feed` | 20 s |
| Website demo | `Demo-wide`, `Demo-story`, `DemoLoop-wide` (silent loop) | 27 to 29 s |
| First proof of concept | `voicelab-pitch`, `voicelab-pitch-voiced` | 15 to 20 s |

Every end card says "Join the waitlist". To show a web address instead, change `cta` in `video/src/content/brand.ts` and re-render (`cd video && npm run render:all`).

## Posting to Instagram

- Captions, hashtags and the matching cover for each Reel are in `renders/batch-1/captions.md`. Covers are made from real frames of each video (`video/src/Covers.tsx`); re-render one with `npx remotion still src/index.ts Cover-UmRain out.png --frame=0`.

- Post the `-story` files as Reels; the `-feed` files work as feed posts and in carousels.
- Turn on Instagram's "AI info" label: the voices are made with ElevenLabs.
- The videos keep text clear of Instagram's buttons (bottom and right edge).

## Voices and costs so far

Voices: narrator Caroline, speaker Nate, and the app's own recordings of Maya (Brittney) and Chris, all ElevenLabs (`video/src/content/brand.ts`). Each line was generated once and saved, so re-rendering costs nothing.

| Batch | ElevenLabs cost |
|---|---|
| First proof of concept | about 11 cents |
| Five templates and the demo (31 lines) | 33.75 cents |
| Drawn live re-takes | about 2.5 cents |
| Um rain (5 lines) | about 12 cents |
| They talk back (5 new lines; Maya's and Chris's are the app's recordings) | about 10 cents |
| Website Read aloud reader (1 line; word timings by free transcription) | about 3.4 cents |
| Try it free example readings (JFK and Roosevelt passages in full) | about 21 cents |
| Who is VoiceLab for? (11 narration lines; moment clips reused) | about 10 cents |

Rendering is free (Remotion is free for individuals and companies of up to 3 people).

## Mockup canvases (private links; only the owner can open them)

- Website, try-it page and waitlist: https://claude.ai/artifact/ADtxxyLFNp8xswCHQFzzSt
- Feedback ideas and all current charts: https://claude.ai/artifact/CEQ2bdLqX9sKNXHebT5kqB
- Hero animation storyboards: https://claude.ai/artifact/913DwTLKmu9NquuofVs8Wz
- Six more video ideas (roller coaster, traffic, rhythm game, room, heartbeat, voice print), sketches: https://claude.ai/artifact/4oz7Sc9QgLA89HJne6HMDd

The canvas source files are in `mockups/`.
