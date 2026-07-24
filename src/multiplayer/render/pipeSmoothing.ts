// Same idea as remoteSmoothing.ts (bird positions), applied to the shared pipe array's
// scrolling x instead — pipes are rendered directly from the raw snapshot with zero
// smoothing today, so they're just as subject to network-jitter stutter as bird
// positions were before that fix.
//
// Pipes have no stable id in the wire protocol, but since they're only ever appended at
// the back and removed from the front (whichever scrolls off-screen first), index-based
// identity is stable in practice — the only edge case is the single frame a pipe is
// removed and every later index shifts down by one, handled by resetting all smoothing
// state on any array shrink (a one-frame raw snap, far rarer and less noticeable than
// the per-tick jitter this is meant to fix).
const SMOOTHING_TIME_CONSTANT_MS = 25;
// Higher than the bird's threshold — pipes can move up to ~13.5px/tick under Dash's
// speed multiplier (SPEED * DASH_SPEED_MULTIPLIER), which shouldn't itself trigger a snap.
const SNAP_THRESHOLD_PX = 20;
const smoothedX = new Map<number, number>();
let lastPipeCount = 0;

export function getSmoothedPipeX(index: number, rawX: number, dtMs: number): number {
  const prev = smoothedX.get(index);
  if (prev === undefined || Math.abs(rawX - prev) > SNAP_THRESHOLD_PX) {
    smoothedX.set(index, rawX);
    return rawX;
  }
  const alpha = 1 - Math.exp(-dtMs / SMOOTHING_TIME_CONSTANT_MS);
  const next = prev + (rawX - prev) * alpha;
  smoothedX.set(index, next);
  return next;
}

/** Call once per frame before drawing pipes, passing the current pipe count. */
export function preparePipeSmoothingFrame(pipeCount: number): void {
  if (pipeCount < lastPipeCount) smoothedX.clear();
  lastPipeCount = pipeCount;
}

/** Call on leaving a room / starting a fresh match so stale state doesn't bleed in. */
export function resetPipeSmoothing(): void {
  smoothedX.clear();
  lastPipeCount = 0;
}
