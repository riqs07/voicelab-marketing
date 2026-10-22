// Conversation as a rally: the Talk share lines (same voice files) as a tennis rally seen from above.
// Each turn is a hit held as long as the person talks; a question sends the ball back.
import {talkShare} from './talkShare';

export const rally = {
  video: 'rally',
  name: talkShare.name,
  beats: talkShare.beats,
  takes: talkShare.takes,
  // Seconds into the closing line when the end card takes over
  endCardDelay: talkShare.endCardDelay,
} as const;
