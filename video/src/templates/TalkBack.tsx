// They talk back: the Rally court, now with the people reacting to how you talk. As in Rally, the ball stays on the
// talker's side for as long as they talk and a question sends it back with an orange ring. New here: a detail they
// offer appears as a chip on their side and flies to yours when you pick it up; when you're cut off, the ball is
// smashed back and the court shakes; and their reaction pops up as a tag. Each conversation ends on a note, and
// at the close the court folds away into the app's lane timeline.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {talkBack as K} from '../content/talkBack';
import {AudioTrack, Captions, cardStyle, EndCard, Hook, Label, noteStyle, Stage, useLayout} from '../kit/parts';
import {C, clamp, ease, fadeIn, fadeOutAt, fr, serif} from '../kit/theme';
import {beat, buildTimeline} from '../kit/timeline';

export const talkBackTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

const FLIGHT = 0.35;
const SMASH = 0.16;
const HOP = 0.5;

type Turn = {
  beat: string;
  who: 'them' | 'you';
  question?: boolean;
  detail?: string;
  pickUp?: boolean;
  cut?: boolean;
  reaction?: string;
  start: number;
  end: number;
};

// Where the ball is at time t: its side (0 = theirs, 1 = yours, between = in flight), how high it is, whether a
// question is carrying it back, and whether it's a smash (someone cutting in).
const ballAt = (turns: Turn[], t: number) => {
  const side = (w: Turn['who']) => (w === 'you' ? 1 : 0);
  const i = turns.findLastIndex((u) => u.start <= t);
  if (i < 0) return {pos: side(turns[0].who), height: 0, question: false, smash: false, sway: 0};
  const u = turns[i];
  if (t <= u.end) {
    const phase = ((t - u.start) / HOP) % 1;
    return {pos: side(u.who), height: Math.abs(Math.sin(Math.PI * phase)) * 0.35, question: false, smash: false, sway: Math.sin((t - u.start) * 2.3)};
  }
  const next = turns[i + 1];
  const to = next ? side(next.who) : u.question ? 1 - side(u.who) : side(u.who);
  const smash = !!u.cut;
  const k = Math.min(1, (t - u.end) / (smash ? SMASH : FLIGHT));
  return {pos: side(u.who) + (to - side(u.who)) * k, height: to === side(u.who) ? 0 : Math.sin(Math.PI * k) * (smash ? 0.25 : 1), question: !!u.question && k < 1, smash: smash && k < 1, sway: 0};
};

