import { useState } from 'react';
import { GardenArt } from './Icons.jsx';
import { GardenFriends } from './GameMascot.jsx';

export function PlaygroundScene() {
  const [unavailable, setUnavailable] = useState(false);
  return <div className="playground-scene" aria-hidden="true">
    <div className="playground-picture">{unavailable ? <GardenArt/> : <img src="/illustrations/taman-kawan-ceria.png" width="1536" height="1024" alt="" decoding="async" onError={() => setUnavailable(true)}/>}</div>
    <span className="scene-sticker sticker-sun">✦</span>
    <div className="scene-caption"><GardenFriends/><span>Taman kecil, kegembiraan besar!</span></div>
  </div>;
}

export function GardenBunting() {
  return <svg className="garden-bunting" viewBox="0 0 440 50" aria-hidden="true" focusable="false"><path d="M0 6Q220 60 440 6" fill="none" stroke="#64765d" strokeWidth="2"/>{['#ffab91','#ffd56a','#a7d879','#a4d8ec','#c5b8e8','#ffab91','#ffd56a'].map((colour, i) => <path key={colour + i} d={`M${25 + i * 60} ${14 + (3 - Math.abs(3 - i)) * 5}l36 4-20 26Z`} fill={colour} stroke="#ffffff" strokeWidth="2"/>)}</svg>;
}
