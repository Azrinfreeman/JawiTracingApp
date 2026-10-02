import { distance, finitePoint, pointAt, projectLocal, movementSamples } from './geometry.js';

/** Assisted route progress. Raw movement validates it; display fill is never raw ink. */
export function createPlayMatcher(letter, references, profile) {
  const strokes = new Map(letter.geometry.strokes.map(s => [s.id, s]));
  const dots = new Map(letter.geometry.dotTargets.map(d => [d.id, d]));
  const progress = Object.fromEntries([...strokes.keys()].map(id => [id, 0]));
  const sourceProgress = { ...progress };
  const turnAllowance = { ...progress };
  let sequences = letter.geometry.validSequences.map(s => [...s]);
  let completed = [], active = null, gestureId = 0, bufferSamples = 0, exhausted = false;
  let phase = 'awaitingStart', feedback = 'Ikut titik ini.';
  const metrics = { invalidEvents: 0, invalidTravel: 0, validTravel: 0, errorIntegral: 0,
    maxError: 0, backwardTravel: 0, teleports: 0, lifts: 0, samples: 0,
    pauseEpisodes: 0, resumeCount: 0, ignoredStartGestures: 0, equivalentDotActions: 0,
    terminalDisplayFillUnits: 0, turnProjectionAllowanceUnits: 0, diagnosticRotations: 0 };
  const totalLength = Object.values(references).reduce((n, ref) => n + ref.length, 0);
  const pending = () => [...new Set(sequences.map(s => s[completed.length]).filter(Boolean))];
  const waiting = () => {
    phase = dots.has(pending()[0]) ? 'awaitingMark' : 'awaitingStart';
    feedback = phase === 'awaitingMark' ? 'Sentuh titik ini.'
      : (progress[pending()[0]] || 0) > 0 ? 'Sambung di sini.' : 'Ikut titik ini.';
  };
  function snapshot() {
    const covered = Object.entries(progress).reduce((n, [id, s]) => n + s, 0);
    return { phase, feedback, pending: pending(), completed: [...completed],
      active: active?.id || null, gestureActive: Boolean(active), blocked: false,
      progress: { ...progress }, profile: { ...profile }, exhausted,
      interactionPolicy: 'play-guided-v1', inkPolicy: 'assistedRouteFill',
      dotInputPolicy: 'validatedTapOrEquivalentPad', displayAssistance: 'routeFill',
      metrics: { ...metrics, coverage: totalLength ? covered / totalLength : 0,
        meanError: metrics.validTravel ? metrics.errorIntegral / metrics.validTravel : 0,
        dotCount: completed.filter(id => dots.has(id)).length },
      outcome: phase === 'complete' ? 'playComplete' : null };
  }
  const response = (action = 'none', gesture = active, extra = {}) => ({ ...snapshot(), inputDecision: {
    gestureId: gesture?.gestureId ?? null, partId: gesture?.id ?? null,
    kind: gesture?.kind ?? null, action, reason: gesture?.reason ?? null,
    acceptedRawPoints: [], mark: null, ...extra,
  } });
  function pause(reason, travel = 0, error = 0) {
    if (!active) return response();
    if (!active.paused) { metrics.pauseEpisodes++; metrics.invalidEvents++; }
    active.paused = true; active.last = null; active.reason = reason;
    metrics.invalidTravel += travel; metrics.maxError = Math.max(metrics.maxError, error);
    phase = 'paused'; feedback = active.kind === 'dot' ? 'Sentuh titik ini.' : 'Sambung di sini.';
    return response('pause');
  }
  function dotAllowed(dot, p) {
    if (!finitePoint(p) || dot.policy !== 'tap') return false;
    const separation = Math.min(Infinity, ...[...dots.values()].filter(d => d.id !== dot.id).map(d => distance(dot, d)));
    return distance(dot, p) <= Math.min(profile.dotRadius, dot.hitRadius ?? profile.dotRadius, separation * 0.45);
  }
  function acquire(p) {
    let selected = null;
    for (const id of pending()) {
      if (dots.has(id)) continue; // Marks always need their own fresh down/up.
      const ref = references[id], frontier = progress[id];
      const near = projectLocal(p, ref, Math.max(0, frontier - profile.backwardJitter),
        Math.min(ref.length, frontier + profile.acquisitionArc));
      const delta = distance(p, pointAt(ref, frontier));
      if (delta <= profile.startRadius && near?.error <= profile.radius && (!selected || delta < selected.delta))
        selected = { id, delta, projectionS: near.s };
    }
    if (!selected) return false;
    const resuming = active.paused;
    active.id = selected.id; active.kind = 'stroke'; active.last = p;
    active.projectionS = Math.max(sourceProgress[selected.id], selected.projectionS);
    active.paused = false; active.reason = null;
    if (resuming) metrics.resumeCount++;
    phase = 'tracing'; feedback = 'Ikut titik ini.';
    return true;
  }
  function start(p) {
    if (active || phase === 'complete' || exhausted || !finitePoint(p)) return response();
    active = { gestureId: ++gestureId, id: null, kind: 'stroke', down: p, raw: p,
      last: null, travel: 0, paused: false, reason: null, inputSource: 'board' };
    const dot = pending().map(id => dots.get(id)).find(d => d && dotAllowed(d, p));
    if (dot) {
      active.id = dot.id; active.kind = 'dot'; phase = 'awaitingMark'; feedback = 'Sentuh titik ini.';
      return response('begin');
    }
    if (acquire(p)) return response('begin');
    metrics.ignoredStartGestures++;
    return pause('wrongStart');
  }
  const inPad = (p, box) => finitePoint(p) && p.x >= box.x && p.x <= box.x + box.width &&
    p.y >= box.y && p.y <= box.y + box.height;
  function startPad(id, p, bounds, inputSource = 'equivalentPad') {
    if (active || phase === 'complete' || exhausted || !dots.has(id) || !pending().includes(id) ||
      !bounds || !['x', 'y', 'width', 'height'].every(k => Number.isFinite(bounds[k])) ||
      bounds.width < 48 || bounds.height < 48 || !inPad(p, bounds)) return response();
    active = { gestureId: ++gestureId, id, kind: 'dot', down: p, raw: p, travel: 0,
      paused: false, reason: null, inputSource, bounds: { ...bounds } };
    phase = 'awaitingMark'; feedback = 'Sentuh titik ini.';
    return response('begin');
  }
  function move(p) {
    if (!active) return response();
    if (!finitePoint(p)) return pause('invalidCoordinate');
    const travel = distance(active.raw, p);
    active.raw = p; active.travel += travel; metrics.samples++;
    if (++bufferSamples > profile.maxSamples) { exhausted = true; return pause('sampleLimit', travel); }
    if (active.kind === 'dot') {
      if (active.paused) { metrics.invalidTravel += travel; return response('pause'); }
      const allowed = active.bounds ? inPad(p, active.bounds) && active.travel <= profile.padTravel
        : dotAllowed(dots.get(active.id), p) && active.travel <= Math.min(profile.dotTravel, dots.get(active.id).maxTravel ?? profile.dotTravel);
      if (!allowed) return pause('dotDrag', active.travel);
      return response();
    }
    if (active.paused) {
      metrics.invalidTravel += travel;
      return acquire(p) ? response('resume') : response('pause');
    }
    if (travel > profile.maxRawGap) { metrics.teleports++; return pause('rawGap', travel); }
    if (travel < 0.00001) return response();
    const ref = references[active.id], frontier = progress[active.id];
    const sourceFrontier = Math.max(frontier, active.projectionS);
    const behind = projectLocal(p, ref, Math.max(0, sourceFrontier - profile.maxRawGap), sourceFrontier);
    if (behind?.error <= profile.radius && behind.s < sourceFrontier - profile.backwardJitter) {
      const ahead = projectLocal(p, ref, sourceFrontier, Math.min(ref.length, sourceFrontier + profile.maxAdvance));
      if (!ahead || behind.error + profile.projectionTie < ahead.error) {
        metrics.backwardTravel += travel; return pause('backward', travel, behind.error);
      }
    }
    let temporary = frontier, projectedHighWater = active.projectionS, previous = active.last, errorIntegral = 0, maxError = 0, extraCredit = 0;
    for (const sample of movementSamples(active.last, p, 3)) {
      const step = distance(previous, sample);
      const source = Math.max(temporary, projectedHighWater);
      const upper = Math.min(ref.length, sourceFrontier + profile.maxAdvance, source + profile.maxAdvance);
      let projection = projectLocal(sample, ref, Math.max(0, source - profile.backwardJitter), upper);
      // Resolve overlapping ascending/descending turns using raw movement direction.
      // Each candidate is a real projection on an authored segment, never a
      // synthetic advancing edge of a search window.
      let motion = null;
      for (let i = 1; i < ref.vertices.length; i++) {
        const a = ref.vertices[i-1], b = ref.vertices[i];
        if (b.s < source || a.s > upper) continue;
        if ((sample.x-previous.x)*(b.x-a.x)+(sample.y-previous.y)*(b.y-a.y) <= 0) continue;
        const candidate = projectLocal(sample, ref, Math.max(source, a.s), Math.min(upper, b.s));
        if (candidate && (!motion || candidate.error < motion.error - .00001 || (Math.abs(candidate.error-motion.error)<.00001 && candidate.s<motion.s))) motion=candidate;
      }
      if (motion && projection && motion.error <= projection.error + profile.projectionTie && motion.s < upper - .01)
        projection = motion;
      if (!projection || projection.error > profile.radius)
        return pause('corridor', travel, projection?.error || profile.radius);
      // Do not bias equal-distance projections forwards: a wiggle at a loop centre earns no lap.
      let forward = Math.max(0, projection.s - source);
      if (forward > step * profile.advanceRatio + 0.01) {
        // At a quantised hairpin the adjacent return branch can be slightly closer.
        // Prefer a genuine local minimum within the tie band; never credit the
        // artificial edge of a clipped search window (that would ratchet wiggles).
        const limit = Math.min(upper, source + step * profile.advanceRatio + profile.projectionTie);
        const local = projectLocal(sample, ref, Math.max(0, source - profile.backwardJitter), limit);
        let genuineTurn = false;
        const turnSteps = Math.max(1, Math.ceil(((motion?.s || source)-source)/3));
        if (motion && motion.s < upper - .01 && motion.error <= profile.radius &&
          motion.s-source <= step*profile.advanceRatio+profile.backwardJitter &&
          Array.from({length:turnSteps+1},(_,i)=>pointAt(ref,source+(motion.s-source)*i/turnSteps)).every(q=>distance(q,sample)<=profile.radius)) {
          projection=motion; genuineTurn=true;
        } else if (!local || local.error > profile.radius || local.error > projection.error + profile.projectionTie) {
          return pause('advanceGap', travel, projection.error);
        } else if (local.s >= limit - .01 && projection.s > limit + .01) {
          const anchor = pointAt(ref, source);
          projection = { ...anchor, s: source, error: distance(sample, anchor) };
          if (projection.error > profile.radius) return pause('corridor', travel, projection.error);
        } else projection = local;
        // A bounded per-stroke allowance accommodates the arc/chord difference
        // at genuine tight turns. It survives every lift and diagnostic rotation.
        const delta = Math.max(0, projection.s-source), remaining = Math.max(0, profile.turnAllowance-turnAllowance[active.id]-extraCredit);
        forward = Math.min(delta, step*profile.advanceRatio+(genuineTurn?remaining:0));
        extraCredit += Math.max(0, forward-step*profile.advanceRatio);
      }
      if (forward > 0.00001) {
        const from = pointAt(ref, source), to = pointAt(ref, projection.s);
        const directed = (sample.x - previous.x) * (to.x - from.x) + (sample.y - previous.y) * (to.y - from.y);
        if (directed > 0) temporary = Math.min(projection.s, temporary + forward);
      }
      maxError = Math.max(maxError, projection.error); errorIntegral += projection.error * step;
      previous = sample;
      projectedHighWater = Math.max(projectedHighWater, projection.s);
    }
    progress[active.id] = temporary; sourceProgress[active.id] = projectedHighWater;
    turnAllowance[active.id] += extraCredit; metrics.turnProjectionAllowanceUnits += extraCredit;
    active.last = p; active.projectionS = projectedHighWater;
    metrics.validTravel += travel; metrics.errorIntegral += errorIntegral;
    metrics.maxError = Math.max(metrics.maxError, maxError);
    return response('advance', active, { frontier: temporary });
  }
  function commit(id) {
    completed.push(id);
    sequences = sequences.filter(s => s.slice(0, completed.length).every((entry, i) => entry === completed[i]));
    if (sequences.some(s => s.length === completed.length)) { phase = 'complete'; feedback = 'Kamu sudah ikut semua bahagian!'; }
    else waiting();
  }
  function end(p) {
    if (!active) return response();
    if (!finitePoint(p)) return cancel();
    move(p); const current = active; active = null;
    if (current.kind === 'dot' && !current.paused) {
      const dot = dots.get(current.id);
      if (current.bounds) metrics.equivalentDotActions++;
      commit(dot.id);
      return response('commit', current, { mark: { id: dot.id, x: dot.x, y: dot.y,
        radius: dot.visibleRadius, rendering: 'targetStamp', inputSource: current.inputSource,
        coordinateSpace: current.bounds ? 'clientCSS' : 'boardLogical', down: current.down, up: p } });
    }
    if (current.kind === 'stroke' && current.id && !current.paused && !exhausted) {
      const stroke = strokes.get(current.id), ref = references[current.id];
      if (progress[current.id] >= profile.coverage * ref.length &&
        (stroke.checkpoints || [.25, .5, .75, .95]).every(f => progress[current.id] >= f * ref.length - .01) &&
        distance(p, pointAt(ref, ref.length)) <= profile.endRadius) {
        metrics.terminalDisplayFillUnits += ref.length - progress[current.id];
        commit(current.id); return response('commit', current);
      }
    }
    metrics.lifts++; waiting();
    return response('partial', current);
  }
  function cancel() {
    if (!active) return response();
    const current = active; active = null; waiting();
    return response('cancel', current);
  }
  function rotateDiagnostics() {
    cancel(); bufferSamples = 0; exhausted = false; metrics.diagnosticRotations++;
    return response();
  }
  return { start, move, end, cancel, startPad, rotateDiagnostics, snapshot };
}
