import { useState } from 'react';
import { Icon } from './Icons.jsx';
export function AudioControls({ letter, audio, preview, label = 'Dengar nama' }) {
  const [notice, setNotice] = useState('');
  async function play(recording) {
    const result = await audio.play(recording, { preview });
    if (result.ok) setNotice(recording.status === 'approved' ? 'Dengar dan sebut semula.' : 'Suara draf. Dengar dan sebut semula.');
    else if (result.reason !== 'obsolete') setNotice(result.reason === 'missing' ? 'Rakaman belum tersedia. Sebut nama huruf bersama guru.' : 'Audio tidak dapat dimainkan. Tekan Dengar untuk cuba semula.');
  }
  return <div className="audio-group">
    <button className="button button-soft" onClick={() => play(letter.audio.name)}><Icon name="sound"/>{label}</button>
    {letter.audio.pronunciationExamples.map((recording, i) => <button key={i} className="button button-soft" onClick={() => play(recording)}>{recording.labelMs || 'Contoh bunyi'}</button>)}
    {notice && <p className="audio-notice" role="status">{notice}</p>}
  </div>;
}
