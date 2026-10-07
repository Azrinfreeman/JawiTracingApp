import { videoReviewCandidates, fourLetterReviewCandidates, faPaReviewCandidates, ainFamilyReviewCandidates, sinSyinTailReviewCandidates, taZaStemReviewCandidates, haDirectionReviewCandidates, nyaTipReviewCandidates, sadDadReviewCandidates } from '../content/reviewCandidates.js';
import { PagedRecords } from './PagedRecords.jsx';
import { LetterModelGlyph } from './LetterModelGlyph.jsx';
import { useState } from 'react';
import { FitDialog } from './FitDialog.jsx';
export function VideoModelReview({letters, onLetter}) {
  const [scope,setScope]=useState('video');
  const candidates = scope==='sad-dad-outline'?sadDadReviewCandidates(letters):scope==='nya-tip'?nyaTipReviewCandidates(letters):scope==='ha-direction'?haDirectionReviewCandidates(letters):scope==='ta-za-stem'?taZaStemReviewCandidates(letters):scope==='video'?videoReviewCandidates(letters):scope==='direction'?faPaReviewCandidates(letters):scope==='sin-syin-tail'?sinSyinTailReviewCandidates(letters):scope==='ain-outline'?ainFamilyReviewCandidates(letters):fourLetterReviewCandidates(letters);
  const [detail,setDetail] = useState(null);
  return <section className="video-model-review">
    <h2>Semakan video</h2>
    <select className="review-scope" aria-label="Jenis semakan" value={scope} onChange={event=>setScope(event.target.value)}><option value="video">Langkah video</option><option value="outline">Bentuk Isi kandungan</option><option value="ain-outline">Bentuk Ain, Ghain dan Nga</option><option value="direction">Arah Fa dan Pa</option><option value="ha-direction">Arah Ha (ه)</option><option value="sin-syin-tail">Ekor Sin dan Syin</option><option value="ta-za-stem">Batang Ta dan Za</option><option value="nya-tip">Hujung Nya</option><option value="sad-dad-outline">Bentuk Sad dan Dad</option></select>
    <p>Bandingkan asal dan cadangan. Cadangan belum diluluskan untuk murid.</p>
    <PagedRecords key={scope} items={candidates} pageSize={1} empty="Tiada cadangan yang sepadan dengan versi semasa." render={({original, candidate, note}) => <article className="video-model-comparison" key={original.id}>
      <div className="model-comparison-heading"><h3>{original.labelMs}{['outline','ain-outline','sad-dad-outline'].includes(scope)&&<span className="jawi comparison-catalogue" aria-label={`Isi kandungan: ${original.labelMs}`}><LetterModelGlyph letter={original}/></span>}</h3><button className="text-button" onClick={()=>setDetail({name:original.labelMs,note})}>Langkah cadangan</button></div>
      <div className="model-comparison-pair">{[[original,'Asal'],[candidate,'Cadangan']].map(([letter,label]) => <div key={label}>
        <LetterModelGlyph letter={letter} model/><strong>{label} · versi {letter.contentVersion}</strong>
        <span>{letter.geometry.strokes.length} gerakan · {letter.geometry.dotTargets.length} titik</span>
        <button className="button button-soft" onClick={() => onLetter(letter)}>Semak {original.labelMs} {label.toLowerCase()}</button>
      </div>)}</div>
    </article>}/>
    {detail && <FitDialog title={`Cadangan ${detail.name}`} onClose={()=>setDetail(null)}><div className="letter-help"><p>{detail.note}</p><p>Gunakan Tunjuk cara untuk melihat gerakan, angkatan pen dan laluan yang dilalui semula. Butang Semak tidak memberi kelulusan.</p></div></FitDialog>}
  </section>;
}
