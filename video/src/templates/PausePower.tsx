// Pause power: two takes as fingerprint strips (blocks of speech, orange marks on pause words,
// a green pill for a calm pause), stacked so they compare at a glance.
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {pausePower as K} from '../content/pausePower';
import {AudioTrack, Captions, cardStyle, EndCard, Hook, Stage, useLayout} from '../kit/parts';
import {C, fadeIn, fadeOutAt, fr, gentle, rise, serif} from '../kit/theme';
import {beat, buildTimeline, type TimedBeat} from '../kit/timeline';

export const pausePowerTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

type Token = {text: string; kind: 'word' | 'um' | 'pause'; at: number; dur: number};

// Split a take into words, pause words and pauses, spread over its time by length.
const tokens = (b: TimedBeat): Token[] => {
  const raw = b.text.split(/\s+/).filter(Boolean);
  const kinds = raw.map((w) => (w === '...' ? 'pause' : /^um\W*$/i.test(w) ? 'um' : 'word') as Token['kind']);
  const weight = raw.map((w, i) => (kinds[i] === 'pause' ? 5 : w.length + 1.5));
  const total = weight.reduce((a, x) => a + x, 0);
  let at = b.start;
  return raw.map((w, i) => {
    const dur = ((b.end - b.start) * weight[i]) / total;
    const tok = {text: w, kind: kinds[i], at, dur};
    at += dur;
    return tok;
  });
};

const TakeCard: React.FC<{b: TimedBeat; label: string; s: number; width: number}> = ({b, label, s, width}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const toks = tokens(b);
  const pad = 44 * s;
  const stripW = width - 2 * pad;
  const total = b.end - b.start;
  const stripH = 90 * s;
  const ums = toks.filter((x) => x.kind === 'um' && t >= x.at).length;
  const pauses = toks.filter((x) => x.kind === 'pause' && t >= x.at + x.dur).length;
  const x = (sec: number) => ((sec - b.start) / total) * stripW;
  return (
    <div style={{...cardStyle(s), padding: pad}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
        <span style={{fontFamily: serif, fontWeight: 600, fontSize: 64 * s}}>{label}</span>
        <span style={{fontSize: 38 * s, fontWeight: 700, color: ums > 0 ? C.orange : C.green}}>
          {ums > 0 ? `${ums} pause ${ums === 1 ? 'word' : 'words'}` : pauses > 0 ? `${pauses} calm pause` : ''}
        </span>
      </div>
      <svg width={stripW} height={stripH + 30 * s} style={{display: 'block', overflow: 'visible', marginTop: 26 * s}}>
        {toks.map((tok, i) => {
          if (t < tok.at) return null;
          const shown = Math.min(1, (t - tok.at) / tok.dur);
          const w = Math.max(4, (x(tok.at + tok.dur) - x(tok.at)) * shown - 4);
          if (tok.kind === 'pause') {
            const p = spring({frame: f - fr(tok.at + tok.dur * 0.5), fps, config: gentle});
            const cx = (x(tok.at) + x(tok.at + tok.dur)) / 2;
            return (
              <g key={i} opacity={p} transform={`translate(${cx} ${stripH / 2 + 14 * s}) scale(${0.6 + 0.4 * p})`}>
                <rect x={-62 * s} y={-28 * s} width={124 * s} height={56 * s} rx={28 * s} fill={C.greenTint} />
                <text textAnchor="middle" y={12 * s} fontSize={32 * s} fontWeight={700} fill={C.green}>
                  {K.pauseSeconds} s
                </text>
              </g>
            );
          }
          // Louder-looking words are a little taller; fixed per word so renders repeat.
          const h = stripH * (0.45 + ((tok.text.length * 37) % 40) / 100);
          return (
            <g key={i}>
              <rect x={x(tok.at)} y={14 * s + (stripH - h) / 2} width={w} height={h} rx={8 * s}
                fill={tok.kind === 'um' ? C.lane : C.green} />
              {tok.kind === 'um' ? (
                <polygon
                  points={`${x(tok.at) + w / 2},${4 * s} ${x(tok.at) + w / 2 + 14 * s},${-18 * s} ${x(tok.at) + w / 2 - 14 * s},${-18 * s}`}
                  fill={C.warm}
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      <p style={{margin: `${22 * s}px 0 0`, fontSize: 40 * s, lineHeight: 1.45}}>
        {toks.map((tok, i) =>
          tok.kind === 'pause' ? (
            <span key={i} style={{color: C.green, fontWeight: 700, opacity: t >= tok.at ? 1 : 0.25}}> · </span>
          ) : (
            <span
              key={i}
              style={{
                opacity: t >= tok.at ? 1 : 0.25,
                color: tok.kind === 'um' ? C.grey : C.ink,
                fontStyle: tok.kind === 'um' ? 'italic' : 'normal',
                textDecoration: tok.kind === 'um' ? `underline dotted ${C.usual} 3px` : 'none',
              }}
            >
              {tok.text}{' '}
            </span>
          ),
        )}
      </p>
    </div>
  );
};

export const PausePower: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const L = useLayout();
  const tl = pausePowerTimeline(voiced);
  const hook = beat(tl, 'hook');
  const close = beat(tl, 'close');
  const endAt = close.start + K.endCardDelay;
  const takes = K.takes.map((x) => ({...x, b: beat(tl, x.beat)}));
  const first = takes[0].b;
  const story = L.format === 'story';
  const width = L.width - 2 * L.pad;
  const stageIn = fadeIn(f, first.start - 0.3, 10);
  const out = fadeOutAt(f, endAt, 10);

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(first.start - 0.3) + 2 ? <Hook b={hook} until={first.start - 0.3} /> : null}
      {f >= fr(first.start - 0.3) && f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: stageIn * out}}>
          <div
            style={{
              position: 'absolute',
              top: story ? 260 : L.top,
              left: L.pad,
              right: L.pad,
              display: 'flex',
              flexDirection: 'column',
              gap: 36 * L.s,
            }}
          >
            {takes.map((tk) => {
              const p = fadeIn(f, tk.b.start - 0.35, 12);
              return (
                <div key={tk.beat} style={{opacity: p, transform: rise(p, 24)}}>
                  <TakeCard b={tk.b} label={tk.label} s={L.s} width={width} />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      <Captions tl={tl} />
    </Stage>
  );
};
