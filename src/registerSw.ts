// Registers the service worker in production builds only, so local
// development always serves fresh files.
export function registerServiceWorker(
  nav: Navigator = navigator,
  isProd = import.meta.env.PROD,
  page?: Pick<Window, 'addEventListener'>,
): boolean {
  if (!isProd || !('serviceWorker' in nav)) return false
  const target = page ?? window
  target.addEventListener('load', () => {
    void nav.serviceWorker.register('/sw.js')
  })
  return true
}
