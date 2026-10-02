import { Trophy } from '../components/Trophy.jsx';
import { GardenFriends, ProfilePortrait } from '../components/GameMascot.jsx';
export function MatchResultScreen({ result, available, onRematch, onNew, onHome }) {
  const awards = result.awards, winners = awards.winners.map(slot => result.profiles[slot]);
  return <main className="match-results page-enter">
    <span className="eyebrow">JEJAK CERIA · DENGAN BANTUAN</span>
    {awards.trophy && !result.unscored && <Trophy tier={awards.trophy} shared={awards.shared}/>}
    <GardenFriends celebrate className="result-friends"/>
    <h1>{result.unscored ? 'Pratonton selesai!' : awards.shared ? 'Trofi bersama!' : awards.winners.length ? `${winners.join(' & ')} dapat trofi!` : 'Bagus, kita sudah mencuba!'}</h1>
    <p>{result.unscored ? 'Pratonton dewasa tidak menyimpan markah atau memberikan trofi.' : awards.tieBreak ? 'Markah sama. Jumlah masa siap menentukan pemenang.' : awards.shared ? 'Markah dan jumlah masa hampir sama. Kedua-dua teman menang!' : awards.trophy ? 'Setiap huruf ialah satu langkah yang bermakna.' : 'Cuba lagi dengan tenang. Trofi menanti apabila cabaran berjaya.'}</p>
    <div className="round-score-grid">{result.profiles.map((profile, slot) => <div key={slot} className={`player-${slot}`}><h2><ProfilePortrait profile={profile}/>{profile}</h2><strong>{result.unscored ? '—' : awards.totals[slot]}<small>daripada {200 * result.letterIds.length} markah</small></strong><p>{result.rounds.filter(r => r.players[slot].outcome === 'playComplete').length}/{result.letterIds.length} huruf siap</p></div>)}</div>
    {result.mode === 'solo' && !result.unscored && <p className="small-muted">Siap semua pusingan · Gangsa {100 * result.letterIds.length} · Perak {140 * result.letterIds.length} · Emas {170 * result.letterIds.length}</p>}
    <div className="match-buttons"><button className="button button-primary" onClick={onRematch}>Main semula</button><button className="button button-outline" onClick={onNew}>Huruf baharu</button><button className="button button-soft" onClick={onHome}>Halaman utama</button></div>
    {!available && <p role="status">Storan pelayar tidak tersedia. Eksport rekod di Ruang guru sebelum menutup.</p>}
    <p className="small-muted">Markah dan trofi ialah ganjaran permainan, bukan penilaian KPM. Cabaran tidak disambung selepas memuat semula halaman.</p>
  </main>;
}
