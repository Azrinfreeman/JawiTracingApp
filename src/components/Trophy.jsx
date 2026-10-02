export function Trophy({ tier = 'gold', shared = false }) {
  return <svg className={`match-trophy ${tier}`} viewBox="0 0 180 180" role="img" aria-label={`Trofi ${shared ? 'bersama' : tier === 'gold' ? 'emas' : tier === 'silver' ? 'perak' : 'gangsa'}`}>
    <circle cx="90" cy="90" r="83" className="trophy-glow"/>
    <path d="M34 157Q90 143 146 157L139 171H41Z" fill="var(--mint-soft)" stroke="#6ca557" strokeWidth="2"/>
    <g fill="#ff9d88" stroke="#ac4938" strokeWidth="1"><path d="M31 146c-12-11-21 3-10 9-11 9 1 20 10 10 8 12 21 1 11-9 12-7 1-20-11-10Z"/><path d="M147 146c-12-11-21 3-10 9-11 9 1 20 10 10 8 12 21 1 11-9 12-7 1-20-11-10Z"/></g>
    <circle cx="31" cy="156" r="5" fill="var(--sun)"/><circle cx="147" cy="156" r="5" fill="var(--sun)"/>
    <path d="M55 39H28V57Q28 86 60 90M125 39H152V57Q152 86 120 90" fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round"/>
    <path d="M51 30H129V64Q129 105 90 112Q51 105 51 64Z" fill="currentColor"/>
    <path d="M81 109H99V140H118V154H62V140H81Z" fill="currentColor"/>
    <path d="M90 46L97 60L113 62L102 73L105 89L90 81L75 89L78 73L67 62L83 60Z" fill="var(--surface)"/>
    <path d="M18 110L23 120L34 122L26 130L28 141L18 136L8 141L10 130L2 122L13 120M152 14L158 26L172 28L162 38L164 52L152 45L140 52L142 38L132 28L146 26" fill="currentColor" opacity=".55"/>
  </svg>;
}
