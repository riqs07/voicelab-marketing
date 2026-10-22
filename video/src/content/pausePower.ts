// Pause power: the same news rushed with ums, then calm with a pause.
// In `text`, "um" words are marked on the strip; "..." becomes a pause.
import type {Beat} from '../kit/timeline';

export const pausePower = {
  video: 'pause-power',
  beats: [
    {id: 'hook', voice: 'narrator', text: 'The most confident sound in speaking? Silence.', caption: ''},
    {
      id: 'rushed',
      voice: 'speaker',
      text: "So, um, the thing is, we, um, missed the deadline, but, um, we'll fix it.",
      caption: '',
      wps: 3.2,
    },
    {id: 'calm', voice: 'speaker', text: "We missed the deadline. ... Here's how we'll fix it.", caption: '', wps: 2.3},
    {id: 'close', voice: 'narrator', text: 'Swap the um for a pause. It sounds like you meant it.'},
  ] satisfies Beat[],
  takes: [
    {beat: 'rushed', label: 'Rushed'},
    {beat: 'calm', label: 'Calm'},
  ],
  // Shown in the pause pill on the calm take
  pauseSeconds: 1.2,
  // Seconds into the closing line when the end card takes over
  endCardDelay: 1.8,
} as const;
