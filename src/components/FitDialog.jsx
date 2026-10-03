import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

export function FitDialog({ title, onClose, children }) {
  const id = useId(), ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement, dialog = ref.current;
    const controls = () => [...dialog.querySelectorAll('button:not(:disabled), select, input, a[href]')];
    controls()[0]?.focus({ preventScroll: true });
    const key = event => {
      if (event.key === 'Escape') { event.stopImmediatePropagation(); onClose(); }
      if (event.key !== 'Tab') return;
      const items = controls();
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
    };
    const back = event => { event.stopImmediatePropagation(); onClose(); };
    document.addEventListener('keydown', key, true); window.addEventListener('taman-jawi:back', back, true);
    return () => { document.removeEventListener('keydown', key, true); window.removeEventListener('taman-jawi:back', back, true); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [onClose]);
  return createPortal(<div className="modal-backdrop fitted-backdrop"><section ref={ref} className="fit-dialog" role="dialog" aria-modal="true" aria-labelledby={id}>
    <header><h2 id={id}>{title}</h2><button className="button button-outline" onClick={onClose}>Tutup</button></header><div className="fit-dialog-content">{children}</div>
  </section></div>, document.body);
}
