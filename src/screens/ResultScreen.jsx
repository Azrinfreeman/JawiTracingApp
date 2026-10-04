import { Icon } from '../components/Icons.jsx';
import { AudioControls } from '../components/AudioControls.jsx';
import { PlayFeedback } from '../components/PlayFeedback.jsx';
import { LetterModelGlyph } from '../components/LetterModelGlyph.jsx';
export function ResultScreen({ letter, result, audio, preview, onNext, onAgain, onCopy, onGarden, embedded = false, compact = false, actionsOnly = false, summaryOnly = false, choicesDisabled = false }) {
  const copied = result.outcome === 'copySaved';
  const playful = result.outcome === 'playComplete';
  if (embedded) return <section className={`${actionsOnly ? 'book-completion-actions' : 'book-completion'} ${compact ? 'compact-completion' : ''}`}>
    {!actionsOnly && <><span className="book-sticker earned"><Icon name={copied ? 'pen' : 'flower'} size={24}/>{copied ? 'Tulisan disimpan' : 'Siap dijejak!'}</span>
    <h2>{playful ? `Kamu sudah ikut huruf ${letter.labelMs}!` : copied ? 'Terima kasih kerana mencuba!' : 'Bagus, kamu sudah cuba!'}</h2>
    <p>{copied ? 'Guru boleh melihat tulisan kamu.' : 'Hebat! Selak apabila kamu sedia.'}</p></>}
    {!summaryOnly && <><button className="button button-outline" disabled={choicesDisabled} onClick={onAgain}><Icon name="retry" size={18}/>{playful ? 'Main lagi' : 'Ulang huruf'}</button>
    {!copied && <button className="text-button copy-action" aria-label="Sekarang, cuba salin sendiri" disabled={choicesDisabled} onClick={onCopy}><Icon name="pen" size={16}/>{compact ? 'Salin sendiri' : 'Sekarang, cuba salin sendiri'}</button>}</>}
  </section>;
  return <main className={`result-page page-enter ${playful ? 'play-result' : ''}`}><div className="result-card">
    <div className="result-sparkles" aria-hidden="true">✦<span>✿</span>✧</div>
    <div className="result-visual">{playful && <PlayFeedback complete/>}<div className="result-glyph jawi" dir="rtl" lang="ms-Arab">{playful ? <svg viewBox="0 0 1000 1000" className="play-completed-letter" role="img" aria-label={`Huruf ${letter.labelMs} berwarna dengan bantuan`}>{letter.geometry.strokes.map(s => <path key={s.id} d={s.path} strokeWidth="60"/>)}{letter.geometry.dotTargets.map(d => <circle key={d.id} cx={d.x} cy={d.y} r={d.visibleRadius}/>)}</svg> : <LetterModelGlyph letter={letter}/>}<span className="result-check"><Icon name={copied ? 'pen' : 'check'} size={24}/></span></div></div>
    <span className="eyebrow">{playful ? 'DENGAN BANTUAN' : copied ? 'HASIL TULISAN DISIMPAN' : result.outcome === 'precisionComplete' ? 'SIAP DENGAN PANDUAN RINGAN' : 'SIAP DENGAN PANDUAN'}</span>
    <h1>{playful ? `Kamu sudah ikut huruf ${letter.labelMs}!` : copied ? 'Terima kasih kerana mencuba!' : 'Bagus, kamu sudah cuba!'}</h1>
    <p>{playful ? `Semua bahagian huruf ${letter.labelMs}${letter.geometry.dotTargets.length ? ' dan titiknya' : ''} sudah kamu ikut bersama panduan.` : copied ? 'Guru boleh melihat tulisan kamu di ruang guru.' : `Semua bahagian huruf ${letter.labelMs} sudah dijejak${letter.geometry.dotTargets.length ? ', dan titik yang diperlukan sudah disentuh' : ''}.`}</p>
    <div className="result-actions"><button className="button button-primary" onClick={onNext}>Huruf seterusnya<Icon name="arrow"/></button><button className="button button-outline" onClick={onAgain}><Icon name="retry"/>{playful ? 'Main lagi' : 'Ulang huruf'}</button></div>
    <AudioControls letter={letter} audio={audio} preview={preview}/>
    {!copied && <button className="text-button copy-action" onClick={onCopy}><Icon name="pen" size={18}/>Sekarang, cuba salin sendiri</button>}
    <button className="text-button result-garden" onClick={onGarden}>Kembali ke taman huruf</button>
  </div><p className="result-note">Setiap cubaan membantu kita belajar sedikit lagi.</p></main>;
}
