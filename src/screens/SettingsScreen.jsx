import { useState } from 'react'
import { useStore } from '../store/useStore'
import CategoryManager from '../components/CategoryManager'
import { requestPermission, isGranted } from '../lib/notifications'

export default function SettingsScreen({ showToast }) {
  const { state, dispatch } = useStore()
  const [nameInput, setNameInput] = useState(state.babyName)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleNameSave = () => {
    dispatch({ type: 'SET_BABY_NAME', name: nameInput.trim() })
    showToast('שם נשמר ✓')
  }

  const handleNotifications = async () => {
    if (isGranted()) {
      showToast('הרשאת התראות כבר אושרה ✓')
      return
    }
    const granted = await requestPermission()
    if (granted) {
      dispatch({ type: 'SET_NOTIFICATIONS_ENABLED', enabled: true })
      showToast('התראות הופעלו ✓')
    } else {
      showToast('ההרשאה נדחתה בדפדפן')
    }
  }

  const handleClearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    dispatch({ type: 'CLEAR_ALL' })
    setConfirmClear(false)
    showToast('כל הנתונים נמחקו')
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">
      <section>
        <h2 className="text-sm font-bold text-gray-500 mb-2">שם התינוק</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            placeholder="שם התינוק"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
          />
          <button
            onClick={handleNameSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium"
          >
            שמור
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-500 mb-3">ניהול קטגוריות</h2>
        <CategoryManager
          categories={state.categories}
          onToggle={(id) => dispatch({ type: 'TOGGLE_CATEGORY', id })}
          onAdd={(label, emoji) => dispatch({ type: 'ADD_CATEGORY', label, emoji })}
          onDelete={(id) => dispatch({ type: 'DELETE_CATEGORY', id })}
        />
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-500 mb-3">התראות</h2>
        <button
          onClick={handleNotifications}
          className="w-full border border-indigo-300 text-indigo-600 bg-indigo-50 rounded-xl py-3 text-sm font-medium"
        >
          {isGranted() ? '✅ התראות מופעלות' : '🔔 הפעל התראות דפדפן'}
        </button>
        <p className="text-xs text-gray-400 mt-2 text-center">
          התראות יורות רק כשהאפליקציה פתוחה בדפדפן
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold text-gray-500 mb-3">נתונים</h2>
        <button
          onClick={handleClearAll}
          className={`w-full rounded-xl py-3 text-sm font-medium transition-colors ${
            confirmClear
              ? 'bg-red-600 text-white'
              : 'border border-red-300 text-red-500 bg-red-50'
          }`}
        >
          {confirmClear ? '⚠️ לחץ שוב לאישור מחיקה' : '🗑️ מחק את כל הנתונים'}
        </button>
        {confirmClear && (
          <button onClick={() => setConfirmClear(false)} className="w-full text-gray-400 text-sm py-2">
            ביטול
          </button>
        )}
      </section>
    </div>
  )
}
