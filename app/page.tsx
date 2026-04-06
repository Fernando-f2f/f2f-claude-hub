'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const LEVEL_COLORS = {
  'Iniciante': 'bg-green-100 text-green-800',
  'Intermediario': 'bg-yellow-100 text-yellow-800',
  'Avancado': 'bg-red-100 text-red-800',
}

const TABS = [
  { id: 'prompts', label: 'Prompts' },
  { id: 'videos', label: 'Videos' },
  { id: 'courses', label: 'Cursos' },
  { id: 'recommendations', label: 'Recomendacoes' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState('prompts')
  const [search, setSearch] = useState('')
  const [data, setData] = useState({ prompts: [], videos: [], courses: [], recommendations: [] })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      const [p, v, c, r] = await Promise.all([
        supabase.from('prompts').select('*').order('created_at', { ascending: false }),
        supabase.from('videos').select('*').order('created_at', { ascending: false }),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('recommendations').select('*').order('created_at', { ascending: false }),
      ])
      setData({
        prompts: p.data || [],
        videos: v.data || [],
        courses: c.data || [],
        recommendations: r.data || [],
      })
      setLoading(false)
    }
    loadAll()
  }, [])

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const filtered = (items) =>
    items.filter((item) => {
      const q = search.toLowerCase()
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      )
    })

  const currentItems = filtered(data[activeTab] || [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">F2</div>
          <div>
            <h1 className="text-lg font-bold text-white">F2F Claude HUB</h1>
            <p className="text-xs text-slate-400">Base de conhecimento sobre Claude AI</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por titulo, descricao ou tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded-full">
                {filtered(data[tab.id] || []).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-slate-400">Carregando...</span>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">Nenhum resultado encontrado</p>
            <p className="text-sm mt-2">Tente outro termo de busca</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {currentItems.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-white text-base leading-snug">{item.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.level && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_COLORS[item.level] || 'bg-slate-700 text-slate-300'}`}>
                        {item.level}
                      </span>
                    )}
                    {activeTab === 'prompts' && item.content && (
                      <button
                        onClick={() => handleCopy(item.content, item.id)}
                        className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                      >
                        {copied === item.id ? 'Copiado!' : 'Copiar'}
                      </button>
                    )}
                    {(activeTab === 'videos' || activeTab === 'courses' || activeTab === 'recommendations') && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium"
                      >
                        Abrir
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                {activeTab === 'prompts' && item.content && (
                  <div className="bg-slate-950 rounded-lg p-3 text-xs text-slate-300 font-mono leading-relaxed border border-slate-800 max-h-32 overflow-y-auto">
                    {item.content.substring(0, 300)}{item.content.length > 300 ? '...' : ''}
                  </div>
                )}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
