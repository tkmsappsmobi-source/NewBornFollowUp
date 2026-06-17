import { useState } from 'react'

const AGE_LABELS = {
  10: 'פג/ראשון',
  20: 'יומי',
  40: 'לידה',
  60: 'לידה',
  80: 'שבוע',
  100: '2 שבועות',
  120: 'חודש',
  150: '2 חודשים',
  180: '3 חודשים',
  200: '4+ חודשים',
}

export default function FeedingAmountSheet({ quickAmounts, onConfirm, onClose }) {
  const [custom, setCustom] = useState('')

  const handleQuick = (ml) => { onConfirm(ml) }

  const handleCustom = () => {
    const ml = parseInt(custom)
    if (ml > 0) onConfirm(ml)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="w-full max-w-[480px] mx-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-t-3xl shadow-2xl p-5 pb-8">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-bold text-center mb-4">🍼 כמות האכלה</h2>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {quickAmounts.map(ml => (
              <button
                key={ml}
                onClick={() => handleQuick(ml)}
                className="flex flex-col items-center bg-indigo-50 rounded-xl p-2 active:bg-indigo-200 transition-colors"
              >
                <span className="text-lg font-bold text-indigo-700">{ml}</span>
                <span className="text-[10px] text-gray-500">מ״ל</span>
                <span className="text-[9px] text-gray-400">{AGE_LABELS[ml] ?? ''}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="כמות חופשית (מ״ל)"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-center text-sm focus:outline-none focus:border-indigo-400"
              min="1"
              max="500"
            />
            <button
              onClick={handleCustom}
              disabled={!parseInt(custom)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40"
            >
              אישור
            </button>
          </div>

          <button onClick={onClose} className="w-full mt-3 text-gray-500 text-sm py-2">
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}
