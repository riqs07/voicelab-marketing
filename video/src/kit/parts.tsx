// Pieces every template shares: the layout per format, captions, hook, end card and audio.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {brand} from '../content/brand';
import {C, clamp, fadeIn, fadeOutAt, fr, FPS, rise, sans, serif} from './theme';
import type {TimedBeat, Timeline} from './timeline';

export type Format = 'story' | 'feed' | 'wide';

// Where things go in each format. Story keeps clear of the bottom ~300 px and the
// right ~130 px where TikTok, Reels and Shorts draw their buttons.
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const format: Format = width > height ? 'wide' : height / width > 1.5 ? 'story' : 'feed';
  if (format === 'story')
    return {format, width, height, pad: 72, top: 220, bottom: 1380, captionTop: 1440, s: 1};
  if (format === 'feed') return {format, width, height, pad: 64, top: 80, bottom: 1060, captionTop: 1110, s: 0.84};
  return {format, width, height, pad: 120, top: 90, bottom: 900, captionTop: 940, s: 0.8};
};

// Plays each line's voice file at its start, when the video has been voiced.
export const AudioTrack: React.FC<{tl: Timeline}> = ({tl}) => (
  <>
    {tl.beats.map((b) =>
      b.audio ? (
        <Sequence key={b.id} from={fr(b.start)} durationInFrames={fr(b.fastForward ? b.fastForward.audioFor : b.end - b.start) + 4} layout="none">
          {/* A fast-forwarded line fades out over its last few frames instead of cutting */}
          <Audio
            src={staticFile(b.audio)}
            volume={(i) => (b.fastForward ? interpolate(i, [fr(b.fastForward.audioFor) - 6, fr(b.fastForward.audioFor)], [1, 0], clamp) : 1)}
          />
        </Sequence>
      ) : null,
    )}
  </>
);

// Burned-in captions. Long lines are split into sentences, each shown for its share of the line.
type Chunk = {start: number; end: number; text: string; quote?: boolean};
const chunks = (tl: Timeline, hide: string[]): Chunk[] =>
  tl.beats
    .filter((b) => b.caption !== '' && !hide.includes(b.id))
    .flatMap((b) => {
      const text = b.caption ?? b.text;
      const parts = b.quote ? [text] : text.split(/(?<=[.?!])\s+(?=[A-Z])/);
      const total = parts.reduce((a, p) => a + p.length, 0);
      let t = b.start;
      return parts.map((p) => {
        const dur = ((b.end - b.start) * p.length) / total;
        const c = {start: t, end: t + dur, text: p, quote: b.quote};
        t += dur;
        return c;
      });
    });

export const Captions: React.FC<{tl: Timeline; hide?: string[]}> = ({tl, hide = []}) => {
  const f = useCurrentFrame();
  const L = useLayout();
  const t = f / FPS;
  const lines = chunks(tl, hide);
  const holdOf = (i: number) => {
    const next = lines[i + 1];
    return Math.min(lines[i].end + 0.35, next ? next.start - 0.02 : lines[i].end + 0.35);
  };
  const idx = lines.findIndex((b, i) => t >= b.start - 0.05 && t < holdOf(i));
  if (idx < 0) return null;
  const line = lines[idx];
  const hold = holdOf(idx);
  const o = Math.min(
    interpolate(f, [fr(line.start - 0.05), fr(line.start - 0.05) + 3], [0, 1], clamp),
    interpolate(f, [fr(hold) - 3, fr(hold)], [1, 0], clamp),
  );
  const text = line.text;
  return (
    <div
      style={{
        position: 'absolute',
        top: L.captionTop,
        left: L.pad + 18,
        right: L.format === 'story' ? 130 : L.pad + 18,
        display: 'flex',
        justifyContent: 'center',
        opacity: o,
      }}
    >
      <span
        style={{
          background: 'rgba(30,38,32,0.86)',
          color: '#FFFFFF',
          fontFamily: sans,
          fontWeight: 600,
          fontStyle: line.quote ? 'italic' : 'normal',
          fontSize: (line.quote ? 40 : 46) * L.s,
          lineHeight: 1.3,
          padding: `${14 * L.s}px ${28 * L.s}px`,
          borderRadius: 18,
          textAlign: 'center',
        }}
      >
        {line.quote ? `“${text}”` : text}
      </span>
    </div>
  );
};

