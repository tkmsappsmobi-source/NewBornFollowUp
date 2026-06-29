import { formatTime, formatDate } from '../lib/time'

export default function HistoryItem({ log, category, onDelete }) {
  const today = new Date().toLocaleDateString('he-IL')
  const logDate = formatDate(log.timestamp)
  const showDate = logDate !== today

  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
      <span className="text-2xl shrink-0">{category?.emoji ?? '❓'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-800 text-sm">{category?.label ?? 'לא ידוע'}</span>
          {log.amount != null && (
            <span className="text-xs bg-[#E0F4FB] text-[#0096C7] rounded-full px-2 py-0.5">{log.amount} מ״ל</span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {showDate && <span>{logDate} · </span>}
          <span>{formatTime(log.timestamp)}</span>
          {log.note && <span> · {log.note}</span>}
        </div>
      </div>
      <button
        onClick={() => onDelete(log.id)}
        className="text-gray-300 hover:text-red-400 active:text-red-600 text-xl shrink-0 transition-colors"
        aria-label="מחק"
      >
        ×
      </button>
    </div>
  )
}
