import outlines from './fourLetterOutlines.json' with {type:'json'};
import nunOutline from './nunOutline.json' with {type:'json'};
import directions from './faPaDirections.json' with {type:'json'};
import ainOutlines from './ainFamilyOutlines.json' with {type:'json'};
import sinSyinTails from './sinSyinTails.json' with {type:'json'};
import mimTailGap from './mimTailGap.json' with {type:'json'};
import taZaStems from './taZaStems.json' with {type:'json'};
import haDirection from './haDirection.json' with {type:'json'};
import nyaTip from './nyaTip.json' with {type:'json'};
import sadDadOutlines from './sadDadOutlines.json' with {type:'json'};
// Separate adult-only proposals. These entries never join the student catalogue.
export function sadDadReviewCandidates(letters) {
  return Object.entries(sadDadOutlines).flatMap(([id, correction]) => {
    const original=letters.find(letter=>letter.id===id);
    if(!original || original.contentVersion!==correction.baseRevision)return [];
    const candidate=structuredClone(original);candidate.contentVersion++;
    candidate.geometry.status='pendingReview';candidate.geometry.review=null;
    candidate.geometry.appearance=structuredClone(correction.appearance);
    candidate.geometry.strokes.forEach((stroke,index)=>{stroke.path=correction.paths[index];});
    candidate.geometry.displayPaths=[...correction.paths];
    candidate.geometry.dotTargets.forEach((dot,index)=>Object.assign(dot,correction.dots[index]));
    return [{original,candidate,note:'Bentuk tepat mengikut fon Isi kandungan: kepala lebih landai, sambungan kecil dan mangkuk lebih cetek. Jejak gelung kepala, angkat pen, jejak sambungan dan mangkuk, kemudian titik Dad. Rakaman dikekalkan.'}];
  });
}
export function nyaTipReviewCandidates(letters) {
  const original=letters.find(letter=>letter.id==='nya');
  if(!original || original.contentVersion!==nyaTip.baseRevision)return [];
  const candidate=structuredClone(original);
  candidate.contentVersion=nyaTip.revision;
  candidate.geometry.status='pendingReview';candidate.geometry.review=null;
  candidate.geometry.strokes[0].path=nyaTip.path;
  candidate.geometry.displayPaths=[nyaTip.path];
  return [{original,candidate,note:'Hujung kanan atas dipendekkan hingga garisan yang ditanda. Lengkung mangkuk dan tiga titik dikekalkan. Mula pada hujung baharu, ikut mangkuk, kemudian sentuh tiga titik.'}];
}
export function haDirectionReviewCandidates(letters) {
  const original=letters.find(letter=>letter.id==='ha');
  if(!original || original.contentVersion!==haDirection.baseRevision)return [];
  const candidate=structuredClone(original);
  candidate.contentVersion=haDirection.revision;
  candidate.geometry.status='pendingReview';candidate.geometry.review=null;
  candidate.geometry.strokes[0].path=haDirection.path;
  candidate.geometry.displayPaths=candidate.geometry.strokes.map(stroke=>stroke.path);
  return [{original,candidate,note:'Satu gerakan bersambung: turun dari hujung atas, ikut gelung luar kanan ke sambungan bawah, naik mengikut gelung kiri ke sambungan atas, turun melalui garisan dalam, kemudian ikut ekor ke kiri. Mengikut anak panah dalam foto.'}];
}
export function taZaStemReviewCandidates(letters) {
  return Object.entries(taZaStems).flatMap(([id, correction]) => {
    const original=letters.find(letter=>letter.id===id);
    if(!original || original.contentVersion!==correction.baseRevision)return [];
    const candidate=structuredClone(original);
    candidate.contentVersion=correction.revision;
    candidate.geometry.status='pendingReview';candidate.geometry.review=null;
    candidate.geometry.strokes[0].path=correction.headPath;
    candidate.geometry.strokes[1].path=correction.path;
    candidate.geometry.dotTargets.forEach(dot=>{dot.x+=correction.shiftX;});
    candidate.geometry.displayPaths=candidate.geometry.strokes.map(stroke=>stroke.path);
    return [{original,candidate,note:'Lengkung kepala dan gelung tepat seperti asal versi 3, digerakkan ke kiri bersama batang. Hujung ekor nombor 3 kekal di tempat asal; titik Za ikut kedudukan kepala. Tiada sambungan mendatar tambahan. Arah dan urutan dikekalkan.'}];
  });
}
export function sinSyinTailReviewCandidates(letters) {
  return Object.entries(sinSyinTails).flatMap(([id, correction]) => {
    const original=letters.find(letter=>letter.id===id);
    if(!original || original.contentVersion!==correction.baseRevision)return [];
    const candidate=structuredClone(original);
    candidate.contentVersion++;
    candidate.geometry.status='pendingReview';candidate.geometry.review=null;
    candidate.geometry.strokes[0].path=correction.path;
    candidate.geometry.displayPaths=candidate.geometry.strokes.map(stroke=>stroke.path);
    return [{original,candidate,note:'Hujung ekor kiri dinaikkan sedikit. Hujung kekal lebih rendah daripada puncak kedua. Arah, gerakan dan titik asal dikekalkan.'}];
  });
}
export function ainFamilyReviewCandidates(letters) {
  return Object.entries(ainOutlines).flatMap(([id, correction]) => {
    const original=letters.find(letter=>letter.id===id);
    if(!original || original.contentVersion!==correction.baseRevision)return [];
    const candidate=structuredClone(original);
    candidate.contentVersion++;
    candidate.geometry.status='pendingReview';candidate.geometry.review=null;
    const {tailPath,...appearance}=correction;
    candidate.geometry.appearance=structuredClone(appearance);
    candidate.geometry.strokes[1].path=tailPath;
    candidate.geometry.displayPaths=candidate.geometry.strokes.map(stroke=>stroke.path);
    return [{original,candidate,note:'Bentuk tepat mengikut fon Isi kandungan. Sambungan ke mangkuk turun terus tanpa siku tambahan. Kepala, angkat pen, mangkuk dan titik mengikut urutan asal.'}];
  });
}
const proposals = {
  mim: { revision:2, note:'Kepala ditutup dahulu, kemudian sambung ekor. Bandingkan titik mula dan bahagian yang dilalui semula.',
    paths:['M 444.1 608.7 C 447 560 448 530 459.5 499.8 C 472.7 465.4 518.6 419.5 558.5 443.6 C 580.2 456.8 595.4 481.7 609.9 502 C 617.6 512.9 630.2 524.1 634 537.2 C 637 547.4 633.3 556.7 633.3 566.9 C 622.9 582.4 482.9 569.9 444.1 608.7 C 437 611.1 435.5 624.4 435.2 630.7 C 432.4 683.2 451.4 736.5 452.7 789.1 C 453.3 808.9 436.4 823.9 436.4 843'] },
  'ta-marbuta': { revision:3, note:'Gelung tertutup tanpa tonjolan awal. Dua titik dikekalkan. Semak kesesuaian bentuk dan mula.',
    paths:['M 505.1 469 C 499.9 495.3 408.5 544.2 434.4 619.7 C 455.5 681.4 551.5 662.9 579 617.5 C 613.3 560.8 545.5 495.9 505.1 469'] },
  ain: {revision:3, note:'Satu gerakan: kepala, lalu semula hujung kepala ke sambungan, kemudian mangkuk. Semak sama ada laluan ulang ini sesuai.', returnPath:'C 580.2 467.2 534.6 503 482.3 504.5 L 477.8 505.6'},
  ghain: {revision:3, note:'Cadangan gerakan bersambung Ain dengan satu titik. Laluan ulang ditunjukkan, bukan dilangkau.', returnPath:'C 580.2 473 534.6 508.8 482.3 510.3 L 477.8 511.4'},
  nga: {revision:3, note:'Cadangan gerakan bersambung Ain dengan tiga titik. Semak laluan ulang kepala ke sambungan.', returnPath:'C 580.2 443.4 534.6 479.2 482.3 480.7 L 477.8 481.8'},
  hamzah: {revision:3, note:'Satu gerakan: lengkung atas, lalu semula ke sambungan, kemudian ekor pendek. Bandingkan dengan dua gerakan asal.', returnPath:'C 596.5 517.2 520 531.8 491 524.3 L 486.5 524.1'},
  jim: {revision:3, note:'Kepala dari kanan ke kiri. Angkat pen dan mula mangkuk di sambungan tengah. Ini alternatif semakan, belum diluluskan.',
    paths:['M 710.9 365 C 695.1 365 681.3 380.8 665.8 384.5 C 640.7 390.4 606 388.1 580.3 386.5 C 569.3 385.8 564.6 371.3 554.7 367 C 514.2 349.5 384.3 316.7 377.6 387'] },
};
export function fourLetterReviewCandidates(letters) {
  // Reuse the catalogue-outline scope for Nun without changing earlier assets.
  return Object.entries({...outlines,...nunOutline}).flatMap(([id, appearance]) => {
    const original=letters.find(letter=>letter.id===id);
    if(!original || original.contentVersion!==appearance.baseRevision)return [];
    const candidate=structuredClone(original);
    candidate.contentVersion++;
    candidate.geometry.status='pendingReview';candidate.geometry.review=null;
    candidate.geometry.appearance=structuredClone(appearance);
    return [{original,candidate,note:'Bentuk mengikut Isi kandungan, termasuk hujung tirus dan titik. Laluan, arah dan kawasan sentuh dikekalkan.'}];
  });
}
export function faPaReviewCandidates(letters) {
  return Object.entries(directions).flatMap(([id, correction]) => {
    const original=letters.find(letter=>letter.id===id);
    if(!original || original.contentVersion!==correction.baseRevision)return [];
    const candidate=structuredClone(original);
    candidate.contentVersion++;
    candidate.geometry.status='pendingReview';candidate.geometry.review=null;
    candidate.geometry.strokes[0].path=correction.path;
    candidate.geometry.displayPaths=candidate.geometry.strokes.map(stroke=>stroke.path);
    return [{original,candidate,note:'Seperti Qaf: mula di sambungan kanan, ke kiri di bawah kepala, naik mengikut gelung hingga kembali ke mula. Angkat pen, lukis ekor, kemudian sentuh titik. Belokan kecil ke atas pada mula dibuang; bahagian lain dikekalkan.'}];
  });
}
export function videoReviewCandidates(letters) {
  return Object.entries(proposals).flatMap(([id, proposal]) => {
    const original = letters.find(letter => letter.id === id);
    if (!original || original.contentVersion !== proposal.revision) return [];
    const candidate = structuredClone(original);
    candidate.contentVersion++;
    candidate.geometry.status = 'pendingReview'; candidate.geometry.review = null;
    if (id === 'mim' && original.contentVersion === mimTailGap.baseRevision) {
      candidate.contentVersion = mimTailGap.revision;
      candidate.geometry.strokes = mimTailGap.paths.map((path, index) => ({...original.geometry.strokes[0], id:`stroke-${index+1}`, path}));
    } else if (proposal.returnPath) {
      const [head, body] = original.geometry.strokes;
      const path = `${head.path} ${proposal.returnPath} ${body.path.replace(/^M\s*[-\d.]+\s+[-\d.]+\s*/, '')}`;
      candidate.geometry.strokes = [{...head, path}];
    } else {
      candidate.geometry.strokes.forEach((stroke, index) => { if (proposal.paths[index]) stroke.path = proposal.paths[index]; });
    }
    candidate.geometry.displayPaths = candidate.geometry.strokes.map(stroke => stroke.path);
    candidate.geometry.validSequences = [[...candidate.geometry.strokes.map(s => s.id), ...candidate.geometry.dotTargets.map(d => d.id)]];
    return [{original, candidate, note:id === 'mim' ? mimTailGap.note : proposal.note}];
  });
}
