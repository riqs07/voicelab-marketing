// You lost them at "so": a video-call stand-up. You open with fillers and the team drifts off, tile by tile;
// the second take leads with the point and they come back. Cold open: your voice plays on frame 0.
import type {Beat} from '../kit/timeline';

export const standUp = {
  video: 'stand-up',
  // The big words on screen from frame 0 (no fade in): readable in under a second
  hook: ['You lost them', 'at “so.”'],
  label: 'Monday stand-up · 9:02',
  beats: [
    {
      id: 'y1',
      voice: 'speaker',
      text: "So, um, yeah, so basically, um, where we're at with the, um, the billing thing is, so, we kind of looked into it, and",
      caption: '',
      wps: 2.7,
      gapAfter: 0.5,
    },
    {id: 'n1', voice: 'narrator', text: 'Nine fillers. No point yet. Lead with the point.', gapAfter: 0.4},
    {id: 'y2', voice: 'speaker', text: 'The billing bug is fixed. Two customers already wrote in to say thanks.', caption: '', gapAfter: 0.8},
    {id: 'close', voice: 'narrator', text: 'VoiceLab hears your first ten seconds. See how you sound.'},
  ] satisfies Beat[],
  // When each word of the first take starts, in seconds (ElevenLabs transcription of public/audio/stand-up/y1.mp3).
  // A new recording needs new times; with the wrong number of words they are ignored and the words are spread evenly.
  y1Times: [0, 0.662, 2.043, 2.322, 2.473, 3.262, 4.69, 4.969, 5.213, 5.561, 5.875, 6.687, 8.069, 8.22, 8.591, 8.847, 9.485, 11.076, 11.215, 11.389, 11.459, 11.668, 11.935, 12.237],
  // The fillers the first take is counted on (each one drains the room)
  fillers: ['so', 'um', 'yeah', 'basically', 'kind'],
  // The rest of the call, left to right, top to bottom; you are the last tile. `drift` is the filler number at which
  // they stop listening: 'phone' (looks down), 'off' (camera off), or stays
  team: [
    {initials: 'AK', tint: '#E4EDE6', drift: {at: 2, how: 'phone'}},
    {initials: 'JM', tint: '#FCE3CF', drift: {at: 4, how: 'off'}},
    {initials: 'RS', tint: '#E3E7F2', drift: {at: 5, how: 'phone'}},
    {initials: 'LT', tint: '#F2E6E3', drift: {at: 6, how: 'off'}},
    {initials: 'DP', tint: '#EEF0E0', drift: {at: 7, how: 'phone'}},
  ],
  // Seconds into the closing line when the end card takes over
  endCardDelay: 1.6,
} as const;
