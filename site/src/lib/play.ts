// One short clip at a time: starting a new one stops the last, so tapping around never stacks voices.
let current: HTMLAudioElement | null = null;

export function playClip(src: string): void {
  current?.pause();
  current = new Audio(src);
  void current.play().catch(() => undefined);
}
