// The app's two characters, for a few small moments on the site: the warm blob (the learner, stands in for you) and Sage (the calm coach)
// Drawn from the app's own outline and shading (Table-Topics: src/components/scenes/Scene.tsx and video/src/characters/Sage.tsx), so they are the same characters
// Sage is still a draft in the app; its colours here are the character sheet's

// The blob's one outline, never redrawn: a slightly uneven round, 100 units across its radius
const BLOB =
  "M0 -100C58.8 -100 106 -53.2 106 0C106 50.4 61.6 94 0 94C-58.8 94 -103 53.2 -103 0C-103 -56 -56 -100 0 -100Z";

// Both characters' colours
const C = {
  warm: "#F4A86E",
  warmShade: "#D9844C",
  onWarm: "#1E2320",
  sage: "#2D5A3D",
  sageShade: "#20432C",
  sageInk: "#FCFCFB",
  sageMouth: "#10261A",
  tongue: "#EC6A55",
  leaf: "#7CC46A",
  leafShade: "#5EA34E",
  stem: "#4F8A43",
  cream: "#FFF6E6",
  cheek: "#F59A86",
} as const;

// The blob's faces used on the site: ready (the usual), happy (celebrating) and puzzled ("hmm", never ashamed)
export type BlobFace = "ready" | "happy" | "puzzled" | "sing" | "wow";

// The warm blob at a size, with a face, and optionally hopping or with arms up
export function Blob({
  size = 120,
  face = "ready",
  hop = false,
  arms = false,
  className = "",
}: {
  size?: number;
  face?: BlobFace;
  hop?: boolean;
  arms?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-150 -130 300 240"
      aria-hidden="true"
      className={className}
    >
      <g className={hop ? "ch-hop" : undefined}>
        {/* Arms up, tucked behind the body, the far one in the shade */}
        {arms && (
          <>
            <ellipse
              fill={C.warmShade}
              cx="114"
              cy="-34"
              rx="16"
              ry="27"
              transform="rotate(58 114 -34)"
            />
            <ellipse
              fill={C.warm}
              cx="-114"
              cy="-34"
              rx="16"
              ry="27"
              transform="rotate(-58 -114 -34)"
            />
          </>
        )}
        {/* The shaded body, then the lit body nudged up and left so the shade is a crescent at the lower right */}
        <path fill={C.warmShade} d={BLOB} />
        <path fill={C.warm} transform="translate(-9 -8) scale(0.93)" d={BLOB} />
        {/* The highlight, lit from the upper left */}
        <ellipse
          fill={C.cream}
          opacity="0.5"
          cx="-50"
          cy="-54"
          rx="20"
          ry="12"
          transform="rotate(-35 -50 -54)"
        />
        {/* The face */}
        <g
          fill={C.onWarm}
          stroke={C.onWarm}
          strokeWidth="7.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {face === "ready" && (
            <>
              <ellipse
                className="ch-blink"
                stroke="none"
                cx="-23.8"
                cy="-35.8"
                rx="9.9"
                ry="14.8"
              />
              <ellipse
                className="ch-blink"
                stroke="none"
                cx="23.7"
                cy="-35.8"
                rx="9.9"
                ry="14.8"
              />
              <path fill="none" d="M-15.8 -4.1q15.8 13.9 31.7 0" />
            </>
          )}
          {face === "happy" && (
            <>
              <path
                fill="none"
                d="M-37.6 -29.9l13.9 -13.9 13.9 13.9M9.9 -29.9l13.9 -13.9 13.9 13.9"
              />
              <path
                stroke="none"
                d="M-23.8 -12h47.5q0 23.7-23.7 23.7t-23.8-23.7z"
              />
            </>
          )}
          {/* Singing (talking): arched eyes and an open round mouth, as the app's "sing" face */}
          {face === "sing" && (
            <g transform="translate(-47.5 -55.6) scale(1.979)" strokeWidth="4">
              <path fill="none" d="M5 13l7-7 7 7M29 13l7-7 7 7" />
              <ellipse className="ch-talk" stroke="none" cx="24" cy="27" rx="7" ry="7" />
            </g>
          )}
          {/* Surprised: round eyes and a round mouth, as the app's "wow" face */}
          {face === "wow" && (
            <g transform="translate(-47.5 -55.6) scale(1.979)" stroke="none">
              <circle className="ch-blink" cx="12" cy="9" r="6" />
              <circle className="ch-blink" cx="36" cy="9" r="6" />
              <ellipse cx="24" cy="28" rx="4.5" ry="5.5" />
            </g>
          )}
          {face === "puzzled" && (
            <>
              {/* One brow up, the eyes glancing aside, a wavy "hmm" mouth */}
              <path fill="none" strokeWidth="6" d="M12 -66q12 -8 24 -2" />
              <ellipse
                className="ch-blink"
                stroke="none"
                cx="-16"
                cy="-35.8"
                rx="9.9"
                ry="13.5"
              />
              <ellipse
                className="ch-blink"
                stroke="none"
                cx="30"
                cy="-35.8"
                rx="9.9"
                ry="13.5"
              />
              <path fill="none" d="M-12 -2q6 -6 12 0t12 0" />
            </>
          )}
        </g>
      </g>
    </svg>
  );
}

