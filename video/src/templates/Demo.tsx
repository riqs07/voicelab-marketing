// Demo walkthrough: the real app's screens in a phone, a headline per narrator line, zooms and taps.
// Wide (website, 16:9): phone left, headline right. Story (9:16): headline above the phone.
// `loop`: no voice and no end card, for the silent loop at the top of the home page.
import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {demo as K, type DemoShot} from '../content/demo';
import shotsJson from '../../public/demo/shots.json';
import {AudioTrack, EndCard, Label, LogoMark, Stage, useLayout} from '../kit/parts';
import {C, clamp, ease, fadeIn, fadeOutAt, fr, rise, serif} from '../kit/theme';
import {beat, buildTimeline} from '../kit/timeline';

type Box = {x: number; y: number; w: number; h: number};
const shots = shotsJson as Record<string, {file: string; boxes: Record<string, Box>}>;
const SCREEN = {w: 390, h: 844};

export const demoTimeline = (voiced = true) => buildTimeline(K.video, [...K.beats], voiced);
export const demoLoopFrames = () => {
  const tl = demoTimeline(false);
  return fr(beat(tl, 'close').start);
};

type Placed = DemoShot & {start: number; end: number; beatStart: number; beatEnd: number};

// Every shot with its time on screen (seconds). A line's shots share the line and the pause after it.
const placeShots = (tl: ReturnType<typeof demoTimeline>): Placed[] => {
  const ids = Object.keys(K.scenes);
  const out: Placed[] = [];
  ids.forEach((id, i) => {
    const b = beat(tl, id);
    const nextStart = i + 1 < ids.length ? beat(tl, ids[i + 1]).start : beat(tl, 'close').start;
    const span = nextStart - b.start;
    const list = K.scenes[id];
    list.forEach((s, j) => {
      const start = j === 0 ? (i === 0 ? 0 : b.start - 0.15) : b.start + span * (s.from ?? 0);
      const nx = list[j + 1];
      const end = nx ? b.start + span * (nx.from ?? 0) : nextStart - 0.15;
      out.push({...s, start, end, beatStart: b.start, beatEnd: nextStart});
    });
  });
  return out;
};

