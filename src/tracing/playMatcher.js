import { distance, finitePoint, pointAt, projectLocal, projectSegment, arcSegments, movementSamples } from './geometry.js';

/** Assisted route progress. Raw movement validates it; display fill is never raw ink. */
export function createPlayMatcher(letter, references, profile, { compact = false } = {}) {
  const strokes = new Map(letter.geometry.strokes.map(s => [s.id, s]));
  const dots = new Map(letter.geometry.dotTargets.map(d => [d.id, d]));
  const progress = Object.fromEntries([...strokes.keys()].map(id => [id, 0]));
  const sourceProgress = { ...progress };
  const turnAllowance = { ...progress };
  const tightTurns = Object.fromEntries(Object.entries(references).map(([id,ref])=>[id,ref.vertices.filter(p=>{
    const a=pointAt(ref,Math.max(0,p.s-3)),b=pointAt(ref,Math.min(ref.length,p.s+3));
    const incoming={x:p.x-a.x,y:p.y-a.y},outgoing={x:b.x-p.x,y:b.y-p.y};
    return incoming.x*outgoing.x+incoming.y*outgoing.y < -.5*Math.hypot(incoming.x,incoming.y)*Math.hypot(outgoing.x,outgoing.y);
  })]));
  const acceptedTravel = { ...progress }, completionMethods = {};
  let sequences = letter.geometry.validSequences.map(s => [...s]);
  let completed = [], active = null, gestureId = 0, bufferSamples = 0, exhausted = false;
  let phase = 'awaitingStart', feedback = 'Ikut titik ini.';
  const metrics = { invalidEvents: 0, invalidTravel: 0, validTravel: 0, errorIntegral: 0,
    maxError: 0, backwardTravel: 0, teleports: 0, lifts: 0, samples: 0,
    pauseEpisodes: 0, resumeCount: 0, ignoredStartGestures: 0, equivalentDotActions: 0,
    terminalDisplayFillUnits: 0, turnProjectionAllowanceUnits: 0, diagnosticRotations: 0,
    endpointConfirmations: 0, releaseAssistances: 0 };
  const totalLength = Object.values(references).reduce((n, ref) => n + ref.length, 0);
  const pending = () => [...new Set(sequences.map(s => s[completed.length]).filter(Boolean))];
  // One predicate serves both held feedback and release validation.
  function finishStatus(gesture = active) {
    const id = gesture?.kind === 'stroke' && gesture.id || pending().find(id => strokes.has(id));
    if (!id) return null;
    const ref = references[id], frontier = progress[id], remainingArc = ref.length - frontier;
    const checkpointsSatisfied = (strokes.get(id).checkpoints || [.25, .5, .75, .95]).every(f => frontier >= f * ref.length - .01);
    const coverageSatisfied = frontier >= profile.coverage * ref.length;
    const confirmationAvailable = pending().includes(id) && acceptedTravel[id] > 0 && coverageSatisfied && checkpointsSatisfied && !exhausted;
    const reach = profile.endRadius + (gesture?.confirmation ? profile.finishReleaseSlack : 0);
    const canFinish = Boolean(gesture?.id === id && !gesture.paused && confirmationAvailable && (gesture.confirmation || gesture.validTravel > 0) &&
      finitePoint(gesture.raw) && distance(gesture.raw, pointAt(ref, ref.length)) <= reach);
    // A finger that reached the end and then drifted past it can still lift to finish.
    const liftReady = canFinish || Boolean(gesture?.id === id && gesture.reachedEnd && gesture.paused && confirmationAvailable);
    return { partId: id, frontier, remainingArc, checkpointsSatisfied, coverageSatisfied,
      confirmationAvailable, confirmationActive: Boolean(gesture?.confirmation),
      nearEnd: remainingArc <= profile.startRadius, canFinish, liftReady };
  }
  const waiting = () => {
    phase = dots.has(pending()[0]) ? 'awaitingMark' : 'awaitingStart';
    feedback = phase === 'awaitingMark' ? 'Sentuh titik ini.'
      : (progress[pending()[0]] || 0) > 0 ? 'Sambung di sini.' : 'Ikut titik ini.';
  };
  function snapshot() {
    const covered = Object.entries(progress).reduce((n, [id, s]) => n + s, 0);
    const finish = finishStatus();
    const cue = (phase === 'tracing' || finish?.liftReady) && finish?.nearEnd ? finish.liftReady ? 'Angkat jari untuk siap.' : 'Ikut hingga hujung.' : feedback;
    return { phase, feedback: cue, reason: active?.reason || null, finish, pending: pending(), completed: [...completed],
      active: active?.id || null, gestureActive: Boolean(active), blocked: false,
      progress: { ...progress }, profile: { ...profile }, exhausted,
      interactionPolicy: profile.interactionPolicy, inkPolicy: 'assistedRouteFill',
      completionMethods: { ...completionMethods },
      dotInputPolicy: 'validatedTapOrEquivalentPad', displayAssistance: 'routeFill',
      metrics: { ...metrics, coverage: totalLength ? covered / totalLength : 0,
        meanError: metrics.validTravel ? metrics.errorIntegral / metrics.validTravel : 0,
        dotCount: completed.filter(id => dots.has(id)).length },
      outcome: phase === 'complete' ? 'playComplete' : null };
  }
  // The board needs the decision synchronously, not a copied export per sample.
  const response = (action = 'none', gesture = active, extra = {}) => ({ ...(compact ? { phase } : snapshot()), inputDecision: {
    gestureId: gesture?.gestureId ?? null, partId: gesture?.id ?? null,
    kind: gesture?.kind ?? null, action, reason: gesture?.reason ?? null,
    inputSource: gesture?.inputSource ?? null, confirmation: Boolean(gesture?.confirmation),
    acceptedRawPoints: [], mark: null, ...extra,
  } });
  // Once the finger has reached the end with coverage and checkpoints met, the stroke is done.
  // Where the finger goes afterwards (a flick, a slow drift, off the board) cannot undo it.
  const driftReasons = new Set(['corridor', 'rawGap', 'backward', 'advanceGap']);
  function finishAfterEnd(gesture) {
    if (!gesture || gesture.kind !== 'stroke' || gesture.confirmation || !gesture.reachedEnd || exhausted) return false;
    return Boolean(finishStatus(gesture)?.confirmationAvailable);
  }
  function pause(reason, travel = 0, error = 0) {
    if (!active) return response();
    if (driftReasons.has(reason) && finishAfterEnd(active)) {
      const current = active, ref = references[current.id];
      active = null; completionMethods[current.id] = 'releaseAssistance';
      metrics.releaseAssistances++; metrics.terminalDisplayFillUnits += ref.length - progress[current.id];
      commit(current.id); return response('commit', current, { completionMethod: 'releaseAssistance' });
    }
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
      // A projection clipped at acquisitionArc must not arm an endpoint tap ahead
      // of the missing interval. Re-entry still adds no coverage.
      const contact = projectLocal(p, ref, Math.max(0, frontier - profile.backwardJitter), Math.min(ref.length, frontier + profile.startRadius));
      if (delta <= profile.startRadius && near?.error <= profile.radius && contact?.s <= frontier + profile.acquisitionArc && (!selected || delta < selected.delta))
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
      last: null, travel: 0, validTravel: 0, paused: false, reason: null, inputSource: 'board' };
    const dot = pending().map(id => dots.get(id)).find(d => d && dotAllowed(d, p));
    if (dot) {
      active.id = dot.id; active.kind = 'dot'; phase = 'awaitingMark'; feedback = 'Sentuh titik ini.';
      return response('begin');
    }
    for (const id of pending()) {
      if (!strokes.has(id) || !finishStatus({ id, kind: 'stroke' }).confirmationAvailable) continue;
      if (distance(p, pointAt(references[id], references[id].length)) > profile.endRadius) continue;
      active.id = id; active.last = p; active.confirmation = true;
      active.inputSource = 'endpointConfirmation'; phase = 'tracing';
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
    if (active.confirmation) {
      if (active.paused) { metrics.invalidTravel += travel; return response('pause'); }
      const ref = references[active.id];
      if (distance(p, pointAt(ref, ref.length)) > profile.endRadius + profile.finishOvershoot || active.travel > profile.endRadius * 2)
        return pause('confirmationDrag', travel);
      return response(); // Confirmation never adds measured tracing travel or coverage.
    }
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
      const upper = Math.min(ref.length, sourceFrontier + profile.maxAdvance);
      const ahead = projectLocal(p, ref, sourceFrontier, upper);
      const before = ahead && pointAt(ref, Math.max(sourceFrontier, ahead.s-3));
      const after = ahead && pointAt(ref, Math.min(ref.length, ahead.s+3));
      // Beside a hairpin the incoming branch can be closer than the forward
      // return branch. Require a real, direction-consistent local projection;
      // this exemption earns no credit and leaves the bounded walk below intact.
      const forwardTurn = ahead && ahead.s > sourceFrontier && ahead.s < upper-.01 &&
        ahead.s-sourceFrontier <= travel*profile.advanceRatio+profile.backwardJitter &&
        (p.x-active.last.x)*(after.x-before.x)+(p.y-active.last.y)*(after.y-before.y) > 0 &&
        tightTurns[active.id].some(turn=>turn.s >= sourceFrontier-profile.maxRawGap && turn.s <= ahead.s &&
          (sourceFrontier>turn.s || distance(active.last,turn)<=profile.backwardJitter));
      if (!forwardTurn && (!ahead || behind.error + profile.projectionTie < ahead.error)) {
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
      const [first, end] = arcSegments(ref, source, upper);
      for (let i = first; i < end; i++) {
        const a = ref.vertices[i-1], b = ref.vertices[i];
        if ((sample.x-previous.x)*(b.x-a.x)+(sample.y-previous.y)*(b.y-a.y) <= 0) continue;
        const candidate = projectSegment(sample, a, b, Math.max(source, a.s), Math.min(upper, b.s));
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
          // The enclosing real input covers the turn; its synthetic 3-unit
          // samples can fall between near-overlapping branches at the apex.
          motion.s-source <= travel*profile.advanceRatio+profile.backwardJitter &&
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
    active.validTravel += travel;
    acceptedTravel[active.id] += travel;
    metrics.validTravel += travel; metrics.errorIntegral += errorIntegral;
    metrics.maxError = Math.max(metrics.maxError, maxError);
    if (!active.reachedEnd && temporary >= profile.coverage * ref.length && finishStatus(active).canFinish) active.reachedEnd = true;
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
    const before = finishStatus(), beforeRaw = active.raw;
    const mayAssist = active.kind === 'stroke' && !active.confirmation && before?.canFinish;
    const previousSource = Math.max(progress[active.id] || 0, active.projectionS || 0);
    const moved = move(p);
    if (moved.inputDecision.action === 'commit') return moved; // The finish was reached and the finger then left the route.
    const current = active, ready = finishStatus(current)?.canFinish;
    let assisted = false;
    if (!ready && finishAfterEnd(current)) assisted = true;
    else if (!ready && mayAssist && !exhausted && (!current.paused || current.reason === 'corridor')) {
      const ref = references[current.id];
      // Search behind the terminal contact far enough to detect a real reversal.
      const projection = projectLocal(p, ref, Math.max(0, previousSource - profile.maxRawGap), ref.length);
      assisted = finishStatus(current).confirmationAvailable &&
        distance(p, pointAt(ref, ref.length)) <= profile.endRadius + profile.finishReleaseSlack &&
        distance(p, beforeRaw) <= profile.finishReleaseTravel &&
        projection && projection.s >= previousSource - profile.backwardJitter;
    }
    active = null;
    if (current.kind === 'dot' && !current.paused) {
      const dot = dots.get(current.id);
      if (current.bounds) metrics.equivalentDotActions++;
      commit(dot.id);
      return response('commit', current, { mark: { id: dot.id, x: dot.x, y: dot.y,
        radius: dot.visibleRadius, rendering: 'targetStamp', inputSource: current.inputSource,
        coordinateSpace: current.bounds ? 'clientCSS' : 'boardLogical', down: current.down, up: p } });
    }
    if (current.kind === 'stroke' && current.id && !exhausted) {
      const ref = references[current.id];
      if (ready || assisted) {
        const completionMethod = current.confirmation ? 'endpointConfirmation' : assisted ? 'releaseAssistance' : 'tracedRelease';
        if (current.confirmation) metrics.endpointConfirmations++;
        if (assisted) metrics.releaseAssistances++;
        completionMethods[current.id] = completionMethod;
        metrics.terminalDisplayFillUnits += ref.length - progress[current.id];
        commit(current.id); return response('commit', current, { completionMethod });
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
  function view() {
    const finish = finishStatus();
    return { phase, reason: active?.reason || null, feedback: (phase === 'tracing' || finish?.liftReady) && finish?.nearEnd ? finish.liftReady ? 'Angkat jari untuk siap.' : 'Ikut hingga hujung.' : feedback,
      finish, pending: pending(), completed, progress, profile, exhausted, blocked: false,
      metrics: { dotCount: completed.filter(id => dots.has(id)).length } };
  }
  return { start, move, end, cancel, startPad, rotateDiagnostics, snapshot, view, isBusy: () => Boolean(active) };
}
