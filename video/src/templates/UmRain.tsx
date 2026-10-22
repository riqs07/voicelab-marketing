// Um rain: the rushed take scrolls past as a ticker; every pause word drops out of it into a jar at the moment
// it is said (the second half races by at 4x). The count lands, then the calm take plays beside an empty jar,
// with green pills where the real pauses were.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {umRain as K} from '../content/umRain';
import {AudioTrack, Captions, EndCard, Hook, Label, Stage, useLayout} from '../kit/parts';
import {C, clamp, ease, fadeIn, fadeOutAt, fr, rise, serif} from '../kit/theme';
import {beat, buildTimeline, mediaTime, type TimedBeat} from '../kit/timeline';

export const umRainTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

type Word = {text: string; start: number; end: number};
const FALL = 0.55;
const PER_ROW = 3;

// A row of words laid out by their letters; returns each word's left edge in "letter units".
const layout = (words: readonly Word[]) => {
  let at = 0;
  return words.map((w) => {
    const left = at;
    at += w.text.length + 1;
    return left;
  });
};

// How far the ticker has scrolled (letter units) at recording time m: glides from one word's start to the next.
const scrollAt = (words: readonly Word[], lefts: number[], m: number) => {
  const i = words.findLastIndex((w) => w.start <= m);
  if (i < 0) return 0;
  const next = words[i + 1];
  const k = next ? Math.min(1, (m - words[i].start) / Math.max(0.05, next.start - words[i].start)) : 0;
  return lefts[i] + (next ? (lefts[i + 1] - lefts[i]) * k : 0);
};

const Ticker: React.FC<{
  words: readonly Word[];
  m: number;
  y: number;
  width: number;
  s: number;
  pauses?: readonly {start: number; end: number}[];
}> = ({words, m, y, width, s, pauses = []}) => {
  const fontSize = 62 * s;
  const unit = fontSize * 0.52;
  const lefts = layout(words);
  const scroll = scrollAt(words, lefts, m);
  const cx = width * 0.62;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, height: fontSize * 1.6, overflow: 'hidden'}}>
      {words.map((w, i) => {
        if (w.start > m + 0.02) return null;
        const x = cx + (lefts[i] - scroll) * unit;
        const isPause = K.pauseWord.test(w.text);
        const fade = interpolate(x, [-200, cx * 0.55, cx], [0, 0.35, 1], clamp);
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: fontSize * 0.2,
              fontSize,
              whiteSpace: 'nowrap',
              color: isPause ? C.peachInk : C.ink,
              background: isPause ? C.peach : 'transparent',
              borderRadius: 14 * s,
              padding: isPause ? `0 ${8 * s}px` : 0,
              opacity: fade,
            }}
          >
            {w.text}
          </span>
        );
      })}
      {/* The calm take's pauses, as green pills in the gap where they happened */}
      {pauses.map((p, i) => {
        if (p.start > m) return null;
        const before = words.findLastIndex((w) => w.end <= p.start + 0.05);
        const x = cx + ((before >= 0 ? lefts[before] + words[before].text.length + 0.3 : 0) - scroll) * unit;
        const pIn = interpolate(m, [p.start, p.start + 0.25], [0, 1], clamp);
        return (
          <span
            key={`p${i}`}
            style={{
              position: 'absolute',
              left: x,
              top: -fontSize * 0.05,
              fontSize: 30 * s,
              fontWeight: 700,
              color: C.green,
              background: C.greenTint,
              borderRadius: 999,
              padding: `${4 * s}px ${14 * s}px`,
              opacity: pIn * interpolate(x, [-200, cx * 0.55], [0, 1], clamp),
              transform: `scale(${0.6 + 0.4 * pIn})`,
            }}
          >
            {(p.end - p.start).toFixed(1)} s
          </span>
        );
      })}
    </div>
  );
};

