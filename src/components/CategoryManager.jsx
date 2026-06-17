import { useState } from 'react'

const EMOJI_SUGGESTIONS = ['😴', '🤒', '💊', '🏥', '🚶', '🎵', '🌡️', '🧴', '🪥', '🧸', '🌙', '⭐']

export default function CategoryManager({ categories, onToggle, onAdd, onDelete }) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('⭐')

  const handleAdd = () => {
    if (!label.trim()) return
    onAdd(label.trim(), emoji)
    setLabel('')
    setEmoji('⭐')
    setAdding(false)
  }

  return (
    <div className="space-y-2">
      {categories.map(c => (
        <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-100">
          <span className="text-2xl">{c.emoji}</span>
          <span className="flex-1 text-sm font-medium text-gray-700">{c.label}</span>
          <button
            onClick={() => onToggle(c.id)}
            className={`relative w-12 h-6 rounded-full transition-colors ${c.enabled ? 'bg-indigo-500' : 'bg-gray-200'}`}
            aria-label={c.enabled ? 'כבה' : 'הפעל'}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${c.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
          {!c.builtin && (
            <button onClick={() => onDelete(c.id)} className="text-gray-300 hover:text-red-400 text-xl ml-1">×</button>
          )}
        </div>
      ))}

      {adding ? (
        <div className="bg-white rounded-xl p-4 border border-indigo-200 space-y-3">
          <div className="flex flex-wrap gap-2">
            {EMOJI_SUGGESTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`text-xl p-1.5 rounded-lg ${emoji === e ? 'bg-indigo-100 ring-2 ring-indigo-400' : ''}`}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              placeholder="אימוג'י"
              className="w-16 border border-gray-300 rounded-xl px-2 py-2 text-center text-sm focus:outline-none"
              maxLength={2}
            />
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="שם קטגוריה"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 border border-gray-300 rounded-xl py-2 text-sm text-gray-600">ביטול</button>
            <button onClick={handleAdd} disabled={!label.trim()} className="flex-1 bg-indigo-600 text-white rounded-xl py-2 text-sm font-medium disabled:opacity-40">הוסף</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full border-2 border-dashed border-indigo-200 rounded-xl py-3 text-sm text-indigo-500 font-medium"
        >
          + הוסף קטגוריה חדשה
        </button>
      )}
    </div>
  )
}
