# Flappy Bird

A neon-styled Flappy Bird clone with a persistent coin economy, a cosmetics shop, and nine unlockable skills — built as my first project with [Claude Code](https://claude.com/claude-code).

![stack](https://img.shields.io/badge/TypeScript-strict-3178c6) ![stack](https://img.shields.io/badge/Vite-5-646cff) ![stack](https://img.shields.io/badge/React-18-61dafb)

## Play

```bash
npm install
npm run dev
```

Space (or tap) to flap. Score points to earn coins, then spend them in the in-game shop.

## Features

- Classic flap-and-dodge gameplay with a coin economy and a top-5 local high-score board
- **Shop** with four tabs, each with its own unlock/equip flow:
  - **Colors** — 8 bird skins
  - **Pipes** — 6 pipe designs, from a plain neon tube up to a crystal-spike prism column
  - **Scene** — 6 backgrounds (synthwave, jungle, ocean, desert, snow, volcano), each with its own ambient particle effect
  - **Skills** — 9 equippable abilities (max 3 at once): Dash, Shooting, Invisibility, Pocket Dimension (time slow), Shrink, Hover, Earthquake, Freeze Frame, and Shadow Clone (a mirrored clone that doubles your coins and can save you from one death)
- Everything persists to `localStorage`, with backward-compatible save migration

## Tech stack

- **TypeScript** (strict mode) for the entire game engine
- **Vite + React** as a thin app shell — React mounts a single `<canvas>` and gets out of the way; the actual game loop, physics, and all rendering are hand-rolled Canvas2D, not DOM/JSX
- **Vitest** for save-migration unit tests

See [`CLAUDE.md`](./CLAUDE.md) for the full module breakdown.

## Built with Claude Code

This project started as a single-session plain-JavaScript prototype and was later restructured with Claude Code end-to-end:

- **Plan Mode** to scope and review a full rewrite: converting the original `game.js`/`skills.js` (sharing an implicit global scope) into strict TypeScript, split across ~25 cohesive modules (`state`, `persistence`, `engine`, `render/`, `shop/`, `skills/`), on a Vite + React build
- **Subagents** (`Explore` and `Plan`) run in parallel to map the existing codebase's structure and coupling before any code was touched, and to design the target module layout
- **`AskUserQuestion`** to settle the trade-offs that shaped the rewrite (build tooling, whether to touch the rendering approach, React vs. Preact, one-pass vs. staged migration)
- A generated Vitest suite covering the `localStorage` save-migration logic, so existing players' progress survives the rewrite
- Ongoing iteration on game balance and housekeeping (`.gitignore`, `CLAUDE.md` upkeep) as the project evolves
