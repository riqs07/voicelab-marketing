import React from 'react';
import {
  AbsoluteFill,
  Audio,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {getLength, getPointAtLength} from '@remotion/paths';

// ---------------------------------------------------------------------------
// Fonts: self-hosted (Google Fonts files, SIL OFL). See VoicelabPitch.tsx for why.
const serif = 'Fraunces';
const sans = 'Atkinson Hyperlegible Next';
const fontHandle = delayRender('Loading local fonts');
Promise.all(
  [
    new FontFace(serif, `url(${staticFile('fonts/Fraunces-latin.woff2')}) format('woff2')`, {
      weight: '100 900',
    }),
    new FontFace(
      sans,
      `url(${staticFile('fonts/AtkinsonHyperlegibleNext-latin.woff2')}) format('woff2')`,
      {weight: '200 800'},
    ),
  ].map((ff) => ff.load().then((loaded) => document.fonts.add(loaded))),
)
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

const C = {
  bg: '#FBF6EE',
  card: '#FFFFFF',
  ink: '#1E2620',
  muted: '#59645C',
  green: '#2E5B3E',
  greenTint: '#E4EDE6',
  orange: '#C26A2C',
  peach: '#FCE3CF',
  peachInk: '#7A3A10',
  usual: '#B9C4BB',
  grey: '#8C978F',
};

export const FPS = 30;

// ---------------------------------------------------------------------------
// Audio timeline (seconds). Clip lengths from ffprobe; in-clip times from
// `ffmpeg -af silencedetect=noise=-35dB:d=0.12`.
const GAP = 0.4;
const CLIPS = [
  {file: 'audio/1-hook.mp3', dur: 3.553},
  {file: 'audio/2-rising.mp3', dur: 2.847},
  {file: 'audio/3-explain.mp3', dur: 4.676},
  {file: 'audio/4-falling.mp3', dur: 3.004},
  {file: 'audio/5-close.mp3', dur: 3.474},
];
const LEAD = 0.2;
const starts: number[] = [];
{
  let t = LEAD;
  for (const c of CLIPS) {
    starts.push(t);
    t += c.dur + GAP;
  }
}
const [A1, A2, A3, A4, A5] = starts;
const END = A5 + CLIPS[4].dur + 0.5; // 0.5 s tail
export const DURATION_IN_FRAMES = Math.ceil(END * FPS);

const fr = (s: number) => Math.round(s * FPS);

// Key moments (seconds), all derived from the clip starts.
const T = {
  hookLine1: A1 + 0.0, // "Do you sound unsure..."
  hookLine2: A1 + 2.16, // "without even knowing it?"
  cardIn: A2 - 0.35,
  roseDrawStart: A2 + 0.05,
  roseDrawEnd: A2 + 2.5, // "me?" peak, voice stops at 2.56
  rosePop: A2 + 2.4,
  explainCaption: A3 + 0.94, // "Your voice went up."
  tellAgain: A3 + 3.9, // narrator: "Tell it again."
  fellDrawStart: A4 + 0.05,
  fellPauseAt: A4 + 1.52, // pause after "just..."
  fellResume: A4 + 1.66,
  fellDrawEnd: A4 + 2.6, // "me." ends at 2.65
  fellPop: A4 + 2.5,
  landsCaption: A5 + 0.0, // "Now it lands."
  endCard: A5 + 1.3, // "VoiceLab." spoken at 1.35
  endLine2: A5 + 2.3, // "See how you sound." at 2.35
  endLine3: A5 + 3.0,
};

// Burned-in captions: line-level, from silencedetect boundaries (clip-relative).
const CAPTION_LINES: {t0: number; t1: number; text: string; quote?: boolean}[] = [
  {t0: A1 + 0.0, t1: A1 + 1.66, text: 'Do you sound unsure…'},
  {t0: A1 + 2.16, t1: A1 + 3.3, text: 'without even knowing it?'},
  {t0: A2 + 0.0, t1: A2 + 2.56, text: '“Then the gorilla just stared at me?”', quote: true},
  {t0: A3 + 0.0, t1: A3 + 0.49, text: 'Hear that?'},
  {t0: A3 + 0.94, t1: A3 + 1.75, text: 'Your voice went up.'},
  {t0: A3 + 2.18, t1: A3 + 3.28, text: 'It sounds like a question.'},
  {t0: A3 + 3.9, t1: A3 + 4.46, text: 'Tell it again.'},
  {t0: A4 + 0.0, t1: A4 + 2.65, text: '“Then the gorilla just… stared at me.”', quote: true},
  {t0: A5 + 0.0, t1: A5 + 0.96, text: 'Now it lands.'},
  {t0: A5 + 1.35, t1: A5 + 1.92, text: 'VoiceLab.'},
  {t0: A5 + 2.35, t1: A5 + 3.26, text: 'See how you sound.'},
];

// ---------------------------------------------------------------------------
// Chart geometry. Paths from Main.dc.html (phrase 4) and Compare.dc.html,
// authored in a 326x64 box; rescaled here with extra vertical exaggeration.
const ROSE_SRC =
  'M4 36 C 30 36, 50 26, 80 24 C 110 22, 130 34, 160 36 C 200 38, 230 40, 255 36 C 280 30, 300 14, 322 8';
const FELL_SRC =
  'M4 34 C 30 30, 50 18, 80 16 C 110 14, 130 30, 160 32 C 200 34, 230 30, 255 34 C 280 40, 300 50, 322 54';

const CARD_X = 40;
const CARD_PAD = 48;
const CHART_W = 1080 - 2 * CARD_X - 2 * CARD_PAD; // 904
const SX = CHART_W / 326;
const SY = 3.6;
const CHART_H = 64 * SY;

// Path data is only M/C with x,y pairs, so scale alternating numbers.
const scalePath = (d: string) => {
  let i = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => {
    const v = parseFloat(n) * (i++ % 2 === 0 ? SX : SY);
    return v.toFixed(1);
  });
};
const ROSE = scalePath(ROSE_SRC);
const FELL = scalePath(FELL_SRC);
const ROSE_LEN = getLength(ROSE);
const FELL_LEN = getLength(FELL);
const USUAL_Y = 36 * SY;

