// A sync only wakes the backend. The server selects persisted events and recipients.
export function createPushDispatcher({ enabled, invoke, now = Date.now, setTimer = setTimeout, clearTimer = clearTimeout }) {
  const pending = new Set(), last = new Map(), timers = new Map();
  let generation = 0;
  function defer(spaceId, userId, delay) {
    const key = userId + ':' + spaceId, current = generation;
    if (timers.has(key)) return;
    timers.set(key, setTimer(() => {
      timers.delete(key);
      if (generation === current) void dispatcher.dispatch(spaceId, userId);
    }, delay));
  }
  const dispatcher = {
    async dispatch(spaceId, userId) {
      if (!enabled() || !spaceId || !userId) return;
      const key = userId + ':' + spaceId;
      if (pending.has(key)) { defer(spaceId, userId, 5000); return; }
      if (last.has(key) && now() - last.get(key) < 5000) { defer(spaceId, userId, 5000 - (now() - last.get(key))); return; }
      pending.add(key); last.set(key, now());
      const current = generation;
      try {
        for (let batch = 0; batch < 3; batch++) {
          const result = await invoke('junto-push', { body: { spaceId } });
          if (current !== generation || result?.error || !result?.data || Object.values(result.data).reduce((sum, n) => sum + (Number.isInteger(n) ? n : 0), 0) < 10) break;
          if (batch === 2) defer(spaceId, userId, 5000);
        }
      }
      catch { /* Remote push must never fail a financial sync or hide an existing notice. */ }
      finally { pending.delete(key); }
    },
    reset() { generation++; last.clear(); for (const timer of timers.values()) clearTimer(timer); timers.clear(); }
  };
  return dispatcher;
}
