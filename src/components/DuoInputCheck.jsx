import { useRef, useState } from 'react';
export function DuoInputCheck({ onVerified, onPreview, onSolo }) {
  const contacts = useRef([null, null]);
  const [held, setHeld] = useState([false, false]), [verified, setVerified] = useState(false);
  const release = slot => { contacts.current[slot] = null; setHeld(contacts.current.map(Boolean)); };
  return <section className="duo-check" aria-labelledby="duo-check-title">
    <h2 id="duo-check-title">Cuba sentuh bersama</h2>
    <p>Setiap pemain tekan dan tahan satu bulatan pada masa yang sama. Ujian ini tidak diberi markah.</p>
    <div className="contact-pads">{[0, 1].map(slot => <button key={slot} className={`contact-pad player-${slot} ${held[slot] ? 'held' : ''}`} aria-label={`Uji sentuhan pemain ${slot + 1}`}
      onPointerDown={event => {
        if (event.pointerType !== 'touch' || contacts.current[slot] !== null) return;
        event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
        contacts.current[slot] = event.pointerId; setHeld(contacts.current.map(Boolean));
        if (contacts.current.every(id => id !== null) && contacts.current[0] !== contacts.current[1]) setVerified(true);
      }} onPointerUp={() => release(slot)} onPointerCancel={() => release(slot)} onLostPointerCapture={() => release(slot)}>
      <strong>{held[slot] ? 'Bagus!' : `Pemain ${slot + 1}`}</strong><span>Tekan & tahan</span>
    </button>)}</div>
    <p role="status">{verified ? 'Dua sentuhan serentak berjaya. Sedia bermain!' : 'Menunggu dua jari pada dua bulatan…'}</p>
    {!verified && <p className="small-muted">{navigator.maxTouchPoints >= 2 ? 'Peranti melaporkan sokongan sentuhan berganda. Cuba kedua-dua bulatan.' : 'Sokongan sentuhan berganda belum dikesan. Cuba skrin sentuh atau pilih Solo.'}</p>}
    <div className="match-buttons">{verified && <button className="button button-primary" onClick={onVerified}>Teruskan Duo 1v1</button>}
      {!verified && <button className="button button-outline" onClick={() => { contacts.current = [null, null]; setHeld([false, false]); }}>Cuba ujian semula</button>}
      <button className="button button-soft" onClick={onSolo}>Pilih Solo</button>
    </div>
    {!verified && <button className="text-button" onClick={onPreview}>Pratonton susun atur dewasa · tanpa markah atau trofi</button>}
  </section>;
}
