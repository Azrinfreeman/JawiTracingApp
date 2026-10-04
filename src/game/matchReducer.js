import { roundScore, matchAwards, RULES_VERSION } from './scoring.js';
export function initialMatch(config) {
  return { ...config, rulesVersion: RULES_VERSION, status: 'ready', roundIndex: 0,
    ready: config.profiles.map(() => false), outcomes: config.profiles.map(() => null),
    retries: config.profiles.map(() => 0), rounds: [], pauseCount: 0, resuming: false };
}
function settle(state, outcomes) {
  if (outcomes.some(player => !player)) return { ...state, outcomes };
  return { ...state, status: 'roundResult', outcomes,
    rounds: [...state.rounds, { letterId: state.letterIds[state.roundIndex], players: outcomes }] };
}
export function matchReducer(state, action) {
  if (['completed', 'abandoned'].includes(state.status)) return state;
  switch (action.type) {
    case 'READY': {
      if (state.status !== 'ready' || !Number.isInteger(action.slot) || action.slot < 0 || action.slot >= state.profiles.length) return state;
      const ready = state.ready.map((value, slot) => value || slot === action.slot);
      return { ...state, ready, status: ready.every(Boolean) ? 'countdown' : 'ready', resuming: false };
    }
    case 'START': return state.status === 'countdown' ? { ...state, status: 'racing', resuming: false } : state;
    case 'PAUSE': return ['racing', 'countdown'].includes(state.status)
      ? { ...state, status: 'paused', pauseCount: state.pauseCount + 1 } : state;
    case 'RESUME': return state.status === 'paused' ? { ...state, status: 'countdown', resuming: true } : state;
    case 'RETRY': return ['racing', 'paused'].includes(state.status) && Number.isInteger(action.slot) && action.slot >= 0 && action.slot < state.profiles.length && !state.outcomes[action.slot]
      ? { ...state, retries: state.retries.map((n, slot) => n + (slot === action.slot ? 1 : 0)) } : state;
    case 'COMPLETE': {
      if (state.status !== 'racing' || action.matchId !== state.id || action.roundIndex !== state.roundIndex ||
          !Number.isInteger(action.slot) || action.slot < 0 || action.slot >= state.profiles.length || state.outcomes[action.slot]) return state;
      if (action.snapshot?.outcome !== 'playComplete' || !action.snapshot.profile?.id || !Number.isFinite(action.elapsedMs) || action.elapsedMs < 0 || action.elapsedMs > state.limitMs) return state;
      const scored = { ...roundScore(action.snapshot.outcome, action.elapsedMs, state.limitMs),
        retries: state.retries[action.slot], pointerType: action.snapshot.pointerType, inputSources: action.snapshot.inputSources || [], metrics: action.snapshot.metrics,
        toleranceProfile: action.snapshot.profile.id, completedAtMs: action.elapsedMs };
      return settle(state, state.outcomes.map((value, slot) => slot === action.slot ? scored : value));
    }
    case 'TIMEOUT': return state.status === 'racing' ? settle(state, state.outcomes.map((value, slot) => value ||
      { ...roundScore('timeout', state.limitMs, state.limitMs), retries: state.retries[slot] })) : state;
    case 'NEXT': {
      if (state.status !== 'roundResult') return state;
      if (state.roundIndex + 1 === state.letterIds.length) return { ...state, status: 'completed',
        awards: matchAwards(state.mode, state.rounds, state.profiles.length) };
      return { ...state, status: 'ready', roundIndex: state.roundIndex + 1, ready: state.profiles.map(() => false),
        outcomes: state.profiles.map(() => null), retries: state.profiles.map(() => 0), resuming: false };
    }
    case 'END': return { ...state, status: 'abandoned', awards: null, exitToSolo: Boolean(action.exitToSolo) };
    default: return state;
  }
}
