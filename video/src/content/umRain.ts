// Um rain: a rushed update full of pause words, then the same news told calmly.
// Word times come from ElevenLabs transcription (umRainWords.json); the calm take's pauses were measured
// from its silences. The count line must match what the rushed take really holds (12 in 21 seconds).
import type {Beat} from '../kit/timeline';
import words from './umRainWords.json';

export const umRain = {
  video: 'um-rain',
  beats: [
    {id: 'hook', voice: 'narrator', text: 'How many times do you say um?', caption: ''},
    // The first 6 seconds play aloud, then the rest races past at 4x (silent) so every pause word still lands.
    {id: 'rushed', voice: 'speaker', text: "So, um, the plan was to launch on Monday, and, uh, we thought the team was ready, but, um, the tests weren't, so, like, we moved it to Wednesday, and then, um, Wednesday came and, uh, the design wasn't done, so, um, we kind of, like, pushed it again, and honestly, um, I think we just, uh, need a better way to, like, check things earlier, you know, um, before we pick a date.", caption: '', fastForward: {audioFor: 6.0, speed: 4}},
    {id: 'count', voice: 'narrator', text: 'Twelve pause words in twenty seconds.', caption: ''},
    {id: 'calm', voice: 'speaker', text: "We planned to launch on Monday. The tests weren't ready. So we moved it, and we'll check earlier next time.", caption: ''},
    {id: 'close', voice: 'narrator', text: 'Swap the um for a pause. VoiceLab. See how you sound.', caption: 'Swap the um for a pause.'},
  ] satisfies Beat[],
  words,
  // Which words count as pause words
  pauseWord: /^(um|uh|like)\W*$/i,
  // The calm take's measured pauses (seconds into its file)
  pauses: [
    {start: 1.69, end: 2.36},
    {start: 3.67, end: 4.31},
  ],
  // Seconds into the closing line when the end card takes over
  endCardDelay: 1.9,
} as const;
