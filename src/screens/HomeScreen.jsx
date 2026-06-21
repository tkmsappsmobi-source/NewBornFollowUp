import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import FeedingAmountSheet from '../components/FeedingAmountSheet'
import ManualLogForm from '../components/ManualLogForm'
import WeightInputSheet from '../components/WeightInputSheet'
import { formatTime, isToday } from '../lib/time'

const ACTION_BUTTONS = [
  { id: 'pee', label: 'פיפי', bg: '#C6E2FF', emoji: '💧' },
  { id: 'feed', label: 'האכלה', bg: '#E4D6FF', emoji: '🍼' },
  { id: 'poop', label: 'קקי', bg: '#ECCFC0', emoji: '💩' },
  { id: 'bath', label: 'מקלחת', bg: '#C4E8FF', emoji: '🛁' },
  { id: 'clothes', label: 'החלפת בגדים', bg: '#DAD4FF', emoji: '👕' },
  { id: 'vitd', label: 'ויטמין D', bg: '#FFE8A4', emoji: '☀️' },
  { id: 'growth', label: 'מעקב גדילה', bg: '#D6CCFF', emoji: '📏' },
  { id: 'manual', label: 'רישום ידני', bg: '#DAD4FF', emoji: '✏️' },
]

const NAV_ITEMS = [
  { id: 'settings', label: 'הגדרות', route: '/settings' },
  { id: 'alerts', label: 'התראות', route: '/alerts' },
  { id: 'home', label: 'בית', route: '/' },
  { id: 'stats', label: 'סטטיסטיקה', route: '/stats' },
  { id: 'journal', label: 'יומן', route: '/journal' },
]

