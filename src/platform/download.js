export function downloadJson(name, content) {
  if (typeof globalThis.TamanJawiAndroid?.saveJson === 'function') {
    globalThis.TamanJawiAndroid.saveJson(name, content);
    return;
  }
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