const WORDS: [string, number][] = [
  ['Then', 4],
  ['the', 46],
  ['gorilla', 76],
  ['just', 140],
  ['stared', 180],
  ['at', 240],
  ['me.', 270],
];

// ---------------------------------------------------------------------------
const ease = Easing.bezier(0.45, 0, 0.55, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const fadeIn = (f: number, startS: number, durF = 14) =>
  interpolate(f, [fr(startS), fr(startS) + durF], [0, 1], {...clamp, easing: ease});
const fadeOutAt = (f: number, endS: number, durF = 10) =>
  1 - interpolate(f, [fr(endS) - durF, fr(endS)], [0, 1], {...clamp, easing: ease});
const rise = (p: number, px = 24) => `translateY(${(1 - p) * px}px)`;
const gentle = {damping: 200, stiffness: 120, mass: 0.8};

// Content block sits in the upper ~2/3 (centre ≈ y 760); captions below it.
const CAPTION_TOP = 1420;

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

const Badge: React.FC<{dir: 'up' | 'down'; color: string; label: string; p: number}> = ({
  dir,
  color,
  label,
  p,
}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      color,
      fontWeight: 700,
      fontSize: 48,
      opacity: Math.min(1, p * 1.5),
      transform: `scale(${0.7 + 0.3 * p})`,
      transformOrigin: 'right center',
    }}
  >
    <Arrow dir={dir} color={color} size={48} />
    {label}
  </span>
);

