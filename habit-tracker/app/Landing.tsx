'use client'
import { useEffect, useState } from 'react'
import { BookOpen, Dumbbell, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react'

const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
const missions = [
  { n: '01', t: 'Academic Excellence', I: BookOpen, c: 'from-blue-500 to-indigo-600', l: ['Crack GATE 2027', 'Complete daily study targets', 'Practice PYQs', 'Improve technical knowledge'] },
  { n: '02', t: 'Physical Transformation', I: Dumbbell, c: 'from-rose-500 to-orange-500', l: ['Build strength', 'Improve stamina', 'Lose excess weight', 'Develop a lean athletic physique'] },
  { n: '03', t: 'Personal Discipline', I: Sparkles, c: 'from-violet-500 to-fuchsia-500', l: ['Wake up at 6 AM', 'Meditate daily', 'Stay consistent', 'Plan tomorrow'] },
]
const btn = 'rounded-full px-6 py-3 font-semibold transition hover:-translate-y-0.5 hover:shadow-lg'

export default function Landing({ onOpen, loggedIn, dark, toggleDark }: { onOpen: (tab: 'dash' | 'today' | 'gate') => void; loggedIn: boolean; dark: boolean; toggleDark: () => void }) {
  const [dayPct, setP] = useState(0)
  useEffect(() => { const f = () => { const n = new Date(); setP(Math.round((n.getHours() * 60 + n.getMinutes()) / 14.4)) }; f(); const t = setInterval(f, 60000); return () => clearInterval(t) }, [])
  const r = 46, c = 2 * Math.PI * r
  return <div className="min-h-screen bg-gradient-to-b from-[#EEF0FF] via-[#F7F8FC] to-[#F3EEFF] text-[#172033] dark:from-[#111827] dark:via-[#111827] dark:to-[#1a1535] dark:text-slate-100" style={{ scrollBehavior: 'smooth' }}>
    <header className="sticky top-0 z-20 flex items-center justify-between bg-white/70 px-5 py-3 backdrop-blur dark:bg-[#111827]/70">
      <b className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-xl text-transparent">MyProgress</b>
      <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
        <button className="hidden sm:block" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
        <button className="hidden sm:block" onClick={() => go('goals')}>My Goals</button>
        <button className="hidden sm:block" onClick={() => onOpen('dash')}>My Progress</button>
        <button onClick={toggleDark} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        <button onClick={() => onOpen('dash')} className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-white">{loggedIn ? 'Dashboard' : 'Login'}</button>
      </nav>
    </header>

    <section className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-8 overflow-hidden px-5 py-10 md:grid-cols-2">
      <div className="anim-up">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">WELCOME TO <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 bg-clip-text text-transparent">YOUR NEXT CHAPTER.</span></h1>
        <p className="mt-4 text-xl font-semibold text-indigo-700 dark:text-indigo-300">Small habits. Consistent efforts. Extraordinary results.</p>
        <p className="mt-3 max-w-lg text-slate-600 dark:text-slate-300">Every day is another opportunity to become stronger, smarter and better. Track your discipline, build consistency and turn your goals into achievements.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">{[['GATE 2027', 'Your Academic Mission', 'text-blue-600'], ['Stronger Body', 'Your Fitness Journey', 'text-rose-600'], ['Better You', 'Your Personal Growth', 'text-violet-600']].map(([a, b, col]) =>
          <div key={a} className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-white/5"><b className={col + ' block dark:brightness-125'}>{a}</b><span className="text-xs text-slate-500 dark:text-slate-400">{b}</span></div>)}</div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => onOpen('today')} className={btn + ' bg-gradient-to-r from-indigo-600 to-violet-600 text-white'}>Start My Day <ArrowRight className="inline" size={16} /></button>
          <button onClick={() => onOpen('dash')} className={btn + ' border border-indigo-200 bg-white text-indigo-700 dark:border-white/20 dark:bg-white/5 dark:text-indigo-200'}>View My Progress</button>
        </div>
      </div>
      <svg viewBox="0 0 400 340" className="w-full" role="img" aria-label="Person on a mountain looking at the sunrise">
        <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6366F1" /><stop offset=".55" stopColor="#C084FC" /><stop offset="1" stopColor="#FDBA74" /></linearGradient>
          <radialGradient id="sun"><stop offset="0" stopColor="#FFF7D6" /><stop offset="1" stopColor="#FBBF24" stopOpacity="0" /></radialGradient></defs>
        <rect width="400" height="340" rx="28" fill="url(#sky)" />
        <circle className="anim-float" cx="270" cy="190" r="90" fill="url(#sun)" /><circle cx="270" cy="190" r="30" fill="#FDE68A" />
        {[[60, 60], [120, 30], [330, 50], [200, 80], [360, 110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" opacity=".8" />)}
        <path d="M0 260 L90 170 L160 240 L230 150 L320 250 L400 200 V340 H0Z" fill="#4C3FA8" opacity=".55" />
        <path d="M0 300 L70 230 L150 290 L210 210 L300 300 L400 250 V340 H0Z" fill="#2E2670" />
        <path d="M60 232 L100 232 L110 222 L130 222 L140 232 L170 232 L210 210 L260 300 H0 Z" fill="#241E5C" />
        <g fill="#0F0C2E"><circle cx="196" cy="168" r="6" /><path d="M190 176 h12 l3 24 h-5 l-2 18 h-4 l-1 -14 l-1 14 h-4 l-2 -18 h-5z" /><path d="M202 180 l14 -10" stroke="#0F0C2E" strokeWidth="3" /></g>
      </svg>
    </section>

    <section className="mx-auto max-w-4xl px-5 py-12"><div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 p-8 text-center text-white shadow-xl">
      <p className="text-3xl font-extrabold sm:text-4xl">“Don't run for perfection. Just be consistent.”</p>
      <p className="mt-3 text-white/85">Trust the process. Your hard work will speak.</p></div></section>

    <section id="goals" className="mx-auto max-w-6xl px-5 py-8"><h2 className="mb-5 text-center text-2xl font-bold">My Mission</h2>
      <div className="grid gap-4 md:grid-cols-3">{missions.map(({ n, t, I, c, l }) =>
        <div key={n} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-[#1F2937]">
          <div className="flex items-center justify-between"><span className={'grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white ' + c}><I size={22} /></span><span className="text-3xl font-black text-slate-200 dark:text-slate-600">{n}</span></div>
          <h3 className="mt-3 text-lg font-bold">{t}</h3><ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">{l.map(x => <li key={x}>• {x}</li>)}</ul></div>)}</div></section>

    <section className="mx-auto max-w-4xl px-5 py-12"><div className="flex flex-col items-center gap-5 rounded-3xl bg-white p-8 shadow-sm sm:flex-row dark:bg-[#1F2937]">
      <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r={r} stroke="#E0E7FF" strokeWidth="10" fill="none" /><circle cx="60" cy="60" r={r} stroke="#6366F1" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - dayPct / 100)} transform="rotate(-90 60 60)" /><text x="60" y="65" textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">{dayPct}%</text></svg>
      <div><p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · of today has passed</p>
        <h2 className="text-2xl font-bold">Today's effort is tomorrow's achievement.</h2>
        <p className="text-slate-600 dark:text-slate-300">Progress matters more than perfection. One honest step today is enough.</p></div></div></section>

    <section className="px-5 pb-16 pt-6 text-center"><h2 className="text-3xl font-extrabold sm:text-4xl">YOUR GOALS WON'T ACHIEVE THEMSELVES.</h2>
      <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">One day or Day One. You decide.</p>
      <button onClick={() => onOpen('today')} className={btn + ' mt-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white'}>Let's Get Started</button>
      <p className="mt-10 font-semibold text-indigo-700 dark:text-indigo-300">Discipline Today. Freedom Tomorrow.</p></section>
  </div>
}
