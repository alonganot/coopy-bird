import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { createGame } from './game/engine';
import { createMultiplayerGame } from './multiplayer/mpEngine';
import UsernameGate from './UsernameGate';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [ready, setReady] = useState(false);

  // A new deploy's service worker skip-waits and claims clients on its own (registerType:
  // 'autoUpdate'), but the page already loaded in the browser keeps running the old bundle
  // until it reloads — installed PWAs especially can sit open for a long time without ever
  // reloading naturally, so force it here instead of leaving players stuck on a stale build.
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  useEffect(() => {
    if (needRefresh) updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    if (!ready) return;
    const onSwitchMode = () => setMode(m => (m === 'single' ? 'multi' : 'single'));
    const engine = mode === 'multi'
      ? createMultiplayerGame(canvasRef.current!, controlsRef.current, { onSwitchMode })
      : createGame(canvasRef.current!, controlsRef.current, { onSwitchMode });
    engine.start();
    return () => engine.stop();
  }, [ready, mode]);

  if (!ready) {
    return (
      <div className="game-frame">
        <UsernameGate onReady={() => setReady(true)} />
      </div>
    );
  }

  return (
    <div className="game-frame">
      <canvas ref={canvasRef} width={400} height={600} />
      <div ref={controlsRef} />
    </div>
  );
}
