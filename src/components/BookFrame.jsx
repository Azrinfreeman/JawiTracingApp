export function BookFold({ direction, onFinish }) {
  return direction ? <div className={`book-fold book-fold-${direction}`} aria-hidden="true" onAnimationEnd={onFinish}><span>✿</span></div> : null;
}
export function BookFrame({ children, turn, onTurnEnd, className = '' }) {
  return <div className={`book-cover ${turn ? 'book-turning' : ''} ${className}`} aria-busy={Boolean(turn)}>
    <div className="book-page-stack" aria-hidden="true"/>
    <div className="book-inner">{children}</div>
    <BookFold direction={turn} onFinish={onTurnEnd}/>
  </div>;
}
export function BookNavigation({ index, total, disabled, end, onNext, onPrevious, onContents }) {
  return <nav className="book-navigation" aria-label="Selak buku" onKeyDown={event => {
    if (disabled || event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.key === 'PageDown' && !end) { event.preventDefault(); onNext(); }
    if (event.key === 'PageUp' && (index > 0 || end)) { event.preventDefault(); onPrevious(); }
  }}>
    <button className="button button-primary book-next" aria-label="Huruf seterusnya" disabled={disabled || end} onClick={onNext}><span aria-hidden="true">←</span><span>Seterusnya<small>Selak halaman</small></span></button>
    <button className="text-button book-contents" aria-label="Isi kandungan" disabled={disabled} onClick={onContents}><span className="tool-label-wide">Isi kandungan</span><span className="tool-label-narrow">Huruf</span></button>
    <button className="button button-outline book-previous" aria-label="Huruf sebelumnya" disabled={disabled || (!end && index === 0)} onClick={onPrevious}><span>Sebelumnya</span><span aria-hidden="true">→</span></button>
    <span className="book-page-count">{end ? 'Akhir buku' : `Halaman ${index + 1} / ${total}`}</span>
  </nav>;
}
