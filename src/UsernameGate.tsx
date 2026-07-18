import { useEffect, useState, type FormEvent } from 'react';
import { checkUsernameExists, fetchOrCreateSession } from './game/api';
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
  const [status, setStatus] = useState<'checking' | 'needsUsername' | 'confirmTaken' | 'connecting'>('checking');
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = getStoredUsername();
    if (!stored) {
      setStatus('needsUsername');
      return;
    }
    // Returning to a remembered username on this device is already an implicit "log in as
    // this user" — no need to re-confirm the way a freshly-typed existing name does below.
    establishSession(stored)
      .then(onReady)
      .catch(() => setStatus('needsUsername'));
  }, []);

  function logInAsExisting(): void {
    setError('');
    setStatus('connecting');
    establishSession(input.trim())
      .then(onReady)
      .catch(() => {
        setError('Could not connect — try again');
        setStatus('needsUsername');
      });
  }

  function tryDifferentName(): void {
    setError('');
    setInput('');
    setStatus('needsUsername');
  }

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    const username = input.trim();
    if (!USERNAME_RE.test(username)) {
      setError('3-16 letters, numbers, or underscores');
      return;
    }
    setInput(username);
    setError('');
    setStatus('connecting');
    try {
      const exists = await checkUsernameExists(username);
      if (exists) {
        setStatus('confirmTaken');
        return;
      }
      await establishSession(username);
      onReady();
    } catch {
      setError('Could not connect — try again');
      setStatus('needsUsername');
    }
  }

  if (status === 'checking') {
    return (
      <div className="username-gate">
        <p>Connecting...</p>
      </div>
    );
  }

  if (status === 'confirmTaken') {
    return (
      <div className="username-gate">
        <div className="username-gate-confirm">
          <p className="username-gate-title">// CALLSIGN TAKEN //</p>
          <p style={{marginTop: '10px'}}>"{input}"</p>
          <p>is already in use.</p>
          <button type="button" onClick={logInAsExisting}>Log in as {input}</button>
          <button type="button" onClick={tryDifferentName}>Try a different name</button>
        </div>
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
        <p className="username-gate-hint">No password.</p>
        <p className="username-gate-hint">this name just remembers your save.</p>
      </form>
    </div>
  );
}