// ---------------------------------------------------------------------------
const Hook: React.FC<{f: number}> = ({f}) => {
  const l1 = fadeIn(f, T.hookLine1 - 0.05, 16);
  const l2 = fadeIn(f, T.hookLine2 - 0.05, 16);
  const out = fadeOutAt(f, T.cardIn, 10);
  return (
    <AbsoluteFill style={{padding: '0 84px', opacity: out}}>
      <h1
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          top: 430,
          margin: 0,
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 132,
          lineHeight: 1.06,
          letterSpacing: '-0.015em',
          color: C.ink,
        }}
      >
        <span style={{display: 'block', opacity: l1, transform: rise(l1, 30)}}>Do you sound unsure…</span>
        <span style={{display: 'block', opacity: l2, transform: rise(l2, 30), color: C.green, marginTop: 28}}>
          without even knowing it?
        </span>
      </h1>
    </AbsoluteFill>
  );
};

const PitchCard: React.FC<{f: number; fps: number}> = ({f, fps}) => {
  const cardP = fadeIn(f, T.cardIn, 12);
  const out = fadeOutAt(f, T.endCard, 10);

  const roseDraw = interpolate(f, [fr(T.roseDrawStart), fr(T.roseDrawEnd)], [0, 1], clamp);
  // The falling take has a pause after "just..."; hold the playhead there.
  const fellDraw = interpolate(
    f,
    [fr(T.fellDrawStart), fr(T.fellPauseAt), fr(T.fellResume), fr(T.fellDrawEnd)],
    [0, 0.5, 0.5, 1],
    clamp,
  );
  const greyP = fadeIn(f, T.tellAgain, 18);

  const roseSpring = spring({frame: f - fr(T.rosePop), fps, config: gentle});
  const fellSpring = spring({frame: f - fr(T.fellPop), fps, config: gentle});

  const roseHead = roseDraw > 0 && roseDraw < 1 ? getPointAtLength(ROSE, roseDraw * ROSE_LEN) : null;
  const fellHead = fellDraw > 0 && fellDraw < 1 ? getPointAtLength(FELL, fellDraw * FELL_LEN) : null;

  const heading1 = fadeIn(f, T.cardIn + 0.1, 14) * fadeOutAt(f, T.tellAgain, 8);
  const heading2 = fadeIn(f, T.tellAgain + 0.05, 14);
  const cap1 = fadeIn(f, T.explainCaption, 14) * fadeOutAt(f, T.tellAgain, 8);
  const cap2 = fadeIn(f, T.landsCaption, 14);
  const meHighlight = roseSpring * (1 - greyP);
  const roseEnd = getPointAtLength(ROSE, ROSE_LEN)!;

  return (
    <AbsoluteFill style={{opacity: out}}>
      <div style={{position: 'absolute', top: 230, left: 64, right: 64, height: 200}}>
        <div style={{position: 'absolute', inset: 0, opacity: heading1, transform: rise(heading1, 16)}}>
          <div style={labelStyle}>One phrase from your story</div>
          <h2 style={h2Style}>How it sounded</h2>
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: heading2, transform: rise(heading2, 16)}}>
          <div style={labelStyle}>Same phrase · second try</div>
          <h2 style={h2Style}>Tell it again.</h2>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 450,
          left: CARD_X,
          right: CARD_X,
          background: C.card,
          borderRadius: 48,
          padding: CARD_PAD,
          boxShadow: '0 4px 10px rgba(30,38,32,0.07)',
          opacity: cardP,
          transform: rise(cardP, 30),
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 60,
            fontSize: 38,
            color: C.muted,
          }}
        >
          <span>Phrase 4</span>
          <span style={{position: 'relative', display: 'inline-flex', minWidth: 220}}>
            <span style={{position: 'absolute', right: 0, top: -30, opacity: 1 - greyP}}>
              <Badge dir="up" color={C.orange} label="Rose" p={roseSpring} />
            </span>
            <span style={{position: 'absolute', right: 0, top: -30}}>
              <Badge dir="down" color={C.green} label="Fell" p={fellSpring} />
            </span>
          </span>
        </div>

        <svg
          width={CHART_W}
          height={CHART_H}
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          style={{display: 'block', overflow: 'visible', marginTop: 24}}
        >
          <line x1={0} y1={USUAL_Y} x2={CHART_W} y2={USUAL_Y} stroke={C.usual} strokeWidth={3} strokeDasharray="11 8" />
          <path
            d={ROSE}
            pathLength={1}
            stroke={C.green}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - roseDraw}
            opacity={roseDraw > 0 ? 1 - greyP : 0}
          />
          <path
            d={ROSE}
            stroke={C.grey}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="16 11"
            opacity={greyP}
          />
          <circle
            cx={roseEnd.x}
            cy={roseEnd.y}
            r={16 * (0.6 + 0.4 * roseSpring)}
            fill="none"
            stroke={C.orange}
            strokeWidth={4.5}
            opacity={roseSpring * (1 - greyP)}
          />
          <path
            d={FELL}
            pathLength={1}
            stroke={C.green}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - fellDraw}
            opacity={fellDraw > 0 ? 1 : 0}
          />
          {roseHead ? <circle cx={roseHead.x} cy={roseHead.y} r={11} fill={C.ink} /> : null}
          {fellHead ? <circle cx={fellHead.x} cy={fellHead.y} r={11} fill={C.ink} /> : null}
        </svg>

        <div style={{position: 'relative', height: 70, marginTop: 22, fontSize: 46, color: C.ink}}>
          {WORDS.map(([w, x]) => {
            const isMe = w === 'me.';
            return (
              <span
                key={w}
                style={{
                  position: 'absolute',
                  left: x * SX - (isMe ? 10 : 0),
                  padding: isMe ? '0 10px' : 0,
                  borderRadius: 12,
                  background: isMe ? `rgba(252,227,207,${meHighlight})` : 'transparent',
                  color: isMe && meHighlight > 0.5 ? C.peachInk : C.ink,
                  fontWeight: isMe && fellSpring > 0.5 ? 700 : 400,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 44,
            fontSize: 34,
            color: C.muted,
            marginTop: 14,
            height: 48,
            alignItems: 'center',
            opacity: greyP,
          }}
        >
          <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={60} height={12}>
              <line x1={0} y1={6} x2={60} y2={6} stroke={C.grey} strokeWidth={5} strokeDasharray="12 8" />
            </svg>
            First try
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={60} height={12}>
              <line x1={0} y1={6} x2={60} y2={6} stroke={C.green} strokeWidth={7} />
            </svg>
            This try
          </span>
        </div>
      </div>

      {/* On-card explanation, below the card */}
      <div style={{position: 'absolute', top: 1080, left: CARD_X, right: CARD_X}}>
        <div style={{position: 'absolute', inset: 0, opacity: cap1, transform: rise(cap1, 16)}}>
          <p style={{...noteStyle, background: C.peach, color: C.peachInk}}>
            Your voice went up. It sounds like a question.
          </p>
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: cap2, transform: rise(cap2, 16)}}>
          <p style={{...noteStyle, background: C.greenTint, color: C.green}}>Now it lands.</p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 34,
  fontWeight: 600,
  color: C.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const h2Style: React.CSSProperties = {
  margin: '14px 0 0',
  fontFamily: serif,
  fontWeight: 600,
  fontSize: 108,
  letterSpacing: '-0.01em',
  lineHeight: 1.05,
  color: C.ink,
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  padding: '34px 44px',
  borderRadius: 36,
  fontSize: 60,
  lineHeight: 1.25,
  fontWeight: 600,
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  const p1 = fadeIn(f, T.endCard, 16);
  const p2 = fadeIn(f, T.endLine2, 16);
  const p3 = fadeIn(f, T.endLine3, 16);
  const p4 = fadeIn(f, T.endLine3 + 0.3, 16);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', top: 420, left: 84, right: 84, display: 'flex', flexDirection: 'column'}}>
        <div style={{opacity: p1, transform: rise(p1, 20)}}>
          {/* Placeholder mark */}
          <svg width={150} height={150} viewBox="0 0 64 64">
            <rect width={64} height={64} rx={16} fill={C.green} />
            <path d="M10 34 C 18 30, 22 20, 30 20 C 38 20, 42 34, 54 44" stroke="#FFFFFF" strokeWidth={4.5} fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <h1
          style={{
            margin: '52px 0 0',
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 176,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: C.ink,
            opacity: p1,
            transform: rise(p1, 20),
          }}
        >
          VoiceLab.
        </h1>
        <h2
          style={{
            margin: '32px 0 0',
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 90,
            lineHeight: 1.08,
            color: C.green,
            opacity: p2,
            transform: rise(p2, 20),
          }}
        >
          See how you sound.
        </h2>
        <p style={{margin: '52px 0 0', fontSize: 47, lineHeight: 1.35, color: C.muted, opacity: p3, transform: rise(p3, 20)}}>
          Practise speaking. Hear the difference.
        </p>
        <div
          style={{
            marginTop: 56,
            alignSelf: 'flex-start',
            padding: '20px 38px',
            border: `3px dashed ${C.usual}`,
            borderRadius: 999,
            fontSize: 42,
            color: C.muted,
            opacity: p4,
          }}
        >
          Join the waitlist
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Lower-third burned-in captions, clear of the cards and of the bottom ~300 px
// and right-hand ~130 px where TikTok/Reels/Shorts draw their UI.
const Captions: React.FC<{f: number}> = ({f}) => {
  const t = f / FPS;
  const idx = CAPTION_LINES.findIndex((l, i) => {
    const next = CAPTION_LINES[i + 1];
    const hold = Math.min(l.t1 + 0.35, next ? next.t0 - 0.05 : l.t1 + 0.35);
    return t >= l.t0 - 0.05 && t < hold;
  });
  if (idx < 0) return null;
  const line = CAPTION_LINES[idx];
  const next = CAPTION_LINES[idx + 1];
  const hold = Math.min(line.t1 + 0.35, next ? next.t0 - 0.05 : line.t1 + 0.35);
  const o = Math.min(
    interpolate(f, [fr(line.t0 - 0.05), fr(line.t0 - 0.05) + 4], [0, 1], clamp),
    interpolate(f, [fr(hold) - 4, fr(hold)], [1, 0], clamp),
  );
  return (
    <div
      style={{
        position: 'absolute',
        top: CAPTION_TOP,
        left: 90,
        right: 130,
        display: 'flex',
        justifyContent: 'center',
        opacity: o,
      }}
    >
      <span
        style={{
          background: 'rgba(30,38,32,0.86)',
          color: '#FFFFFF',
          fontFamily: sans,
          fontWeight: 600,
          fontStyle: line.quote ? 'italic' : 'normal',
          fontSize: line.quote ? 40 : 46,
          lineHeight: 1.3,
          padding: '14px 28px',
          borderRadius: 18,
          textAlign: 'center',
        }}
      >
        {line.text}
      </span>
    </div>
  );
};

export const VoicelabPitchVoiced: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: sans, color: C.ink}}>
      {CLIPS.map((c, i) => (
        <Sequence key={c.file} from={fr(starts[i])} durationInFrames={Math.ceil(c.dur * FPS) + 2} layout="none">
          <Audio src={staticFile(c.file)} />
        </Sequence>
      ))}
      {f < fr(T.cardIn) + 2 ? <Hook f={f} /> : null}
      {f >= fr(T.cardIn) - 1 && f < fr(T.endCard) + 1 ? <PitchCard f={f} fps={fps} /> : null}
      {f >= fr(T.endCard) - 1 ? <EndCard f={f} /> : null}
      <Captions f={f} />
    </AbsoluteFill>
  );
};

// Exported for reporting.
export const TIMELINE = {starts, END, T};
