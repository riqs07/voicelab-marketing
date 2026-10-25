import React from 'react';
import {Composition} from 'remotion';
import {Cover, COVERS} from './Covers';
import {VoicelabPitch} from './VoicelabPitch';
import {DURATION_IN_FRAMES, VoicelabPitchVoiced} from './VoicelabPitchVoiced';
import {FPS} from './kit/theme';
import type {Timeline} from './kit/timeline';
import {UmRain, umRainTimeline} from './templates/UmRain';
import {Rally, rallyTimeline} from './templates/Rally';
import {TalkBack, talkBackTimeline} from './templates/TalkBack';
import {Overview, overviewTimeline} from './templates/Overview';
import {Carousel} from './templates/Carousel';
import {Logo} from './Logo';
import {DrawnLive, drawnLiveTimeline} from './templates/DrawnLive';
import {Demo, demoLoopFrames, demoTimeline} from './templates/Demo';
import {PausePower, pausePowerTimeline} from './templates/PausePower';
import {SoundCheck, soundCheckTimeline} from './templates/SoundCheck';
import {StressShift, stressShiftTimeline} from './templates/StressShift';
import {TalkShare, talkShareTimeline} from './templates/TalkShare';
import {StandUp, standUpTimeline} from './templates/StandUp';
import {OneQuestion, oneQuestionTimeline} from './templates/OneQuestion';

const SIZES = {
  story: {width: 1080, height: 1920}, // 9:16 TikTok, Reels, Shorts
  feed: {width: 1080, height: 1350}, // 4:5 Instagram and LinkedIn feed
  wide: {width: 1920, height: 1080}, // 16:9 website, YouTube
} as const;

type Size = keyof typeof SIZES;

// One composition per format; length comes from the timeline (estimated or voiced).
const Template = ({
  id,
  component,
  timeline,
  sizes = ['story', 'feed'],
}: {
  id: string;
  component: React.FC<{voiced?: boolean}>;
  timeline: (voiced?: boolean) => Timeline;
  sizes?: Size[];
}) => (
  <>
    {sizes.map((s) => (
      <React.Fragment key={s}>
      <Composition
        id={`${id}-${s}`}
        component={component}
        durationInFrames={timeline(true).frames}
        fps={FPS}
        {...SIZES[s]}
        defaultProps={{voiced: true}}
      />
      </React.Fragment>
    ))}
  </>
);

export const RemotionRoot: React.FC = () => (
  <>
    {Template({id: 'SoundCheck', component: SoundCheck, timeline: soundCheckTimeline})}
    {Template({id: 'StressShift', component: StressShift, timeline: stressShiftTimeline})}
    {Template({id: 'TalkShare', component: TalkShare, timeline: talkShareTimeline})}
    {Template({id: 'PausePower', component: PausePower, timeline: pausePowerTimeline})}
    {Template({id: 'DrawnLive', component: DrawnLive, timeline: drawnLiveTimeline})}
    {Template({id: 'Rally', component: Rally, timeline: rallyTimeline})}
    {Template({id: 'TalkBack', component: TalkBack, timeline: talkBackTimeline})}
    {Template({id: 'Overview', component: Overview, timeline: overviewTimeline})}
    {Template({id: 'StandUp', component: StandUp, timeline: standUpTimeline})}
    {Template({id: 'OneQuestion', component: OneQuestion, timeline: oneQuestionTimeline})}
    {Template({id: 'UmRain', component: UmRain, timeline: umRainTimeline})}
    {Template({id: 'Demo', component: Demo, timeline: demoTimeline, sizes: ['wide', 'story']})}
    <Composition id="DemoLoop-wide" component={Demo} durationInFrames={demoLoopFrames()} fps={FPS} {...SIZES.wide} defaultProps={{voiced: false, loop: true}} />
    {COVERS.map((c, i) => (
      // Long enough that the frozen video frame isn't clamped; covers are snapshots of frame 0.
      <Composition key={c.id} id={`Cover-${c.id}`} component={Cover} durationInFrames={2400} fps={FPS} width={1080} height={1920} defaultProps={{index: i}} />
    ))}
    {/* Instagram carousel slides from the app's Learn cards: render with --props='{"card":"nerves-um","slide":1}' (see carousel.sh) */}
    <Composition id="Carousel" component={Carousel} durationInFrames={1} fps={FPS} width={1080} height={1350} defaultProps={{card: 'nerves-um', slide: 1}} />
    {/* The logo as still images (rendered into ../renders/brand/) */}
    <Composition id="Logo-icon" component={Logo} durationInFrames={1} fps={FPS} width={1024} height={1024} defaultProps={{variant: 'icon' as const}} />
    <Composition id="Logo-avatar" component={Logo} durationInFrames={1} fps={FPS} width={1080} height={1080} defaultProps={{variant: 'avatar' as const}} />
    <Composition id="Logo-wordmark" component={Logo} durationInFrames={1} fps={FPS} width={2000} height={600} defaultProps={{variant: 'wordmark' as const}} />
    <Composition id="Logo-wordmark-paper" component={Logo} durationInFrames={1} fps={FPS} width={2000} height={600} defaultProps={{variant: 'wordmark-paper' as const}} />
    <Composition id="VoicelabPitch" component={VoicelabPitch} durationInFrames={450} fps={30} width={1080} height={1920} />
    <Composition id="VoicelabPitchVoiced" component={VoicelabPitchVoiced} durationInFrames={DURATION_IN_FRAMES} fps={30} width={1080} height={1920} />
  </>
);
