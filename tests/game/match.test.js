import { describe, expect, test } from 'vitest';
import { roundScore, matchAwards } from '../../src/game/scoring.js';
import { createMatchClock } from '../../src/game/matchClock.js';
import { initialMatch, matchReducer } from '../../src/game/matchReducer.js';
import { createMatchStore, MATCH_STORAGE_KEY } from '../../src/storage/matchStore.js';
import { createProgressStore, STORAGE_KEY } from '../../src/storage/progressStore.js';
import { eligiblePool, selectSequence } from '../../src/game/matchConfig.js';
import letters from '../../src/content/letters.json';

const config = { id: 'match', timestamp: '2026-10-02T00:00:00Z', mode: 'duo', profiles: ['Bunga', 'Daun'], letterIds: ['alif', 'ba', 'ta'], limitMs: 90000 };
const snapshot = { outcome: 'playComplete', pointerType: 'touch', profile: { id: 'play-touch-standard-v1' }, metrics: { coverage: 1, meanError: 0, invalidTravel: 0, invalidEvents: 0 } };
const act = (state, type, extra = {}) => matchReducer(state, { type, ...extra });
function racing() { return act(act(act(initialMatch(config), 'READY', { slot: 0 }), 'READY', { slot: 1 }), 'START'); }
const completion = (slot, elapsedMs, extra = {}) => ({ type: 'COMPLETE', matchId: config.id, roundIndex: 0, slot, snapshot, elapsedMs, ...extra });
const storage = () => { const values = new Map(); return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) }; };