// Sage's faces used on the site: calm (the usual), proud (a good try), curious ("tell me more")
export type SageFace = "calm" | "proud" | "curious";

// Sage at a size, with a face: settled and slow, a breath every five seconds, the sprout swaying a beat behind
export function Sage({
  size = 130,
  face = "calm",
  wave = false,
  className = "",
}: {
  size?: number;
  face?: SageFace;
  wave?: boolean;
  className?: string;
}) {
  // Each brow's lift and tilt, by face
  const brows: Record<SageFace, [number, number][]> = {
    calm: [
      [0, 0],
      [0, 0],
    ],
    proud: [
      [6, 0],
      [6, 0],
    ],
    curious: [
      [0, 0],
      [12, -4],
    ],
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="-130 -170 260 290"
      aria-hidden="true"
      className={className}
    >
      {/* Settled: a little wider and lower than the blob, breathing from its base */}
      <g className="ch-breathe">
        <g transform="translate(0 94) scale(1.02 0.95) translate(0 -94)">
          {/* The arms, tucked behind; one lifts in a small wave */}
          <g
            className={wave ? "ch-wave" : undefined}
            style={{ transformOrigin: "-92px -34px" }}
          >
            {/* Raised beside the head to wave, or resting at its side */}
            {wave ? (
              <ellipse fill={C.sage} cx="-114" cy="-62" rx="17" ry="28" transform="rotate(-38 -114 -62)" />
            ) : (
              <ellipse fill={C.sage} cx="-104" cy="26" rx="17" ry="28" transform="rotate(6 -82 -6)" />
            )}
          </g>
          <ellipse
            fill={C.sageShade}
            cx="104"
            cy="26"
            rx="17"
            ry="28"
            transform="rotate(-6 82 -6)"
          />
          {/* The sprout, swaying a beat behind */}
          <g transform="translate(0 -94)">
            <g className="ch-sway">
              <path
                fill="none"
                stroke={C.stem}
                strokeWidth="6"
                strokeLinecap="round"
                d="M0 0Q-3 -16 3 -30"
              />
              <ellipse
                fill={C.leafShade}
                cx="16"
                cy="-38"
                rx="16"
                ry="8"
                transform="rotate(-30 16 -38)"
              />
              <ellipse
                fill={C.leaf}
                cx="-10"
                cy="-36"
                rx="15"
                ry="8"
                transform="rotate(28 -10 -36)"
              />
            </g>
          </g>
          {/* The shaded body and the lit body */}
          <path fill={C.sageShade} d={BLOB} />
          <path
            fill={C.sage}
            transform="translate(-9 -8) scale(0.93)"
            d={BLOB}
          />
          {/* The highlight, a little smaller and higher than the blob's */}
          <ellipse
            fill={C.cream}
            opacity="0.28"
            cx="-60"
            cy="-64"
            rx="16"
            ry="9"
            transform="rotate(-35 -60 -64)"
          />
          {/* The face */}
          <g
            transform="translate(0 8)"
            fill={C.sageInk}
            stroke={C.sageInk}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Cheeks when pleased */}
            {face === "proud" && (
              <g fill={C.cheek} stroke="none" opacity="0.6">
                <ellipse cx="-46" cy="-6" rx="13" ry="8" />
                <ellipse cx="46" cy="-6" rx="13" ry="8" />
              </g>
            )}
            {/* The brows: short, soft strokes that carry the expression */}
            {([-24, 24] as const).map((cx, i) => {
              const [lift, inner] = brows[face][i] ?? [0, 0];
              const side = i === 0 ? -1 : 1;
              return (
                <path
                  key={cx}
                  fill="none"
                  strokeWidth="5.5"
                  d={`M${cx - side * 12} ${-52 - lift - inner}Q${cx} ${-57 - lift} ${cx + side * 12} ${-52 - lift + inner * 0.3}`}
                />
              );
            })}
            {/* The eyes */}
            {face === "proud" ? (
              <path
                fill="none"
                strokeWidth="6"
                d="M-35 -24Q-24 -38 -13 -24M13 -24Q24 -38 35 -24"
              />
            ) : (
              <>
                <ellipse
                  className="ch-blink"
                  stroke="none"
                  cx={face === "curious" ? -19 : -24}
                  cy="-30"
                  rx="9"
                  ry="12"
                />
                <ellipse
                  className="ch-blink"
                  stroke="none"
                  cx={face === "curious" ? 29 : 24}
                  cy="-30"
                  rx="9"
                  ry="12"
                />
              </>
            )}
            {/* The mouth */}
            {face === "calm" && (
              <path fill="none" strokeWidth="6.5" d="M-15 -2Q0 9 15 -2" />
            )}
            {face === "proud" && (
              <g>
                <path
                  fill={C.sageMouth}
                  strokeWidth="4.5"
                  d="M-18 -3H18Q16 16 0 16Q-16 16-18 -3Z"
                />
                <ellipse
                  fill={C.tongue}
                  stroke="none"
                  cx="0"
                  cy="11"
                  rx="8"
                  ry="4"
                />
              </g>
            )}
            {face === "curious" && (
              <ellipse stroke="none" cx="3" cy="4" rx="6" ry="7" />
            )}
          </g>
        </g>
      </g>
    </svg>
  );
}
