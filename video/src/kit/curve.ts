// Pitch lines drawn under words: each word gets a slot as wide as its letters,
// and a smooth line passes over each slot's centre at that word's height.

// Slot centres and widths for a row of words across `width` pixels.
export const wordSlots = (words: readonly string[], width: number) => {
  const units = words.map((w) => w.length + 1.6);
  const total = units.reduce((a, b) => a + b, 0);
  let x = 0;
  return units.map((u) => {
    const w = (u / total) * width;
    const slot = {x, w, cx: x + w / 2};
    x += w;
    return slot;
  });
};

// A smooth path (Catmull-Rom as cubic Béziers) through points.
export const smoothPath = (pts: {x: number; y: number}[]) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = {x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6};
    const c2 = {x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6};
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
};

// Height 0..1 → y in a chart `h` pixels tall (1 at the top).
export const yOf = (v: number, h: number) => h * 0.06 + (1 - v) * h * 0.88;

// The path for a row of word heights.
export const pitchPath = (words: readonly string[], heights: readonly number[], width: number, h: number) => {
  const slots = wordSlots(words, width);
  const pts = slots.map((s, i) => ({x: s.cx, y: yOf(heights[i] ?? 0.5, h)}));
  // Run the line out to both edges so it spans the card.
  pts.unshift({x: 0, y: pts[0].y});
  pts.push({x: width, y: pts[pts.length - 1].y});
  return smoothPath(pts);
};
