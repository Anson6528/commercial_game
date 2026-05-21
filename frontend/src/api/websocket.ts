let ws: WebSocket | null = null;

type MessageHandler = (data: unknown) => void;
const handlers: Map<string, Set<MessageHandler>> = new Map();

export function connectWebSocket(url: string = 'ws://localhost:8000/ws'): WebSocket {
  if (ws && ws.readyState === WebSocket.OPEN) return ws;

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      const type = payload.type as string;
      const callbacks = handlers.get(type);
      if (callbacks) {
        callbacks.forEach((cb) => cb(payload.data));
      }
    } catch (err) {
      console.error('WebSocket message parse error', err);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected');
    ws = null;
  };

  ws.onerror = (err) => {
    console.error('WebSocket error', err);
  };

  return ws;
}

export function subscribe(type: string, handler: MessageHandler): () => void {
  if (!handlers.has(type)) handlers.set(type, new Set());
  handlers.get(type)!.add(handler);
  return () => {
    handlers.get(type)?.delete(handler);
  };
}

export function disconnectWebSocket(): void {
  ws?.close();
  ws = null;
}
