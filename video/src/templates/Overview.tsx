// Who VoiceLab is for. One green line runs through the whole video: it draws shaky and droops under the hook,
// becomes the underline of each "moment" card as it drops in, draws the outline of the phone the cards gather
// into, is the real pitch line inside the app, and finally the wave in the logo. One thing moves at a time,
// each move lands on a word, and every move settles before the next.
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {drawnLive} from '../content/drawnLive';
import {overview as K} from '../content/overview';
import {AudioTrack, Captions, EndCard, Stage, useLayout} from '../kit/parts';
import {C, clamp, ease, fadeIn, fadeOutAt, fr, gentle, rise, serif} from '../kit/theme';
import {beat, buildTimeline} from '../kit/timeline';
import {heightOf, pathUpTo, pitch} from './DrawnLive';

export const overviewTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);

// The app screen is designed at the app's own size and scaled into the phone
const APP_W = 390;
const APP_H = 844;
const TILTS = [-3, 2, -1.6, 2.4];
const BOUNCY = {damping: 12, stiffness: 140, mass: 0.9};

// A gentle, repeatable wobble for the nervous line (no randomness, so every render matches)
const wobble = (x: number) => Math.sin(x * 0.045) * 9 + Math.sin(x * 0.13 + 1.3) * 5 + Math.sin(x * 0.31 + 0.4) * 3;

// Simple line icons for the moment cards, on a 48-unit grid
const Icon: React.FC<{kind: string; size: number; t: number}> = ({kind, size, t}) => {
  const stroke = {stroke: C.green, strokeWidth: 3, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      {kind === 'meeting' ? (
        <>
          {/* A speech bubble whose words have run out: three dots, blinking in turn */}
          <path d="M8 12 h32 a4 4 0 0 1 4 4 v14 a4 4 0 0 1 -4 4 h-20 l-8 7 v-7 h-4 a4 4 0 0 1 -4 -4 v-14 a4 4 0 0 1 4 -4z" {...stroke} />
          {[17, 24, 31].map((cx, i) => (
            <circle key={cx} cx={cx} cy={23} r={2.4} fill={C.green} opacity={0.35 + 0.65 * Math.max(0, Math.sin(t * 5 - i * 0.9))} />
          ))}
        </>
      ) : kind === 'story' ? (
        <>
          {/* An open book with a flat line across it */}
          <path d="M6 12 c6 -3 12 -3 18 1 c6 -4 12 -4 18 -1 v24 c-6 -3 -12 -3 -18 1 c-6 -4 -12 -4 -18 -1z M24 13 v24" {...stroke} />
          <path d="M10 26 h10 M28 26 h10" {...stroke} stroke={C.orange} opacity={0.8} />
        </>
      ) : kind === 'coffee' ? (
        <>
          {/* A cup with a curl of steam that sways */}
          <path d="M9 20 h24 v10 a10 10 0 0 1 -10 10 h-4 a10 10 0 0 1 -10 -10z M33 23 h3 a5 5 0 0 1 0 10 h-3" {...stroke} />
          <path d={`M17 15 c${-3 + 2 * Math.sin(t * 3)} -3 ${3 + 2 * Math.sin(t * 3)} -5 0 -9 M25 15 c${-3 + 2 * Math.sin(t * 3 + 1)} -3 ${3 + 2 * Math.sin(t * 3 + 1)} -5 0 -9`} {...stroke} opacity={0.6} />
        </>
      ) : (
        <>
          {/* Two glasses that clink once */}
          <g transform={`rotate(${-8 - 6 * Math.max(0, Math.sin(Math.min(1, t * 1.6) * Math.PI))} 16 40)`}>
            <path d="M10 8 h12 l-2 14 a4 4 0 0 1 -8 0z M16 26 v12 M11 40 h10" {...stroke} />
          </g>
          <g transform={`rotate(${8 + 6 * Math.max(0, Math.sin(Math.min(1, t * 1.6) * Math.PI))} 32 40)`}>
            <path d="M26 8 h12 l-2 14 a4 4 0 0 1 -8 0z M32 26 v12 M27 40 h10" {...stroke} />
          </g>
        </>
      )}
    </svg>
  );
};

