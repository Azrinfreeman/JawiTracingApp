import { useEffect, useRef } from 'react';
import { CompanyBrand } from '../components/CompanyBrand.jsx';
import { Icon } from '../components/Icons.jsx';
import { GardenFriends } from '../components/GameMascot.jsx';

export function SplashScreen({ onContinue }) {
  const continueRef = useRef(null);

  useEffect(() => {
    continueRef.current?.focus({ preventScroll: true });
    // The branding deadline never depends on the logo or other assets loading.
    const timeout = window.setTimeout(onContinue, 1800);
    return () => window.clearTimeout(timeout);
  }, [onContinue]);

  return <main className="splash-screen">
    <div className="splash-content">
      <GardenFriends className="splash-friends"/>
      <div className="splash-logo-panel"><CompanyBrand variant="splash" /></div>
      <h1>Taman <em>Jawi</em></h1>
      <p>Mari kenal dan jejak huruf Jawi.</p>
      <button ref={continueRef} className="button button-primary splash-continue"
        onClick={onContinue}>Teruskan<Icon name="arrow" /></button>
    </div>
  </main>;
}
