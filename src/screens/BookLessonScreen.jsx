import { forwardRef, useCallback, useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react';
import { TraceBoard } from '../components/TraceBoard.jsx';
import { AudioControls } from '../components/AudioControls.jsx';
import { Icon } from '../components/Icons.jsx';
import { GameMascot, GardenFriends } from '../components/GameMascot.jsx';
import { BookFrame, BookNavigation } from '../components/BookFrame.jsx';
import { usePageTurn } from '../components/usePageTurn.js';
import { bookDestination, completedBookLetters } from '../game/bookNavigation.js';
import { traceReducer, initialTraceState } from '../tracing/traceReducer.js';
import { ResultScreen } from './ResultScreen.jsx';
import { FitDialog } from '../components/FitDialog.jsx';
import { LetterModelGlyph } from '../components/LetterModelGlyph.jsx';
import { MenuButton, StageSupport, TracingMenu } from '../components/TracingMenu.jsx';
import { PlayFeedback } from '../components/PlayFeedback.jsx';

const BookActivity = forwardRef(function BookActivity({ letter, audio, sound, preview, adjustment, initialMode, initialActivity, disabled, savedComplete, pageNumber, nav, onTeacher, onComplete, onCopy, onActivity, onDiagnostic }, ref) {
  const [lesson, dispatch] = useReducer(traceReducer, { ...initialTraceState, mode: initialMode, activity: initialActivity });
  const [result, setResult] = useState(null), [notice, setNotice] = useState(''), [settling, setSettling] = useState(true);
  const [menu, setMenu] = useState(false), [assist, setAssist] = useState(false), [voiceNote, setVoiceNote] = useState(''), [choices, setChoices] = useState(false);
  const board = useRef(null), reported = useRef(false);
  const isPlay = lesson.mode === 'play' && lesson.activity !== 'copy';
  const hasDots = letter.geometry.dotTargets.length > 0;
  const [help, setHelp] = useState(false);
  const closeHelp = useCallback(() => setHelp(false), []);
  const closeNotice = useCallback(() => setNotice(''), []);
  const closeMenu = useCallback(() => setMenu(false), []);
  useEffect(() => {
    const pause = () => { board.current?.cancel(); audio.stop(); if (lesson.demo) dispatch({ type: 'DEMO_END' }); };
    window.addEventListener('taman-jawi:pause', pause);
    return () => window.removeEventListener('taman-jawi:pause', pause);
  }, [audio, lesson.demo]);
  useEffect(() => {
    let second; const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setSettling(false)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, []);
  // The completion choices appear only after the final release has fully ended.
  useEffect(() => {
    if (!result) { setChoices(false); return; }
    const timer = setTimeout(() => setChoices(true), 700);
    return () => clearTimeout(timer);
  }, [result]);
  function saveCopy(force = false) {
    if (reported.current || (disabled && !force) || board.current?.isBusy()) return false;
    const ink = board.current.exportInk();
    if (!ink.some(line => line.length > 1)) { setNotice('Cuba tulis dahulu sebelum menyimpan.'); return false; }
    reported.current = true;
    const bounded = ink.map(line => line.length <= 700 ? line : Array.from({ length: 700 }, (_, i) => line[Math.round(i * (line.length - 1) / 699)]));
    setResult(onCopy(bounded, lesson)); return true;
  }
  useImperativeHandle(ref, () => ({
    busy: () => help || Boolean(notice) || settling || lesson.demo || board.current?.isBusy(),
    hasUnsavedCopy: () => lesson.activity === 'copy' && !reported.current && board.current?.exportInk().some(line => line.length > 1),
    save: () => saveCopy(true), cancel: () => board.current?.cancel(),
  }));
  async function announce() {
    const played = await audio.play(letter.audio.name, { preview });
    if (played.reason === 'obsolete') return;
    setVoiceNote(played.ok ? '' : 'Tekan Dengar untuk mendengar nama huruf.');
  }
  function finish(snapshot) {
    if (reported.current) return;
    reported.current = true; setResult(onComplete(snapshot, lesson)); setVoiceNote(''); announce();
  }
  function retry() {
    if (disabled || board.current?.isBusy()) return;
    audio.stop(); reported.current = false; setResult(null); setNotice(''); setVoiceNote(''); setMenu(false); dispatch({ type: 'RETRY' });
  }
  function openMenu() { board.current?.cancel(); dispatch({ type: 'DEMO_END' }); setMenu(true); }
  const act = action => () => { setMenu(false); action(); };
  const copyMode = lesson.activity === 'copy';
  const label = copyMode ? 'SALIN' : initialMode === 'play' ? 'JEJAK' : 'LATIHAN';
  return <div className={`book-spread ${result ? 'book-completed' : ''} ${isPlay ? 'book-play' : ''}`}>
    <section className="book-writing lesson-workspace stage-workspace" aria-label="Aktiviti menulis">
      <TraceBoard ref={board} fitted stageOnly dotAssistance={assist && isPlay} letter={letter} mode={lesson.mode} activity={lesson.activity} attempt={lesson.attempt} demo={lesson.demo} adjustment={adjustment} enabled={!disabled && !settling && !result && !help && !menu} onDemoEnd={() => dispatch({ type: 'DEMO_END' })} onComplete={finish} onDiagnostic={onDiagnostic}
        renderSupport={support => <StageSupport {...support} assistance={assist && isPlay}/>}/>
      <MenuButton disabled={disabled || settling} onClick={openMenu}/>
      <div className="stage-badge book-letter-heading" data-long-name={letter.labelMs.length > 7}><div className="play-letter-name"><span className="eyebrow">{pageNumber} · {label}</span><h1>{letter.labelMs}</h1></div>{savedComplete && <span className="book-sticker earned" aria-label="Siap dijejak"><Icon name="flower" size={22}/></span>}</div>
      {copyMode && !result && <button className="button button-primary stage-save" disabled={disabled || settling} onClick={() => saveCopy()}><Icon name="check" size={18}/>Simpan untuk guru</button>}
      {result && <div className="completion-overlay">
        <span className="completion-sparkles" aria-hidden="true"><PlayFeedback complete/></span>
        <div className="completion-card book-reward" role="group" aria-label="Huruf siap" aria-live="polite">
          <ResultScreen embedded letter={letter} result={result} summaryOnly onAgain={retry} onCopy={() => onActivity(true)}/>
          {voiceNote && <p className="audio-notice" role="status">{voiceNote}</p>}
          <div className="completion-actions">
            <AudioControls key={letter.id} compact disabled={!choices} letter={letter} audio={audio} preview={preview} label="Dengar"/>
            <ResultScreen embedded actionsOnly letter={letter} result={result} choicesDisabled={!choices} onAgain={retry} onCopy={() => onActivity(true)}/>
            <button className="button button-primary" aria-label="Huruf seterusnya" disabled={!choices || disabled} onClick={nav.onNext}>Huruf seterusnya</button>
          </div>
        </div>
      </div>}
    </section>
    {menu && <TracingMenu sound={sound} onClose={closeMenu}>
      <AudioControls key={letter.id} compact disabled={disabled || settling} onAction={() => board.current?.cancel()} letter={letter} audio={audio} preview={preview} label="Dengar"/>
      {!result && !copyMode && <button className="button button-soft" disabled={disabled || settling || lesson.demo} onClick={act(() => { if (!board.current?.isBusy()) dispatch({ type: 'DEMO' }); })}><Icon name="play" size={18}/>{isPlay ? 'Tunjuk cara' : 'Lihat cara'}</button>}
      <button className="button button-outline" disabled={disabled || settling} onClick={retry}><Icon name="retry" size={18}/>Cuba lagi</button>
      <button className="button button-outline" aria-label="Kenal huruf dan panduan" disabled={disabled || settling} onClick={act(() => { board.current?.cancel(); audio.stop(); dispatch({ type: 'DEMO_END' }); setHelp(true); })}>Panduan</button>
      <button className="button button-primary" aria-label="Huruf seterusnya" disabled={nav.disabled} onClick={act(nav.onNext)}>Huruf seterusnya</button>
      <button className="button button-outline" aria-label="Huruf sebelumnya" disabled={nav.disabled || nav.index === 0} onClick={act(nav.onPrevious)}>Huruf sebelumnya</button>
      <button className="button button-outline" aria-label="Isi kandungan" disabled={nav.disabled} onClick={act(nav.onContents)}>Isi kandungan</button>
      {isPlay && hasDots && !result && <button className="button button-soft" aria-pressed={assist} onClick={act(() => setAssist(value => !value))}>{assist ? 'Sembunyi bantuan titik' : 'Bantuan titik'}</button>}
      <button className="button button-outline" aria-label="Ruang guru" disabled={nav.disabled} onClick={act(nav.onTeacher)}>Ruang guru</button>
    </TracingMenu>}
    {notice && <FitDialog title="Jom tulis dahulu" onClose={closeNotice}><div className="letter-help"><p role="status">{notice}</p></div></FitDialog>}
    {help && <FitDialog title={`Kenal huruf ${letter.labelMs}`} onClose={closeHelp}><div className="letter-help"><span className="jawi" dir="rtl" lang="ms-Arab"><LetterModelGlyph letter={letter}/></span><p>Ikut bulatan nombor. Angkat jari antara bahagian.</p><p>Belum siap? Boleh selak. Huruf yang belum siap bermula semula apabila dibuka.</p><GameMascot pose="rest"/><p>Perlahan pun boleh. Kita cuba bersama!</p></div></FitDialog>}
  </div>;
});

export function BookLessonScreen({ letter, sequence, progress, navigationRef, audio, sound, preview, adjustment, initialMode = 'play', initialActivity = 'trace', onNavigate, onActivity, onBack, onTeacher, onComplete, onCopy, onDiagnostic }) {
  const activity = useRef(null), main = useRef(null), confirmation = useRef(null);
  const pages = sequence.length ? sequence : [letter], index = Math.max(0, pages.findIndex(page => page.id === letter.id));
  const [end, setEnd] = useState(false), [copyExit, setCopyExit] = useState(null), [replay, setReplay] = useState(0);
  const pageTurn = usePageTurn();
  const completed = completedBookLetters(pages, progress, initialMode, preview);
  function perform(action, flip, direction) {
    activity.current?.cancel(); audio.stop();
    if (flip) pageTurn.start(action, direction); else action();
  }
  function request(action, flip = false, direction = 'next') {
    if (pageTurn.pending() || copyExit || activity.current?.busy()) return;
    if (activity.current?.hasUnsavedCopy()) { setCopyExit({ action, flip, direction }); return; }
    perform(action, flip, direction);
  }
  useImperativeHandle(navigationRef, () => ({ leave: action => request(action) }));
  useEffect(() => {
    const frame = requestAnimationFrame(() => { const heading = main.current?.querySelector('h1'); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); } });
    return () => cancelAnimationFrame(frame);
  }, [letter.id, initialActivity, end]);
  useEffect(() => {
    if (!copyExit) return;
    const previous = document.activeElement; confirmation.current?.querySelector('button')?.focus();
    const key = event => {
      if (event.key === 'Escape') setCopyExit(null);
      if (event.key !== 'Tab') return;
      const buttons = [...confirmation.current.querySelectorAll('button')];
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === buttons.at(-1)) { event.preventDefault(); buttons[0].focus(); }
    };
    document.addEventListener('keydown', key); return () => { document.removeEventListener('keydown', key); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [copyExit]);
  function next() {
    const destination = bookDestination(index, 1, pages.length);
    if (destination !== null) request(() => destination === 'end' ? setEnd(true) : onNavigate(pages[destination]), true);
  }
  function previous() {
    if (end) request(() => setEnd(false), true, 'previous');
    else { const destination = bookDestination(index, -1, pages.length); if (destination !== null) request(() => onNavigate(pages[destination]), true, 'previous'); }
  }
  const nav = { index, disabled: Boolean(pageTurn.turn || copyExit), onNext: next, onPrevious: previous, onContents: () => request(onBack), onTeacher: () => request(onTeacher) };
  const navigation = <BookNavigation index={index} total={pages.length} end={end} disabled={nav.disabled} onNext={next} onPrevious={previous} onContents={nav.onContents}/>;
  return <main ref={main} className="lesson-page book-lesson">
    <div className="book-topline"><button className="text-button" onClick={() => request(onBack)}><Icon name="back" size={18}/>Taman huruf</button><span>Buku Jawi Saya</span><span className="book-mode-label lesson-pilot">{preview ? 'Pratonton dewasa' : initialMode === 'play' ? 'Jejak Ceria' : 'Pilihan guru'}</span></div>
    <BookFrame turn={pageTurn.turn} onTurnEnd={pageTurn.finish}>
      <div className="book-bookmark" aria-hidden="true">✿</div>
      {end ? <section className="book-end"><GardenFriends celebrate/><span className="eyebrow">AKHIR BUKU</span><h1>Hebat, sampai halaman terakhir!</h1><p>{preview ? 'Pratonton buku selesai.' : `${completed.size} daripada ${pages.length} huruf siap dijejak dalam latihan ${initialMode === 'play' ? 'Jejak Ceria' : initialMode === 'precision' ? 'Kurang panduan' : 'Berpandu'}.`}</p><p>Boleh buka mana-mana huruf dan cuba lagi.</p><div className="book-end-actions"><button className="button button-primary" onClick={() => request(onBack)}>Buka isi kandungan</button><button className="button button-outline" onClick={() => request(() => { setEnd(false); setReplay(value => value + 1); onNavigate(pages[0]); }, true, 'previous')}>Main lagi</button></div></section>
        : <BookActivity key={`${letter.id}:${initialActivity}:${replay}`} ref={activity} letter={letter} audio={audio} sound={sound} preview={preview} adjustment={adjustment} initialMode={initialMode} initialActivity={initialActivity} disabled={nav.disabled} savedComplete={completed.has(letter.id)} pageNumber={`${index + 1}/${pages.length}`} nav={nav} onComplete={onComplete} onCopy={onCopy} onActivity={copy => request(() => onActivity(copy))} onDiagnostic={onDiagnostic}/>}
      {end && navigation}
    </BookFrame>
    <p className="book-browse-note">Belum siap? Boleh selak. Huruf yang belum siap bermula semula apabila dibuka.</p>
    <span className="visually-hidden" aria-live="polite">{end ? 'Akhir buku' : `Huruf ${letter.labelMs}, halaman ${index + 1} daripada ${pages.length}`}</span>
    {copyExit && <div className="modal-backdrop"><section ref={confirmation} className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="copy-exit-title"><h2 id="copy-exit-title">Tulisan belum disimpan</h2><p>Simpan tulisan untuk guru sebelum meninggalkan halaman?</p><button className="button button-primary" onClick={() => { if (!activity.current?.save()) return; const pending = copyExit; setCopyExit(null); perform(pending.action, pending.flip, pending.direction); }}>Simpan</button><button className="button button-outline" onClick={() => { const pending = copyExit; setCopyExit(null); perform(pending.action, pending.flip, pending.direction); }}>Keluar tanpa simpan</button><button className="text-button" onClick={() => setCopyExit(null)}>Kembali</button></section></div>}
  </main>;
}
