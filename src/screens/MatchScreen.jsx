import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RaceTracePane } from '../components/RaceTracePane.jsx';
import { createMatchClock } from '../game/matchClock.js';
import { initialMatch, matchReducer } from '../game/matchReducer.js';
import { FitDialog } from '../components/FitDialog.jsx';
import { useViewportLayout } from '../components/useViewportLayout.js';
import { usePageTurn } from '../components/usePageTurn.js';
import { toggleFullscreen } from '../platform/fullscreen.js';
import { MatchClockDisplay } from '../components/MatchClockDisplay.jsx';
import { MenuButton, TracingMenu } from '../components/TracingMenu.jsx';

export function MatchScreen({ config, letters, audio, music, sound, onAttempt, onFinish, onExit }) {
  const [state, setState] = useState(() => initialMatch(config)), current = useRef(state);
  const clock = useMemo(() => createMatchClock(), []), boards = useRef([]);
  const [countdown, setCountdown] = useState(3), [fits, setFits] = useState(true);
  const [demo, setDemo] = useState(null), [exitConfirm, setExitConfirm] = useState(false), [notice, setNotice] = useState('');
  const [readyMenu, setReadyMenu] = useState(false), [assist, setAssist] = useState(null), announced = useRef(-1);
  const closeNotice = useCallback(() => setNotice(''), []);
  const saved = useRef(false), callbacks = useRef({ onAttempt, onFinish, onExit }); callbacks.current = { onAttempt, onFinish, onExit };
  const arena = useRef(null);
  const pageTurn = usePageTurn();
  const transition = useCallback(action => {
    const old = current.current, next = matchReducer(old, action);
    if (old === next) return next;
    current.current = next;
    if (next.status !== 'racing') {
      // A completion announcement must survive the transition into the round result.
      clock.pause(); boards.current.forEach(board => board?.cancel());
      if (!['COMPLETE', 'TIMEOUT'].includes(action.type)) audio.stop();
    }
    if (action.type === 'NEXT' && next.status === 'ready') clock.reset();
    if (action.type === 'START' && next.status === 'racing') clock.resume();
    setState(next); return next;
  }, [audio, clock]);
  const pause = useCallback(() => transition({ type: 'PAUSE' }), [transition]);
  const resume = useCallback(() => transition({ type: 'RESUME' }), [transition]);
  const closeReadyMenu = useCallback(() => setReadyMenu(false), []);
  const askExit = useCallback(() => setExitConfirm(true), []);
  const size = useViewportLayout(arena, pause);
  const layout = { stacked: config.mode === 'duo' && size.height > size.width, fits };
  useEffect(() => { music?.setQuiet(['ready', 'countdown'].includes(state.status)); }, [music, state.status]);
  useEffect(() => { music?.setSuspended('match', state.status === 'paused' || exitConfirm || !fits); }, [music, state.status, exitConfirm, fits]);
  useEffect(() => () => { music?.setSuspended('match', false); music?.setQuiet(false); }, [music]);
  function nextRound() {
    if (current.current.status !== 'roundResult' || pageTurn.pending()) return;
    if (current.current.roundIndex + 1 === current.current.letterIds.length) transition({ type: 'NEXT' });
    else pageTurn.start(() => transition({ type: 'NEXT' }));
  }
  useEffect(() => {
    if (state.status !== 'countdown') return;
    setCountdown(3);
    const started = performance.now();
    const timer = setInterval(() => {
      const remaining = 3 - Math.floor((performance.now() - started) / 1000);
      if (remaining <= 0) { clearInterval(timer); transition({ type: 'START' }); }
      else setCountdown(remaining);
    }, 50);
    return () => clearInterval(timer);
  }, [state.status, transition]);
  useEffect(() => {
    if (state.status !== 'racing') return;
    const timer = setInterval(() => {
      const value = clock.elapsed();
      if (value > current.current.limitMs) transition({ type: 'TIMEOUT' });
    }, 50);
    return () => clearInterval(timer);
  }, [state.status, clock, transition]);
  useEffect(() => {
    const resize = () => { pause(); };
    const visibility = () => { if (document.hidden) pause(); };
    const back = () => { pause(); setExitConfirm(true); };
    window.addEventListener('resize', resize); window.addEventListener('orientationchange', resize); window.addEventListener('taman-jawi:pause', pause); window.addEventListener('taman-jawi:back', back); document.addEventListener('fullscreenchange', resize); document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('orientationchange', resize); window.removeEventListener('taman-jawi:pause', pause); window.removeEventListener('taman-jawi:back', back); document.removeEventListener('fullscreenchange', resize); document.removeEventListener('visibilitychange', visibility); };
  }, [config.mode, pause]);
  useEffect(() => {
    const root = arena.current;
    const measure = () => {
      const stages = [...root.querySelectorAll('.trace-stage')];
      if (!stages.length) return;
      const minimum = config.mode === 'duo' ? 280 : 230;
      const next = stages.every(stage => { const bounds = stage.getBoundingClientRect(); return bounds.width >= minimum && bounds.height >= minimum; });
      setFits(next); if (!next) pause();
    };
    const observer = new ResizeObserver(measure);
    root.querySelectorAll('.trace-stage').forEach(stage => observer.observe(stage));
    const frame = requestAnimationFrame(measure);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [size.width, size.height, state.roundIndex, config.mode, pause]);
  useEffect(() => {
    const dialog = arena.current?.querySelector('.race-dialog');
    if (!dialog) return;
    const previous = document.activeElement;
    dialog.querySelector('button')?.focus({ preventScroll: true });
    const key = event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button:not(:disabled)')];
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [state.status, exitConfirm, layout.fits, pageTurn.turn]);
  useEffect(() => {
    if (!['completed', 'abandoned'].includes(state.status) || saved.current) return;
    saved.current = true;
    const { ready, outcomes, retries, resuming, roundIndex, ...summary } = state;
    summary.finishedAt = new Date().toISOString();
    summary.interactionPolicy = 'play-guided-v2'; summary.toleranceProfile = 'play-touch-standard-v2';
    if (state.status === 'abandoned') summary.partialRound = { letterId: state.letterIds[roundIndex], players: outcomes };
    if (state.status === 'completed') callbacks.current.onFinish(summary);
    else callbacks.current.onExit(summary);
  }, [state]);
  function complete(slot, snapshot, roundIndex) {
    const before = current.current;
    const duration = clock.elapsed(snapshot.validatedAt);
    const next = transition({ type: 'COMPLETE', matchId: config.id, roundIndex, slot, snapshot, elapsedMs: duration });
    if (next === before) return;
    const finished = letters.find(l => l.id === config.letterIds[roundIndex]);
    if (!config.unscored) callbacks.current.onAttempt(snapshot, { config, letter: finished, slot, roundIndex, retries: before.retries[slot], assistance: 1 });
    // One shared announcement per round, started by the first accepted letter; saving and scoring never wait for it.
    if (announced.current !== roundIndex) { announced.current = roundIndex; audio.play(finished.audio.name, { preview: Boolean(config.unscored) }); }
  }
  async function fullscreen() {
    try { await toggleFullscreen(); }
    catch { pause(); setNotice('Paparan penuh tidak tersedia. Boleh terus bermain dalam pelayar.'); }
  }
  async function hearLetter() {
    const played = await audio.play(letter.audio.name, { preview: Boolean(config.unscored) });
    if (played.reason === 'obsolete') return;
    setNotice(played.ok ? '' : 'Audio tidak dapat dimainkan. Cuba lagi.');
  }
  const letter = letters.find(l => l.id === state.letterIds[state.roundIndex]);
  const totals = state.profiles.map((_, slot) => state.rounds.reduce((sum, round) => sum + round.players[slot].total, 0)
    + (state.rounds.length <= state.roundIndex ? state.outcomes[slot]?.total || 0 : 0));
  const menuOpen = layout.fits && !exitConfirm && (state.status === 'paused' || readyMenu);
  const dotLane = slot => letter.geometry.dotTargets.length > 0 && !state.outcomes[slot];
  const assistSlot = assist?.roundIndex === state.roundIndex ? assist.slot : null;
  function openMenu() {
    if (['racing', 'countdown'].includes(state.status)) pause();
    else if (state.status === 'ready') setReadyMenu(true);
  }
  const retryLane = slot => { transition({ type: 'RETRY', slot }); resume(); };
  const assistLane = slot => { setAssist({ roundIndex: state.roundIndex, slot }); resume(); };
  return <main ref={arena} className={`match-arena stage-arena ${config.mode} ${layout.stacked ? 'stacked' : 'side-by-side'}`}>
    <h1 className="visually-hidden">{config.mode === 'duo' ? 'Duo 1v1' : 'Cabaran Solo'}</h1>
    <div className="arena-hud arena-hud-left"><MenuButton disabled={exitConfirm || !layout.fits || Boolean(pageTurn.turn) || !['ready', 'racing', 'countdown'].includes(state.status)} onClick={openMenu}/></div>
    <div className="arena-hud arena-hud-right"><span className="arena-round"><span className="arena-round-full">Pusingan {state.roundIndex + 1}/{state.letterIds.length} · <strong>{letter.labelMs}</strong>{config.unscored && <small> · Pratonton · tanpa markah</small>}</span><span className="arena-round-short" aria-hidden="true">{state.roundIndex + 1}/{state.letterIds.length}</span></span>
      <MatchClockDisplay clock={clock} limitMs={state.limitMs} status={state.status} roundIndex={state.roundIndex}/></div>
    <div className="race-lanes" aria-hidden={!layout.fits} style={!layout.fits ? { visibility: 'hidden' } : undefined}>{state.profiles.map((profile, slot) => <RaceTracePane key={`${state.roundIndex}:${slot}`} ref={board => { boards.current[slot] = board; }} turn={pageTurn.turn} onTurnEnd={pageTurn.finish} slot={slot} profile={profile} letter={letter} state={state.status} total={config.unscored ? '—' : totals[slot]} outcome={state.outcomes[slot]} ready={state.ready[slot]} retry={state.retries[slot]} demo={demo === slot} enabled={!pageTurn.turn && layout.fits && state.status === 'racing' && !state.outcomes[slot]} assistance={assistSlot === slot && state.status === 'racing'} onReady={() => { if (!layout.fits) return; setDemo(null); transition({ type: 'READY', slot }); }} onDemo={() => setDemo(slot)} onDemoEnd={() => setDemo(null)} onValidated={snapshot => complete(slot, snapshot, state.roundIndex)}/>)}</div>
    {!layout.fits && <section className="arena-space"><h2>Besarkan ruang bermain</h2><p>Setiap pemain perlukan ruang jejak yang selesa. Putar peranti atau buka paparan penuh.</p><button className="button button-primary" onClick={fullscreen}>Paparan penuh</button><button className="button button-soft" onClick={() => transition({ type: 'END', exitToSolo: true })}>Kembali memilih Solo</button></section>}
    {layout.fits && state.status === 'countdown' && <div className="race-overlay countdown-overlay" role="status"><strong>{countdown}</strong><p>{state.resuming ? 'Sambung bersama…' : 'Bersedia…'}</p></div>}
    {menuOpen && state.status === 'paused' && <TracingMenu title="Rehat sekejap" sound={sound} onClose={resume} onBack={askExit}>
      <button className="button button-primary" onClick={resume}>Sambung bermain</button>
      <button className="button button-soft" onClick={() => setExitConfirm(true)}>Keluar cabaran</button>
      <button className="button button-soft" aria-label={`Dengar nama ${letter.labelMs}`} onClick={hearLetter}>Dengar</button>
      {state.profiles.map((profile, slot) => !state.outcomes[slot] && <button key={`retry${slot}`} className="button button-outline" onClick={() => retryLane(slot)}>{state.profiles.length > 1 ? `Cuba lagi · ${profile}` : 'Cuba lagi'}</button>)}
      {state.profiles.map((profile, slot) => dotLane(slot) && <button key={`assist${slot}`} className="button button-soft" onClick={() => assistLane(slot)}>{state.profiles.length > 1 ? `Bantuan titik · ${profile}` : 'Bantuan titik'}</button>)}
    </TracingMenu>}
    {menuOpen && state.status === 'ready' && <TracingMenu sound={sound} onClose={closeReadyMenu} onBack={() => { setReadyMenu(false); setExitConfirm(true); }}>
      <button className="button button-soft" aria-label={`Dengar nama ${letter.labelMs}`} onClick={hearLetter}>Dengar</button>
      <button className="button button-soft" onClick={() => { setReadyMenu(false); setExitConfirm(true); }}>Keluar cabaran</button>
    </TracingMenu>}
    {state.status === 'roundResult' && !pageTurn.turn && !exitConfirm && <div className="race-overlay"><section className="race-dialog round-result" role="dialog" aria-modal="true" aria-labelledby="round-title"><h2 id="round-title">Pusingan {state.roundIndex + 1} selesai!</h2><p>{letter.labelMs} · Kita sudah mencuba bersama.</p><div className="round-score-grid">{state.outcomes.map((outcome, slot) => <div key={slot} className={`player-${slot}`}><h3>{state.profiles[slot]}</h3><strong>{config.unscored ? '—' : outcome.total}<small>markah</small></strong><p>{outcome.outcome === 'playComplete' ? `Siap ${(outcome.elapsedMs / 1000).toFixed(1)} saat` : 'Masa tamat'}</p>{!config.unscored && <small>{outcome.base} siap + {outcome.bonus} masa</small>}</div>)}</div><button className="button button-primary" onClick={nextRound}>{state.roundIndex + 1 === state.letterIds.length ? 'Lihat keputusan' : 'Pusingan seterusnya'}</button><button className="button button-soft" aria-label={`Dengar nama ${letter.labelMs}`} onClick={hearLetter}>Dengar</button><button className="button button-soft" onClick={() => setExitConfirm(true)}>Keluar cabaran</button></section></div>}
    {notice && <FitDialog title="Paparan & suara" onClose={closeNotice}><div className="letter-help"><p role="status">{notice}</p></div></FitDialog>}
    {exitConfirm && <div className="race-overlay"><section className="race-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-title"><h2 id="exit-title">Tamatkan cabaran?</h2><p>Cabaran ini akan dihentikan. Tiada trofi diberikan. Cubaan yang sudah siap tetap disimpan.</p><button className="button button-primary" onClick={() => transition({ type: 'END' })}>Ya, keluar</button><button className="button button-soft" onClick={() => setExitConfirm(false)}>Terus bermain</button></section></div>}
  </main>;
}
