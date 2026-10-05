import { forwardRef, memo, useEffect, useLayoutEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { playGuideWidth } from '../content/displayWidth.js';
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
import { useViewportLayout } from './useViewportLayout.js';
import { fitTraceViewport } from '../game/screenLayout.js';
import { createLiveRenderer, controlKey } from '../tracing/liveRenderer.js';
import { createInkPath } from '../tracing/inkPath.js';
import { isLightweightPresentation, setTracingContact } from '../platform/presentation.js';

const NS = 'http://www.w3.org/2000/svg';
const ReferenceModel = memo(function ReferenceModel({ letter, mode, isPlay, pendingId, radius }) {
  return <g aria-hidden="true">
    {letter.geometry.strokes.map(stroke => <g key={stroke.id}>
      {mode === 'guided' && <path d={stroke.path} className="trace-corridor" strokeWidth={(radius + 7.5) * 2}/>}
      <path d={stroke.path} className={`reference-stroke ${mode === 'precision' ? 'light-guide' : ''} ${isPlay && stroke.id === pendingId ? 'play-active-route' : ''}`} strokeWidth={isPlay ? playGuideWidth(stroke) : stroke.width}/>
      {mode === 'guided' && <path d={stroke.path} className="direction-guide"/>}
    </g>)}
    {letter.geometry.dotTargets.map(dot => <circle key={dot.id} cx={dot.x} cy={dot.y} r={dot.visibleRadius} className="reference-dot"/>)}
  </g>;
});
export const TraceBoard = forwardRef(function TraceBoard({ letter, mode, activity, attempt, demo, adjustment, onDemoEnd, onComplete, onDiagnostic, enabled = true, profileOverride, onValidated, now = performance.now.bind(performance), compact = false, fitted = false, stageOnly = false, dotAssistance = false, renderSupport }, ref) {
  globalThis.__JAWI_TRACE_PERF__?.('render');
  const patternId = useId().replace(/:/g, '');
  const enabledRef = useRef(enabled); enabledRef.current = enabled;
  const svgRef = useRef(null), inkRef = useRef(null), demoRef = useRef(null);
  const fillRef = useRef(null), trailRef = useRef(null), cursorRef = useRef(null), tailRef = useRef(null), resumeRef = useRef(null);
  const renderer = useRef(null), liveView = useRef(null), liveContext = useRef(null), lastMovement = useRef(0);
  const lightweight = isLightweightPresentation();
  const stageRef = useRef(null);
  const inputRef = useRef(null), demoActive = useRef(demo);
  demoActive.current = demo;
  const isCopy = activity === 'copy', isPlay = mode === 'play' && !isCopy;
  const demoReset = isPlay ? false : demo;
  const inkData = useRef([]), callbacks = useRef({ onComplete, onDemoEnd, onDiagnostic, onValidated, now });
  callbacks.current = { onComplete, onDemoEnd, onDiagnostic, onValidated, now };
  const [state, setState] = useState(null);
  const [references, setReferences] = useState({});
  const [hint, setHint] = useState(false), [scale, setScale] = useState(1);
  const stageSize = useViewportLayout(stageRef, () => { inputRef.current?.cancel(); if (demoActive.current) callbacks.current.onDemoEnd?.(); });
  const smallStage = fitted && stageSize.height > 0 && Math.min(stageSize.width, stageSize.height) < 230;
  enabledRef.current = enabled && !smallStage;
  const presentation = useMemo(() => fitTraceViewport(letter, references, stageSize.width, stageSize.height, isCopy || !fitted), [letter, references, stageSize.width, stageSize.height, isCopy, fitted]);
  const viewBox = `${presentation.x} ${presentation.y} ${presentation.width} ${presentation.height}`;
  liveContext.current = { scale, presentation, demo };
  useLayoutEffect(() => { if (liveView.current) renderer.current?.paint(liveView.current, liveContext.current); });
  useImperativeHandle(ref, () => ({ cancel: () => inputRef.current?.cancel(), isBusy: () => demoActive.current || Boolean(inputRef.current?.isBusy()), exportDiagnostic: () => inputRef.current?.diagnostic(), exportInk: () => inkData.current.map(line => line.map(p => ({ x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }))) }), []);
  useEffect(() => { if (!enabled) inputRef.current?.cancel(); }, [enabled]);

  useEffect(() => {
    const svg = svgRef.current, group = inkRef.current;
    group.replaceChildren(); demoRef.current.replaceChildren(); inkData.current = [];
    const prepared = prepareReferences(letter);
    setReferences(prepared);
    const makeEngine = type => (isPlay ? createPlayMatcher : createMatcher)(letter, prepared, profileOverride || getProfile(mode, type, adjustment), { compact: true });
    let engine = makeEngine('mouse');
    setState(engine.snapshot());
    const drawing = createLiveRenderer({ fill: fillRef.current, trail: trailRef.current, cursor: cursorRef.current, tail: tailRef.current, resume: resumeRef.current }, letter, prepared, isPlay, isCopy, lightweight);
    renderer.current = drawing; liveView.current = engine.view(); drawing.paint(liveView.current, liveContext.current);
    const contact = Symbol('trace-board');
    let previousControl = '', lastDiagnostic = -Infinity, diagnosticDue = false;
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
        if (decision.confirmation) { rawGesture.inputSource = decision.inputSource; inputSources.add(decision.inputSource); }
        if (decision.completionMethod) rawGesture.completionMethod = decision.completionMethod;
      }
      if (decision.clearPartInk) {
        for (const [id, record] of records) if (record.partId === decision.partId) removeRecord(id);
      }
      if (decision.discardGestureInk) { removeRecord(decision.gestureId); return; }
      if (!isPlay && decision.action === 'begin' && decision.kind === 'stroke') {
        records.set(decision.gestureId, createInkPath(group, decision.partId));
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
        setTracingContact(contact, false); diagnosticDue = true;
        return false;
      }
      pointCount++; rawGesture.points.push(p);
      lastMovement.current = performance.now();
      return true;
    };
    const diagnostic = next => {
      if (!callbacks.current.onDiagnostic || activity === 'copy') return null;
      next ||= engine.snapshot();
      const value = { ...next, timing, rawInk: rawGestures.map(g => g.points),
        rawGestures, visibleInk: [...records.values()].filter(r => !r.mark).map(r => ({ partId: r.partId, points: r.points })),
        assistedMarks: [...records.values()].filter(r => r.mark).map(r => r.mark),
        ...(isPlay ? { assistedFill: letter.geometry.strokes.map(stroke => ({ partId: stroke.id,
          measuredFrontier: next.progress[stroke.id], displayFrontier: next.completed.includes(stroke.id) ? prepared[stroke.id].length : next.progress[stroke.id], source: 'authoredGeometry' })) } : {}) };
      callbacks.current.onDiagnostic(value); lastDiagnostic = performance.now();
      globalThis.__JAWI_TRACE_PERF__?.('diagnostic');
      return value;
    };
    const paint = (final = false) => {
      if (disposed) return;
      final ||= diagnosticDue; diagnosticDue = false;
      for (const record of dirty) record?.paint?.();
      dirty.clear();
      if (activity === 'copy') {
        if (inkLimit || rawGestures.length >= 100) setState(previous => ({ ...previous, inkLimit: true }));
        return;
      }
      let next = engine.view();
      if (isPlay && next.phase !== 'complete' && (rawGestures.length >= 100 || next.exhausted)) {
        inkLimit = true; decide(engine.cancel()); next = engine.view(); setTracingContact(contact, false);
      }
      if (inkLimit) { next.inkLimit = true; next.feedback = isPlay ? 'Sambung di sini.' : 'Papan penuh. Tekan Cuba lagi.'; }
      liveView.current = next; drawing.paint(next, liveContext.current);
      const key = controlKey(next, prepared);
      if (key !== previousControl) {
        previousControl = key;
        setState({ ...engine.snapshot(), ...(inkLimit ? { inkLimit: true, feedback: next.feedback } : {}) });
      }
      // Periodic snapshots would copy engine state mid-gesture; release, completion and cancel still emit.
      if (callbacks.current.onDiagnostic && (final || next.phase === 'complete' || (!rawGesture && performance.now() - lastDiagnostic >= 250))) diagnostic({ ...engine.snapshot(), ...(inkLimit ? { inkLimit: true, feedback: next.feedback } : {}) });
      if (next.phase === 'complete' && !reported && !inkLimit) {
        reported = true; callbacks.current.onComplete?.({ ...engine.snapshot(), pointerType, inputSources: [...inputSources], timing });
      }
    };
    const cleanup = attachInput(svg, {
      disabled: () => !enabledRef.current || demoActive.current || reported || inkLimit || rawGestures.length >= 100 || engine.isBusy(),
      start(p, type) {
        if (!finitePoint(p)) return;
        inputSources.add(type);
        if (!pointerType) { pointerType = type; engine = makeEngine(type); }
        rawGesture = { gestureId: ++rawGestureId, partId: null, kind: activity === 'copy' ? 'copy' : null,
          status: 'active', pointerType: type, points: [] };
        rawGestures.push(rawGesture);
        setTracingContact(contact, true);
        if (!captureRaw(p)) return;
        if (activity === 'copy') {
          const record = createInkPath(group, null, rawGesture.points);
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
        rawGesture = null; // attachInput flushes once, after recording final timing.
        diagnosticDue = true;
        setTracingContact(contact, false);
      },
      cancel() {
        if (activity !== 'copy') decide(engine.cancel());
        if (rawGesture) rawGesture.status = 'cancel';
        rawGesture = null;
        diagnosticDue = true;
        setTracingContact(contact, false);
      },
      paint, timing(value) { timing = value; },
    });
    inputRef.current = {
      isBusy() { return Boolean(rawGesture || engine.isBusy()); },
      diagnostic,
      cancel() { cleanup.cancel(); decide(engine.cancel()); if (rawGesture) rawGesture.status = 'cancel'; rawGesture = null; setTracingContact(contact, false); paint(true); },
      rotate() { if (!isPlay || !inkLimit) return; engine.rotateDiagnostics(); rawGestures.length = 0; pointCount = 0; inkLimit = false; rawGesture = null; paint(); },
      padStart(id, p, bounds, type, source) {
        if (!enabledRef.current || !isPlay || demoActive.current || reported || inkLimit || rawGestures.length >= 100 || engine.isBusy()) return false;
        if (!pointerType) { pointerType = type; engine = makeEngine(type); }
        const result = engine.startPad(id, p, bounds, source);
        if (result.inputDecision.action !== 'begin') return false;
        inputSources.add(type); inputSources.add(source);
        rawGesture = { gestureId: ++rawGestureId, partId: id, kind: 'dot', status: 'active', pointerType: type, coordinateSpace: 'clientCSS', inputSource: source, points: [] };
        rawGestures.push(rawGesture);
        setTracingContact(contact, true);
        if (!captureRaw(p)) { rawGesture = null; setTracingContact(contact, false); paint(true); return false; }
        decide(result); paint(); return true;
      },
      padMove(p) { if (captureRaw(p)) decide(engine.move(p)); cleanup.requestPaint(); },
      padEnd(p) { if (captureRaw(p)) decide(engine.end(p)); rawGesture = null; setTracingContact(contact, false); paint(true); },
    };
    return () => { diagnostic(); disposed = true; cleanup(); setTracingContact(contact, false); drawing.clear(); renderer.current = null; liveView.current = null; inputRef.current = null; };
  }, [letter, mode, activity, attempt, demoReset, adjustment, isPlay, profileOverride, lightweight]);

  useEffect(() => {
    const svg = svgRef.current; let active = true;
    const update = () => { const matrix = svg.getScreenCTM(); if (active && svg.isConnected && matrix) setScale(Math.hypot(matrix.a, matrix.b) || 1); };
    const observer = new ResizeObserver(update); observer.observe(svg); update();
    return () => { active = false; observer.disconnect(); };
  }, [viewBox]);
  useEffect(() => {
    setHint(false);
    if (!isPlay || demo || state?.phase === 'complete') return;
    lastMovement.current = performance.now();
    let visible = false;
    const timer = setInterval(() => {
      const next = performance.now() - lastMovement.current >= 4000;
      if (next !== visible) { visible = next; setHint(next); }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlay, demo, letter, attempt, state?.phase]);

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
  const pendingDot = letter.geometry.dotTargets.find(d => d.id === pendingId);
  const finishMessage = isPlay && guidePart?.kind === 'stroke' && (state?.finish?.nearEnd || state?.finish?.confirmationAvailable)
    ? guideInstruction(guidePart, state.finish, state.phase)
    : null;
  const status = <div className={`board-tip ${!isCopy && state?.blocked ? 'is-blocked' : ''}`} role="status"><span className="tip-indicator"/>{isCopy ? state?.inkLimit ? 'Papan penuh. Simpan hasil atau cuba semula.' : 'Lihat contoh. Cuba tulis dengan cara sendiri.' : demo ? 'Perhatikan titik mula dan arah gerakan.' : finishMessage || state?.feedback || 'Mula pada bulatan hijau.'}</div>;
  const instruction = guidePart && <p className="trace-number-instruction" aria-live="polite"><span aria-hidden="true">{guidePart.points[0].number}</span>{guideInstruction(guidePart, isPlay ? state?.finish : null, state?.phase)}</p>;
  const dots = isPlay && <div className="play-dot-tools">
    {state?.inkLimit ? <button className="button button-soft" disabled={!enabled || demo} onClick={() => inputRef.current?.rotate()}>Teruskan jejak</button>
      : pendingDot && !demo ? <DotTapPad target={pendingDot} index={(state?.metrics?.dotCount || 0)+1} total={letter.geometry.dotTargets.length} disabled={!enabled || demo || state?.phase === 'complete'}
        onStart={(...args) => inputRef.current?.padStart(...args) || false} onMove={p => inputRef.current?.padMove(p)} onEnd={p => inputRef.current?.padEnd(p)} onCancel={() => inputRef.current?.cancel()}/>
      : <span className="play-support-note">Perlahan pun boleh. Kita cuba bersama.</span>}
  </div>;
  const reward = isPlay && !compact && !lightweight && <div className="lesson-feedback" aria-hidden="true">{state?.completed?.length > 0 && <PlayFeedback key={state.completed.length}/>}</div>;
  return <div className={`trace-layout ${fitted ? 'fitted-trace' : ''} ${stageOnly ? 'stage-only' : ''} ${dotAssistance ? 'dot-assistance-enabled' : ''}`}>
  {!compact && !fitted && <div className="board-heading"><span className="board-corner"><span className="tiny-dot"/>{isCopy ? 'RUANG MENULIS' : demo ? 'LIHAT CARA MENULIS' : isPlay ? 'JEJAK CERIA' : mode === 'precision' ? 'KURANG PANDUAN' : 'BERPANDU'}</span><span className="board-tool-hint">Jari · Pen · Tetikus</span></div>}
  <div ref={stageRef} className={`trace-stage ${isCopy ? 'copy-stage' : ''}`} style={{ '--stage-square': `${Math.min(stageSize.width, stageSize.height)}px` }}>
  {smallStage && <aside className="trace-space" role="status">Putar peranti atau kurangkan zum untuk ruang jejak yang lebih besar.</aside>}
  <div style={smallStage ? { visibility: 'hidden' } : undefined} className={`board-wrap ${isPlay ? 'play-board' : ''} ${isPlay && (hint || state?.phase === 'paused') ? 'play-needs-help' : ''} ${!isCopy && state?.blocked ? 'gesture-blocked' : ''}`}>
    <svg ref={svgRef} className={`trace-board ${isCopy ? 'copy-board' : ''}`} data-interaction-policy={isCopy ? 'free-copy' : state?.profile?.interactionPolicy} data-tolerance-profile={state?.profile?.id} data-phase={state?.phase} viewBox={viewBox} preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Ruang ${isCopy ? 'salinan' : 'jejak'} huruf ${letter.labelMs}. Gunakan jari, pen atau tetikus.`}>
      <defs><pattern id={patternId} width="50" height="50" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1.8" className="paper-dot"/></pattern></defs>
      <rect x={presentation.x} y={presentation.y} width={presentation.width} height={presentation.height} fill={`url(#${patternId})`}/>
      <path d="M80 700H920" className="baseline"/>
      {!isCopy && <ReferenceModel letter={letter} mode={mode} isPlay={isPlay} pendingId={pendingId} radius={state?.profile?.radius || 22}/>}
      <g ref={fillRef} className="play-fill-layer" aria-hidden="true"/>
      <g ref={trailRef} className="play-trail" aria-hidden="true"/>
      <g ref={inkRef} className="validated-ink" aria-hidden="true"/>
      <g ref={demoRef} aria-hidden="true"/>
      <g ref={cursorRef} aria-hidden="true"/>
      <g ref={tailRef} aria-hidden="true"/>
      {guidePart && <NumberedTraceGuides part={guidePart} letter={letter} references={references} scale={scale} viewport={fitted ? presentation : undefined} progress={state?.progress[pendingId] || 0} finish={isPlay ? state?.finish : undefined}/>}
      <g ref={resumeRef} aria-hidden="true"/>
    </svg>
  </div>
  </div>
  {renderSupport ? renderSupport({ status, instruction, dots, reward, pendingDot, inkLimit: Boolean(state?.inkLimit), blocked: Boolean(!isCopy && state?.blocked), complete: state?.phase === 'complete', paused: state?.phase === 'paused' }) : <div className="trace-support">{status}{instruction}{dots}{reward}</div>}
  </div>;
});
