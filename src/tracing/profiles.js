export function getProfile(mode = 'guided', pointerType = 'mouse', adjustment = 'standard') {
  const touch = pointerType === 'touch';
  if (mode === 'play') return Object.freeze({
    id: `play-${touch ? 'touch' : 'pen-mouse'}-standard-v2`, mode,
    interactionPolicy: 'play-guided-v2', radius: touch ? 60 : 40,
    startRadius: touch ? 76 : 56, endRadius: touch ? 64 : 48,
    coverage: 0.95, backwardJitter: 18, acquisitionArc: 20, turnAllowance: 18,
    maxRawGap: 80, maxAdvance: 90, advanceRatio: 1.8, projectionTie: 3,
    dotRadius: touch ? 48 : 36, dotTravel: touch ? 40 : 24,
    finishReleaseSlack: touch ? 36 : 18, finishReleaseTravel: touch ? 60 : 30, finishOvershoot: touch ? 120 : 60,
    padTravel: 24, maxSamples: 18000,
  });
  const precision = mode === 'precision';
  const base = {
    id: `${mode}-${touch ? 'touch' : 'pen-mouse'}-${adjustment}-v2`,
    mode,
    interactionPolicy: 'strict-v2',
    radius: touch ? (precision ? 24 : 34) : (precision ? 16 : 22),
    startRadius: touch ? (precision ? 34 : 46) : (precision ? 24 : 30),
    endRadius: touch ? (precision ? 30 : 38) : (precision ? 20 : 26),
    coverage: precision ? 0.99 : 0.98,
    maxRawGap: 80,
    maxAdvance: 90,
    backwardJitter: precision ? 6 : 10,
    advanceRatio: 1.8,
    projectionTie: 3,
    maxInvalidRatio: 0.06,
    maxInvalidEvents: 8,
    dotRadius: touch ? (precision ? 28 : 34) : (precision ? 20 : 24),
    dotTravel: touch ? (precision ? 14 : 20) : (precision ? 10 : 14),
    maxSamples: 18000,
  };
  // A teacher-selected profile is fixed for the whole attempt.
  if (!precision && adjustment === 'support') {
    base.radius += 8; base.startRadius += 8; base.endRadius += 8;
  }
  return Object.freeze(base);
}
