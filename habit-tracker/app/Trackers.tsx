'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { sb, iso } from '@/lib/supabase'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from 'recharts'
import { Target, CheckCircle2, Percent, Footprints, Timer, Dumbbell, Scale, Flame, Check, X } from 'lucide-react'
import { card, inp, btn, since, hc, Stat, Tip, PageTitle } from './ui'

async function markHabit(slug: string) {
  const { data: h } = await sb.from('habits').select('id,target').eq('slug', slug).single()
  if (h) await sb.from('daily_habit_logs').upsert({ habit_id: h.id, log_date: iso(), completed: true, value: h.target }, { onConflict: 'habit_id,log_date' })
}
const Err = ({ m }: { m: string }) => m ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{m}</p> : null
const Field = ({ l, children }: { l: string; children: any }) => <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-500">{l}</span>{children}</label>
const grid = { strokeDasharray: '3 3', vertical: false, stroke: '#94A3B8', strokeOpacity: 0.25 }

export function Pyq() {
  const [rows, setR] = useState<any[]>([]), [f, setF] = useState({ subject: '', topic: '', attempted: '', correct: '', minutes: '' }), [err, setErr] = useState(''), [ok, setOk] = useState(false)
  const load = useCallback(async () => { const { data, error } = await sb.from('pyq_records').select('*').gte('log_date', since(30)).order('log_date', { ascending: false }); if (error) setErr(error.message); setR(data || []) }, [])
  useEffect(() => { load() }, [load])
  const save = async () => {
    const a = +f.attempted, c = +f.correct
    if (!(a > 0) || c < 0 || c > a) return setErr('Attempted must be above 0 and correct cannot exceed attempted.')
    setErr('')
    const { error } = await sb.from('pyq_records').insert({ topic: f.subject + (f.topic ? ' / ' + f.topic : ''), attempted: a, correct: c, minutes: +f.minutes || 0 })
    if (error) return setErr(error.message)
    await markHabit('pyq'); setF({ subject: '', topic: '', attempted: '', correct: '', minutes: '' }); setOk(true); setTimeout(() => setOk(false), 1800); load()
  }
  const A = rows.reduce((s, r) => s + r.attempted, 0), C = rows.reduce((s, r) => s + r.correct, 0)
  const byDay = Array.from({ length: 14 }, (_, i) => { const d = since(14 - i); const x = rows.filter(r => r.log_date === d); const a = x.reduce((s, r) => s + r.attempted, 0); return { d: d.slice(8), full: new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), acc: a ? Math.round(x.reduce((s, r) => s + r.correct, 0) / a * 100) : null } })
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value })
  return <div className="space-y-4">
    <PageTitle I={Target} t="PYQ Practice" s="Track accuracy question by question" a="#818CF8" b="#4F46E5" /><Err m={err} />
    <div className="stagger grid grid-cols-1 gap-3 sm:grid-cols-3"><Stat I={Target} v={A} l="Attempted (30d)" a="#818CF8" b="#4F46E5" /><Stat I={CheckCircle2} v={C} l="Correct" a="#34D399" b="#059669" /><Stat I={Percent} v={A ? Math.round(C / A * 100) + '%' : '–'} l="Accuracy" a="#E879F9" b="#9333EA" /></div>
    <div className={card + ' space-y-3'}><p className="font-bold">Log a practice set</p>
      <div className="grid gap-3 sm:grid-cols-2"><Field l="Subject"><input className={inp} placeholder="e.g. Algorithms" value={f.subject} onChange={set('subject')} /></Field><Field l="Topic"><input className={inp} placeholder="e.g. Graphs" value={f.topic} onChange={set('topic')} /></Field></div>
      <div className="grid grid-cols-3 gap-3"><Field l="Attempted"><input className={inp} type="number" min="0" value={f.attempted} onChange={set('attempted')} /></Field><Field l="Correct"><input className={inp} type="number" min="0" value={f.correct} onChange={set('correct')} /></Field><Field l="Minutes"><input className={inp} type="number" min="0" value={f.minutes} onChange={set('minutes')} /></Field></div>
      <button className={btn} onClick={save}>{ok ? 'Saved ✓' : 'Save PYQ practice'}</button></div>
    <div className={card}><p className="mb-3 font-bold">Accuracy trend <span className="text-xs font-normal text-slate-500">· 14 days</span></p><div className="h-48"><ResponsiveContainer><AreaChart data={byDay} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
      <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1" stopOpacity={0.45} /><stop offset="100%" stopColor="#6366F1" stopOpacity={0} /></linearGradient></defs>
      <CartesianGrid {...grid} /><XAxis dataKey="d" fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" /><YAxis domain={[0, 100]} fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" tickFormatter={v => v + '%'} />
      <Tooltip content={<Tip unit="%" />} /><Area dataKey="acc" stroke="#6366F1" strokeWidth={3} fill="url(#ga)" connectNulls dot={{ r: 3, fill: '#6366F1' }} animationDuration={900} /></AreaChart></ResponsiveContainer></div></div>
    <div className={card}><p className="mb-2 font-bold">Recent sets</p><div className="divide-y divide-slate-200/70 dark:divide-white/10">{rows.slice(0, 8).map(r => { const p = r.attempted ? Math.round(r.correct / r.attempted * 100) : 0, col = p >= 70 ? '#10B981' : p >= 40 ? '#F59E0B' : '#F43F5E'
      return <div key={r.id} className="flex items-center gap-3 py-2.5"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{r.topic || 'PYQ'}</p><p className="text-xs text-slate-500">{r.log_date.slice(5)} · {r.correct}/{r.attempted} · {r.minutes}m</p><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full transition-all duration-700" style={{ width: p + '%', background: col }} /></div></div>
        <span className="rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: col }}>{p}%</span></div> })}{!rows.length && <p className="py-3 text-sm text-slate-400">No records yet.</p>}</div></div></div>
}

export function Fitness() {
  const [walks, setW] = useState<any[]>([]), [sess, setS] = useState<any[]>([]), [wt, setWt] = useState<any[]>([]), [err, setErr] = useState('')
  const [w, setWF] = useState({ minutes: '', steps: '', km: '' }), [g, setG] = useState({ muscle: '', duration: '', ex: '' }), [kg, setKg] = useState('')
  const load = useCallback(async () => {
    const a = await sb.from('walking_sessions').select('*').gte('log_date', since(30)), b = await sb.from('workout_sessions').select('*').gte('log_date', since(30)), c = await sb.from('weight_records').select('*').order('log_date')
    const e = a.error || b.error || c.error; if (e) setErr(e.message); setW(a.data || []); setS(b.data || []); setWt(c.data || [])
  }, [])
  useEffect(() => { load() }, [load])
  const fail = (e: any) => { if (e) setErr(e.message); return !!e }
  const saveWalk = async () => { if (!+w.minutes && !+w.km) return setErr('Enter minutes or km.'); setErr(''); if (fail((await sb.from('walking_sessions').insert({ minutes: +w.minutes || 0, steps: +w.steps || 0, km: +w.km || 0 })).error)) return; await markHabit('walking'); setWF({ minutes: '', steps: '', km: '' }); load() }
  const saveGym = async () => {
    setErr(''); const { data, error } = await sb.from('workout_sessions').insert({ muscle_group: g.muscle, duration_min: +g.duration || 0 }).select().single(); if (fail(error)) return
    const lines = g.ex.split('\n').map(l => l.split(',').map(x => x.trim())).filter(l => l[0])
    if (lines.length && fail((await sb.from('workout_exercises').insert(lines.map(l => ({ session_id: data.id, name: l[0], sets: +l[1] || null, reps: +l[2] || null, weight_kg: +l[3] || null })))).error)) return
    await markHabit('gym'); setG({ muscle: '', duration: '', ex: '' }); load()
  }
  const saveWt = async () => { if (!(+kg > 20)) return setErr('Enter a valid weight in kg.'); setErr(''); if (fail((await sb.from('weight_records').upsert({ log_date: iso(), kg: +kg }, { onConflict: 'user_id,log_date' })).error)) return; setKg(''); load() }
  const wk = since(7), km7 = walks.filter(x => x.log_date >= wk).reduce((s, x) => s + Number(x.km), 0), min7 = walks.filter(x => x.log_date >= wk).reduce((s, x) => s + x.minutes, 0), wo7 = sess.filter(s => s.log_date >= wk).length
  const kmDay = Array.from({ length: 14 }, (_, i) => { const d = since(14 - i); return { d: d.slice(8), full: new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), km: +walks.filter(x => x.log_date === d).reduce((s, x) => s + Number(x.km), 0).toFixed(2) } })
  const last = wt.length ? Number(wt[wt.length - 1].kg) : null
  const ss = (o: any, set: any, k: string) => (e: any) => set({ ...o, [k]: e.target.value })
  const sec = 'card-x rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#141A2E]/90 space-y-3'
  return <div className="gym-bg -mx-2 rounded-3xl p-2"><div className="space-y-4">
    <div className="anim-grad relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-800 bg-[length:200%_200%] p-6 text-white shadow-xl">
      <Dumbbell className="anim-float absolute -right-4 -top-4 h-40 w-40 rotate-[-25deg] text-white/10" />
      <p className="text-sm text-white/70">This week</p><h2 className="text-2xl font-extrabold">Stay strong 💪</h2>
      <div className="relative mt-4 grid grid-cols-3 gap-3">{[[km7.toFixed(1), 'km walked', Footprints], [min7, 'walk minutes', Timer], [wo7, 'workouts', Flame]].map(([v, l, I]: any) => <div key={l} className="rounded-2xl bg-white/10 p-3 backdrop-blur"><I size={18} className="mb-1 text-amber-300" /><b className="block text-xl leading-tight">{v}</b><span className="text-[11px] text-white/70">{l}</span></div>)}</div></div>
    <Err m={err} />
    <div className={sec}><div className="flex items-center gap-2 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"><Footprints size={18} /></span>Walking</div>
      <div className="grid grid-cols-3 gap-2"><Field l="Minutes"><input className={inp} type="number" min="0" value={w.minutes} onChange={ss(w, setWF, 'minutes')} /></Field><Field l="Steps"><input className={inp} type="number" min="0" value={w.steps} onChange={ss(w, setWF, 'steps')} /></Field><Field l="Km"><input className={inp} type="number" min="0" step="0.1" value={w.km} onChange={ss(w, setWF, 'km')} /></Field></div>
      <button className={btn} onClick={saveWalk}>Add walk</button>
      <div className="h-36"><ResponsiveContainer><BarChart data={kmDay} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}><defs><linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34D399" /><stop offset="100%" stopColor="#059669" /></linearGradient></defs><CartesianGrid {...grid} /><XAxis dataKey="d" fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" /><YAxis fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" /><Tooltip cursor={{ fill: 'rgba(16,185,129,.08)' }} content={<Tip unit=" km" />} /><Bar dataKey="km" fill="url(#gw)" radius={[8, 8, 3, 3]} maxBarSize={24} minPointSize={2} /></BarChart></ResponsiveContainer></div></div>
    <div className={sec}><div className="flex items-center gap-2 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-400 to-red-600 text-white"><Dumbbell size={18} /></span>Gym / home workout</div>
      <div className="grid grid-cols-2 gap-2"><Field l="Muscle group"><input className={inp} placeholder="Push, Legs…" value={g.muscle} onChange={ss(g, setG, 'muscle')} /></Field><Field l="Duration (min)"><input className={inp} type="number" min="0" value={g.duration} onChange={ss(g, setG, 'duration')} /></Field></div>
      <Field l="Exercises: name, sets, reps, kg (one per line)"><textarea className={inp} rows={4} placeholder={'Push-ups, 4, 12, 0\nBench press, 3, 8, 40'} value={g.ex} onChange={ss(g, setG, 'ex')} /></Field><button className={btn} onClick={saveGym}>Save workout</button>
      <div className="flex flex-wrap gap-2">{sess.slice(-6).reverse().map(s => <span key={s.id} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">{s.log_date.slice(5)} · {s.muscle_group || 'Workout'} · {s.duration_min}m</span>)}</div></div>
    <div className={sec}><div className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white"><Scale size={18} /></span>Weight</span>{last && <span className="text-sm text-slate-500">now <b className="text-slate-900 dark:text-white">{last} kg</b> · target 75–80</span>}</div>
      <div className="flex gap-2"><input className={inp} type="number" step="0.1" placeholder="Today's weight (kg)" value={kg} onChange={e => setKg(e.target.value)} /><button className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 font-semibold text-white transition active:scale-95" onClick={saveWt}>Save</button></div>
      {wt.length > 0 && <div className="h-44"><ResponsiveContainer><LineChart data={wt.map(x => ({ d: x.log_date.slice(5), full: x.log_date, kg: Number(x.kg) }))} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}><CartesianGrid {...grid} /><XAxis dataKey="d" fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" /><YAxis domain={['dataMin - 2', 'dataMax + 2']} fontSize={11} tickLine={false} axisLine={false} stroke="#94A3B8" /><Tooltip content={<Tip unit=" kg" />} /><ReferenceArea y1={75} y2={80} fill="#10B981" fillOpacity={0.15} /><Line dataKey="kg" stroke="#F97316" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>}</div></div></div>
}

async function fetchLogs(from: string) {
  let all: any[] = [], p = 0
  for (;;) { const { data, error } = await sb.from('daily_habit_logs').select('habit_id,log_date,completed').gte('log_date', from).range(p * 1000, p * 1000 + 999); if (error) throw error; all = all.concat(data || []); if ((data || []).length < 1000) return all; p++ }
}

export function History() {
  const [habits, setH] = useState<any[]>([]), [logs, setL] = useState<any[]>([]), [sel, setSel] = useState(iso()), [audit, setA] = useState<any[]>([]), [err, setErr] = useState('')
  const sc = useRef<HTMLDivElement>(null)
  const load = useCallback(async () => {
    try {
      const h = await sb.from('habits').select('*').eq('active', true).order('sort'), a = await sb.from('habit_audit').select('*').order('changed_at', { ascending: false }).limit(200)
      if (h.error) throw h.error; setH(h.data || []); setA(a.data || []); setL(await fetchLogs(since(371)))
    } catch (e: any) { setErr(e.message) }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => { if (sc.current) sc.current.scrollLeft = sc.current.scrollWidth }, [logs.length])
  const cnt = (d: string) => logs.filter(l => l.log_date === d && l.completed).length
  const toggle = async (h: any) => { const cur = logs.find(l => l.habit_id === h.id && l.log_date === sel); const { error } = await sb.from('daily_habit_logs').upsert({ habit_id: h.id, log_date: sel, completed: !cur?.completed, value: !cur?.completed ? h.target : 0 }, { onConflict: 'habit_id,log_date' }); if (error) setErr(error.message); load() }

  const counts = new Map<string, number>(); logs.forEach(l => { if (l.completed) counts.set(l.log_date, (counts.get(l.log_date) || 0) + 1) })
  const todayD = new Date(iso() + 'T00:00:00'), startD = new Date(todayD); startD.setDate(startD.getDate() - 364); startD.setDate(startD.getDate() - startD.getDay())
  const weeks: { d: string; future: boolean }[][] = []
  for (let c = new Date(startD); c <= todayD; ) { const col = []; for (let i = 0; i < 7; i++) { col.push({ d: iso(c), future: c > todayD }); c = new Date(c); c.setDate(c.getDate() + 1) } weeks.push(col) }
  const lvl = (d: string) => { const n = counts.get(d) || 0; if (!n) return 0; const r = n / (habits.length || 1); return r > 0.75 ? 4 : r > 0.5 ? 3 : r > 0.25 ? 2 : 1 }
  const COL = ['bg-slate-200/80 dark:bg-white/[.07]', 'bg-emerald-200 dark:bg-emerald-900', 'bg-emerald-300 dark:bg-emerald-700', 'bg-emerald-500', 'bg-emerald-700 dark:bg-emerald-400']
  const all = weeks.flat().filter(x => !x.future), total = all.reduce((s, x) => s + (counts.get(x.d) || 0), 0), active = all.filter(x => counts.get(x.d)).length
  let best = 0, run = 0; all.forEach(x => { if (counts.get(x.d)) { run++; best = Math.max(best, run) } else run = 0 })
  let cur = 0; for (let i = all.length - 1; i >= 0; i--) { if (counts.get(all[i].d)) cur++; else if (i !== all.length - 1) break }
  const months = weeks.map((w, i) => { const m = new Date(w[0].d + 'T00:00:00'); return i === 0 || m.getMonth() !== new Date(weeks[i - 1][0].d + 'T00:00:00').getMonth() ? m.toLocaleDateString('en-IN', { month: 'short' }) : '' })
  return <div className="space-y-4"><PageTitle I={Flame} t="History" s="Your consistency over the last year" a="#34D399" b="#059669" /><Err m={err} />
    <div className="stagger grid grid-cols-3 gap-3 text-center">{[[total, 'habits completed', 'text-emerald-600'], [active, 'active days', 'text-indigo-600'], [cur + ' / ' + best, 'current / best streak', 'text-orange-500']].map(([v, l, c]) => <div key={l as string} className={card}><b className={'text-xl ' + c}>{v}</b><p className="text-[11px] text-slate-500">{l}</p></div>)}</div>
    <div className={card}><p className="mb-3 font-bold">{total} habits completed in the last year</p>
      <div ref={sc} className="overflow-x-auto pb-2"><div className="inline-flex gap-1">
        <div className="mr-1 flex flex-col justify-between pt-5 text-[10px] text-slate-400" style={{ height: 118 }}>{['', 'Mon', '', 'Wed', '', 'Fri', ''].map((t, i) => <span key={i} className="h-[14px] leading-[14px]">{t}</span>)}</div>
        {weeks.map((w, i) => <div key={i} className="flex flex-col gap-[3px]"><span className="h-4 text-[10px] leading-4 text-slate-400">{months[i]}</span>{w.map(x => x.future ? <i key={x.d} className="h-[14px] w-[14px]" /> : <button key={x.d} onClick={() => setSel(x.d)} title={`${x.d} · ${counts.get(x.d) || 0}/${habits.length} done`} aria-label={x.d} className={'hm-cell h-[14px] w-[14px] rounded-[3px] ' + COL[lvl(x.d)] + (x.d === sel ? ' ring-2 ring-indigo-500 ring-offset-1 ring-offset-transparent' : '')} />)}</div>)}</div></div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-slate-500">Less{COL.map((c, i) => <i key={i} className={'h-3 w-3 rounded-[3px] ' + c} />)}More</div></div>
    <div className={card + ' space-y-2'}><div className="flex items-center justify-between"><b>{new Date(sel + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</b><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">{cnt(sel)}/{habits.length}</span></div>
      {habits.map(h => { const ok = logs.find(l => l.habit_id === h.id && l.log_date === sel)?.completed, [I, a, b] = hc(h.slug); return <button key={h.id} disabled={h.slug.startsWith('gate')} onClick={() => toggle(h)} className="flex w-full items-center justify-between rounded-xl bg-slate-50 p-3 text-left transition hover:bg-slate-100 active:scale-[.99] disabled:opacity-70 dark:bg-white/5 dark:hover:bg-white/10"><span className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-lg text-white" style={{ background: `linear-gradient(135deg,${a},${b})` }}><I size={16} /></span><span className={ok ? '' : 'text-slate-500'}>{h.name}</span></span>{ok ? <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600"><Check size={16} />Done</span> : <span className="flex items-center gap-1 text-sm text-slate-400"><X size={16} />Not done</span>}</button> })}
      <p className="text-xs text-slate-500">Edits to past days are saved with an audit record ({audit.filter(a => a.log_date === sel).length} change(s) on this day).</p></div></div>
}
