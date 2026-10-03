export const STORAGE_KEY = 'taman-jawi.progress.v1';
export const defaultProgress = () => ({ version: 1, profile: 'Bunga', attempts: [], copies: [] });
const finite = value => typeof value === 'number' && Number.isFinite(value);
const validAttempt = a => a && ['id','timestamp','profile','letterId','mode','pointerType','toleranceProfile'].every(k => typeof a[k] === 'string') &&
  a.metrics && ['coverage','meanError','invalidTravel','invalidEvents'].every(k => finite(a.metrics[k])) && finite(a.assistance) && finite(a.retries) &&
  ['interactionPolicy','inkPolicy','dotInputPolicy','displayAssistance'].every(k => a[k] === undefined || typeof a[k] === 'string') &&
  (a.sessionType === undefined || ['solo', 'duo'].includes(a.sessionType)) &&
  (a.matchId === undefined || typeof a.matchId === 'string') &&
  ['roundIndex', 'playerSlot'].every(k => a[k] === undefined || (Number.isInteger(a[k]) && a[k] >= 0)) &&
  ['blockedGestures','wrongStartGestures','rejectedDotGestures','rollbackCount','pauseEpisodes','resumeCount','ignoredStartGestures','equivalentDotActions','terminalDisplayFillUnits','turnProjectionAllowanceUnits','diagnosticRotations','endpointConfirmations','releaseAssistances'].every(k => a.metrics[k] === undefined || (finite(a.metrics[k]) && a.metrics[k] >= 0));
const validCopy = c => c && ['id','timestamp','profile','letterId'].every(k => typeof c[k] === 'string') && Array.isArray(c.ink) && c.ink.length <= 100 &&
  c.ink.every(line => Array.isArray(line) && line.length <= 700 && line.every(p => finite(p.x) && finite(p.y)));
export function createProgressStore(storage) {
  let memory = defaultProgress(), available = true;
  function save(value) {
    memory = value;
    try {
      const serialized = JSON.stringify(value);
      if (serialized.length > 2000000) throw new Error('Storage budget exceeded');
      storage.setItem(STORAGE_KEY, serialized);
    } catch { available = false; }
    return memory;
  }
  function read() {
    if (!available) return memory;
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return memory;
      if (raw.length > 2000000) return memory;
      const parsed = JSON.parse(raw);
      if (parsed.version !== 1 || !Array.isArray(parsed.attempts) || !Array.isArray(parsed.copies) || typeof parsed.profile !== 'string') return memory;
      memory = { ...parsed, attempts: parsed.attempts.filter(validAttempt).slice(-300), copies: parsed.copies.filter(validCopy).slice(-12) };
    } catch { available = false; }
    return memory;
  }
  return { read, save, isAvailable: () => available, setProfile: profile => save({ ...read(), profile }),
    addAttempt: attempt => { const current = read(); return current.attempts.some(a => a.id === attempt.id) ? current : save({ ...current, attempts: [...current.attempts, attempt].slice(-300) }); },
    // Bounded SVG ink data for deliberate teacher observation; never auto-scored.
    addCopy: copy => save({ ...read(), copies: [...read().copies, copy].slice(-12) }),
    reset: () => save(defaultProgress()), export: () => JSON.stringify(read(), null, 2) };
}
