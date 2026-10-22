// Demo walkthrough for the website: real app screens (filmed by capture/run.sh) with a narrator.
// Each line plays over one or more screenshots; `from` is when a shot takes over, as a share of
// the line plus the pause after it (0 = the line starts, 1 = the next line starts). `zoom` and `tap` name boxes saved by the capture.
import type {Beat} from '../kit/timeline';

export type DemoShot = {
  shot: string;
  from?: number;
  zoom?: {box: string; scale: number; at?: number};
  tap?: {box: string; at: number};
  ring?: {box: string; at: number};
};

export const demo = {
  video: 'demo',
  beats: [
    {id: 'q', voice: 'narrator', text: 'Get a surprise question. Ten seconds to think.', gapAfter: 1.6},
    {id: 'talk', voice: 'narrator', text: 'Talk for a minute. VoiceLab listens.', gapAfter: 1.6},
    {id: 'pitch', voice: 'narrator', text: 'See where your voice rose, fell and paused, word by word.', gapAfter: 1.6},
    {id: 'change', voice: 'narrator', text: 'Get one thing to change. Tap any word to hear it.', gapAfter: 1.6},
    {id: 'again', voice: 'narrator', text: 'Say it again, and see the difference.', gapAfter: 1.6},
    {id: 'close', voice: 'narrator', text: 'VoiceLab. See how you sound.', caption: '', gapAfter: 0.8},
  ] satisfies Beat[],
  scenes: {
    q: [{shot: '01-start', tap: {box: 'show', at: 0.35}}, {shot: '02-think', from: 0.45}],
    talk: [{shot: '03-talking'}, {shot: '04-results', from: 0.55}],
    pitch: [{shot: '05-pitch', zoom: {box: 'text', scale: 1.18, at: 0.08}, ring: {box: 'rose', at: 0.35}}],
    change: [
      {shot: '06-change', zoom: {box: 'change', scale: 1.1, at: 0.05}},
      {shot: '07-phrases', from: 0.4, tap: {box: 'me', at: 0.6}},
      {shot: '08-tapped', from: 0.66},
    ],
    again: [{shot: '09-again', zoom: {box: 'card', scale: 1.12, at: 0.1}}],
  } as Record<string, DemoShot[]>,
  // Seconds into the closing line when the end card takes over
  endCardDelay: 0,
} as const;
