import { useState } from 'react'

export default function WeightInputSheet({ onConfirm, onClose }) {
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')

  const handleConfirm = () => {
    const w = parseFloat(weight)
    if (w > 0) {
      onConfirm(w, note)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="w-full max-w-[480px] mx-auto" onClick={e => e.stopPropagation()}>
        <div className="bg-white rounded-t-3xl shadow-2xl p-5 pb-8">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          <h2 className="text-lg font-bold text-center mb-4">📏 משקל</h2>

          <div className="space-y-3 mb-4">
            <input
              type="number"
              step="0.1"
              placeholder="משקל (ק״ג)"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-indigo-400"
              autoFocus
            />
            <input
              type="text"
              placeholder="הערה (אופציונלי)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-400"
            />
          </div>

          <button
            onClick={handleConfirm}
            disabled={!parseFloat(weight)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium disabled:opacity-40 mb-2"
          >
            שמור
          </button>

          <button onClick={onClose} className="w-full text-gray-500 text-sm py-2">
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}
