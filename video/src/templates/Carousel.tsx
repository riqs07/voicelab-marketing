// Instagram carousels from the app's Learn cards (4:5 stills, one composition per slide via props).
// Any card works: the hook, the verdict (myth-or-fact cards only), what the research found, what it means,
// what to do, then the call to action. Cards with their own drawings get them on the "means" and "do" slides.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import cards from '../content/learnCards.json';
import {brand} from '../content/brand';
import {LogoMark} from '../kit/parts';
import {C, sans, serif} from '../kit/theme';

type Card = {
  id: string;
  kind: string;
  verdict?: string;
  title: string;
  finding: string;
  meaning: string;
  doThis: string;
  keyLine: string;
  evidence: string;
  tryIt: {label: string};
  recall: {question: string; options: string[]; answer: number};
  source: {text: string};
};

const CARDS = cards as Record<string, Card>;

export type Slide = 'hook' | 'verdict' | 'finding' | 'meaning' | 'do' | 'cta';
export const slidesFor = (card: Card): Slide[] => (card.verdict ? ['hook', 'verdict', 'finding', 'meaning', 'do', 'cta'] : ['hook', 'finding', 'meaning', 'do', 'cta']);

const KIND: Record<string, string> = {'myth-or-fact': 'Myth or fact?', explainer: 'Did you know?', 'try-it': 'Try this'};
const VERDICT: Record<string, {word: string; bg: string; ink: string}> = {
  myth: {word: 'Myth.', bg: C.peach, ink: C.peachInk},
  fact: {word: 'Fact.', bg: C.greenTint, ink: C.green},
  mixed: {word: 'It’s mixed.', bg: '#F3E9C9', ink: '#6B5410'},
};
const EVIDENCE: Record<string, string> = {strong: 'Strong evidence', moderate: 'Moderate evidence', mixed: 'Mixed evidence', practical: 'From coaching practice', myth: 'Evidence says no'};

// A word as a pill; pause words in orange
const Pill: React.FC<{w: string; um?: boolean; size?: number}> = ({w, um, size = 40}) => (
  <span
    style={{
      display: 'inline-block',
      padding: `${size * 0.18}px ${size * 0.45}px`,
      margin: `0 ${size * 0.18}px ${size * 0.3}px 0`,
      borderRadius: 999,
      fontSize: size,
      fontWeight: um ? 700 : 500,
      background: um ? C.warm : C.card,
      color: um ? C.peachInk : C.ink,
      boxShadow: um ? 'none' : '0 3px 0 #efe8dc',
    }}
  >
    {w}
  </span>
);

// Drawings for particular cards, by card id and slide
const DRAWINGS: Record<string, Partial<Record<Slide, React.ReactNode>>> = {
  'nerves-um': {
    meaning: (
      <div style={{display: 'flex', flexDirection: 'column', gap: 36}}>
        <div>
          <div style={{fontSize: 34, fontWeight: 700, color: C.green, marginBottom: 16}}>✓ A few: natural</div>
          {['So', 'um', 'the', 'plan', 'is', 'Monday.'].map((w, i) => (
            <Pill key={i} w={w} um={w === 'um'} />
          ))}
        </div>
        <div>
          <div style={{fontSize: 34, fontWeight: 700, color: C.orange, marginBottom: 16}}>✗ A stream: distracting</div>
          {['So', 'um', 'the', 'uh', 'plan', 'like', 'is', 'um', 'Monday', 'uh'].map((w, i) => (
            <Pill key={i} w={w} um={['um', 'uh', 'like'].includes(w)} />
          ))}
        </div>
      </div>
    ),
    do: (
      <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap', rowGap: 24}}>
        <Pill w="Here's" size={44} />
        <Pill w="the" size={44} />
        <Pill w="plan." size={44} />
        {/* The silent pause: a gap with a quiet bar, where the "um" used to be */}
        <span style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 18px 14px 4px'}}>
          <span style={{width: 150, height: 14, borderRadius: 999, background: C.green, opacity: 0.85}} />
          <span style={{fontSize: 30, fontWeight: 700, color: C.green, marginTop: 10}}>1 s pause</span>
        </span>
        <Pill w="We" size={44} />
        <Pill w="launch" size={44} />
        <Pill w="Monday." size={44} />
      </div>
    ),
  },
};

