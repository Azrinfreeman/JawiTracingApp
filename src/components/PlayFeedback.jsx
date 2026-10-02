import { useEffect, useState } from 'react';
import { GameMascot } from './GameMascot.jsx';

export function PlayFeedback({ complete = false }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
  }, []);
  return <span className={`play-feedback ${complete ? 'play-feedback--complete' : ''} ${visible ? 'is-celebrating' : ''}`} aria-hidden="true">
    <GameMascot pose={complete ? 'celebrate' : 'encourage'} className="leaf-friend"/>
    <span className="flower-burst">✿</span><span className="flower-burst flower-burst--second">✦</span><span className="flower-burst flower-burst--third">✿</span>
  </span>;
}