export const TalkBack: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = talkBackTimeline(voiced);
  const t = f / fps;
  const hook = beat(tl, 'hook');
  const close = beat(tl, 'close');
  const endAt = close.start + K.endCardDelay;

  const takes = K.takes.map((tk) => {
    const turns: Turn[] = tk.turns.map((u) => {
      const b = beat(tl, u.beat);
      return {...u, start: b.start, end: b.end};
    });
    return {...tk, turns, start: turns[0].start, end: turns[turns.length - 1].end};
  });
  const longest = Math.max(...takes.map((x) => x.end - x.start));
  const idx = Math.max(0, takes.findLastIndex((x) => t >= x.start - 0.4));
  const tk = takes[idx];
  const next = takes[idx + 1];
  const tkOut = next ? fadeOutAt(f, next.start - 0.45, 10) : 1;
  const tkIn = fadeIn(f, tk.start - 0.4, 10);

  // Talking so far in this conversation
  const said = (who: 'you' | 'them') =>
    tk.turns.filter((u) => u.who === who).reduce((a, u) => a + Math.max(0, Math.min(t, u.end) - u.start), 0);
  const yours = said('you');
  const theirs = said('them');
  const share = yours + theirs > 0 ? Math.round((100 * yours) / (yours + theirs)) : 0;
  const asked = tk.turns.filter((u) => u.question && t >= u.end - 0.1).length;

  const story = L.format === 'story';
  const courtW = (story ? 640 : 520) * L.s;
  const courtH = (story ? 780 : 560) * L.s;
  const courtX = (L.width - courtW) / 2;
  const courtY = story ? 210 : L.top + 10;
  const sideY = (pos: number) => courtY + courtH * (0.27 + 0.46 * pos);

  const ball = ballAt(tk.turns, t);
  const ballX = L.width / 2 + ball.sway * courtW * 0.18;
  const ballY = sideY(ball.pos);
  const tilt = ((share - 50) / 50) * 8 * Math.min(1, (yours + theirs) / 4);

  // The cut-in: a quick shake as the smash lands
  const cutTurn = tk.turns.find((u) => u.cut);
  const sinceCut = cutTurn ? t - cutTurn.end : -1;
  const shake = sinceCut > 0 && sinceCut < 0.45 ? Math.sin(sinceCut * 70) * (1 - sinceCut / 0.45) * 14 * L.s : 0;

  // Their reaction, popping up on their side
  const reactTurn = tk.turns.find((u) => u.reaction && t >= u.start && t <= u.end + 0.8);
  const reactPop = reactTurn ? spring({frame: f - fr(reactTurn.start), fps, config: {damping: 9, stiffness: 180}}) : 0;

  // A detail they offered: shows on their side, then flies to yours when you pick it up
  const detailTurn = tk.turns.find((u) => u.detail);
  const pickTurn = tk.turns.find((u) => u.pickUp);
  const detailAt = detailTurn ? detailTurn.start + 1.1 : Infinity;
  const detailIn = detailTurn ? spring({frame: f - fr(detailAt), fps, config: {damping: 10, stiffness: 160}}) : 0;
  const picked = pickTurn ? interpolate(f, [fr(pickTurn.start + 0.2), fr(pickTurn.start + 0.8)], [0, 1], {...clamp, easing: ease}) : 0;

  // Each conversation ends on its note, over the court
  const noteAt = tk.end + 0.25;
  const noteOn = t >= noteAt && (next ? t < next.start - 0.45 : t < close.start - 0.1);
  const notePop = noteOn ? spring({frame: f - fr(noteAt), fps, config: {damping: 11, stiffness: 150}}) : 0;

  // The ending: the court folds away and the timeline rises
  const fold = interpolate(f, [fr(close.start - 0.1), fr(close.start + 0.9)], [0, 1], {...clamp, easing: ease});
  const out = fadeOutAt(f, endAt, 10);
  const stageIn = fadeIn(f, takes[0].start - 0.3, 10);

  const laneTop = courtY + courtH + 50 * L.s;
  const laneLeft = L.pad + 140 * L.s;
  const laneW = L.width - L.pad - laneLeft;
  const laneH = 56 * L.s;
  const pxPerS = laneW / (longest + 0.3);
  const rise = -(laneTop - (story ? 520 : L.top + 140)) * fold;

  const pill = (bg: string, fg: string): React.CSSProperties => ({
    position: 'absolute',
    padding: `${8 * L.s}px ${22 * L.s}px`,
    borderRadius: 999,
    background: bg,
    color: fg,
    fontWeight: 700,
    fontSize: 32 * L.s,
    whiteSpace: 'nowrap',
  });

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(takes[0].start - 0.3) + 2 ? <Hook b={hook} until={takes[0].start - 0.3} /> : null}
      {f >= fr(takes[0].start - 0.3) && f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: stageIn * out * tkOut * tkIn}}>
          <div style={{position: 'absolute', top: courtY - 70 * L.s, left: L.pad, opacity: 1 - fold}}>
            <Label>{tk.label}</Label>
          </div>
          {/* The court */}
          <div
            style={{
              position: 'absolute',
              left: courtX,
              top: courtY,
              width: courtW,
              height: courtH,
              transform: `translateX(${shake}px) rotate(${tilt}deg) scaleY(${1 - fold})`,
              transformOrigin: 'center bottom',
              opacity: 1 - fold,
            }}
          >
            <svg width={courtW} height={courtH} style={{overflow: 'visible'}}>
              <rect x={0} y={0} width={courtW} height={courtH} rx={10} fill={C.greenTint} stroke={C.green} strokeWidth={4} />
              <line x1={courtW / 2} y1={0} x2={courtW / 2} y2={courtH} stroke={C.green} strokeWidth={2} opacity={0.35} />
              <line x1={0} y1={courtH * 0.22} x2={courtW} y2={courtH * 0.22} stroke={C.green} strokeWidth={2} opacity={0.35} />
              <line x1={0} y1={courtH * 0.78} x2={courtW} y2={courtH * 0.78} stroke={C.green} strokeWidth={2} opacity={0.35} />
              <line x1={-14} y1={courtH / 2} x2={courtW + 14} y2={courtH / 2} stroke={C.ink} strokeWidth={6} />
              <circle cx={courtW / 2} cy={courtH * 0.08} r={26 * L.s} fill={C.lane} />
              <text x={courtW / 2 + 40 * L.s} y={courtH * 0.08 + 12 * L.s} fontSize={34 * L.s} fontWeight={700} fill={C.muted}>
                {tk.name}
              </text>
              <circle cx={courtW / 2} cy={courtH * 0.92} r={26 * L.s} fill={C.green} />
              <text x={courtW / 2 + 40 * L.s} y={courtH * 0.92 + 12 * L.s} fontSize={34 * L.s} fontWeight={700} fill={C.green}>
                You
              </text>
            </svg>
            {/* A smash leaves a streak behind it */}
            {ball.smash ? (
              <div
                style={{
                  position: 'absolute',
                  left: ballX - courtX - 6 * L.s,
                  top: ballY - courtY,
                  width: 12 * L.s,
                  height: courtH * 0.3,
                  borderRadius: 999,
                  background: `linear-gradient(${C.orange}, rgba(194,106,44,0))`,
                }}
              />
            ) : null}
            {/* The ball: its shadow stays on the court, the ball lifts and grows with height */}
            <div style={{position: 'absolute', left: ballX - courtX - 14, top: ballY - courtY - 6 + 14, width: 28 * L.s, height: 14 * L.s, borderRadius: 999, background: 'rgba(30,38,32,0.18)'}} />
            <div
              style={{
                position: 'absolute',
                left: ballX - courtX - 18 * L.s,
                top: ballY - courtY - 18 * L.s - ball.height * 60 * L.s,
                width: 36 * L.s,
                height: 36 * L.s,
                borderRadius: 999,
                background: ball.smash ? C.orange : C.warm,
                transform: `scale(${1 + 0.6 * ball.height})`,
                boxShadow: ball.question ? `0 0 0 ${10 * L.s}px rgba(194,106,44,0.25), 0 0 0 ${4 * L.s}px ${C.orange}` : 'none',
              }}
            />
            {ball.question ? (
              <div style={{...pill(C.peach, C.peachInk), left: ballX - courtX + 40 * L.s, top: ballY - courtY - 30 * L.s - ball.height * 60 * L.s}}>question</div>
            ) : null}
            {/* The detail they offered, then picked up by you */}
            {detailTurn && t >= detailAt ? (
              <div
                style={{
                  ...pill(picked > 0.5 ? C.green : C.card, picked > 0.5 ? '#fff' : C.ink),
                  left: courtW * 0.08,
                  top: interpolate(picked, [0, 1], [courtH * 0.16, courtH * 0.66]),
                  transform: `scale(${detailIn * (1 + 0.25 * Math.sin(Math.PI * picked))}) rotate(${-4 + 8 * picked}deg)`,
                  transformOrigin: 'left center',
                  boxShadow: '0 4px 12px rgba(30,38,32,0.15)',
                }}
              >
                {picked > 0.5 ? `Picked up: ${detailTurn.detail}` : `A detail: ${detailTurn.detail}`}
              </div>
            ) : null}
            {/* Their reaction */}
            {reactTurn ? (
              <div style={{...pill(C.orange, '#fff'), left: courtW * 0.05, top: courtH * 0.2, fontSize: 38 * L.s, transform: `scale(${reactPop}) rotate(-3deg)`, transformOrigin: 'left center'}}>
                {reactTurn.reaction}
              </div>
            ) : null}
            {/* Cut off: shown on your side as the smash lands */}
            {cutTurn && sinceCut > 0 && sinceCut < 1.6 ? (
              <div style={{...pill(C.peach, C.peachInk), left: courtW * 0.08, top: courtH * 0.62, opacity: fadeOutAt(f, cutTurn.end + 1.6, 10)}}>cut off</div>
            ) : null}
          </div>
          {/* The conversation's note, over the court */}
          {noteOn ? (
            <div style={{position: 'absolute', left: L.pad, right: L.pad, top: courtY + courtH * 0.36, display: 'flex', justifyContent: 'center'}}>
              <p style={{...noteStyle(L.s, tk.tone), textAlign: 'center', boxShadow: '0 10px 30px rgba(30,38,32,0.18)', transform: `scale(${notePop})`}}>{tk.note}</p>
            </div>
          ) : null}
          {/* The lane timeline and numbers, built from the same turns */}
          <div style={{position: 'absolute', left: 0, right: 0, top: laneTop, transform: `translateY(${rise}px)`}}>
            <div style={{position: 'absolute', left: L.pad, right: L.pad, top: -24 * L.s, height: 2 * (laneH + 30 * L.s) + 30 * L.s, ...cardStyle(L.s), padding: 0, opacity: fold}} />
            {(['them', 'you'] as const).map((who, row) => (
              <div key={who} style={{position: 'absolute', top: row * (laneH + 30 * L.s), left: 0, right: 0, height: laneH}}>
                <span style={{position: 'absolute', left: L.pad + 20 * L.s, top: 8 * L.s, fontSize: 34 * L.s, fontWeight: 600, color: C.muted}}>
                  {who === 'you' ? 'You' : tk.name}
                </span>
                {tk.turns
                  .filter((u) => u.who === who && t >= u.start)
                  .map((u) => {
                    const x = laneLeft + (u.start - tk.start) * pxPerS;
                    const w = Math.max(10, (Math.min(t, u.end) - u.start) * pxPerS - 6);
                    return (
                      <React.Fragment key={u.beat}>
                        <div
                          style={{
                            position: 'absolute',
                            left: x,
                            top: 0,
                            width: w,
                            height: laneH,
                            borderRadius: 12 * L.s,
                            background: who === 'you' ? C.green : C.lane,
                            // A cut-off turn ends in a ragged orange edge
                            borderRight: u.cut && t >= u.end ? `${8 * L.s}px dashed ${C.orange}` : undefined,
                          }}
                        />
                        {u.question && t >= u.end - 0.1 ? (
                          <div style={{position: 'absolute', left: x + w - 22 * L.s, top: laneH + 6 * L.s, width: 18 * L.s, height: 18 * L.s, borderRadius: 999, background: C.warm}} />
                        ) : null}
                      </React.Fragment>
                    );
                  })}
              </div>
            ))}
            <div style={{position: 'absolute', left: L.pad, right: L.pad, top: 2 * (laneH + 30 * L.s) + 40 * L.s, display: 'flex', alignItems: 'baseline', gap: 22 * L.s, opacity: fadeIn(f, tk.turns[1]?.start ?? tk.start, 10)}}>
              <span style={{fontFamily: serif, fontWeight: 600, fontSize: 92 * L.s, fontVariantNumeric: 'tabular-nums'}}>{share}%</span>
              <span style={{fontSize: 34 * L.s, color: C.muted, lineHeight: 1.25}}>
                of the talking was you
                <br />
                {asked} {asked === 1 ? 'question' : 'questions'} sent back
              </span>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      <Captions tl={tl} />
    </Stage>
  );
};
