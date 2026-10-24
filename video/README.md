# VoiceLab videos

Eight reusable video templates plus a website demo, made with Remotion. Each video reads its words, timings and chart data from one content file, so a new post means editing text, not animation.

| Video | Content file | Formats |
|---|---|---|
| Sound check (rising vs falling ending) | `src/content/soundCheck.ts` | 9:16, 4:5 |
| Stress shift (one sentence, five meanings) | `src/content/stressShift.ts` | 9:16, 4:5 |
| Talk share (conversation timeline) | `src/content/talkShare.ts` | 9:16, 4:5 |
| Pause power (ums vs a pause) | `src/content/pausePower.ts` | 9:16, 4:5 |
| Demo walkthrough (real app screens) | `src/content/demo.ts` | 16:9, 9:16, silent 16:9 loop |
| Your voice, drawn live (real pitch draws itself) | `src/content/drawnLive.ts` | 9:16, 4:5 |
| Um rain (pause words fall into a jar) | `src/content/umRain.ts` | 9:16, 4:5 |
| Conversation as a rally (Talk share as tennis) | `src/content/rally.ts` | 9:16, 4:5 |

The web address and voices for every video are in `src/content/brand.ts`.

## Look and edit

```sh
cd video
npm install
npm run studio        # opens Remotion Studio in your browser: scrub, preview every format
```

Remotion downloads its own browser the first time. To use one you already have, set `REMOTION_BROWSER=/path/to/chrome`.

Change a line in a content file and Studio updates straight away. Each spoken line is a "beat":

```ts
{id: 'take1', voice: 'speaker', text: 'Then the gorilla just stared at me?', quote: true}
```

- `text` is what the voice says. Captions show it too, unless `caption` says otherwise (`caption: ''` hides it).
- `voice` is `narrator`, `speaker` or `maya` (set in `brand.ts`).
- `wps` (words per second) and `gapAfter` (seconds of silence after) adjust timing before there is a voice.
- Keep the `id`s as they are when you change words; the voice file is named after the id.

## Add the voice

Until a line has a voice file, its length is estimated and the video is silent. To add voices:

1. Put your ElevenLabs key in a file named `.env.local` next to `package.json`:
   `ELEVENLABS_API_KEY=...` (never commit this file, and never paste the key into a chat).
2. See what would be made and roughly what it costs, without spending anything:
   `node scripts/voice.mjs --dry`
3. Make the missing lines (one take each), for one video or all:
   `node scripts/voice.mjs talk-share` or `node scripts/voice.mjs`

Files land in `public/audio/<video>/<id>.mp3`, and the script runs `npm run voice:durations`, so every video re-times itself to the real voice. To redo a line, delete its file and run the script again. You can also record a line yourself: save it under the same name and run `npm run voice:durations`.

## Render

```sh
npm run render:all              # every video, every format, to out/videos/ (copy finished ones to ../renders/)
./render-all.sh TalkShare       # only the ones whose name contains TalkShare
```

## Real measurements (drawn live, um rain)

These two use measured data, not keyframes:

- **Pitch:** `node scripts/pitch.mjs /path/to/Table-Topics audio/drawn-live/take1.mp3 ...` measures pitch with the app's own tracker and writes `src/content/pitch.json`. Where the voice goes creaky and no pitch can be read, the line is drawn dashed.
- **Word times:** from ElevenLabs transcription, saved in the content files (`drawnLive.ts`, `umRainWords.json`). A new recording needs new word times.
- **Counts:** Um rain's "12 pause words in 20 seconds" is what its recording holds. If you swap the recording, recount and re-record the narrator's count line.

## Re-film the demo

The demo uses real screenshots of the app with sample takes. When the app changes:

```sh
# in the app folder, build once: pnpm build
capture/run.sh /path/to/Table-Topics
```

This copies `capture/demo.capture.ts` into the app's browser tests for one run, saves new screenshots to `public/demo/`, and removes the copy again. The zooms and taps in `src/content/demo.ts` point at named parts of each screen (`zoom: {box: 'change'}`), so they follow the app's layout when it moves.

## Guidelines for new videos

These keep every video ready for the post scheduler (`social/`) with nothing to fix by hand.

- **Make it 9:16 (1080×1920).** That's the version that goes to Instagram, as a Reel or a Story. It fills the screen with no black bars. Name it `<Name>-story.mp4` in `renders/batch-*/`.
- **Always render a cover** to go with it: `renders/batch-*/covers/<Name>-cover.png`, also 9:16. The scheduler uses it as the default cover; you can still pick another image or a frame when scheduling.
- **Keep making the 4:5 version (`<Name>-feed.mp4`) for other platforms** (Facebook or LinkedIn feed, the website). Instagram never gets it: posted as a Reel, a 4:5 video gets black bars top and bottom.
- **Write the caption in the batch's `captions.md`** under a `## N. Title` heading, with a ``Video: `<Name>-story.mp4` `` line and the caption in a code block. The scheduler fills it in for you.
- Once a video has posted, the scheduler moves its 9:16 file, 4:5 file and cover together to `renders/posted/`. The caption stays in `captions.md`.

## New posts from a template

- **Sound check:** change `words`, `first` and `second` (how high the voice is on each word, 0 to 1), the badges and the notes.
- **Stress shift:** change `words` and `takes` (which word is stressed and what it means). CAPITALS in a line's `text` tell the voice where to stress.
- **Talk share:** change the lines and `takes` (whose line is whose, which are questions). The "talked" number is worked out from how long each line really lasts, so it stays honest.
- **Pause power:** change the two lines; "um" words are marked and `...` becomes a pause.

## Licence

Remotion is free for individuals and companies with up to 3 employees; larger companies need a company licence (remotion.pro).
