import { useState } from 'react';
import { DuoInputCheck } from '../components/DuoInputCheck.jsx';
import { eligiblePool, PLAYER_PROFILES } from '../game/matchConfig.js';
import { GardenFriends, ProfilePortrait } from '../components/GameMascot.jsx';
export function MatchSetupScreen({ mode, profile, letters, onStart, onBack, onSolo }) {
  const [profiles, setProfiles] = useState([profile, PLAYER_PROFILES[(PLAYER_PROFILES.indexOf(profile) + 1) % 3]]);
  const [pool, setPool] = useState('pilot'), [roundCount, setRoundCount] = useState(5), [limitMs, setLimitMs] = useState(90000);
  const [checking, setChecking] = useState(false), [notice, setNotice] = useState('');
  const available = eligiblePool(letters, pool), valid = available.length >= roundCount && (mode === 'solo' || profiles[0] !== profiles[1]);
  const start = unscored => onStart({ mode, profiles: profiles.slice(0, mode === 'solo' ? 1 : 2), pool, roundCount, limitMs, unscored, inputCheck: mode === 'duo' && !unscored ? 'simultaneousTouchVerified' : 'notRequired' });
  async function fullscreen() {
    try { await document.documentElement.requestFullscreen(); setNotice('Paparan penuh dibuka.'); }
    catch { setNotice('Paparan penuh tidak tersedia. Boleh terus bermain dalam pelayar.'); }
  }
  return <main className="match-setup page-enter">
    <button className="text-button back-button" aria-label="Kembali" onClick={onBack}>← Kembali</button>
    <span className="eyebrow">JEJAK CERIA · DENGAN BANTUAN</span>
    <GardenFriends className="lobby-friends"/>
    <h1>{mode === 'duo' ? 'Dua teman, satu cabaran!' : 'Jom kumpul trofi!'}</h1>
    <p>{mode === 'duo' ? 'Jejak huruf yang sama, pada masa yang sama. Siap lebih cepat, dapat lebih markah.' : 'Jejak setiap huruf hingga siap. Masa lebih pantas memberi markah tambahan.'}</p>
    {checking ? <DuoInputCheck onVerified={() => start(false)} onPreview={() => start(true)} onSolo={onSolo}/> : <>
      <section className="match-settings"><h2>Pilih teman bermain</h2><div className="match-profile-grid">{profiles.slice(0, mode === 'duo' ? 2 : 1).map((value, slot) => <label key={slot} className={`player-choice player-${slot}`}><span className="player-choice-label"><ProfilePortrait profile={value}/>Pemain {slot + 1}</span><select aria-label={`Profil pemain ${slot + 1}`} value={value} onChange={e => setProfiles(old => old.map((p, i) => i === slot ? e.target.value : p))}>{PLAYER_PROFILES.map(p => <option key={p}>{p}</option>)}</select></label>)}</div>
        {mode === 'duo' && profiles[0] === profiles[1] && <p role="status">Pilih dua profil yang berbeza.</p>}
        <label className="field-label" htmlFor="match-pool">Kumpulan huruf</label><select id="match-pool" value={pool} onChange={e => setPool(e.target.value)}><option value="pilot">{eligiblePool(letters, 'pilot').length} huruf permulaan</option><option value="ready">Semua huruf sedia ({eligiblePool(letters, 'ready').length})</option><option value="additional">Huruf tambahan ({eligiblePool(letters, 'additional').length})</option></select>
        <details className="match-adult-settings"><summary>Pilihan guru & penjaga</summary><div className="match-profile-grid"><label>Bilangan pusingan<select aria-label="Bilangan pusingan" value={roundCount} onChange={e => setRoundCount(Number(e.target.value))}>{[3, 5, 10].map(n => <option key={n} value={n} disabled={n > available.length}>{n} pusingan</option>)}</select></label><label>Masa setiap pusingan<select aria-label="Masa setiap pusingan" value={limitMs} onChange={e => setLimitMs(Number(e.target.value))}>{[60, 90, 120].map(n => <option key={n} value={n * 1000}>{n} saat</option>)}</select></label></div></details>
        <p className="small-muted">{available.length} huruf layak. Laluan dan titik mesti disiapkan. 100 markah siap + sehingga 100 markah masa. Markah permainan bukan penilaian penguasaan KPM.</p>
      </section>
      <div className="match-buttons"><button className="button button-primary" disabled={!valid} onClick={() => mode === 'duo' ? setChecking(true) : start(false)}>{mode === 'duo' ? 'Uji dua sentuhan' : 'Buka cabaran Solo'}</button><button className="button button-outline" onClick={fullscreen}>Paparan penuh</button></div>
      <p className="small-muted">{roundCount} pusingan · {limitMs / 1000} saat · {mode === 'duo' ? 'Skrin dibahagi sama besar. Kedua-dua pemain kekal tegak.' : 'Siap semua pusingan untuk memperoleh trofi.'}</p>
      {notice && <p role="status">{notice}</p>}
    </>}
  </main>;
}
