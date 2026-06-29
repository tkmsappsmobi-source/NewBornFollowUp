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
    if (actionId === 'weight') { setWeightOpen(true); return }
    const cat = state.categories.find(c => c.id === actionId)
    if (!cat) return
    if (cat.type === 'feeding') setFeedingOpen(true)
    else if (cat.type === 'weight') setWeightOpen(true)
    else { dispatch({ type: 'ADD_LOG', categoryId: cat.id }); showToast(`${cat.emoji} ${cat.label} נרשם`) }
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
      if (cat) { if (!counts[cat.id]) counts[cat.id] = { cat, count: 0 }; counts[cat.id].count++ }
    })
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 3)
  }, [todayLogs, catMap])

  const today = new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })

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
    <>
      <style>{`
        .hs-root {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #F0F8FF;
          font-family: Heebo, sans-serif;
        }
        /* ── Header ── */
        .hs-header {
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 35%,#C8EDFA 70%,#E4F6FC 100%);
        }
        .hs-header-text {
          text-align: center;
          padding-top: clamp(12px, 3vw, 20px);
          position: relative;
          z-index: 2;
        }
        .hs-date {
          margin: 0;
          font-size: clamp(11px, 3vw, 14px);
          font-weight: 500;
          color: #1A3A5C;
        }
        .hs-name {
          margin: clamp(2px,1vw,6px) 0 clamp(4px,1.5vw,10px);
          font-size: clamp(32px, 10vw, 52px);
          font-weight: 900;
          color: #0D2640;
          line-height: 1.05;
          letter-spacing: -1px;
        }
        .hs-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.6);
          border-radius: 24px;
          padding: clamp(4px,1vw,6px) clamp(12px,3vw,18px);
          backdrop-filter: blur(6px);
          font-size: clamp(11px, 3vw, 14px);
          font-weight: 700;
          color: #1A5A8A;
        }
        .hs-illustration {
          display: flex;
          justify-content: center;
          margin-top: clamp(2px, 1vw, 6px);
        }
        .hs-illustration svg {
          width: clamp(180px, 65vw, 260px);
          height: auto;
        }
        /* ── Scroll area ── */
        .hs-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          padding-bottom: clamp(80px, 20vw, 100px);
        }
        .hs-inner {
          padding: clamp(10px, 3vw, 16px) clamp(10px, 4vw, 16px) 0;
        }
        /* ── Cards ── */
        .hs-card {
          background: white;
          border-radius: clamp(14px, 4vw, 20px);
          padding: clamp(12px, 3.5vw, 16px) clamp(12px, 3.5vw, 16px);
          margin-bottom: clamp(8px, 2.5vw, 14px);
          box-shadow: 0 2px 14px rgba(0,0,0,0.07);
        }
        .hs-card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: clamp(8px, 2.5vw, 14px);
        }
        .hs-card-title span {
          font-size: clamp(13px, 3.5vw, 16px);
          font-weight: 700;
          color: #111827;
        }
        /* ── Summary stats ── */
        .hs-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(6px, 2vw, 12px);
        }
        .hs-stat-box {
          border-radius: clamp(10px, 3vw, 16px);
          padding: clamp(8px, 2.5vw, 14px) clamp(4px, 1.5vw, 8px);
          text-align: center;
        }
        .hs-stat-emoji { font-size: clamp(20px, 6vw, 30px); line-height: 1; margin-bottom: 4px; }
        .hs-stat-num { font-size: clamp(18px, 5.5vw, 26px); font-weight: 800; color: #111827; margin: 0; line-height: 1; }
        .hs-stat-lbl { font-size: clamp(9px, 2.5vw, 12px); color: #6B7280; margin: 3px 0 0; font-weight: 500; }
        /* ── Features grid ── */
        .hs-features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(8px, 2.5vw, 14px);
        }
        .hs-feat-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: clamp(4px,1.5vw,8px);
          -webkit-tap-highlight-color: transparent;
        }
        .hs-feat-icon {
          width: 100%;
          aspect-ratio: 1;
          border-radius: clamp(12px, 3.5vw, 20px);
          display: flex; align-items: center; justify-content: center;
          font-size: clamp(20px, 6vw, 30px);
          transition: transform 0.12s;
        }
        .hs-feat-icon:active { transform: scale(0.89); }
        .hs-feat-lbl {
          font-size: clamp(9px, 2.5vw, 12px);
          font-weight: 600; color: #374151;
          text-align: center; line-height: 1.25;
        }
        /* ── Recent ── */
        .hs-recent-row {
          display: flex; align-items: center;
          gap: clamp(6px, 2vw, 12px);
          padding: clamp(8px, 2.5vw, 12px) 0;
          direction: ltr;
        }
        .hs-recent-row + .hs-recent-row { border-top: 1px solid #F3F4F6; }
        .hs-recent-time-val { font-size: clamp(12px, 3.5vw, 15px); font-weight: 700; color: #111827; margin: 0; line-height: 1.25; }
        .hs-recent-time-rel { font-size: clamp(9px, 2.5vw, 11px); color: #9CA3AF; margin: 0; line-height: 1.4; }
        .hs-recent-circle {
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          width: clamp(36px, 10vw, 46px); height: clamp(36px, 10vw, 46px);
          font-size: clamp(18px, 5vw, 24px); flex-shrink: 0;
        }
        .hs-recent-name { font-size: clamp(12px, 3.5vw, 15px); font-weight: 700; color: #111827; margin: 0; line-height: 1.25; }
        .hs-recent-detail { font-size: clamp(9px, 2.5vw, 12px); color: #9CA3AF; margin: 0; line-height: 1.4; }
        /* ── Bottom nav ── */
        .hs-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          max-width: 480px; margin: 0 auto;
          background: white; border-top: 1px solid #E5E7EB;
          display: flex; align-items: flex-end; justify-content: space-around;
          padding-bottom: max(env(safe-area-inset-bottom, 0px), 10px);
          padding-top: clamp(6px, 1.5vw, 10px);
          z-index: 50; direction: ltr;
        }
        .hs-nav-btn {
          background: none; border: none; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          padding: 0 clamp(4px, 2vw, 10px);
          -webkit-tap-highlight-color: transparent;
        }
        .hs-nav-btn span { font-size: clamp(9px, 2.5vw, 11px); font-weight: 500; }
        .hs-nav-plus {
          width: clamp(50px, 13vw, 62px); height: clamp(50px, 13vw, 62px);
          border-radius: 50%;
          background: linear-gradient(135deg, #48CAE4 0%, #0096C7 100%);
          border: none; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 18px rgba(0,150,199,0.45);
          margin-bottom: clamp(8px, 2.5vw, 14px);
          transition: transform 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .hs-nav-plus:active { transform: scale(0.91); }
        .hs-nav-plus svg { width: clamp(22px, 6vw, 28px); height: clamp(22px, 6vw, 28px); }
      `}</style>

      <div className="hs-root" dir="rtl">

        {/* ── HEADER ── */}
        <div className="hs-header">

          {/* Stars */}
          {[
            { top: 22, left: 32, size: 17, op: 1 },
            { top: 14, left: 68, size: 11, op: 0.8 },
            { top: 52, left: 22, size: 9, op: 0.6 },
            { top: 85, left: 82, size: 13, op: 0.7 },
            { top: 28, right: 140, size: 10, op: 0.7 },
            { top: 65, right: 50, size: 8, op: 0.5 },
          ].map((s, i) => (
            <span key={i} style={{ position: 'absolute', top: s.top, left: s.left, right: s.right, fontSize: s.size, color: '#FFD700', opacity: s.op, lineHeight: 1, pointerEvents: 'none' }}>★</span>
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

          {/* Text */}
          <div className="hs-header-text">
            <p className="hs-date">{today} • היום</p>
            <h1 className="hs-name">{babyName}</h1>
            <div className="hs-badge">
              <span>מעקב תינוק</span>
              <span style={{ fontSize: 16 }}>⭐</span>
            </div>
          </div>

          {/* Baby illustration */}
          <div className="hs-illustration">
            <BabyOnCloud />
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="hs-scroll">
          <div className="hs-inner">

            {/* סיכום היום */}
            <div className="hs-card">
              <div className="hs-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="17" rx="3" stroke="#4A90D9" strokeWidth="1.8" fill="#EEF6FF" />
                  <path d="M7 2v4M17 2v4M2 9h20" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span>סיכום היום</span>
              </div>

              {todayStats.length > 0 ? (
                <div className="hs-stats-grid">
                  {todayStats.map(({ cat, count }) => (
                    <div key={cat.id} className="hs-stat-box" style={{ background: ACTION_BG_MAP[cat.id] || '#F3F4F6' }}>
                      <div className="hs-stat-emoji">{cat.emoji}</div>
                      <p className="hs-stat-num">{count}</p>
                      <p className="hs-stat-lbl">{cat.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', color: '#9CA3AF', fontSize: 'clamp(11px,3vw,14px)', margin: 0 }}>
                  עדיין אין פעילויות היום 👆
                </p>
              )}
            </div>

            {/* פיצ'רים */}
            <div className="hs-card">
              <div className="hs-card-title">
                <span style={{ fontSize: 'clamp(16px,5vw,22px)' }}>⭐</span>
                <span>פיצ'רים</span>
              </div>

              <div className="hs-features-grid">
                {ACTION_BUTTONS.map(action => (
                  <button key={action.id} className="hs-feat-btn" onClick={() => handleAction(action.id)}>
                    <div className="hs-feat-icon" style={{ background: action.bg }}>
                      {action.emoji}
                    </div>
                    <span className="hs-feat-lbl">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* הפעולות האחרונות */}
            {recentLogs.length > 0 && (
              <div className="hs-card">
                <div className="hs-card-title">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                  </svg>
                  <span>{recentLogs.length} הפעולות האחרונות</span>
                </div>

                {recentLogs.map((log) => {
                  const cat = catMap[log.categoryId]
                  return (
                    <div key={log.id} className="hs-recent-row">
                      <span style={{ color: '#D1D5DB', fontSize: 'clamp(14px,4vw,20px)', flexShrink: 0 }}>‹</span>
                      <div style={{ minWidth: 'clamp(44px,12vw,58px)', flexShrink: 0 }}>
                        <p className="hs-recent-time-val">{formatTime(new Date(log.timestamp))}</p>
                        <p className="hs-recent-time-rel">{getRelativeTime(log.timestamp)}</p>
                      </div>
                      <div className="hs-recent-circle" style={{ background: ACTION_BG_MAP[log.categoryId] || '#F3F4F6' }}>
                        {cat?.emoji || '📝'}
                      </div>
                      <div style={{ flex: 1, textAlign: 'right', direction: 'rtl' }}>
                        <p className="hs-recent-name">{cat?.label || 'פעולה'}</p>
                        <p className="hs-recent-detail">{log.amount ? `${log.amount} מ״ל` : log.note || cat?.label || ''}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav className="hs-nav">
          <NavBtn icon={<PersonIcon />} label="פרופיל" color="#9CA3AF" onClick={() => setTab('settings')} />
          <NavBtn icon={<ChartIcon />} label="גרפים" color="#9CA3AF" onClick={() => setTab('stats')} />

          <button className="hs-nav-plus" onClick={() => setManualOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round">
              <path d="M12 4v16M4 12h16" />
            </svg>
          </button>

          <NavBtn icon={<ClockIcon />} label="היסטוריה" color="#9CA3AF" onClick={() => setTab('history')} />
          <NavBtn icon={<HomeIconSvg />} label="בית" color="#0096C7" onClick={() => {}} />
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
    </>
  )
}

/* ── Baby illustration ── */
function BabyOnCloud() {
  return (
    <svg viewBox="0 0 240 118" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="120" cy="108" rx="108" ry="16" fill="white" opacity="0.96" />
      <ellipse cx="78" cy="97" rx="42" ry="25" fill="white" opacity="0.96" />
      <ellipse cx="120" cy="90" rx="50" ry="30" fill="white" opacity="0.96" />
      <ellipse cx="162" cy="97" rx="42" ry="25" fill="white" opacity="0.96" />
      <ellipse cx="198" cy="103" rx="28" ry="18" fill="white" opacity="0.9" />
      <ellipse cx="42" cy="103" rx="28" ry="18" fill="white" opacity="0.9" />
      <ellipse cx="143" cy="82" rx="45" ry="24" fill="#6BBFDF" />
      <ellipse cx="143" cy="82" rx="42" ry="21" fill="#5BAED6" />
      <text x="126" y="82" fontSize="9" fill="white" opacity="0.6" fontFamily="sans-serif">★</text>
      <text x="143" y="76" fontSize="7" fill="white" opacity="0.6" fontFamily="sans-serif">★</text>
      <text x="155" y="86" fontSize="8" fill="white" opacity="0.6" fontFamily="sans-serif">★</text>
      <ellipse cx="172" cy="97" rx="15" ry="10" fill="#5BAED6" transform="rotate(25 172 97)" />
      <ellipse cx="188" cy="90" rx="14" ry="9" fill="#5BAED6" transform="rotate(-12 188 90)" />
      <ellipse cx="180" cy="104" rx="10" ry="7.5" fill="#4A9BC0" />
      <ellipse cx="194" cy="97" rx="10" ry="7.5" fill="#4A9BC0" />
      <circle cx="87" cy="74" r="30" fill="#FFCBA4" />
      <ellipse cx="87" cy="49" rx="22" ry="10" fill="#5C3317" />
      <circle cx="68" cy="56" r="8" fill="#5C3317" />
      <circle cx="106" cy="56" r="8" fill="#5C3317" />
      <ellipse cx="87" cy="53" rx="18" ry="9" fill="#6B3D1E" />
      <path d="M75 71 Q79 67 83 71" stroke="#8B5A2B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M91 71 Q95 67 99 71" stroke="#8B5A2B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M75 71 L73 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M83 71 L83 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M91 71 L91 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M99 71 L101 68" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="87" cy="78" rx="3" ry="2.5" fill="#E8A882" />
      <path d="M78 86 Q87 94 96 86" stroke="#C0784A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="68" cy="80" rx="10" ry="7" fill="#FFB3A5" opacity="0.65" />
      <ellipse cx="106" cy="80" rx="10" ry="7" fill="#FFB3A5" opacity="0.65" />
      <ellipse cx="112" cy="89" rx="15" ry="7.5" fill="#FFCBA4" transform="rotate(-28 112 89)" />
      <ellipse cx="122" cy="81" rx="9" ry="7" fill="#FFCBA4" />
      <text x="100" y="54" fontSize="16" fill="#FF6B8A" opacity="0.85" fontFamily="sans-serif">♥</text>
    </svg>
  )
}

/* ── Nav button ── */
function NavBtn({ icon, label, onClick, color }) {
  return (
    <button className="hs-nav-btn" onClick={onClick} style={{ color }}>
      {icon}
      <span style={{ color }}>{label}</span>
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
function HomeIconSvg() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinejoin="round" />
    </svg>
  )
}