export default function HomeScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [feedingOpen, setFeedingOpen] = useState(false)
  const [weightOpen, setWeightOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)

  const babyName = state.babyName || 'מיכאל'
  const todayLogs = state.logs.filter(l => isToday(new Date(l.timestamp)))
  const recentLogs = [...todayLogs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3)

  const catMap = Object.fromEntries(state.categories.map(c => [c.id, c]))

  const handleAction = (actionId) => {
    if (actionId === 'manual') {
      setManualOpen(true)
      return
    }

    const cat = state.categories.find(c => c.id === actionId)
    if (!cat) return

    if (cat.type === 'feeding') {
      setFeedingOpen(true)
    } else if (cat.type === 'weight') {
      setWeightOpen(true)
    } else {
      dispatch({ type: 'ADD_LOG', categoryId: cat.id })
      showToast(`${cat.emoji} ${cat.label} נרשם`)
    }
  }

  const handleFeedingConfirm = (ml) => {
    setFeedingOpen(false)
    const feedingCat = state.categories.find(c => c.type === 'feeding')
    dispatch({ type: 'ADD_LOG', categoryId: feedingCat.id, amount: ml })
    showToast(`🍼 האכלה ${ml} מ״ל נרשמה`)
  }

  const handleWeightConfirm = (weight, note) => {
    setWeightOpen(false)
    dispatch({ type: 'ADD_WEIGHT', weight, note })
    showToast(`📏 משקל ${weight} ק״ג נשמר`)
  }

  const handleManualSave = ({ categoryId, amount, note, timestamp }) => {
    setManualOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId, amount, note, timestamp })
    const cat = state.categories.find(c => c.id === categoryId)
    showToast(`${cat?.emoji ?? ''} ${cat?.label ?? ''} נרשם`)
  }

  const todaySummaryText = useMemo(() => {
    const counts = {}
    todayLogs.forEach(log => {
      const cat = catMap[log.categoryId]
      if (cat) {
        counts[cat.label] = (counts[cat.label] || 0) + 1
      }
    })
    return Object.entries(counts)
      .map(([label, count]) => `${count} ${label}`)
      .join(', ')
  }, [todayLogs, catMap])

  const currentTime = new Date().toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div dir="rtl" className="font-['Heebo'] w-full max-w-[390px] mx-auto h-screen flex flex-col bg-[#F5F2FC] relative overflow-hidden">
      {/* Status Bar */}
      <div className="shrink-0 h-11 bg-[#240E6A] flex items-center justify-between px-5">
        <span className="text-white text-[13px] font-semibold">{currentTime}</span>
        <div className="flex gap-1.5 items-center">
          {/* Signal, WiFi, Battery icons */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M1 10.5l2-2M4 12l3-3M7 12l4-4M11 12l4-4" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M2 6c2-2 4-3 6-3s4 1 6 3M4 4c1.5-1.5 3-2 4-2s2.5.5 4 2" stroke="white" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
            <rect x="1" y="1" width="16" height="8" rx="1.5" stroke="white" strokeWidth="1" />
            <rect x="14.5" y="3.5" width="3" height="3" fill="white" />
          </svg>
        </div>
      </div>

      {/* Header with Moon */}
      <div className="shrink-0 relative z-[2]">
        {/* Gradient Background */}
        <div
          className="h-[152px] px-[18px] pt-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #240E6A 0%, #3D1A8C 25%, #5830C8 75%, #7040E0 100%)',
          }}
        >
          {/* Stars */}
          <svg className="absolute top-6 left-4 w-5 h-5" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L13 8H19L14.5 12L16 18L10 14.5L4 18L5.5 12L1 8H7L10 2Z" fill="#FFD700" />
          </svg>
          <svg className="absolute top-12 right-6 w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L10.4 6.2H16L11.8 9.8L13.2 15L8 11.4L2.8 15L4.2 9.8L0 6.2H5.6L8 1Z" fill="white" opacity="0.7" />
          </svg>
          <svg className="absolute bottom-8 right-12 w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.5 4.5H12.2L9.3 6.8L10.8 10.3L7 8L3.2 10.3L4.7 6.8L1.8 4.5H5.5L7 1Z" fill="white" opacity="0.6" />
          </svg>

          {/* Clouds */}
          <svg className="absolute bottom-2 left-0 w-32 h-8 opacity-40" viewBox="0 0 140 30" fill="none">
            <path d="M10 18C5 18 2 22 2 27C2 28.1 2.9 29 4 29H40C41.1 29 42 28.1 42 27C42 24 40 21 36 20C35 18 33 16 30 16C27 16 24.5 18 22 18C19 18 15 15 12 15C10.3 15 8.5 16 7 18" stroke="white" strokeWidth="1.5" fill="none" opacity="0.6" />
          </svg>
          <svg className="absolute bottom-3 right-0 w-40 h-10 opacity-30" viewBox="0 0 180 35" fill="none">
            <path d="M30 20C20 20 15 25 15 32C15 33.1 15.9 34 17 34H80C81.1 34 82 33.1 82 32C82 28 80 24 75 22C73.5 20 71 18 67 18C63 18 59 21 55 21C50 21 44 17 38 17C35.5 17 33 18 31 20" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5" />
          </svg>

          <h1 className="m-0 pt-3 text-white text-[36px] font-black text-right tracking-tight leading-tight">
            שלום {babyName},
          </h1>
        </div>

        {/* Moon - positioned absolutely, overlaps content */}
        <div className="absolute left-[-2px] bottom-[-26px] w-[116px] h-[126px] z-[5] pointer-events-none">
          <svg width="116" height="126" viewBox="0 0 116 126" fill="none">
            <defs>
              <mask id="crescent">
                <rect width="116" height="126" fill="white" />
                <circle cx="78" cy="43" r="47" fill="black" />
              </mask>
              <radialGradient id="moonGrad" cx="35%" cy="35%">
                <stop offset="0%" stopColor="#FFE566" />
                <stop offset="60%" stopColor="#FFC520" />
                <stop offset="100%" stopColor="#CF8A10" />
              </radialGradient>
            </defs>

            {/* Crescent moon */}
            <circle cx="50" cy="69" r="52" fill="url(#moonGrad)" mask="url(#crescent)" />

            {/* Face - eyes */}
            <path d="M35 55 Q40 50 45 55" stroke="#A0652A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M65 55 Q70 50 75 55" stroke="#A0652A" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Smile */}
            <path d="M40 75 Q55 85 70 75" stroke="#A0652A" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Rosy cheek */}
            <ellipse cx="25" cy="75" rx="8" ry="6" fill="#FFB0A0" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F5F2FC] px-[14px] pt-[30px] pb-[100px]">
        {/* Action Grid - 2 columns × 4 rows */}
        <div className="grid grid-cols-2 gap-[10px] mb-3">
          {ACTION_BUTTONS.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="bg-white rounded-[18px] p-[15px_14px] flex items-center justify-between min-h-[86px] cursor-pointer transition-all duration-150 hover:shadow-[0_5px_20px_rgba(70,25,150,0.15)] hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span className="text-[17px] font-semibold text-[#1A0F3C] leading-tight">{action.label}</span>
              <div
                className="w-[58px] h-[58px] rounded-full flex items-center justify-center text-[28px] shrink-0 leading-none"
                style={{ backgroundColor: action.bg }}
              >
                {action.emoji}
              </div>
            </button>
          ))}
        </div>

        {/* Summary Card - "היום בקצרה" */}
        {todayLogs.length > 0 && (
          <div
            className="bg-white rounded-[18px] p-[15px_14px] flex items-center gap-2 mb-3"
            style={{ direction: 'ltr' }}
          >
            {/* Teddy bear - LEFT */}
            <div className="text-[56px] leading-none shrink-0">🧸</div>

            {/* Text - CENTER */}
            <div className="flex-1 text-right pr-0.5" dir="rtl">
              <p className="text-[15px] font-bold text-[#5B21B6] mb-1">היום בקצרה ✨</p>
              <p className="text-[12.5px] text-[#72728A] leading-relaxed mb-0.5">
                {todaySummaryText || 'עדיין אין פעילויות היום'}
              </p>
              <p className="text-[12.5px] text-[#5B21B6] font-semibold">כל הכבוד! ממשיכים כך 💜</p>
            </div>

            {/* Calendar icon - RIGHT */}
            <div className="w-[52px] h-[52px] rounded-[12px] bg-[#EDE5FF] flex items-center justify-center shrink-0">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <rect x="2" y="4" width="26" height="23" rx="3.5" stroke="#7B3FDB" strokeWidth="2" fill="rgba(123,63,219,0.07)" />
                <rect x="2" y="4" width="26" height="8" rx="3.5" fill="rgba(123,63,219,0.18)" />
                <path d="M8 2v5.5M22 2v5.5" stroke="#7B3FDB" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 18l4 4 8-8" stroke="#7B3FDB" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        )}

        {/* CTA Button - רישום ידני */}
        <button
          onClick={() => setManualOpen(true)}
          className="w-full rounded-[18px] py-[17px] px-5 text-white text-[18px] font-bold flex items-center justify-center gap-2.5 mb-3 border-none cursor-pointer transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #4A1FA0 0%, #6A33D4 100%)',
            boxShadow: '0 6px 20px rgba(74,31,160,0.32)',
          }}
        >
          רישום ידני
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.7 2.3a2.1 2.1 0 013 3L6.2 16.8 2 18l1.2-4.2z" fill="white" stroke="white" strokeWidth="0.4" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Recent Activities */}
        {recentLogs.length > 0 && (
          <div className="bg-white rounded-[18px] pt-4 px-[14px] pb-1.5">
            <h3 className="text-[15px] font-bold text-[#5B21B6] text-right mb-2.5">פעולות אחרונות</h3>

            {recentLogs.map((log, i) => (
              <div
                key={log.id}
                className={`flex items-center justify-between py-2.5 ${i < recentLogs.length - 1 ? 'border-b border-[#F0EDF8]' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-medium text-[#2D1B5C]">
                    {catMap[log.categoryId]?.label || 'Unknown'}
                  </span>
                  <span className="text-[20px] leading-none">{catMap[log.categoryId]?.emoji}</span>
                </div>
                <span className="text-[13px] font-medium text-[#9898B0]">
                  {formatTime(new Date(log.timestamp))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav
        className="absolute bottom-0 left-0 right-0 bg-white pt-2 pb-[22px] flex justify-around items-start z-[20]"
        style={{ direction: 'ltr' }}
      >
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'stats') {
                setTab('stats')
              } else if (item.id === 'journal') {
                setTab('history')
              } else if (item.id === 'alerts') {
                setTab('reminders')
              } else if (item.id === 'settings') {
                setTab('settings')
              }
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer flex-1 pt-0.5 bg-transparent border-none hover:opacity-75 transition-opacity`}
          >
            {item.id === 'home' ? (
              <div className="bg-[#EDE5FF] rounded-[14px] px-[15px] py-[5px] flex items-center justify-center">
                <HomeIcon />
              </div>
            ) : (
              item.id === 'journal' ? <HistoryIcon /> :
              item.id === 'stats' ? <StatsIcon /> :
              item.id === 'alerts' ? <BellIcon /> :
              <SettingsIcon />
            )}
            <span className={`text-[10px] font-${item.id === 'home' ? 'bold' : 'medium'} text-${item.id === 'home' ? '[#6B35D6]' : '[#9090B0]'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Modals */}
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

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B35D6" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9090B0" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9090B0" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5h-5v14h5zM7 11h-2v8h2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9090B0" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9090B0" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
    </svg>
  )
}
