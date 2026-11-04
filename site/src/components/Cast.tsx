// The redesign's working cast, drawn as in the app's storyboard (Table-Topics: documents/design/redesign/storyboard.html):
// you (the round), Sage (the coach), the friend (an egg) and three course bosses told apart by shape and colour.
// No arms at rest and no accessories, as the redesign asks. Each has a resting face and a face for when you say hi.
import type { CSSProperties } from "react";

// Every body is drawn from one of these outlines, 100 units across its radius, standing on y = 94
const SHAPES = {
  round: "M0 -100C58.8 -100 106 -53.2 106 0C106 50.4 61.6 94 0 94C-58.8 94 -103 53.2 -103 0C-103 -56 -56 -100 0 -100Z",
  egg: "M0 -114C52 -114 92 -42 92 10C92 62 52 94 0 94C-52 94 -92 62 -92 10C-92 -42 -52 -114 0 -114Z",
  wobbly: "M4 -104C50 -110 74 -76 98 -50C124 -22 118 30 96 58C72 90 30 96 -6 94C-52 92 -96 74 -108 34C-120 -8 -100 -44 -72 -72C-50 -94 -26 -102 4 -104Z",
  bun: "M0 -60C76 -60 132 -30 132 22C132 66 82 94 0 94C-82 94 -132 66 -132 22C-132 -30 -76 -60 0 -60Z",
  squircle: "M0 -100C80 -100 100 -80 100 -2C100 76 80 94 0 94C-80 94 -100 76 -100 -2C-100 -80 -80 -100 0 -100Z",
} as const;

const INK = "#2a2420";
const CREAM = "#fff6e6";
const SAGE_INK = "#fcfcfb";

export type CastName = "you" | "sage" | "friend" | "wobbly" | "bun" | "squircle";
type Face = "ready" | "happy" | "sleepy" | "flat";

// Each round-family character: outline, body and shaded-side colours, and where its face sits (how low, how far apart the eyes)
const LOOKS: Record<Exclude<CastName, "sage">, { shape: keyof typeof SHAPES; body: string; shade: string; dy: number; gap: number; rest: Face; hi: Face }> = {
  you: { shape: "round", body: "#F4A86E", shade: "#D9844C", dy: 0, gap: 24, rest: "ready", hi: "happy" },
  friend: { shape: "egg", body: "#2fb3a4", shade: "#1f8d80", dy: 6, gap: 22, rest: "ready", hi: "happy" },
  wobbly: { shape: "wobbly", body: "#f08cc0", shade: "#d06fa2", dy: 6, gap: 24, rest: "ready", hi: "happy" },
  // Bun is hard to draw out: half asleep at rest, and only opens its eyes when you say hi
  bun: { shape: "bun", body: "#f4b73b", shade: "#d39722", dy: 30, gap: 40, rest: "sleepy", hi: "ready" },
  // Squircle is orderly and direct: a level look at rest, open eyes when you say hi
  squircle: { shape: "squircle", body: "#5b6ee1", shade: "#4352c0", dy: 2, gap: 30, rest: "flat", hi: "ready" },
};

