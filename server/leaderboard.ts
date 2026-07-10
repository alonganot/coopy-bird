import fs from 'node:fs';
import path from 'node:path';
import type { LeaderboardEntry } from './protocol';

const DATA_DIR = path.join(import.meta.dirname, 'data');
const FILE = path.join(DATA_DIR, 'leaderboard.json');
const MAX_ENTRIES = 100;

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
}

export function loadLeaderboard(): LeaderboardEntry[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function appendLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const all = [...loadLeaderboard(), ...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
  return all;
}

export function topLeaderboard(n = 10): LeaderboardEntry[] {
  return loadLeaderboard().sort((a, b) => b.score - a.score).slice(0, n);
}
