import { Children, useState } from 'react';
import { FitDialog } from './FitDialog.jsx';

const PAGE_SIZE = 8;

/** The only tracing tools surface: opened on demand, never a permanent strip. */
export function MenuButton({ onClick, disabled, label = 'Menu permainan' }) {
  return <button type="button" className="stage-menu-button" aria-label={label} aria-haspopup="dialog" disabled={disabled} onClick={onClick}><span aria-hidden="true">☰</span><span className="stage-menu-label">Menu</span></button>;
}

export function TracingMenu({ title = 'Menu permainan', children, sound, onClose, onBack }) {
  const [page, setPage] = useState(0);
  const items = [...Children.toArray(children).filter(Boolean),
    <button key="music" className="button button-soft" aria-pressed={sound.musicEnabled} onClick={sound.toggleMusic}>{sound.musicEnabled ? 'Muzik mati' : 'Muzik hidup'}</button>,
    <button key="mute" className="button button-soft" aria-pressed={sound.muted} onClick={sound.toggleMute}>{sound.muted ? 'Hidupkan audio' : 'Senyapkan audio'}</button>,
    <button key="fullscreen" className="button button-outline" onClick={sound.fullscreen}>Paparan penuh</button>];
  const total = Math.ceil(items.length / PAGE_SIZE);
  return <FitDialog title={title} onClose={onClose} onBack={onBack}><div className="tracing-menu-grid">{items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}</div>
    {sound.notice && <p className="menu-notice" role="status">{sound.notice}</p>}
    {total > 1 && <nav className="tracing-menu-pages" aria-label="Halaman menu"><button className="button button-outline" aria-label="Halaman menu sebelumnya" disabled={!page} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>{page + 1}/{total}</span><button className="button button-outline" aria-label="Halaman menu seterusnya" disabled={page + 1 === total} onClick={() => setPage(page + 1)}>Seterusnya</button></nav>}
  </FitDialog>;
}

/** Stage-only presentation: announcements stay available, only recovery cues and opted-in dot help are drawn. */
export function StageSupport({ status, instruction, dots, pendingDot, inkLimit, blocked, paused, assistance }) {
  return <>
    <div className={`trace-announcements ${blocked || inkLimit || paused ? 'stage-cue' : 'visually-hidden'}`}>{status}</div>
    <div className="visually-hidden">{instruction}</div>
    {inkLimit ? <div className="trace-recovery">{dots}</div>
      : assistance && pendingDot && <div className="trace-assistance">{dots}</div>}
  </>;
}
