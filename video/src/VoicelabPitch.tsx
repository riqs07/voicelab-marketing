import React from 'react';
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {getPointAtLength, getLength} from '@remotion/paths';
// Fonts are self-hosted in public/fonts (downloaded from Google Fonts, both SIL OFL).
// The headless browser here cannot reach fonts.gstatic.com through the proxy
// (TLS CA not trusted), so @remotion/google-fonts' runtime fetch times out.
const serif = 'Fraunces';
const sans = 'Atkinson Hyperlegible Next';
const fontHandle = delayRender('Loading local fonts');
Promise.all([
  new FontFace(serif, `url(${staticFile('fonts/Fraunces-latin.woff2')}) format('woff2')`, {
    weight: '100 900',
  }),
  new FontFace(sans, `url(${staticFile('fonts/AtkinsonHyperlegibleNext-latin.woff2')}) format('woff2')`, {
    weight: '200 800',
  }),
].map((ff) => ff.load().then((loaded) => document.fonts.add(loaded))))
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

const C = {
  bg: '#FBF6EE',
  card: '#FFFFFF',
  ink: '#1E2620',
  muted: '#59645C',
  green: '#2E5B3E',
  orange: '#C26A2C',
  peach: '#FCE3CF',
  peachInk: '#7A3A10',
  usual: '#B9C4BB',
  grey: '#8C978F',
};

// Paths from the approved mockups (Main.dc.html phrase 4, Compare.dc.html "last vs this").
// viewBox 0 0 326 64, scaled up to the card width.
const ROSE_PATH =
  'M4 36 C 30 36, 50 26, 80 24 C 110 22, 130 34, 160 36 C 200 38, 230 40, 255 36 C 280 30, 300 14, 322 8';
const FELL_PATH =
  'M4 34 C 30 30, 50 18, 80 16 C 110 14, 130 30, 160 32 C 200 34, 230 30, 255 34 C 280 40, 300 50, 322 54';
const ROSE_LEN = getLength(ROSE_PATH);
const FELL_LEN = getLength(FELL_PATH);

// Word x-positions from the mockups (in 326-wide units).
const WORDS: [string, number][] = [
  ['Then', 4],
  ['the', 46],
  ['gorilla', 76],
  ['just', 140],
  ['stared', 180],
  ['at', 240],
  ['me.', 270],
];

const CARD_PAD = 44;
const CHART_W = 1080 - 2 * 56 - 2 * CARD_PAD; // 880
const S = CHART_W / 326;
const CHART_H = 64 * S;

const ease = Easing.bezier(0.45, 0, 0.55, 1); // in-out sine-ish

const fade = (f: number, start: number, dur = 15) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

const fadeOut = (f: number, start: number, dur = 12) => 1 - fade(f, start, dur);

const rise = (p: number, px = 24) => `translateY(${(1 - p) * px}px)`;

// Timeline (frames @30fps)
const T = {
  hookEnd: 75, // 2.5 s
  cardIn: 72,
  drawRoseStart: 96,
  drawRoseEnd: 168,
  rosePop: 168,
  roseCaption: 180,
  againStart: 210, // 7 s
  drawFellStart: 236,
  drawFellEnd: 306,
  fellPop: 306,
  fellCaption: 318,
  endStart: 345, // 11.5 s
};

const Arrow: React.FC<{dir: 'up' | 'down'; color: string; size: number}> = ({
  dir,
  color,
  size,
}) => (
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

const Badge: React.FC<{
  dir: 'up' | 'down';
  color: string;
  label: string;
  p: number;
}> = ({dir, color, label, p}) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      color,
      fontWeight: 700,
      fontSize: 40,
      opacity: Math.min(1, p * 1.5),
      transform: `scale(${0.7 + 0.3 * p})`,
      transformOrigin: 'right center',
    }}
  >
    <Arrow dir={dir} color={color} size={40} />
    {label}
  </span>
);

const Hook: React.FC<{f: number}> = ({f}) => {
  const l1 = fade(f, 4, 20);
  const l2 = fade(f, 22, 20);
  const out = fadeOut(f, T.hookEnd - 12, 12);
  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        padding: '0 90px',
        opacity: out,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 118,
          lineHeight: 1.08,
          letterSpacing: '-0.015em',
          color: C.ink,
        }}
      >
        <span style={{display: 'block', opacity: l1, transform: rise(l1, 30)}}>
          Do you sound unsure…
        </span>
        <span
          style={{
            display: 'block',
            opacity: l2,
            transform: rise(l2, 30),
            color: C.green,
            marginTop: 24,
          }}
        >
          without knowing it?
        </span>
      </h1>
    </AbsoluteFill>
  );
};

