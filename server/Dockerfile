# Runs the multiplayer WebSocket + REST server via tsx (no compile step, matching
# the project's existing "no build step" server workflow — see CLAUDE.md).
FROM node:20-alpine

WORKDIR /app

# Install once, before copying source, so dependency layers cache across code changes.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# The server only imports server/* and src/game/* (constants, types, skills data,
# persistence) — nothing else in src/ is needed at runtime.
COPY server ./server
COPY src/game ./src/game
COPY tsconfig.server.json ./

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "server"]
