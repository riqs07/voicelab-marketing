#!/bin/sh
# Render every template in every format to out/videos/. Usage: ./render-all.sh [name filter]
set -e
# Optional: REMOTION_BROWSER=/path/to/chrome to use a browser you already have; otherwise Remotion downloads one.
mkdir -p out/videos
for id in StandUp-story StandUp-feed DrawnLive-story DrawnLive-feed UmRain-story UmRain-feed Rally-story Rally-feed TalkBack-story TalkBack-feed Overview-story Overview-feed SoundCheck-story SoundCheck-feed StressShift-story StressShift-feed TalkShare-story TalkShare-feed \
          PausePower-story PausePower-feed Demo-wide Demo-story DemoLoop-wide; do
  case "$id" in *"$1"*) ;; *) continue ;; esac
  extra=""
  case "$id" in DemoLoop*) extra="--muted" ;; esac
  echo "Rendering $id"
  npx remotion render src/index.ts "$id" "out/videos/$id.mp4" --codec=h264 --crf=20 --audio-codec=aac --pixel-format=yuv420p \
    --concurrency=4 --log=error $extra ${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
done
