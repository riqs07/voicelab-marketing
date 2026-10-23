// Reel covers (1080 x 1920): a title plus one frozen frame of the video itself, in a card.
// Everything that matters sits in the middle 1080 x 1440, which is what the Instagram profile grid shows.
import React from 'react';
import {AbsoluteFill, Freeze} from 'remotion';
import {CaptionsOff, LogoMark} from './kit/parts';
import {C, sans, serif} from './kit/theme';
import {DrawnLive} from './templates/DrawnLive';
import {PausePower} from './templates/PausePower';
import {Rally} from './templates/Rally';
import {TalkBack} from './templates/TalkBack';
import {SoundCheck} from './templates/SoundCheck';
import {StressShift} from './templates/StressShift';
import {TalkShare} from './templates/TalkShare';
import {UmRain} from './templates/UmRain';

// Each cover: the video, the frame to freeze (30 per second) and its title. Change titles here.
export const COVERS = [
  {id: 'DrawnLive', component: DrawnLive, frame: 262, title: 'Your voice, drawn live'},
  {id: 'UmRain', component: UmRain, frame: 388, title: 'How many times do you say um?'},
  {id: 'Rally', component: Rally, frame: 340, title: 'Who’s hogging the conversation?'},
  {id: 'SoundCheck', component: SoundCheck, frame: 300, title: 'Why you sound unsure'},
  {id: 'StressShift', component: StressShift, frame: 460, title: 'One sentence. Five meanings.'},
  {id: 'TalkShare', component: TalkShare, frame: 380, title: 'Good listener, or waiting to talk?'},
  {id: 'PausePower', component: PausePower, frame: 430, title: 'The most confident sound? Silence.'},
  {id: 'TalkBack', component: TalkBack, frame: 1372, title: 'They react to how you talk'},
] as const;

const SCALE = 0.56;

export const Cover: React.FC<{index: number}> = ({index}) => {
  const c = COVERS[index];
  const Video = c.component as React.FC<{voiced?: boolean}>;
  return (
    <AbsoluteFill style={{background: C.bg, fontFamily: sans, color: C.ink}}>
      <div style={{position: 'absolute', top: 270, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 22}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
          <LogoMark size={56} />
          <span style={{fontFamily: serif, fontWeight: 600, fontSize: 40}}>VoiceLab</span>
        </div>
        <h1 style={{margin: 0, fontFamily: serif, fontWeight: 600, fontSize: 92, lineHeight: 1.04, letterSpacing: '-0.015em'}}>{c.title}</h1>
      </div>
      <div
        style={{
          position: 'absolute',
          left: (1080 - 1080 * SCALE) / 2,
          top: 640,
          width: 1080 * SCALE,
          height: 1920 * SCALE * 0.94,
          borderRadius: 44,
          overflow: 'hidden',
          boxShadow: '0 24px 50px rgba(30,38,32,0.16), 0 4px 10px rgba(30,38,32,0.08)',
          background: C.bg,
        }}
      >
        <div style={{position: 'relative', width: 1080, height: 1920, transform: `scale(${SCALE})`, transformOrigin: 'top left', marginTop: -60}}>
          <CaptionsOff.Provider value>
            <Freeze frame={c.frame}>
              <Video voiced />
            </Freeze>
          </CaptionsOff.Provider>
        </div>
      </div>
    </AbsoluteFill>
  );
};
