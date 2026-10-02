export const RULES_VERSION = 'speed-v1';
export const scoringTime = ms => Math.ceil(ms / 100) * 100;
export function roundScore(outcome, elapsedMs, limitMs) {
  if (outcome !== 'playComplete' || !Number.isFinite(elapsedMs) || elapsedMs < 0 ||
      !Number.isFinite(limitMs) || limitMs <= 0 || elapsedMs > limitMs) {
    return { base: 0, bonus: 0, total: 0, elapsedMs: limitMs, outcome: 'timeout' };
  }
  const duration = Math.min(limitMs, scoringTime(elapsedMs));
  const bonus = Math.max(0, Math.min(100, Math.round(100 * (1 - duration / limitMs))));
  return { base: 100, bonus, total: 100 + bonus, elapsedMs: duration, outcome: 'playComplete' };
}
export function matchAwards(mode, rounds, playerCount) {
  const totals = Array.from({ length: playerCount }, (_, slot) => rounds.reduce((n, round) => n + (round.players[slot]?.total || 0), 0));
  const durations = Array.from({ length: playerCount }, (_, slot) => rounds.reduce((n, round) => n + (round.players[slot]?.elapsedMs || 0), 0));
  if (mode === 'solo') {
    const complete = rounds.length > 0 && rounds.every(round => round.players[0]?.outcome === 'playComplete');
    const trophy = !complete ? null : totals[0] >= 170 * rounds.length ? 'gold' : totals[0] >= 140 * rounds.length ? 'silver' : 'bronze';
    return { totals, durations, winners: trophy ? [0] : [], trophy, shared: false, tieBreak: false };
  }
  if (!Math.max(...totals)) return { totals, durations, winners: [], trophy: null, shared: false, tieBreak: false };
  const equal = totals[0] === totals[1];
  const shared = equal && Math.abs(durations[0] - durations[1]) <= 100;
  const winners = shared ? [0, 1] : [equal ? (durations[0] < durations[1] ? 0 : 1) : (totals[0] > totals[1] ? 0 : 1)];
  return { totals, durations, winners, trophy: 'gold', shared, tieBreak: equal && !shared };
}
