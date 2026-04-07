'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type TableName = 'novidades' | 'prompts' | 'videos' | 'courses' | 'recommendations'

const TABS: { id: TableName; label: string; icon: string }[] = [
  { id: 'novidades', label: 'Novidades', icon: '✨' },
  { id: 'prompts', label: 'Prompts', icon: '🤖' },
  { id: 'videos', label: 'Videos', icon: '🎥' },
  { id: 'courses', label: 'Cursos', icon: '📚' },
  { id: 'recommendations', label: 'Recomendacoes', icon: '💡' },
]

const LEVEL_COLORS: Record<string, string> = {
  Iniciante: 'bg-green-900 text-green-300',
  Intermediario: 'bg-yellow-900 text-yellow-300',
  Avancado: 'bg-red-900 text-red-300',
}

const CACHE_TTL = 5 * 60 * 1000
const cache: Record<string, { data: any[]; ts: number }> = {}

const PAGE_SIZE = 20

function formatDate(dateStr: string) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  } catch {
    return dateStr
  }
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TableName>('novidades')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [copied, setCopied] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [darkMode, setDarkMode] = useState(true)

  const loadItems = async (tab: TableName) => {
    if (tab === 'novidades') {
      await loadNovidades()
      return
    }
    const cacheKey = tab
    const now = Date.now()
    if (cache[cacheKey] && now - cache[cacheKey].ts < CACHE_TTL) {
      setItems(cache[cacheKey].data)
      setTotalCount(cache[cacheKey].data.length)
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from(tab)
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) {
      cache[cacheKey] = { data, ts: now }
      setItems(data)
      setTotalCount(data.length)
    }
    setLoading(false)
  }

  const loadNovidades = async () => {
    setLoading(true)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const tables = ['prompts', 'videos', 'courses', 'recommendations'] as const
    const results = await Promise.all(
      tables.map((t) =>
        supabase
          .from(t)
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .then(({ data }) => (data || []).map((item) => ({ ...item, _table: t })))
      )
    )
    const all = results.flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setItems(all)
    setTotalCount(all.length)
    setLoading(false)
  }

  useEffect(() => {
    setSearch('')
    setLevelFilter('')
    setPage(1)
    setExpandedId(null)
    loadItems(activeTab)
  }, [activeTab])

  const filtered = items.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q) ||
      (item.tags || []).some((t: string) => t.toLowerCase().includes(q))
    const matchLevel = !levelFilter || item.level === levelFilter
    return matchSearch && matchLevel
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCopy = (item: any) => {
    navigator.clipboard.writeText(item.content || item.url || '')
    setCopied(item.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const tableIcon = (tableName: string) => {
    const tab = TABS.find((t) => t.id === tableName)
    return tab?.icon || '📌'
  }

  const bg = darkMode ? 'bg-slate-950' : 'bg-gray-50'
  const text = darkMode ? 'text-slate-100' : 'text-gray-900'
  const cardBg = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const cardHover = darkMode ? 'hover:border-slate-700' : 'hover:border-gray-300'
  const inputBg = darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  const headerBg = darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const subText = darkMode ? 'text-slate-400' : 'text-gray-500'
  const tagBg = darkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-600'

  return (
    <div className={`min-h-screen ${bg} ${text}`}>
      {/* Header */}
      <header className={`${headerBg} border-b px-6 py-4 sticky top-0 z-10`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">F2</div>
            <div>
              <h1 className="text-lg font-bold">
                F2F <span className="text-orange-500">Claude HUB</span>
              </h1>
              <p className={`text-xs ${subText}`}>
                {totalCount} recurso{totalCount !== 1 ? 's' : ''} disponíve{totalCount !== 1 ? 'is' : 'l'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${darkMode ? 'border-slate-700 text-slate-400 hover:text-slate-200' : 'border-gray-300 text-gray-500 hover:text-gray-800'}`}
          >
            {darkMode ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className={`flex gap-1 mb-6 border-b ${darkMode ? 'border-slate-800' : 'border-gray-200'} overflow-x-auto`}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1) }}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar..."
            className={`flex-1 min-w-48 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-500 ${inputBg}`}
          />
          {activeTab !== 'novidades' && (
            <select
              value={levelFilter}
              onChange={(e) => { setLevelFilter(e.target.value); setPage(1) }}
              className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-orange-500 ${inputBg}`}
            >
              <option value="">Todos os níveis</option>
              <option value="Iniciante">Iniciante</option>
              <option value="Intermediario">Intermediario</option>
              <option value="Avancado">Avancado</option>
            </select>
          )}
        </div>

        {/* Results count */}
        {!loading && filtered.length > 0 && (
          <p className={`text-xs ${subText} mb-4`}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            {totalPages > 1 && ` — Página ${page} de ${totalPages}`}
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className={`flex items-center gap-3 py-12 ${subText}`}>
            <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>
            Carregando...
          </div>
        ) : paginated.length === 0 ? (
          <div className={`text-center py-16 ${darkMode ? 'text-slate-600' : 'text-gray-400'}`}>
            {activeTab === 'novidades' ? (
              <p>Nenhum conteúdo adicionado nos últimos 7 dias.</p>
            ) : (
              <p>Nenhum item encontrado.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {paginated.map((item) => {
              const isPrompt = activeTab === 'prompts' || item._table === 'prompts'
              const isExpanded = expandedId === item.id
              return (
                <div
                  key={`${item._table || activeTab}-${item.id}`}
                  className={`${cardBg} border rounded-xl p-4 ${cardHover} transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {item._table && (
                          <span className="text-base">{tableIcon(item._table)}</span>
                        )}
                        <span className="font-semibold text-sm">{item.title}</span>
                        {item.level && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${LEVEL_COLORS[item.level] || 'bg-slate-700 text-slate-300'}`}>
                            {item.level}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className={`text-xs mb-2 ${subText}`}>{item.description}</p>
                      )}

                      {/* Autor e data_testada */}
                      {(item.autor || item.data_testada) && (
                        <div className={`flex items-center gap-3 text-xs ${subText} mb-2`}>
                          {item.autor && <span>✍️ {item.autor}</span>}
                          {item.data_testada && <span>🗓️ Testado em {formatDate(item.data_testada)}</span>}
                        </div>
                      )}

                      {/* Prompt preview */}
                      {isPrompt && item.content && (
                        <div className={`mt-2 text-xs rounded-lg p-3 font-mono ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-gray-50 text-gray-700'}`}>
                          <p className={`${!isExpanded ? 'line-clamp-3' : ''} whitespace-pre-wrap`}>
                            {item.content}
                          </p>
                          {item.content.length > 200 && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="text-orange-400 hover:text-orange-300 mt-1 text-xs font-sans"
                            >
                              {isExpanded ? '▲ Ver menos' : '▼ Ver completo'}
                            </button>
                          )}
                        </div>
                      )}

                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-400 hover:underline truncate block mt-1">
                          {item.url}
                        </a>
                      )}

                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag: string) => (
                            <span key={tag} className={`text-xs px-1.5 py-0.5 rounded ${tagBg}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {(isPrompt || item.url) && (
                      <button
                        onClick={() => handleCopy(item)}
                        className={`shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                          copied === item.id
                            ? 'bg-green-600 text-white'
                            : darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {copied === item.id ? '✓ Copiado' : isPrompt ? 'Copiar prompt' : 'Copiar URL'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-40 ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              ← Anterior
            </button>
            <span className={`text-sm ${subText}`}>{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-40 ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-300 text-gray-600 hover:bg-gray-100'}`}
            >
              Próxima →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
