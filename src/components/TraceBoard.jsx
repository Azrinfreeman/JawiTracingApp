import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createMatcher } from '../tracing/matcher.js';
import { createPlayMatcher } from '../tracing/playMatcher.js';
import { DotTapPad } from './DotTapPad.jsx';
import { PlayFeedback } from './PlayFeedback.jsx';
import { NumberedTraceGuides } from './NumberedTraceGuides.jsx';
import { numberedGuidePlan, guideInstruction } from '../tracing/numberedGuides.js';
import { prepareReferences } from '../tracing/prepareReference.js';
import { getProfile } from '../tracing/profiles.js';
import { attachInput } from '../tracing/inputController.js';
import { finitePoint, pointAt } from '../tracing/geometry.js';

const NS = 'http://www.w3.org/2000/svg';
export const TraceBoard = forwardRef(function TraceBoard({ letter, mode, activity, attempt, demo, adjustment, onDemoEnd, onComplete, onDiagnostic, enabled = true, profileOverride, onValidated, now = performance.now.bind(performance), compact = false }, ref) {
  const patternId = useId().replace(/:/g, '');
  const enabledRef = useRef(enabled); enabledRef.current = enabled;
  const svgRef = useRef(null), inkRef = useRef(null), demoRef = useRef(null);
  const inputRef = useRef(null), demoActive = useRef(demo);
  demoActive.current = demo;
  const isCopy = activity === 'copy', isPlay = mode === 'play' && !isCopy;
  const demoReset = isPlay ? false : demo;
  const inkData = useRef([]), callbacks = useRef({ onComplete, onDemoEnd, onDiagnostic, onValidated, now });
  callbacks.current = { onComplete, onDemoEnd, onDiagnostic, onValidated, now };
  const [state, setState] = useState(null);
  const [references, setReferences] = useState({});
  const [hint, setHint] = useState(false), [scale, setScale] = useState(1);
  useImperativeHandle(ref, () => ({ cancel: () => inputRef.current?.cancel(), isBusy: () => demoActive.current || Boolean(inputRef.current?.isBusy()), exportInk: () => inkData.current.map(line => line.map(p => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }))) }), []);
  useEffect(() => { if (!enabled) inputRef.current?.cancel(); }, [enabled]);

  useEffect(() => {
    const svg = svgRef.current, group = inkRef.current;
    group.replaceChildren(); demoRef.current.replaceChildren(); inkData.current = [];
    const prepared = prepareReferences(letter);
    setReferences(prepared);
    const makeEngine = type => (isPlay ? createPlayMatcher : createMatcher)(letter, prepared, profileOverride || getProfile(mode, type, adjustment));
    let engine = makeEngine('mouse');
    setState(engine.snapshot());
    let pointerType = null, pointCount = 0, reported = false, validated = false, disposed = false, inkLimit = false;
    let rawGesture = null, rawGestureId = 0;
    const rawGestures = [], records = new Map(), dirty = new Set();
    const inputSources = new Set();
    let timing = { samples: 0, totalMs: 0, maxMs: 0 };

    function removeRecord(id) {
      const record = records.get(id);
      if (record) { record.node.remove(); dirty.delete(record); records.delete(id); }
    }
    function decide(result) {
      // Capture acceptance during input handling, before the next animation frame.
      if (!validated && !inkLimit && result.phase === 'complete') {
        validated = true;
        callbacks.current.onValidated?.({ ...engine.snapshot(), pointerType, inputSources: [...inputSources], timing, validatedAt: callbacks.current.now() });
      }
      const decision = result.inputDecision;
      if (!decision || decision.gestureId === null) return;
      if (rawGesture) {
        rawGesture.gestureId = decision.gestureId;
        rawGesture.partId = decision.partId; rawGesture.kind = decision.kind;
        if (decision.reason) rawGesture.reason = decision.reason;
        if (['reject', 'commit', 'partial', 'cancel', 'pause', 'resume'].includes(decision.action)) rawGesture.status = decision.action;
        if (isPlay && ['pause', 'resume'].includes(decision.action)) {
          const previous = rawGesture.intervals?.at(-1);
          if (!previous || previous.action !== decision.action) {
            rawGesture.intervals ||= [];
            rawGesture.intervals.push({ action: decision.action, pointIndex: rawGesture.points.length - 1, reason: decision.reason });
          }
        }
        if (decision.mark) rawGesture.mark = decision.mark;
      }
      if (decision.clearPartInk) {
        for (const [id, record] of records) if (record.partId === decision.partId) removeRecord(id);
      }
      if (decision.discardGestureInk) { removeRecord(decision.gestureId); return; }
      if (!isPlay && decision.action === 'begin' && decision.kind === 'stroke') {
        const node = document.createElementNS(NS, 'path');
        node.setAttribute('class', 'pupil-ink');
        group.append(node);
        records.set(decision.gestureId, { node, partId: decision.partId, points: [] });
      }
      const record = records.get(decision.gestureId);
      if (record) for (const p of decision.acceptedRawPoints) {
        const previous = record.points.at(-1);
        if (!previous || previous.x !== p.x || previous.y !== p.y) { record.points.push(p); dirty.add(record); }
      }
      if (decision.mark) {
        const node = document.createElementNS(NS, 'circle');
        node.setAttribute('class', isPlay ? 'validated-dot play-dot' : 'validated-dot');
        node.setAttribute('cx', decision.mark.x); node.setAttribute('cy', decision.mark.y);
        node.setAttribute('r', decision.mark.radius);
        group.append(node);
        records.set(decision.gestureId, { node, partId: decision.partId, points: [], mark: decision.mark });
      }
    }
    const captureRaw = p => {
      if (!finitePoint(p) || !rawGesture) return false;
      if (pointCount >= 18000) {
        inkLimit = true;
        if (activity !== 'copy') decide(engine.cancel());
        rawGesture.status = 'cancel'; rawGesture.reason = 'sampleLimit';
        return false;
      }
      pointCount++; rawGesture.points.push(p);
      return true;
    };
    const paint = () => {
      if (disposed) return;
      for (const record of dirty) if (record.points.length) {
        record.node.setAttribute('d', record.points.map((p, i) => (i ? 'L' : 'M') + ' ' + p.x + ' ' + p.y).join(' ')
          + (record.points.length === 1 ? ' l 0.1 0.1' : ''));
      }
      dirty.clear();
      if (activity === 'copy') {
        if (inkLimit || rawGestures.length >= 100) setState(previous => ({ ...previous, inkLimit: true }));
        return;
      }
      let next = engine.snapshot();
      if (isPlay && next.phase !== 'complete' && (rawGestures.length >= 100 || next.exhausted)) {
        inkLimit = true; decide(engine.cancel()); next = engine.snapshot();
      }
      if (inkLimit) { next.inkLimit = true; next.feedback = isPlay ? 'Sambung di sini.' : 'Papan penuh. Tekan Cuba lagi.'; }
      setState(next);
      callbacks.current.onDiagnostic?.({ ...next, timing, rawInk: rawGestures.map(g => g.points),
        rawGestures, visibleInk: [...records.values()].filter(r => !r.mark).map(r => ({ partId: r.partId, points: r.points })),
        assistedMarks: [...records.values()].filter(r => r.mark).map(r => r.mark),
        ...(isPlay ? { assistedFill: letter.geometry.strokes.map(stroke => ({ partId: stroke.id,
          measuredFrontier: next.progress[stroke.id], displayFrontier: next.completed.includes(stroke.id) ? prepared[stroke.id].length : next.progress[stroke.id], source: 'authoredGeometry' })) } : {}) });
      if (next.phase === 'complete' && !reported && !inkLimit) {
        reported = true; callbacks.current.onComplete?.({ ...next, pointerType, inputSources: [...inputSources], timing });
      }
    };
    const cleanup = attachInput(svg, {
      disabled: () => !enabledRef.current || demoActive.current || reported || inkLimit || rawGestures.length >= 100 || (isPlay && engine.snapshot().gestureActive),
      start(p, type) {
        if (!finitePoint(p)) return;
        inputSources.add(type);
        if (!pointerType) { pointerType = type; engine = makeEngine(type); }
        rawGesture = { gestureId: ++rawGestureId, partId: null, kind: activity === 'copy' ? 'copy' : null,
          status: 'active', pointerType: type, points: [] };
        rawGestures.push(rawGesture);
        if (!captureRaw(p)) return;
        if (activity === 'copy') {
          const node = document.createElementNS(NS, 'path'); node.setAttribute('class', 'pupil-ink'); group.append(node);
          const record = { node, partId: null, points: rawGesture.points };
          records.set(rawGesture.gestureId, record); dirty.add(record); inkData.current.push(record.points);
        } else decide(engine.start(p));
      },
      move(p) {
        if (!captureRaw(p)) return;
        if (activity === 'copy') dirty.add(records.get(rawGesture.gestureId));
        else decide(engine.move(p));
      },
      end(p) {
        if (captureRaw(p)) {
          if (activity === 'copy') { dirty.add(records.get(rawGesture.gestureId)); rawGesture.status = 'ended'; }
          else decide(engine.end(p));
        }
        paint(); rawGesture = null;
      },
      cancel() {
        if (activity !== 'copy') decide(engine.cancel());
        if (rawGesture) rawGesture.status = 'cancel';
        rawGesture = null;
      },
      paint, timing(value) { timing = value; },
    });
    inputRef.current = {
      isBusy() { return Boolean(rawGesture || engine.snapshot().gestureActive); },
      cancel() { cleanup.cancel(); decide(engine.cancel()); if (rawGesture) rawGesture.status = 'cancel'; rawGesture = null; paint(); },
      rotate() { if (!isPlay || !inkLimit) return; engine.rotateDiagnostics(); rawGestures.length = 0; pointCount = 0; inkLimit = false; rawGesture = null; paint(); },
      padStart(id, p, bounds, type, source) {
        if (!enabledRef.current || !isPlay || demoActive.current || reported || inkLimit || rawGestures.length >= 100 || engine.snapshot().gestureActive) return false;
        if (!pointerType) { pointerType = type; engine = makeEngine(type); }
        const result = engine.startPad(id, p, bounds, source);
        if (result.inputDecision.action !== 'begin') return false;
        inputSources.add(type); inputSources.add(source);
        rawGesture = { gestureId: ++rawGestureId, partId: id, kind: 'dot', status: 'active', pointerType: type, coordinateSpace: 'clientCSS', inputSource: source, points: [] };
        rawGestures.push(rawGesture);
        if (!captureRaw(p)) { rawGesture = null; paint(); return false; }
        decide(result); paint(); return true;
      },
      padMove(p) { if (captureRaw(p)) decide(engine.move(p)); paint(); },
      padEnd(p) { if (captureRaw(p)) decide(engine.end(p)); paint(); rawGesture = null; },
    };
    return () => { disposed = true; cleanup(); inputRef.current = null; };
  }, [letter, mode, activity, attempt, demoReset, adjustment, isPlay, profileOverride]);

  useEffect(() => {
    const svg = svgRef.current; let active = true;
    const update = () => { if (active && svg.isConnected) setScale(svg.getBoundingClientRect().width / 1000 || 1); };
    const observer = new ResizeObserver(update); observer.observe(svg); update();
    return () => { active = false; observer.disconnect(); };
  }, []);
  const progressKey = Object.values(state?.progress || {}).map(n => Math.floor(n)).join(',') + ':' + (state?.completed?.length || 0);
  useEffect(() => {
    setHint(false);
    if (!isPlay || demo || state?.phase === 'complete') return;
    const timer = setTimeout(() => setHint(true), 4000);
    return () => clearTimeout(timer);
  }, [isPlay, demo, letter, progressKey]);

  useEffect(() => {
    if (!demo || !Object.keys(references).length) return;
    if (isPlay) inputRef.current?.cancel();
    const group = demoRef.current;
    group.replaceChildren();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sequence = letter.geometry.validSequences[0];
    const parts = sequence.map(id => {
      const stroke = letter.geometry.strokes.find(s => s.id === id);
      const dot = letter.geometry.dotTargets.find(d => d.id === id);
      const node = document.createElementNS(NS, stroke ? 'path' : 'circle');
      node.setAttribute('class', 'demonstration-ink');
      if (stroke) {
        node.setAttribute('d', stroke.path);
        node.setAttribute('stroke-dasharray', references[id].length);
        node.setAttribute('stroke-dashoffset', references[id].length);
      } else { node.setAttribute('cx', dot.x); node.setAttribute('cy', dot.y); node.setAttribute('r', dot.visibleRadius); node.setAttribute('opacity', '0'); }
      group.append(node);
      return { id, node, stroke, duration: stroke ? Math.max(1000, Math.min(2100, references[id].length * 2)) : 500 };
    });
    const marker = document.createElementNS(NS, 'circle');
    marker.setAttribute('class', 'demo-marker'); marker.setAttribute('r', '20'); group.append(marker);
    let frame, start = performance.now(), timeout;
    if (reduced) {
      parts.forEach(part => { part.node.setAttribute('stroke-dashoffset', '0'); part.node.setAttribute('opacity', '1'); });
      marker.setAttribute('opacity', '0');
      timeout = setTimeout(() => callbacks.current.onDemoEnd(), 1400);
    } else {
      const tick = now => {
        let elapsed = now - start, current = null;
        for (const part of parts) {
          const fraction = Math.max(0, Math.min(1, elapsed / part.duration));
          if (part.stroke) part.node.setAttribute('stroke-dashoffset', references[part.id].length * (1 - fraction));
          else part.node.setAttribute('opacity', fraction >= 0.3 ? '1' : '0');
          if (elapsed >= 0 && elapsed < part.duration) current = { part, fraction };
          elapsed -= part.duration;
        }
        if (current?.part.stroke) {
          const p = pointAt(references[current.part.id], references[current.part.id].length * current.fraction);
          marker.setAttribute('cx', p.x); marker.setAttribute('cy', p.y); marker.setAttribute('opacity', '1');
        } else marker.setAttribute('opacity', '0');
        if (elapsed >= 0) { timeout = setTimeout(() => callbacks.current.onDemoEnd(), 500); return; }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => { cancelAnimationFrame(frame); clearTimeout(timeout); group.replaceChildren(); };
  }, [demo, references, letter]);

  const pendingId = state?.pending?.[0];
  const guidePlan = useMemo(() => numberedGuidePlan(letter, references), [letter, references]);
  const guidePart = !isCopy && !demo && state?.phase !== 'complete' ? guidePlan.find(part => part.id === pendingId) : null;
  const pendingStroke = references[pendingId];
  const pendingDot = letter.geometry.dotTargets.find(d => d.id === pendingId);
  const frontier = pendingDot || (pendingStroke ? pointAt(pendingStroke, state?.progress[pendingId] || 0) : null);
  const end = pendingStroke ? pointAt(pendingStroke, Math.min(pendingStroke.length, (state?.progress[pendingId] || 0) + 55)) : null;
  const angle = frontier && end ? Math.atan2(end.y - frontier.y, end.x - frontier.x) * 180 / Math.PI : 90;
  const cueRadius = isPlay ? Math.max(32, 24 / scale) : 23;
  const trail = isPlay && pendingStroke ? Array.from({ length: 11 }, (_,i) => (state?.progress[pendingId] || 0) + (i+1)*40).filter(s => s < pendingStroke.length).map(s => pointAt(pendingStroke, s)) : [];
  return <>
  {!compact && <div className="board-heading"><span className="board-corner"><span className="tiny-dot"/>{isCopy ? 'RUANG MENULIS' : demo ? 'LIHAT CARA MENULIS' : isPlay ? 'JEJAK CERIA' : mode === 'precision' ? 'KURANG PANDUAN' : 'BERPANDU'}</span><span className="board-tool-hint">Jari · Pen · Tetikus</span></div>}
  <div className={`board-wrap ${isPlay ? 'play-board' : ''} ${isPlay && (hint || state?.phase === 'paused') ? 'play-needs-help' : ''} ${!isCopy && state?.blocked ? 'gesture-blocked' : ''}`}>
    <svg ref={svgRef} className={`trace-board ${isCopy ? 'copy-board' : ''}`} data-interaction-policy={isCopy ? 'free-copy' : isPlay ? 'play-guided-v1' : 'strict-v2'} data-phase={state?.phase} viewBox="0 0 1000 1000" role="img" aria-label={`Ruang ${isCopy ? 'salinan' : 'jejak'} huruf ${letter.labelMs}. Gunakan jari, pen atau tetikus.`}>
      <defs><pattern id={patternId} width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1.8" className="paper-dot"/></pattern></defs>
      <rect width="1000" height="1000" fill={`url(#${patternId})`}/>
      <path d="M80 700H920" className="baseline"/>
      {!isCopy && <g aria-hidden="true">
        {letter.geometry.strokes.map(stroke => <g key={stroke.id}>
          {mode === 'guided' && <path d={stroke.path} className="trace-corridor" strokeWidth={((state?.profile?.radius || 22) + 7.5) * 2}/>}
          <path d={stroke.path} className={`reference-stroke ${mode === 'precision' ? 'light-guide' : ''} ${isPlay && stroke.id === pendingId ? 'play-active-route' : ''}`} strokeWidth={isPlay ? 76 : stroke.width}/>
          {mode === 'guided' && <path d={stroke.path} className="direction-guide"/>}
        </g>)}
        {letter.geometry.dotTargets.map(dot => <circle key={dot.id} cx={dot.x} cy={dot.y} r={dot.visibleRadius} className="reference-dot"/>)}
      </g>}
      {isPlay && <g className="play-fill-layer" aria-hidden="true">{letter.geometry.strokes.map(stroke => {
        const length = references[stroke.id]?.length || 0, measured = state?.progress?.[stroke.id] || 0;
        const filled = state?.completed?.includes(stroke.id) ? length : measured;
        return filled > 0 ? <path key={stroke.id} className="play-fill" d={stroke.path} strokeWidth="60" strokeDasharray={`${length} ${length}`} strokeDashoffset={length - filled} data-measured-frontier={measured} data-display-frontier={filled}/> : null;
      })}</g>}
      {isPlay && !demo && <g className="play-trail" aria-hidden="true">{trail.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="6"/>)}</g>}
      <g ref={inkRef} className="validated-ink" aria-hidden="true"/>
      <g ref={demoRef} aria-hidden="true"/>
      {!isCopy && !demo && frontier && state?.phase !== 'complete' && <g pointerEvents="none" aria-hidden="true">
        <circle cx={frontier.x} cy={frontier.y} r={isPlay ? cueRadius + 12 : 38} className="start-halo"/>
        <circle cx={frontier.x} cy={frontier.y} r={cueRadius} className="start-dot"/>
        {pendingDot ? <text x={frontier.x} y={frontier.y + (isPlay ? cueRadius*.4 : 10)} style={isPlay ? { fontSize:cueRadius*1.2 } : undefined} textAnchor="middle" className="mark-plus">+</text> : <path d={isPlay ? 'M-2-9 10 0-2 9M-12 0H10' : 'M-9-9 2 0-9 9M-12 0H10'} transform={`translate(${frontier.x} ${frontier.y}) rotate(${angle}) scale(${isPlay ? cueRadius/23 : 1})`} className="start-arrow"/>}
      </g>}
      {guidePart && <NumberedTraceGuides part={guidePart} letter={letter} references={references} scale={scale} progress={state?.progress[pendingId] || 0}/>}
    </svg>
  </div>
  <div className={`board-tip ${!isCopy && state?.blocked ? 'is-blocked' : ''}`} role="status"><span className="tip-indicator"/>{isCopy ? state?.inkLimit ? 'Papan penuh. Simpan hasil atau cuba semula.' : 'Lihat contoh. Cuba tulis dengan cara sendiri.' : demo ? 'Perhatikan titik mula dan arah gerakan.' : state?.feedback || 'Mula pada bulatan hijau.'}</div>
  {guidePart && <p className="trace-number-instruction" aria-live="polite"><span aria-hidden="true">{guidePart.points[0].number}</span>{guideInstruction(guidePart)}</p>}
  {isPlay && <div className="play-dot-tools">
    {state?.inkLimit ? <button className="button button-soft" disabled={!enabled || demo} onClick={() => inputRef.current?.rotate()}>Teruskan jejak<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10H16M11 5L16 10L11 15" fill="none" stroke="currentColor" strokeWidth="2"/></svg></button>
      : pendingDot && !demo ? <DotTapPad target={pendingDot} index={(state?.metrics?.dotCount || 0)+1} total={letter.geometry.dotTargets.length} disabled={!enabled || demo || state?.phase === 'complete'}
        onStart={(...args) => inputRef.current?.padStart(...args) || false} onMove={p => inputRef.current?.padMove(p)} onEnd={p => inputRef.current?.padEnd(p)} onCancel={() => inputRef.current?.cancel()}/>
      : <span className="play-support-note">Perlahan pun boleh. Kita cuba bersama.</span>}
  </div>}
  {isPlay && !compact && <div className="lesson-feedback" aria-hidden="true">{state?.completed?.length > 0 && <PlayFeedback key={state.completed.length}/>}</div>}
  </>;
});
