// Stress shift: one sentence, the stress on a different word each time.
// CAPITALS in `text` tell the voice which word to stress.
import type {Beat} from '../kit/timeline';

export const stressShift = {
  video: 'stress-shift',
  beats: [
    {id: 'hook', voice: 'narrator', text: 'One sentence. Five meanings.', caption: ''},
    {id: 's1', voice: 'speaker', text: "I didn't say she stole it.", caption: '', wps: 2.2},
    {id: 's2', voice: 'speaker', text: "I didn't SAY she stole it.", caption: '', wps: 2.2},
    {id: 's3', voice: 'speaker', text: "I didn't say SHE stole it.", caption: '', wps: 2.2},
    {id: 's4', voice: 'speaker', text: "I didn't say she STOLE it.", caption: '', wps: 2.2},
    {id: 's5', voice: 'speaker', text: "I didn't say she stole IT.", caption: '', wps: 2.2},
    {
      id: 'close',
      voice: 'narrator',
      text: 'Where your voice lifts changes what people hear. VoiceLab shows you where yours lands.',
    },
  ] satisfies Beat[],
  words: ['I', "didn't", 'say', 'she', 'stole', 'it.'],
  // One per speaker line: which word is stressed (0 = first) and what it means
  takes: [
    {beat: 's1', stress: 0, meaning: 'Someone else said it.'},
    {beat: 's2', stress: 2, meaning: 'I only hinted it.'},
    {beat: 's3', stress: 3, meaning: 'Someone else did.'},
    {beat: 's4', stress: 4, meaning: 'She borrowed it.'},
    {beat: 's5', stress: 5, meaning: 'She stole something else.'},
  ],
  endCardDelay: 2.6,
} as const;
