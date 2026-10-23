// They talk back: the Rally court again, now showing the people reacting to how you talk.
// Maya, Chris, their lines and their voices are the app's own recordings (Table-Topics public/clips/, same ids),
// so the voice script never needs to make them; "you" and the narrator were made for this video.
import type {Beat} from '../kit/timeline';

export const talkBack = {
  video: 'talk-back',
  beats: [
    {id: 'hook', voice: 'narrator', text: 'What if the person you practise with... reacted to how you talk?', caption: ''},
    // Maya, at the office party: she offers a detail, you pick it up
    {id: 'maya-01', voice: 'maya', text: "Hi! I don't think we've properly met. I'm Maya, I just joined your team."},
    {id: 'y1', voice: 'speaker', text: 'Welcome! Where did you move from?'},
    {id: 'maya-24', voice: 'maya', text: "I moved here from Denver about a month ago, so everything's still new."},
    {id: 'y2', voice: 'speaker', text: "Denver! What's been the hardest part so far?"},
    {id: 'maya-25', voice: 'maya', text: 'Honestly, the hardest part has been finding good coffee near the office.', gapAfter: 2.6},
    // Chris, over coffee: you jump to advice, he stops you, a question brings him back
    {id: 'chris-01', voice: 'chris', text: "Hey. Sorry I'm late. It's been… a week."},
    {id: 'chris-07', voice: 'chris', text: "My landlord's selling the flat. I found out on Monday. I've got two months to move out."},
    {
      id: 'y3',
      voice: 'speaker',
      text: "Okay, so here's what you should do. First, call your landlord back, then make a list of every flat near work, and honestly you should just start viewing them this weekend, because the market moves really fast and",
      caption: "Okay, so here's what you should do. First, call your landlord back, then make a list of every flat near work, and honestly you should just—",
      // He cuts in just after "should just" (word timings from transcribing the take)
      cutAt: 6.62,
      gapAfter: 0,
    },
    {id: 'chris-29', voice: 'chris', text: "I don't think I want advice right now. I just needed to say it."},
    {id: 'y4', voice: 'speaker', text: "Sorry. That's a lot at once. How are you holding up?"},
    {id: 'chris-25', voice: 'chris', text: 'Honestly, it helps just saying it out loud.', gapAfter: 2.4},
    {id: 'close', voice: 'narrator', text: 'Four people. Eight situations. They react to you. VoiceLab.'},
  ] satisfies Beat[],
  // The two conversations. `detail`: something you can pick up; `cut`: you were cut off; `reaction`: how they took it
  takes: [
    {
      name: 'Maya',
      label: 'Maya · at the office party',
      note: 'She gave you a detail. You picked it up.',
      tone: 'green',
      turns: [
        {beat: 'maya-01', who: 'them'},
        {beat: 'y1', who: 'you', question: true},
        {beat: 'maya-24', who: 'them', detail: 'Denver'},
        {beat: 'y2', who: 'you', question: true, pickUp: true},
        {beat: 'maya-25', who: 'them'},
      ],
    },
    {
      name: 'Chris',
      label: 'Chris · coffee with a friend',
      note: 'Advice too soon, and he pulled back. A question brought him back.',
      tone: 'warm',
      turns: [
        {beat: 'chris-01', who: 'them'},
        {beat: 'chris-07', who: 'them'},
        {beat: 'y3', who: 'you', cut: true},
        {beat: 'chris-29', who: 'them', reaction: 'Too soon for advice'},
        {beat: 'y4', who: 'you', question: true},
        {beat: 'chris-25', who: 'them'},
      ],
    },
  ],
  // Seconds into the closing line when the end card takes over
  endCardDelay: 4.2,
} as const;
