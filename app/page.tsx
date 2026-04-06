'use client'
import { useEffect, useState } from 'react'
import { supabase, type Prompt, type Video, type Course, type Recommendation } from '@/lib/supabase'
const LEVEL_COLORS = { 'Iniciante': 'bg-green-100 text-green-800', 'Intermediário': 'bg-yellow-100 text-yellow-800', 'Avançado': 'bg-red-100 text-red-800' }
const TABS = [{ id: 'prompts', label: '🤖 Prompts' }, { id: 'videos', label: '🎥 Vídeos' }, { id: 'courses', label: '📚 Cursos' }, { id: 'recommendations', label: '💡 Recomendações' }]
export default function Home() {
  const [activeTab, setActiveTab] = useState('prompts')
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<number | null>(null)
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [p, v, c, r] = await Promise.all([
        supabase.from('prompts').select('*').order('created_at', { ascending: false }),
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').order('created_at', { ascending: false }),
      ])
      if (p.data) setPrompts(p.data)
      if (v.data) setVideos(v.data)
      if (c.data) setCourses(c.data)
      if (r.data) setRecommendations(r.data)
      setLoading(false)
    }
    loadData()
  }, [])
  const handleCopy = (text: string, id: number) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000) }
  const filter = <T extends { title: string; description?: string; tags?: string[] }>(items: T[]) =>
    items.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || (i.description||'').toLowerCase().includes(search.toLowerCase()) || (i.tags||[]).some(t => t.toLowerCase().includes(search.toLowerCase())))
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">F</div>
            <div><h1 className="text-xl font-bold text-slate-900">F2F Claude HUB</h1><p className="text-xs text-slate-500">Repositório de conhecimento sobre Claude AI</p></div>
          </div>
          <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:w-72 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === tab.id ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-orange-50 border border-slate-200'}`}>{tab.label}</button>
          ))}
        </div>
        {loading ? <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" /></div> : (
          <>
            {activeTab === 'prompts' && <div className="grid gap-4 md:grid-cols-2">{filter(prompts).map(p => (
              <div key={p.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3"><h3 className="font-semibold text-slate-900">{p.title}</h3><span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${LEVEL_COLORS[p.level]}`}>{p.level}</span></div>
                <p className="text-sm text-slate-500 mb-3">{p.description}</p>
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 mb-3 max-h-32 overflow-y-auto font-mono leading-relaxed">{p.content}</div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5 flex-wrap">{(p.tags||[]).map(t => <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{t}</span>)}</div>
                  <button onClick={() => handleCopy(p.content, p.id)} className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors shrink-0">{copied === p.id ? '✓ Copiado!' : 'Copiar'}</button>
                </div>
              </div>
            ))}</div>}
            {activeTab === 'videos' && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filter(videos).map(v => (
              <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-shadow block group">
                <div className="w-full h-32 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-4xl group-hover:bg-orange-50 transition-colors">🎥</div>
                <div className="flex items-start justify-between gap-2 mb-2"><h3 className="font-semibold text-slate-900 text-sm group-hover:text-orange-600">{v.title}</h3><span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${LEVEL_COLORS[v.level]}`}>{v.level}</span></div>
                <p className="text-xs text-slate-500 mb-2">{v.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>{v.channel}</span><span>{v.duration_minutes} min</span></div>
              </a>
            ))}</div>}
            {activeTab === 'courses' && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filter(courses).map(c => (
              <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-shadow block group">
                <div className="w-full h-24 bg-slate-100 rounded-xl mb-3 flex items-center justify-center text-4xl group-hover:bg-orange-50 transition-colors">📚</div>
                <div className="flex items-start justify-between gap-2 mb-2"><h3 className="font-semibold text-slate-900 text-sm group-hover:text-orange-600">{c.title}</h3><span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${LEVEL_COLORS[c.level]}`}>{c.level}</span></div>
                <p className="text-xs text-slate-500 mb-2">{c.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>{c.provider}</span><span>{c.duration_hours}h</span></div>
              </a>
            ))}</div>}
            {activeTab === 'recommendations' && <div className="grid gap-4 md:grid-cols-2">{filter(recommendations).map(r => (
              <div key={r.id} className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2"><h3 className="font-semibold text-slate-900">{r.title}</h3><span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${LEVEL_COLORS[r.level]}`}>{r.level}</span></div>
                {r.category && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mb-2 inline-block">{r.category}</span>}
                <p className="text-sm text-slate-500 mb-3">{r.description}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{r.content}</p>
                <div className="mt-3 flex gap-1.5 flex-wrap">{(r.tags||[]).map(t => <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{t}</span>)}</div>
              </div>
            ))}</div>}
          </>
        )}
        <footer className="mt-12 py-8 text-center text-sm text-slate-400">F2F Claude HUB · F2F Digital</footer>
      </div>
    </div>
  )
}