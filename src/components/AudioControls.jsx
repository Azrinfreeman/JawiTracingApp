import { useCallback, useState } from 'react';
import { Icon } from './Icons.jsx';
import { FitDialog } from './FitDialog.jsx';
import { voiceMessage } from '../audio/audioManager.js';
export function AudioControls({ letter, audio, preview, label = 'Dengar nama', ariaLabel, compact = false, disabled = false, onAction, onResult }) {
  const [notice, setNotice] = useState('');
  const close = useCallback(() => setNotice(''), []);
  async function play(recording) {
    onAction?.();
    const result = await audio.play(recording, { preview });
    onResult?.(result);
    if (result.reason !== 'obsolete') setNotice(compact && result.reason === 'muted' ? '' : voiceMessage(result) || (compact ? '' : recording.status === 'approved' ? 'Dengar dan sebut semula.' : 'Suara draf. Dengar dan sebut semula.'));
  }
  return <div className={`audio-group ${compact ? 'compact-audio' : ''}`}>
    <button className="button button-soft" aria-label={ariaLabel} disabled={disabled} onClick={() => play(letter.audio.name)}><Icon name="sound"/>{label}</button>
    {letter.audio.pronunciationExamples.map((recording, i) => <button key={i} className="button button-soft" onClick={() => play(recording)}>{recording.labelMs || 'Contoh bunyi'}</button>)}
    {notice && (compact ? <FitDialog title="Dengar nama huruf" onClose={close}><div className="letter-help"><p className="audio-notice" role="status">{notice}</p><button className="button button-soft" onClick={() => play(letter.audio.name)}>Dengar sekali lagi</button></div></FitDialog> : <p className="audio-notice" role="status">{notice}</p>)}
  </div>;
}
