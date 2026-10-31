// One of the app's course tiles, drawn from src/data/tiles.json (made by scripts/render-tiles.mjs from the app's own
// tile code), so the pictures are the app's exactly. The colours and loops are in globals.css under ".vl-scene".
import tiles from "@/data/tiles.json";

export type TileName = keyof typeof tiles;

export const TILES = tiles as Record<TileName, { label: string; svg: string }>;

export function Tile({ name, className = "" }: { name: TileName; className?: string }) {
  // The markup is our own, generated at build time from the app's drawings, not user content
  return <span aria-hidden="true" className={`block [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: TILES[name].svg }} />;
}

// The hero's tiles: one is picked on each visit (HeroTile.tsx); the lessons band leaves them out
export const HERO_TILES = ["speech-run", "beyond-good-you", "stories-that-land", "the-run"] as const satisfies readonly TileName[];

// The course tiles the waitlist shows for each goal; the lessons band leaves them out too
export const COURSE_TILES = ["stories-that-land", "beyond-good-you", "stop-freezing", "voice-lean-in", "explain-it-simply", "ready-by-the-day"] as const satisfies readonly TileName[];
