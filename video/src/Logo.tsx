// The VoiceLab logo as still images: the icon alone (transparent), a profile picture (icon centred on paper,
// safe for a circular crop), and the icon with the name beside it (transparent or on paper).
// Render with: npx remotion still src/index.ts Logo-icon out.png --frame=0   (see ../renders/brand/)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, serif} from './kit/theme';

// The mark: a green rounded square with the white voice wave, the same drawing as LogoMark in kit/parts
const Mark: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden>
    <rect width={34} height={34} rx={9} fill={C.green} />
    <path d="M6 22 C 11 22, 12 12, 17 12 C 22 12, 23 20, 28 15" stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinecap="round" />
  </svg>
);

export type LogoVariant = 'icon' | 'avatar' | 'wordmark' | 'wordmark-paper';

export const Logo: React.FC<{variant: LogoVariant}> = ({variant}) => {
  if (variant === 'icon')
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <Mark size={1024} />
      </AbsoluteFill>
    );
  if (variant === 'avatar')
    return (
      // Instagram crops profile pictures to a circle, so the mark sits well inside it
      <AbsoluteFill style={{background: C.bg, alignItems: 'center', justifyContent: 'center'}}>
        <Mark size={640} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{background: variant === 'wordmark-paper' ? C.bg : undefined, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 64}}>
        <Mark size={360} />
        <span style={{fontFamily: serif, fontWeight: 600, fontSize: 300, letterSpacing: '-0.02em', color: C.ink, lineHeight: 1}}>VoiceLab</span>
      </div>
    </AbsoluteFill>
  );
};
