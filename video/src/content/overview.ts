// Who VoiceLab is for: the overview Reel. Four everyday moments, then the app that covers them all,
// how it works in three steps, and the daily habit. The narration was made for this video; the four
// moment clips are existing recordings (Um rain's rushed take, Drawn live's first take, and two of
// Maya's lines from the app), played quietly under the cards.
import type {Beat} from '../kit/timeline';

export const overview = {
  video: 'overview',
  beats: [
    {id: 'hook', voice: 'narrator', text: "You know what you want to say. So why doesn't it come out that way?", caption: '', gapAfter: 0.4},
    {id: 'm1', voice: 'narrator', text: 'The meeting where your mind goes blank.', gapAfter: 0.1},
    {id: 'c1', voice: 'speaker', text: 'So, um,', caption: '', cutAt: 1.45, volume: 0.55, gapAfter: 0.25},
    {id: 'm2', voice: 'narrator', text: 'The story that falls flat.', gapAfter: 0.1},
    {id: 'c2', voice: 'speaker', text: 'Then the gorilla just stared at me?', caption: '', volume: 0.55, gapAfter: 0.25},
    {id: 'm3', voice: 'narrator', text: 'The small talk you dread.', gapAfter: 0.1},
    {id: 'c3', voice: 'maya', text: 'So how was your weekend?', caption: '', volume: 0.6, gapAfter: 0.25},
    {id: 'm4', voice: 'narrator', text: "The toast you can't stop thinking about.", gapAfter: 0.1},
    {id: 'c4', voice: 'maya', text: "Oh, I think they're starting the toast.", caption: '', cutAt: 2.42, volume: 0.6, gapAfter: 0.3},
    {id: 'all', voice: 'narrator', text: 'VoiceLab is for all of them.', gapAfter: 0.9},
    {id: 'how1', voice: 'narrator', text: 'Speak for a minute.', gapAfter: 0.7},
    {id: 'how2', voice: 'narrator', text: 'See where your voice rose, fell and paused, word by word.', gapAfter: 0.9},
    {id: 'how3', voice: 'narrator', text: 'Then change one thing, and say it again.', gapAfter: 1.0},
    {id: 'daily', voice: 'narrator', text: 'A few minutes a day. Your recordings stay on your phone.', gapAfter: 0.6},
    {id: 'close', voice: 'narrator', text: 'VoiceLab. See how you sound.', caption: ''},
  ] satisfies Beat[],
  // The four moments, each landing as its line starts
  moments: [
    {line: 'm1', clip: 'c1', icon: 'meeting', title: 'The meeting', rest: 'where your mind goes blank', quote: '“So, um…”'},
    {line: 'm2', clip: 'c2', icon: 'story', title: 'The story', rest: 'that falls flat', quote: '“Then the gorilla just stared at me?”'},
    {line: 'm3', clip: 'c3', icon: 'coffee', title: 'The small talk', rest: 'you dread', quote: '“So how was your weekend?”'},
    {line: 'm4', clip: 'c4', icon: 'toast', title: 'The toast', rest: 'you can’t stop thinking about', quote: '“Oh, they’re starting the toast!”'},
  ],
  // Rows of the app's Practice menu shown in the phone (names from the app)
  menu: [
    {group: 'Speak on the spot', rows: ['Rapid Fire', 'Read aloud', 'Prepared speech']},
    {group: 'Tell stories', rows: ['Today’s story', 'Guided stories']},
    {group: 'Everyday conversation', rows: ['Talk with someone', 'Small talk']},
    {group: 'Your voice', rows: ['Warm-up', 'Pitch and stress']},
  ],
  // A day's plan in the app: a Learn card, a warm-up reading, then two short practices
  today: [
    {label: 'Learn card', detail: 'A pause feels much longer to you'},
    {label: 'Warm up', detail: 'Read aloud · 1 min'},
    {label: 'Rapid Fire', detail: 'A surprise question · 2 min'},
    {label: 'Story', detail: 'A true story · 2 min'},
  ],
} as const;
