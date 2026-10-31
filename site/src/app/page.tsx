import { BounceWords, BouncyLink, Reveal } from "@/components/Bouncy";
import { GuidedStory } from "@/components/GuidedStory";
import { PeoplePicker } from "@/components/PeoplePicker";
import { HeroTile } from "@/components/HeroTile";
import { PracticeMenu } from "@/components/PracticeMenu";
import { ReadAlongDemo } from "@/components/ReadAlongDemo";
import { Reels } from "@/components/Reels";
import { StressShift } from "@/components/StressShift";
import { TalkLanes } from "@/components/TalkLanes";
import { UmJar } from "@/components/UmJar";
import { Blob, type BlobFace } from "@/components/Characters";
import { SagePerch } from "@/components/SagePerch";
import { BlobPeek } from "@/components/BlobPeek";
import { LessonBanner } from "@/components/LessonBanner";
import { ClosingChat } from "@/components/ClosingChat";

// Each step has the blob in the face that fits it, eyes open: talking, surprised by what it sees, beaming at the second try; they blink at different times
const STEPS: { n: string; face: BlobFace; title: string; line: string }[] = [
  { n: "1", face: "talk", title: "Speak", line: "A surprise question, a story, or your own talk. Timing lights keep you inside the window." },
  { n: "2", face: "wow", title: "See it", line: "Your pitch, pauses and words in one view. Tap any word to hear it back." },
  { n: "3", face: "beam", title: "Say it again", line: "One thing to change, then the same words again, with the change drawn over the first try." },
];

// When each step's blob blinks: different rhythms, offset, so they never blink together
const BLINKS = [
  { every: 4.6, delay: 0.4 },
  { every: 5.8, delay: 2.1 },
  { every: 3.9, delay: 1.3 },
];

