import { useCallback, useState } from 'react';
import { DuoInputCheck } from '../components/DuoInputCheck.jsx';
import { FitDialog } from '../components/FitDialog.jsx';
import { eligiblePool, PLAYER_PROFILES } from '../game/matchConfig.js';
import { ProfilePortrait } from '../components/GameMascot.jsx';
export function MatchSetupScreen({ mode, profile, letters, onStart, onBack, onSolo }) {
  const [profiles, setProfiles] = useState([profile, PLAYER_PROFILES[(PLAYER_PROFILES.indexOf(profile) + 1) % 3]]);
  const [pool, setPool] = useState('pilot'), [roundCount, setRoundCount] = useState(5), [limitMs, setLimitMs] = useState(90000);
  const [checking, setChecking] = useState(false), [step, setStep] = useState(0), [help, setHelp] = useState(false);
  const available = eligiblePool(letters, pool), valid = available.length >= roundCount && (mode === 'solo' || profiles[0] !== profiles[1]);
  const closeHelp = useCallback(() => setHelp(false), []);
  const start = unscored => onStart({ mode, profiles: profiles.slice(0, mode === 'solo' ? 1 : 2), pool, roundCount, limitMs, unscored, inputCheck: mode === 'duo' && !unscored ? 'simultaneousTouchVerified' : 'notRequired' });
  return <main className="match-setup page-enter">
    <button className="text-button back-button" aria-label="Kembali" onClick={() => checking ? setChecking(false) : onBack()}>← Kembali</button>
    <span className="eyebrow">JEJAK CERIA · DENGAN BANTUAN</span><h1>{mode === 'duo' ? 'Dua teman, satu cabaran!' : 'Jom kumpul trofi!'}</h1>
    <p>{mode === 'duo' ? 'Jejak bersama. Siap lebih cepat, dapat lebih markah.' : 'Siap setiap huruf, kumpul markah dan trofi!'}</p>
    {checking ? <DuoInputCheck onVerified={() => start(false)} onPreview={() => start(true)} onSolo={onSolo}/> : <>
      <div className="setup-step"><section className="match-settings">
        {step === 0 ? <><h2>Pilih teman bermain</h2><div className="match-profile-grid">{profiles.slice(0, mode === 'duo' ? 2 : 1).map((value, slot) => <label key={slot} className={`player-choice player-${slot}`}><span className="player-choice-label"><ProfilePortrait profile={value}/>Pemain {slot + 1}</span><select aria-label={`Profil pemain ${slot + 1}`} value={value} onChange={e => setProfiles(old => old.map((p,i) => i === slot ? e.target.value : p))}>{PLAYER_PROFILES.map(p => <option key={p}>{p}</option>)}</select></label>)}</div>{mode === 'duo' && profiles[0] === profiles[1] && <p role="status">Pilih dua profil yang berbeza.</p>}</> : <>
          <h2>Pilih cabaran</h2><label className="field-label" htmlFor="match-pool">Kumpulan huruf</label><select id="match-pool" value={pool} onChange={e => { setPool(e.target.value); if (roundCount > eligiblePool(letters,e.target.value).length) setRoundCount(3); }}><option value="pilot">{eligiblePool(letters,'pilot').length} huruf permulaan</option><option value="ready">Semua huruf sedia ({eligiblePool(letters,'ready').length})</option><option value="additional">Huruf tambahan ({eligiblePool(letters,'additional').length})</option></select>
          <div className="match-profile-grid"><label>Bilangan pusingan<select aria-label="Bilangan pusingan" value={roundCount} onChange={e => setRoundCount(Number(e.target.value))}>{[3,5,10].map(n => <option key={n} value={n} disabled={n > available.length}>{n} pusingan</option>)}</select></label><label>Masa setiap pusingan<select aria-label="Masa setiap pusingan" value={limitMs} onChange={e => setLimitMs(Number(e.target.value))}>{[60,90,120].map(n => <option key={n} value={n*1000}>{n} saat</option>)}</select></label></div>
          <p className="small-muted">{available.length} huruf layak · {roundCount} pusingan · {limitMs / 1000} saat setiap pusingan</p>
        </>}
      </section></div>
      <div className="setup-navigation"><button className="button button-outline" disabled={step === 0} onClick={() => setStep(0)}>Sebelumnya</button><span>Langkah {step + 1} / 2</span>{step === 0 ? <button className="button button-primary" disabled={mode === 'duo' && profiles[0] === profiles[1]} onClick={() => setStep(1)}>Seterusnya</button> : <button className="button button-primary" disabled={!valid} onClick={() => mode === 'duo' ? setChecking(true) : start(false)}>{mode === 'duo' ? 'Uji dua sentuhan' : 'Buka cabaran Solo'}</button>}</div>
      <button className="text-button" onClick={() => setHelp(true)}>Cara markah & trofi</button>
    </>}
    {help && <FitDialog title="Cara markah & trofi" onClose={closeHelp}><div className="letter-help"><p>Siapkan laluan dan semua titik: 100 markah siap + sehingga 100 markah masa.</p><p>Markah dan trofi ialah ganjaran permainan, bukan penilaian penguasaan KPM.</p><p>{mode === 'duo' ? 'Dua pemain mendapat ruang sama besar dan kekal tegak. Dua sentuhan serentak diperlukan.' : 'Siap semua pusingan untuk memperoleh trofi.'}</p></div></FitDialog>}
  </main>;
}
