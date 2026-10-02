// Decorative companions stay separate from teaching glyphs and pointer input.
export function GameMascot({ kind = 'leaf', pose = 'rest', className = '' }) {
  return <svg viewBox="0 0 120 120" className={`game-mascot mascot-${kind} mascot-${pose} ${className}`} aria-hidden="true" focusable="false">
    <ellipse cx="60" cy="110" rx="30" ry="5" fill="#263d32" opacity=".1"/>
    <g className="mascot-character">
      <path d="M43 94l-3 12m34-12 4 12" fill="none" stroke="#346f45" strokeWidth="5" strokeLinecap="round"/>
      <path d="M31 72q-13 4-16-5" fill="none" stroke="#346f45" strokeWidth="5" strokeLinecap="round"/>
      <g className="mascot-hand"><path d="M87 72q17-5 15-22" fill="none" stroke="#346f45" strokeWidth="5" strokeLinecap="round"/><circle cx="103" cy="48" r="6" fill="#a7d879" stroke="#346f45" strokeWidth="2"/></g>
      {kind === 'flower' ? <><path d="M60 23C39 2 26 23 31 39C7 35 5 62 24 70C8 88 30 106 45 96C53 117 77 109 78 94C99 109 114 84 95 72C117 57 106 34 88 38C91 16 70 8 60 23Z" fill="#ff9d88" stroke="#ac4938" strokeWidth="3"/><circle cx="60" cy="63" r="29" fill="#ffe094" stroke="#d69439" strokeWidth="2"/></>
        : kind === 'star' ? <path d="M60 12Q65 12 76 37L104 42Q112 44 105 52L86 73L90 100Q91 111 80 106L60 94L38 107Q29 111 30 99L34 74L14 53Q7 44 18 42L44 37L55 16Q57 12 60 12Z" fill="#ffdc71" stroke="#b17c26" strokeWidth="3" strokeLinejoin="round"/>
        : <><path d="M27 88Q8 16 88 17Q106 88 60 100Q39 105 27 88Z" fill="#a7d879" stroke="#346f45" strokeWidth="3"/><path d="M43 93Q54 84 62 76M70 34L74 29" fill="none" stroke="#6ca557" strokeWidth="3" strokeLinecap="round"/></>}
      <g className="mascot-eyes"><ellipse cx="46" cy="57" rx="4" ry="5" fill="#263d32"/><ellipse cx="73" cy="57" rx="4" ry="5" fill="#263d32"/><circle cx="47" cy="55" r="1.2" fill="white"/><circle cx="74" cy="55" r="1.2" fill="white"/></g>
      <ellipse cx="36" cy="69" rx="8" ry="4" fill="#ee836d" opacity=".75"/><ellipse cx="84" cy="69" rx="8" ry="4" fill="#ee836d" opacity=".75"/>
      {pose === 'pause' ? <path d="M54 76h12" stroke="#263d32" strokeWidth="3" strokeLinecap="round"/> : <path d="M51 72Q60 85 69 72" fill={pose === 'celebrate' ? '#ac4938' : 'none'} stroke="#263d32" strokeWidth="3" strokeLinecap="round"/>}
    </g>
  </svg>;
}

export function ProfilePortrait({ profile, className = '' }) {
  return <GameMascot kind={profile === 'Bunga' ? 'flower' : profile === 'Bintang' ? 'star' : 'leaf'} className={`profile-portrait ${className}`}/>;
}

export function GardenFriends({ celebrate = false, className = '' }) {
  return <div className={`garden-friends ${celebrate ? 'friends-celebrate' : ''} ${className}`} aria-hidden="true">
    <GameMascot kind="flower" pose={celebrate ? 'celebrate' : 'rest'}/><GameMascot pose={celebrate ? 'celebrate' : 'greet'}/><GameMascot kind="star" pose={celebrate ? 'celebrate' : 'rest'}/>
  </div>;
}