// The opening question in big type. "A... B" splits into two lines, the second in green.
export const Hook: React.FC<{b: TimedBeat; until: number; text?: string}> = ({b, until, text}) => {
  const f = useCurrentFrame();
  const L = useLayout();
  const words = text ?? b.text;
  const parts = words.split(/(?<=\.\.\.|…|\?)\s+/);
  const out = fadeOutAt(f, until, 10);
  const span = b.end - b.start;
  return (
    <AbsoluteFill style={{opacity: out}}>
      <h1
        style={{
          position: 'absolute',
          left: L.pad + 12,
          right: L.pad + 12,
          top: L.format === 'story' ? 430 : L.top + 140 * L.s,
          margin: 0,
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 124 * L.s,
          lineHeight: 1.06,
          letterSpacing: '-0.015em',
          color: C.ink,
        }}
      >
        {parts.map((p, i) => {
          const at = b.start + (span * i) / Math.max(1, parts.length) - 0.05;
          const pIn = fadeIn(f, at, 16);
          return (
            <span
              key={p}
              style={{
                display: 'block',
                opacity: pIn,
                transform: rise(pIn, 30),
                color: i > 0 ? C.green : C.ink,
                marginTop: i > 0 ? 28 * L.s : 0,
              }}
            >
              {p.replace(/\.\.\.$/, '…')}
            </span>
          );
        })}
      </h1>
    </AbsoluteFill>
  );
};

export const LogoMark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
    <rect width={34} height={34} rx={9} fill={C.green} />
    <path d="M6 22 C 11 22, 12 12, 17 12 C 22 12, 23 20, 28 15" stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" />
  </svg>
);

// The closing card, the same on every video. `at` is when it starts (seconds).
export const EndCard: React.FC<{at: number; line?: string}> = ({at, line}) => {
  const f = useCurrentFrame();
  const L = useLayout();
  const p1 = fadeIn(f, at, 16);
  const p2 = fadeIn(f, at + 0.7, 16);
  const p3 = fadeIn(f, at + 1.3, 16);
  const wide = L.format === 'wide';
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: L.format === 'story' ? 400 : wide ? 230 : L.top + 120,
          left: L.pad + 12,
          right: L.pad + 12,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{opacity: p1, transform: rise(p1, 20)}}>
          <LogoMark size={140 * L.s} />
        </div>
        <h1
          style={{
            margin: `${48 * L.s}px 0 0`,
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 168 * L.s,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: C.ink,
            opacity: p1,
            transform: rise(p1, 20),
          }}
        >
          VoiceLab.
        </h1>
        <h2
          style={{
            margin: `${28 * L.s}px 0 0`,
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 88 * L.s,
            lineHeight: 1.08,
            color: C.green,
            opacity: p2,
            transform: rise(p2, 20),
          }}
        >
          {brand.tagline}
        </h2>
        {line ? (
          <p style={{margin: `${40 * L.s}px 0 0`, fontSize: 46 * L.s, lineHeight: 1.35, color: C.muted, opacity: p3}}>
            {line}
          </p>
        ) : null}
        <div
          style={{
            marginTop: 48 * L.s,
            alignSelf: 'flex-start',
            padding: `${18 * L.s}px ${36 * L.s}px`,
            borderRadius: 999,
            background: C.green,
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 44 * L.s,
            opacity: p3,
            transform: rise(p3, 14),
          }}
        >
          {brand.cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Small grey label above a card ("Phrase 4", "Second try").
export const Label: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const L = useLayout();
  return <div style={{fontSize: 36 * L.s, fontWeight: 600, color: C.muted, ...style}}>{children}</div>;
};

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: C.bg, fontFamily: sans, color: C.ink}}>{children}</AbsoluteFill>
);

// A white rounded card.
export const cardStyle = (s: number): React.CSSProperties => ({
  background: C.card,
  borderRadius: 48 * s,
  padding: 48 * s,
  boxShadow: '0 4px 10px rgba(30,38,32,0.07)',
});

// A coloured note under a card.
export const noteStyle = (s: number, tone: 'warm' | 'green'): React.CSSProperties => ({
  margin: 0,
  padding: `${32 * s}px ${44 * s}px`,
  borderRadius: 36 * s,
  fontSize: 58 * s,
  lineHeight: 1.25,
  fontWeight: 600,
  background: tone === 'warm' ? C.peach : C.greenTint,
  color: tone === 'warm' ? C.peachInk : C.green,
});
