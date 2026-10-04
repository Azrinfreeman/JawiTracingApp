export async function enterFullscreen() {
  const native = globalThis.TamanJawiAndroid;
  if (typeof native?.setFullscreen === 'function' && typeof native?.isFullscreen === 'function') {
    if (!native.isFullscreen()) native.setFullscreen(true);
  } else if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
}

export async function toggleFullscreen() {
  const native = globalThis.TamanJawiAndroid;
  if (typeof native?.setFullscreen === 'function' && typeof native?.isFullscreen === 'function') {
    native.setFullscreen(!native.isFullscreen());
    return;
  }
  if (document.fullscreenElement) await document.exitFullscreen();
  else await document.documentElement.requestFullscreen();
}
