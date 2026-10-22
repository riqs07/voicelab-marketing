// Your voice, drawn live: one phrase said twice. The line is the recording's real pitch
// (measured with the app's tracker by scripts/pitch.mjs); words appear at their real times
// (from ElevenLabs transcription), at the height of the voice.
import type {Beat} from '../kit/timeline';

export const drawnLive = {
  video: 'drawn-live',
  beats: [
    {id: 'hook', voice: 'narrator', text: 'Do you sound unsure... without even knowing it?', caption: ''},
    {id: 'take1', voice: 'speaker', text: 'Then the gorilla just stared at me?', caption: ''},
    {id: 'note', voice: 'narrator', text: 'Hear that? Your voice went up. It sounds like a question. Tell it again.'},
    {id: 'take2', voice: 'speaker', text: 'Then the gorilla just... stared at me.', caption: ''},
    {id: 'close', voice: 'narrator', text: 'Now it lands. VoiceLab. See how you sound.', caption: 'Now it lands.'},
  ] satisfies Beat[],
  // Word times in seconds from the start of each take's file
  words: {
    take1: [
      {text: 'Then', start: 0.326, end: 0.566},
      {text: 'the', start: 0.606, end: 0.646},
      {text: 'gorilla', start: 0.726, end: 1.206},
      {text: 'just', start: 1.286, end: 1.766},
      {text: 'stared', start: 1.846, end: 2.166},
      {text: 'at', start: 2.246, end: 2.326},
      {text: 'me?', start: 2.446, end: 2.886},
    ],
    take2: [
      {text: 'Then', start: 0.16, end: 0.32},
      {text: 'the', start: 0.36, end: 0.4},
      {text: 'gorilla', start: 0.48, end: 0.88},
      {text: 'just…', start: 0.96, end: 1.56},
      {text: 'stared', start: 1.68, end: 2.0},
      {text: 'at', start: 2.08, end: 2.24},
      {text: 'me.', start: 2.36, end: 2.8},
    ],
  },
  // The real app screen the lines shrink into (from capture/run.sh)
  appShot: '09-again',
} as const;
