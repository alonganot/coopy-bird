import { useEffect, useRef, useState } from 'react';
import { createGame } from './game/engine';
import { createMultiplayerGame } from './multiplayer/mpEngine';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'single' | 'multi'>('single');

  useEffect(() => {
    const onSwitchMode = () => setMode(m => (m === 'single' ? 'multi' : 'single'));
    const engine = mode === 'multi'
      ? createMultiplayerGame(canvasRef.current!, controlsRef.current, { onSwitchMode })
      : createGame(canvasRef.current!, controlsRef.current, { onSwitchMode });
    engine.start();
    return () => engine.stop();
  }, [mode]);

  return (
    <div className="game-frame">
      <canvas ref={canvasRef} width={400} height={600} />
      <div ref={controlsRef} />
    </div>
  );
}
