const statuses = new Set(['draft', 'pendingReview', 'approved']);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const pathPattern = /^[MmLlHhVvCcSsQqTtAaZz0-9eE+.,\s-]+$/;
const arity = { M:2,L:2,H:1,V:1,C:6,S:4,Q:4,T:2,A:7,Z:0 };
function validPath(path) {
  if (typeof path !== 'string' || path.length > 4096 || !pathPattern.test(path) || (path.match(/[Mm]/g) || []).length !== 1) return false;
  const tokens = path.match(/[MLHVCSQTAZmlhvcsqtaz]|[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?/g) || [];
  if (!/^[Mm]$/.test(tokens[0] || '') || path.replace(/[MLHVCSQTAZmlhvcsqtaz]|[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?/g,'').replace(/[\s,]/g,'')) return false;
  let drawn = false;
  for (let i = 0; i < tokens.length;) {
    const command = tokens[i++].toUpperCase();
    if (!(command in arity)) return false;
    const values = [];
    while (i < tokens.length && !/^[a-z]$/i.test(tokens[i])) values.push(Number(tokens[i++]));
    const count = arity[command];
    if (values.some(v => !finite(v) || Math.abs(v) > 10000) || (count ? !values.length || values.length % count : values.length)) return false;
    if (command !== 'M' || values.length > 2) drawn = true;
    if (command === 'A') for (let n = 0; n < values.length; n += 7) if (values[n] < 0 || values[n+1] < 0 || ![0,1].includes(values[n+3]) || ![0,1].includes(values[n+4])) return false;
  }
  return drawn;
}
const reviewMatches = (review, revision) => review && review.revision === revision &&
  ['reviewer', 'date', 'reference'].every(key => typeof review[key] === 'string' && review[key].trim()) &&
  /^\d{4}-\d{2}-\d{2}$/.test(review.date);

export function validateLetter(letter) {
  const errors = [];
  if (!letter || typeof letter !== 'object') return { valid: false, ready: false, errors: ['Missing letter'] };
  if (!/^[a-z][a-z-]*$/.test(letter.id || '')) errors.push('Invalid letter ID');
  if (!letter.glyph || !letter.labelMs || !Number.isInteger(letter.contentVersion) || letter.contentVersion < 1) errors.push('Missing identity/version');
  if (!Array.isArray(letter.viewBox) || letter.viewBox.length !== 4 || !letter.viewBox.every(finite) || letter.viewBox[2] <= 0 || letter.viewBox[3] <= 0) errors.push('Invalid viewBox');
  const geometry = letter.geometry;
  if (!geometry || !statuses.has(geometry.status)) errors.push('Invalid geometry state');
  const strokes = geometry?.strokes || [], dots = geometry?.dotTargets || [], sequences = geometry?.validSequences || [];
  const items = [...strokes, ...dots];
  const ids = items.map(item => item.id);
  if (new Set(ids).size !== ids.length || ids.some(id => typeof id !== 'string' || !id)) errors.push('Duplicate or missing movement IDs');
  for (const stroke of strokes) {
    if (!validPath(stroke.path)) errors.push('Unsafe or discontinuous path');
    if (!finite(stroke.width) || stroke.width <= 0 || !['continuous', 'resume'].includes(stroke.penLiftPolicy)) errors.push('Invalid stroke policy');
    if (stroke.displayWidth !== undefined && (!finite(stroke.displayWidth) || stroke.displayWidth < 30 || stroke.displayWidth > 76)) errors.push('Invalid display width');
    if (!Array.isArray(stroke.checkpoints) || stroke.checkpoints.some(p => !finite(p) || p <= 0 || p > 1)) errors.push('Invalid checkpoints');
  }
  for (const dot of dots) {
    if (![dot.x,dot.y,dot.visibleRadius,dot.hitRadius,dot.maxTravel].every(finite) || dot.visibleRadius <= 0 || dot.hitRadius <= 0 || dot.maxTravel < 0 || dot.policy !== 'tap') errors.push('Invalid dot');
  }
  if (!Array.isArray(geometry?.displayPaths) || geometry.displayPaths.some(p => !validPath(p))) errors.push('Invalid display paths');
  if (strokes.length && (!sequences.length || !geometry.displayPaths.length)) errors.push('Missing model/sequence');
  for (const sequence of sequences) {
    if (!Array.isArray(sequence) || sequence.length !== ids.length || new Set(sequence).size !== ids.length || sequence.some(id => !ids.includes(id))) errors.push('Invalid sequence references');
  }
  if (geometry?.status === 'approved' && (!strokes.length || !reviewMatches(geometry.review, letter.contentVersion))) errors.push('Unreviewed/empty approved geometry');
  const audio = letter.audio?.name;
  const recordings = [audio, ...(letter.audio?.pronunciationExamples || [])];
  for (const recording of recordings) {
    if (!recording || !statuses.has(recording.status) || !recording.transcriptMs || !Number.isInteger(recording.version)) { errors.push('Invalid recording metadata'); continue; }
    if (recording.src && (!/^\/audio\/[a-zA-Z0-9/_-]+\.(mp3|wav|ogg|m4a)$/.test(recording.src))) errors.push('Invalid local recording path');
    if (recording.status === 'approved' && (!recording.src || !recording.permission || !reviewMatches(recording.review, recording.version))) errors.push('Unreviewed/missing approved recording');
  }
  const valid = errors.length === 0;
  return { valid, errors, ready: valid && geometry.status === 'approved' && recordings.every(r => r.status === 'approved') };
}

export function validateCatalogue(letters) {
  const ids = letters.map(letter => letter.id);
  const errors = new Set(ids).size === ids.length ? [] : ['Duplicate letter IDs'];
  const results = letters.map(letter => ({ id: letter.id, ...validateLetter(letter) }));
  results.forEach(result => result.errors.forEach(error => errors.push(`${result.id}: ${error}`)));
  return { valid: !errors.length, errors, results };
}
