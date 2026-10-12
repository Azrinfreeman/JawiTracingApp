import { Children, useEffect, useId, useRef, useState } from 'react';
import { FitDialog } from './FitDialog.jsx';
import { Icon } from './Icons.jsx';

const SECTIONS = [['help', 'Bantuan'], ['letters', 'Pilih huruf'], ['settings', 'Tetapan']];

export function MenuButton({ onClick, disabled, label = 'Menu permainan' }) {
  return <button type="button" className="stage-menu-button control-help" aria-label={label} aria-haspopup="dialog" disabled={disabled} onClick={event => { event.currentTarget.focus({ preventScroll: true }); onClick(); }}><span aria-hidden="true">☰</span><span className="stage-menu-label">Menu</span></button>;
}

export function StageNavigation({ onBack, disabled, menuDisabled, onMenu, onDemo, demoLabel = 'Tunjuk cara', demoDisabled, backLabel = 'Kembali', backAriaLabel = 'Kembali ke Isi Kandungan' }) {
  return <nav className="stage-navigation" aria-label="Navigasi permainan" data-stage-control>
    <button type="button" className="stage-menu-button control-navigation" disabled={disabled} aria-label={backAriaLabel} onClick={event => { event.currentTarget.focus({ preventScroll: true }); onBack(); }}><Icon name="back"/><span>{backLabel}</span></button>
    <MenuButton onClick={onMenu} disabled={disabled || menuDisabled}/>
    {onDemo && <button type="button" className="stage-menu-button control-help stage-demo-button" disabled={disabled || demoDisabled} onClick={onDemo}><Icon name="play"/><span>{demoLabel}</span></button>}
  </nav>;
}

export function TracingMenu({ title = 'Menu permainan', children, sound, onClose, onBack, resumeLabel = 'Sambung jejak' }) {
  const [section, setSection] = useState('help'), [page, setPage] = useState(0), [pageSize, setPageSize] = useState(6);
  const body = useRef(null), tabs = useRef([]), id = useId();
  const supplied = Children.toArray(children).filter(Boolean);
  const items = section === 'settings' ? [...supplied.filter(item => item.props?.['data-menu-section'] === 'settings'),
    <button key="music" className="button button-outline" aria-pressed={sound.musicEnabled} onClick={sound.toggleMusic}><span aria-hidden="true">♫</span>Muzik: {sound.musicEnabled ? 'Hidup' : 'Mati'}</button>,
    <button key="mute" className="button button-outline" aria-pressed={!sound.muted} onClick={sound.toggleMute}><Icon name={sound.muted ? 'mute' : 'sound'}/>Audio: {sound.muted ? 'Senyap' : 'Hidup'}</button>,
    <button key="fullscreen" className="button button-outline" onClick={sound.fullscreen}><span aria-hidden="true">⛶</span>Paparan penuh</button>]
    : supplied.filter(item => (item.props?.['data-menu-section'] || 'help') === section);
  const total = Math.max(1, Math.ceil(items.length / pageSize)), currentPage = Math.min(page, total - 1);
  useEffect(() => {
    const measure = () => setPageSize(Math.max(2, Math.min(8, Math.floor((body.current.clientHeight + 10) / 66) * 2)));
    const observer = new ResizeObserver(measure); observer.observe(body.current); measure();
    return () => observer.disconnect();
  }, []);
  function selectSection(index, focus = false) { setSection(SECTIONS[index][0]); setPage(0); if (focus) tabs.current[index]?.focus(); }
  return <FitDialog title={title} onClose={onClose} onBack={onBack}>
    <div className="tracing-menu">
      <div className="tracing-menu-tabs" role="tablist" aria-label="Bahagian menu">
        {SECTIONS.map(([key, label], index) => <button key={key} ref={node => { tabs.current[index] = node; }} type="button" role="tab" id={`${id}-${key}`} aria-controls={`${id}-panel`} aria-selected={section === key} tabIndex={section === key ? 0 : -1} onClick={() => selectSection(index)} onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : event.key === 'Home' ? 0 : event.key === 'End' ? 2 : null;
          if (next !== null) { event.preventDefault(); selectSection(next, true); }
        }}>{label}</button>)}
      </div>
      <div ref={body} className="tracing-menu-body" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${section}`}>
        <div className="tracing-menu-grid">{items.slice(currentPage * pageSize, (currentPage + 1) * pageSize)}</div>
        {!items.length && <p className="menu-notice">Tiada pilihan tambahan di sini. Boleh sambung bermain.</p>}
      </div>
      {sound.notice && <p className="menu-notice" role="status">{sound.notice}</p>}
      <nav className="tracing-menu-pages" aria-label="Halaman menu" style={total === 1 ? { visibility: 'hidden' } : undefined}>
        <button className="button button-outline" aria-label="Halaman menu sebelumnya" disabled={!currentPage} onClick={() => setPage(currentPage - 1)}>Menu sebelum</button><span>{currentPage + 1}/{total}</span><button className="button button-outline" aria-label="Halaman menu seterusnya" disabled={currentPage + 1 === total} onClick={() => setPage(currentPage + 1)}>Menu berikut</button>
      </nav>
      <button className="button button-primary menu-resume" onClick={onClose}><Icon name="play"/>{resumeLabel}</button>
    </div>
  </FitDialog>;
}

/** Stage-only presentation: announcements stay available, only recovery cues and opted-in dot help are drawn. */
export function StageSupport({ status, instruction, dots, pendingDot, inkLimit, blocked, paused, assistance, cue, showCue }) {
  return <>
    <div className={`trace-announcements ${showCue || blocked || inkLimit || paused ? 'stage-cue' : 'visually-hidden'}`}>
      {showCue ? <p className="writing-cue board-tip" role="status">{cue}</p> : status}
    </div>
    <div className="visually-hidden">{instruction}</div>
    {inkLimit ? <div className="trace-recovery">{dots}</div>
      : assistance && pendingDot && <div className="trace-assistance">{dots}</div>}
  </>;
}
