// POV: you were asked one question. A chat in the app's colours, already on screen at frame 0 with your voice
// playing: Maya's question sits at the top and your answer bubble grows word by word, pushing her off the top
// (the chat is pinned to the bottom, like a real one), while the talking meter climbs. She makes her excuse and
// leaves. Then the second take: one answer, one detail, one question back, the goal chip fills, and she stays.
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {oneQuestion as K} from '../content/oneQuestion';
import {AudioTrack, EndCard, Label, Stage, useLayout} from '../kit/parts';
import {C, clamp, ease, fadeIn, fadeOutAt, fr, serif} from '../kit/theme';
import {beat, buildTimeline, type TimedBeat, wordTimes} from '../kit/timeline';

export const oneQuestionTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced, 0);

// Seconds Maya talked before the video starts (her question), for the first take's meter
const ASKED_FOR = 2;
// Seconds you had already talked when the video starts (the words already in your bubble)
const ALREADY_FOR = K.alreadySaid.split(/\s+/).length / 3.3;

// One chat bubble: hers on the left in white, yours on the right in green. `words` reveals as it is said.
const Bubble: React.FC<{who: 'them' | 'you'; children: React.ReactNode; s: number; style?: React.CSSProperties}> = ({who, children, s, style}) => (
  <div style={{display: 'flex', justifyContent: who === 'you' ? 'flex-end' : 'flex-start', ...style}}>
    <div
      style={{
        maxWidth: '82%',
        padding: `${24 * s}px ${32 * s}px`,
        borderRadius: 40 * s,
        borderBottomLeftRadius: who === 'them' ? 10 * s : 40 * s,
        borderBottomRightRadius: who === 'you' ? 10 * s : 40 * s,
        background: who === 'you' ? C.green : C.card,
        color: who === 'you' ? '#FFFFFF' : C.ink,
        fontSize: 54 * s,
        lineHeight: 1.28,
        boxShadow: '0 4px 10px rgba(30,38,32,0.07)',
      }}
    >
      {children}
    </div>
  </div>
);

// A line's words so far, with a question at the end marked in peach when asked for
const Said: React.FC<{b: TimedBeat; t: number; markQuestion?: boolean}> = ({b, t, markQuestion}) => {
  const words = wordTimes(b).filter((x) => t >= x.at);
  // The last sentence, when it is a question
  const q = markQuestion ? b.text.lastIndexOf('. ') + 2 : Infinity;
  let pos = 0;
  return (
    <>
      {words.map((x, i) => {
        const at = pos;
        pos += x.w.length + 1;
        return (
          <span key={i} style={at >= q ? {background: C.peach, color: C.peachInk, borderRadius: 10, padding: '0 6px', fontWeight: 700} : {}}>
            {x.w}{' '}
          </span>
        );
      })}
    </>
  );
};

// The share of the talking, as a bar and a number
const Meter: React.FC<{share: number; s: number}> = ({share, s}) => {
  const color = share > 70 ? '#C0463A' : C.green;
  return (
    <div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 16 * s}}>
        <span style={{fontFamily: serif, fontWeight: 600, fontSize: 84 * s, color, fontVariantNumeric: 'tabular-nums'}}>{share}%</span>
        <span style={{fontSize: 38 * s, color: C.muted}}>of the talking was you</span>
      </div>
      <div style={{marginTop: 10 * s, height: 18 * s, borderRadius: 999, background: C.lane}}>
        <div style={{width: `${share}%`, height: '100%', borderRadius: 999, background: color}} />
      </div>
    </div>
  );
};

