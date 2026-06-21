import { useState } from 'react'
import { useStore } from '../store/useStore'
import CategoryButton from '../components/CategoryButton'
import FeedingAmountSheet from '../components/FeedingAmountSheet'
import ManualLogForm from '../components/ManualLogForm'
import WeightInputSheet from '../components/WeightInputSheet'

export default function HomeScreen({ showToast }) {
  const { state, dispatch } = useStore()
  const [feedingOpen, setFeedingOpen] = useState(false)
  const [weightOpen, setWeightOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)

  const enabled = state.categories.filter(c => c.enabled)

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
    <div className="flex flex-col h-full">
      <div className="p-4 pb-2">
        <p className="text-sm text-gray-500 mb-4">לחץ על קטגוריה לרישום מהיר</p>
        <div className="grid grid-cols-3 gap-3">
          {enabled.map(cat => (
            <CategoryButton key={cat.id} category={cat} onClick={handleCategory} />
          ))}
        </div>
      </div>

      <div className="p-4 pt-3 mt-auto">
        <button
          onClick={() => setManualOpen(true)}
          className="w-full border border-indigo-300 text-indigo-600 rounded-2xl py-3 text-sm font-medium bg-indigo-50"
        >
          ✏️ רישום ידני
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
