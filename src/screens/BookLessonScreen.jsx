import { forwardRef, useEffect, useImperativeHandle, useReducer, useRef, useState } from 'react';
import { TraceBoard } from '../components/TraceBoard.jsx';
import { AudioControls } from '../components/AudioControls.jsx';
import { Icon } from '../components/Icons.jsx';
import { GameMascot, GardenFriends } from '../components/GameMascot.jsx';
import { BookFrame, BookNavigation } from '../components/BookFrame.jsx';
import { usePageTurn } from '../components/usePageTurn.js';
import { bookDestination, completedBookLetters } from '../game/bookNavigation.js';
import { traceReducer, initialTraceState } from '../tracing/traceReducer.js';
import { ResultScreen } from './ResultScreen.jsx';

const BookActivity = forwardRef(function BookActivity({ letter, audio, preview, adjustment, initialMode, initialActivity, disabled, savedComplete, pageNumber, onComplete, onCopy, onActivity, onDiagnostic }, ref) {
  const [lesson, dispatch] = useReducer(traceReducer, { ...initialTraceState, mode: initialMode, activity: initialActivity });
  const [result, setResult] = useState(null), [notice, setNotice] = useState(''), [settling, setSettling] = useState(true);
  const board = useRef(null), reported = useRef(false);
  const isPlay = lesson.mode === 'play' && lesson.activity !== 'copy';
  useEffect(() => {
    const pause = () => { board.current?.cancel(); audio.stop(); if (lesson.demo) dispatch({ type: 'DEMO_END' }); };
    window.addEventListener('taman-jawi:pause', pause);
    return () => window.removeEventListener('taman-jawi:pause', pause);
  }, [audio, lesson.demo]);
  useEffect(() => {
    let second; const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setSettling(false)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, []);
  function saveCopy(force = false) {
    if (reported.current || (disabled && !force) || board.current?.isBusy()) return false;
    const ink = board.current.exportInk();
    if (!ink.some(line => line.length > 1)) { setNotice('Cuba tulis dahulu sebelum menyimpan.'); return false; }
    reported.current = true;
    const bounded = ink.map(line => line.length <= 700 ? line : Array.from({ length: 700 }, (_, i) => line[Math.round(i * (line.length - 1) / 699)]));
    setResult(onCopy(bounded, lesson)); return true;
  }
  useImperativeHandle(ref, () => ({
    busy: () => settling || lesson.demo || board.current?.isBusy(),
    hasUnsavedCopy: () => lesson.activity === 'copy' && !reported.current && board.current?.exportInk().some(line => line.length > 1),
    save: () => saveCopy(true), cancel: () => board.current?.cancel(),
  }));
  function finish(snapshot) {
    if (reported.current) return;
    reported.current = true; setResult(onComplete(snapshot, lesson)); audio.stop();
  }
  function retry() {
    if (disabled || board.current?.isBusy()) return;
    reported.current = false; setResult(null); setNotice(''); dispatch({ type: 'RETRY' });
  }
  return <div className={`book-spread ${result ? 'book-completed' : ''} ${isPlay ? 'book-play' : ''}`}>
    <section className="book-reference" aria-label="Kenal huruf">
      <div className="book-letter-heading">
        <span className="play-mini-glyph jawi" dir="rtl" lang="ms-Arab">{letter.glyph}</span>
        <div className="play-letter-name"><span className="eyebrow">HURUF KITA · {pageNumber}</span><h1>{letter.labelMs}</h1></div>
        <AudioControls key={letter.id} letter={letter} audio={audio} preview={preview} label="Dengar"/>
      </div>
      <div className="book-reference-glyph jawi" dir="rtl" lang="ms-Arab" aria-hidden="true">{letter.glyph}</div>
      <div className="book-reward" aria-live="polite">
        {result ? <ResultScreen embedded letter={letter} result={result} onAgain={retry} onCopy={() => onActivity(true)}/>
          : <><span className={`book-sticker ${savedComplete ? 'earned' : ''}`}><Icon name="flower" size={26}/>{savedComplete ? 'Siap dijejak' : 'Satu huruf, satu langkah!'}</span><p>{lesson.activity === 'copy' ? 'Cuba tulis sendiri. Simpan untuk guru apabila siap.' : 'Ikut bulatan nombor. Angkat jari antara bahagian.'}</p></>}
      </div>
      <div className="book-tools board-actions">
        {!result && lesson.activity !== 'copy' && <button className="button button-soft" disabled={disabled || settling || lesson.demo} onClick={() => { if (!board.current?.isBusy()) dispatch({ type: 'DEMO' }); }}><Icon name="play" size={18}/>{lesson.demo ? 'Sedang menunjukkan…' : isPlay ? 'Tunjuk cara' : 'Lihat cara'}</button>}
        {!result && <button className="button button-outline" disabled={disabled || settling} onClick={retry}><Icon name="retry" size={18}/>Cuba lagi</button>}
        {!result && lesson.activity === 'copy' && <button className="button button-primary" disabled={disabled || settling} onClick={() => saveCopy()}><Icon name="check" size={18}/>Simpan untuk guru</button>}
      </div>
      <div className="book-friend"><GameMascot pose={result ? 'celebrate' : 'rest'}/><span>Perlahan pun boleh.<br/>Kita cuba bersama!</span></div>
      {notice && <p role="status" className="audio-notice">{notice}</p>}
    </section>
    <section className="book-writing lesson-workspace" aria-label="Aktiviti menulis">
      <TraceBoard ref={board} letter={letter} mode={lesson.mode} activity={lesson.activity} attempt={lesson.attempt} demo={lesson.demo} adjustment={adjustment} enabled={!disabled && !settling && !result} onDemoEnd={() => dispatch({ type: 'DEMO_END' })} onComplete={finish} onDiagnostic={onDiagnostic}/>
    </section>
  </div>;
});

export function BookLessonScreen({ letter, sequence, progress, navigationRef, audio, preview, adjustment, initialMode = 'play', initialActivity = 'trace', onNavigate, onActivity, onBack, onComplete, onCopy, onDiagnostic }) {
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
  return <main ref={main} className="lesson-page book-lesson">
    <div className="book-topline"><button className="text-button" onClick={() => request(onBack)}><Icon name="back" size={18}/>Taman huruf</button><span>Buku Jawi Saya</span><span className="book-mode-label lesson-pilot">{preview ? 'Pratonton dewasa' : initialMode === 'play' ? 'Jejak Ceria' : 'Pilihan guru'}</span></div>
    <BookFrame turn={pageTurn.turn} onTurnEnd={pageTurn.finish}>
      <div className="book-bookmark" aria-hidden="true">✿</div>
      {end ? <section className="book-end"><GardenFriends celebrate/><span className="eyebrow">AKHIR BUKU</span><h1>Hebat, sampai halaman terakhir!</h1><p>{preview ? 'Pratonton buku selesai.' : `${completed.size} daripada ${pages.length} huruf siap dijejak dalam latihan ${initialMode === 'play' ? 'Jejak Ceria' : initialMode === 'precision' ? 'Kurang panduan' : 'Berpandu'}.`}</p><p>Boleh buka mana-mana huruf dan cuba lagi.</p><div className="book-end-actions"><button className="button button-primary" onClick={() => request(onBack)}>Buka isi kandungan</button><button className="button button-outline" onClick={() => request(() => { setEnd(false); setReplay(value => value + 1); onNavigate(pages[0]); }, true, 'previous')}>Main lagi</button></div></section>
        : <BookActivity key={`${letter.id}:${initialActivity}:${replay}`} ref={activity} letter={letter} audio={audio} preview={preview} adjustment={adjustment} initialMode={initialMode} initialActivity={initialActivity} disabled={Boolean(pageTurn.turn || copyExit)} savedComplete={completed.has(letter.id)} pageNumber={`${index + 1}/${pages.length}`} onComplete={onComplete} onCopy={onCopy} onActivity={copy => request(() => onActivity(copy))} onDiagnostic={onDiagnostic}/>}
      <BookNavigation index={index} total={pages.length} end={end} disabled={Boolean(pageTurn.turn || copyExit)} onNext={next} onPrevious={previous} onContents={() => request(onBack)}/>
    </BookFrame>
    <p className="book-browse-note">Belum siap? Boleh selak. Huruf yang belum siap bermula semula apabila dibuka.</p>
    <span className="visually-hidden" aria-live="polite">{end ? 'Akhir buku' : `Huruf ${letter.labelMs}, halaman ${index + 1} daripada ${pages.length}`}</span>
    {copyExit && <div className="modal-backdrop"><section ref={confirmation} className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="copy-exit-title"><h2 id="copy-exit-title">Tulisan belum disimpan</h2><p>Simpan tulisan untuk guru sebelum meninggalkan halaman?</p><button className="button button-primary" onClick={() => { if (!activity.current?.save()) return; const pending = copyExit; setCopyExit(null); perform(pending.action, pending.flip, pending.direction); }}>Simpan</button><button className="button button-outline" onClick={() => { const pending = copyExit; setCopyExit(null); perform(pending.action, pending.flip, pending.direction); }}>Keluar tanpa simpan</button><button className="text-button" onClick={() => setCopyExit(null)}>Kembali</button></section></div>}
  </main>;
}
