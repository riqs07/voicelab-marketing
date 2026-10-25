// You lost them at "so": a stand-up on a video call. Frame 0 is already the full call with your voice playing.
// Each filler drains everyone's attention bar and, one by one, people look at their phone or turn their camera off.
// Then the point first: the bars refill, cameras come back, two people react. The filler count in the narration
// is checked against the line, so the two can't drift apart.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {standUp as K} from '../content/standUp';
import {AudioTrack, cardStyle, EndCard, Label, Stage, useLayout} from '../kit/parts';
import {C, clamp, ease, fadeIn, fadeOutAt, fr, serif} from '../kit/theme';
import {beat, buildTimeline, wordTimes} from '../kit/timeline';

export const standUpTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced, 0);

const bare = (w: string) => w.toLowerCase().replace(/[^a-z]/g, '');
const isFiller = (w: string) => (K.fillers as readonly string[]).includes(bare(w));

// The narration says how many fillers there are; fail the render if the line and the number disagree.
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const fillerCount = K.beats[0].text.split(/\s+/).filter(isFiller).length;
if (!K.beats[1].text.toLowerCase().startsWith(WORDS[fillerCount])) throw new Error(`The narration should say ${WORDS[fillerCount]} fillers`);

// One person on the call: a soft head and shoulders, their initials, and an attention bar.
const Tile: React.FC<{
  w: number;
  h: number;
  tint: string;
  initials: string;
  you?: boolean;
  speaking?: number;
  attention: number;
  phone: number;
  off: number;
  react: number;
  s: number;
}> = ({w, h, tint, initials, you, speaking = 0, attention, phone, off, react, s}) => {
  const barColor = attention > 0.6 ? C.green : attention > 0.3 ? C.warm : '#C0463A';
  // Looking down at a phone: the head drops and tilts
  const headY = h * 0.42 + phone * h * 0.07;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: 28 * s, overflow: 'hidden', background: tint, boxShadow: you ? `0 0 0 ${8 * s}px ${speaking > 0 ? C.green : C.lane}` : 'none'}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        <ellipse cx={w / 2} cy={h * 1.02} rx={w * 0.34} ry={h * 0.3} fill={you ? C.green : C.grey} opacity={0.55} />
        <g transform={`rotate(${phone * 14} ${w / 2} ${headY})`}>
          <circle cx={w / 2} cy={headY} r={h * 0.17} fill={you ? C.green : C.grey} opacity={0.8} />
        </g>
        {/* The phone they are now looking at */}
        <g opacity={phone} transform={`translate(${w / 2 + w * 0.12} ${h * 0.92 - phone * h * 0.2}) rotate(-12)`}>
          <rect x={-w * 0.07} y={-h * 0.13} width={w * 0.14} height={h * 0.26} rx={10 * s} fill={C.ink} />
          <rect x={-w * 0.055} y={-h * 0.11} width={w * 0.11} height={h * 0.2} rx={6 * s} fill="#9DC3F2" />
        </g>
      </svg>
      {/* Camera off: dark, initials only, a crossed-out camera */}
      <div style={{position: 'absolute', inset: 0, background: '#2A322C', opacity: off, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span style={{fontFamily: serif, fontWeight: 600, fontSize: 64 * s, color: '#DDE3DE'}}>{initials}</span>
        <svg width={44 * s} height={44 * s} viewBox="0 0 24 24" style={{position: 'absolute', right: 18 * s, top: 18 * s}}>
          <rect x={2} y={7} width={14} height={10} rx={2} fill="none" stroke="#DDE3DE" strokeWidth={2} />
          <path d="M16 10l6-3v10l-6-3" fill="none" stroke="#DDE3DE" strokeWidth={2} />
          <line x1={3} y1={3} x2={21} y2={21} stroke="#DDE3DE" strokeWidth={2.4} />
        </svg>
      </div>
      {/* Name or "You" */}
      <span style={{position: 'absolute', left: 18 * s, bottom: 40 * s, padding: `${4 * s}px ${14 * s}px`, borderRadius: 999, background: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 28 * s, color: C.ink}}>
        {you ? 'You' : initials}
      </span>
      {/* Attention bar */}
      {!you ? (
        <div style={{position: 'absolute', left: 18 * s, right: 18 * s, bottom: 16 * s, height: 12 * s, borderRadius: 999, background: 'rgba(30,38,32,0.15)'}}>
          <div style={{width: `${Math.max(0, attention) * 100}%`, height: '100%', borderRadius: 999, background: barColor}} />
        </div>
      ) : null}
      {/* A reaction on the good take */}
      {react > 0 ? (
        <span style={{position: 'absolute', right: 18 * s, top: 18 * s, padding: `${6 * s}px ${16 * s}px`, borderRadius: 999, background: C.card, color: C.green, fontWeight: 800, fontSize: 34 * s, transform: `scale(${react})`}}>+1</span>
      ) : null}
      {/* Talking: three bars bouncing beside your name */}
      {you && speaking > 0 ? (
        <div style={{position: 'absolute', right: 22 * s, bottom: 44 * s, display: 'flex', gap: 6 * s, alignItems: 'flex-end', height: 40 * s}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 10 * s, borderRadius: 4, background: C.green, height: `${30 + 70 * Math.abs(Math.sin(speaking * 9 + i * 1.7))}%`}} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export const StandUp: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = standUpTimeline(voiced);
  const t = f / fps;
  const [y1, n1, y2, close] = ['y1', 'n1', 'y2', 'close'].map((id) => beat(tl, id));
  const endAt = close.start + K.endCardDelay;
  const story = L.format === 'story';

  // Fillers said so far in the first take, and when each one landed
  const words1 = wordTimes(y1);
  const fillerAt = words1.filter((x) => isFiller(x.w)).map((x) => x.at);
  const said = fillerAt.filter((at) => t >= at).length;
  // The second take brings everyone back
  const back = interpolate(f, [fr(y2.start + 0.4), fr(y2.end)], [0, 1], {...clamp, easing: ease});
  const take2 = t >= y2.start - 0.3;

  // The grid: two columns by three rows on a phone, three by two on 4:5
  const cols = story ? 2 : 3;
  const gap = 22 * L.s;
  const gridTop = story ? 430 : L.top + 230 * L.s;
  const tileW = (L.width - 2 * L.pad - gap * (cols - 1)) / cols;
  const tileH = story ? tileW * 0.6 : tileW * 0.72;
  const people = [...K.team.map((p) => ({...p, you: false})), {initials: 'You', tint: C.greenTint, drift: {at: 99, how: 'phone' as const}, you: true}];

  // The hook stays up through the first take, then the label changes to the second
  const hookOut = fadeOutAt(f, n1.start, 10);
  const out = fadeOutAt(f, endAt, 10);
  const narr = fadeIn(f, n1.start - 0.1, 8) * fadeOutAt(f, y2.start - 0.2, 8);

  // The live words of whichever take is talking, fillers marked
  const live = t < y2.start - 0.3 ? words1 : wordTimes(y2);
  const shown = live.filter((x) => t >= x.at).slice(-9);

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: out}}>
          {/* The big words: fully there on frame 0 */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad, top: story ? 150 : L.top - 10, opacity: hookOut}}>
            <Label>{K.label}</Label>
            <h1 style={{margin: `${10 * L.s}px 0 0`, fontFamily: serif, fontWeight: 600, fontSize: (story ? 118 : 96) * L.s, lineHeight: 1.02, letterSpacing: '-0.02em'}}>
              {K.hook[0]} <span style={{color: '#C0463A'}}>{K.hook[1]}</span>
            </h1>
          </div>
          {take2 ? (
            <div style={{position: 'absolute', left: L.pad, right: L.pad, top: story ? 150 : L.top - 10, opacity: fadeIn(f, y2.start - 0.3, 8)}}>
              <Label>Take two</Label>
              <h1 style={{margin: `${10 * L.s}px 0 0`, fontFamily: serif, fontWeight: 600, fontSize: (story ? 118 : 96) * L.s, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.green}}>
                The point first.
              </h1>
            </div>
          ) : null}
          {/* The call */}
          <div style={{position: 'absolute', left: L.pad, top: gridTop, display: 'grid', gridTemplateColumns: `repeat(${cols}, ${tileW}px)`, gap}}>
            {people.map((p, i) => {
              const lost = interpolate(f, [fr(fillerAt[p.drift.at - 1] ?? 999), fr(fillerAt[p.drift.at - 1] ?? 999) + 8], [0, 1], {...clamp, easing: ease});
              // Everyone's attention drops a notch per filler, and a lot once they've drifted, then the point brings it back
              const drained = Math.max(0.06, 1 - said * 0.09 - lost * 0.35);
              const attention = drained + (1 - drained) * back;
              const gone = lost * (1 - back);
              return (
                <Tile
                  key={p.initials}
                  w={tileW}
                  h={tileH}
                  tint={p.tint}
                  initials={p.initials}
                  you={p.you}
                  speaking={p.you && ((t >= y1.start && t <= y1.end) || (t >= y2.start && t <= y2.end)) ? t : 0}
                  attention={attention}
                  phone={p.drift.how === 'phone' ? gone : 0}
                  off={p.drift.how === 'off' ? gone : 0}
                  react={i === 0 || i === 3 ? interpolate(f, [fr(y2.end - 0.2), fr(y2.end) + 4, fr(y2.end) + 8], [0, 1.15, 1], clamp) : 0}
                  s={L.s}
                />
              );
            })}
          </div>
          {/* Filler counter */}
          <div style={{position: 'absolute', left: L.pad, top: gridTop + 3 * (tileH + gap) + 18 * L.s - (story ? 0 : tileH + gap), display: 'flex', alignItems: 'baseline', gap: 18 * L.s}}>
            <span style={{fontFamily: serif, fontWeight: 600, fontSize: 92 * L.s, color: take2 ? C.green : '#C0463A', fontVariantNumeric: 'tabular-nums'}}>{take2 ? 0 : said}</span>
            <span style={{fontSize: 38 * L.s, color: C.muted}}>{(take2 ? 0 : said) === 1 ? 'filler' : 'fillers'} before the point</span>
          </div>
          {/* What you're saying, fillers struck in orange */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad + (story ? 100 : 0), top: gridTop + 3 * (tileH + gap) + 140 * L.s - (story ? 0 : tileH + gap), ...cardStyle(L.s), padding: `${26 * L.s}px ${34 * L.s}px`, fontSize: 44 * L.s, lineHeight: 1.3, opacity: shown.length ? 1 - narr : 0}}>
            {shown.map((x, i) => (
              <span key={i} style={isFiller(x.w) && !take2 ? {color: '#C0463A', fontWeight: 700, textDecoration: 'line-through'} : {}}>
                {x.w}{' '}
              </span>
            ))}
          </div>
          {/* The narrator's point, in place of the words */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad + (story ? 100 : 0), top: gridTop + 3 * (tileH + gap) + 140 * L.s - (story ? 0 : tileH + gap), opacity: narr}}>
            <p style={{margin: 0, padding: `${28 * L.s}px ${40 * L.s}px`, borderRadius: 36 * L.s, background: C.peach, color: C.peachInk, fontWeight: 700, fontSize: 52 * L.s, lineHeight: 1.2}}>{n1.text}</p>
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
    </Stage>
  );
};
