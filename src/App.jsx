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
      <header
        className={`text-white px-4 py-4 flex items-center justify-center shrink-0 safe-top relative overflow-hidden ${
          tab === 'home'
            ? 'bg-gradient-to-r from-[#2d1b69] to-[#6b3fa0]'
            : 'bg-[#6b3fa0]'
        }`}
      >
        {tab === 'home' && (
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
          >
            <circle cx="80" cy="40" r="25" fill="#ffd700" opacity="0.8" />
            <circle cx="100" cy="35" r="3" fill="#fff" />
            <circle cx="110" cy="50" r="4" fill="#fff" />
            <circle cx="75" cy="55" r="2" fill="#fff" />
            <path d="M 60 75 Q 70 70 80 75" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
            <path d="M 120 85 Q 135 75 150 85" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
          </svg>
        )}
        <h1 className="text-lg font-bold relative z-10">{tabTitles[tab]}</h1>
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
        {TABS.map(t => {
          const isActive = tab === t.id
          const iconColor = isActive ? '#6b3fa0' : '#999'
          const icons = {
            home: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            ),
            history: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            ),
            stats: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <line x1="12" y1="2" x2="12" y2="22" />
                <path d="M17 5h-5v14h5zM7 11h-2v8h2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            reminders: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            ),
            settings: (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
              </svg>
            ),
          }
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors"
            >
              {icons[t.id]}
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#6b3fa0]' : 'text-gray-400'}`}>
                {t.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
