import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Pin, Trash2, Edit3, Save, X, Search } from 'lucide-react'
import { nanoid } from 'nanoid'
import type { NotebookEntry } from '@/types'

interface NotebookProps {
  worldId: string
  worldColor: string
  entries: NotebookEntry[]
  onEntriesChange: (entries: NotebookEntry[]) => void
}

export default function Notebook({ worldId, worldColor, entries = [], onEntriesChange }: NotebookProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newEntry, setNewEntry] = useState({ title: '', content: '', tags: '' })
  const [showNewEntry, setShowNewEntry] = useState(false)

  // Filter and sort entries
  const filteredEntries = entries
    .filter(entry => 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  const handleAddEntry = () => {
    if (!newEntry.title.trim()) return
    
    const entry: NotebookEntry = {
      id: nanoid(),
      worldId: worldId,
      title: newEntry.title,
      content: newEntry.content,
      tags: newEntry.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    onEntriesChange([...entries, entry])
    setNewEntry({ title: '', content: '', tags: '' })
    setShowNewEntry(false)
  }

  const handleUpdateEntry = (id: string, updates: Partial<NotebookEntry>) => {
    onEntriesChange(
      entries.map(entry => 
        entry.id === id 
          ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
          : entry
      )
    )
  }

  const handleDeleteEntry = (id: string) => {
    onEntriesChange(entries.filter(entry => entry.id !== id))
  }

  const handleTogglePin = (id: string) => {
    const entry = entries.find(e => e.id === id)
    if (entry) {
      handleUpdateEntry(id, { isPinned: !entry.isPinned })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 35, 0.95), rgba(10, 15, 25, 0.98))',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 60px ${worldColor}10`,
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-white/10 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${worldColor}, ${worldColor}80)` }}
          >
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Notebook</h3>
            <p className="text-xs text-muted-foreground">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        </div>
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            setShowNewEntry(true)
            setIsExpanded(true)
          }}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Search */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 
                           text-white placeholder:text-muted-foreground text-sm
                           focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* New Entry Form */}
            <AnimatePresence>
              {showNewEntry && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      placeholder="Note title..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 
                               text-white placeholder:text-muted-foreground text-sm
                               focus:outline-none focus:border-white/20"
                      autoFocus
                    />
                    <textarea
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                      placeholder="Write your note..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 
                               text-white placeholder:text-muted-foreground text-sm resize-none
                               focus:outline-none focus:border-white/20"
                    />
                    <input
                      type="text"
                      value={newEntry.tags}
                      onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                      placeholder="Tags (comma separated)..."
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 
                               text-white placeholder:text-muted-foreground text-sm
                               focus:outline-none focus:border-white/20"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setShowNewEntry(false)
                          setNewEntry({ title: '', content: '', tags: '' })
                        }}
                        className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddEntry}
                        disabled={!newEntry.title.trim()}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                        style={{ backgroundColor: worldColor }}
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Entries List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredEntries.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {searchQuery ? 'No notes found' : 'No notes yet. Add your first note!'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredEntries.map((entry) => (
                    <NotebookEntryItem
                      key={entry.id}
                      entry={entry}
                      worldColor={worldColor}
                      isEditing={editingId === entry.id}
                      onEdit={() => setEditingId(entry.id)}
                      onSave={(updates) => {
                        handleUpdateEntry(entry.id, updates)
                        setEditingId(null)
                      }}
                      onCancel={() => setEditingId(null)}
                      onDelete={() => handleDeleteEntry(entry.id)}
                      onTogglePin={() => handleTogglePin(entry.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

interface NotebookEntryItemProps {
  entry: NotebookEntry
  worldColor: string
  isEditing: boolean
  onEdit: () => void
  onSave: (updates: Partial<NotebookEntry>) => void
  onCancel: () => void
  onDelete: () => void
  onTogglePin: () => void
}

function NotebookEntryItem({
  entry,
  worldColor,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onTogglePin,
}: NotebookEntryItemProps) {
  const [editData, setEditData] = useState({
    title: entry.title,
    content: entry.content,
    tags: entry.tags.join(', '),
  })

  if (isEditing) {
    return (
      <div className="p-4 space-y-3 bg-white/5">
        <input
          type="text"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 
                   text-white text-sm focus:outline-none focus:border-white/20"
        />
        <textarea
          value={editData.content}
          onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 
                   text-white text-sm resize-none focus:outline-none focus:border-white/20"
        />
        <input
          type="text"
          value={editData.tags}
          onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
          placeholder="Tags (comma separated)..."
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 
                   text-white text-sm focus:outline-none focus:border-white/20"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => onSave({
              title: editData.title,
              content: editData.content,
              tags: editData.tags.split(',').map(t => t.trim()).filter(Boolean),
            })}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: worldColor }}
          >
            <Save className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="p-4 hover:bg-white/5 transition-colors group"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {entry.isPinned && (
              <Pin className="w-3 h-3 text-yellow-400" />
            )}
            <h4 className="font-medium text-white text-sm truncate">{entry.title}</h4>
          </div>
          {entry.content && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {entry.content}
            </p>
          )}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entry.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{ 
                    backgroundColor: `${worldColor}20`,
                    color: worldColor,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(entry.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onTogglePin}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Pin className={`w-3.5 h-3.5 ${entry.isPinned ? 'text-yellow-400' : 'text-muted-foreground'}`} />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
