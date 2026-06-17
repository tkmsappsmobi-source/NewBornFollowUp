import { useState } from 'react'
import { useStore } from '../store/useStore'
import ReminderForm from '../components/ReminderForm'
import { formatDateTime } from '../lib/time'

function intervalLabel(r) {
  if (r.type === 'once') return `חד-פעמית · ${formatDateTime(r.datetime)}`
  const h = Math.floor(r.intervalMinutes / 60)
  const m = r.intervalMinutes % 60
  const parts = []
  if (h) parts.push(`${h} שעות`)
  if (m) parts.push(`${m} דקות`)
  return `כל ${parts.join(' ו')}`
}

export default function RemindersScreen({ showToast }) {
  const { state, dispatch } = useStore()
  const [formOpen, setFormOpen] = useState(false)

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_REMINDER', ...data })
    setFormOpen(false)
    showToast('🔔 תזכורת נוספה')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {state.reminders.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="text-4xl mb-2">🔔</div>
            <div className="text-sm">אין תזכורות עדיין</div>
            <div className="text-xs mt-1 text-gray-300">תזכורות פועלות כשהאפליקציה פתוחה</div>
          </div>
        ) : (
          state.reminders.map(r => (
            <div key={r.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
              <span className="text-2xl">🔔</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{r.label}</div>
                <div className="text-xs text-gray-400">{intervalLabel(r)}</div>
                {r.lastFired && (
                  <div className="text-xs text-gray-300">הופעל לאחרונה: {formatDateTime(r.lastFired)}</div>
                )}
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_REMINDER', id: r.id })}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${r.enabled ? 'bg-indigo-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${r.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <button
                onClick={() => dispatch({ type: 'DELETE_REMINDER', id: r.id })}
                className="text-gray-300 hover:text-red-400 text-xl"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4">
        <div className="text-xs text-center text-amber-500 bg-amber-50 rounded-xl px-3 py-2 mb-3">
          ⚠️ תזכורות פועלות רק כשהאפליקציה פתוחה בדפדפן
        </div>
        <button
          onClick={() => setFormOpen(true)}
          className="w-full bg-indigo-600 text-white rounded-2xl py-3 text-sm font-medium"
        >
          + תזכורת חדשה
        </button>
      </div>

      {formOpen && (
        <ReminderForm onSave={handleAdd} onClose={() => setFormOpen(false)} />
      )}
    </div>
  )
}
