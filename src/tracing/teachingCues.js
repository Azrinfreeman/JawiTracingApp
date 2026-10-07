// Presentation only: these sections never credit movement or change writing order.
import haDirection from '../content/haDirection.json' with {type:'json'};
const revisions = { wau: 2, ha: 3, sin: 1, syin: 2, ra: 2, zal: 3, zai: 3, nun: 2, nya: 3, sad: 2, dad: 2, fa: 4, pa: 4 };
const sections = {
  wau: [[0, 'Naik dan ikut gelung kepala.'], [.58, 'Ikut gelung hingga ke sambungan.'], [.76, 'Teruskan ekor ke kiri.']],
  ha: [[0, 'Ikut gelung kecil dahulu.'], [.4, 'Teruskan gelung luar.'], [.84, 'Ikut ekor ke kiri.']],
  sin: [[0, 'Ikut setiap lengkung gigi.'], [.56, 'Teruskan lengkung ke mangkuk.']],
  syin: [[0, 'Ikut setiap lengkung gigi.'], [.56, 'Teruskan lengkung ke mangkuk.']],
};
export function teachingSections(letter, id) {
  if(letter.id==='ha' && letter.contentVersion===haDirection.revision) return id==='stroke-1'?haDirection.sections:[];
  if (revisions[letter.id] !== letter.contentVersion) return [];
  if (['fa', 'pa'].includes(letter.id)) return id === 'stroke-1'
    ? [[0, 'Ke kiri, kemudian naik mengikut gelung.']]
    : [[0, 'Turun, kemudian ikut ekor ke kiri.']];
  if (sections[letter.id]) return sections[letter.id];
  if (['sad', 'dad'].includes(letter.id)) return id === 'stroke-1'
    ? [[0, 'Ikut gelung kepala hingga kembali ke mula.']]
    : [[0, 'Naik ke hujung gigi, kemudian turun.'], [.25, 'Teruskan lengkung mangkuk.']];
  return [[0, 'Ikut lengkung kecil pada mula.'], [.12, 'Teruskan mengikut anak panah.']];
}
export function sectionIndex(letter, id, fraction) {
  return Math.max(0, teachingSections(letter, id).findLastIndex(([start]) => fraction >= start));
}
export function stageInstruction(letter, part, view, finishText) {
  if (!part || view.phase === 'complete') return '';
  if (part.kind === 'dot') {
    const remaining = letter.geometry.dotTargets.filter(dot => !view.completed.includes(dot.id)).length;
    return `Bentuk huruf siap. Tinggal ${remaining} titik. Sentuh ${part.points[0].number}, kemudian angkat pen.`;
  }
  if (finishText) return finishText;
  if (view.phase === 'paused') return view.reason === 'wrongStart'
    ? 'Mula pada bulatan hijau.' : 'Sambung dari anak panah.';
  const progress = view.progress[part.id] || 0;
  if (view.phase === 'awaitingStart') {
    if (progress > 0) return 'Sambung dari anak panah.';
    if ((['fa', 'pa'].includes(letter.id) && revisions[letter.id] === letter.contentVersion)
      || (letter.id==='ha' && letter.contentVersion===haDirection.revision)) {
      const start = view.completed.length ? `Angkat pen. Mula semula di ${part.points[0].number}.` : `Mula di ${part.points[0].number}.`;
      return `${start} ${teachingSections(letter, part.id)[0][1]}`;
    }
    return view.completed.length ? `Angkat pen. Mula semula di ${part.points[0].number}.`
      : `Mula di ${part.points[0].number}. Ikut anak panah.`;
  }
  const cues = teachingSections(letter, part.id);
  return cues[sectionIndex(letter, part.id, progress / part.reference.length)]?.[1] || 'Ikut laluan hingga hujung.';
}

/** Arc schedule with explicit pen-up gaps and short pauses at section boundaries. */
export function demonstrationPlan(letter, references, pending, progress, sectionOnly = false) {
  const sequence = letter.geometry.validSequences[0];
  const ids = sectionOnly ? [pending || sequence[0]] : sequence;
  return ids.flatMap(id => {
    const ref = references[id];
    if (!ref) return [{id, from:0, to:1, duration:650, pause:450}];
    const from = sectionOnly ? Math.min(ref.length, progress[id] || 0) : 0;
    const stops = [...teachingSections(letter, id).map(([f]) => f * ref.length), ref.length]
      .filter(s => s > from + .01);
    if (!stops.length) stops.push(ref.length);
    let last = from;
    return stops.map(to => {
      const step = {id, from:last, to, duration:Math.max(650, Math.min(2300, (to-last)*4)), pause:450};
      last = to; return step;
    });
  });
}
