'use client'
import { useEffect, useState, useCallback } from 'react'
import { sb, iso } from '@/lib/supabase'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { Home, CheckSquare, BookOpen, Check, Dumbbell, Target, Sun, Moon, Calendar, Flame, Trophy, Clock, LogOut, Sparkles, Zap, Crown, Play, Square, Plus, ArrowLeft } from 'lucide-react'
import Landing from './Landing'
import { Pyq, Fitness, History } from './Trackers'
import { card, inp, btn, hc, Burst, Spinner, Stat, Tip } from './ui'
type Tab = 'dash' | 'today' | 'gate' | 'pyq' | 'fit' | 'hist'

const MSGS = ['Small steps every day create extraordinary results.', "You don't need a perfect day. You need a consistent one.", 'One more day closer to GATE 2027.', 'Your future is built by what you do today.']
const TABS = [['dash', Home, 'Home'], ['today', CheckSquare, 'Today'], ['gate', BookOpen, 'GATE'], ['pyq', Target, 'PYQ'], ['fit', Dumbbell, 'Fitness'], ['hist', Calendar, 'History']] as const

function Ring({ pct, size = 150 }: { pct: number; size?: number }) {
  const [p, setP] = useState(0), r = 52, c = 2 * Math.PI * r
  useEffect(() => { const t = setTimeout(() => setP(pct), 150); return () => clearTimeout(t) }, [pct])
  return <svg width={size} height={size} viewBox="0 0 140 140" className="shrink-0"><circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,.25)" strokeWidth="12" fill="none" />
    <circle cx="70" cy="70" r={r} stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p / 100)} transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)' }} />
    <text x="70" y="78" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="800">{pct}%</text></svg>
}

function Auth({ back }: { back: () => void }) {
  const [email, setE] = useState(''), [pw, setP] = useState(''), [mode, setM] = useState<'in' | 'up'>('in'), [err, setErr] = useState(''), [busy, setB] = useState(false)
  const go = async () => {
    if (!email.trim() || pw.length < 6) return setErr('Enter a valid email and a password of 6+ characters.')
    setB(true); setErr('')
    const { error } = mode === 'in' ? await sb.auth.signInWithPassword({ email: email.trim(), password: pw }) : await sb.auth.signUp({ email: email.trim(), password: pw })
    if (error) setErr(error.message); else if (mode === 'up') setErr('Account created. If email confirmation is on, confirm then sign in.')
    setB(false)
  }
  return <div className="grid min-h-screen place-items-center p-4"><div className={card + ' anim-up w-full max-w-sm space-y-4 !p-7'}>
    <div className="text-center"><span className="anim-float mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg"><Sparkles /></span>
      <h1 className="text-2xl font-extrabold">{mode === 'in' ? 'Welcome back' : 'Create account'}</h1><p className="text-sm text-slate-500">Build habits. Crack GATE.</p></div>
    <input className={inp} placeholder="Email" type="email" value={email} onChange={e => setE(e.target.value)} />
    <input className={inp} type="password" placeholder="Password (6+ chars)" value={pw} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === 'Enter' && go()} />
    {err && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{err}</p>}
    <button disabled={busy} onClick={go} className={btn}>{busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Register'}</button>
    <div className="flex justify-between text-sm text-slate-500"><button className="flex items-center gap-1 hover:text-indigo-600" onClick={back}><ArrowLeft size={14} />Back</button><button className="hover:text-indigo-600" onClick={() => { setM(mode === 'in' ? 'up' : 'in'); setErr('') }}>{mode === 'in' ? 'New here? Register' : 'Have an account? Sign in'}</button></div>
  </div></div>
}

function SignOut({ full }: { full?: boolean }) {
  return <button onClick={() => sb.auth.signOut()} className={'flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 active:scale-95 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20 ' + (full ? 'w-full' : '')}><LogOut size={16} />Sign out</button>
}

