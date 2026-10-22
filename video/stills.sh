#!/bin/sh
# Usage: ./stills.sh CompositionId frame [frame...]  → out/stills/<id>-<frame>.png
id=$1; shift
mkdir -p out/stills
for fr in "$@"; do
  npx remotion still src/index.ts "$id" "out/stills/$id-$fr.png" --frame="$fr" --log=error \
    ${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
done
