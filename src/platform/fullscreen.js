export async function toggleFullscreen() {
  const native = globalThis.TamanJawiAndroid;
  if (typeof native?.setFullscreen === 'function' && typeof native?.isFullscreen === 'function') {
    native.setFullscreen(!native.isFullscreen());
    return;
  }
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
}
