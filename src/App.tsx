import { useEffect, useRef } from 'react';
import { createGame } from './game/engine';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const engine = createGame(canvasRef.current!, controlsRef.current);
    engine.start();
    return () => engine.stop();
  }, []);

  return (
    <div className="game-frame">
      <canvas ref={canvasRef} width={400} height={600} />
      <div ref={controlsRef} />
    </div>
  );
}
