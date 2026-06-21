import { useState } from 'react'
import { useStore } from '../store/useStore'
import BarChart from '../components/BarChart'
import { formatDateTime, formatDate } from '../lib/time'

export default function WeightScreen({ showToast }) {
  const { state, dispatch } = useStore()
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')

  const handleSave = () => {
    const w = parseFloat(weight)
    if (w > 0) {
      dispatch({
        type: 'ADD_WEIGHT',
        weight: w,
        note,
      })
      showToast(`⚖️ משקל שמור: ${w} ק״ג`)
      setWeight('')
      setNote('')
    }
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_WEIGHT', id })
    showToast('🗑️ משקל נמחק')
  }

  const sorted = [...state.weightLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const current = sorted[0]
  const previous = sorted[1]

  let diffText = null
  let diffColor = 'text-gray-500'
  if (current && previous) {
    const diff = (current.weight - previous.weight).toFixed(2)
    const currentDate = formatDate(new Date(current.timestamp))
    const previousDate = formatDate(new Date(previous.timestamp))
    if (Math.abs(diff) < 0.01) {
      diffText = `אין שינוי בין ${previousDate} ל-${currentDate}`
      diffColor = 'text-gray-500'
    } else if (diff > 0) {
      diffText = `בין ${previousDate} ל-${currentDate} עלה ${diff} ק״ג 📈`
      diffColor = 'text-green-600'
    } else {
      diffText = `בין ${previousDate} ל-${currentDate} ירד ${Math.abs(diff)} ק״ג 📉`
      diffColor = 'text-red-600'
    }
  }

  const chartData = sorted.slice(0, 10).reverse().map(w => ({
    label: formatDate(new Date(w.timestamp)),
    amount: w.weight,
  }))

  return (
    <div className="flex flex-col h-full">
      {/* Input Section */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="משקל (ק״ג)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-center focus:outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleSave}
              disabled={!parseFloat(weight)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-40"
            >
              שמור
            </button>
          </div>
          <input
            type="text"
            placeholder="הערה (אופציונלי)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* Summary Card */}
      {current && (
        <div className="p-4 bg-indigo-50 border-b border-gray-200">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">המשקל הנוכחי</div>
            <div className="text-4xl font-bold text-indigo-600 mb-3">{current.weight} ק״ג</div>
            <div className="text-xs text-gray-500 mb-4">{formatDateTime(new Date(current.timestamp))}</div>
            {diffText && <div className={`text-sm ${diffColor}`}>{diffText}</div>}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-3">עשרת המדידות האחרונות</h3>
          <BarChart data={chartData} unit="ק״ג" height={200} />
        </div>
      )}

      {/* History */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="text-4xl mb-2">⚖️</div>
            <div className="text-sm">אין מדידות עדיין</div>
          </div>
        ) : (
          sorted.map(w => (
            <div key={w.id} className="bg-white rounded-xl p-3 flex items-center justify-between border border-gray-200">
              <div className="flex-1">
                <div className="text-sm font-medium">{w.weight} ק״ג</div>
                <div className="text-xs text-gray-500">{formatDateTime(new Date(w.timestamp))}</div>
                {w.note && <div className="text-xs text-gray-600 mt-1">הערה: {w.note}</div>}
              </div>
              <button
                onClick={() => handleDelete(w.id)}
                className="ml-2 text-red-500 text-lg active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
