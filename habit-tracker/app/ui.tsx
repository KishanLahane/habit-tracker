'use client'
import { Sunrise, Brain, Activity, Footprints, Dumbbell, Target, ClipboardList, BookOpen } from 'lucide-react'
import { iso } from '@/lib/supabase'

export const card = 'card-x rounded-2xl bg-white/90 dark:bg-[#141A2E]/90 backdrop-blur p-4 border border-slate-200/70 dark:border-white/10 shadow-sm'
export const inp = 'w-full rounded-xl bg-slate-100/80 dark:bg-white/5 border border-transparent p-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 placeholder:text-slate-400'
export const btn = 'w-full rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[.98] disabled:opacity-60'
export const since = (n: number) => iso(new Date(Date.now() - (n - 1) * 864e5))

// slug -> [icon, colorFrom, colorTo]
export const HC: Record<string, [any, string, string]> = {
  wake: [Sunrise, '#FB923C', '#F59E0B'], meditation: [Brain, '#A855F7', '#7C3AED'], exercise: [Activity, '#FB7185', '#E11D48'],
  gate3: [BookOpen, '#38BDF8', '#2563EB'], gate5: [BookOpen, '#38BDF8', '#2563EB'], gate7: [BookOpen, '#38BDF8', '#2563EB'],
  walking: [Footprints, '#34D399', '#059669'], gym: [Dumbbell, '#F87171', '#DC2626'], pyq: [Target, '#818CF8', '#4F46E5'], plan: [ClipboardList, '#FBBF24', '#D97706'],
}
export const hc = (slug: string): [any, string, string] => HC[slug] || [Target, '#94A3B8', '#64748B']

export const Burst = ({ c }: { c: string }) => <span className="pointer-events-none absolute inset-0">{Array.from({ length: 10 }, (_, i) => { const a = i / 10 * 6.283; return <i key={i} className="burst-p" style={{ '--x': Math.cos(a) * 34 + 'px', '--y': Math.sin(a) * 34 + 'px', background: i % 2 ? c : '#FBBF24' } as any} /> })}</span>

export const Spinner = () => <div className="grid min-h-[40vh] place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>

export const Stat = ({ v, l, I, a, b }: { v: any; l: string; I: any; a: string; b: string }) =>
  <div className={card + ' flex items-center gap-3'}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white shadow-md" style={{ background: `linear-gradient(135deg,${a},${b})` }}><I size={20} /></span>
    <div className="min-w-0"><b className="block truncate text-xl leading-tight">{v}</b><p className="truncate text-xs text-slate-500">{l}</p></div></div>

export const Tip = ({ active, payload, label, unit = '' }: any) => active && payload?.length ?
  <div className="rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-xs text-white shadow-xl"><p className="mb-0.5 text-slate-300">{payload[0].payload.full || label}</p><p className="text-sm font-bold">{payload[0].value ?? '–'}{unit}</p></div> : null

export const PageTitle = ({ I, t, s, a, b }: { I: any; t: string; s: string; a: string; b: string }) =>
  <div className="mb-1 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg,${a},${b})` }}><I size={22} /></span><div><h2 className="text-xl font-extrabold leading-tight">{t}</h2><p className="text-xs text-slate-500">{s}</p></div></div>