export const Overview: React.FC<{voiced?: boolean}> = ({voiced = true}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = useLayout();
  const tl = overviewTimeline(voiced);
  const t = f / fps;
  const story = L.format === 'story';
  const W = L.width;

  const hook = beat(tl, 'hook');
  const all = beat(tl, 'all');
  const how1 = beat(tl, 'how1');
  const how2 = beat(tl, 'how2');
  const how3 = beat(tl, 'how3');
  const daily = beat(tl, 'daily');
  const close = beat(tl, 'close');
  const moments = K.moments.map((m) => ({...m, at: beat(tl, m.line).start, clipAt: beat(tl, m.clip).start, clipEnd: beat(tl, m.clip).end}));
  const endAt = close.start + 0.15;

  // ---- 1. The hook: words pop up one by one, the nervous line draws and droops ----
  const hookLines = [
    {text: 'You know what you want to say.', colour: C.ink},
    {text: 'So why doesn’t it come out that way?', colour: C.green},
  ];
  const hookWords = hookLines.flatMap((l, li) => l.text.split(' ').map((w) => ({w, li})));
  const hookSpan = hook.end - hook.start;
  const hookOut = fadeOutAt(f, moments[0].at - 0.05, 10);
  const lineY = story ? 1230 : L.top + 900 * L.s;
  const draw = interpolate(t, [hook.start + 0.1, hook.end - 0.2], [0, 1], {...clamp, easing: ease});
  const droop = interpolate(t, [hook.end - 1.1, hook.end - 0.1], [0, 1], {...clamp, easing: ease});

  // ---- 2. The moment cards: each drops in on its line and settles; the line underlines the newest ----
  const cardW = (story ? 840 : 760) * L.s;
  const cardH = (story ? 400 : 360) * L.s;
  const strip = (story ? 236 : 190) * L.s;
  const cardsTop = story ? 250 : L.top + 10 * L.s;
  const cardX = (W - cardW) / 2;
  const cardY = (i: number) => cardsTop + i * strip;
  const gatherStart = all.start;
  const gather = interpolate(t, [gatherStart, gatherStart + 0.7], [0, 1], {...clamp, easing: ease});

  // The thread: where it sits now (hook line → underline of each card in turn)
  const current = moments.findLastIndex((m) => t >= m.at - 0.05);
  const under = (i: number) => ({x0: cardX + 158 * L.s, x1: cardX + 158 * L.s + moments[i].title.length * 30 * L.s, y: cardY(i) + 136 * L.s});
  // The line waits for the new card to land, then slides under its title
  const move = current >= 0 ? spring({frame: f - fr(moments[current].at + (current === 0 ? 0 : 0.4)), fps, config: gentle}) : 0;
  // Under the hook it is the nervous line; it slides and straightens under the first card, then redraws
  // itself under each new card's title (sliding would cross the cards, which overlap)
  const from = current <= 0 ? {x0: L.pad, x1: W - L.pad, y: lineY} : under(current);
  const to = current < 0 ? from : under(current);
  const th = {
    x0: from.x0 + (to.x0 - from.x0) * move,
    x1: from.x1 + (to.x1 - from.x1) * move,
    y: from.y + (to.y - from.y) * move,
    amp: current < 0 ? 1 : current === 0 ? 1 - move : 0,
    droop: current < 0 ? droop : current === 0 ? droop * (1 - move) : 0,
  };
  // How much of the line is drawn: the hook draws it once; later cards draw their own underline
  const drawn = current < 0 ? draw : current === 0 ? 1 : Math.min(1, move * 1.2);
  const threadPath = (() => {
    const pts: string[] = [];
    const n = 48;
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = th.x0 + (th.x1 - th.x0) * u;
      const sag = th.droop * Math.pow(Math.max(0, (u - 0.62) / 0.38), 2) * 120 * L.s;
      pts.push(`${i ? 'L' : 'M'}${x.toFixed(1)} ${(th.y + wobble(x) * th.amp * L.s + sag).toFixed(1)}`);
    }
    return pts.join(' ');
  })();
  const threadOn = t < gatherStart + 0.25;
  const threadOpacity = fadeIn(f, hook.start, 8) * (1 - interpolate(t, [gatherStart, gatherStart + 0.25], [0, 1], clamp));

  // ---- 3. The phone: the line draws its outline, then the app's Practice menu fills in ----
  const phoneW = story ? 600 : 450;
  const k = phoneW / APP_W;
  const phoneH = APP_H * k;
  const phoneX = (W - phoneW) / 2;
  const phoneY = story ? 126 : L.top - 50;
  const outline = interpolate(t, [gatherStart + 0.15, gatherStart + 1.05], [0, 1], {...clamp, easing: ease});
  const phoneIn = fadeIn(f, gatherStart + 0.85, 10);
  const phoneOut = fadeOutAt(f, close.start - 0.05, 10);
  // Section 5: the phone eases back and a lock settles on it
  const back = interpolate(t, [daily.start + 1.4, daily.start + 2.0], [0, 1], {...clamp, easing: ease});
  const lockPop = spring({frame: f - fr(daily.start + 1.9), fps, config: BOUNCY});

  // Which screen the phone shows
  const screens = [
    {id: 'menu', from: gatherStart + 0.85},
    {id: 'talk', from: how1.start - 0.15},
    {id: 'pitch', from: how2.start - 0.15},
    {id: 'today', from: daily.start - 0.2},
  ];
  const screenIdx = Math.max(0, screens.findLastIndex((s) => t >= s.from));
  const screen = screens[screenIdx];
  const screenIn = fadeIn(f, screen.from, 8);

  // ---- 4. Inside the app: the timer ring, then the gorilla line drawn live, then the second try over it ----
  const ringFill = interpolate(t, [how1.start, how2.start - 0.3], [0, 1], {...clamp, easing: ease});
  const take1 = pitch['audio/drawn-live/take1.mp3'];
  const take2 = pitch['audio/drawn-live/take2.mp3'];
  const w1 = drawnLive.words.take1;
  const w2 = drawnLive.words.take2;
  const span = 3.0;
  const px = (s: number) => 24 + (s / span) * (APP_W - 48);
  const midY = 300;
  const py = (v: number) => midY - v * 12;
  const draw1 = interpolate(t, [how2.start + 0.2, how2.end - 0.6], [0, span], clamp);
  const draw2 = interpolate(t, [how3.start + 0.2, how3.end - 0.2], [0, span], clamp);
  const line1 = pathUpTo(take1, draw1, px, py);
  const line2 = pathUpTo(take2, draw2, px, py);
  const second = t >= how3.start;
  const rosePop = spring({frame: f - fr(how2.end - 0.6), fps, config: BOUNCY});
  const fellPop = spring({frame: f - fr(how3.end - 0.1), fps, config: BOUNCY});

  // ---- 5. Today: four steps tick off one by one ----
  const tickAt = (i: number) => daily.start + 0.1 + i * 0.32;

  // ---- 6. The line curls into the logo, then the end card ----
  const logoSize = 140 * L.s;
  const logoX = L.pad + 12;
  const logoY = story ? 400 : L.top + 120;
  const curl = interpolate(t, [close.start - 0.45, close.start + 0.2], [0, 1], {...clamp, easing: ease});
  const curlOut = fadeOutAt(f, endAt + 0.5, 8);

  const row = (label: string, i: number, start: number, extra?: React.ReactNode) => {
    const p = spring({frame: f - fr(start + i * 0.07), fps, config: BOUNCY});
    return (
      <div
        key={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: C.card,
          borderRadius: 16,
          padding: '10px 12px',
          marginTop: 8,
          boxShadow: '0 3px 0 #efe8dc',
          opacity: p,
          transform: `translateX(${(1 - p) * 30}px)`,
        }}
      >
        <span style={{width: 36, height: 36, borderRadius: 10, background: C.greenTint, flexShrink: 0}} />
        <span style={{fontWeight: 700, fontSize: 19, flex: 1}}>{label}</span>
        {extra}
      </div>
    );
  };

  return (
    <Stage>
      <AudioTrack tl={tl} />

      {/* 1. Hook */}
      {t < moments[0].at + 0.3 ? (
        <div style={{position: 'absolute', left: L.pad + 12, right: L.pad + 12, top: story ? 430 : L.top + 130 * L.s, opacity: hookOut}}>
          {hookLines.map((l, li) => (
            <h1 key={li} style={{margin: li ? `${28 * L.s}px 0 0` : 0, fontFamily: serif, fontWeight: 600, fontSize: 112 * L.s, lineHeight: 1.06, letterSpacing: '-0.015em', color: l.colour}}>
              {l.text.split(' ').map((w, wi) => {
                const index = hookWords.findIndex((x, xi) => x.li === li && hookWords.slice(0, xi).filter((y) => y.li === li).length === wi);
                const at = hook.start + (index / hookWords.length) * (hookSpan - 0.5);
                const p = spring({frame: f - fr(at), fps, config: BOUNCY});
                return (
                  <span key={wi} style={{display: 'inline-block', marginRight: '0.24em', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 26}px)`}}>
                    {w}
                  </span>
                );
              })}
            </h1>
          ))}
        </div>
      ) : null}

      {/* 2. The moment cards */}
      {t >= moments[0].at - 0.1 && t < gatherStart + 0.9
        ? moments.map((m, i) => {
            if (t < m.at - 0.05) return null;
            // The first card drops onto the line once it has risen into place; the rest land on their word
            const land = spring({frame: f - fr(m.at + (i === 0 ? 0.35 : 0)), fps, config: BOUNCY});
            const next = moments[i + 1];
            const quote = fadeIn(f, m.clipAt - 0.05, 8) * (next ? fadeOutAt(f, next.at + 0.1, 6) : 1);
            const gy = phoneY + phoneH / 2 - cardH / 2;
            const y = cardY(i) + (gy - cardY(i)) * gather;
            return (
              <div
                key={m.line}
                style={{
                  position: 'absolute',
                  left: cardX,
                  top: y - (1 - land) * 260,
                  width: cardW,
                  height: cardH,
                  borderRadius: 40 * L.s,
                  background: C.card,
                  boxShadow: '0 14px 30px rgba(30,38,32,0.12), 0 2px 6px rgba(30,38,32,0.06)',
                  padding: `${34 * L.s}px ${40 * L.s}px`,
                  boxSizing: 'border-box',
                  opacity: Math.min(1, land * 1.5) * (1 - interpolate(t, [gatherStart + 0.45, gatherStart + 0.8], [0, 1], clamp)),
                  transform: `rotate(${TILTS[i] * (1 - gather)}deg) scale(${1 - 0.45 * gather})`,
                }}
              >
                <div style={{display: 'flex', alignItems: 'center', gap: 26 * L.s}}>
                  <div style={{width: 92 * L.s, height: 92 * L.s, borderRadius: 26 * L.s, background: C.greenTint, display: 'grid', placeItems: 'center', flexShrink: 0}}>
                    <Icon kind={m.icon} size={60 * L.s} t={Math.max(0, t - m.at)} />
                  </div>
                  <div style={{fontFamily: serif, fontWeight: 600, fontSize: 64 * L.s, lineHeight: 1.05}}>{m.title}</div>
                </div>
                <div style={{marginTop: 34 * L.s, fontSize: 42 * L.s, color: C.muted}}>{m.rest}</div>
                <div style={{marginTop: 26 * L.s, fontSize: 40 * L.s, fontStyle: 'italic', color: C.peachInk, opacity: quote, transform: rise(quote, 12)}}>{m.quote}</div>
              </div>
            );
          })
        : null}

      {/* The thread: the nervous line, then each card's underline */}
      {threadOn ? (
        <svg width={W} height={L.height} style={{position: 'absolute', inset: 0, opacity: threadOpacity, overflow: 'visible'}}>
          <path d={threadPath} stroke={C.green} strokeWidth={8 * L.s} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawn} />
        </svg>
      ) : null}

      {/* 3–5. The phone */}
      {t >= gatherStart && t < close.start + 0.4 ? (
        <div
          style={{
            position: 'absolute',
            left: phoneX,
            top: phoneY,
            width: phoneW,
            height: phoneH,
            opacity: phoneOut,
            transform: `scale(${1 - 0.1 * back})`,
            transformOrigin: 'center center',
          }}
        >
          {/* The outline, drawn by the line */}
          <svg width={phoneW} height={phoneH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <rect x={3} y={3} width={phoneW - 6} height={phoneH - 6} rx={58 * k} fill="none" stroke={C.green} strokeWidth={8 * L.s} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - outline} opacity={1 - phoneIn} />
          </svg>
          {/* The phone itself */}
          <div style={{position: 'absolute', inset: 0, borderRadius: 58 * k, background: C.ink, padding: 10 * k, boxSizing: 'border-box', opacity: phoneIn, boxShadow: '0 30px 60px -20px rgba(30,38,32,0.5)'}}>
            <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 48 * k, background: C.bg, overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: APP_W, height: APP_H, transform: `scale(${(phoneW - 20 * k) / APP_W})`, transformOrigin: 'top left', fontFamily: 'inherit'}}>
                <div style={{position: 'absolute', left: '50%', top: 10, width: 110, height: 28, marginLeft: -55, borderRadius: 999, background: C.ink, zIndex: 2}} />
                <div style={{position: 'absolute', inset: 0, padding: '56px 22px 0', opacity: screenIn, transform: rise(screenIn, 16)}}>
                  {screen.id === 'menu' ? (
                    <>
                      <div style={{fontFamily: serif, fontWeight: 600, fontSize: 34}}>Practice</div>
                      <div style={{fontSize: 14, color: C.muted, marginTop: 2}}>Anything, in any order.</div>
                      {(() => {
                        let n = 0;
                        return K.menu.map((g) => (
                          <div key={g.group} style={{marginTop: 16}}>
                            <div style={{fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted}}>{g.group}</div>
                            {g.rows.map((r) => row(r, n++, gatherStart + 1.0))}
                          </div>
                        ));
                      })()}
                    </>
                  ) : screen.id === 'talk' ? (
                    <>
                      <div style={{fontFamily: serif, fontWeight: 600, fontSize: 26}}>Rapid Fire</div>
                      <div style={{fontSize: 14, color: C.muted, marginTop: 18}}>Your question</div>
                      <div style={{fontFamily: serif, fontWeight: 600, fontSize: 30, lineHeight: 1.15, marginTop: 4}}>Morning person or night person, and why?</div>
                      <div style={{display: 'flex', justifyContent: 'center', marginTop: 60}}>
                        <svg width={230} height={230}>
                          <circle cx={115} cy={115} r={96} fill="none" stroke={C.greenTint} strokeWidth={18} />
                          <circle cx={115} cy={115} r={96} fill="none" stroke={ringFill >= 1 ? C.green : '#B9C4BB'} strokeWidth={18} strokeLinecap="round" strokeDasharray={`${ringFill * 2 * Math.PI * 96} ${2 * Math.PI * 96}`} transform="rotate(-90 115 115)" />
                          <text x={115} y={128} textAnchor="middle" fontSize={40} fontWeight={700} fill={C.ink} fontFamily={serif}>
                            {`0:${String(Math.round(ringFill * 59)).padStart(2, '0')}`.replace('0:59', '1:00')}
                          </text>
                        </svg>
                      </div>
                      <div style={{textAlign: 'center', marginTop: 16, fontWeight: 700, color: ringFill >= 1 ? C.green : C.muted}}>{ringFill >= 1 ? 'You’re in the window' : 'Listening…'}</div>
                    </>
                  ) : screen.id === 'pitch' ? (
                    <>
                      <div style={{fontFamily: serif, fontWeight: 600, fontSize: 26}}>Your voice</div>
                      <div style={{fontSize: 17, color: C.muted, marginTop: 6}}>{second ? 'Second try · same words' : 'Words sit higher where your voice went up'}</div>
                      <svg width={APP_W - 44} height={460} style={{position: 'absolute', left: 0, top: 120, overflow: 'visible'}}>
                        <line x1={10} y1={midY} x2={APP_W - 34} y2={midY} stroke="#B9C4BB" strokeWidth={1.5} strokeDasharray="6 5" />
                        <path d={line1.d} stroke={second ? '#8C978F' : C.green} strokeWidth={second ? 4 : 7} strokeDasharray={second ? '8 7' : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        <path d={line1.bridges} stroke={second ? '#8C978F' : C.green} strokeWidth={2} strokeDasharray="3 6" fill="none" opacity={0.7} />
                        {second ? <path d={line2.d} stroke={C.green} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
                        {second ? <path d={line2.bridges} stroke={C.green} strokeWidth={2} strokeDasharray="3 6" fill="none" opacity={0.7} /> : null}
                      </svg>
                      {(second ? w2 : w1).map((w, i) => {
                        const draw = second ? draw2 : draw1;
                        const p = second ? take2 : take1;
                        const h = heightOf(p, w.start, w.end) ?? 0;
                        const on = fadeIn(f, (second ? how3.start : how2.start) + 0.2 + (w.start / span) * ((second ? how3.end - 0.2 : how2.end - 0.6) - (second ? how3.start : how2.start) - 0.2), 6);
                        return draw >= w.start ? (
                          <span key={i} style={{position: 'absolute', left: px(w.start) - 6, top: 120 + py(h) - 44, fontSize: i === 6 ? 30 : 24, fontWeight: i === 6 ? 700 : 400, whiteSpace: 'nowrap', opacity: on}}>
                            {w.text}
                          </span>
                        ) : null;
                      })}
                      {!second && rosePop > 0.01 ? (
                        <div style={{position: 'absolute', right: 20, top: 120 + midY - 150, padding: '6px 12px', borderRadius: 999, background: C.peach, color: C.peachInk, fontWeight: 700, fontSize: 19, transform: `scale(${rosePop})`}}>↗ went up: sounds unsure</div>
                      ) : null}
                      {second && fellPop > 0.01 ? (
                        <div style={{position: 'absolute', right: 20, top: 120 + midY + 60, padding: '6px 12px', borderRadius: 999, background: C.greenTint, color: C.green, fontWeight: 700, fontSize: 19, transform: `scale(${fellPop})`}}>↘ now it lands</div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div style={{fontFamily: serif, fontWeight: 600, fontSize: 34}}>Today</div>
                      <div style={{fontSize: 14, color: C.muted, marginTop: 2}}>4 steps · about 6 minutes</div>
                      <div style={{marginTop: 18}}>
                        {K.today.map((s, i) => {
                          const tick = spring({frame: f - fr(tickAt(i)), fps, config: BOUNCY});
                          return (
                            <div key={s.label} style={{display: 'flex', alignItems: 'center', gap: 12, background: C.card, borderRadius: 16, padding: '12px 14px', marginTop: 10, boxShadow: '0 3px 0 #efe8dc'}}>
                              <span style={{width: 30, height: 30, borderRadius: 999, border: `2.5px solid ${C.green}`, background: tick > 0.5 ? C.green : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0}}>
                                <svg width={16} height={16} viewBox="0 0 16 16" style={{transform: `scale(${tick})`}}>
                                  <path d="M3 8.5 l3.2 3 L13 4.5" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span style={{flex: 1}}>
                                <span style={{display: 'block', fontWeight: 700, fontSize: 20}}>{s.label}</span>
                                <span style={{display: 'block', fontSize: 15, color: C.muted}}>{s.detail}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* The lock, settling onto the phone */}
          {lockPop > 0.01 ? (
            <div style={{position: 'absolute', right: -40 * k, top: phoneH * 0.62, width: 120 * k, height: 120 * k, borderRadius: 999, background: C.green, display: 'grid', placeItems: 'center', boxShadow: '0 10px 24px rgba(30,38,32,0.25)', transform: `scale(${lockPop}) translateY(${(1 - lockPop) * -40}px)`}}>
              <svg width={56 * k} height={56 * k} viewBox="0 0 24 24">
                <rect x={5} y={11} width={14} height={10} rx={2.5} fill="#fff" />
                <path d="M8 11 V8 a4 4 0 0 1 8 0 v3" stroke="#fff" strokeWidth={2.4} fill="none" />
              </svg>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* 6. The line curls into the logo's wave, then the end card */}
      {curl > 0 && t < endAt + 0.6 ? (
        <svg width={logoSize} height={logoSize} viewBox="0 0 34 34" style={{position: 'absolute', left: logoX, top: logoY, opacity: curlOut, overflow: 'visible'}}>
          <path d="M6 22 C 11 22, 12 12, 17 12 C 22 12, 23 20, 28 15" stroke={C.green} strokeWidth={2.5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - curl} />
        </svg>
      ) : null}
      {f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
      <Captions tl={tl} />
    </Stage>
  );
};
