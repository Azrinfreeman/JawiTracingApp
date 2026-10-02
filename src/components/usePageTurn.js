import { useCallback, useEffect, useRef, useState } from 'react';

// Exactly one destination commits, including reduced motion and interrupted effects.
export function usePageTurn() {
  const [turn, setTurn] = useState(null), job = useRef(null), timer = useRef(null);
  const finish = useCallback(() => {
    const pending = job.current; if (!pending) return;
    job.current = null; clearTimeout(timer.current); setTurn(null); pending();
  }, []);
  const start = useCallback((commit, direction = 'next') => {
    if (job.current) return false;
    job.current = commit;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else { setTurn(direction); timer.current = setTimeout(finish, 420); }
    return true;
  }, [finish]);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const hidden = () => { if (document.hidden) finish(); };
    window.addEventListener('resize', finish); window.addEventListener('taman-jawi:pause', finish); document.addEventListener('visibilitychange', hidden); motion.addEventListener('change', finish);
    return () => { clearTimeout(timer.current); job.current = null; window.removeEventListener('resize', finish); window.removeEventListener('taman-jawi:pause', finish); document.removeEventListener('visibilitychange', hidden); motion.removeEventListener('change', finish); };
  }, [finish]);
  return { turn, start, finish, pending: () => Boolean(job.current) };
}