const PitchCard: React.FC<{f: number; fps: number}> = ({f, fps}) => {
  const cardP = fade(f, T.cardIn, 18);
  const out = fadeOut(f, T.endStart - 12, 12);

  // Rose curve draw
  const roseDraw = interpolate(f, [T.drawRoseStart, T.drawRoseEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
  // Rose -> grey dashed
  const greyP = fade(f, T.againStart, 20);
  const fellDraw = interpolate(f, [T.drawFellStart, T.drawFellEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  const roseSpring = spring({
    frame: f - T.rosePop,
    fps,
    config: {damping: 200, stiffness: 120, mass: 0.8},
  });
  const fellSpring = spring({
    frame: f - T.fellPop,
    fps,
    config: {damping: 200, stiffness: 120, mass: 0.8},
  });
  const roseBadgeOut = 1 - greyP;

  const roseHead =
    roseDraw > 0 && roseDraw < 1 ? getPointAtLength(ROSE_PATH, roseDraw * ROSE_LEN) : null;
  const fellHead =
    fellDraw > 0 && fellDraw < 1 ? getPointAtLength(FELL_PATH, fellDraw * FELL_LEN) : null;

  const heading1 = fade(f, T.cardIn + 4, 16) * fadeOut(f, T.againStart - 6, 10);
  const heading2 = fade(f, T.againStart + 4, 16);
  const cap1 = fade(f, T.roseCaption, 16) * fadeOut(f, T.againStart - 6, 10);
  const cap2 = fade(f, T.fellCaption, 16);
  const meHighlight = roseSpring * (1 - greyP);

  return (
    <AbsoluteFill style={{opacity: out}}>
      {/* Heading above the card */}
      <div style={{position: 'absolute', top: 450, left: 56, right: 56, height: 220}}>
        <div style={{position: 'absolute', inset: 0, opacity: heading1, transform: rise(heading1, 16)}}>
          <div style={labelStyle}>One phrase from your story</div>
          <h2 style={h2Style}>How it sounded</h2>
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: heading2, transform: rise(heading2, 16)}}>
          <div style={labelStyle}>Same phrase · second try</div>
          <h2 style={h2Style}>Tell it again.</h2>
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          position: 'absolute',
          top: 690,
          left: 56,
          right: 56,
          background: C.card,
          borderRadius: 44,
          padding: CARD_PAD,
          boxShadow: '0 3px 8px rgba(30,38,32,0.07)',
          opacity: cardP,
          transform: rise(cardP, 30),
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 56,
            fontSize: 34,
            color: C.muted,
          }}
        >
          <span>Phrase 4</span>
          <span style={{position: 'relative', display: 'inline-flex', minWidth: 200, justifyContent: 'flex-end'}}>
            <span style={{position: 'absolute', right: 0, opacity: roseBadgeOut}}>
              <Badge dir="up" color={C.orange} label="Rose" p={roseSpring} />
            </span>
            <span style={{position: 'absolute', right: 0}}>
              <Badge dir="down" color={C.green} label="Fell" p={fellSpring} />
            </span>
          </span>
        </div>

        <svg
          width={CHART_W}
          height={CHART_H}
          viewBox="0 0 326 64"
          style={{display: 'block', overflow: 'visible', marginTop: 20}}
        >
          <line
            x1={0}
            y1={36}
            x2={326}
            y2={36}
            stroke={C.usual}
            strokeWidth={1.1}
            strokeDasharray="4 3"
          />
          {/* First try: solid green while drawing, then grey dashed */}
          <path
            d={ROSE_PATH}
            pathLength={1}
            stroke={C.green}
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - roseDraw}
            opacity={roseDraw > 0 ? 1 - greyP : 0}
          />
          <path
            d={ROSE_PATH}
            stroke={C.grey}
            strokeWidth={2.1}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="6 4"
            opacity={greyP}
          />
          {/* Rising end marker */}
          <circle
            cx={322}
            cy={8}
            r={5.5}
            fill="none"
            stroke={C.orange}
            strokeWidth={1.6}
            opacity={roseSpring * (1 - greyP)}
            transform={`translate(322 8) scale(${0.6 + 0.4 * roseSpring}) translate(-322 -8)`}
          />
          {/* Second try */}
          <path
            d={FELL_PATH}
            pathLength={1}
            stroke={C.green}
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="1 1"
            strokeDashoffset={1 - fellDraw}
            opacity={fellDraw > 0 ? 1 : 0}
          />
          {roseHead ? <circle cx={roseHead.x} cy={roseHead.y} r={3.6} fill={C.ink} /> : null}
          {fellHead ? <circle cx={fellHead.x} cy={fellHead.y} r={3.6} fill={C.ink} /> : null}
        </svg>

        <div style={{position: 'relative', height: 64, marginTop: 18, fontSize: 40, color: C.ink}}>
          {WORDS.map(([w, x]) => {
            const isMe = w === 'me.';
            return (
              <span
                key={w}
                style={{
                  position: 'absolute',
                  left: x * S - (isMe ? 10 : 0),
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

        {/* Legend appears in the second try */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontSize: 30,
            color: C.muted,
            marginTop: 16,
            height: 44,
            alignItems: 'center',
            opacity: greyP,
          }}
        >
          <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={56} height={12}>
              <line x1={0} y1={6} x2={56} y2={6} stroke={C.grey} strokeWidth={5} strokeDasharray="12 8" />
            </svg>
            First try
          </span>
          <span style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <svg width={56} height={12}>
              <line x1={0} y1={6} x2={56} y2={6} stroke={C.green} strokeWidth={7} />
            </svg>
            This try
          </span>
        </div>
      </div>

      {/* Captions below the card */}
      <div style={{position: 'absolute', top: 1200, left: 56, right: 56}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: cap1,
            transform: rise(cap1, 16),
          }}
        >
          <p style={{...captionStyle, background: C.peach, color: C.peachInk}}>
            Your voice went up. It sounds like a question.
          </p>
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: cap2, transform: rise(cap2, 16)}}>
          <p style={{...captionStyle, background: '#E4EDE6', color: C.green}}>Now it lands.</p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 600,
  color: C.muted,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const h2Style: React.CSSProperties = {
  margin: '14px 0 0',
  fontFamily: serif,
  fontWeight: 600,
  fontSize: 96,
  letterSpacing: '-0.01em',
  lineHeight: 1.05,
  color: C.ink,
};

const captionStyle: React.CSSProperties = {
  margin: 0,
  padding: '32px 40px',
  borderRadius: 32,
  fontSize: 54,
  lineHeight: 1.3,
  fontWeight: 600,
};

const EndCard: React.FC<{f: number}> = ({f}) => {
  const p1 = fade(f, T.endStart + 4, 20);
  const p2 = fade(f, T.endStart + 16, 20);
  const p3 = fade(f, T.endStart + 30, 20);
  const p4 = fade(f, T.endStart + 44, 20);
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 90px'}}>
      <div style={{opacity: p1, transform: rise(p1, 20)}}>
        {/* Placeholder mark: a falling pitch line in a green tile */}
        <svg width={140} height={140} viewBox="0 0 64 64">
          <rect width={64} height={64} rx={16} fill={C.green} />
          <path
            d="M10 34 C 18 30, 22 20, 30 20 C 38 20, 42 34, 54 44"
            stroke="#FFFFFF"
            strokeWidth={4.5}
            fill="none"
            strokeLinecap="round"
          />
          <line x1={10} y1={36} x2={54} y2={36} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={2} strokeDasharray="4 3" />
        </svg>
      </div>
      <h1
        style={{
          margin: '48px 0 0',
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 150,
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
          margin: '28px 0 0',
          fontFamily: serif,
          fontWeight: 600,
          fontSize: 88,
          lineHeight: 1.1,
          color: C.green,
          opacity: p2,
          transform: rise(p2, 20),
        }}
      >
        See how you sound.
      </h2>
      <p
        style={{
          margin: '48px 0 0',
          fontSize: 50,
          lineHeight: 1.35,
          color: C.muted,
          opacity: p3,
          transform: rise(p3, 20),
        }}
      >
        Practise speaking. Hear the difference.
      </p>
      <div
        style={{
          marginTop: 72,
          alignSelf: 'flex-start',
          padding: '20px 36px',
          border: `3px dashed ${C.usual}`,
          borderRadius: 999,
          fontSize: 40,
          color: C.muted,
          opacity: p4,
        }}
      >
        Join the waitlist
      </div>
    </AbsoluteFill>
  );
};

export const VoicelabPitch: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: sans, color: C.ink}}>
      {f < T.hookEnd + 2 ? <Hook f={f} /> : null}
      {f >= T.cardIn && f < T.endStart + 2 ? <PitchCard f={f} fps={fps} /> : null}
      {f >= T.endStart ? <EndCard f={f} /> : null}
    </AbsoluteFill>
  );
};
