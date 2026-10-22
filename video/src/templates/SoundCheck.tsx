// Sound check: hook, the phrase with a rising line, a note, the phrase again with a falling line, end card.
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {soundCheck as K} from '../content/soundCheck';
import {pitchPath, wordSlots, yOf} from '../kit/curve';
import {AudioTrack, Captions, cardStyle, EndCard, Hook, Label, noteStyle, Stage, useLayout} from '../kit/parts';
import {C, fadeIn, fadeOutAt, fr, gentle, progress, rise, serif} from '../kit/theme';
import {beat, buildTimeline} from '../kit/timeline';

export const soundCheckTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

const Arrow: React.FC<{dir: 'up' | 'down'; color: string; size: number}> = ({dir, color, size}) => (
  <svg width={size} height={size} viewBox="0 0 14 14" aria-hidden>
    <path
      d={dir === 'up' ? 'M2 11 L11 3 M5 3 L11 3 L11 9' : 'M2 3 L11 11 M11 5 L11 11 L5 11'}
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SoundCheck: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = soundCheckTimeline(voiced);
  const hook = beat(tl, 'hook');
  const take1 = beat(tl, 'take1');
  const note = beat(tl, 'note');
  const take2 = beat(tl, 'take2');
  const close = beat(tl, 'close');
  const endAt = close.start + K.endCardDelay;

  const cardIn = take1.start - 0.35;
  // "Tell it again." is the last part of the note line.
  const tellAgain = note.start + (note.end - note.start) * 0.78;

  const cardW = L.width - 2 * L.pad;
  const chartW = cardW - 2 * 48 * L.s;
  const chartH = 230 * L.s;
  const first = pitchPath(K.words, K.first, chartW, chartH);
  const second = pitchPath(K.words, K.second, chartW, chartH);
  const firstLen = getLength(first);
  const secondLen = getLength(second);
  const slots = wordSlots(K.words, chartW);
  const usualY = yOf(0.5, chartH);

  const draw1 = progress(f, take1.start + 0.05, take1.end - 0.05);
  const draw2 = progress(f, take2.start + 0.05, take2.end - 0.05);
  const grey = fadeIn(f, tellAgain, 18);
  const pop1 = spring({frame: f - fr(take1.end - 0.15), fps, config: gentle});
  const pop2 = spring({frame: f - fr(take2.end - 0.15), fps, config: gentle});
  const head1 = draw1 > 0 && draw1 < 1 ? getPointAtLength(first, draw1 * firstLen) : null;
  const head2 = draw2 > 0 && draw2 < 1 ? getPointAtLength(second, draw2 * secondLen) : null;
  const focus = slots[K.focusWord];
  const focusY1 = yOf(K.first[K.focusWord], chartH);

  const cardP = fadeIn(f, cardIn, 12);
  const out = fadeOutAt(f, endAt, 10);
  const head1P = fadeIn(f, cardIn + 0.1, 14) * fadeOutAt(f, tellAgain, 8);
  const head2P = fadeIn(f, tellAgain + 0.05, 14);
  const note1 = fadeIn(f, note.start + 0.6, 14) * fadeOutAt(f, tellAgain, 8);
  const note2 = fadeIn(f, close.start, 14);
  const story = L.format === 'story';
  const cardTop = story ? 450 : L.top + 190 * L.s;

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(cardIn) + 2 ? <Hook b={hook} until={cardIn} /> : null}
      {f >= fr(cardIn) - 1 && f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: out}}>
          <div style={{position: 'absolute', top: cardTop - 210 * L.s, left: L.pad, right: L.pad, height: 200}}>
            <div style={{position: 'absolute', inset: 0, opacity: head1P, transform: rise(head1P, 16)}}>
              <Label>{K.label}</Label>
              <h2 style={h2(L.s)}>How it sounded</h2>
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: head2P, transform: rise(head2P, 16)}}>
              <Label>Same phrase · second try</Label>
              <h2 style={h2(L.s)}>Tell it again.</h2>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: cardTop,
              left: L.pad,
              right: L.pad,
              ...cardStyle(L.s),
              opacity: cardP,
              transform: rise(cardP, 30),
            }}
          >
            <div style={{display: 'flex', justifyContent: 'flex-end', height: 56 * L.s, position: 'relative'}}>
              {[
                {b: K.firstBadge, p: pop1 * (1 - grey), color: C.orange},
                {b: K.secondBadge, p: pop2, color: C.green},
              ].map(({b, p, color}) => (
                <span
                  key={b.label}
                  style={{
                    position: 'absolute',
                    right: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    color,
                    fontWeight: 700,
                    fontSize: 48 * L.s,
                    opacity: Math.min(1, p * 1.5),
                    transform: `scale(${0.7 + 0.3 * p})`,
                    transformOrigin: 'right center',
                  }}
                >
                  <Arrow dir={b.dir} color={color} size={48 * L.s} />
                  {b.label}
                </span>
              ))}
            </div>
            <svg width={chartW} height={chartH} style={{display: 'block', overflow: 'visible', marginTop: 20 * L.s}}>
              <line x1={0} y1={usualY} x2={chartW} y2={usualY} stroke={C.usual} strokeWidth={3} strokeDasharray="11 8" />
              <path d={first} pathLength={1} stroke={C.green} strokeWidth={8} fill="none" strokeLinecap="round"
                strokeDasharray="1 1" strokeDashoffset={1 - draw1} opacity={draw1 > 0 ? 1 - grey : 0} />
              <path d={first} stroke={C.grey} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="16 11" opacity={grey} />
              <circle cx={focus.cx} cy={focusY1} r={16 * (0.6 + 0.4 * pop1)} fill="none" stroke={C.orange} strokeWidth={4.5}
                opacity={pop1 * (1 - grey)} />
              <path d={second} pathLength={1} stroke={C.green} strokeWidth={8} fill="none" strokeLinecap="round"
                strokeDasharray="1 1" strokeDashoffset={1 - draw2} opacity={draw2 > 0 ? 1 : 0} />
              {head1 ? <circle cx={head1.x} cy={head1.y} r={11} fill={C.ink} /> : null}
              {head2 ? <circle cx={head2.x} cy={head2.y} r={11} fill={C.ink} /> : null}
            </svg>
            <div style={{position: 'relative', height: 70 * L.s, marginTop: 22 * L.s, fontSize: 46 * L.s}}>
              {K.words.map((w, i) => {
                const isFocus = i === K.focusWord;
                const hi = isFocus ? pop1 * (1 - grey) : 0;
                return (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      left: slots[i].x,
                      width: slots[i].w,
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        padding: '0 10px',
                        borderRadius: 12,
                        background: `rgba(252,227,207,${hi})`,
                        color: hi > 0.5 ? C.peachInk : C.ink,
                        fontWeight: isFocus && pop2 > 0.5 ? 700 : 400,
                      }}
                    >
                      {w}
                    </span>
                  </span>
                );
              })}
            </div>
            <div style={{display: 'flex', gap: 44, fontSize: 34 * L.s, color: C.muted, marginTop: 14, alignItems: 'center', opacity: grey}}>
              <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <svg width={60} height={12}><line x1={0} y1={6} x2={60} y2={6} stroke={C.grey} strokeWidth={5} strokeDasharray="12 8" /></svg>
                First try
              </span>
              <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
                <svg width={60} height={12}><line x1={0} y1={6} x2={60} y2={6} stroke={C.green} strokeWidth={7} /></svg>
                This try
              </span>
            </div>
          </div>

          <div style={{position: 'absolute', top: cardTop + (story ? 640 : 600 * L.s), left: L.pad, right: L.pad}}>
            <div style={{position: 'absolute', inset: 0, opacity: note1, transform: rise(note1, 16)}}>
              <p style={noteStyle(L.s, 'warm')}>{K.firstNote}</p>
            </div>
            <div style={{position: 'absolute', inset: 0, opacity: note2, transform: rise(note2, 16)}}>
              <p style={noteStyle(L.s, 'green')}>{K.secondNote}</p>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      <Captions tl={tl} />
    </Stage>
  );
};

const h2 = (s: number): React.CSSProperties => ({
  margin: `${12 * s}px 0 0`,
  fontFamily: serif,
  fontWeight: 600,
  fontSize: 100 * s,
  letterSpacing: '-0.01em',
  lineHeight: 1.05,
  color: C.ink,
});
