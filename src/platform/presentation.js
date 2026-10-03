export const presentationKey = 'taman-jawi.presentation.v1';
export function readPresentation(storage, native = Boolean(globalThis.TamanJawiAndroid)) {
  try { const value = storage?.getItem(presentationKey); if (value === 'light' || value === 'full') return value; } catch { /* Session setting still works. */ }
  return native ? 'light' : 'full';
}
export function savePresentation(storage, value) {
  if (value !== 'light' && value !== 'full') return false;
  try { storage?.setItem(presentationKey, value); return Boolean(storage); } catch { return false; }
}
export const isLightweightPresentation = () => document.documentElement.dataset.presentation === 'light';

// Shared across boards: one player's release must not restart the other's effects.
const contacts = new Set();
export function setTracingContact(owner, active) {
  if (active) contacts.add(owner); else contacts.delete(owner);
  document.documentElement.dataset.tracing = contacts.size ? 'true' : 'false';
}
export function resetTracingContacts() { contacts.clear(); document.documentElement.dataset.tracing = 'false'; }
