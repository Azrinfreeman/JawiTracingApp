import { useState } from 'react';
import { Icon } from './Icons.jsx';

export function AudioReviewPanel({ letters, audio }) {
  const [selectedId, setSelectedId] = useState(letters[0].id);
  const [notice, setNotice] = useState('');
  const selected = letters.find(letter => letter.id === selectedId);
  const index = letters.findIndex(letter => letter.id === selectedId);
  const recording = selected.audio.name;
  const available = letters.filter(letter => letter.audio.name.src).length;
  const approved = letters.filter(letter => letter.audio.name.status === 'approved').length;
  function select(id) { audio.stop(); setNotice(''); setSelectedId(id); }
  async function listen() {
    const result = await audio.play(recording, { preview: true });
    if (result.reason === 'obsolete') return;
    setNotice(result.ok
      ? `Rakaman ${selected.labelMs} dimainkan.${recording.status === 'approved' ? '' : ' Draf suara ini belum diluluskan.'}`
      : result.reason === 'missing' ? 'Rakaman belum tersedia untuk huruf ini.'
        : result.reason === 'blocked' ? 'Tekan Dengar sekali lagi untuk membenarkan main balik.'
          : result.reason === 'unsupported' ? 'Pelayar ini tidak menyokong rakaman. Cuba Chrome atau Edge untuk semakan suara.'
          : 'Rakaman tidak dapat dimainkan. Tekan Dengar untuk cuba semula.');
  }
  return <section className="teacher-panel audio-review-panel" aria-labelledby="audio-review-heading">
    <h2 id="audio-review-heading">Semakan suara Jawi</h2>
    <p>{available} rakaman nama huruf tersedia. {approved} rakaman diluluskan.{available > approved && ' Rakaman berstatus draf perlu disemak sebutannya sebelum diluluskan.'}</p>
    <label className="field-label" htmlFor="audio-review-letter">Huruf untuk semakan suara</label>
    <select id="audio-review-letter" value={selectedId} onChange={event => select(event.target.value)}>
      {letters.map(letter => <option key={letter.id} value={letter.id}>{letter.labelMs} · {letter.glyph}</option>)}
    </select>
    <p className="audio-review-transcript"><span className="jawi" dir="rtl" lang="ms-Arab">{selected.glyph}</span><span>Nama disebut: <strong>{recording.transcriptMs}</strong><small>{recording.status === 'approved' ? 'Suara diluluskan' : recording.src ? 'Draf suara · belum disemak' : 'Rakaman belum tersedia'}</small>{recording.origin?.kind === 'userProvided' && <small>Rakaman pilihan anda</small>}</span></p>
    <div className="teacher-buttons">
      <button className="button button-soft" disabled={!recording.src} onClick={listen}><Icon name="sound"/>Dengar rakaman {selected.labelMs}</button>
      <button className="button button-outline" onClick={() => select(letters[(index + 1) % letters.length].id)}>Rakaman seterusnya<Icon name="arrow" size={18}/></button>
    </div>
    {notice && <p role="status" className="audio-notice">{notice}</p>}
    <p className="small-muted">Dengar nama huruf, kemudian semak kejelasan sebutan, kelajuan dan kesesuaian untuk murid. Butang Dengar dan Rakaman seterusnya tidak memberi kelulusan.</p>
  </section>;
}
