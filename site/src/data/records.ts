// Stand-in for the one type the copied app code needs from the app's database code (see scripts/sync-core.mjs)
export interface ServerWord {
  text: string;
  w: string;
  s: number;
  e: number;
}
