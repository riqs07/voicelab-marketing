// Sound check: one phrase said twice, the pitch line drawn under the words.
// To make a new post: change the hook, the phrase, the two shapes and the notes.
import type {Beat} from '../kit/timeline';

export const soundCheck = {
  video: 'sound-check',
  beats: [
    {id: 'hook', voice: 'narrator', text: 'Do you sound unsure... without even knowing it?', caption: ''},
    {id: 'take1', voice: 'speaker', text: 'Then the gorilla just stared at me?', quote: true, wps: 2.4},
    {id: 'note', voice: 'narrator', text: 'Hear that? Your voice went up. It sounds like a question. Tell it again.'},
    {id: 'take2', voice: 'speaker', text: 'Then the gorilla just... stared at me.', quote: true, wps: 2.4},
    {id: 'close', voice: 'narrator', text: 'Now it lands. VoiceLab. See how you sound.', caption: 'Now it lands.'},
  ] satisfies Beat[],
  // Small label above the card
  label: 'One phrase from your story',
  // The words under the line (punctuation is fine)
  words: ['Then', 'the', 'gorilla', 'just', 'stared', 'at', 'me.'],
  // How high the voice is on each word, 0 (low) to 1 (high); the dashed line is 0.5
  first: [0.42, 0.55, 0.62, 0.45, 0.42, 0.55, 1],
  second: [0.48, 0.66, 0.72, 0.5, 0.46, 0.34, 0.08],
  // The word the badge points at, and the two badges
  focusWord: 6,
  firstBadge: {dir: 'up', label: 'Rose'},
  secondBadge: {dir: 'down', label: 'Fell'},
  // Notes under the card
  firstNote: 'Your voice went up. It sounds like a question.',
  secondNote: 'Now it lands.',
  // Seconds into the closing line when the end card takes over
  endCardDelay: 1.2,
} as const;