const Pill: React.FC<{text: string; s: number; style?: React.CSSProperties}> = ({text, s, style}) => (
  <div
    style={{
      position: 'absolute',
      padding: `${6 * s}px ${16 * s}px`,
      borderRadius: 999,
      background: C.warm,
      color: C.peachInk,
      fontWeight: 700,
      fontSize: 40 * s,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text.replace(/\W+$/, '')}
  </div>
);

const Jar: React.FC<{w: number; h: number; s: number}> = ({w, h, s}) => (
  <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={`M0 0 L0 ${h - 40 * s} Q0 ${h} ${40 * s} ${h} L${w - 40 * s} ${h} Q${w} ${h} ${w} ${h - 40 * s} L${w} 0`} fill="rgba(255,255,255,0.65)"
      stroke={C.muted} strokeWidth={5} />
    <line x1={-14 * s} y1={0} x2={w + 14 * s} y2={0} stroke={C.muted} strokeWidth={6} strokeLinecap="round" />
  </svg>
);

export const UmRain: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = umRainTimeline(voiced);
  const t = f / fps;
  const hook = beat(tl, 'hook');
  const rushed = beat(tl, 'rushed');
  const count = beat(tl, 'count');
  const calm = beat(tl, 'calm');
  const close = beat(tl, 'close');
  const endAt = close.start + K.endCardDelay;
  const story = L.format === 'story';

  const rushedWords = K.words.rushed as Word[];
  const calmWords = K.words.calm as Word[];
  const m = Math.max(0, mediaTime(rushed as TimedBeat, Math.min(t, rushed.end)));
  const mCalm = t >= calm.start ? Math.min(calm.full, t - calm.start) : -1;
  const ff = rushed.fastForward && t > rushed.start + rushed.fastForward.audioFor && t < rushed.end;

  const ums = rushedWords.filter((w) => K.pauseWord.test(w.text));
  // Video time each pause word is said (inverse of the fast-forward)
  const videoAt = (media: number) => {
    const a = rushed.fastForward?.audioFor ?? Infinity;
    return rushed.start + (media <= a ? media : a + (media - a) / (rushed.fastForward?.speed ?? 1));
  };

  const tickerY = story ? 430 : L.top + 170 * L.s;
  const jarW = (story ? 470 : 400) * L.s;
  const jarH = (story ? 430 : 330) * L.s;
  const jarTop = story ? 820 : L.top + 430 * L.s;
  // After the count, the full jar steps aside and an empty one joins it.
  const split = interpolate(f, [fr(calm.start - 0.6), fr(calm.start)], [0, 1], {...clamp, easing: ease});
  const jarScale = 1 - 0.25 * split;
  const jarCx = L.width / 2 - split * L.width * 0.22;
  const jarLeft = jarCx - (jarW * jarScale) / 2;
  const slot = (i: number) => ({
    x: 26 * L.s + (i % PER_ROW) * ((jarW - 52 * L.s) / PER_ROW),
    y: jarH - 84 * L.s - Math.floor(i / PER_ROW) * 68 * L.s,
  });
  const landed = ums.filter((u) => t >= videoAt(u.start) + FALL).length;

  const stageIn = fadeIn(f, rushed.start - 0.3, 10);
  const out = fadeOutAt(f, endAt, 10);
  const countP = fadeIn(f, count.start, 12) * (1 - fadeIn(f, calm.start - 0.5, 10));
  const calmJar = fadeIn(f, calm.start - 0.3, 12);

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(rushed.start - 0.3) + 2 ? <Hook b={hook} until={rushed.start - 0.3} /> : null}
      {f >= fr(rushed.start - 0.3) && f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: stageIn * out}}>
          {/* The running count */}
          <div style={{position: 'absolute', left: L.pad, top: story ? 220 : L.top, display: 'flex', alignItems: 'baseline', gap: 18 * L.s, opacity: 1 - calmJar}}>
            <span style={{fontFamily: serif, fontWeight: 600, fontSize: 120 * L.s, color: C.orange, fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>
              {landed}
            </span>
            <span style={{fontSize: 36 * L.s, color: C.muted}}>{landed === 1 ? 'pause word' : 'pause words'}</span>
          </div>
          {ff ? (
            <div style={{position: 'absolute', right: L.pad + 40, top: story ? 240 : L.top + 10, padding: `${8 * L.s}px ${22 * L.s}px`, borderRadius: 999, background: C.ink, color: '#FFFFFF', fontWeight: 700, fontSize: 32 * L.s}}>
              4× ▸▸
            </div>
          ) : null}
          {t < calm.start - 0.3 ? (
            <div style={{opacity: 1 - fadeIn(f, count.start - 0.2, 8)}}>
              <Ticker words={rushedWords} m={m} y={tickerY} width={L.width} s={L.s} />
            </div>
          ) : (
            <div style={{opacity: fadeIn(f, calm.start - 0.2, 8)}}>
              <Ticker words={calmWords} m={Math.max(0, mCalm)} y={tickerY} width={L.width} s={L.s} pauses={K.pauses} />
            </div>
          )}
          {/* The count, as one plain fact */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad, top: tickerY - 20 * L.s, opacity: countP, transform: rise(countP, 16)}}>
            <h2 style={{margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 82 * L.s, lineHeight: 1.08}}>
              {ums.length} pause words
              <br />
              in {Math.floor(rushedWords[rushedWords.length - 1].end - rushedWords[0].start)} seconds.
            </h2>
          </div>
          {/* The rushed take's jar */}
          <div style={{position: 'absolute', left: jarLeft, top: jarTop, width: jarW, height: jarH, transform: `scale(${jarScale})`, transformOrigin: 'left top'}}>
            <Jar w={jarW} h={jarH} s={L.s} />
            {ums.map((u, i) =>
              t >= videoAt(u.start) + FALL ? (
                <Pill key={i} text={u.text} s={L.s} style={{left: slot(i).x, top: slot(i).y, transform: `rotate(${((i * 37) % 17) - 8}deg)`}} />
              ) : null,
            )}
            <div style={{position: 'absolute', left: 0, right: 0, top: jarH + 24 * L.s, textAlign: 'center', opacity: split}}>
              <Label style={{fontSize: 40 * L.s}}>Rushed · {ums.length}</Label>
            </div>
          </div>
          {/* Pause words in flight: from the ticker into their place in the jar */}
          {ums.map((u, i) => {
            const at = videoAt(u.start);
            if (t < at || t >= at + FALL) return null;
            const k = (t - at) / FALL;
            const from = {x: L.width * 0.62, y: tickerY + 20 * L.s};
            const to = {x: jarLeft + slot(i).x, y: jarTop + slot(i).y};
            return (
              <Pill
                key={`f${i}`}
                text={u.text}
                s={L.s}
                style={{
                  left: from.x + (to.x - from.x) * k,
                  top: from.y + (to.y - from.y) * k * k,
                  transform: `rotate(${k * (((i * 37) % 17) - 8) * 3}deg) scale(${1.3 - 0.3 * k})`,
                }}
              />
            );
          })}
          {/* The calm take's jar: stays empty */}
          <div style={{position: 'absolute', left: L.width / 2 + L.width * 0.22 - (jarW * 0.75) / 2, top: jarTop, width: jarW, height: jarH, transform: 'scale(0.75)', transformOrigin: 'left top', opacity: calmJar}}>
            <Jar w={jarW} h={jarH} s={L.s} />
            <div style={{position: 'absolute', left: 0, right: 0, top: jarH * 0.3, textAlign: 'center', fontFamily: serif, fontWeight: 600, fontSize: 130 * L.s, color: C.green}}>0</div>
            <div style={{position: 'absolute', left: 0, right: 0, top: jarH + 24 * L.s, textAlign: 'center'}}>
              <Label style={{fontSize: 40 * L.s, color: C.green}}>Calm · 0</Label>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      <Captions tl={tl} />
    </Stage>
  );
};
