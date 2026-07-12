import { useEffect, useState, type FormEvent } from 'react';
import { fetchOrCreateSession } from './game/api';
import { getStoredUsername, migrateData, setStoredUsername } from './game/persistence';
import { world } from './game/state';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/;

export interface UsernameGateProps {
  onReady: () => void;
}

async function establishSession(username: string): Promise<void> {
  const gameData = await fetchOrCreateSession(username);
  world.gameData = migrateData(gameData);
  world.username = username;
  setStoredUsername(username);
}

export default function UsernameGate({ onReady }: UsernameGateProps) {
  const [status, setStatus] = useState<'checking' | 'needsUsername' | 'connecting'>('checking');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = getStoredUsername();
    if (!stored) {
      setStatus('needsUsername');
      return;
    }
    establishSession(stored)
      .then(onReady)
      .catch(() => setStatus('needsUsername'));
  }, []);

  function submit(e: FormEvent): void {
    e.preventDefault();
    const username = input.trim();
    if (!USERNAME_RE.test(username)) {
      setError('3-16 letters, numbers, or underscores');
      return;
    }
    setError('');
    setStatus('connecting');
    establishSession(username)
      .then(onReady)
      .catch(() => {
        setError('Could not connect — try again');
        setStatus('needsUsername');
      });
  }

  if (status === 'checking') {
    return (
      <div className="username-gate">
        <p>Connecting...</p>
      </div>
    );
  }

  return (
    <div className="username-gate">
      <form onSubmit={submit}>
        <p className="username-gate-title">// ENTER CALLSIGN //</p>
        <input
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          maxLength={16}
          placeholder="username"
          disabled={status === 'connecting'}
        />
        <button type="submit" disabled={status === 'connecting'}>
          {status === 'connecting' ? 'Connecting...' : 'Continue'}
        </button>
        {error && <p className="username-gate-error">{error}</p>}
        <p className="username-gate-hint">No password — this name just remembers your save.</p>
      </form>
    </div>
  );
}