// The showcases beside the Practice menu; each id is linked from its row in the menu
const SHOWCASES = [
  { id: "mode-read", group: "Speak on the spot", Graphic: ReadAlongDemo },
  { id: "mode-voice", group: "Your voice", Graphic: StressShift },
  { id: "mode-stories", group: "Tell stories", Graphic: GuidedStory, peek: true },
  { id: "mode-people", group: "Everyday conversation", Graphic: PeoplePicker },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-[1fr_1.1fr] lg:pt-12">
        <div className="flex flex-col gap-6">
          <h1 className="m-0 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <BounceWords text="Hear how you really sound." />
          </h1>
          <p className="m-0 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Speak for a minute. VoiceLab shows you, word by word, where your voice rose, fell and paused. Then it gives you one thing to change, and you say it again.
          </p>
          <div className="flex flex-wrap gap-3">
            <BouncyLink href="/try">Try a free Rapid Fire</BouncyLink>
            <BouncyLink href="/waitlist" variant="quiet">
              Join the waitlist
            </BouncyLink>
          </div>
          <p className="m-0 text-sm text-muted">No account needed. The free Rapid Fire runs in your browser.</p>
        </div>
        {/* One of a few of the app's course tiles, picked on each visit, large, as the hero picture */}
        <HeroTile />
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-8 bg-sand py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <Reveal>
            <h2 className="m-0 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">One take. One change. Say it again.</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted">Most speaking advice is vague. VoiceLab shows you the exact moment, so you know what to fix.</p>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 0.1}>
                <div className="h-full rounded-[1.75rem] bg-card p-6 transition-transform duration-300 hover:-translate-y-1.5 hover:rotate-[-0.5deg]">
                  <Blob size={112} face={step.face} arms={step.face === "beam"} talking={step.face === "talk"} blink={BLINKS[i] ?? BLINKS[0]} className={`-mb-2 -ml-3 -mt-2 ${step.face === "talk" ? "-rotate-6" : step.face === "wow" ? "rotate-3" : ""}`} />
                  <h3 className="mb-2 mt-4 font-serif text-2xl font-semibold">{step.title}</h3>
                  <p className="m-0 leading-relaxed text-muted">{step.line}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12">
            <figure className="m-0 overflow-hidden rounded-[2rem] bg-ink p-2 shadow-[0_20px_50px_rgba(30,38,32,0.18)]">
              <video className="block w-full rounded-[1.6rem]" src="/videos/demo.mp4" poster="/videos/demo-poster.jpg" controls preload="none" playsInline aria-label="A 30-second walkthrough of VoiceLab" />
            </figure>
            <p className="mt-3 text-center text-sm text-muted">The real app, in 30 seconds (sound on).</p>
          </Reveal>
        </div>
      </section>

      {/* What it sees: interactive cards */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <Reveal>
          <h2 className="m-0 max-w-2xl font-serif text-4xl font-semibold leading-tight sm:text-5xl">See what your voice is doing.</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">Two of the things VoiceLab notices, from real recordings. Scroll, watch, press the buttons.</p>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal className="min-w-0">
            <UmJar />
          </Reveal>
          <Reveal delay={0.1} className="min-w-0">
            <TalkLanes />
          </Reveal>
        </div>
      </section>

      {/* Reels */}
      <section className="overflow-x-clip bg-tint py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <Reveal>
            <h2 className="m-0 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Little lessons, under a minute each.</h2>
            <p className="mt-4 max-w-2xl text-lg text-muted">Three from the app’s courses. Each one teaches one idea, then you say it out loud.</p>
          </Reveal>
          <div className="mt-12">
            <Reels />
          </div>
        </div>
        {/* More lessons from the courses, gliding past */}
        <p id="lessons-band" className="mx-auto mb-4 mt-16 max-w-6xl px-4 text-sm font-bold uppercase tracking-wider text-accent sm:px-8">
          And many more, across twelve courses
        </p>
        <LessonBanner />
      </section>

      {/* Inside the app */}
      <section id="modes" className="mx-auto max-w-6xl scroll-mt-8 px-4 py-20 sm:px-8">
        <Reveal>
          <h2 className="m-0 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Inside the app</h2>
        </Reveal>
        <Reveal>
          <p className="mt-4 max-w-2xl text-lg text-muted">Twenty-odd ways to practise, in four groups. Pick anything, in any order, or let Today choose. Here are four up close.</p>
        </Reveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-[22rem_1fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-8">
            <SagePerch>
              <PracticeMenu />
            </SagePerch>
          </Reveal>
          <div className="flex min-w-0 flex-col gap-8">
            {SHOWCASES.map(({ id, group, Graphic, peek }) => (
              <Reveal key={id} className="min-w-0">
                <div id={id} className="scroll-mt-8">
                  <p className="m-0 mb-3 text-sm font-bold uppercase tracking-wider text-accent">{group}</p>
                  {peek ? (
                    <BlobPeek>
                      <Graphic />
                    </BlobPeek>
                  ) : (
                    <Graphic />
                  )}
                </div>
              </Reveal>
            ))}
            <Reveal className="min-w-0">
              <p className="m-0 mb-3 text-sm font-bold uppercase tracking-wider text-accent">Free, no sign-up</p>
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-peach p-6">
                <p className="m-0 max-w-md font-serif text-2xl font-semibold">Rapid Fire and Read aloud work right here in your browser.</p>
                <BouncyLink href="/try">Try it free</BouncyLink>
              </div>
            </Reveal>
          </div>
        </div>
        <Reveal className="mt-8">
          <div className="rounded-[1.75rem] border-2 border-line p-7">
            <h3 className="m-0 font-serif text-2xl font-semibold">Your recordings stay on your phone.</h3>
            <p className="mb-0 mt-2 max-w-3xl leading-relaxed text-muted">
              VoiceLab keeps your takes on your device. Your phone’s speech recognition turns words into text, which on most phones is done by Apple or Google. Coaching notes are optional, and we say exactly what they send.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Closing call */}
      <section className="mx-auto max-w-6xl px-4 sm:px-8">
        <Reveal>
          <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-[2.25rem] bg-ink px-8 py-14 text-paper sm:px-14 lg:pr-[24rem]">
            {/* The blob and Sage, side by side on a ground line, now and then trading a few lines */}
            <ClosingChat />
            <h2 className="m-0 font-serif text-4xl font-semibold sm:text-6xl">See how you sound.</h2>
            <p className="m-0 max-w-xl text-lg text-[#D7DED9]">Join the waitlist and we’ll tell you the day VoiceLab opens. Or try one free Rapid Fire right now.</p>
            <div className="flex flex-wrap gap-3">
              <BouncyLink href="/waitlist" variant="light">
                Join the waitlist
              </BouncyLink>
              <BouncyLink href="/try" variant="quiet" className="border-[#59645C] text-paper hover:border-paper">
                Try a free Rapid Fire
              </BouncyLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
