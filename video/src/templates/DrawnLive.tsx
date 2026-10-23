// Your voice, drawn live: the recording's real pitch draws itself as it plays, each word appearing at its
// real moment and height. The camera pushes in on "me?", the second take falls over the grey first one,
// then the lines shrink into the phone showing the app's real screen.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {drawnLive as K} from '../content/drawnLive';
import pitchJson from '../content/pitch.json';
import {AudioTrack, Captions, EndCard, Hook, Label, Stage, useLayout} from '../kit/parts';
import {C, clamp, ease, fadeIn, fadeOutAt, fr, gentle, rise} from '../kit/theme';
import {beat, buildTimeline, type TimedBeat} from '../kit/timeline';

export const drawnLiveTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

export type Pitch = {tickMs: number; steps: (number | null)[]};
export const pitch = pitchJson as Record<string, Pitch>;
export const LOW = -13;
export const HIGH = 10;

// The voiced runs of a take up to `upTo` seconds into it, as SVG path data. Gaps under BRIDGE seconds get a
// thin dashed bridge (no clear pitch there, often a creaky low ending), drawn apart from the real readings.
const BRIDGE = 0.7;
export const pathUpTo = (p: Pitch, upTo: number, x: (s: number) => number, y: (v: number) => number) => {
  let d = '';
  let bridges = '';
  let open = false;
  let head: {x: number; y: number} | null = null;
  let lastT = -1;
  p.steps.forEach((v, i) => {
    const t = (i * p.tickMs) / 1000;
    if (t > upTo) return;
    if (v === null) {
      open = false;
      return;
    }
    const px = x(t);
    const py = y(Math.max(LOW, Math.min(HIGH, v)));
    if (!open && head && t - lastT < BRIDGE) bridges += `M${head.x.toFixed(1)} ${head.y.toFixed(1)} L${px.toFixed(1)} ${py.toFixed(1)} `;
    d += `${open ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)} `;
    open = true;
    head = {x: px, y: py};
    lastT = t;
  });
  return {d, bridges, head: head as {x: number; y: number} | null};
};

// The voice's height over a word: the median of its voiced readings; with none, the nearest readings
// before and after it, averaged.
export const heightOf = (p: Pitch, start: number, end: number) => {
  const rows = p.steps.map((v, i) => ({v, t: (i * p.tickMs) / 1000})).filter((r) => r.v !== null) as {v: number; t: number}[];
  const vals = rows.filter((r) => r.t >= start && r.t <= end).map((r) => r.v).sort((a, b) => a - b);
  if (vals.length) return vals[Math.floor(vals.length / 2)];
  const before = [...rows].reverse().find((r) => r.t < start);
  const after = rows.find((r) => r.t > end);
  if (before && after) return (before.v + after.v) / 2;
  return (before ?? after)?.v ?? null;
};

