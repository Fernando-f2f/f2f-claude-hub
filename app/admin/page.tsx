'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TABLES = [
  { id: 'prompts', label: 'Prompts', hasContent: true },
  { id: 'videos', label: 'Videos', hasContent: false },
  { id: 'courses', label: 'Cursos', hasContent: false },
  { id: 'recommendations', label: 'Recomendacoes', hasContent: false },
]

const LEVELS = ['Iniciante', 'Intermediario', 'Avancado']
const emptyForm = { title: '', description: '', content: '', url: '', level: 'Iniciante', tags: '' }

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('prompts')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const currentTable = TABLES.find((t) => t.id === activeTab)

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadItems = async () => {
    setLoading(true)
    const { data, error } = await supabase.from(activeTab).select('*').order('created_at', { ascending: false })
    if (error) showToast('Erro ao carregar: ' + error.message, 'err')
    else setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { loadItems(); setShowForm(false); setEditingId(null); setForm(emptyForm) }, [activeTab])

  const handleEdit = (item) => {
    setForm({ title: item.title || '', description: item.description || '', content: item.content || '', url: item.url || '', level: item.level || 'Iniciante', tags: item.tags ? item.tags.join(', ') : '' })
    setEditingId(item.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => { setForm(emptyForm); setEditingId(null); setShowForm(false) }

  const handleSave = async () => {
    if (!form.title.trim()) return showToast('Titulo e obrigatorio', 'err')
    if (currentTable.hasContent && !form.content.trim()) return showToast('Conteudo do prompt e obrigatorio', 'err')
    if (!currentTable.hasContent && !form.url.trim()) return showToast('URL e obrigatoria', 'err')
    setSaving(true)
    const payload = { title: form.title.trim(), description: form.description.trim(), level: form.level, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }
    if (currentTable.hasContent) payload.content = form.content.trim()
    else payload.url = form.url.trim()
    const { error } = editingId ? await supabase.from(activeTab).update(payload).eq('id', editingId) : await supabase.from(activeTab).insert(payload)
    if (error) { showToast('Erro: ' + error.message, 'err') } else { showToast(editingId ? 'Atualizado!' : 'Adicionado!'); handleCancel(); loadItems() }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Deletar este item?')) return
    setDeletingId(id)
    const { error } = await supabase.from(activeTab).delete().eq('id', id)
    if (error) showToast('Erro: ' + error.message, 'err')
    else { showToast('Deletado!'); setItems((prev) => prev.filter((i) => i.id !== id)) }
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {toast.msg}
        </div>
      )}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">F2</div>
            <div>
              <h1 className="text-lg font-bold text-white">F2F Claude HUB <span className="text-orange-400">Admin</span></h1>
              <p className="text-xs text-slate-400">Gerenciamento de conteudo</p>
            </div>
          </div>
          <a href="/" className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">Ver site</a>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6 border-b border-slate-800">
          {TABLES.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab.id ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="mb-6 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
            + Adicionar {currentTable.label}
          </button>
        )}
        {showForm && (
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-4">{editingId ? 'Editar item' : 'Novo item'}</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Titulo *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titulo do item"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Descricao</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descricao breve"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500" />
              </div>
              {currentTable.hasContent ? (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Conteudo do Prompt *</label>
                  <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Texto completo do prompt..." rows={6}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 resize-y font-mono" />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">URL *</label>
                  <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nivel</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-sm focus:outline-none focus:border-orange-500">
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Tags (separadas por virgula)</label>
                  <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2, tag3"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
              </button>
              <button onClick={handleCancel} className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors">Cancelar</button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex items-center gap-3 py-12 text-slate-500">
            <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full"></div>Carregando...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-600"><p>Nenhum item cadastrado ainda.</p></div>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4 hover:border-slate-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                    {item.level && <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{item.level}</span>}
                  </div>
                  {item.description && <p className="text-slate-400 text-xs mb-1 truncate">{item.description}</p>}
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-400 hover:underline truncate block">{item.url}</a>}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => <span key={tag} className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{tag}</span>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEdit(item)} className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium">Editar</button>
                  <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id} className="text-xs px-3 py-1.5 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-red-200 rounded-lg transition-colors font-medium">
                    {deletingId === item.id ? '...' : 'Deletar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}