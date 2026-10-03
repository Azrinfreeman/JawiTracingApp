import { useRef, useState } from 'react';
import { useViewportLayout } from './useViewportLayout.js';
import { Pager } from './Pager.jsx';
import { gridCapacity } from '../game/screenLayout.js';

export function PagedRecords({ items, render, empty, tall = false, label = 'Halaman rekod' }) {
  const host = useRef(null), size = useViewportLayout(host), [anchor, setAnchor] = useState(0);
  const grid = gridCapacity(size.width, size.height, size.width < 600 ? 250 : 310, tall ? 240 : 146);
  const count = Math.max(1, Math.ceil(items.length / grid.capacity));
  const page = Math.min(count - 1, Math.floor(anchor / grid.capacity));
  return <div className="record-list"><div ref={host} className="record-grid-host">
    {items.length ? <div className="record-grid" style={{ '--grid-columns': grid.columns, '--grid-rows': grid.rows }}>{items.slice(page * grid.capacity, (page + 1) * grid.capacity).map(render)}</div> : <p className="empty-state">{empty}</p>}
  </div><Pager page={page} count={count} label={label} onPage={next => setAnchor(next * grid.capacity)}/></div>;
}

// Record details are paged too; exports still contain the complete original objects.
export function recordFields(value, prefix = '') {
  return Object.entries(value).flatMap(([key, item]) => {
    const label = prefix ? `${prefix} · ${key}` : key;
    if (item && typeof item === 'object') return recordFields(item, label);
    return [[label, Array.isArray(item) ? item.map(entry => typeof entry === 'object' ? JSON.stringify(entry) : entry).join(' / ') : String(item ?? '—')]];
  });
}
export function DetailPages({ fields }) {
  const host = useRef(null), size = useViewportLayout(host), [anchor, setAnchor] = useState(0);
  const columns = size.width < 450 ? 1 : 2;
  const cellWidth = Math.max(100, size.width / columns - 36);
  const rowHeight = Math.max(130, ...fields.map(([label,value]) => Math.ceil(value.length * 8 / cellWidth) * 22 + Math.ceil(label.length * 7 / cellWidth) * 18 + 32));
  const capacity = Math.max(1, Math.floor((size.height - 64) / rowHeight)) * columns;
  const count = Math.max(1, Math.ceil(fields.length / capacity)), page = Math.min(count - 1, Math.floor(anchor / capacity));
  return <div ref={host} className="detail-pages"><dl className="detail-fields" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{fields.slice(page * capacity, (page + 1) * capacity).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Pager page={page} count={count} label="Halaman butiran" onPage={next => setAnchor(next * capacity)}/></div>;
}
