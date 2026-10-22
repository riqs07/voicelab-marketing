// Talk share: the app's conversation timeline. Each line grows a bar in its speaker's lane as it is said;
// the share of talking and the questions you asked count up live.
import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {talkShare as K} from '../content/talkShare';
import {AudioTrack, Captions, cardStyle, EndCard, Hook, Label, noteStyle, Stage, useLayout} from '../kit/parts';
import {C, fadeIn, fadeOutAt, fr, gentle, rise, serif} from '../kit/theme';
import {beat, buildTimeline} from '../kit/timeline';

export const talkShareTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

export const TalkShare: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = talkShareTimeline(voiced);
  const t = f / fps;
  const hook = beat(tl, 'hook');
  const close = beat(tl, 'close');
  const endAt = close.start + K.endCardDelay;

  const takes = K.takes.map((tk) => {
    const turns = tk.turns.map((u) => ({...u, b: beat(tl, u.beat)}));
    return {...tk, turns, start: turns[0].b.start, end: turns[turns.length - 1].b.end};
  });
  // Both conversations share one scale so their lengths compare honestly.
  const longest = Math.max(...takes.map((x) => x.end - x.start));
  const idx = Math.max(0, takes.findLastIndex((x) => t >= x.start - 0.4));
  const tk = takes[idx];
  const next = takes[idx + 1];
  const tkOut = next ? fadeOutAt(f, next.start - 0.45, 10) : fadeOutAt(f, endAt, 10);

  const cardW = L.width - 2 * L.pad;
  const pad = 44 * L.s;
  const nameW = 150 * L.s;
  const laneW = cardW - 2 * pad - nameW;
  const laneH = 92 * L.s;
  const pxPerS = laneW / (longest + 0.3);

  // Talking so far in this conversation (seconds said, up to now).
  const said = (who: 'you' | 'them') =>
    tk.turns
      .filter((u) => u.who === who)
      .reduce((a, u) => a + Math.max(0, Math.min(t, u.b.end) - u.b.start), 0);
  const yours = said('you');
  const theirs = said('them');
  const share = yours + theirs > 0 ? Math.round((100 * yours) / (yours + theirs)) : 0;
  const asked = tk.turns.filter((u) => 'question' in u && u.question && t >= u.b.end - 0.1).length;
  const numbersP = fadeIn(f, tk.turns[1]?.b.start ?? tk.start, 10);
  const noteP = fadeIn(f, tk.end + 0.2, 14);

  const story = L.format === 'story';
  const top = story ? 300 : L.top + 30 * L.s;
  const stageIn = fadeIn(f, takes[0].start - 0.3, 10);

  return (
    <Stage>
      <AudioTrack tl={tl} />
      {f < fr(takes[0].start - 0.3) + 2 ? <Hook b={hook} until={takes[0].start - 0.3} /> : null}
      {f >= fr(takes[0].start - 0.3) && f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: stageIn}}>
          <div style={{position: 'absolute', top, left: L.pad, right: L.pad, opacity: tkOut}}>
            <Label>{tk.label}</Label>
            <h2 style={{margin: `${10 * L.s}px 0 0`, fontFamily: serif, fontWeight: 600, fontSize: 92 * L.s, lineHeight: 1.05}}>
              Who did the talking?
            </h2>
            <div style={{...cardStyle(L.s), padding: pad, marginTop: 40 * L.s}}>
              {(['them', 'you'] as const).map((who) => (
                <div key={who} style={{display: 'flex', alignItems: 'center', height: laneH + 34 * L.s}}>
                  <span style={{width: nameW, fontSize: 42 * L.s, color: C.muted, fontWeight: 600}}>
                    {who === 'you' ? 'You' : K.name}
                  </span>
                  <svg width={laneW} height={laneH + 30 * L.s} style={{overflow: 'visible'}}>
                    {tk.turns
                      .filter((u) => u.who === who)
                      .map((u) => {
                        const x = (u.b.start - tk.start) * pxPerS;
                        const w = Math.max(0, (Math.min(t, u.b.end) - u.b.start) * pxPerS - 6);
                        const q = 'question' in u && u.question;
                        const dotP = q ? spring({frame: f - fr(u.b.end - 0.1), fps, config: gentle}) : 0;
                        return (
                          <g key={u.beat}>
                            {t >= u.b.start ? (
                              <rect x={x} y={0} width={Math.max(10, w)} height={laneH} rx={14 * L.s}
                                fill={who === 'you' ? C.green : C.lane} />
                            ) : null}
                            {q ? (
                              <circle cx={x + Math.max(10, w) - 14 * L.s} cy={laneH + 20 * L.s} r={11 * L.s * dotP} fill={C.warm} />
                            ) : null}
                          </g>
                        );
                      })}
                  </svg>
                </div>
              ))}
              <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 30 * L.s, color: C.muted, marginTop: 8 * L.s}}>
                <svg width={22 * L.s} height={22 * L.s}><circle cx={11 * L.s} cy={11 * L.s} r={9 * L.s} fill={C.warm} /></svg>
                You asked a question
              </div>
            </div>
            <div style={{display: 'flex', gap: 28 * L.s, marginTop: 40 * L.s, opacity: numbersP}}>
              <Stat value={`${share}%`} label="of the talking was you" s={L.s} />
              <Stat value={`${asked}`} label={asked === 1 ? 'question asked back' : 'questions asked back'} s={L.s} />
            </div>
            <div style={{marginTop: 36 * L.s, opacity: noteP, transform: rise(noteP, 16)}}>
              <p style={noteStyle(L.s, tk.tone)}>{tk.note}</p>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      <Captions tl={tl} />
    </Stage>
  );
};

const Stat: React.FC<{value: string; label: string; s: number}> = ({value, label, s}) => (
  <div style={{flex: 1, ...cardStyle(s), padding: `${28 * s}px ${36 * s}px`, borderRadius: 36 * s}}>
    <div style={{fontFamily: serif, fontWeight: 600, fontSize: 104 * s, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>
      {value}
    </div>
    <div style={{fontSize: 34 * s, color: C.muted, marginTop: 10 * s, lineHeight: 1.25}}>{label}</div>
  </div>
);
