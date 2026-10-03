import { distance, finitePoint, pointAt, projectLocal, movementSamples } from './geometry.js';
import { dotPointAllowed, validateDotMotion, validateDot } from './dotMatcher.js';

/** Pure gesture transactions. Raw input controls validation; only end commits. */
export function createMatcher(letter, references, profile, { compact = false } = {}) {
  const strokes = new Map(letter.geometry.strokes.map(s => [s.id, s]));
  const dots = new Map(letter.geometry.dotTargets.map(d => [d.id, d]));
  const progress = Object.fromEntries([...strokes.keys()].map(id => [id, 0]));
  let sequences = letter.geometry.validSequences.map(s => [...s]);
  let completed = [], active = null, gestureId = 0, exhausted = false;
  let phase = 'awaitingStart', feedback = 'Mula pada bulatan hijau.';
  const metrics = { invalidEvents: 0, invalidTravel: 0, validTravel: 0, errorIntegral: 0, maxError: 0,
    backwardTravel: 0, teleports: 0, lifts: 0, samples: 0, blockedGestures: 0,
    wrongStartGestures: 0, rejectedDotGestures: 0, rollbackCount: 0 };
  const totalLength = Object.values(references).reduce((n, r) => n + r.length, 0);
  const pending = () => [...new Set(sequences.map(s => s[completed.length]).filter(Boolean))];
  const awaiting = () => dots.has(pending()[0]) ? 'awaitingMark' : 'awaitingStart';

  function snapshot() {
    const covered = Object.entries(progress).reduce((sum, [id, s]) => sum + Math.min(s, references[id].length), 0);
    return {
      phase, feedback, completed: [...completed], pending: pending(), active: active?.id || null,
      blocked: Boolean(active?.rejected), progress: { ...progress }, profile: { ...profile },
      interactionPolicy: 'strict-v2', inkPolicy: 'validatedSegments', dotInputPolicy: 'validatedTapStamp',
      metrics: { ...metrics, coverage: totalLength ? covered / totalLength : 0,
        meanError: metrics.validTravel ? metrics.errorIntegral / metrics.validTravel : 0,
        dotCount: completed.filter(id => dots.has(id)).length },
      outcome: phase === 'complete' ? (profile.mode === 'precision' ? 'precisionComplete' : 'guidedComplete') : null,
    };
  }

  function response(action = 'none', gesture = active, extra = {}) {
    return { ...(compact ? { phase } : snapshot()), inputDecision: {
      gestureId: gesture?.gestureId ?? null, partId: gesture?.id ?? null, kind: gesture?.kind ?? null,
      action, acceptedRawPoints: [], discardGestureInk: false, clearPartInk: false,
      mark: null, reason: gesture?.reason ?? null, ...extra,
    } };
  }

  function reject(message, travel = 0, error = 0, reason = 'deviation') {
    if (!active) return response();
    if (!active.rejected) {
      metrics.invalidEvents++; metrics.blockedGestures++;
      if (active.kind === 'invalid') metrics.wrongStartGestures++;
      if (active.kind === 'dot') metrics.rejectedDotGestures++;
      if (active.kind === 'stroke') {
        progress[active.id] = active.baseline; metrics.rollbackCount++;
      }
      active.rejected = true; active.reason = reason;
    }
    metrics.invalidTravel += travel;
    metrics.maxError = Math.max(metrics.maxError, error);
    phase = exhausted ? 'retry' : 'blockedUntilLift'; feedback = message;
    return response('reject', active, { discardGestureInk: true });
  }

  function start(p) {
    if (active || phase === 'complete' || exhausted || phase === 'retry') return response();
    let selected = null;
    if (finitePoint(p)) for (const id of pending()) {
      const dot = dots.get(id), ref = references[id];
      const frontier = dot || pointAt(ref, progress[id]);
      const delta = distance(p, frontier);
      const local = dot ? null : projectLocal(p, ref, Math.max(0, progress[id] - profile.backwardJitter),
        Math.min(ref.length, progress[id] + profile.startRadius));
      const allowed = dot ? dotPointAllowed(dot, p, profile)
        : delta <= profile.startRadius && local && local.error <= profile.radius;
      if (allowed && (!selected || delta < selected.delta)) selected = { id, dot, delta };
    }
    active = { gestureId: ++gestureId, id: selected?.id || null,
      kind: selected ? (selected.dot ? 'dot' : 'stroke') : 'invalid',
      baseline: selected && !selected.dot ? progress[selected.id] : 0,
      down: p, raw: p, last: p, travel: 0, rejected: false, reason: null };
    if (!selected) return reject('Mula pada bulatan hijau. Angkat jari dan cuba semula.', 0, 0, 'wrongStart');
    phase = selected.dot ? 'awaitingMark' : 'tracing';
    feedback = selected.dot ? 'Sentuh titik, kemudian angkat jari.' : 'Ikut laluan perlahan-lahan.';
    return response('begin', active, { acceptedRawPoints: selected.dot ? [] : [p] });
  }

  function move(p) {
    if (!active) return response();
    if (!finitePoint(p)) return reject('Angkat jari dan cuba semula.', 0, 0, 'invalidCoordinate');
    const travel = finitePoint(active.raw) ? distance(active.raw, p) : 0;
    active.raw = p; active.travel += travel;
    if (++metrics.samples > profile.maxSamples) {
      exhausted = true;
      return reject('Papan penuh. Tekan Cuba lagi.', travel, 0, 'sampleLimit');
    }
    if (active.rejected) {
      metrics.invalidTravel += travel;
      return response('blocked');
    }
    if (travel > profile.maxRawGap) metrics.teleports++;
    if (active.kind === 'dot') {
      if (!validateDotMotion(dots.get(active.id), p, active.travel, profile))
        return reject('Sentuh titik sahaja. Angkat jari dan cuba semula.', active.travel, 0, 'dotDrag');
      return response();
    }
    if (travel > profile.maxRawGap)
      return reject('Laluan terkeluar. Angkat jari dan cuba semula.', travel, 0, 'rawGap');
    const ref = references[active.id], frontier = progress[active.id];
    const pathTravel = distance(active.last, p);
    if (pathTravel < 0.00001) return response();
    const behind = projectLocal(p, ref, Math.max(0, frontier - profile.maxRawGap), frontier);
    const ahead = projectLocal(p, ref, Math.max(0, frontier - profile.backwardJitter),
      Math.min(ref.length, frontier + Math.min(profile.maxAdvance, pathTravel * profile.advanceRatio + 2)));
    if (behind && behind.error < profile.radius && behind.s < frontier - profile.backwardJitter &&
      (!ahead || (ahead.error > profile.projectionTie && behind.error + 0.5 < ahead.error))) {
      metrics.backwardTravel += pathTravel;
      return reject('Ikut arah anak panah. Angkat jari dan cuba semula.', pathTravel, behind.error, 'backward');
    }
    let temporary = frontier, previous = active.last, errorIntegral = 0, maxError = 0;
    for (const sample of movementSamples(active.last, p, 3)) {
      const step = distance(previous, sample);
      const upper = Math.min(frontier + profile.maxAdvance, temporary + step * profile.advanceRatio + 2);
      let projection = projectLocal(sample, ref, Math.max(0, temporary - profile.backwardJitter), upper);
      const forward = projectLocal(sample, ref, temporary, upper);
      // Resolve quantised tight turns only within the same short arc interval.
      if (forward && projection && forward.error <= profile.radius && forward.error <= projection.error + profile.projectionTie)
        projection = forward;
      if (!projection || projection.error > profile.radius)
        return reject('Laluan terkeluar. Angkat jari dan cuba semula.', pathTravel, projection?.error || profile.radius, 'corridor');
      if (projection.s < frontier - profile.backwardJitter) {
        metrics.backwardTravel += pathTravel;
        return reject('Ikut arah anak panah. Angkat jari dan cuba semula.', pathTravel, projection.error, 'backward');
      }
      maxError = Math.max(maxError, projection.error); errorIntegral += projection.error * step;
      temporary = Math.max(temporary, projection.s); previous = sample;
    }
    progress[active.id] = temporary;
    metrics.validTravel += pathTravel; metrics.errorIntegral += errorIntegral;
    metrics.maxError = Math.max(metrics.maxError, maxError);
    active.last = p; feedback = 'Teruskan, ikut laluan ini.';
    return response('append', active, { acceptedRawPoints: [p] });
  }

  function commit(id) {
    completed.push(id);
    sequences = sequences.filter(s => s.slice(0, completed.length).every((entry, i) => entry === completed[i]));
    if (sequences.some(s => s.length === completed.length)) {
      const invalidBudget = Math.max(20, totalLength * profile.maxInvalidRatio);
      if (profile.mode === 'precision' && (metrics.invalidTravel > invalidBudget || metrics.invalidEvents > profile.maxInvalidEvents)) {
        phase = 'retry'; feedback = 'Mari cuba sekali lagi dengan lebih kemas.';
      } else { phase = 'complete'; feedback = 'Bagus! Semua bahagian sudah dijejak.'; }
    } else {
      phase = awaiting(); feedback = phase === 'awaitingMark' ? 'Sekarang, tambah titik.' : 'Bagus! Mula bahagian seterusnya.';
    }
  }

  function end(p) {
    if (!active) return response();
    if (!finitePoint(p)) return cancel();
    const movement = move(p), current = active;
    active = null;
    if (current.rejected) {
      phase = exhausted ? 'retry' : awaiting();
      feedback = exhausted ? 'Papan penuh. Tekan Cuba lagi.' : current.kind === 'dot' ? 'Sentuh titik di sini.'
        : current.baseline > 0 ? 'Sambung dari bulatan hijau.' : 'Mula semula pada bulatan hijau.';
      return response('reject', current, { discardGestureInk: true });
    }
    if (current.kind === 'dot') {
      const dot = dots.get(current.id);
      if (validateDot(dot, current.down, p, current.travel, profile)) {
        commit(current.id);
        return response('commit', current, { mark: { id: dot.id, x: dot.x, y: dot.y,
          radius: dot.visibleRadius, rendering: 'targetStamp', down: current.down, up: p } });
      }
      // Defensive final validation; a failed mark never becomes visible ink.
      active = current;
      reject('Sentuh titik di sini.', current.travel, 0, 'dotRelease');
      active = null; phase = awaiting();
      return response('reject', current, { discardGestureInk: true });
    }
    const stroke = strokes.get(current.id), ref = references[current.id];
    const checks = stroke.checkpoints || [0.25, 0.5, 0.75, 0.95];
    const satisfied = checks.every(fraction => progress[current.id] >= fraction * ref.length - 0.01);
    const acceptedRawPoints = movement.inputDecision.acceptedRawPoints;
    if (progress[current.id] >= ref.length * profile.coverage && satisfied && distance(p, pointAt(ref, ref.length)) <= profile.endRadius) {
      commit(current.id); return response('commit', current, { acceptedRawPoints });
    }
    metrics.lifts++;
    const restart = profile.mode === 'precision' && stroke.penLiftPolicy !== 'resume';
    if (restart) progress[current.id] = 0;
    phase = 'awaitingStart'; feedback = restart ? 'Cuba semula dari titik mula.' : 'Sambung dari bulatan hijau.';
    return response(restart ? 'cancel' : 'partial', current, { acceptedRawPoints,
      discardGestureInk: restart || progress[current.id] <= current.baseline, clearPartInk: restart });
  }

  function cancel() {
    if (!active) return response();
    const current = active;
    if (current.kind === 'stroke') progress[current.id] = 0;
    active = null; phase = exhausted ? 'retry' : awaiting(); feedback = 'Sentuh semula untuk meneruskan.';
    return response('cancel', current, { discardGestureInk: true, clearPartInk: current.kind === 'stroke' });
  }
  // Live read-only view: callers must take snapshot() before saving/exporting.
  const view = () => ({ phase, feedback, completed, pending: pending(), progress, profile, exhausted,
    blocked: Boolean(active?.rejected), metrics: { dotCount: completed.filter(id => dots.has(id)).length } });
  return { start, move, end, cancel, snapshot, view, isBusy: () => Boolean(active) };
}
