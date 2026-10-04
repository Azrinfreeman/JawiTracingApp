export const MUSIC_SETTINGS_KEY = 'taman-jawi.music.v1';
export function readMusicPreferences(storage) {
  try {
    const value = JSON.parse(storage.getItem(MUSIC_SETTINGS_KEY));
    if (value?.version === 1 && typeof value.enabled === 'boolean' && Number.isFinite(value.volume) && value.volume >= 0 && value.volume <= 1) return value;
  } catch { /* Playback remains available when storage is unavailable. */ }
  return { version: 1, enabled: true, volume: .15 };
}
export function saveMusicPreferences(storage, value) {
  try { storage.setItem(MUSIC_SETTINGS_KEY, JSON.stringify(value)); } catch { /* Keep the current session's choice. */ }
}
