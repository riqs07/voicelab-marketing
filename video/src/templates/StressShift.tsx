// Stress shift: the same sentence five times; the line peaks over the stressed word and the meaning shows below.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';
import {stressShift as K} from '../content/stressShift';
import {pitchPath, wordSlots, yOf} from '../kit/curve';
import {AudioTrack, Captions, EndCard, Hook, Label, noteStyle, Stage, useLayout} from '../kit/parts';
import {C, clamp, fadeIn, fadeOutAt, fr, gentle, progress, rise, serif} from '../kit/theme';
import {beat, buildTimeline} from '../kit/timeline';

export const stressShiftTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

// Word heights for a take: low and level, a peak on the stressed word, a dip after it.
const heightsFor = (stress: number) =>
  K.words.map((_, i) => (i === stress ? 0.95 : i === stress + 1 ? 0.22 : 0.4 - i * 0.025));

export const StressShift: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = stressShiftTimeline(voiced);
  const hook = beat(tl, 'hook');
  const close = beat(tl, 'close');
  const takes = K.takes.map((t) => ({...t, b: beat(tl, t.beat)}));
  const first = takes[0].b;
  const endAt = close.start + K.endCardDelay;
  const t = f / fps;

  // The take on screen: the latest one that has started.
  const idx = Math.max(0, takes.findLastIndex((x) => t >= x.b.start - 0.15));
  const cur = takes[idx];

  const width = L.width - 2 * L.pad;
  const chartH = 300 * L.s;
  const slots = wordSlots(K.words, width);
  const fontSize = Math.min(...K.words.map((w, i) => (slots[i].w * 0.92) / (0.5 * Math.max(2, w.length))), 96 * L.s);
  const path = pitchPath(K.words, heightsFor(cur.stress), width, chartH);
  // The last take's line stays, grey, while the new one draws.
  const prev = takes[idx - 1];
  const ghost = prev ? pitchPath(K.words, heightsFor(prev.stress), width, chartH) : null;
  const len = getLength(path);
  const draw = progress(f, cur.b.start, cur.b.end);
  const head = draw > 0 && draw < 1 ? getPointAtLength(path, draw * len) : null;
  const pop = spring({frame: f - fr(cur.b.start + (cur.b.end - cur.b.start) * (cur.stress / K.words.length)), fps, config: gentle});

  const stageIn = fadeIn(f, first.start - 0.3, 10);
  const out = fadeOutAt(f, endAt, 10);
  const story = L.format === 'story';
  const top = story ? 300 : L.top + 40 * L.s;
  // Each meaning fades in as its take finishes, so the voice lands first.
  const meaningP = interpolate(f, [fr(cur.b.end - 0.25), fr(cur.b.end - 0.25) + 10], [0, 1], clamp);
  const closeP = fadeIn(f, close.start, 14);

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(first.start - 0.3) + 2 ? <Hook b={hook} until={first.start - 0.3} /> : null}
      {f >= fr(first.start - 0.3) && f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: stageIn * out}}>
          <div style={{position: 'absolute', top, left: L.pad, right: L.pad}}>
            <Label>
              Same sentence · {idx + 1} of {takes.length}
            </Label>
            <h2 style={{margin: `${10 * L.s}px 0 0`, fontFamily: serif, fontWeight: 600, fontSize: 92 * L.s, lineHeight: 1.05}}>
              Where does it peak?
            </h2>
          </div>
          <div style={{position: 'absolute', top: top + (story ? 300 : 230 * L.s), left: L.pad, right: L.pad}}>
            <svg width={width} height={chartH} style={{display: 'block', overflow: 'visible'}}>
              <line x1={0} y1={yOf(0.4, chartH)} x2={width} y2={yOf(0.4, chartH)} stroke={C.usual} strokeWidth={3} strokeDasharray="11 8" />
              {ghost ? (
                <path d={ghost} stroke={C.grey} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray="14 10"
                  opacity={0.7 * (1 - draw)} />
              ) : null}
              <path d={path} pathLength={1} stroke={C.green} strokeWidth={9} fill="none" strokeLinecap="round"
                strokeDasharray="1 1" strokeDashoffset={1 - draw} />
              {head ? <circle cx={head.x} cy={head.y} r={12} fill={C.ink} /> : null}
              <circle cx={slots[cur.stress].cx} cy={yOf(0.95, chartH)} r={18 * (0.6 + 0.4 * pop)} fill="none"
                stroke={C.orange} strokeWidth={5} opacity={pop} />
            </svg>
            <div style={{position: 'relative', height: fontSize * 1.4, marginTop: 24 * L.s}}>
              {K.words.map((w, i) => {
                const on = i === cur.stress;
                return (
                  <span
                    key={i}
                    style={{
                      position: 'absolute',
                      left: slots[i].x,
                      width: slots[i].w,
                      textAlign: 'center',
                      fontFamily: serif,
                      fontWeight: 600,
                      fontSize,
                      color: on ? interpolateColor(pop) : C.ink,
                      transform: `scale(${on ? 1 + 0.12 * pop : 1})`,
                      transformOrigin: 'center bottom',
                    }}
                  >
                    {w}
                  </span>
                );
              })}
            </div>
            <div style={{marginTop: 70 * L.s, opacity: meaningP * (1 - closeP), transform: rise(meaningP, 16)}}>
              <p style={{...noteStyle(L.s, 'green'), fontStyle: 'italic'}}>{cur.meaning}</p>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      <Captions tl={tl} />
    </Stage>
  );
};

// Ink → orange as the stressed word pops.
const interpolateColor = (p: number) => {
  const a = [0x1e, 0x26, 0x20];
  const b = [0xc2, 0x6a, 0x2c];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * Math.min(1, p)));
  return `rgb(${c.join(',')})`;
};
