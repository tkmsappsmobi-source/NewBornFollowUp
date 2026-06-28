import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import FeedingAmountSheet from '../components/FeedingAmountSheet'
import ManualLogForm from '../components/ManualLogForm'
import WeightInputSheet from '../components/WeightInputSheet'
import { formatTime, isToday } from '../lib/time'

const ACTION_BUTTONS = [
  { id: 'pee',         label: 'חיתול',    bg: '#C8F0E0', emoji: '🧷' },
  { id: 'feeding',     label: 'האכלה',    bg: '#FFF3CC', emoji: '🍼' },
  { id: 'sleep',       label: 'שינה',     bg: '#E0D8FF', emoji: '🌙' },
  { id: 'milestone',   label: 'אבן דרך', bg: '#FFD6EC', emoji: '⭐' },
  { id: 'growth',      label: 'גדילה',    bg: '#C8F0E8', emoji: '👶' },
  { id: 'bath',        label: 'מקלחת',   bg: '#FFE4CC', emoji: '🚿' },
  { id: 'weight',      label: 'משקל',     bg: '#C8EEFF', emoji: '⚖️' },
  { id: 'vaccination', label: 'חיסון',   bg: '#E8E0FF', emoji: '💉' },
]

const ACTION_BG_MAP = Object.fromEntries(ACTION_BUTTONS.map(b => [b.id, b.bg]))

