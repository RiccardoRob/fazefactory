/* Registers the Fazefactory® service worker once the page has finished loading, so it never
   competes with the first paint. Skipped where service workers aren't available (old browsers,
   private modes, file://). */
(() => {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' }).catch(() => {});
  });
})();
