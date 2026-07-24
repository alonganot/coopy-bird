# Coopy Bird

A neon-styled Arcade game with a persistent coin economy, a cosmetics shop, nine unlockable skills, and a real-time multiplayer mode — built with [Claude Code](https://claude.com/claude-code).

![stack](https://img.shields.io/badge/TypeScript-strict-3178c6) ![stack](https://img.shields.io/badge/Vite-5-646cff) ![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/WebSocket-ws-000000) ![stack](https://img.shields.io/badge/Postgres-16-336791)

## Play

The server (WebSocket + REST API + Postgres) is required even for single-player now, since save data lives there. Easiest local setup:

```bash
npm install
docker compose up -d        # Postgres + server, in the background
npm run dev
```

Open the printed URL, pick a username (no password — it just remembers your save), and play. Then hit "MULTIPLAYER" from the main screen to try real-time multiplayer. `npm run dev` runs with `--host`, and the client auto-detects the server's address, so anyone on the same network can join by opening your machine's printed network URL — no config needed.

Prefer running the server without Docker? Copy `server/.env.example` to `server/.env`, point `DATABASE_URL` at any reachable Postgres instance, and run `npm run server:dev` (loads `server/.env` automatically). Plain `npm run server` doesn't load any `.env` file — that's intentional, since it's also what Docker/Fly production uses, where env vars come from the container/host directly.

Space (or tap) to jump. Score points to earn coins, then spend them in the in-game shop. Works on mobile too — the canvas scales to any screen, on-screen skill buttons appear automatically on touch devices, and it's installable as a home-screen app (see PWA below).

## Features

- Classic jump-and-dodge gameplay with a coin economy
- **Global leaderboards**: single-player and multiplayer each have their own cross-player leaderboard — every player appears once, at their personal-best score (not a log of every run)
- **Shop** with four tabs, each with its own unlock/equip flow:
  - **Props** — five sub-tabs of cosmetics that can all be equipped at once:
    - **Colors** — 8 bird skins
    - **Hats**, **Glasses**, **Masks**, **Shoes** — 8 wearables each, priced 100–2000 coins, layered onto the bird so a hat, glasses, mask, and shoes can all be worn simultaneously
  - **Pipes** — 6 pipe designs, from a plain neon tube up to a crystal-spike prism column
  - **Scene** — 6 backgrounds (synthwave, jungle, ocean, desert, snow, volcano), each with its own ambient particle effect
  - **Skills** — 9 equippable abilities (max 3 at once): Dash, Shooting, Invisibility, Pocket Dimension (time slow), Shrink, Hover, Earthquake, Freeze Frame, and Shadow Clone (a mirrored clone that doubles your coins and can save you from one death)
- **Multiplayer**: everyone connected marks "ready" before a match starts; the whole match shares one score; dying shows a "respawning in Xs" countdown (5s) in the roster, then brings you back near whoever's doing best with 3s of invulnerability — you float in place (rather than immediately falling) until you jump or 3.5s passes, so there's a moment to get your bearings — unless nobody's left alive, in which case the match ends and the shared score is submitted to the multiplayer leaderboard under your account username (there's no separate in-lobby nickname). All 9 skills stay active and are kept in sync across every player, and everyone sees each other's equipped colors, hats, glasses, masks, and shoes too.
- Fully responsive — scales to any screen size/aspect ratio, with touch controls and larger tap targets on mobile
- **Performance**: single-player physics runs on a fixed-timestep accumulator rather than being tied 1:1 to the browser's actual frame rate, so a slow device/heavy tab makes rendering choppier without making the game itself run in slow motion; the multiplayer server has the same fix for its tick loop. Canvas gradients (backgrounds, pipes, the bird, coins) are cached instead of rebuilt every frame, and remote players'/pipes' positions are lightly smoothed client-side to iron out ordinary network jitter without adding input lag to your own jump
- **Installable (PWA)**: add it to your phone's home screen for an app-like, full-screen experience with instant loading from cache. Playing still needs a network connection (accounts/saves/leaderboards are server-side), but a clear "you're offline" message shows up instead of a hang if there's no connection
- **Accounts**: pick a username (3-16 letters/numbers/underscores) and your coins, unlocks, and high scores follow you to any device that logs in with the same name — no password, by design. Usernames are unique: picking one that's already taken asks whether you want to log in as that user or try a different name. Change your username anytime from the Settings screen (⚙, top-right of the idle screen) — renaming carries your save and leaderboard history with it
- Everything persists server-side in Postgres (coins, unlocks, high scores, leaderboard entries), with backward-compatible save migration; `localStorage` only remembers which username this browser last used

## Tech stack

- **TypeScript** (strict mode) end-to-end, client and server
- **Vite + React** as a thin app shell — React mounts a single `<canvas>` and gets out of the way; the actual game loop, physics, and all rendering are hand-rolled Canvas2D, not DOM/JSX
- **Node + `ws`** for the multiplayer server (`server/`, run via `tsx`, no build step) — a single authoritative process simulating the whole match and broadcasting state to every client, so nobody can desync
- **Postgres** for all player save data and the leaderboard, via a small REST API on the same server process
- **`vite-plugin-pwa`** for the installable app shell — generates the web manifest + service worker at build time, no hand-rolled SW code
- **Vitest** for save-migration unit tests

See [`CLAUDE.md`](./CLAUDE.md) for the full module breakdown, including how the multiplayer server/client and accounts/persistence are structured.

## Deployment

- **Client** → a [Cloudflare Worker with static assets](https://developers.cloudflare.com/workers/static-assets/) (not classic Cloudflare Pages) — `npm run build && npx wrangler deploy`; no Docker needed, no git-push auto-deploy
- **Server** → [Fly.io](https://fly.io/) via `server/Dockerfile` + `fly.toml` (`fly launch --dockerfile server/Dockerfile`, then `fly secrets set DATABASE_URL=... ALLOWED_ORIGIN=...`, then `fly deploy`)
- **Database** → any Postgres works; a free host like [Neon](https://neon.tech/) keeps your data independent of the app's own deploys
- `docker-compose.yml` spins up Postgres + the server locally for integration testing before deploying
- `.env.example` / `server/.env.example` document every environment variable each side needs

## Built with Claude Code

This project started as a single-session plain-JavaScript prototype and has been iterated on with Claude Code end-to-end:

- **Plan Mode** for every major addition — the original TypeScript/Vite/React rewrite, mobile responsiveness, and the multiplayer server — each scoped and reviewed as a plan before any code was written
- **Subagents** (`Explore` and `Plan`) run in parallel to map the existing codebase's structure/coupling before touching it, and to design each new feature's architecture (e.g. confirming a server-authoritative model was the only way to keep multiplayer's shared pipes from desyncing across clients)
- **`AskUserQuestion`** to settle trade-offs that shaped each feature (build tooling, React vs. Preact, single global multiplayer room vs. lobbies, whether skills stay active in multiplayer)
- A generated Vitest suite covering the `localStorage` save-migration logic, so existing players' progress survives every rewrite
- Ongoing iteration on gameplay rules, UI polish, and housekeeping (`.gitignore`, `CLAUDE.md`/README upkeep) as the project evolves
