import { useState } from 'react'
import { useStore } from '../store/useStore'
import HistoryItem from '../components/HistoryItem'
import CategoryFilter from '../components/CategoryFilter'

export default function HistoryScreen({ showToast }) {
  const { state, dispatch } = useStore()
  const [filter, setFilter] = useState(null)

  const filtered = filter
    ? state.logs.filter(l => l.categoryId === filter)
    : state.logs

  const catMap = Object.fromEntries(state.categories.map(c => [c.id, c]))

  const handleDelete = (id) => {
    const log = state.logs.find(l => l.id === id)
    const cat = catMap[log?.categoryId]
    dispatch({ type: 'DELETE_LOG', id })
    showToast(`🗑️ ${cat?.label ?? 'רישום'} נמחק`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <CategoryFilter
          categories={state.categories}
          selected={filter}
          onChange={setFilter}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-sm">אין רישומים עדיין</div>
          </div>
        ) : (
          filtered.map(log => (
            <HistoryItem
              key={log.id}
              log={log}
              category={catMap[log.categoryId]}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
