import { useState, useEffect, useRef } from 'react'
import { useStore } from './store/useStore'
import { useToast, ToastContainer } from './components/Toast'
import { startReminderScheduler } from './lib/notifications'
import HomeScreen from './screens/HomeScreen'
import HistoryScreen from './screens/HistoryScreen'
import StatsScreen from './screens/StatsScreen'
import RemindersScreen from './screens/RemindersScreen'
import SettingsScreen from './screens/SettingsScreen'

const TABS = [
  { id: 'home', label: 'בית', emoji: '🏠' },
  { id: 'history', label: 'לוג', emoji: '📋' },
  { id: 'stats', label: 'סטטיסטיקה', emoji: '📊' },
  { id: 'reminders', label: 'תזכורות', emoji: '🔔' },
  { id: 'settings', label: 'הגדרות', emoji: '⚙️' },
]

export default function App() {
  const [tab, setTab] = useState('home')
  const { state, dispatch } = useStore()
  const { toasts, showToast, dismiss } = useToast()
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const stop = startReminderScheduler(
      () => stateRef.current,
      dispatch,
      showToast
    )
    return stop
  }, [dispatch])

  const babyName = state.babyName || 'מיכאל'

  const tabTitles = {
    home: `שלום ${babyName},`,
    history: 'היסטוריה',
    stats: 'סטטיסטיקות',
    reminders: 'תזכורות',
    settings: 'הגדרות',
  }

  return (
    <div className="flex flex-col h-dvh bg-gray-50" dir="rtl">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Header */}
      <header className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-center shrink-0 safe-top">
        <h1 className="text-base font-bold">{tabTitles[tab]}</h1>
      </header>

      {/* Screen content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {tab === 'home' && <HomeScreen showToast={showToast} />}
        {tab === 'history' && <HistoryScreen showToast={showToast} />}
        {tab === 'stats' && <StatsScreen />}
        {tab === 'reminders' && <RemindersScreen showToast={showToast} />}
        {tab === 'settings' && <SettingsScreen showToast={showToast} />}
      </main>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 flex shrink-0 safe-bottom">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              tab === t.id ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{t.emoji}</span>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
