import { videoReviewCandidates, fourLetterReviewCandidates, faPaReviewCandidates, ainFamilyReviewCandidates, sinSyinTailReviewCandidates, taZaStemReviewCandidates, haDirectionReviewCandidates, nyaTipReviewCandidates, sadDadReviewCandidates, wauVaReviewCandidates, jimFamilyStraightTopReviewCandidates, raZaiShortHeadReviewCandidates, sinSyinReferenceReviewCandidates, taZaStraightPillarReviewCandidates, wauVaSmallerHeadReviewCandidates, mimReferenceReviewCandidates, yaSmallerHeadReviewCandidates } from '../content/reviewCandidates.js';
import { PagedRecords } from './PagedRecords.jsx';
import { LetterModelGlyph } from './LetterModelGlyph.jsx';
import { useState } from 'react';
import { FitDialog } from './FitDialog.jsx';
export function VideoModelReview({letters, onLetter}) {
  const [scope,setScope]=useState('video');
  const candidates = scope==='ya-smaller-head'?yaSmallerHeadReviewCandidates(letters):scope==='mim-reference'?mimReferenceReviewCandidates(letters):scope==='wau-va-smaller-head'?wauVaSmallerHeadReviewCandidates(letters):scope==='ta-za-straight-pillar'?taZaStraightPillarReviewCandidates(letters):scope==='sin-syin-reference'?sinSyinReferenceReviewCandidates(letters):scope==='ra-zai-short-head'?raZaiShortHeadReviewCandidates(letters):scope==='jim-family-straight-top'?jimFamilyStraightTopReviewCandidates(letters):scope==='wau-va-direction'?wauVaReviewCandidates(letters):scope==='sad-dad-outline'?sadDadReviewCandidates(letters):scope==='nya-tip'?nyaTipReviewCandidates(letters):scope==='ha-direction'?haDirectionReviewCandidates(letters):scope==='ta-za-stem'?taZaStemReviewCandidates(letters):scope==='video'?videoReviewCandidates(letters):scope==='direction'?faPaReviewCandidates(letters):scope==='sin-syin-tail'?sinSyinTailReviewCandidates(letters):scope==='ain-outline'?ainFamilyReviewCandidates(letters):fourLetterReviewCandidates(letters);
  const [detail,setDetail] = useState(null);
  return <section className="video-model-review">
    <h2>Semakan video</h2>
    <select className="review-scope" aria-label="Jenis semakan" value={scope} onChange={event=>setScope(event.target.value)}><option value="video">Langkah video</option><option value="ya-smaller-head">Kepala kecil Ya</option><option value="mim-reference">Bentuk rujukan Mim</option><option value="ta-za-straight-pillar">Batang lurus Ta dan Za</option><option value="sin-syin-reference">Bentuk dan ekor Sin dan Syin</option><option value="ra-zai-short-head">Kepala pendek Ra dan Zai</option><option value="jim-family-straight-top">Kepala lurus Jim, Ca, Ha (ح), Kha</option><option value="outline">Bentuk Isi kandungan</option><option value="ain-outline">Bentuk Ain, Ghain dan Nga</option><option value="direction">Arah Fa dan Pa</option><option value="wau-va-smaller-head">Kepala kecil Wau dan Va</option><option value="wau-va-direction">Arah Wau dan Va</option><option value="ha-direction">Arah Ha (ه)</option><option value="sin-syin-tail">Ekor Sin dan Syin</option><option value="ta-za-stem">Batang Ta dan Za</option><option value="nya-tip">Hujung Nya</option><option value="sad-dad-outline">Bentuk Sad dan Dad</option></select>
    <p>Bandingkan asal dan cadangan. Cadangan belum diluluskan untuk murid.</p>
    {scope==='jim-family-straight-top' && <p>Kepala lurus dari kiri ke kanan: 1 Mula → 2 Ikut → 3 Henti. Angkat pen sebelum mangkuk.</p>}
    {scope==='ta-za-straight-pillar' && <p>Bentuk mengikut foto rujukan: gelung rendah dan padat, batang halus dan hujung tirus. Jejak gelung dan ekor dahulu. Angkat pen, kemudian jejak batang lurus dari atas ke bawah: 4 Mula → 5 Ikut → 6. Titik Za dibuat terakhir.</p>}
    <PagedRecords key={scope} items={candidates} pageSize={1} empty="Tiada cadangan yang sepadan dengan versi semasa." render={({original, candidate, note}) => <article className="video-model-comparison" key={original.id}>
      <div className="model-comparison-heading"><h3>{original.labelMs}{['outline','ain-outline','sad-dad-outline'].includes(scope)&&<span className="jawi comparison-catalogue" aria-label={`Isi kandungan: ${original.labelMs}`}><LetterModelGlyph letter={original}/></span>}</h3><button className="text-button" onClick={()=>setDetail({name:original.labelMs,note})}>Langkah cadangan</button></div>
      <div className="model-comparison-pair">{[[original,'Asal'],[candidate,'Cadangan']].map(([letter,label]) => <div key={label}>
        <LetterModelGlyph letter={letter} model modelViewBox={scope==='ya-smaller-head'?'220 300 540 580':scope==='mim-reference'?'320 330 350 540':undefined}/><strong>{label} · versi {letter.contentVersion}</strong>
        <span>{letter.geometry.strokes.length} gerakan · {letter.geometry.dotTargets.length} titik</span>
        <button className="button button-soft" onClick={() => onLetter(letter)}>Semak {original.labelMs} {label.toLowerCase()}</button>
      </div>)}</div>
    </article>}/>
    {detail && <FitDialog title={`Cadangan ${detail.name}`} onClose={()=>setDetail(null)}><div className="letter-help"><p>{detail.note}</p><p>Gunakan Tunjuk cara untuk melihat gerakan, angkatan pen dan laluan yang dilalui semula. Butang Semak tidak memberi kelulusan.</p></div></FitDialog>}
  </section>;
}
