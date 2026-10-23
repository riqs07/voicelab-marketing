#!/bin/sh
# Render an Instagram carousel (4:5 PNGs) for each Learn card given, into ../renders/carousels/<card>/.
# Copy the card from the app first: node scripts/learn-card.mjs /path/to/Table-Topics <card-id>
# Usage: ./carousel.sh nerves-um [another-card ...]
set -e
for card in "$@"; do
  count=$(node -e "const c=require('./src/content/learnCards.json')['$card']; if(!c){console.error('Copy $card first: node scripts/learn-card.mjs /path/to/Table-Topics $card'); process.exit(1)} console.log(c.verdict ? 6 : 5)")
  mkdir -p "../renders/carousels/$card"
  for n in $(seq 1 "$count"); do
    npx remotion still src/index.ts Carousel "../renders/carousels/$card/$n.png" --props="{\"card\":\"$card\",\"slide\":$n}" --log=error \
      ${REMOTION_BROWSER:+--browser-executable=$REMOTION_BROWSER}
    echo "Rendered $card slide $n of $count"
  done
done