export default function HomeScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [feedingOpen, setFeedingOpen] = useState(false)
  const [weightOpen, setWeightOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)

  const babyName = state.babyName || 'מיכאל'
  const todayLogs = state.logs.filter(l => isToday(new Date(l.timestamp)))
  const recentLogs = [...state.logs]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4)

  const catMap = Object.fromEntries(state.categories.map(c => [c.id, c]))

  const handleAction = (actionId) => {
    if (actionId === 'weight') {
      setWeightOpen(true)
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
    showToast(`⚖️ משקל ${weight} ק״ג נשמר`)
  }

  const handleManualSave = ({ categoryId, amount, note, timestamp }) => {
    setManualOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId, amount, note, timestamp })
    const cat = state.categories.find(c => c.id === categoryId)
    showToast(`${cat?.emoji ?? ''} ${cat?.label ?? ''} נרשם`)
  }

  const todayStats = useMemo(() => {
    const counts = {}
    todayLogs.forEach(log => {
      const cat = catMap[log.categoryId]
      if (cat) {
        if (!counts[cat.id]) counts[cat.id] = { cat, count: 0 }
        counts[cat.id].count++
      }
    })
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3)
  }, [todayLogs, catMap])

  const today = new Date().toLocaleDateString('he-IL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const getRelativeTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'עכשיו'
    if (minutes < 60) return `לפני ${minutes} דק'`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `לפני ${hours} שעה${hours > 1 ? 'ות' : ''}`
    return `לפני ${hours} שעה ו-${mins} דק'`
  }

  return (
    <div
      dir="rtl"
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F0F8FF', fontFamily: 'Heebo, sans-serif' }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #6EC6E6 0%, #9DDAF4 35%, #C8EDFA 70%, #E4F6FC 100%)',
        }}
      >
        {/* Stars */}
        {[
          { top: 22, left: 32, size: 17, op: 1 },
          { top: 14, left: 68, size: 11, op: 0.8 },
          { top: 52, left: 22, size: 9,  op: 0.6 },
          { top: 85, left: 82, size: 13, op: 0.7 },
          { top: 28, right: 140, size: 10, op: 0.7 },
          { top: 65, right: 50, size: 8, op: 0.5 },
        ].map((s, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              left: s.left,
              right: s.right,
              fontSize: s.size,
              color: '#FFD700',
              opacity: s.op,
              lineHeight: 1,
              pointerEvents: 'none',
            }}
          >★</span>
        ))}

        {/* Sun */}
        <div style={{ position: 'absolute', top: -8, right: -12, pointerEvents: 'none' }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="50" cy="34" r="30" fill="#FFD54F" />
            <circle cx="50" cy="34" r="27" fill="#FFCA28" />
            <ellipse cx="43" cy="30" rx="3" ry="3.5" fill="#8B6500" />
            <ellipse cx="57" cy="30" rx="3" ry="3.5" fill="#8B6500" />
            <path d="M43 40 Q50 47 57 40" stroke="#8B6500" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="35" cy="38" rx="5" ry="3.5" fill="#FFB74D" opacity="0.65" />
            <ellipse cx="65" cy="38" rx="5" ry="3.5" fill="#FFB74D" opacity="0.65" />
          </svg>
        </div>

        {/* Moon */}
        <div style={{ position: 'absolute', top: 10, left: 2, pointerEvents: 'none' }}>
          <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
            <defs>
              <mask id="moonMask">
                <rect width="58" height="58" fill="white" />
                <circle cx="38" cy="20" r="22" fill="black" />
              </mask>
            </defs>
            <circle cx="24" cy="30" r="24" fill="#FFF9C4" mask="url(#moonMask)" />
            <circle cx="24" cy="30" r="22" fill="#FFF176" mask="url(#moonMask)" />
            <path d="M16 27 Q19 23 22 27" stroke="#8B7B1A" strokeWidth="1.5" fill="none" strokeLinecap="round" mask="url(#moonMask)" />
            <path d="M26 27 Q29 23 32 27" stroke="#8B7B1A" strokeWidth="1.5" fill="none" strokeLinecap="round" mask="url(#moonMask)" />
            <path d="M17 35 Q24 41 31 35" stroke="#8B7B1A" strokeWidth="1.5" fill="none" strokeLinecap="round" mask="url(#moonMask)" />
          </svg>
        </div>

        {/* Text: date + name + badge */}
        <div style={{ textAlign: 'center', paddingTop: 18, position: 'relative', zIndex: 2 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#1A3A5C' }}>
            {today} • היום
          </p>
          <h1 style={{ margin: '4px 0 8px', fontSize: 46, fontWeight: 900, color: '#0D2640', lineHeight: 1.05, letterSpacing: -1 }}>
            {babyName}
          </h1>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.6)', borderRadius: 24,
            padding: '5px 16px', backdropFilter: 'blur(6px)',
          }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A5A8A' }}>מעקב תינוק</span>
            <span style={{ fontSize: 16 }}>⭐</span>
          </div>
        </div>

        {/* Baby illustration */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <BabyOnCloud />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 90 }}>
        <div style={{ padding: '14px 14px 0' }}>

          {/* סיכום היום */}
          <div style={cardStyle}>
            <div style={rowBetween}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="17" rx="3" stroke="#4A90D9" strokeWidth="1.8" fill="#EEF6FF" />
                <path d="M7 2v4M17 2v4M2 9h20" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>סיכום היום</span>
            </div>

            {todayStats.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
                {todayStats.map(({ cat, count }) => (
                  <div key={cat.id} style={{ background: ACTION_BG_MAP[cat.id] || '#F3F4F6', borderRadius: 14, padding: '12px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, lineHeight: 1, marginBottom: 5 }}>{cat.emoji}</div>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>{count}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', margin: '4px 0 0', fontWeight: 500 }}>{cat.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 13, margin: '12px 0 0' }}>
                עדיין אין פעילויות היום — לחץ על כפתור לרישום 👆
              </p>
            )}
          </div>

          {/* פיצ'רים */}
          <div style={cardStyle}>
            <div style={rowBetween}>
              <span style={{ fontSize: 20 }}>⭐</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>פיצ'רים</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
              {ACTION_BUTTONS.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      borderRadius: 18,
                      background: action.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      transition: 'transform 0.12s',
                    }}
                    onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.91)')}
                    onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                    onPointerLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {action.emoji}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#374151', textAlign: 'center', lineHeight: 1.25 }}>
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* הפעולות האחרונות */}
          {recentLogs.length > 0 && (
            <div style={cardStyle}>
              <div style={rowBetween}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                  {recentLogs.length} הפעולות האחרונות
                </span>
              </div>

              <div style={{ marginTop: 10 }}>
                {recentLogs.map((log, i) => {
                  const cat = catMap[log.categoryId]
                  const bg = ACTION_BG_MAP[log.categoryId] || '#F3F4F6'
                  return (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        paddingTop: 10,
                        paddingBottom: 10,
                        borderBottom: i < recentLogs.length - 1 ? '1px solid #F3F4F6' : 'none',
                        direction: 'ltr',
                      }}
                    >
                      {/* Arrow */}
                      <span style={{ color: '#D1D5DB', fontSize: 18, flexShrink: 0 }}>‹</span>

                      {/* Time */}
                      <div style={{ minWidth: 56, flexShrink: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.25 }}>
                          {formatTime(new Date(log.timestamp))}
                        </p>
                        <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
                          {getRelativeTime(log.timestamp)}
                        </p>
                      </div>

                      {/* Emoji circle */}
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, flexShrink: 0,
                      }}>
                        {cat?.emoji || '📝'}
                      </div>

                      {/* Name + detail */}
                      <div style={{ flex: 1, textAlign: 'right', direction: 'rtl' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.25 }}>
                          {cat?.label || 'פעולה'}
                        </p>
                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.4 }}>
                          {log.amount ? `${log.amount} מ״ל` : log.note || cat?.label || ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white',
          borderTop: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
          paddingTop: 8,
          zIndex: 50,
          direction: 'ltr',
        }}
      >
        <NavBtn
          icon={<PersonIcon />}
          label="פרופיל"
          onClick={() => setTab('settings')}
        />
        <NavBtn
          icon={<ChartIcon />}
          label="גרפים"
          onClick={() => setTab('stats')}
        />

        {/* Center + button */}
        <button
          onClick={() => setManualOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #48CAE4 0%, #0096C7 100%)',
            border: 'none', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 18px rgba(0,150,199,0.45)',
            marginBottom: 12,
            transition: 'transform 0.12s',
          }}
          onPointerDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
          onPointerUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          onPointerLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
            <path d="M12 4v16M4 12h16" />
          </svg>
        </button>

        <NavBtn
          icon={<ClockIcon />}
          label="היסטוריה"
          onClick={() => setTab('history')}
        />
        <NavBtn
          icon={<HomeIconSvg active />}
          label="בית"
          onClick={() => {}}
          active
        />
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

