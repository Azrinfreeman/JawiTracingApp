export function Icon({ name, size = 22, ...props }) {
  const paths = {
    leaf: <><path d="M19 4C9 2 3 8 5 15c7 3 14-1 14-11Z"/><path d="m4 21 11-12"/></>,
    sound: <><path d="m4 9 4 0 5-4v14l-5-4H4Z"/><path d="M17 8q6 4 0 8M20 5q9 7 0 14"/></>,
    mute: <><path d="m4 9 4 0 5-4v14l-5-4H4Z"/><path d="m17 9 5 6m0-6-5 6"/></>,
    arrow: <><path d="M4 12h15m-6-6 6 6-6 6"/></>,
    back: <><path d="M20 12H5m6-6-6 6 6 6"/></>,
    play: <path d="m8 5 11 7-11 7Z"/>,
    retry: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/></>,
    pen: <><path d="m5 14 10-10 5 5-10 10-6 1Z"/><path d="m13 6 5 5"/></>,
    check: <path d="m5 12 4 5L20 6"/>,
    star: <path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>,
    teacher: <><path d="M3 4h18v13H3ZM8 22l4-5 4 5M7 9h7m-7 4h10"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></>,
    flower: <><path d="M12 20v-6m0 4q-6-6-7-1m7 0q6-6 7-1"/><path d="M12 4c4-6 9 0 5 3 7 2 2 8-2 5-2 6-8 3-7-1-6 1-7-6-2-7-2-5 4-7 6 0Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.leaf}</svg>;
}

export function GardenArt({ compact = false }) {
  return <svg className="garden-art" viewBox="0 0 620 500" aria-hidden="true">
    <path d="M62 195C64 75 180 20 325 35s252 91 244 238-92 211-254 206S18 389 62 195Z" fill="var(--sky-soft)"/>
    <path d="M80 375Q202 291 314 375T552 382Q509 475 310 476T80 375Z" fill="var(--mint-soft)"/>
    <g fill="var(--surface)"><path d="M93 123q-8-32 24-33 9-33 40-12 31-8 34 23 29 3 23 22Z"/><path d="M393 127q-7-21 17-24 13-29 35-9 25-5 28 21 24 1 25 12Z"/></g>
    <g stroke="var(--sun)" strokeWidth="5" strokeLinecap="round"><path d="M505 29v-9m0 105v9m-49-57h-9m116 0h-9m-84-35-7-7m84 84-7-7m0-70 7-7m-77 77-7 7"/></g>
    <circle cx="505" cy="77" r="31" fill="var(--sun)"/>
    <g fill="var(--guide-follow)"><circle cx="496" cy="73" r="2.8"/><circle cx="514" cy="73" r="2.8"/></g>
    <path d="M496 84q9 8 18 0" fill="none" stroke="var(--guide-follow)" strokeWidth="3" strokeLinecap="round"/>
    <path d="M91 358q13-73 79-21t103-27 130-12" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray="7 12" strokeLinecap="round"/>
    <g transform="translate(126 119) rotate(-10 83 104)">
      <rect y="8" width="166" height="206" rx="26" fill="var(--primary)" opacity=".15"/>
      <rect width="166" height="206" rx="26" fill="var(--surface)" stroke="var(--primary)" strokeWidth="3"/>
      <path d="M26 150h114" stroke="var(--divider)" strokeWidth="2"/>
      <text x="83" y="135" textAnchor="middle" fontFamily="var(--font-jawi)" fontSize="112" fill="var(--ink)">ا</text>
      <text x="83" y="184" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="600" fontSize="20" fill="var(--primary)">Alif</text>
      <circle cx="26" cy="25" r="6" fill="var(--sun)"/>
    </g>
    <g transform="translate(327 169) rotate(9 83 104)">
      <rect y="8" width="166" height="206" rx="26" fill="var(--guide-stop)" opacity=".12"/>
      <rect width="166" height="206" rx="26" fill="var(--surface)" stroke="var(--coral)" strokeWidth="3"/>
      <path d="M26 150h114" stroke="var(--divider)" strokeWidth="2"/>
      <text x="83" y="130" textAnchor="middle" fontFamily="var(--font-jawi)" fontSize="108" fill="var(--ink)">ب</text>
      <text x="83" y="184" textAnchor="middle" fontFamily="var(--font-heading)" fontWeight="600" fontSize="20" fill="var(--guide-stop)">Ba</text>
      <circle cx="26" cy="25" r="6" fill="var(--mint-soft)"/>
    </g>
    <g transform="translate(225 333)">
      <ellipse cx="47" cy="110" rx="57" ry="9" fill="var(--success)" opacity=".1"/>
      <path d="M6 82Q-15 8 107 5Q120 92 51 109Z" fill="var(--mint-soft)" stroke="var(--success)" strokeWidth="3.5"/>
      <path d="M21 103Q47 70 91 20" fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="44" cy="48" r="4" fill="var(--ink)"/><circle cx="72" cy="48" r="4" fill="var(--ink)"/>
      <ellipse cx="33" cy="60" rx="8" ry="4" fill="var(--coral)"/><ellipse cx="83" cy="60" rx="8" ry="4" fill="var(--coral)"/>
      <path d="M47 63q13 17 24 0M4 77q-26 0-25-25m-8 0 9 8 9-8" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <g stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M118 426v-34m0 16q-26-23-31-8 2 17 31 8m0-8q17-25 26-12 2 15-26 12" fill="var(--mint-soft)"/>
      <path d="M481 434v-37m0 20q-29-26-33-6 2 16 33 6" fill="var(--mint-soft)"/>
    </g>
    <g transform="translate(481 384)" fill="var(--coral)"><circle cx="-15" cy="-5" r="13"/><circle cx="0" cy="-17" r="13"/><circle cx="15" cy="-5" r="13"/><circle cx="9" cy="12" r="13"/><circle cx="-9" cy="12" r="13"/><circle r="9" fill="var(--sun-soft)"/></g>
    {!compact && <g fill="var(--sun)"><path d="m63 236 6 14 16 2-12 10 3 16-13-8-14 8 3-16-12-10 16-2Z"/><path d="m557 301 5 11 12 2-9 8 2 12-10-6-11 6 2-12-9-8 12-2Z"/><circle cx="340" cy="78" r="5"/></g>}
  </svg>;
}
