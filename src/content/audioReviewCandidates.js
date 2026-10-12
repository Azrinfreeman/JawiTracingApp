import taMarbutaVoice from './taMarbutaVoice.json' with { type: 'json' };

/** Adult audition only; this never replaces the student catalogue recording. */
export function audioNameCandidateFor(letter) {
  return letter.id === taMarbutaVoice.id &&
    letter.audio.name.version === taMarbutaVoice.baseVersion &&
    letter.audio.name.src === taMarbutaVoice.baseSrc
    ? taMarbutaVoice.recording : null;
}
