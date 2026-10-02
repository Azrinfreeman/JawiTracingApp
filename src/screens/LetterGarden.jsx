import { useState } from 'react';
import { LetterCard } from '../components/LetterCard.jsx';
import { Icon } from '../components/Icons.jsx';
import { GardenFriends } from '../components/GameMascot.jsx';
import { GardenBunting } from '../components/GameIllustrations.jsx';
import { completedBookLetters } from '../game/bookNavigation.js';
import { validateLetter } from '../content/validateContent.js';
export function LetterGarden({ letters, preview, progress, mode = 'play', onLetter, onBack }) {
  const [filter, setFilter] = useState(preview ? 'pilot' : 'models');
  const visible = letters.filter(l => filter === 'all' || (filter === 'models' ? preview ? l.geometry.strokes.length : validateLetter(l).ready : filter === 'additional' ? l.additional : l.pilot));
  const visited = new Set(progress.attempts.filter(a => a.profile === progress.profile && a.preview === preview).map(a => a.letterId));
  const completed = completedBookLetters(letters, progress, mode, preview);
  return <main className="garden-page page-enter">
    <button className="text-button back-button" onClick={onBack}><Icon name="back" size={18}/>Kembali</button>
    <div className="garden-heading"><div><span className="eyebrow">BUKU JAWI SAYA · ISI KANDUNGAN</span><h1>Hari ini, huruf apa?</h1><p>Buka halaman huruf kegemaran. Dengar, jejak dan selak!</p></div><GardenFriends className="garden-heading-friends"/><div className="garden-progress"><span>✿</span><strong>{completed.size}</strong><small>huruf siap dijejak · {visited.size} pernah dicuba</small></div></div>
    <GardenBunting/>
    <div className="garden-toolbar"><div className="segmented" role="group" aria-label="Kumpulan huruf">
      {[...(preview ? [] : [['models','Huruf tersedia']]),['pilot','Huruf permulaan'],['all','Semua huruf'],['additional','Huruf tambahan'],...(preview ? [['models','Model tersedia']] : [])].map(([id, label]) => <button key={id} aria-pressed={filter === id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>{label}</button>)}
    </div><span className="garden-count">{visible.length} huruf untuk dikenali</span></div>
    <div className="letter-grid">{visible.map((letter, i) => <LetterCard key={letter.id} letter={letter} index={i} draft={preview && !!letter.geometry.strokes.length && letter.geometry.status !== 'approved'} enabled={validateLetter(letter).valid && (preview ? !!letter.geometry.strokes.length : validateLetter(letter).ready)} visited={visited.has(letter.id)} completed={completed.has(letter.id)} onClick={() => onLetter(letter, false, visible)}/>)}</div>
    <p className="garden-bottom"><Icon name="leaf" size={18}/>Tak perlu tergesa-gesa. Ulang huruf kegemaran bila-bila masa.</p>
  </main>;
}
