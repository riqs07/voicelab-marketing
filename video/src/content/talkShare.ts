// Talk share: the app's conversation timeline. A lopsided chat, then a balanced one.
// The "You talked" number is worked out from how long each line really takes.
import type {Beat} from '../kit/timeline';

export const talkShare = {
  video: 'talk-share',
  name: 'Maya',
  beats: [
    {id: 'hook', voice: 'narrator', text: 'Good listener... or just waiting to talk?', caption: ''},
    {id: 'a1', voice: 'maya', text: 'How was your weekend?'},
    {
      id: 'a2',
      voice: 'speaker',
      text: 'Oh, great, so I went hiking, then this café, then my cousin came over, and honestly the whole thing was...',
      wps: 3.4,
    },
    {id: 'reset', voice: 'narrator', text: "That's a monologue. Try again."},
    {id: 'b1', voice: 'maya', text: 'How was your weekend?'},
    {id: 'b2', voice: 'speaker', text: 'Good! I finally went hiking. What about you?'},
    {id: 'b3', voice: 'maya', text: 'I tried pottery for the first time.'},
    {id: 'b4', voice: 'speaker', text: 'No way, what did you make?'},
    {id: 'close', voice: 'narrator', text: 'Share the talking. Ask one more question. VoiceLab. See how you sound.'},
  ] satisfies Beat[],
  // The two conversations: which lines are whose, and which are questions you asked
  takes: [
    {
      label: 'First try',
      // Shown under the numbers once this conversation ends
      note: 'Mostly you, and nothing asked back.',
      tone: 'warm',
      turns: [
        {beat: 'a1', who: 'them'},
        {beat: 'a2', who: 'you'},
      ],
    },
    {
      label: 'Second try',
      note: 'About even, and you asked back.',
      tone: 'green',
      turns: [
        {beat: 'b1', who: 'them'},
        {beat: 'b2', who: 'you', question: true},
        {beat: 'b3', who: 'them'},
        {beat: 'b4', who: 'you', question: true},
      ],
    },
  ],
  // Seconds into the closing line when the end card takes over
  endCardDelay: 3.0,
} as const;