/* ── Shared styles ── */
const cardStyle = {
  background: 'white',
  borderRadius: 20,
  padding: '14px 16px',
  marginBottom: 12,
  boxShadow: '0 2px 14px rgba(0,0,0,0.07)',
}

const rowBetween = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

/* ── Baby illustration ── */
function BabyOnCloud() {
  return (
    <svg width="240" height="118" viewBox="0 0 240 118" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clouds */}
      <ellipse cx="120" cy="108" rx="108" ry="16" fill="white" opacity="0.96" />
      <ellipse cx="78" cy="97" rx="42" ry="25" fill="white" opacity="0.96" />
      <ellipse cx="120" cy="90" rx="50" ry="30" fill="white" opacity="0.96" />
      <ellipse cx="162" cy="97" rx="42" ry="25" fill="white" opacity="0.96" />
      <ellipse cx="198" cy="103" rx="28" ry="18" fill="white" opacity="0.9" />
      <ellipse cx="42" cy="103" rx="28" ry="18" fill="white" opacity="0.9" />

      {/* Baby body — blue starry onesie */}
      <ellipse cx="143" cy="82" rx="45" ry="24" fill="#6BBFDF" />
      <ellipse cx="143" cy="82" rx="42" ry="21" fill="#5BAED6" />
      <text x="126" y="82" fontSize="9" fill="white" opacity="0.6" fontFamily="sans-serif">★</text>
      <text x="143" y="76" fontSize="7" fill="white" opacity="0.6" fontFamily="sans-serif">★</text>
      <text x="155" y="86" fontSize="8" fill="white" opacity="0.6" fontFamily="sans-serif">★</text>

      {/* Legs */}
      <ellipse cx="172" cy="97" rx="15" ry="10" fill="#5BAED6" transform="rotate(25 172 97)" />
      <ellipse cx="188" cy="90" rx="14" ry="9" fill="#5BAED6" transform="rotate(-12 188 90)" />
      {/* Booties */}
      <ellipse cx="180" cy="104" rx="10" ry="7.5" fill="#4A9BC0" />
      <ellipse cx="194" cy="97" rx="10" ry="7.5" fill="#4A9BC0" />

      {/* Head */}
      <circle cx="87" cy="74" r="30" fill="#FFCBA4" />

      {/* Hair */}
      <ellipse cx="87" cy="49" rx="22" ry="10" fill="#5C3317" />
      <circle cx="68" cy="56" r="8" fill="#5C3317" />
      <circle cx="106" cy="56" r="8" fill="#5C3317" />
      <ellipse cx="87" cy="53" rx="18" ry="9" fill="#6B3D1E" />

      {/* Closed eyes */}
      <path d="M75 71 Q79 67 83 71" stroke="#8B5A2B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M91 71 Q95 67 99 71" stroke="#8B5A2B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* Lashes */}
      <path d="M75 71 L73 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M83 71 L83 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M91 71 L91 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M99 71 L101 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />

      {/* Nose */}
      <ellipse cx="87" cy="78" rx="3" ry="2.5" fill="#E8A882" />

      {/* Smile */}
      <path d="M78 86 Q87 94 96 86" stroke="#C0784A" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Cheeks */}
      <ellipse cx="68" cy="80" rx="10" ry="7" fill="#FFB3A5" opacity="0.65" />
      <ellipse cx="106" cy="80" rx="10" ry="7" fill="#FFB3A5" opacity="0.65" />

      {/* Arm */}
      <ellipse cx="112" cy="89" rx="15" ry="7.5" fill="#FFCBA4" transform="rotate(-28 112 89)" />
      <ellipse cx="122" cy="81" rx="9" ry="7" fill="#FFCBA4" />

      {/* Heart */}
      <text x="100" y="54" fontSize="16" fill="#FF6B8A" opacity="0.85" fontFamily="sans-serif">♥</text>
    </svg>
  )
}

/* ── Nav button ── */
function NavBtn({ icon, label, onClick, active }) {
  const color = active ? '#0096C7' : '#9CA3AF'
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        padding: '0 6px', color,
      }}
    >
      {icon}
      <span style={{ fontSize: 10, fontWeight: 500, color }}>{label}</span>
    </button>
  )
}

/* ── Icons ── */
function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  )
}
function HomeIconSvg({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinejoin="round" />
    </svg>
  )
}