const Frame: React.FC<{n: number; of: number; bg: string; dark?: boolean; children: React.ReactNode}> = ({n, of, bg, dark, children}) => (
  <AbsoluteFill style={{background: bg, fontFamily: sans, color: dark ? C.bg : C.ink}}>
    {/* Header: the logo and the page */}
    <div style={{position: 'absolute', top: 64, left: 80, right: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <LogoMark size={56} />
        <span style={{fontFamily: serif, fontWeight: 600, fontSize: 40}}>VoiceLab</span>
      </div>
      <span style={{fontSize: 30, fontWeight: 700, opacity: 0.6}}>
        {n}/{of}
      </span>
    </div>
    <div style={{position: 'absolute', top: 200, left: 80, right: 80, bottom: 170, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>{children}</div>
    {/* Footer: progress dots, and a swipe hint until the last slide */}
    <div style={{position: 'absolute', bottom: 72, left: 80, right: 80, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', gap: 12}}>
        {Array.from({length: of}, (_, i) => (
          <span key={i} style={{width: i + 1 === n ? 40 : 14, height: 14, borderRadius: 999, background: dark ? C.bg : C.green, opacity: i + 1 === n ? 1 : 0.3}} />
        ))}
      </div>
      {n < of ? <span style={{fontSize: 32, fontWeight: 700, color: dark ? C.bg : C.green}}>Swipe →</span> : null}
    </div>
  </AbsoluteFill>
);

const Kicker: React.FC<{children: React.ReactNode; colour?: string}> = ({children, colour = C.green}) => (
  <div style={{fontSize: 34, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: colour, marginBottom: 30}}>{children}</div>
);

export const Carousel: React.FC<{card: string; slide: number}> = ({card: id, slide}) => {
  const card = CARDS[id];
  if (!card) throw new Error(`No Learn card "${id}" in learnCards.json; copy it with scripts/learn-card.mjs`);
  const slides = slidesFor(card);
  const which = slides[slide - 1];
  if (!which) throw new Error(`Card "${id}" has ${slides.length} slides`);
  const n = slide;
  const of = slides.length;
  const drawing = DRAWINGS[id]?.[which];
  const body = {fontSize: 50, lineHeight: 1.35, margin: 0} as const;

  if (which === 'hook')
    return (
      <Frame n={n} of={of} bg={C.bg}>
        <Kicker>{KIND[card.kind] ?? 'Did you know?'}</Kicker>
        <h1 style={{fontFamily: serif, fontWeight: 600, fontSize: 118, lineHeight: 1.04, letterSpacing: '-0.02em', margin: 0}}>{card.title}</h1>
        <p style={{...body, marginTop: 48, color: C.muted}}>{card.verdict ? 'Most people would say yes. Here’s what the research says.' : 'Here’s what the research says.'}</p>
      </Frame>
    );
  if (which === 'verdict') {
    const v = VERDICT[card.verdict ?? 'mixed'] ?? VERDICT.mixed;
    return (
      <Frame n={n} of={of} bg={v.bg}>
        <div style={{alignSelf: 'flex-start', border: `10px solid ${v.ink}`, borderRadius: 36, padding: '14px 52px', transform: 'rotate(-6deg)', color: v.ink, fontFamily: serif, fontWeight: 700, fontSize: 200, lineHeight: 1}}>{v.word}</div>
        {/* The card's own recall question and its answer, so this slide doesn't repeat the closing line */}
        <p style={{...body, marginTop: 70, fontSize: 44, color: v.ink, opacity: 0.85}}>{card.recall.question}</p>
        <p style={{...body, marginTop: 14, fontSize: 64, fontFamily: serif, fontWeight: 600, color: v.ink}}>{card.recall.options[card.recall.answer]}.</p>
      </Frame>
    );
  }
  if (which === 'finding')
    return (
      <Frame n={n} of={of} bg={C.bg}>
        <Kicker>What the research found</Kicker>
        <p style={{...body, fontSize: 56, fontFamily: serif, fontWeight: 500, lineHeight: 1.3}}>{card.finding}</p>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 50}}>
          <span style={{padding: '10px 24px', borderRadius: 999, background: C.greenTint, color: C.green, fontWeight: 700, fontSize: 30}}>{EVIDENCE[card.evidence] ?? 'Evidence'}</span>
          <span style={{padding: '10px 24px', borderRadius: 999, background: C.card, color: C.muted, fontWeight: 600, fontSize: 30}}>{card.source.text}</span>
        </div>
      </Frame>
    );
  if (which === 'meaning')
    return (
      <Frame n={n} of={of} bg={C.greenTint}>
        <Kicker>What it means</Kicker>
        <p style={{...body, fontSize: 64, fontFamily: serif, fontWeight: 600, lineHeight: 1.18}}>{card.meaning}</p>
        {drawing ? <div style={{marginTop: 64}}>{drawing}</div> : null}
      </Frame>
    );
  if (which === 'do')
    return (
      <Frame n={n} of={of} bg={C.bg}>
        <Kicker colour={C.orange}>Try this</Kicker>
        <p style={{...body, fontSize: 60, fontFamily: serif, fontWeight: 600, lineHeight: 1.2}}>{card.doThis}</p>
        {drawing ? <div style={{marginTop: 70}}>{drawing}</div> : null}
      </Frame>
    );
  return (
    <Frame n={n} of={of} bg={C.ink} dark>
      <Kicker colour={C.warm}>Remember</Kicker>
      <p style={{...body, fontSize: 76, fontFamily: serif, fontWeight: 600, lineHeight: 1.12}}>“{card.keyLine}”</p>
      <p style={{...body, marginTop: 60, fontSize: 40, color: '#D7DED9'}}>Practise it in the app: {card.tryIt.label.replace(': ', ' · ')}</p>
      <div style={{alignSelf: 'flex-start', marginTop: 50, padding: '22px 44px', borderRadius: 999, background: C.bg, color: C.ink, fontWeight: 700, fontSize: 44}}>{brand.cta}</div>
    </Frame>
  );
};
