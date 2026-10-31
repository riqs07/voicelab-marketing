// One of the app's course tiles, drawn from src/data/tiles.json (made by scripts/render-tiles.mjs from the app's own
// tile code), so the pictures are the app's exactly. The colours and loops are in globals.css under ".vl-scene".
import tiles from "@/data/tiles.json";

export type TileName = keyof typeof tiles;

export const TILES = tiles as Record<TileName, { label: string; svg: string }>;

export function Tile({ name, className = "" }: { name: TileName; className?: string }) {
  // The markup is our own, generated at build time from the app's drawings, not user content
  return <span aria-hidden="true" className={`block [&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className}`} dangerouslySetInnerHTML={{ __html: TILES[name].svg }} />;
}
