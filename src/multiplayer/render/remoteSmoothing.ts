// Pure rendering-layer smoothing for remote players' bird position — never touches
// mpState's snapshot data, which stays the single source of truth. Server snapshots
// arrive at ~60Hz but are subject to real network jitter; without this, a bird's
// rendered position freezes between snapshots then snaps abruptly to the next one.
// Exponential smoothing here absorbs that jitter without a full snapshot-buffering
// interpolation scheme.
// Kept short deliberately: this only needs to iron out sub-tick network jitter, not
// meaningfully delay the bird's true trajectory. 60ms initially made other players'
// birds visibly lag/chase their real position (reported as movement feeling "very
// slow") — 25ms converges within 1-2 real frames instead of 4+, all but eliminating
// visible chase while still smoothing the occasional late/doubled-up snapshot.
const SMOOTHING_TIME_CONSTANT_MS = 25;
// A real jump (or any snapshot-to-snapshot change bigger than typical per-tick drift)
// should always render instantly rather than being smoothed — smoothing only exists to
// hide sub-pixel-scale jitter between otherwise-similar snapshots, not to soften actual
// motion, which is what made movement feel sluggish at a longer time constant.
const SNAP_THRESHOLD_PX = 12;
const smoothedY = new Map<string, number>();
const seenThisFrame = new Set<string>();

/** Call once per rendered remote player per frame, before drawing. Returns the
 *  render-only y position to use. */
export function getSmoothedY(playerId: string, rawY: number, dtMs: number): number {
  seenThisFrame.add(playerId);
  const prev = smoothedY.get(playerId);
  if (prev === undefined || Math.abs(rawY - prev) > SNAP_THRESHOLD_PX) {
    smoothedY.set(playerId, rawY);
    return rawY;
  }
  const alpha = 1 - Math.exp(-dtMs / SMOOTHING_TIME_CONSTANT_MS);
  const next = prev + (rawY - prev) * alpha;
  smoothedY.set(playerId, next);
  return next;
}

/** Call once per frame after drawing all players, to drop stale entries for players
 *  who disconnected (mpState.players silently stops including them — no explicit
 *  removal event exists to hook into). */
export function pruneSmoothingState(): void {
  for (const id of smoothedY.keys()) {
    if (!seenThisFrame.has(id)) smoothedY.delete(id);
  }
  seenThisFrame.clear();
}

/** Call on leaving a room / starting a fresh match so stale ids don't bleed in. */
export function resetSmoothing(): void {
  smoothedY.clear();
  seenThisFrame.clear();
}
