import { useEffect, useState } from 'react';

/** Display refresh is isolated; the parent still enforces deadlines every 50 ms. */
export function MatchClockDisplay({ clock, limitMs, status, roundIndex }) {
  const remaining = () => Math.ceil(Math.max(0, limitMs - clock.elapsed()) / 1000);
  const [seconds, setSeconds] = useState(remaining);
  useEffect(() => {
    let timer;
    const update = () => {
      const left = Math.max(0, limitMs - clock.elapsed());
      setSeconds(Math.ceil(left / 1000));
      if (status === 'racing' && left > 0) timer = setTimeout(update, (left % 1000 || 1000) + 1);
    };
    update();
    return () => clearTimeout(timer);
  }, [clock, limitMs, status, roundIndex]);
  return <div className="race-clock" aria-label="Baki masa">{seconds}<small>saat</small></div>;
}