// A face for the round family: two dark eyes and a simple mouth, placed by how low (dy) and how far apart (gap)
function RoundFace({ face, dy, gap }: { face: Face; dy: number; gap: number }) {
  const y = -34 + dy;
  const line = { fill: "none", stroke: INK, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  if (face === "happy")
    return (
      <>
        {/* Smiling eyes, arched */}
        <path {...line} strokeWidth="7.5" d={`M${-gap - 14} ${y + 5}L${-gap} ${y - 9} ${-gap + 14} ${y + 5}M${gap - 14} ${y + 5}L${gap} ${y - 9} ${gap + 14} ${y + 5}`} />
        {/* An open grin */}
        <path fill={INK} d={`M-23 ${y + 22}h46q0 23 -23 23t-23 -23z`} />
      </>
    );
  if (face === "sleepy")
    return (
      <>
        {/* Closed, drooping eyes and a small content smile */}
        <path {...line} strokeWidth="6.5" d={`M${-gap - 11} ${y}q11 8 22 0M${gap - 11} ${y}q11 8 22 0`} />
        <path {...line} strokeWidth="6" d={`M-9 ${y + 24}q9 5 18 0`} />
      </>
    );
  if (face === "flat")
    return (
      <>
        {/* Level eyes that blink, and a small straight smile: not cross, just businesslike */}
        <g className="ch-blink">
          <rect fill={INK} x={-gap - 9} y={y - 4} width="18" height="8" rx="4" />
          <rect fill={INK} x={gap - 9} y={y - 4} width="18" height="8" rx="4" />
        </g>
        <path {...line} strokeWidth="6" d={`M-10 ${y + 26}q10 4 20 0`} />
      </>
    );
  return (
    <>
      {/* Open eyes with a shine, blinking */}
      <g className="ch-blink">
        <ellipse fill={INK} cx={-gap} cy={y} rx="10" ry="14.5" />
        <ellipse fill={INK} cx={gap} cy={y} rx="10" ry="14.5" />
        <circle fill="#fff" cx={-gap + 4} cy={y - 6} r="3.4" />
        <circle fill="#fff" cx={gap + 4} cy={y - 6} r="3.4" />
      </g>
      <path {...line} strokeWidth="7.5" d={`M-15 ${y + 30}q15 13 30 0`} />
    </>
  );
}

// Sage: the round, a little wider and settled, pine green, with its sprout and brows; calm at rest, proud when you say hi
function SageBody({ proud }: { proud: boolean }) {
  const brow = (side: 1 | -1, lift: number) => {
    const cx = side * 24;
    return <path fill="none" stroke={SAGE_INK} strokeWidth="5.5" strokeLinecap="round" d={`M${cx - side * 12} ${-52 - lift}Q${cx} ${-57 - lift} ${cx + side * 12} ${-52 - lift}`} />;
  };
  return (
    <g transform="translate(0 94) scale(1.02 0.95) translate(0 -94)">
      {/* The sprout */}
      <g transform="translate(0 -94)">
        <g className="ch-sway">
          <path fill="none" stroke="#4F8A43" strokeWidth="6" strokeLinecap="round" d="M0 0Q-3 -16 3 -30" />
          <ellipse fill="#5EA34E" cx="16" cy="-38" rx="16" ry="8" transform="rotate(-30 16 -38)" />
          <ellipse fill="#7CC46A" cx="-10" cy="-36" rx="15" ry="8" transform="rotate(28 -10 -36)" />
        </g>
      </g>
      {/* The shaded body, the lit body over it, and the highlight */}
      <path fill="#20432C" d={SHAPES.round} />
      <path fill="#2D5A3D" transform="translate(-9 -8) scale(0.93)" d={SHAPES.round} />
      <ellipse fill={CREAM} opacity="0.28" cx="-60" cy="-64" rx="16" ry="9" transform="rotate(-35 -60 -64)" />
      <g transform="translate(0 8)">
        {proud && (
          <g fill="#F59A86" opacity="0.6">
            <ellipse cx="-46" cy="-6" rx="13" ry="8" />
            <ellipse cx="46" cy="-6" rx="13" ry="8" />
          </g>
        )}
        {brow(-1, proud ? 6 : 0)}
        {brow(1, proud ? 6 : 0)}
        {proud ? (
          <>
            {/* Smiling eyes and a laugh */}
            <path fill="none" stroke={SAGE_INK} strokeWidth="6" strokeLinecap="round" d="M-35 -24Q-24 -38 -13 -24M13 -24Q24 -38 35 -24" />
            <path fill="#10261A" stroke={SAGE_INK} strokeWidth="4.5" d="M-18 -3H18Q16 16 0 16Q-16 16-18 -3Z" />
            <ellipse fill="#EC6A55" cy="11" rx="8" ry="4" />
          </>
        ) : (
          <>
            {/* Calm, slightly lidded eyes and a small smile */}
            <g className="ch-blink">
              <ellipse fill={SAGE_INK} cx="-24" cy="-30" rx="9" ry="12" />
              <ellipse fill={SAGE_INK} cx="24" cy="-30" rx="9" ry="12" />
            </g>
            <path fill="none" stroke={SAGE_INK} strokeWidth="6.5" strokeLinecap="round" d="M-15 -2Q0 9 15 -2" />
          </>
        )}
      </g>
    </g>
  );
}

// One cast member at a size, at rest or saying hi; it breathes slowly and blinks at its own rhythm
export function CastMember({ name, size = 140, hi = false, blink, className = "" }: { name: CastName; size?: number; hi?: boolean; blink?: { every: number; delay: number }; className?: string }) {
  const look = name === "sage" ? null : LOOKS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="-140 -160 280 270"
      aria-hidden="true"
      className={className}
      style={blink ? ({ "--blink-every": `${blink.every}s`, "--blink-delay": `${blink.delay}s` } as CSSProperties) : undefined}
    >
      <g className="ch-breathe">
        {look ? (
          <>
            {/* The shaded body, then the lit body nudged up and left so the shade is a crescent at the lower right */}
            <path fill={look.shade} d={SHAPES[look.shape]} />
            <path fill={look.body} transform="translate(-9 -8) scale(0.93)" d={SHAPES[look.shape]} />
            {/* The highlight, lit from the upper left */}
            <ellipse fill={CREAM} opacity="0.45" cx="-48" cy="-56" rx="18" ry="11" transform="rotate(-35 -48 -56)" />
            {/* The friend's one small non-human detail: a curl on top */}
            {name === "friend" && <path fill="none" stroke={look.shade} strokeWidth="9" strokeLinecap="round" d="M2 -112q-4 -22 14 -26q14 -2 10 12" />}
            <RoundFace face={hi ? look.hi : look.rest} dy={look.dy} gap={look.gap} />
          </>
        ) : (
          <SageBody proud={hi} />
        )}
      </g>
    </svg>
  );
}