// One screenshot inside the phone's screen, with its zoom, ring and tap.
const Screen: React.FC<{s: Placed; k: number; beatStart: number; beatEnd: number}> = ({s, k, beatStart, beatEnd}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const data = shots[s.shot];
  const at = (frac: number) => beatStart + (beatEnd - beatStart) * frac;
  const z = s.zoom ? data.boxes[s.zoom.box] : null;
  const zp = s.zoom ? interpolate(f, [fr(at(s.zoom.at ?? 0)), fr(at(s.zoom.at ?? 0)) + 22], [0, 1], {...clamp, easing: ease}) : 0;
  const scale = 1 + ((s.zoom?.scale ?? 1) - 1) * zp;
  // Zoom towards the box's centre, kept inside the screen.
  const cx = z ? z.x + z.w / 2 : SCREEN.w / 2;
  const cy = z ? z.y + z.h / 2 : SCREEN.h / 2;
  // Translating by (centre - point) x (scale - 1) keeps the point still while all else grows round it.
  const tx = (SCREEN.w / 2 - cx) * (scale - 1);
  const ty = (SCREEN.h / 2 - cy) * (scale - 1);
  const maxX = (SCREEN.w * (scale - 1)) / 2;
  const maxY = (SCREEN.h * (scale - 1)) / 2;
  const ox = Math.max(-maxX, Math.min(maxX, tx));
  const oy = Math.max(-maxY, Math.min(maxY, ty));

  const ring = s.ring ? data.boxes[s.ring.box] : null;
  const ringP = s.ring ? spring({frame: f - fr(at(s.ring.at)), fps, config: {damping: 14, stiffness: 120}}) : 0;
  const tap = s.tap ? data.boxes[s.tap.box] : null;
  const tapF = s.tap ? f - fr(at(s.tap.at)) : -1;
  const fingerIn = interpolate(tapF, [-12, -2], [0, 1], clamp);
  const ripple = interpolate(tapF, [0, 16], [0, 1], clamp);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          width: SCREEN.w * k,
          height: SCREEN.h * k,
          transform: `translate(${ox * k}px, ${oy * k}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <Img src={staticFile(data.file)} style={{width: '100%', height: '100%', display: 'block'}} />
        {ring ? (
          <div
            style={{
              position: 'absolute',
              // Round the word before the arrow and the arrow itself
              left: (ring.x - 30) * k,
              top: (ring.y + ring.h / 2 - 19) * k,
              width: (ring.w + 38) * k,
              height: 38 * k,
              borderRadius: 999,
              border: `${3 * k}px solid ${C.orange}`,
              opacity: Math.min(1, ringP),
              transform: `scale(${0.5 + 0.5 * ringP})`,
            }}
          />
        ) : null}
        {tap && tapF > -14 ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: (tap.x + tap.w / 2) * k - 22 * k,
                top: (tap.y + tap.h / 2) * k - 22 * k,
                width: 44 * k,
                height: 44 * k,
                borderRadius: 999,
                background: 'rgba(30,38,32,0.28)',
                border: `${2 * k}px solid rgba(255,255,255,0.9)`,
                opacity: fingerIn * (1 - ripple),
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: (tap.x + tap.w / 2) * k - 40 * k,
                top: (tap.y + tap.h / 2) * k - 40 * k,
                width: 80 * k,
                height: 80 * k,
                borderRadius: 999,
                border: `${3 * k}px solid ${C.green}`,
                opacity: ripple > 0 ? 1 - ripple : 0,
                transform: `scale(${0.4 + 0.8 * ripple})`,
              }}
            />
          </>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const Phone: React.FC<{k: number; children: React.ReactNode}> = ({k, children}) => {
  const bezel = 11 * k;
  return (
    <div
      style={{
        width: SCREEN.w * k + 2 * bezel,
        height: SCREEN.h * k + 2 * bezel,
        borderRadius: 58 * k,
        background: '#1E2620',
        padding: bezel,
        boxShadow: '0 30px 60px rgba(30,38,32,0.18), 0 6px 14px rgba(30,38,32,0.12)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: SCREEN.w * k,
          height: SCREEN.h * k,
          borderRadius: 48 * k,
          overflow: 'hidden',
          background: C.bg,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Demo: React.FC<{voiced?: boolean; loop?: boolean}> = ({voiced = true, loop = false}) => {
  const f = useCurrentFrame();
  const L = useLayout();
  const tl = demoTimeline(voiced && !loop);
  const t = f / 30;
  const close = beat(tl, 'close');
  const endAt = close.start + K.endCardDelay;
  const placed = placeShots(tl);
  const ids = Object.keys(K.scenes);
  const wide = L.format === 'wide';

  // The phone's size: tall in story, left half in wide.
  const k = wide ? 960 / SCREEN.h : 1440 / SCREEN.h;
  const phoneW = SCREEN.w * k + 22 * k;
  const out = loop ? 1 : fadeOutAt(f, endAt, 10);
  // In the loop, the last shot fades back into the first.
  const loopFade = loop ? fadeIn(f, endAt - 0.5, 15) : 0;

  // The current narrator line, for the headline.
  const lineIdx = Math.max(0, ids.findLastIndex((id) => t >= beat(tl, id).start - 0.2));
  const line = beat(tl, ids[lineIdx]);

  return (
    <Stage>
      {loop ? null : <AudioTrack tl={tl} />}
      {f < fr(endAt) + 1 ? (
        <AbsoluteFill style={{opacity: out}}>
          <div
            style={{
              position: 'absolute',
              left: wide ? 250 : (L.width - phoneW) / 2,
              top: wide ? (L.height - (SCREEN.h * k + 22 * k)) / 2 : 400,
            }}
          >
            <Phone k={k}>
              {placed.map((s, i) => {
                const vis =
                  interpolate(f, [fr(s.start) - 4, fr(s.start) + 4], [0, 1], clamp) *
                  interpolate(f, [fr(s.end) - 4, fr(s.end) + 4], [1, 0], clamp);
                if (vis <= 0 && !(i === 0 && loopFade > 0)) return null;
                return (
                  <AbsoluteFill key={s.shot} style={{opacity: i === 0 ? Math.max(vis, loopFade) : vis}}>
                    <Screen s={s} k={k} beatStart={s.beatStart} beatEnd={s.beatEnd} />
                  </AbsoluteFill>
                );
              })}
            </Phone>
          </div>
          <Headline
            key={line.id}
            text={line.caption ?? line.text}
            step={lineIdx + 1}
            steps={ids.length}
            start={line.start - 0.2}
            wide={wide}
            s={L.s}
            width={L.width}
          />
        </AbsoluteFill>
      ) : null}
      {!loop && f >= fr(endAt) - 1 ? <EndCard at={endAt} /> : null}
    </Stage>
  );
};

const Headline: React.FC<{text: string; step: number; steps: number; start: number; wide: boolean; s: number; width: number}> = ({
  text,
  step,
  steps,
  start,
  wide,
  width,
}) => {
  const f = useCurrentFrame();
  const p = fadeIn(f, start, 12);
  return (
    <div
      style={{
        position: 'absolute',
        left: wide ? 880 : 80,
        right: wide ? 140 : 80,
        top: wide ? 330 : 110,
        opacity: p,
        transform: rise(p, 18),
      }}
    >
      {wide ? (
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 34}}>
          <LogoMark size={56} />
          <Label style={{fontSize: 34}}>
            {step} of {steps}
          </Label>
        </div>
      ) : null}
      <h2
        style={{
          margin: 0,
          fontFamily: serif,
          fontWeight: 600,
          fontSize: wide ? 84 : Math.min(76, width / 13),
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          color: C.ink,
          textAlign: wide ? 'left' : 'center',
        }}
      >
        {text}
      </h2>
    </div>
  );
};
