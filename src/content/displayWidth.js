// Width of the Jejak Ceria guide band in the 1000-unit model. Strokes may author a narrower
// `displayWidth` (validated 30-76) so loops and small counters stay open; matching tolerances never use it.
export const DEFAULT_PLAY_GUIDE_WIDTH = 76;
export const playGuideWidth = stroke => stroke.displayWidth ?? DEFAULT_PLAY_GUIDE_WIDTH;
// Accepted progress is drawn slightly narrower than the guide, as before (60 inside 76).
export const playFillWidth = stroke => Math.round(playGuideWidth(stroke) * 60 / DEFAULT_PLAY_GUIDE_WIDTH);
