import { useEffect, useRef } from 'react';
import { guardContactClick } from '../tracing/contactClick.js';

/** One real press/release per target; native duplicate clicks and held keys cannot add dots. */
export function DotTapPad({ target, index, total, disabled, onStart, onMove, onEnd, onCancel }) {
  const button = useRef(null), active = useRef(null), ignoreClickUntil = useRef(0);
  const callbacks = useRef({ onStart, onMove, onEnd, onCancel });
  callbacks.current = { onStart, onMove, onEnd, onCancel };
  useEffect(() => {
    const cancel = () => { if (active.current) { active.current = null; callbacks.current.onCancel(); } };
    window.addEventListener('resize', cancel);
    return () => { window.removeEventListener('resize', cancel); cancel(); };
  }, []);
  useEffect(() => {
    if (disabled && active.current) {
      const contact = active.current; active.current = null; callbacks.current.onCancel();
      if (contact.pointer !== undefined && button.current?.hasPointerCapture(contact.pointer)) button.current.releasePointerCapture(contact.pointer);
    }
  }, [disabled]);
  const position = e => ({ x: e.clientX, y: e.clientY, time: e.timeStamp });
  const begin = (p, type, source, contact) => {
    if (disabled || active.current || !target) return false;
    const box = button.current.getBoundingClientRect();
    if (!callbacks.current.onStart(target.id, p, { x: box.x, y: box.y, width: box.width, height: box.height }, type, source)) return false;
    active.current = contact; return true;
  };
  const centre = () => { const box = button.current.getBoundingClientRect(); return { x: box.x + box.width/2, y: box.y + box.height/2 }; };
  const cancel = () => { if (active.current) { active.current = null; callbacks.current.onCancel(); } };
  const finish = p => { active.current = null; ignoreClickUntil.current = performance.now() + 100; callbacks.current.onEnd(p); };
  return <div className="dot-pad-row">
    <span className="dot-pad-caption">Sentuh titik ini.<small>Titik {index} daripada {total}</small></span>
    <button ref={button} type="button" className="dot-tap-pad" disabled={disabled} aria-label={`Tambah titik ${index} daripada ${total}`}
      onPointerDown={e => {
        if (e.button > 0) return; e.preventDefault();
        if (begin(position(e), e.pointerType || 'mouse', 'equivalentPad', { pointer: e.pointerId })) e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={e => { if (active.current?.pointer === e.pointerId) callbacks.current.onMove(position(e)); }}
      onPointerUp={e => {
        if (active.current?.pointer !== e.pointerId) return; e.preventDefault(); guardContactClick(e.nativeEvent); finish(position(e));
        if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
      }} onPointerCancel={cancel} onLostPointerCapture={cancel} onBlur={() => { if (active.current?.key) cancel(); }}
      onKeyDown={e => {
        if (![' ', 'Enter'].includes(e.key)) return; e.preventDefault();
        if (!e.repeat) begin(centre(), 'keyboard', 'equivalentPadKeyboard', { key: e.key });
      }} onKeyUp={e => {
        if (active.current?.key !== e.key) return; e.preventDefault(); finish(centre());
      }} onClick={e => {
        e.preventDefault();
        // Screen-reader activation can arrive as a virtual click without a pointer/key pair.
        if (e.detail === 0 && performance.now() > ignoreClickUntil.current && begin(centre(), 'keyboard', 'equivalentPadVirtual', { virtual: true })) finish(centre());
      }}><span className="dot-pad-symbol" aria-hidden="true">●</span><span>Tambah titik</span></button>
  </div>;
}
