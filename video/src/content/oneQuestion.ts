// POV: you were asked one question. Maya (her real app voice, the same clips as the app) asks what keeps you busy;
// your answer bubble grows until it pushes everything off the screen, and she finds a reason to leave.
// The second take: one answer, one detail, one question back, and she stays. Cold open: your voice on frame 0.
import type {Beat} from '../kit/timeline';

export const oneQuestion = {
  video: 'one-question',
  hook: ['POV: you were asked', 'one question.'],
  label: 'The office party',
  name: 'Maya',
  // Her question, already asked when the video starts (shown, not played, so your voice is the first sound)
  asked: "So what's keeping you busy these days?",
  // What you'd already said when the video starts: shown in your bubble on frame 0, not played, so the video opens mid-ramble
  alreadySaid: "Oh, so I'm in operations. Well, sort of ops and finance, it's kind of a long story actually.",
  beats: [
    {
      id: 'y1',
      voice: 'speaker',
      text: "So back in 2019 I was at this logistics company, and we had this whole thing with the warehouse software, and",
      caption: '',
      wps: 3.3,
      gapAfter: 0,
    },
    {id: 'maya-38', voice: 'maya', text: "I'm going to grab another drink, but let's get lunch this week. Great chatting!", caption: '', gapAfter: 0.5},
    {id: 'n1', voice: 'narrator', text: 'One answer. One detail. One question back.', gapAfter: 0.4},
    {id: 'maya-12', voice: 'maya', text: "So what's keeping you busy these days?", caption: ''},
    {id: 'y2', voice: 'speaker', text: 'I run ops at a bakery chain, so mostly I fix ovens at six a.m. What about you?', caption: ''},
    {id: 'maya-15', voice: 'maya', text: 'Wait, how did you get into that?', caption: '', gapAfter: 0.7},
    {id: 'close', voice: 'narrator', text: 'Practise it with Maya. VoiceLab.'},
  ] satisfies Beat[],
  endCardDelay: 1.2,
} as const;
