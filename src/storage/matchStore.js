export const MATCH_STORAGE_KEY = 'taman-jawi.matches.v1';
const finite = n => Number.isFinite(n) && n >= 0;
export function validMatch(match) {
  return match && typeof match.id === 'string' && typeof match.timestamp === 'string' &&
    ['solo', 'duo'].includes(match.mode) && ['completed', 'abandoned'].includes(match.status) && match.rulesVersion === 'speed-v1' &&
    Array.isArray(match.profiles) && match.profiles.length === (match.mode === 'duo' ? 2 : 1) && match.profiles.every(p => typeof p === 'string') && new Set(match.profiles).size === match.profiles.length && !match.unscored &&
    Array.isArray(match.letterIds) && [3, 5, 10].includes(match.letterIds.length) && match.letterIds.every(id => typeof id === 'string') && new Set(match.letterIds).size === match.letterIds.length &&
    [60000, 90000, 120000].includes(match.limitMs) && finite(match.pauseCount) &&
    Array.isArray(match.rounds) && match.rounds.length <= match.letterIds.length &&
    (match.status !== 'completed' || match.rounds.length === match.letterIds.length) &&
    match.rounds.every((round, i) => round && round.letterId === match.letterIds[i] && Array.isArray(round.players) && round.players.length === match.profiles.length &&
      round.players.every(p => p && ['playComplete', 'timeout'].includes(p.outcome) && finite(p.elapsedMs) && p.elapsedMs <= match.limitMs &&
        finite(p.total) && p.total <= 200 && finite(p.base) && finite(p.bonus) && p.bonus <= 100 && p.total === p.base + p.bonus && finite(p.retries) &&
        (p.outcome === 'timeout' ? p.total === 0 && p.elapsedMs === match.limitMs : p.base === 100)));
}
export function createMatchStore(storage) {
  let memory = { version: 1, matches: [] }, available = true;
  function read() {
    if (!available) return memory;
    let raw;
    try { raw = storage.getItem(MATCH_STORAGE_KEY); } catch { available = false; return memory; }
    try {
      if (!raw || raw.length > 1000000) return memory;
      const parsed = JSON.parse(raw);
      if (parsed.version === 1 && Array.isArray(parsed.matches)) memory = { version: 1, matches: parsed.matches.filter(validMatch).slice(-50) };
    } catch { /* Corrupt match history cannot invalidate ordinary progress. */ }
    return memory;
  }
  function save(value) {
    memory = value;
    try { const raw = JSON.stringify(memory); if (raw.length > 1000000) throw new Error('Match storage limit'); storage.setItem(MATCH_STORAGE_KEY, raw); }
    catch { available = false; }
    return memory;
  }
  return { read, isAvailable: () => available,
    add(match) { if (!validMatch(match)) return false; const old = read(); if (old.matches.some(m => m.id === match.id)) return false;
      save({ version: 1, matches: [...old.matches, match].slice(-50) }); return true; },
    reset: () => save({ version: 1, matches: [] }), export: () => read() };
}
