import './globals.css'
export const metadata = { title: 'Habit Tracker', manifest: '/manifest.json' }
export default function L({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1" /><meta name="theme-color" content="#111214" /><script dangerouslySetInnerHTML={{ __html: "if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))" }} /></head><body>{children}</body></html>
}
