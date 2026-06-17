import { useState } from 'react'

export default function ManualLogForm({ categories, onSave, onClose }) {
  const enabled = categories.filter(c => c.enabled)
  const [categoryId, setCategoryId] = useState(enabled[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [datetime, setDatetime] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })

  const selected = categories.find(c => c.id === categoryId)
  const isFeeding = selected?.type === 'feeding'

  const handleSave = () => {
    if (!categoryId) return
    onSave({
      categoryId,
      amount: isFeeding && amount ? parseInt(amount) : null,
      note,
      timestamp: new Date(datetime).toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="w-full max-w-[480px] mx-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-t-3xl shadow-2xl p-5 pb-8">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-bold text-center mb-4">רישום ידני</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">קטגוריה</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              >
                {enabled.map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>

            {isFeeding && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">כמות (מ״ל)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="לדוגמה: 120"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  min="1" max="500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 mb-1">תאריך ושעה</label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={e => setDatetime(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">הערה</label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="הערה חופשית (אופציונלי)"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm text-gray-600">
              ביטול
            </button>
            <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-medium">
              שמור
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
