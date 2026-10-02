import { Icon } from './Icons.jsx';
export function LetterCard({ letter, enabled, visited, completed = false, draft, onClick, index }) {
  return <button className={`letter-card tone-${index % 4} ${!enabled ? 'unavailable' : ''}`} disabled={!enabled} onClick={onClick} aria-label={`${letter.labelMs}${!enabled ? ', akan datang' : visited ? ', pernah dijejak' : ''}`}>
    <span className="card-top"><span className="station-number">{String(index + 1).padStart(2, '0')}</span>{completed ? <span className="visited-mark completed-mark"><Icon name="flower" size={18}/><Icon name="check" size={12}/></span> : visited ? <Icon name="pen" size={17}/> : !enabled ? <Icon name="lock" size={15}/> : <span className="card-spark">✦</span>}</span>
    <span className="jawi card-glyph" lang="ms-Arab" dir="rtl">{letter.glyph}</span>
    <span className="card-name">{letter.labelMs}</span>
    <span className="card-caption">{!enabled ? 'Akan datang' : draft ? 'Draf · perlu semakan' : completed ? 'Siap dijejak' : visited ? 'Pernah dicuba' : 'Buka halaman'}</span>
  </button>;
}
