import { useEffect, useRef } from 'react';
import { createGame } from './game/engine';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const engine = createGame(canvasRef.current!);
    engine.start();
    return () => engine.stop();
  }, []);

  return <canvas ref={canvasRef} width={400} height={600} />;
}
