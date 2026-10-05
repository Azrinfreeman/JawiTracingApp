export function Pager({ page, count, onPage, label = 'Halaman', rtl = false, children }) {
  const total = Math.max(1, count), current = Math.min(page, total - 1);
  return <nav className="screen-pager" aria-label={label} dir={rtl ? 'rtl' : undefined}>
    <button className="button button-outline" aria-label={`${label} sebelumnya`} disabled={current === 0} onClick={() => onPage(current - 1)}>{rtl ? 'Sebelumnya →' : '← Sebelumnya'}</button>
    <span aria-live="polite" dir={rtl ? 'ltr' : undefined}>{children || `${current + 1} / ${total}`}</span>
    <button className="button button-soft" aria-label={`${label} seterusnya`} disabled={current + 1 === total} onClick={() => onPage(current + 1)}>{rtl ? '← Seterusnya' : 'Seterusnya →'}</button>
  </nav>;
}
