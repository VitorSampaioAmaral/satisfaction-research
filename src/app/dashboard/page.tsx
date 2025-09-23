'use client'

import React, { useEffect, useState } from 'react'

interface Stats {
  totalResponses: number
  totalUsers: number
  averageScore: number
}

interface RecentItem {
  id: string
  totalScore: number
  completedAt: string
  user: { id: string; email: string; name: string }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [categories, setCategories] = useState<{ category: string; average: number }[]>([])
  const [distribution, setDistribution] = useState<{ label: string; count: number }[]>([])
  const [timeline, setTimeline] = useState<{ date: string; average: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [catSort, setCatSort] = useState<'avgDesc' | 'avgAsc' | 'alpha'>('avgDesc')
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'categories' | 'recent'>('overview')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, r, c, d, t] = await Promise.all([
          fetch('/api/dashboard/stats').then(res => res.json()),
          fetch('/api/dashboard/recent').then(res => res.json()),
          fetch('/api/dashboard/categories').then(res => res.json()),
          fetch('/api/dashboard/distribution').then(res => res.json()),
          fetch('/api/dashboard/timeline').then(res => res.json()),
        ])
        setStats(s)
        setRecent(r)
        setCategories(c)
        setDistribution(d)
        setTimeline(t)
      } catch (e) {
        console.error('Erro ao carregar dashboard', e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-slate-300">Carregando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 bg-slate-950 min-h-screen">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-100 tracking-tight">Dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TabButton label="Visão geral" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <TabButton label="Gráficos" active={activeTab === 'charts'} onClick={() => setActiveTab('charts')} />
          <TabButton label="Categorias" active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
          <TabButton label="Recentes" active={activeTab === 'recent'} onClick={() => setActiveTab('recent')} />
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Respostas" value={stats?.totalResponses ?? 0} />
            <Card title="Usuários" value={stats?.totalUsers ?? 0} />
            <Card title="Média" value={(stats?.averageScore ?? 0).toFixed(2)} />
          </div>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h2 className="text-slate-100 text-base md:text-lg font-medium mb-4">Timeline</h2>
              <div className="w-full overflow-x-auto">
                <div className="flex items-end gap-3 h-48">
                  {timeline.map((t) => (
                    <div key={t.date} className="flex flex-col items-center">
                      <div className="w-6 bg-blue-500 rounded transition-all duration-700 ease-out" style={{ height: `${Math.min(100, (t.average / 30) * 100)}%` }} />
                      <div className="text-[11px] text-slate-400 mt-1">{new Date(t.date).toLocaleDateString('pt-BR')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <h2 className="text-slate-100 text-base md:text-lg font-medium mb-4">Satisfação (Rosca)</h2>
              <DonutChart percent={Math.max(0, Math.min(100, ((stats?.averageScore ?? 0) / 30) * 100))} />
              <p className="mt-4 text-center text-slate-400 text-sm">Média geral baseada em 30 pontos</p>
            </div>
          </section>
        </>
      )}

      {activeTab === 'charts' && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <h2 className="text-slate-100 text-base md:text-lg font-medium mb-4">Distribuição (Pizza)</h2>
            <PieChart data={distribution} />
            <div className="mt-5 grid grid-cols-3 gap-3">
              {distribution.map((b, i) => (
                <div key={b.label} className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-sm text-slate-300">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <h2 className="text-slate-100 text-base md:text-lg font-medium mb-4">Comparativo (Categoria vs Geral)</h2>
            <div className="space-y-4">
              {categories
                .slice()
                .sort((a, b) => b.average - a.average)
                .slice(0, 6)
                .map((c) => {
                  const overall = stats?.averageScore ?? 0
                  const cPct = Math.min(100, (c.average / 30) * 100)
                  const oPct = Math.min(100, (overall / 30) * 100)
                  return (
                    <div key={c.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-slate-200 text-sm md:text-base">{c.category}</span>
                        <span className="text-slate-400 text-xs md:text-sm">{c.average.toFixed(2)}</span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded relative overflow-hidden">
                        <div className="absolute inset-y-0 left-0 bg-slate-700" style={{ width: `${oPct}%` }} />
                        <div className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-700 ease-out" style={{ width: `${cPct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
            <h2 className="text-slate-100 text-base md:text-lg font-medium mb-4">Satisfação (Rosca)</h2>
            <DonutChart percent={Math.max(0, Math.min(100, ((stats?.averageScore ?? 0) / 30) * 100))} />
            <p className="mt-4 text-center text-slate-400 text-sm">Média geral baseada em 30 pontos</p>
          </div>
        </section>
      )}

      {activeTab === 'categories' && (
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-slate-100 text-base md:text-lg font-medium">Média por categoria</h2>
            <select
              className="bg-slate-900 text-slate-200 text-sm rounded px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              value={catSort}
              onChange={(e) => setCatSort(e.target.value as any)}
            >
              <option value="avgDesc">Maior média</option>
              <option value="avgAsc">Menor média</option>
              <option value="alpha">Alfabética</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories
              .slice()
              .sort((a, b) => {
                if (catSort === 'alpha') return a.category.localeCompare(b.category)
                if (catSort === 'avgAsc') return a.average - b.average
                return b.average - a.average
              })
              .map((c) => (
                <div key={c.category} className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-200 text-base">{c.category}</span>
                    <span className="text-slate-100 text-lg font-semibold">{c.average.toFixed(2)}</span>
                  </div>
                  <div className="mt-3 h-3 bg-slate-700 rounded overflow-hidden">
                    <div className="h-3 bg-blue-500 rounded transition-all duration-700 ease-out" style={{ width: `${Math.min(100, (c.average / 30) * 100)}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {activeTab === 'recent' && (
        <section className="bg-white rounded-xl border border-stone-200 p-5">
          <h2 className="text-blue-900 text-base md:text-lg font-medium mb-4">Respostas recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-stone-600 text-sm">
                  <th className="py-3 pr-4 font-medium">Usuário</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Pontuação</th>
                  <th className="py-3 pr-4 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id} className="border-t border-stone-200 hover:bg-amber-50 transition">
                    <td className="py-3 pr-4 text-stone-800 text-base">{item.user?.name ?? '—'}</td>
                    <td className="py-3 pr-4 text-stone-700">{item.user?.email ?? '—'}</td>
                    <td className="py-3 pr-4 text-blue-700 font-semibold">{item.totalScore}</td>
                    <td className="py-3 pr-4 text-stone-600">{new Date(item.completedAt).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}

function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-sm">
      <div className="text-slate-400 text-lg">{title}</div>
      <div className="text-slate-100 text-3xl md:text-4xl font-semibold">{value}</div>
    </div>
  )
}

const PIE_COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#a78bfa']

function PieChart({ data }: { data: { label: string; count: number }[] }) {
  const total = data.reduce((acc, d) => acc + d.count, 0) || 1
  let current = 0
  const stops = data.map((d, i) => {
    const value = (d.count / total) * 360
    const start = current
    const end = current + value
    current = end
    return `${PIE_COLORS[i % PIE_COLORS.length]} ${start}deg ${end}deg`
  })
  const bg = `conic-gradient(${stops.join(',')})`
  return (
    <div className="flex items-center justify-center">
      <div
        className="w-44 h-44 md:w-56 md:h-56 rounded-full shadow-inner transition-all duration-700 ease-out"
        style={{ background: bg }}
      />
    </div>
  )
}

function DonutChart({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent))
  const bg = `conic-gradient(#22c55e ${clamped}%, #334155 ${clamped}% 100%)`
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-44 h-44 md:w-56 md:h-56">
        <div className="absolute inset-0 rounded-full transition-all duration-700 ease-out" style={{ background: bg }} />
        <div className="absolute inset-3 md:inset-4 bg-slate-800 rounded-full border border-slate-700" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-slate-100 text-2xl md:text-3xl font-semibold">{Math.round(clamped)}%</span>
        </div>
      </div>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm md:text-base transition border ${
        active
          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
          : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
      }`}
    >
      {label}
    </button>
  )
}


