import { Icon } from '../components/Icons.jsx';
import { PlaygroundScene, GardenBunting } from '../components/GameIllustrations.jsx';
import { ProfilePortrait } from '../components/GameMascot.jsx';
import { CompanyBrand } from '../components/CompanyBrand.jsx';
import { useState } from 'react';
export function WelcomeScreen({ onStart, profile, setProfile }) {
  const [mode, setMode] = useState('solo'), [challenge, setChallenge] = useState(false);
  return <main className="welcome page-enter">
    <div className="welcome-copy">
      <span className="eyebrow welcome-tag"><span/>SELAMAT DATANG, KAWAN KECIL!</span>
      <h1>Jom main di<br/><em>taman Jawi!</em></h1>
      <p className="hero-description">Pilih teman, kenal huruf dan jom jejak.<br className="desktop-break"/> Pengembaraan kecil kita bermula di sini!</p>
      <div className="profile-picker"><span>Pilih teman belajar</span><div role="group" aria-label="Profil tempatan">
        {['Bunga','Daun','Bintang'].map(name => <button key={name} className={`profile-chip ${profile === name ? 'selected' : ''}`} aria-pressed={profile === name} onClick={() => setProfile(name)}><span className="profile-symbol" aria-hidden="true"><ProfilePortrait profile={name}/></span><span>{name}</span><span className="profile-check" aria-hidden="true">{profile === name && <Icon name="check" size={16}/>}</span></button>)}
      </div></div>
      <div className="welcome-mode-picker"><span>Cara bermain</span><div role="group" aria-label="Cara bermain"><button className={`profile-chip ${mode === 'solo' ? 'selected' : ''}`} aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}>Solo</button><button className={`profile-chip ${mode === 'duo' ? 'selected' : ''}`} aria-pressed={mode === 'duo'} onClick={() => setMode('duo')}>Duo 1v1</button></div>{mode === 'solo' && <div role="group" aria-label="Pilihan Solo"><button className="text-button" aria-pressed={!challenge} onClick={() => setChallenge(false)}>Latihan santai {!challenge && '✓'}</button><button className="text-button" aria-pressed={challenge} onClick={() => setChallenge(true)}>Cabaran trofi {challenge && '✓'}</button></div>}</div>
      <button className="button button-primary start-button" onClick={() => onStart(mode === 'duo' ? 'duo' : challenge ? 'solo' : 'practice')}>Jom mula<Icon name="arrow"/></button>
      <span className="welcome-note">{mode === 'duo' ? 'Dua pemain, dua halaman. Jejak bersama dan rebut trofi!' : challenge ? 'Main seorang, kumpul markah dan cuba dapatkan trofi!' : 'Latihan santai: buka Buku Jawi Saya, jejak dan selak!'}</span>
      <CompanyBrand variant="welcome" />
    </div>
    <div className="hero-art"><GardenBunting/><PlaygroundScene/></div>
    <div className="learning-strip">
      <div><span className="step-icon peach"><Icon name="leaf"/></span><span><strong>Kenal huruf</strong><small>Rupa dan nama yang baharu</small></span></div>
      <div><span className="step-icon sage"><Icon name="sound"/></span><span><strong>Dengar & sebut</strong><small>Dengar nama, cuba sebut bersama</small></span></div>
      <div><span className="step-icon yellow"><Icon name="pen"/></span><span><strong>Jejak & cuba</strong><small>Dari panduan ke tulisan sendiri</small></span></div>
    </div>
  </main>;
}
