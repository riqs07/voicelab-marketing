"use client";
// Pieces shared by the free Rapid Fire and Read aloud: the timer ring, the live loudness meter, the take's words placed
// by pitch (tap one to hear it), and the take's pitch as one line.
import { textLift, type Phrase, type PitchWords } from "@/core/pitchPhrases";
import { isHesitationSound } from "@/core/fillers";

const ENDING = {
  rose: { mark: "↗", label: "rose", className: "text-orange" },
  fell: { mark: "↘", label: "fell", className: "text-accent" },
  held: { mark: "→", label: "held", className: "text-muted" },
} as const;

export function Ring({ fraction, colour, size = 72, children }: { fraction: number; colour: string; size?: number; children?: React.ReactNode }) {
  const r = size / 2 - 7;
  const around = 2 * Math.PI * r;
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true" className="absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E4EDE6" strokeWidth="8" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colour} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${Math.max(0, Math.min(1, fraction)) * around} ${around}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <span className="relative font-bold tabular-nums">{children}</span>
    </div>
  );
}

// A small live loudness meter, so people can see the page hearing them
export function Meter({ level }: { level: number }) {
  const bars = [0.25, 0.5, 0.75, 1, 0.75, 0.5, 0.25];
  return (
    <div className="flex h-8 items-center gap-1" aria-hidden="true">
      {bars.map((shape, i) => (
        <span key={i} className="w-1.5 rounded-full bg-accent transition-[height] duration-100" style={{ height: `${Math.max(12, Math.min(100, level * 600 * shape))}%` }} />
      ))}
    </div>
  );
}

// Each word sits a little higher or lower with the voice; bold words were the peaks; grey words are pause words.
// Arrows show how each phrase ended. Tapping a word plays the recording from there.
export function WordsView({ pitch, onPlay }: { pitch: PitchWords; onPlay: (seconds: number) => void }) {
  return (
    <p className="m-0 flex flex-col gap-1 text-base sm:text-lg" style={{ lineHeight: 2.6 }}>
      {pitch.phrases.map((phrase: Phrase) => (
        // One phrase per line, as in the app's phrase rows
        <span key={phrase.index} className="block">
          {phrase.pauseBefore !== null && phrase.pauseBefore >= 0.6 ? (
            <span className="mr-2 inline-block rounded-full bg-tint px-2 align-middle text-sm font-bold leading-6 text-accent">{phrase.pauseBefore.toFixed(1)} s pause</span>
          ) : null}
          {phrase.words.map((word, i) => {
            const filler = isHesitationSound(word.w);
            const last = i === phrase.words.length - 1;
            const ending = last && phrase.ending ? ENDING[phrase.ending] : null;
            return (
              <span key={`${phrase.index}-${i}`} className="whitespace-nowrap">
                <button
                  type="button"
                  onClick={() => onPlay(word.start)}
                  aria-label={`${word.text}, play from here`}
                  className={`inline-block rounded-md px-0.5 transition-colors hover:bg-tint ${filler ? "italic text-grey underline decoration-usual decoration-dotted decoration-2" : ""} ${word.peak ? "font-bold text-accent" : ""} ${!phrase.flat || filler ? "" : "text-muted"}`}
                  style={{ transform: `translateY(${textLift(word.step)}px)` }}
                >
                  {word.text}
                </button>
                {ending ? (
                  <span className={`ml-0.5 font-bold ${ending.className}`} title={`Ending ${ending.label}`} aria-label={`ending ${ending.label}`}>
                    {ending.mark}
                  </span>
                ) : null}{" "}
              </span>
            );
          })}
        </span>
      ))}
    </p>
  );
}

// The whole take's pitch as one line across, with the last try's line dashed underneath
export function TakeLine({ pitch, last }: { pitch: PitchWords; last: PitchWords | null }) {
  const W = 600;
  const H = 120;
  const path = (p: PitchWords) => {
    const n = Math.max(1, p.curve.length - 1);
    let d = "";
    let open = false;
    p.curve.forEach((v, i) => {
      if (v === null) {
        open = false;
        return;
      }
      const x = (i / n) * W;
      const y = H / 2 - Math.max(-12, Math.min(12, v)) * 4.2;
      d += `${open ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)} `;
      open = true;
    });
    return d;
  };
  return (
    <figure className="m-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={last ? "Your pitch across this try, with the last try dashed underneath" : "Your pitch across the whole take"}>
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke="#B9C4BB" strokeWidth="1.5" strokeDasharray="7 6" />
        {last ? <path d={path(last)} stroke="#8C978F" strokeWidth="2.5" fill="none" strokeDasharray="9 7" strokeLinecap="round" /> : null}
        <path d={path(pitch)} stroke="#2E5B3E" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <figcaption className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span>Dashed line: your usual pitch</span>
        {last ? <span>Grey dashes: last try</span> : null}
      </figcaption>
    </figure>
  );
}