export const OneQuestion: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = oneQuestionTimeline(voiced);
  const t = f / fps;
  const [y1, leave, n1, ask, y2, stay, close] = ['y1', 'maya-38', 'n1', 'maya-12', 'y2', 'maya-15', 'close'].map((id) => beat(tl, id));
  const endAt = close.start + K.endCardDelay;
  const story = L.format === 'story';
  const s = L.s;

  // Seconds of a line said by now
  const spoken = (b: TimedBeat) => Math.max(0, Math.min(t, b.end) - b.start);
  const take1Share = Math.round((100 * (ALREADY_FOR + spoken(y1))) / (ALREADY_FOR + spoken(y1) + ASKED_FOR + spoken(leave)));
  const yours2 = spoken(y2);
  const theirs2 = spoken(ask) + spoken(stay);
  const take2Share = yours2 + theirs2 > 0 ? Math.round((100 * yours2) / (yours2 + theirs2)) : 0;

  // Phases
  const take2 = t >= ask.start - 0.3;
  const take1Out = fadeOutAt(f, n1.start, 10);
  const narr = fadeIn(f, n1.start - 0.1, 8) * fadeOutAt(f, ask.start - 0.3, 8);
  const take2In = fadeIn(f, ask.start - 0.3, 8);
  // She leaves: her bubbles slide off to the left after her excuse
  const gone = interpolate(f, [fr(leave.end), fr(leave.end + 0.45)], [0, 1], {...clamp, easing: ease});
  const out = fadeOutAt(f, endAt, 10);

  const chatTop = story ? 560 : L.top + 230 * s;
  const chatBottom = story ? 1300 : L.bottom - 170 * s;
  const meterTop = chatBottom + 40 * s;
  const asked2 = t >= y2.end - 0.3;

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: out}}>
          {/* The big words, there on frame 0 */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad, top: story ? 140 : L.top - 20, opacity: take1Out}}>
            <Label>{K.label}</Label>
            <h1 style={{margin: `${8 * s}px 0 0`, fontFamily: serif, fontWeight: 600, fontSize: (story ? 104 : 88) * s, lineHeight: 1.02, letterSpacing: '-0.02em'}}>
              {K.hook[0]} <span style={{color: C.green}}>{K.hook[1]}</span>
            </h1>
          </div>
          {take2 ? (
            <div style={{position: 'absolute', left: L.pad, right: L.pad, top: story ? 140 : L.top - 20, opacity: take2In}}>
              <Label>Take two</Label>
              <h1 style={{margin: `${8 * s}px 0 0`, fontFamily: serif, fontWeight: 600, fontSize: (story ? 104 : 88) * s, lineHeight: 1.02, letterSpacing: '-0.02em', color: C.green}}>
                Answer, then hand it back.
              </h1>
            </div>
          ) : null}

          {/* Take one: the chat, pinned to the bottom so your bubble pushes everything up and off */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad + (story ? 60 : 0), top: chatTop, height: chatBottom - chatTop, overflow: 'hidden', opacity: take1Out, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 22 * s}}>
            <div style={{transform: `translateX(${-gone * 120}%)`, opacity: 1 - gone}}>
              <div style={{fontSize: 30 * s, fontWeight: 700, color: C.muted, margin: `0 0 ${8 * s}px ${8 * s}px`}}>{K.name}</div>
              <Bubble who="them" s={s}>{K.asked}</Bubble>
            </div>
            <Bubble who="you" s={s}>
              {K.alreadySaid} <Said b={y1} t={t} />
              {t <= y1.end ? <span style={{opacity: 0.6}}>…</span> : null}
            </Bubble>
            {t >= leave.start ? (
              <div style={{transform: `translateX(${-gone * 120}%)`, opacity: fadeIn(f, leave.start, 6) * (1 - gone)}}>
                <Bubble who="them" s={s}>
                  <Said b={leave} t={t} />
                </Bubble>
              </div>
            ) : null}
            {gone > 0 ? (
              <div style={{alignSelf: 'center', fontSize: 38 * s, fontStyle: 'italic', color: C.muted, opacity: gone, padding: `${10 * s}px 0`}}>{K.name} left the conversation.</div>
            ) : null}
          </div>

          {/* The narrator's rule, three beats */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad, top: chatTop + 120 * s, opacity: narr, display: 'flex', flexDirection: 'column', gap: 26 * s}}>
            {n1.text.split(/(?<=\.)\s+/).map((part, i, all) => {
              const p = fadeIn(f, n1.start + ((n1.end - n1.start) * i) / all.length - 0.05, 8);
              return (
                <p key={part} style={{margin: 0, padding: `${28 * s}px ${40 * s}px`, borderRadius: 36 * s, background: i === 2 ? C.peach : C.greenTint, color: i === 2 ? C.peachInk : C.green, fontWeight: 700, fontSize: 64 * s, opacity: p, transform: `translateY(${(1 - p) * 24}px)`}}>
                  {part}
                </p>
              );
            })}
          </div>

          {/* Take two */}
          {take2 ? (
            <div style={{position: 'absolute', left: L.pad, right: L.pad + (story ? 60 : 0), top: chatTop, height: chatBottom - chatTop, opacity: take2In, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 22 * s}}>
              <div>
                <div style={{fontSize: 30 * s, fontWeight: 700, color: C.muted, margin: `0 0 ${8 * s}px ${8 * s}px`}}>{K.name}</div>
                <Bubble who="them" s={s}>
                  <Said b={ask} t={t} />
                </Bubble>
              </div>
              {t >= y2.start ? (
                <Bubble who="you" s={s}>
                  <Said b={y2} t={t} markQuestion />
                </Bubble>
              ) : null}
              {/* The goal chip, as in the app */}
              {t >= y2.start ? (
                <div style={{alignSelf: 'flex-end', padding: `${10 * s}px ${24 * s}px`, borderRadius: 999, fontWeight: 700, fontSize: 34 * s, background: asked2 ? C.greenTint : C.card, color: asked2 ? C.green : C.muted}}>
                  Questions back: {asked2 ? 1 : 0} of 1{asked2 ? ' ✓' : ''}
                </div>
              ) : null}
              {t >= stay.start ? (
                <div style={{opacity: fadeIn(f, stay.start, 6)}}>
                  <Bubble who="them" s={s}>
                    <Said b={stay} t={t} />
                  </Bubble>
                  <div style={{marginTop: 18 * s, marginLeft: 8 * s, fontSize: 40 * s, fontWeight: 700, color: C.green, opacity: fadeIn(f, stay.end, 8)}}>She stayed.</div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* The talking meter: live through the ramble; on take two, the whole exchange once it is over */}
          <div style={{position: 'absolute', left: L.pad, right: L.pad + (story ? 100 : 0), top: meterTop, opacity: take2 ? fadeIn(f, stay.start, 8) : 1 - narr}}>
            <Meter share={take2 ? take2Share : take1Share} s={s} />
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
    </Stage>
  );
};
