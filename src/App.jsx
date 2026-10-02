import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import letters from './content/letters.json';
import { validateLetter } from './content/validateContent.js';
import { createProgressStore } from './storage/progressStore.js';
import { createMatchStore } from './storage/matchStore.js';
import { newMatch } from './game/matchConfig.js';
import { MatchSetupScreen } from './screens/MatchSetupScreen.jsx';
import { MatchScreen } from './screens/MatchScreen.jsx';
import { MatchResultScreen } from './screens/MatchResultScreen.jsx';
import { createAudioManager } from './audio/audioManager.js';
import { Icon } from './components/Icons.jsx';
import { CompanyBrand } from './components/CompanyBrand.jsx';
import { ProfilePortrait } from './components/GameMascot.jsx';
import { SplashScreen } from './screens/SplashScreen.jsx';
import { WelcomeScreen } from './screens/WelcomeScreen.jsx';
import { LetterGarden } from './screens/LetterGarden.jsx';
import { LessonScreen } from './screens/LessonScreen.jsx';
import { eligibleBook } from './game/bookNavigation.js';
import { TeacherScreen } from './screens/TeacherScreen.jsx';

function getStorage() { try { return window.localStorage; } catch { return { getItem() { throw new Error('Unavailable'); }, setItem() { throw new Error('Unavailable'); } }; } }
export default function App() {
  const store = useMemo(() => createProgressStore(getStorage()), []);
  const matchStore = useMemo(() => createMatchStore(getStorage()), []);
  const [matchMode, setMatchMode] = useState('solo'), [match, setMatch] = useState(null), [matchResult, setMatchResult] = useState(null);
  const audio = useMemo(() => createAudioManager(), []);
  const [progress, setProgress] = useState(() => store.read());
  const [showSplash, setShowSplash] = useState(true);
  const dismissSplash = useCallback(() => setShowSplash(false), []);
  const [screen, setScreen] = useState('welcome'), [preview, setPreview] = useState(false), [gate, setGate] = useState(false);
  const [selected, setSelected] = useState(letters.find(l => l.id === 'alif'));
  const [activity, setActivity] = useState('trace'), [muted, setMuted] = useState(false), [volume, setVolume] = useState(0.8);
  const [bookIds, setBookIds] = useState([]), bookExit = useRef(null);
  const book = eligibleBook(letters, preview).filter(letter => !bookIds.length || bookIds.includes(letter.id));
  const [adjustment, setAdjustment] = useState('standard');
  const [practiceMode, setPracticeMode] = useState('play');
  const diagnostic = useRef(null), gateRef = useRef(null);
  const ready = letters.filter(l => validateLetter(l).ready);
  const modelCount = letters.filter(l => l.geometry.strokes.length).length;
  const draftCount = letters.filter(l => l.geometry.strokes.length && l.geometry.status !== 'approved').length;
  const refresh = () => setProgress({ ...store.read() });
  useEffect(() => { audio.setMuted(muted); }, [audio, muted]);
  useEffect(() => { audio.setVolume(volume); }, [audio, volume]);
  useEffect(() => { audio.stop(); document.title = showSplash ? 'Taman Jawi · Hanana Academy' : screen === 'lesson' ? `${selected.labelMs} · Taman Jawi` : 'Taman Jawi · Mari menulis';
    if (showSplash) return;
    window.scrollTo({ top: 0 });
    const focusFrame = requestAnimationFrame(() => {
      const heading = document.querySelector('main h1');
      if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    });
    return () => cancelAnimationFrame(focusFrame);
  }, [showSplash, screen, selected, audio]);
  useEffect(() => () => audio.stop(), [audio]);
  useEffect(() => {
    if (!gate) return;
    const previous = document.activeElement;
    const dialog = gateRef.current; dialog?.querySelector('button')?.focus();
    const handler = event => {
      if (event.key === 'Escape') setGate(false);
      if (event.key === 'Tab') {
        const controls = [...dialog.querySelectorAll('button')];
        if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1).focus(); }
        else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0].focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); previous?.focus(); };
  }, [gate]);
  function start(mode = 'practice') { if (mode === 'solo' || mode === 'duo') { setMatchMode(mode); setScreen('matchSetup'); } else if (ready.length || preview) setScreen('garden'); else setGate(true); }
  function startMatch(settings, sequence) { setMatch(newMatch(settings, letters, sequence)); setScreen('match'); }
  function saveRaceAttempt(snapshot, { config, letter, slot, roundIndex, retries, assistance }) {
    store.addAttempt({ id: `${config.id}:${roundIndex}:${slot}`, timestamp: new Date().toISOString(), profile: config.profiles[slot], letterId: letter.id,
      contentVersion: letter.contentVersion, audioVersion: letter.audio.name.version, geometryStatus: letter.geometry.status, audioStatus: letter.audio.name.status,
      pointerType: snapshot.pointerType, mode: 'play', preview: false, toleranceProfile: snapshot.profile.id,
      interactionPolicy: snapshot.interactionPolicy, inkPolicy: snapshot.inkPolicy, dotInputPolicy: snapshot.dotInputPolicy,
      ...(snapshot.displayAssistance ? { displayAssistance: snapshot.displayAssistance } : {}), metrics: snapshot.metrics, assistance, retries, outcome: snapshot.outcome,
      sessionType: config.mode, matchId: config.id, roundIndex, playerSlot: slot }); refresh();
  }
  function saveMatch(summary, abandoned = false) {
    if (!summary.unscored) matchStore.add(summary);
    refresh();
    if (abandoned) { if (summary.exitToSolo) setMatchMode('solo'); setScreen('matchSetup'); }
    else { setMatchResult(summary); setScreen('matchResult'); }
  }
  function openLetter(letter, copy = false, sequence) {
    if (!validateLetter(letter).valid || (!preview && !validateLetter(letter).ready)) return;
    if (sequence) setBookIds(eligibleBook(sequence, preview).map(item => item.id));
    setSelected(letter); setActivity(copy ? 'copy' : 'trace'); setScreen('lesson');
  }
  function goScreen(destination) { if (screen === 'lesson') bookExit.current?.leave(() => setScreen(destination)); else setScreen(destination); }
  useEffect(() => {
    const back = () => {
      if (screen === 'match' && !showSplash) return;
      if (showSplash || screen === 'welcome') { audio.stop(); globalThis.TamanJawiAndroid?.confirmExit?.(); }
      else goScreen(screen === 'lesson' ? 'garden' : 'welcome');
    };
    window.addEventListener('taman-jawi:back', back);
    return () => window.removeEventListener('taman-jawi:back', back);
  }, [screen, showSplash, audio]);
  function previewStart() { setPreview(true); setGate(false); setScreen('garden'); }
  function finish(snapshot, lesson) {
    const record = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), profile: progress.profile, letterId: selected.id,
      contentVersion: selected.contentVersion, audioVersion: selected.audio.name.version, geometryStatus: selected.geometry.status,
      audioStatus: selected.audio.name.status, pointerType: snapshot.pointerType, mode: lesson.mode, preview,
      toleranceProfile: snapshot.profile.id, interactionPolicy: snapshot.interactionPolicy,
      inkPolicy: snapshot.inkPolicy, dotInputPolicy: snapshot.dotInputPolicy,
      ...(snapshot.displayAssistance ? { displayAssistance: snapshot.displayAssistance } : {}),
      metrics: snapshot.metrics, assistance: lesson.assistance, retries: lesson.retries, outcome: snapshot.outcome };
    store.addAttempt(record); refresh(); return record;
  }
  function saveCopy(ink, lesson) {
    store.addCopy({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), profile: progress.profile, letterId: selected.id, contentVersion: selected.contentVersion, preview, ink, assistance: lesson.assistance });
    refresh(); return { outcome: 'copySaved' };
  }
  if (showSplash) return <SplashScreen onContinue={dismissSplash} />;
  return <div className="app-shell" data-screen={screen}>
    <a className="skip-link" href="#main-content">Langkau ke kandungan</a>
    {screen !== 'match' && <header className="site-header"><button className="brand" onClick={() => goScreen('welcome')} aria-label="Taman Jawi, halaman utama"><span className="brand-symbol"><Icon name="leaf" size={27}/><span/></span><span>Taman<span className="brand-light"> Jawi</span><small>TUMBUH BERSAMA HURUF</small></span></button>
      <nav aria-label="Navigasi utama"><button className="header-teacher" aria-label="Ruang guru" onClick={() => goScreen('teacher')}><Icon name="teacher" size={19}/><span className="teacher-label-wide">Ruang guru</span><span className="teacher-label-short">Guru</span></button><span className="header-line"/><button className="mute-button" onClick={() => setMuted(v => !v)} aria-label={muted ? 'Hidupkan audio' : 'Senyapkan audio'} aria-pressed={muted}><Icon name={muted ? 'mute' : 'sound'} size={20}/></button><span className="profile-avatar" aria-label={`Profil ${progress.profile}`}><ProfilePortrait profile={progress.profile}/></span></nav>
    </header>}
    {preview && <div className="preview-banner" role="status"><span>Pratonton dewasa · {modelCount} model huruf{draftCount > 0 && ` · ${draftCount} draf untuk semakan`} · {letters.some(letter => letter.audio.name.status !== 'approved') ? 'suara draf untuk semakan' : 'suara diluluskan'}</span><button onClick={() => { const leave = () => { setPreview(false); setScreen('welcome'); }; if (screen === 'lesson') bookExit.current?.leave(leave); else leave(); }}>Tamatkan pratonton</button></div>}
    <div id="main-content" tabIndex="-1">
      {screen === 'welcome' && <WelcomeScreen onStart={start} profile={progress.profile} setProfile={profile => { store.setProfile(profile); refresh(); }}/>}
      {screen === 'matchSetup' && <MatchSetupScreen key={matchMode} mode={matchMode} profile={progress.profile} letters={letters} onStart={startMatch} onBack={() => setScreen('welcome')} onSolo={() => setMatchMode('solo')}/>}
      {screen === 'match' && <MatchScreen key={match.id} config={match} letters={letters} audio={audio} onAttempt={saveRaceAttempt} onFinish={summary => saveMatch(summary)} onExit={summary => saveMatch(summary, true)}/>}
      {screen === 'matchResult' && <MatchResultScreen result={matchResult} available={store.isAvailable() && matchStore.isAvailable()} onRematch={() => startMatch(matchResult, matchResult.letterIds)} onNew={() => startMatch(matchResult)} onHome={() => setScreen('welcome')}/>}
      {screen === 'garden' && <LetterGarden letters={letters} preview={preview} progress={progress} mode={practiceMode} onLetter={openLetter} onBack={() => setScreen('welcome')}/>}
      {screen === 'lesson' && <LessonScreen letter={selected} sequence={book} progress={progress} navigationRef={bookExit} audio={audio} preview={preview} adjustment={adjustment} initialMode={practiceMode} initialActivity={activity} onNavigate={letter => openLetter(letter, false, book)} onActivity={copy => openLetter(selected, copy)} onBack={() => setScreen('garden')} onComplete={finish} onCopy={saveCopy} onDiagnostic={value => { diagnostic.current = { ...value, letterId: selected.id, contentVersion: selected.contentVersion }; }}/ >}
      {screen === 'teacher' && <TeacherScreen letters={letters} progress={progress} store={store} matchStore={matchStore} audio={audio} diagnostic={diagnostic.current} preview={preview} practiceMode={practiceMode} onPracticeMode={setPracticeMode} adjustment={adjustment} onAdjustment={setAdjustment} onPreview={previewStart} onRefresh={refresh} onBack={() => setScreen('welcome')} onLetter={letter => { setBookIds([]); setPreview(true); setSelected(letter); setActivity('trace'); setScreen('lesson'); }}/ >}
    </div>
    <footer className="site-footer"><span className="footer-note"><Icon name="flower" size={16}/>Dibuat untuk langkah kecil yang bermakna.</span><span className="footer-motto">Kenal. Dengar. Jejak.</span><CompanyBrand /></footer>
    {screen === 'teacher' && <div className="volume-control"><label htmlFor="volume">Kelantangan audio</label><input id="volume" type="range" min="0" max="1" step="0.1" value={volume} onChange={event => setVolume(Number(event.target.value))}/></div>}
    {gate && <div className="modal-backdrop"><section className="preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title" ref={gateRef}><span className="modal-icon"><Icon name="teacher" size={30}/></span><h2 id="preview-title">Pratonton untuk guru & penjaga</h2><p>{modelCount} model huruf tersedia untuk pratonton dewasa. Model dan rakaman yang belum diluluskan perlu disemak sebelum digunakan bersama murid.</p><p className="small-muted">{ready.length ? `${ready.length} pelajaran tersedia untuk murid.` : 'Tiada pelajaran diluluskan untuk murid buat masa ini.'} Pratonton ini menguji fungsi game.</p><button className="button button-primary" onClick={previewStart}>Buka pratonton dewasa<Icon name="arrow"/></button><button className="text-button" onClick={() => setGate(false)}>Kembali dahulu</button></section></div>}
  </div>;
}
