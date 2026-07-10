import type { ClientMessage, ServerMessage } from '../../server/protocol';

export interface Connection {
  send(msg: ClientMessage): void;
  close(): void;
}

const DEFAULT_PORT = '8787';

/**
 * Defaults to the page's own hostname (so it works whether the page was opened via
 * localhost or a LAN IP/hostname, matching Vite's --host behavior) rather than a
 * hardcoded "localhost", which would resolve to the wrong machine's loopback for
 * anyone who isn't the host. VITE_MP_SERVER_URL can still override this entirely.
 */
function resolveServerUrl(): string {
  if (import.meta.env.VITE_MP_SERVER_URL) return import.meta.env.VITE_MP_SERVER_URL;
  const port = import.meta.env.VITE_MP_SERVER_PORT || DEFAULT_PORT;
  return `ws://${window.location.hostname}:${port}`;
}

export function connect(onMessage: (msg: ServerMessage) => void): Connection {
  const url = resolveServerUrl();
  let ws: WebSocket;
  let closedByUser = false;
  let retryDelay = 1000;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let queue: ClientMessage[] = [];

  function open(): void {
    ws = new WebSocket(url);
    ws.onmessage = e => {
      try {
        onMessage(JSON.parse(e.data));
      } catch {
        // ignore malformed frames
      }
    };
    ws.onopen = () => {
      retryDelay = 1000;
      queue.forEach(msg => ws.send(JSON.stringify(msg)));
      queue = [];
    };
    ws.onclose = () => {
      if (closedByUser) return;
      retryTimer = setTimeout(open, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 8000);
    };
  }
  open();

  return {
    send(msg: ClientMessage): void {
      if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
      else if (ws.readyState === WebSocket.CONNECTING) queue.push(msg);
    },
    close(): void {
      closedByUser = true;
      if (retryTimer) clearTimeout(retryTimer);
      ws.close();
    },
  };
}
