import { forwardRef, memo } from 'react';
import { TraceBoard } from './TraceBoard.jsx';
import { StageSupport } from './TracingMenu.jsx';
import { getProfile } from '../tracing/profiles.js';
import { ProfilePortrait } from './GameMascot.jsx';
import { BookFold } from './BookFrame.jsx';
import { Icon } from './Icons.jsx';
const raceProfile = getProfile('play', 'touch', 'standard');
export const RaceTracePane = memo(forwardRef(function RaceTracePane({ turn, onTurnEnd, slot, profile, letter, state, total, outcome, ready, retry, demo, enabled, assistance, onReady, onDemo, onDemoEnd, onValidated }, ref) {
  const lane = outcome?.outcome === 'playComplete' ? 'Siap! Tunggu teman.' : outcome ? 'Masa tamat. Kita cuba lagi!' : state === 'countdown' ? 'Tunggu isyarat mula.' : '';
  return <section className={`race-pane race-book player-${slot} ${turn ? 'book-turning' : ''}`} data-player-slot={slot} aria-label={`Pemain ${slot + 1}, ${profile}`} aria-busy={Boolean(turn)}>
    <div className="race-paper">
      <TraceBoard ref={ref} letter={letter} mode="play" activity="trace" attempt={retry} demo={demo} adjustment="standard" compact fitted stageOnly dotAssistance={assistance} enabled={enabled} profileOverride={raceProfile} onValidated={onValidated} onDemoEnd={onDemoEnd}
        renderSupport={support => <StageSupport {...support} assistance={assistance}/>}/>
      <div className="race-badge race-player-heading"><h2><ProfilePortrait profile={profile}/>{profile}<small>Pemain {slot + 1}</small></h2><strong className="race-total">{total}<small>markah</small></strong></div>
      {lane && <p className="race-lane-status" role="status">{outcome?.outcome === 'playComplete' && <Icon name="flower" size={22}/>} {lane}</p>}
      {state === 'ready' && !demo && <div className="ready-overlay">
        <p role="status">{ready ? 'Menunggu teman bersedia…' : 'Lihat contoh jika perlu. Kemudian tekan Saya sedia!'}</p>
        <div className="ready-actions"><button className="button button-primary" disabled={ready} onClick={onReady}>{ready ? 'Sedia ✓' : 'Saya sedia!'}</button><button className="button button-soft" disabled={ready} onClick={onDemo}>Lihat contoh</button></div>
      </div>}
    </div>
    <BookFold direction={turn} onFinish={onTurnEnd}/>
  </section>;
}));
