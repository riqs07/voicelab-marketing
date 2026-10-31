"use client";
// The hero picture: one of a few of the app's course tiles, picked afresh on each visit, drawn large from the app's own
// tiles and recoloured in the site's own colours (".hero-brand" in globals.css) so it sits with the page. It pops in
// when the page opens and floats gently; the tile keeps its own loops. Still for people who ask for less motion.
import { motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";
import { HERO_TILES, Tile } from "./Tile";

// What each picture shows, for screen readers
const LABELS: Record<(typeof HERO_TILES)[number], string> = {
  "speech-run": "The blob at a lectern, giving a speech with everything, sound rings spreading out",
  "beyond-good-you": "The blob and a friend chatting, their speech bubbles popping up in turn",
  "stories-that-land": "The blob telling a story from an open storybook, a moon and stars rising from its pages",
  "the-run": "The blob running toward a finish flag in a headband, speed lines streaking past",
};

// Picked once per visit in the browser; the server (and the first paint) has none, so the picture pops in once chosen
const PICK = typeof window === "undefined" ? 0 : Math.floor(Math.random() * HERO_TILES.length);
const subscribe = () => () => undefined;

export function HeroTile() {
  const still = useReducedMotion();
  const pick = useSyncExternalStore(subscribe, () => PICK, () => null);
  const name = pick === null ? null : HERO_TILES[pick];
  return (
    <div className="mx-auto aspect-square w-full max-w-[34rem]">
      {name ? (
        <motion.div
          initial={still ? false : { opacity: 0, scale: 0.86, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 170, damping: 13, delay: 0.15 }}
        >
          <div className="run-float hero-brand" role="img" aria-label={LABELS[name]}>
            <Tile name={name} className="drop-shadow-[0_18px_30px_rgba(30,38,32,0.14)]" />
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