function App({ initialTab, onHome, dark, toggleDark }: { initialTab: Tab; onHome: () => void; dark: boolean; toggleDark: () => void }) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [habits, setH] = useState<any[]>([]), [logs, setL] = useState<any[]>([]), [loading, setLoading] = useState(true), [err, setErr] = useState(''), [fx, setFx] = useState('')
  const today = iso()

  const load = useCallback(async () => {
    setErr('')
    await sb.rpc('seed_user')
    const since = iso(new Date(Date.now() - 29 * 864e5))
    const [h, l] = await Promise.all([sb.from('habits').select('*').eq('active', true).order('sort'), sb.from('daily_habit_logs').select('*').gte('log_date', since)])
    if (h.error || l.error) setErr((h.error || l.error)!.message)
    setH(h.data || []); setL(l.data || []); setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const toggle = async (hb: any) => {
    const cur = logs.find(x => x.habit_id === hb.id && x.log_date === today)
    const completed = !cur?.completed
    if (completed) { setFx(hb.id); setTimeout(() => setFx(''), 800) }
    setL(p => cur ? p.map(x => x === cur ? { ...x, completed } : x) : [...p, { habit_id: hb.id, log_date: today, completed }])
    const { error } = await sb.from('daily_habit_logs').upsert({ habit_id: hb.id, log_date: today, completed, value: completed ? hb.target : 0 }, { onConflict: 'habit_id,log_date' })
    if (error) { setErr(error.message); load() }
  }

  const done = (d: string) => logs.filter(l => l.log_date === d && l.completed).length
  const total = habits.length || 1
  const pct = Math.round(done(today) / total * 100)
  const series = Array.from({ length: 14 }, (_, i) => { const d = iso(new Date(Date.now() - (13 - i) * 864e5)); return { d: d.slice(8), full: new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), pct: Math.round(done(d) / total * 100) } })
  let best = 0, run = 0
  for (let i = 29; i >= 0; i--) { const d = iso(new Date(Date.now() - i * 864e5)); if (done(d) / total >= 0.7) { run++; best = Math.max(best, run) } else if (i !== 0) run = 0 }
  const streak = run
  const gateH = Number(logs.find(l => l.log_date === today && habits.find(h => h.id === l.habit_id)?.slug === 'gate3')?.value || 0)
  const msg = pct === 0 && streak === 0 ? 'Restart with one small habit. That is enough.' : MSGS[new Date().getDate() % MSGS.length]
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'

  const iconBtn = 'grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-600 active:scale-95 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20'
  const Theme = <button onClick={toggleDark} aria-label="Toggle theme" className={iconBtn}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>

  return <div className="mx-auto max-w-3xl p-4 pb-28 md:ml-56 md:max-w-4xl">
    <header className="mb-4 flex items-center justify-between md:hidden"><div className="flex items-center gap-2 font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white"><Sparkles size={18} /></span>Habit Tracker</div>
      <div className="flex items-center gap-2">{Theme}<SignOut /></div></header>
    {err && <p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{err}</p>}
    {loading ? <Spinner /> : <div key={tab} className="anim-up">
    {tab === 'dash' && <div className="space-y-4">
      <div className="anim-grad relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 bg-[length:200%_200%] p-6 text-white shadow-xl shadow-indigo-500/20">
        <span className="anim-float absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" /><span className="anim-float absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-fuchsia-300/20" style={{ animationDelay: '1.5s' }} />
        <div className="relative flex flex-wrap items-center gap-5"><Ring pct={pct} />
          <div className="min-w-0 flex-1"><p className="text-sm text-white/80">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h2 className="text-2xl font-extrabold">{greet}!</h2><p className="mt-1 font-semibold">{done(today)} / {habits.length} habits done</p><p className="mt-1 text-sm text-white/85">{msg}</p>
            <button onClick={() => setTab('today')} className="mt-3 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur transition hover:bg-white/30">Open today's list →</button></div></div></div>
      <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat I={Flame} v={streak + (streak === 1 ? ' day' : ' days')} l="Current streak" a="#FB923C" b="#EF4444" />
        <Stat I={Trophy} v={best + (best === 1 ? ' day' : ' days')} l="Longest (30d)" a="#FBBF24" b="#D97706" />
        <Stat I={Clock} v={gateH.toFixed(1) + 'h'} l="GATE today" a="#38BDF8" b="#4F46E5" /></div>
      <div className={card}><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><p className="font-bold">Daily completion</p><p className="text-xs text-slate-500">Last 14 days · goal 70%</p></div>
        <div className="flex gap-3 text-xs text-slate-500">{[['#10B981', '70%+'], ['#F59E0B', '40–69%'], ['#F43F5E', '<40%']].map(([c, t]) => <span key={t} className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />{t}</span>)}</div></div>
        <div className="h-56"><ResponsiveContainer><BarChart data={series} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
          <defs>{[['gG', '#34D399', '#059669'], ['gM', '#FCD34D', '#F59E0B'], ['gL', '#FB7185', '#E11D48']].map(([id, a, b]) => <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={a} /><stop offset="100%" stopColor={b} /></linearGradient>)}</defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={0.25} />
          <XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={11} stroke="#94A3B8" />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={v => v + '%'} tickLine={false} axisLine={false} fontSize={11} stroke="#94A3B8" />
          <Tooltip cursor={{ fill: 'rgba(99,102,241,.08)' }} content={<Tip unit="%" />} />
          <ReferenceLine y={70} stroke="#6366F1" strokeDasharray="5 5" />
          <Bar dataKey="pct" radius={[8, 8, 3, 3]} maxBarSize={28} animationDuration={900} minPointSize={3}>{series.map((s, i) => <Cell key={i} fill={`url(#${s.pct >= 70 ? 'gG' : s.pct >= 40 ? 'gM' : 'gL'})`} />)}</Bar></BarChart></ResponsiveContainer></div></div>
    </div>}

    {tab === 'today' && <div className="space-y-3">
      <div className={card + ' !p-4'}><div className="mb-2 flex items-center justify-between"><p className="font-bold">{pct === 100 ? 'All habits done! 🎉' : "Today's habits"}</p><span className="text-sm font-semibold text-indigo-600">{done(today)}/{habits.length}</span></div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-400 transition-all duration-700" style={{ width: pct + '%' }} /></div></div>
      <div className="stagger space-y-2.5">{habits.map(h => { const ok = logs.find(l => l.habit_id === h.id && l.log_date === today)?.completed
        const isGate = h.slug.startsWith('gate'), [I, a, b] = hc(h.slug)
        return <button key={h.id} disabled={isGate} onClick={() => toggle(h)} className="card-x relative flex w-full items-center justify-between overflow-hidden rounded-2xl border p-4 text-left transition active:scale-[.98] disabled:cursor-default" style={{ borderColor: ok ? a : 'rgba(148,163,184,.25)', background: ok ? `linear-gradient(90deg,${a}22,${b}0D)` : undefined }}>
          <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: `linear-gradient(${a},${b})` }} />
          <span className="flex items-center gap-3 pl-1"><span className="grid h-11 w-11 place-items-center rounded-xl text-white shadow-md transition-transform" style={{ background: `linear-gradient(135deg,${a},${b})`, transform: ok ? 'rotate(-6deg) scale(1.05)' : '' }}><I size={20} /></span>
            <span className={'font-semibold transition ' + (ok ? 'opacity-60 line-through' : '')}>{h.name}{isGate && <span className="block text-xs font-normal text-blue-500 no-underline">Auto-completes from the GATE timer</span>}</span></span>
          <span className="relative grid h-9 w-9 place-items-center rounded-full border-2 transition-all" style={ok ? { background: `linear-gradient(135deg,${a},${b})`, borderColor: 'transparent' } : { borderColor: a + '88' }}>
            {ok && <Check size={18} className="anim-pop text-white" />}{fx === h.id && <Burst c={a} />}</span></button> })}</div></div>}
    {tab === 'gate' && <Gate onSaved={load} />}
    {tab === 'pyq' && <Pyq />}{tab === 'fit' && <Fitness />}{tab === 'hist' && <History />}</div>}

    <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-slate-200/70 bg-white/90 p-1.5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0E1426]/90 md:top-0 md:right-auto md:w-52 md:flex-col md:justify-start md:gap-1 md:border-r md:border-t-0 md:p-4">
      <div className="mb-4 hidden items-center gap-2 text-lg font-extrabold md:flex"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg"><Sparkles size={20} /></span>Habits</div>
      {TABS.map(([k, I, n]) => <button key={k} onClick={() => setTab(k)} className={'flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-semibold transition md:flex-none md:flex-row md:gap-3 md:px-3 md:text-sm ' + (tab === k ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5')}><I size={20} />{n}</button>)}
      <div className="mt-auto hidden space-y-2 md:block"><button onClick={onHome} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 dark:hover:bg-white/5"><ArrowLeft size={16} />Welcome page</button>
        <div className="flex items-center justify-between px-1"><span className="text-xs text-slate-500">Theme</span>{Theme}</div><SignOut full /></div></nav>
  </div>
}

function Gate({ onSaved }: { onSaved: () => void }) {
  const [subjects, setS] = useState<any[]>([]), [sub, setSub] = useState(''), [newSub, setNew] = useState(''), [topic, setTopic] = useState('')
  const [running, setR] = useState(false), [start, setStart] = useState<number | null>(null), [now, setNow] = useState(Date.now()), [sessions, setSess] = useState<any[]>([]), [err, setErr] = useState('')
  const refresh = async () => {
    const a = await sb.from('study_subjects').select('*').order('name'); setS(a.data || [])
    const b = await sb.from('study_sessions').select('*').eq('log_date', iso()).order('started_at', { ascending: false }); setSess(b.data || [])
  }
  useEffect(() => { refresh() }, [])
  useEffect(() => { if (!running) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [running])
  const addSub = async () => { if (!newSub.trim()) return; const { error } = await sb.from('study_subjects').insert({ name: newSub.trim() }); if (error) setErr(error.message); setNew(''); refresh() }
  const stop = async () => {
    const secs = Math.round((Date.now() - start!) / 1000); setR(false)
    const { data: t } = topic ? await sb.from('study_topics').insert({ name: topic, subject_id: sub || null }).select().single() : { data: null }
    const { error } = await sb.from('study_sessions').insert({ subject_id: sub || null, topic_id: t?.id ?? null, started_at: new Date(start!).toISOString(), ended_at: new Date().toISOString(), focus_seconds: secs, log_date: iso(new Date(start!)) })
    if (error) setErr(error.message); await refresh(); onSaved()
  }
  const totalSec = sessions.reduce((a, s) => a + s.focus_seconds, 0) + (running ? Math.round((now - start!) / 1000) : 0)
  const hrs = totalSec / 3600, mm = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const R = 96, C = 2 * Math.PI * R, frac = Math.min(hrs / 7, 1)
  const MS: [number, any, string, string, string][] = [[3, Zap, 'circle', '#38BDF8', '#2563EB'], [5, Flame, 'diamond', '#FB923C', '#EF4444'], [7, Crown, 'hex', '#FBBF24', '#D97706']]
  const shape = (k: string) => k === 'circle' ? { borderRadius: '9999px' } : k === 'diamond' ? { borderRadius: 14, transform: 'rotate(45deg)' } : { clipPath: 'polygon(25% 5%,75% 5%,100% 50%,75% 95%,25% 95%,0 50%)' }
  return <div className="space-y-4">
    {err && <p className="text-sm text-rose-500">{err}</p>}
    <div className={card + ' relative overflow-hidden text-center'}>
      <span className="anim-float absolute -left-10 top-6 h-32 w-32 rounded-full bg-sky-400/15 blur-2xl" /><span className="anim-float absolute -right-8 bottom-4 h-36 w-36 rounded-full bg-fuchsia-400/15 blur-2xl" style={{ animationDelay: '2s' }} />
      <div className="relative mx-auto w-[230px]"><svg viewBox="0 0 230 230" className="w-full"><defs><linearGradient id="gr" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#38BDF8" /><stop offset="55%" stopColor="#6366F1" /><stop offset="100%" stopColor="#D946EF" /></linearGradient></defs>
        {running && <circle cx="115" cy="115" r="110" fill="none" stroke="#6366F1" strokeOpacity=".5" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" className="anim-spin-slow" style={{ transformOrigin: '115px 115px' }} />}
        <circle cx="115" cy="115" r={R} fill="none" stroke="#94A3B8" strokeOpacity=".2" strokeWidth="14" />
        <circle cx="115" cy="115" r={R} fill="none" stroke="url(#gr)" strokeWidth="14" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} transform="rotate(-90 115 115)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        {MS.map(([h, , , a]) => { const ang = -Math.PI / 2 + h / 7 * 2 * Math.PI; return <circle key={h} cx={115 + R * Math.cos(ang)} cy={115 + R * Math.sin(ang)} r="6" fill={hrs >= h ? a : '#fff'} stroke={hrs >= h ? '#fff' : '#94A3B8'} strokeWidth="2.5" /> })}</svg>
        <div className="absolute inset-0 grid place-content-center"><p className="text-3xl font-extrabold tabular-nums">{mm(totalSec)}</p><p className="text-xs text-slate-500">of 7h goal</p>{running && <p className="anim-glow mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-indigo-500"><i className="h-2 w-2 rounded-full bg-indigo-500" />Focusing</p>}</div></div>
      <div className="relative mt-4 flex justify-center gap-6">{MS.map(([h, I, k, a, b]) => { const ok = hrs >= h; return <div key={h} className="text-center"><div className={'grid h-14 w-14 place-items-center text-white transition ' + (ok ? 'anim-pop shadow-lg' : 'bg-slate-200 text-slate-400 dark:bg-white/10')} style={{ ...shape(k), ...(ok ? { background: `linear-gradient(135deg,${a},${b})` } : {}) }}><span style={k === 'diamond' ? { transform: 'rotate(-45deg)' } : {}}><I size={22} /></span></div><p className={'mt-1.5 text-xs font-bold ' + (ok ? '' : 'text-slate-400')}>{h}h</p></div> })}</div></div>
    <div className={card + ' space-y-2.5'}>
      <select className={inp} value={sub} onChange={e => setSub(e.target.value)}><option value="">Subject…</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <div className="flex gap-2"><input className={inp} placeholder="Add subject" value={newSub} onChange={e => setNew(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSub()} /><button onClick={addSub} aria-label="Add subject" className="grid w-12 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-600 transition hover:bg-indigo-200 active:scale-95 dark:bg-white/10 dark:text-indigo-300"><Plus /></button></div>
      <input className={inp} placeholder="Topic" value={topic} onChange={e => setTopic(e.target.value)} />
      {!running ? <button onClick={() => { setStart(Date.now()); setNow(Date.now()); setR(true) }} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 p-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 active:scale-[.98]"><Play size={18} />Start focus session</button>
        : <button onClick={stop} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 p-3 font-semibold text-white shadow-lg shadow-rose-500/25 transition active:scale-[.98]"><Square size={16} />Stop and save</button>}</div>
    <div className={card}><p className="mb-3 font-bold">Today's sessions</p><div className="space-y-2.5 border-l-2 border-indigo-200 pl-4 dark:border-white/10">{sessions.map(s => <div key={s.id} className="relative flex justify-between text-sm"><i className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-400 to-fuchsia-500" /><span className="text-slate-500">{new Date(s.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span><b className="tabular-nums">{mm(s.focus_seconds)}</b></div>)}{!sessions.length && <p className="text-sm text-slate-400">None yet. Start your first session.</p>}</div></div>
  </div>
}

export default function Page() {
  const [session, setS] = useState<any>(undefined), [view, setView] = useState<'landing' | 'app'>('landing'), [tab, setTab] = useState<Tab>('today'), [dark, setDark] = useState(false)
  useEffect(() => { sb.auth.getSession().then(r => setS(r.data.session)); const { data } = sb.auth.onAuthStateChange((_e, s) => setS(s)); return () => data.subscription.unsubscribe() }, [])
  useEffect(() => { try { setDark(localStorage.getItem('theme') === 'dark') } catch {} }, [])
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); try { localStorage.setItem('theme', dark ? 'dark' : 'light') } catch {} }, [dark])
  const toggleDark = () => setDark(d => !d)
  if (session === undefined) return <Spinner />
  if (view === 'landing') return <Landing loggedIn={!!session} dark={dark} toggleDark={toggleDark} onOpen={t => { setTab(t); setView('app') }} />
  return session ? <App key={tab} initialTab={tab} onHome={() => setView('landing')} dark={dark} toggleDark={toggleDark} /> : <Auth back={() => setView('landing')} />
}