describe('fair speed scoring', () => {
  test.each([[10000, 189], [30000, 167], [60000, 133], [90000, 100]])('90 second round at %d ms gives %d', (ms, total) => expect(roundScore('playComplete', ms, 90000).total).toBe(total));
  test('rounds up time conservatively; checks true deadline before rounding', () => {
    expect(roundScore('playComplete', 10001, 90000).elapsedMs).toBe(10100);
    for (const ms of [90000.01, NaN, Infinity, -1]) expect(roundScore('playComplete', ms, 90000).total).toBe(0);
    expect(roundScore('timeout', 10, 90000).total).toBe(0);
  });
  test('one active clock excludes countdown and shared pauses without double resumes', () => {
    let now = 500; const clock = createMatchClock(() => now);
    now += 3000; expect(clock.elapsed()).toBe(0); clock.resume(); now += 1000; clock.resume(); now += 1500;
    expect(clock.elapsed(now - 100)).toBe(2400); clock.pause(); now += 90000; clock.pause(); expect(clock.elapsed()).toBe(2500);
    clock.resume(); now += 500; expect(clock.elapsed()).toBe(3000); clock.reset(); expect(clock.elapsed()).toBe(0);
  });
  test('point ties use time; near times share trophy; zero scores earn none', () => {
    const rounds = [{ players: [{ total: 150, elapsedMs: 45000, outcome: 'playComplete' }, { total: 150, elapsedMs: 45100, outcome: 'playComplete' }] }];
    expect(matchAwards('duo', rounds, 2).winners).toEqual([0, 1]);
    rounds[0].players[1].elapsedMs = 45200; expect(matchAwards('duo', rounds, 2)).toMatchObject({ winners: [0], tieBreak: true });
    rounds[0].players.forEach(p => p.total = 0); expect(matchAwards('duo', rounds, 2).trophy).toBe(null);
  });
  test.each([[100, 'bronze'], [140, 'silver'], [170, 'gold']])('Solo %d per round earns %s only with all rounds complete', (total, trophy) => {
    const rounds = Array.from({ length: 5 }, () => ({ players: [{ total, elapsedMs: 1000, outcome: 'playComplete' }] }));
    expect(matchAwards('solo', rounds, 1).trophy).toBe(trophy);
    rounds[0].players[0].outcome = 'timeout'; expect(matchAwards('solo', rounds, 1).trophy).toBe(null);
  });
});
describe('round lifecycle', () => {
  test('requires both ready; accepts exact deadline; ignores duplicates, stale and late input', () => {
    let state = initialMatch(config); state = act(state, 'READY', { slot: 0 }); expect(state.status).toBe('ready');
    expect(matchReducer(state, completion(0, 10))).toBe(state);
    state = racing();
    for (const extra of [{ matchId: 'old' }, { roundIndex: 1 }, { slot: 9 }, { elapsedMs: 90001 }, { snapshot: { outcome: 'complete' } }]) expect(matchReducer(state, completion(0, 50, extra))).toBe(state);
    state = matchReducer(state, completion(0, 90000)); expect(state.status).toBe('racing'); expect(state.outcomes[0].total).toBe(100);
    expect(matchReducer(state, completion(0, 1))).toBe(state);
    state = act(state, 'TIMEOUT'); expect(state.status).toBe('roundResult'); expect(state.outcomes[1].total).toBe(0);
    state = act(state, 'NEXT'); expect(state.status).toBe('ready'); expect(state.roundIndex).toBe(1);
    expect(matchReducer(state, completion(1, 20))).toBe(state);
  });
  test('pause rejects every completion; local retries change only one player; abandoned cannot win', () => {
    let state = racing(); state = act(state, 'RETRY', { slot: 0 }); expect(state.retries).toEqual([1, 0]);
    state = act(state, 'PAUSE'); expect(matchReducer(state, completion(1, 10))).toBe(state);
    // The tools menu is shown while paused: a retry there resets only the chosen player and keeps the pause.
    const paused = act(state, 'RETRY', { slot: 1 }); expect(paused.status).toBe('paused'); expect(paused.retries).toEqual([1, 1]);
    expect(act(act(initialMatch(config), 'READY', { slot: 0 }), 'RETRY', { slot: 0 }).retries).toEqual([0, 0]);
    state = paused; state = { ...state, retries: [1, 0] };
    expect(act(state, 'RESUME').status).toBe('countdown');
    state = act(state, 'END'); expect(state.awards).toBe(null); expect(act(state, 'NEXT')).toBe(state);
  });
  test('a full three-round match settles once and awards after explicit next', () => {
    let state = racing();
    for (let roundIndex = 0; roundIndex < 3; roundIndex++) {
      state = matchReducer(state, completion(0, 10000, { roundIndex })); state = matchReducer(state, completion(1, 20000, { roundIndex }));
      state = act(state, 'NEXT');
      if (roundIndex < 2) state = act(act(act(state, 'READY', { slot: 0 }), 'READY', { slot: 1 }), 'START');
    }
    expect(state.status).toBe('completed'); expect(state.awards.winners).toEqual([0]); expect(state.rounds).toHaveLength(3);
  });
});
describe('independent bounded storage', () => {
  test('old progress survives with additive race attempts saved once for both profiles', () => {
    const disk = storage(), old = { version: 1, profile: 'Bintang', attempts: [], copies: [] }; disk.setItem(STORAGE_KEY, JSON.stringify(old));
    const store = createProgressStore(disk); expect(store.read()).toEqual(old);
    const base = { id: 'm:0:0', timestamp: config.timestamp, profile: 'Bunga', letterId: 'alif', mode: 'play', pointerType: 'touch', toleranceProfile: snapshot.profile.id, metrics: snapshot.metrics, assistance: 1, retries: 0, sessionType: 'duo', matchId: 'm', roundIndex: 0, playerSlot: 0 };
    store.addAttempt(base); store.addAttempt(base); store.addAttempt({ ...base, id: 'm:0:1', playerSlot: 1, profile: 'Daun' });
    const read = createProgressStore(disk).read(); expect(read.profile).toBe('Bintang'); expect(read.attempts.map(a => a.profile)).toEqual(['Bunga', 'Daun']);
    disk.setItem(MATCH_STORAGE_KEY, '{bad'); expect(createMatchStore(disk).read().matches).toEqual([]); expect(store.read().attempts).toHaveLength(2);
  });
  test('bounds matches, rejects malformed entries and handles storage failure in memory', () => {
    const disk = storage(), store = createMatchStore(disk), record = { ...config, status: 'abandoned', rulesVersion: 'speed-v1', pauseCount: 0, rounds: [] };
    expect(store.add({ ...record, limitMs: -1 })).toBe(false);
    for (let i = 0; i < 55; i++) store.add({ ...record, id: String(i) });
    expect(store.read().matches).toHaveLength(50); expect(store.add({ ...record, id: '54' })).toBe(false);
    const unavailable = createMatchStore({ getItem() { return null; }, setItem() { throw new Error('Quota'); } });
    unavailable.add(record); expect(unavailable.isAvailable()).toBe(false); expect(unavailable.export().matches).toHaveLength(1); unavailable.reset(); expect(unavailable.read().matches).toEqual([]);
  });
  test('selects one distinct eligible shared sequence and excludes unrevised approvals', () => {
    const approved = letters.filter(letter => letter.geometry.status === 'approved');
    expect(eligiblePool(letters, 'pilot')).toHaveLength(approved.filter(letter => letter.pilot).length); expect(eligiblePool(letters, 'ready')).toHaveLength(approved.length); expect(eligiblePool(letters, 'additional')).toHaveLength(approved.filter(letter => letter.additional).length);
    const sequence = selectSequence(eligiblePool(letters, 'ready'), 5, () => .4); expect(new Set(sequence).size).toBe(5);
    const draft = structuredClone(letters[0]); draft.geometry.status = 'draft'; expect(eligiblePool([draft], 'ready')).toEqual([]);
  });
});
