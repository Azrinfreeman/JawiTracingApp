import { forwardRef, memo } from 'react';
import { TraceBoard } from './TraceBoard.jsx';
import { getProfile } from '../tracing/profiles.js';
import { ProfilePortrait } from './GameMascot.jsx';
import { BookFold } from './BookFrame.jsx';
import { Icon } from './Icons.jsx';
const raceProfile = getProfile('play', 'touch', 'standard');
export const RaceTracePane = memo(forwardRef(function RaceTracePane({ turn, onTurnEnd, slot, profile, letter, state, total, outcome, ready, retry, demo, enabled, onReady, onRetry, onDemo, onDemoEnd, onValidated }, ref) {
  return <section className={`race-pane race-book player-${slot} ${turn ? 'book-turning' : ''}`} data-player-slot={slot} aria-label={`Pemain ${slot + 1}, ${profile}`} aria-busy={Boolean(turn)}>
    <div className="race-player-heading"><h2><ProfilePortrait profile={profile}/>{profile}<small>Pemain {slot + 1}</small></h2><strong className="race-total">{total}<small>markah</small></strong></div>
    <div className="race-paper">
      <TraceBoard ref={ref} letter={letter} mode="play" activity="trace" attempt={retry} demo={demo} adjustment="standard" compact enabled={enabled} profileOverride={raceProfile} onValidated={onValidated} onDemoEnd={onDemoEnd}/>
      <div className="race-actions">
        {state === 'ready' ? <><button className="button button-primary" disabled={ready} onClick={onReady}>{ready ? 'Sedia ✓' : 'Saya sedia!'}</button><button className="button button-soft" disabled={ready || demo} onClick={onDemo}>Lihat contoh</button></>
          : state === 'racing' && !outcome ? <button className="button button-outline" onClick={onRetry}>Cuba lagi</button>
          : <p className="race-lane-status" role="status">{outcome?.outcome === 'playComplete' && <Icon name="flower" size={22}/>} {outcome?.outcome === 'playComplete' ? 'Siap! Tunggu teman.' : outcome ? 'Masa tamat. Kita cuba lagi!' : 'Tunggu isyarat mula.'}</p>}
      </div>
    </div>
    <BookFold direction={turn} onFinish={onTurnEnd}/>
  </section>;
}));
