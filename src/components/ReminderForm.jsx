import { useState } from 'react'

export default function ReminderForm({ onSave, onClose }) {
  const [label, setLabel] = useState('')
  const [type, setType] = useState('recurring')
  const [hours, setHours] = useState('3')
  const [minutes, setMinutes] = useState('0')
  const [datetime, setDatetime] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })

  const handleSave = () => {
    if (!label.trim()) return
    const intervalMinutes = type === 'recurring'
      ? parseInt(hours) * 60 + parseInt(minutes || 0)
      : null
    onSave({
      label: label.trim(),
      reminderType: type,
      intervalMinutes: intervalMinutes || null,
      datetime: type === 'once' ? new Date(datetime).toISOString() : null,
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="w-full max-w-[480px] mx-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-t-3xl shadow-2xl p-5 pb-8">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-bold text-center mb-4">תזכורת חדשה</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">תיאור התזכורת</label>
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="לדוגמה: זמן האכלה"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">סוג תזכורת</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                {[['recurring', 'חוזרת'], ['once', 'חד-פעמית']].map(([val, txt]) => (
                  <button
                    key={val}
                    onClick={() => setType(val)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${type === val ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            {type === 'recurring' ? (
              <div>
                <label className="block text-sm text-gray-600 mb-1">כל כמה זמן?</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    min="0" max="23"
                    className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-sm text-gray-600">שעות</span>
                  <input
                    type="number"
                    value={minutes}
                    onChange={e => setMinutes(e.target.value)}
                    min="0" max="59"
                    className="w-20 border border-gray-300 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:border-indigo-400"
                  />
                  <span className="text-sm text-gray-600">דקות</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm text-gray-600 mb-1">תאריך ושעה</label>
                <input
                  type="datetime-local"
                  value={datetime}
                  onChange={e => setDatetime(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={onClose} className="flex-1 border border-gray-300 rounded-xl py-3 text-sm text-gray-600">ביטול</button>
            <button onClick={handleSave} disabled={!label.trim()} className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40">שמור</button>
          </div>
        </div>
      </div>
    </div>
  )
}
