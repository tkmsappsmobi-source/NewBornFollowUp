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
    <>
      <style>{`
        .hist-root { display:flex; flex-direction:column; height:100%; background:#F0F8FF; font-family:Heebo,sans-serif; }
        .hist-filter { padding: clamp(10px,3vw,16px) clamp(10px,4vw,16px) clamp(8px,2vw,12px); background:white; border-bottom:1px solid #E5E7EB; flex-shrink:0; }
        .hist-list { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding: clamp(10px,3vw,14px) clamp(10px,4vw,16px); padding-bottom: clamp(80px,20vw,100px); display:flex; flex-direction:column; gap: clamp(8px,2vw,12px); }
        .hist-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:10px; color:#9CA3AF; }
        .hist-empty-icon { font-size: clamp(40px,12vw,56px); }
        .hist-empty-text { font-size: clamp(13px,3.5vw,16px); font-weight:500; }
        .hist-count { font-size: clamp(11px,3vw,13px); color:#9CA3AF; text-align:center; padding: clamp(6px,2vw,10px) 0 0; }
      `}</style>
      <div className="hist-root" dir="rtl">
        <div className="hist-filter">
          <CategoryFilter
            categories={state.categories}
            selected={filter}
            onChange={setFilter}
          />
        </div>
        <div className="hist-list">
          {filtered.length === 0 ? (
            <div className="hist-empty">
              <span className="hist-empty-icon">📋</span>
              <span className="hist-empty-text">אין רישומים עדיין</span>
            </div>
          ) : (
            <>
              {filtered.map(log => (
                <HistoryItem
                  key={log.id}
                  log={log}
                  category={catMap[log.categoryId]}
                  onDelete={handleDelete}
                />
              ))}
              <p className="hist-count">{filtered.length} רישומים סה״כ</p>
            </>
          )}
        </div>
      </div>
    </>
  )
}