export const DrawnLive: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = drawnLiveTimeline(voiced);
  const t = f / fps;
  const hook = beat(tl, 'hook');
  const take1 = beat(tl, 'take1');
  const note = beat(tl, 'note');
  const take2 = beat(tl, 'take2');
  const close = beat(tl, 'close');
  const p1 = pitch[`audio/${K.video}/take1.mp3`];
  const p2 = pitch[`audio/${K.video}/take2.mp3`];

  const story = L.format === 'story';
  const left = L.pad;
  const width = L.width - 2 * L.pad;
  const span = Math.max(take1.end - take1.start, take2.end - take2.start);
  const midY = story ? 860 : L.height * 0.52;
  const perStep = (story ? 32 : 24) * L.s;
  const x = (s: number) => left + (s / span) * width;
  const y = (v: number) => midY - v * perStep;

  const since1 = t - take1.start;
  const since2 = t - take2.start;
  const line1 = pathUpTo(p1, since1, x, y);
  const line2 = since2 > 0 ? pathUpTo(p2, since2, x, y) : {d: '', bridges: '', head: null};
  const grey = fadeIn(f, take2.start - 0.4, 14);

  // The camera pushes in on the end of the first take, then eases back as the note starts.
  const endWord = K.words.take1[K.words.take1.length - 1];
  const endH = heightOf(p1, endWord.start, endWord.end + 0.1) ?? 0;
  // The ring sits on the line's real last point in the first take.
  const end1 = pathUpTo(p1, 99, x, y).head ?? {x: x(endWord.end), y: y(endH)};
  const focus = {x: end1.x, y: end1.y};
  const push =
    interpolate(f, [fr(take1.start + endWord.start - 0.35), fr(take1.start + endWord.start + 0.15)], [0, 1], {...clamp, easing: ease}) *
    (1 - interpolate(f, [fr(note.start + 0.9), fr(note.start + 1.6)], [0, 1], {...clamp, easing: ease}));
  const zoom = 1 + 0.5 * push;
  const camX = (L.width / 2 - focus.x) * push * 0.6;
  const camY = (midY - focus.y) * push * 0.6;

  const pop1 = spring({frame: f - fr(take1.end - 0.1), fps, config: gentle});
  const pop2 = spring({frame: f - fr(take2.end - 0.1), fps, config: gentle});
  const endWord2 = K.words.take2[K.words.take2.length - 1];
  const endH2 = heightOf(p2, endWord2.start, endWord2.end + 0.1) ?? 0;

  // The ending: lines shrink into the phone, which shows the app's real screen.
  const toPhone = interpolate(f, [fr(close.start + 0.1), fr(close.start + 1.1)], [0, 1], {...clamp, easing: ease});
  const phoneIn = fadeIn(f, close.start + 0.35, 14);
  // The end card takes over as "VoiceLab" is said.
  const endAt = close.start + 1.65;
  const out = fadeOutAt(f, endAt, 10);
  const stageIn = fadeIn(f, take1.start - 0.3, 10);

  const words = (list: readonly {text: string; start: number; end: number}[], p: Pitch, startAt: number, fade: number, bold: number) =>
    list.map((w, i) => {
      const h = heightOf(p, w.start, w.end);
      const wIn = fadeIn(f, startAt + w.start - 0.05, 6);
      const last = i === list.length - 1;
      return (
        <span
          key={`${w.text}${i}`}
          style={{
            position: 'absolute',
            left: x(w.start),
            top: y(h ?? 0) - 96 * L.s,
            fontSize: (last ? 64 : 54) * L.s,
            fontWeight: last && bold > 0.5 ? 700 : 400,
            color: C.ink,
            whiteSpace: 'nowrap',
            opacity: wIn * fade,
            transform: rise(wIn, 14),
          }}
        >
          {w.text}
        </span>
      );
    });

  const k = (story ? 1180 : 860) / 844;
  const phoneW = 390 * k;
  const phoneH = 844 * k;
  const phoneX = (L.width - phoneW) / 2;
  const phoneY = story ? 330 : (L.height - phoneH) / 2;
  // Shrink the lines toward the phone's screen centre.
  const shrink = 1 - 0.7 * toPhone;
  const dx = (L.width / 2 - L.width / 2) * toPhone;
  const dy = (phoneY + phoneH * 0.42 - midY) * toPhone;

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(take1.start - 0.3) + 2 ? <Hook b={hook} until={take1.start - 0.3} /> : null}
      {f >= fr(take1.start - 0.3) && f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: stageIn * out}}>
          <div style={{position: 'absolute', top: story ? 230 : L.top, left: L.pad, right: L.pad, opacity: 1 - toPhone}}>
            <Label>{t < take2.start - 0.4 ? 'One phrase · first try' : 'Same phrase · second try'}</Label>
          </div>
          {phoneIn > 0 ? (
            <div
              style={{
                position: 'absolute',
                left: phoneX - 11 * k,
                top: phoneY - 11 * k,
                width: phoneW + 22 * k,
                height: phoneH + 22 * k,
                borderRadius: 58 * k,
                background: '#1E2620',
                padding: 11 * k,
                boxSizing: 'border-box',
                opacity: phoneIn,
                transform: `scale(${0.92 + 0.08 * phoneIn})`,
                boxShadow: '0 30px 60px rgba(30,38,32,0.18)',
              }}
            >
              <div style={{width: '100%', height: '100%', borderRadius: 48 * k, overflow: 'hidden'}}>
                <Img src={staticFile(`demo/${K.appShot}.png`)} style={{width: '100%', height: '100%', display: 'block'}} />
              </div>
            </div>
          ) : null}
          <AbsoluteFill
            style={{
              transform: `translate(${camX + dx}px, ${camY + dy}px) scale(${zoom * shrink})`,
              transformOrigin: `${L.width / 2}px ${midY}px`,
              opacity: 1 - interpolate(toPhone, [0.55, 0.9], [0, 1], clamp),
            }}
          >
            <svg width={L.width} height={L.height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <line x1={left} y1={midY} x2={left + width} y2={midY} stroke={C.usual} strokeWidth={3} strokeDasharray="12 9" />
              {grey < 1 ? <path d={line1.d} stroke={C.green} strokeWidth={30} opacity={0.12 * (1 - grey)} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
              <path d={line1.d} stroke={grey > 0 ? C.grey : C.green} strokeWidth={grey > 0 ? 6 : 11} fill="none"
                strokeLinecap="round" strokeLinejoin="round" strokeDasharray={grey > 0 ? '16 12' : undefined}
                opacity={1 - 0.35 * grey} />
              <path d={line1.bridges} stroke={grey > 0 ? C.grey : C.green} strokeWidth={4} fill="none" strokeDasharray="6 10" strokeLinecap="round" opacity={0.6 * (1 - 0.35 * grey)} />
              <path d={line2.bridges} stroke={C.green} strokeWidth={4} fill="none" strokeDasharray="6 10" strokeLinecap="round" opacity={0.7} />
              <path d={line2.d} stroke={C.green} strokeWidth={30} opacity={0.12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={line2.d} stroke={C.green} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              {line1.head && since1 < take1.end - take1.start ? <circle cx={line1.head.x} cy={line1.head.y} r={12} fill={C.ink} /> : null}
              {line2.head && since2 < take2.end - take2.start ? <circle cx={line2.head.x} cy={line2.head.y} r={12} fill={C.ink} /> : null}
              <circle cx={focus.x} cy={focus.y} r={26 * (0.6 + 0.4 * pop1)} fill="none" stroke={C.orange} strokeWidth={5}
                opacity={pop1 * (1 - grey)} />
            </svg>
            {words(K.words.take1, p1, take1.start, 1 - grey, 0)}
            {words(K.words.take2, p2, take2.start, 1, pop2)}
            <Badge at={{x: focus.x - 40, y: focus.y - 150 * L.s}} label="Rose" dir="up" color={C.orange} p={pop1 * (1 - grey)} s={L.s} />
            <Badge at={{x: x(endWord2.end) - 40, y: y(endH2) + 40 * L.s}} label="Fell" dir="down" color={C.green} p={pop2} s={L.s} />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      {/* The closing words would sit over the phone; the end card says the rest */}
      <Captions tl={tl} hide={['close']} />
    </Stage>
  );
};

const Badge: React.FC<{at: {x: number; y: number}; label: string; dir: 'up' | 'down'; color: string; p: number; s: number}> = ({
  at,
  label,
  dir,
  color,
  p,
  s,
}) => (
  <span
    style={{
      position: 'absolute',
      left: at.x - 120 * s,
      top: at.y,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      color,
      fontWeight: 700,
      fontSize: 54 * s,
      opacity: Math.min(1, p * 1.5),
      transform: `scale(${0.7 + 0.3 * p})`,
    }}
  >
    <svg width={50 * s} height={50 * s} viewBox="0 0 14 14" aria-hidden>
      <path d={dir === 'up' ? 'M2 11 L11 3 M5 3 L11 3 L11 9' : 'M2 3 L11 11 M11 5 L11 11 L5 11'} stroke={color} strokeWidth={2}
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    {label}
  </span>
);

export type {TimedBeat};
