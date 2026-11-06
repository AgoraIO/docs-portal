import { createBrowserDriver } from '../browser-driver.mjs';

// Reuse the link auditor's isolated agent-browser launch and native CDP transport.
export async function connectChrome() {
  const driver = await createBrowserDriver({ timeoutMs: 25000 });
  try {
    await driver.run('open', 'about:blank');
    const { cdpUrl } = await driver.run('get', 'cdp-url');
    const socket = new WebSocket(cdpUrl),
      pending = new Map(),
      events = new Map();
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    let sequence = 0;
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data),
        request = pending.get(message.id);
      if (!request) {
        for (const listener of events.get(message.sessionId) ?? [])
          listener(message);
        return;
      }
      clearTimeout(request.timer);
      pending.delete(message.id);
      if (message.error)
        request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    };
    socket.onclose = () => {
      for (const request of pending.values()) {
        clearTimeout(request.timer);
        request.reject(new Error('Chrome disconnected'));
      }
      pending.clear();
    };
    const send = (method, params = {}, sessionId) =>
      new Promise((resolve, reject) => {
        const id = ++sequence,
          timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error(`Chrome timeout: ${method}`));
          }, 25000);
        pending.set(id, { resolve, reject, timer });
        socket.send(
          JSON.stringify({
            id,
            method,
            params,
            ...(sessionId ? { sessionId } : {}),
          }),
        );
      });
    const evaluate = async (sessionId, expression) => {
      const result = await send(
        'Runtime.evaluate',
        { expression, returnByValue: true, awaitPromise: true },
        sessionId,
      );
      if (result.exceptionDetails)
        throw new Error(
          result.exceptionDetails.exception?.description ??
            result.exceptionDetails.text,
        );
      return result.result.value;
    };
    return {
      send,
      evaluate,
      events,
      close: async () => {
        socket.close();
        await driver.close();
      },
    };
  } catch (error) {
    await driver.close();
    throw error;
  }
}
