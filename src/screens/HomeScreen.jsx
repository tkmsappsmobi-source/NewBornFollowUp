import { useState } from 'react'
import { useStore } from '../store/useStore'
import CategoryButton from '../components/CategoryButton'
import FeedingAmountSheet from '../components/FeedingAmountSheet'
import ManualLogForm from '../components/ManualLogForm'
import WeightInputSheet from '../components/WeightInputSheet'
import { formatTime, isToday } from '../lib/time'

export default function HomeScreen({ showToast }) {
  const { state, dispatch } = useStore()
  const [feedingOpen, setFeedingOpen] = useState(false)
  const [weightOpen, setWeightOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)

  const enabled = state.categories.filter(c => c.enabled)
  const todayLogs = state.logs.filter(l => isToday(new Date(l.timestamp)))
  const recentLogs = [...todayLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3)

  const catMap = Object.fromEntries(state.categories.map(c => [c.id, c]))

  const todaySummary = enabled.map(cat => {
    const count = todayLogs.filter(l => l.categoryId === cat.id).length
    return { ...cat, count }
  }).filter(c => c.count > 0)

  const handleCategory = (cat) => {
    if (cat.type === 'feeding') {
      setFeedingOpen(true)
    } else if (cat.type === 'weight') {
      setWeightOpen(true)
    } else {
      dispatch({ type: 'ADD_LOG', categoryId: cat.id })
      showToast(`${cat.emoji} ${cat.label} נרשם`)
    }
  }

  const handleWeightConfirm = (weight, note) => {
    setWeightOpen(false)
    dispatch({ type: 'ADD_WEIGHT', weight, note })
    showToast(`📏 משקל ${weight} ק״ג נשמר`)
  }

  const handleFeedingConfirm = (ml) => {
    setFeedingOpen(false)
    const feedingCat = state.categories.find(c => c.type === 'feeding')
    dispatch({ type: 'ADD_LOG', categoryId: feedingCat.id, amount: ml })
    showToast(`🍼 האכלה ${ml} מ״ל נרשמה`)
  }

  const handleManualSave = ({ categoryId, amount, note, timestamp }) => {
    setManualOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId, amount, note, timestamp })
    const cat = state.categories.find(c => c.id === categoryId)
    showToast(`${cat?.emoji ?? ''} ${cat?.label ?? ''} נרשם`)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Categories Grid */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {enabled.map(cat => (
            <CategoryButton key={cat.id} category={cat} onClick={handleCategory} />
          ))}
        </div>

        {/* Daily Summary Card */}
        {todaySummary.length > 0 && (
          <div className="bg-gradient-to-br from-[#f3e5f5] to-[#e8eaf6] rounded-2xl p-4 mb-4 flex gap-3">
            <span className="text-4xl">🧸</span>
            <div className="flex-1">
              <div className="text-sm font-bold text-[#6b3fa0] mb-1">✨ היום בקצרה</div>
              <div className="text-xs text-gray-700 mb-2">
                {todaySummary.map((c, i) => (
                  <div key={c.id}>{c.emoji} {c.label}: {c.count}</div>
                ))}
              </div>
              <div className="text-xs text-[#6b3fa0] font-medium">כל הכבוד! ממשיכים כך 💜</div>
            </div>
          </div>
        )}

        {/* Recent Actions */}
        {recentLogs.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-bold text-[#6b3fa0] mb-3">פעולות אחרונות</div>
            <div className="space-y-2">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between text-xs">
                  <span>{catMap[log.categoryId]?.emoji} {catMap[log.categoryId]?.label}</span>
                  <span className="text-gray-500">{formatTime(new Date(log.timestamp))}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Log Button */}
      <div className="p-4">
        <button
          onClick={() => setManualOpen(true)}
          className="w-full bg-[#6b3fa0] text-white rounded-2xl py-3 text-sm font-medium flex items-center justify-center gap-2"
        >
          <span className="text-lg">✏️</span>
          <span>רישום ידני</span>
        </button>
      </div>

      {feedingOpen && (
        <FeedingAmountSheet
          quickAmounts={state.feedingQuickAmounts}
          onConfirm={handleFeedingConfirm}
          onClose={() => setFeedingOpen(false)}
        />
      )}

      {weightOpen && (
        <WeightInputSheet
          onConfirm={handleWeightConfirm}
          onClose={() => setWeightOpen(false)}
        />
      )}

      {manualOpen && (
        <ManualLogForm
          categories={state.categories}
          onSave={handleManualSave}
          onClose={() => setManualOpen(false)}
        />
      )}
    </div>
  )
}
