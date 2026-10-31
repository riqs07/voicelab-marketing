"use client";
// The hero picture: "The run" from the app's Voice: lean in course, the blob at a lectern giving a speech with
// everything, drawn large from the app's own tile. It pops in when the page opens and floats gently; the tile keeps its
// own loops (sound rings, the blob's bob, a twinkle, blinks). Recoloured in the site's own colours (".hero-brand" in
// globals.css) so it sits with the page. Still for people who ask for less motion.
import { motion, useReducedMotion } from "motion/react";
import { Tile } from "./Tile";

export function HeroTile() {
  const still = useReducedMotion();
  return (
    <motion.div
      className="mx-auto w-full max-w-[34rem]"
      initial={still ? false : { opacity: 0, scale: 0.86, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 170, damping: 13, delay: 0.15 }}
    >
      <div className="run-float hero-brand" role="img" aria-label="The blob at a lectern, giving a speech with everything, sound rings spreading out">
        <Tile name="speech-run" className="drop-shadow-[0_18px_30px_rgba(30,38,32,0.14)]" />
      </div>
    </motion.div>
  );
}
