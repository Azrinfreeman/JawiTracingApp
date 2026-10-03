export function Pager({ page, count, onPage, label = 'Halaman', children }) {
  const total = Math.max(1, count), current = Math.min(page, total - 1);
  return <nav className="screen-pager" aria-label={label}>
    <button className="button button-outline" aria-label={`${label} sebelumnya`} disabled={current === 0} onClick={() => onPage(current - 1)}>← Sebelumnya</button>
    <span aria-live="polite">{children || `${current + 1} / ${total}`}</span>
    <button className="button button-soft" aria-label={`${label} seterusnya`} disabled={current + 1 === total} onClick={() => onPage(current + 1)}>Seterusnya →</button>
  </nav>;
}
