import { useEffect, useRef, useState } from 'react';

export function useViewportLayout(element, onResize) {
  const callback = useRef(onResize); callback.current = onResize;
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    let frame, previous;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = element?.current?.getBoundingClientRect();
        const next = { width: Math.round(bounds?.width ?? window.visualViewport?.width ?? window.innerWidth),
          height: Math.round(bounds?.height ?? window.visualViewport?.height ?? window.innerHeight) };
        if (previous && previous.width === next.width && previous.height === next.height) return;
        if (previous) callback.current?.(next);
        previous = next; setSize(next);
      });
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    observer?.observe(element?.current || document.documentElement);
    window.addEventListener('resize', measure); window.visualViewport?.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure); window.addEventListener('taman-jawi:viewport', measure);
    document.addEventListener('fullscreenchange', measure); measure();
    return () => { cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('resize', measure);
      window.removeEventListener('orientationchange', measure); window.removeEventListener('taman-jawi:viewport', measure);
      window.visualViewport?.removeEventListener('resize', measure); document.removeEventListener('fullscreenchange', measure); };
  }, [element]);
  return size;
}
