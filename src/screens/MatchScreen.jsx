import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RaceTracePane } from '../components/RaceTracePane.jsx';
import { createMatchClock } from '../game/matchClock.js';
import { initialMatch, matchReducer } from '../game/matchReducer.js';
import { usePageTurn } from '../components/usePageTurn.js';

function arenaLayout(mode) {
  const w = window.innerWidth, h = window.innerHeight, stacked = mode === 'duo' && h > w;
  const size = Math.floor(mode === 'solo' ? Math.min(w - 40, w < 600 ? 600 : Math.max(280, h - 304), 600)
    : stacked ? Math.min(w - 262, (h - 144) / 2 - 76) : Math.min((w - 112) / 2, h - 408, 640));
  return { stacked, size: Math.max(0, size), fits: size >= 280 || mode === 'solo' };
}
export function MatchScreen({ config, letters, audio, onAttempt, onFinish, onExit }) {
  const [state, setState] = useState(() => initialMatch(config)), current = useRef(state);
  const clock = useMemo(() => createMatchClock(), []), boards = useRef([]);
  const [elapsed, setElapsed] = useState(0), [countdown, setCountdown] = useState(3), [layout, setLayout] = useState(() => arenaLayout(config.mode));
  const [demo, setDemo] = useState(null), [exitConfirm, setExitConfirm] = useState(false), [notice, setNotice] = useState('');
  const saved = useRef(false), callbacks = useRef({ onAttempt, onFinish, onExit }); callbacks.current = { onAttempt, onFinish, onExit };
  const arena = useRef(null);
  const pageTurn = usePageTurn();
  const transition = useCallback(action => {
    const old = current.current, next = matchReducer(old, action);
    if (old === next) return next;
    current.current = next;
    if (next.status !== 'racing') {
      clock.pause(); boards.current.forEach(board => board?.cancel()); audio.stop();
    }
    if (action.type === 'NEXT' && next.status === 'ready') { clock.reset(); setElapsed(0); }
    if (action.type === 'START' && next.status === 'racing') clock.resume();
    setState(next); return next;
  }, [audio, clock]);
  const pause = useCallback(() => transition({ type: 'PAUSE' }), [transition]);
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
      const value = clock.elapsed(); setElapsed(value);
      if (value > current.current.limitMs) transition({ type: 'TIMEOUT' });
    }, 50);
    return () => clearInterval(timer);
  }, [state.status, clock, transition]);
  useEffect(() => {
    const resize = () => { pause(); setLayout(arenaLayout(config.mode)); };
    const visibility = () => { if (document.hidden) pause(); };
    const back = () => { pause(); setExitConfirm(true); };
    window.addEventListener('resize', resize); window.addEventListener('orientationchange', resize); window.addEventListener('taman-jawi:pause', pause); window.addEventListener('taman-jawi:back', back); document.addEventListener('fullscreenchange', resize); document.addEventListener('visibilitychange', visibility);
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('orientationchange', resize); window.removeEventListener('taman-jawi:pause', pause); window.removeEventListener('taman-jawi:back', back); document.removeEventListener('fullscreenchange', resize); document.removeEventListener('visibilitychange', visibility); };
  }, [config.mode, pause]);
  useEffect(() => {
    if (config.mode !== 'duo' || !layout.fits) return;
    const frame = requestAnimationFrame(() => {
      const root = arena.current, bounds = root.getBoundingClientRect();
      const panes = [...root.querySelectorAll('.race-pane')], papers = [...root.querySelectorAll('.board-wrap')];
      const overflow = panes.some(pane => pane.getBoundingClientRect().bottom > bounds.bottom - 4 || pane.scrollWidth > pane.clientWidth + 2 || pane.scrollHeight > pane.clientHeight + 2);
      if (overflow || papers.some(paper => paper.getBoundingClientRect().width < 280)) { pause(); setLayout(old => ({ ...old, fits: false })); }
    });
    return () => cancelAnimationFrame(frame);
  }, [config.mode, layout, state.roundIndex, pause]);
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
    summary.interactionPolicy = 'play-guided-v1'; summary.toleranceProfile = 'play-touch-standard-v1';
    if (state.status === 'abandoned') summary.partialRound = { letterId: state.letterIds[roundIndex], players: outcomes };
    if (state.status === 'completed') callbacks.current.onFinish(summary);
    else callbacks.current.onExit(summary);
  }, [state]);
  function complete(slot, snapshot, roundIndex) {
    const before = current.current;
    const duration = clock.elapsed(snapshot.validatedAt);
    const next = transition({ type: 'COMPLETE', matchId: config.id, roundIndex, slot, snapshot, elapsedMs: duration });
    if (next !== before && !config.unscored) callbacks.current.onAttempt(snapshot, { config, letter: letters.find(l => l.id === config.letterIds[roundIndex]), slot, roundIndex, retries: before.retries[slot], assistance: 1 });
  }
  async function fullscreen() {
    try { await document.documentElement.requestFullscreen(); }
    catch { setNotice('Paparan penuh tidak tersedia. Boleh terus bermain dalam pelayar.'); }
  }
  async function hearLetter() {
    const played = await audio.play(letter.audio.name);
    if (played.reason === 'obsolete') return;
    setNotice(played.ok ? '' : 'Audio tidak dapat dimainkan. Cuba lagi.');
  }
  const letter = letters.find(l => l.id === state.letterIds[state.roundIndex]);
  const totals = state.profiles.map((_, slot) => state.rounds.reduce((sum, round) => sum + round.players[slot].total, 0)
    + (state.rounds.length <= state.roundIndex ? state.outcomes[slot]?.total || 0 : 0));
  return <main ref={arena} className={`match-arena ${config.mode} ${layout.stacked ? 'stacked' : 'side-by-side'}`} style={{ '--board-size': `${layout.size}px` }}>
    <div className="race-toolbar">
      <div><h1>{config.mode === 'duo' ? 'Duo 1v1' : 'Cabaran Solo'}{config.unscored && <small>Pratonton · tanpa markah</small>}</h1><span>Pusingan {state.roundIndex + 1}/{state.letterIds.length} · <strong>{letter.labelMs}</strong> · Dengan bantuan</span></div>
      <div className="race-clock" aria-label="Baki masa">{Math.ceil(Math.max(0, state.limitMs - elapsed) / 1000)}<small>saat</small></div>
      <div className="race-toolbar-actions">
        {state.status === 'ready' ? <button className="button button-soft" aria-label={`Dengar nama ${letter.labelMs}`} disabled={exitConfirm || !layout.fits} onClick={hearLetter}>Dengar</button>
          : <button className="button button-soft" disabled={exitConfirm || !['racing', 'countdown'].includes(state.status)} onClick={pause}>Berhenti</button>}
        <button className="button button-outline" disabled={Boolean(pageTurn.turn) || exitConfirm || ['paused', 'roundResult'].includes(state.status)} onClick={() => { pause(); setExitConfirm(true); }}>Keluar</button>
      </div>
    </div>
    <div className="race-lanes" hidden={!layout.fits}>{state.profiles.map((profile, slot) => <RaceTracePane key={`${state.roundIndex}:${slot}`} ref={board => { boards.current[slot] = board; }} turn={pageTurn.turn} onTurnEnd={pageTurn.finish} slot={slot} profile={profile} letter={letter} state={state.status} total={config.unscored ? '—' : totals[slot]} outcome={state.outcomes[slot]} ready={state.ready[slot]} retry={state.retries[slot]} demo={demo === slot} enabled={!pageTurn.turn && layout.fits && state.status === 'racing' && !state.outcomes[slot]} onReady={() => { setDemo(null); transition({ type: 'READY', slot }); }} onRetry={() => transition({ type: 'RETRY', slot })} onDemo={() => setDemo(slot)} onDemoEnd={() => setDemo(null)} onValidated={snapshot => complete(slot, snapshot, state.roundIndex)}/>)}</div>
    {!layout.fits && <section className="arena-space"><h2>Besarkan ruang bermain</h2><p>Setiap pemain perlukan ruang jejak yang selesa. Putar peranti atau buka paparan penuh.</p><button className="button button-primary" onClick={fullscreen}>Paparan penuh</button><button className="button button-soft" onClick={() => transition({ type: 'END', exitToSolo: true })}>Kembali memilih Solo</button>{notice && <p role="status">{notice}</p>}</section>}
    {layout.fits && state.status === 'ready' && <div className="arena-ready-note"><span role="status">{state.ready.some(Boolean) ? 'Menunggu teman bersedia…' : 'Lihat contoh jika perlu. Kemudian tekan Saya sedia!'}</span>{notice && <span role="status">{notice}</span>}</div>}
    {layout.fits && state.status === 'countdown' && <div className="race-overlay countdown-overlay" role="status"><strong>{countdown}</strong><p>{state.resuming ? 'Sambung bersama…' : 'Bersedia…'}</p></div>}
    {layout.fits && state.status === 'paused' && !exitConfirm && <div className="race-overlay"><section className="race-dialog" role="dialog" aria-modal="true" aria-labelledby="pause-title"><h2 id="pause-title">Rehat sekejap</h2><p>Masa berhenti untuk semua pemain. Angkat jari sebelum menyambung.</p><button className="button button-primary" onClick={() => transition({ type: 'RESUME' })}>Sambung bermain</button><button className="button button-soft" onClick={() => setExitConfirm(true)}>Keluar cabaran</button></section></div>}
    {state.status === 'roundResult' && !pageTurn.turn && !exitConfirm && <div className="race-overlay"><section className="race-dialog round-result" role="dialog" aria-modal="true" aria-labelledby="round-title"><h2 id="round-title">Pusingan {state.roundIndex + 1} selesai!</h2><p>{letter.labelMs} · Kita sudah mencuba bersama.</p><div className="round-score-grid">{state.outcomes.map((outcome, slot) => <div key={slot} className={`player-${slot}`}><h3>{state.profiles[slot]}</h3><strong>{config.unscored ? '—' : outcome.total}<small>markah</small></strong><p>{outcome.outcome === 'playComplete' ? `Siap ${(outcome.elapsedMs / 1000).toFixed(1)} saat` : 'Masa tamat'}</p>{!config.unscored && <small>{outcome.base} siap + {outcome.bonus} masa</small>}</div>)}</div><button className="button button-primary" onClick={nextRound}>{state.roundIndex + 1 === state.letterIds.length ? 'Lihat keputusan' : 'Pusingan seterusnya'}</button><button className="button button-soft" onClick={() => setExitConfirm(true)}>Keluar cabaran</button></section></div>}
    {exitConfirm && <div className="race-overlay"><section className="race-dialog" role="dialog" aria-modal="true" aria-labelledby="exit-title"><h2 id="exit-title">Tamatkan cabaran?</h2><p>Cabaran ini akan dihentikan. Tiada trofi diberikan. Cubaan yang sudah siap tetap disimpan.</p><button className="button button-primary" onClick={() => transition({ type: 'END' })}>Ya, keluar</button><button className="button button-soft" onClick={() => setExitConfirm(false)}>Terus bermain</button></section></div>}
  </main>;
}
