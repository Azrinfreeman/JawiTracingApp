import { useCallback, useState } from 'react';
import { Icon } from './Icons.jsx';
import { FitDialog } from './FitDialog.jsx';
export function AudioControls({ letter, audio, preview, label = 'Dengar nama', compact = false, disabled = false, onAction }) {
  const [notice, setNotice] = useState('');
  const close = useCallback(() => setNotice(''), []);
  async function play(recording) {
    onAction?.();
    const result = await audio.play(recording, { preview });
    if (result.ok) setNotice(compact ? '' : recording.status === 'approved' ? 'Dengar dan sebut semula.' : 'Suara draf. Dengar dan sebut semula.');
    else if (result.reason !== 'obsolete') setNotice(result.reason === 'missing' ? 'Rakaman belum tersedia. Sebut nama huruf bersama guru.' : 'Audio tidak dapat dimainkan. Tekan Dengar untuk cuba semula.');
  }
  return <div className={`audio-group ${compact ? 'compact-audio' : ''}`}>
    <button className="button button-soft" disabled={disabled} onClick={() => play(letter.audio.name)}><Icon name="sound"/>{label}</button>
    {letter.audio.pronunciationExamples.map((recording, i) => <button key={i} className="button button-soft" onClick={() => play(recording)}>{recording.labelMs || 'Contoh bunyi'}</button>)}
    {notice && (compact ? <FitDialog title="Dengar nama huruf" onClose={close}><div className="letter-help"><p className="audio-notice" role="status">{notice}</p><button className="button button-soft" onClick={() => play(letter.audio.name)}>Dengar sekali lagi</button></div></FitDialog> : <p className="audio-notice" role="status">{notice}</p>)}
  </div>;
}
