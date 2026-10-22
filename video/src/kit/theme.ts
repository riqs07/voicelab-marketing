// Shared look for every VoiceLab video: colours (matching the app), fonts and easing.
import {cancelRender, continueRender, delayRender, Easing, interpolate, staticFile} from 'remotion';

export const serif = 'Fraunces';
export const sans = 'Atkinson Hyperlegible Next';

// Fonts are self-hosted in public/fonts (SIL OFL), so renders never depend on the network.
const fontHandle = delayRender('Loading local fonts');
Promise.all(
  [
    new FontFace(serif, `url(${staticFile('fonts/Fraunces-latin.woff2')}) format('woff2')`, {weight: '100 900'}),
    new FontFace(sans, `url(${staticFile('fonts/AtkinsonHyperlegibleNext-latin.woff2')}) format('woff2')`, {
      weight: '200 800',
    }),
  ].map((ff) => ff.load().then((loaded) => document.fonts.add(loaded))),
)
  .then(() => continueRender(fontHandle))
  .catch((err) => cancelRender(err));

// The app's palette.
export const C = {
  bg: '#FBF6EE',
  card: '#FFFFFF',
  ink: '#1E2620',
  muted: '#59645C',
  green: '#2E5B3E',
  greenTint: '#E4EDE6',
  orange: '#C26A2C',
  warm: '#F4A86E',
  peach: '#FCE3CF',
  peachInk: '#7A3A10',
  usual: '#B9C4BB',
  grey: '#8C978F',
  lane: '#C9D0CA',
};

export const FPS = 30;
export const fr = (s: number) => Math.round(s * FPS);

export const ease = Easing.bezier(0.45, 0, 0.55, 1);
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// 0 → 1 over durF frames starting at startS seconds.
export const fadeIn = (f: number, startS: number, durF = 14) =>
  interpolate(f, [fr(startS), fr(startS) + durF], [0, 1], {...clamp, easing: ease});
// 1 → 0 ending at endS seconds.
export const fadeOutAt = (f: number, endS: number, durF = 10) =>
  1 - interpolate(f, [fr(endS) - durF, fr(endS)], [0, 1], {...clamp, easing: ease});
// Slide up into place as p goes 0 → 1.
export const rise = (p: number, px = 24) => `translateY(${(1 - p) * px}px)`;
// Linear progress through a window, clamped.
export const progress = (f: number, startS: number, endS: number) =>
  interpolate(f, [fr(startS), Math.max(fr(startS) + 1, fr(endS))], [0, 1], clamp);

export const gentle = {damping: 200, stiffness: 120, mass: 0.8};
