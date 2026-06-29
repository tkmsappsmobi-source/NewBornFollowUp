import { useState, useMemo, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import FeedingAmountSheet from '../components/FeedingAmountSheet'
import ManualLogForm from '../components/ManualLogForm'
import DiaperModal from '../components/DiaperModal'
import GrowthModal from '../components/GrowthModal'
import MilestoneModal from '../components/MilestoneModal'
import VaccinationModal from '../components/VaccinationModal'
import { formatTime, isToday, calcAge } from '../lib/time'

const ACTION_BUTTONS = [
  { id: 'diaper',      label: 'חיתול',    bg: '#C8F0E0', emoji: '🚼' },
  { id: 'feeding',     label: 'האכלה',    bg: '#FFF3CC', emoji: '🍼' },
  { id: 'sleep',       label: 'שינה',     bg: '#E0D8FF', emoji: '🌙' },
  { id: 'bath',        label: 'מקלחת',   bg: '#FFE4CC', emoji: '🛁' },
  { id: 'growth',      label: 'גדילה',    bg: '#C8F0E8', emoji: '📏' },
  { id: 'milestone',   label: 'אבן דרך', bg: '#FFD6EC', emoji: '⭐' },
  { id: 'vaccination', label: 'חיסון',   bg: '#E8E0FF', emoji: '💉' },
  { id: 'manual',      label: 'ידני',     bg: '#C8EEFF', emoji: '✏️' },
]

const BG_MAP = {
  diaper: '#C8F0E0', feeding: '#FFF3CC', sleep: '#E0D8FF', bath: '#FFE4CC',
  growth: '#C8F0E8', milestone: '#FFD6EC', vaccination: '#E8E0FF',
}

function fmtTimer(ms) {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function HomeScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [feedingOpen, setFeedingOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [diaperOpen, setDiaperOpen] = useState(false)
  const [growthOpen, setGrowthOpen] = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [vaccinationOpen, setVaccinationOpen] = useState(false)
  const [timerNow, setTimerNow] = useState(Date.now())
  const profileInputRef = useRef(null)

  useEffect(() => {
    if (!state.sleepTimerStart && !state.bottleTimerStart) return
    const id = setInterval(() => setTimerNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [state.sleepTimerStart, state.bottleTimerStart])

  const babyName = state.babyName || 'התינוק שלי'
  const ageStr = calcAge(state.birthDate)
  const today = new Date().toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const todayLogs = state.logs.filter(l => isToday(new Date(l.timestamp)))

  const allLogs = useMemo(() => {
    const combined = [
      ...state.logs.map(l => ({ ...l, _source: 'log' })),
      ...(state.weightLogs || []).map(l => ({ ...l, categoryId: 'growth', _source: 'weight' })),
      ...(state.milestoneLogs || []).map(l => ({ ...l, categoryId: 'milestone', _source: 'milestone' })),
    ]
    return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [state.logs, state.weightLogs, state.milestoneLogs])

  const recentLogs = allLogs.slice(0, 4)
  const catMap = Object.fromEntries(state.categories.map(c => [c.id, c]))

  const sleepToday = todayLogs.filter(l => l.categoryId === 'sleep').length
  const feedingToday = todayLogs.filter(l => l.categoryId === 'feeding').length
  const diaperToday = todayLogs.filter(l => l.categoryId === 'diaper').length

  const getRelativeTime = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'עכשיו'
    if (minutes < 60) return `לפני ${minutes} דק'`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `לפני ${hours} שע'`
    return `לפני ${hours}:${String(mins).padStart(2,'0')} שע'`
  }

  const getLogDetail = (log) => {
    if (log._source === 'weight') return `${log.weight} ק"ג`
    if (log._source === 'milestone') return log.description || ''
    if (log.amount) return `${log.amount} מ"ל`
    if (log.data && log.data.subtype) {
      const sub = { pee: 'פיפי', poop: 'קקי', both: 'שניהם' }
      return sub[log.data.subtype] || ''
    }
    return log.note || ''
  }

  const getCatInfo = (log) => {
    if (log._source === 'weight') return { emoji: '📏', label: 'גדילה', bg: '#C8F0E8' }
    if (log._source === 'milestone') return { emoji: '⭐', label: 'אבן דרך', bg: '#FFD6EC' }
    const cat = catMap[log.categoryId]
    return { emoji: cat?.emoji || '📝', label: cat?.label || 'פעולה', bg: BG_MAP[log.categoryId] || '#F3F4F6' }
  }

  const handleAction = (actionId) => {
    if (actionId === 'diaper') { setDiaperOpen(true); return }
    if (actionId === 'feeding') { setFeedingOpen(true); return }
    if (actionId === 'sleep') {
      if (state.sleepTimerStart) {
        const durationMs = Date.now() - new Date(state.sleepTimerStart).getTime()
        const durationMinutes = Math.round(durationMs / 60000)
        dispatch({ type: 'ADD_LOG', categoryId: 'sleep', data: { start: state.sleepTimerStart, durationMinutes } })
        dispatch({ type: 'SET_SLEEP_TIMER', start: null })
        showToast(`🌙 שינה נרשמה — ${durationMinutes} דקות`)
      } else {
        dispatch({ type: 'SET_SLEEP_TIMER', start: new Date().toISOString() })
        showToast('🌙 טיימר שינה התחיל')
      }
      return
    }
    if (actionId === 'bath') {
      dispatch({ type: 'ADD_LOG', categoryId: 'bath' })
      showToast('🛁 מקלחת נרשמה')
      return
    }
    if (actionId === 'growth') { setGrowthOpen(true); return }
    if (actionId === 'milestone') { setMilestoneOpen(true); return }
    if (actionId === 'vaccination') { setVaccinationOpen(true); return }
    if (actionId === 'manual') { setManualOpen(true); return }
  }

  const handleFeedingConfirm = (ml) => {
    setFeedingOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId: 'feeding', amount: ml })
    showToast(`🍼 האכלה ${ml} מ"ל נרשמה`)
  }

  const handleDiaperConfirm = (subtype) => {
    setDiaperOpen(false)
    const labels = { pee: 'פיפי', poop: 'קקי', both: 'שניהם' }
    dispatch({ type: 'ADD_LOG', categoryId: 'diaper', data: { subtype } })
    showToast(`🚼 חיתול (${labels[subtype]}) נרשם`)
  }

  const handleGrowthConfirm = ({ weight, height, headCircumference, note }) => {
    setGrowthOpen(false)
    dispatch({ type: 'ADD_WEIGHT', weight, height, headCircumference, note })
    showToast(`📏 גדילה ${weight} ק"ג נשמרה`)
  }

  const handleMilestoneConfirm = ({ description, category }) => {
    setMilestoneOpen(false)
    dispatch({ type: 'ADD_MILESTONE', description, category })
    showToast('⭐ אבן דרך נשמרה')
  }

  const handleVaccinationConfirm = ({ vaccineName, doctor, notes }) => {
    setVaccinationOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId: 'vaccination', note: vaccineName, data: { vaccineName, doctor, notes } })
    showToast(`💉 חיסון "${vaccineName}" נרשם`)
  }

  const handleManualSave = ({ categoryId, amount, note, timestamp }) => {
    setManualOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId, amount, note, timestamp })
    const cat = state.categories.find(c => c.id === categoryId)
    showToast(`${cat?.emoji ?? ''} ${cat?.label ?? ''} נרשם`)
  }

  const handleEndBottle = () => {
    const durationMs = Date.now() - new Date(state.bottleTimerStart).getTime()
    const durationMinutes = Math.round(durationMs / 60000)
    dispatch({ type: 'SET_BOTTLE_TIMER', start: null })
    showToast(`🍼 בקבוק הסתיים — ${durationMinutes} דקות`)
  }

  const handleProfileImageUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 200
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        dispatch({ type: 'SET_PROFILE_IMAGE', image: dataUrl })
        showToast('📸 תמונת פרופיל עודכנה')
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <style>{`
        .hs-root{width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#F0F8FF;font-family:Heebo,sans-serif;}
        .hs-header{flex-shrink:0;position:relative;overflow:hidden;background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 35%,#C8EDFA 70%,#E4F6FC 100%);}
        .hs-header-top{display:flex;flex-direction:column;align-items:center;padding:clamp(10px,3vw,16px) clamp(12px,4vw,20px) clamp(14px,4vw,20px);position:relative;z-index:2;}
        .hs-profile-circle{width:clamp(52px,14vw,68px);height:clamp(52px,14vw,68px);border-radius:50%;background:rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;font-size:clamp(26px,7vw,36px);cursor:pointer;border:3px solid rgba(255,255,255,0.9);box-shadow:0 2px 10px rgba(0,0,0,0.12);overflow:hidden;margin-bottom:clamp(4px,1.5vw,8px);}
        .hs-profile-circle img{width:100%;height:100%;object-fit:cover;}
        .hs-name{margin:0;font-size:clamp(26px,8vw,44px);font-weight:900;color:#0D2640;line-height:1.05;letter-spacing:-1px;}
        .hs-age{font-size:clamp(11px,3vw,14px);font-weight:600;color:#1A5A8A;margin:clamp(2px,0.8vw,5px) 0 0;}
        .hs-date{font-size:clamp(10px,2.8vw,13px);color:#3A7BA8;margin:2px 0 0;}
        .hs-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:clamp(80px,20vw,100px);}
        .hs-inner{padding:clamp(10px,3vw,16px) clamp(10px,4vw,16px) 0;}
        .hs-card{background:white;border-radius:clamp(14px,4vw,20px);padding:clamp(12px,3.5vw,16px);margin-bottom:clamp(8px,2.5vw,14px);box-shadow:0 2px 14px rgba(0,0,0,0.07);}
        .hs-card-title{display:flex;flex-direction:row-reverse;justify-content:space-between;align-items:center;margin-bottom:clamp(8px,2.5vw,14px);}
        .hs-card-title span{font-size:clamp(13px,3.5vw,16px);font-weight:700;color:#111827;}
        .hs-stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(6px,2vw,12px);}
        .hs-stat-box{border-radius:clamp(10px,3vw,16px);padding:clamp(8px,2.5vw,14px) clamp(4px,1.5vw,8px);text-align:center;}
        .hs-stat-emoji{font-size:clamp(20px,6vw,30px);line-height:1;margin-bottom:4px;}
        .hs-stat-num{font-size:clamp(18px,5.5vw,26px);font-weight:800;color:#111827;margin:0;line-height:1;}
        .hs-stat-lbl{font-size:clamp(9px,2.5vw,12px);color:#6B7280;margin:3px 0 0;font-weight:500;}
        .hs-features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(8px,2.5vw,14px);}
        .hs-feat-btn{background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:clamp(4px,1.5vw,8px);-webkit-tap-highlight-color:transparent;}
        .hs-feat-icon{width:100%;aspect-ratio:1;border-radius:clamp(12px,3.5vw,20px);display:flex;align-items:center;justify-content:center;font-size:clamp(20px,6vw,30px);transition:transform 0.12s;}
        .hs-feat-icon:active{transform:scale(0.89);}
        .hs-feat-lbl{font-size:clamp(9px,2.5vw,12px);font-weight:600;color:#374151;text-align:center;line-height:1.25;}
        .hs-timer-card{background:#FFF3E0;border-radius:clamp(14px,4vw,20px);padding:clamp(10px,3vw,14px);margin-bottom:clamp(8px,2.5vw,14px);box-shadow:0 2px 10px rgba(0,0,0,0.06);}
        .hs-timer-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;gap:8px;}
        .hs-timer-label{font-size:clamp(12px,3vw,15px);font-weight:700;color:#374151;}
        .hs-timer-time{font-size:clamp(14px,4vw,18px);font-weight:800;color:#D97706;font-variant-numeric:tabular-nums;}
        .hs-timer-end{background:#EF4444;color:white;border:none;border-radius:10px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;min-height:44px;flex-shrink:0;}
        .hs-recent-row{display:flex;align-items:center;gap:clamp(6px,2vw,12px);padding:clamp(8px,2.5vw,12px) 0;direction:rtl;}
        .hs-recent-row + .hs-recent-row{border-top:1px solid #F3F4F6;}
        .hs-recent-time-val{font-size:clamp(12px,3.5vw,15px);font-weight:700;color:#111827;margin:0;line-height:1.25;}
        .hs-recent-time-rel{font-size:clamp(9px,2.5vw,11px);color:#9CA3AF;margin:0;line-height:1.4;}
        .hs-recent-circle{border-radius:50%;display:flex;align-items:center;justify-content:center;width:clamp(36px,10vw,46px);height:clamp(36px,10vw,46px);font-size:clamp(18px,5vw,24px);flex-shrink:0;}
        .hs-recent-name{font-size:clamp(12px,3.5vw,15px);font-weight:700;color:#111827;margin:0;line-height:1.25;}
        .hs-recent-detail{font-size:clamp(9px,2.5vw,12px);color:#9CA3AF;margin:0;line-height:1.4;}
        .hs-nav{position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:white;border-top:1px solid #E5E7EB;display:flex;align-items:flex-end;justify-content:space-around;padding-bottom:max(env(safe-area-inset-bottom,0px),10px);padding-top:clamp(6px,1.5vw,10px);z-index:50;direction:ltr;}
        .hs-nav-btn{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0 clamp(4px,2vw,10px);-webkit-tap-highlight-color:transparent;}
        .hs-nav-btn span{font-size:clamp(9px,2.5vw,11px);font-weight:500;}
        .hs-nav-plus{width:clamp(50px,13vw,62px);height:clamp(50px,13vw,62px);border-radius:50%;background:linear-gradient(135deg,#48CAE4 0%,#0096C7 100%);border:none;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,150,199,0.45);margin-bottom:clamp(8px,2.5vw,14px);transition:transform 0.12s;-webkit-tap-highlight-color:transparent;}
        .hs-nav-plus:active{transform:scale(0.91);}
        .hs-nav-plus svg{width:clamp(22px,6vw,28px);height:clamp(22px,6vw,28px);}
      `}</style>

      <div className="hs-root" dir="rtl">

        {/* HEADER */}
        <div className="hs-header">
          {[{top:22,left:32,size:17,op:1},{top:14,left:68,size:11,op:0.8},{top:52,left:22,size:9,op:0.6},{top:85,left:82,size:13,op:0.7},{top:28,right:140,size:10,op:0.7},{top:65,right:50,size:8,op:0.5}].map((s,i)=>(
            <span key={i} style={{position:'absolute',top:s.top,left:s.left,right:s.right,fontSize:s.size,color:'#FFD700',opacity:s.op,lineHeight:1,pointerEvents:'none'}}>★</span>
          ))}
          <div style={{position:'absolute',top:-8,right:-12,pointerEvents:'none'}}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="50" cy="34" r="30" fill="#FFD54F"/><circle cx="50" cy="34" r="27" fill="#FFCA28"/>
              <ellipse cx="43" cy="30" rx="3" ry="3.5" fill="#8B6500"/><ellipse cx="57" cy="30" rx="3" ry="3.5" fill="#8B6500"/>
              <path d="M43 40 Q50 47 57 40" stroke="#8B6500" strokeWidth="2" fill="none" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{position:'absolute',top:10,left:2,pointerEvents:'none'}}>
            <svg width="58" height="58" viewBox="0 0 58 58" fill="none">
              <defs><mask id="moonMaskHS"><rect width="58" height="58" fill="white"/><circle cx="38" cy="20" r="22" fill="black"/></mask></defs>
              <circle cx="24" cy="30" r="24" fill="#FFF9C4" mask="url(#moonMaskHS)"/>
              <circle cx="24" cy="30" r="22" fill="#FFF176" mask="url(#moonMaskHS)"/>
            </svg>
          </div>

          <div className="hs-header-top">
            <input ref={profileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleProfileImageUpload}/>
            <div className="hs-profile-circle" onClick={()=>profileInputRef.current&&profileInputRef.current.click()}>
              {state.profileImage ? <img src={state.profileImage} alt="פרופיל"/> : <span>👶</span>}
            </div>
            <h1 className="hs-name">{babyName}</h1>
            <p className="hs-age">{ageStr || 'הגדר תאריך לידה'}</p>
            <p className="hs-date">{today}</p>
          </div>

        </div>

        {/* SCROLL */}
        <div className="hs-scroll">
          <div className="hs-inner">

            {/* Daily summary */}
            <div className="hs-card">
              <div className="hs-card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="17" rx="3" stroke="#4A90D9" strokeWidth="1.8" fill="#EEF6FF"/>
                  <path d="M7 2v4M17 2v4M2 9h20" stroke="#4A90D9" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span>סיכום היום</span>
              </div>
              <div className="hs-stats-grid">
                <div className="hs-stat-box" style={{background:'#E0D8FF'}}>
                  <div className="hs-stat-emoji">🌙</div>
                  <p className="hs-stat-num">{sleepToday}</p>
                  <p className="hs-stat-lbl">שינה</p>
                </div>
                <div className="hs-stat-box" style={{background:'#FFF3CC'}}>
                  <div className="hs-stat-emoji">🍼</div>
                  <p className="hs-stat-num">{feedingToday}</p>
                  <p className="hs-stat-lbl">האכלה</p>
                </div>
                <div className="hs-stat-box" style={{background:'#C8F0E0'}}>
                  <div className="hs-stat-emoji">🚼</div>
                  <p className="hs-stat-num">{diaperToday}</p>
                  <p className="hs-stat-lbl">חיתול</p>
                </div>
              </div>
            </div>

            {/* Live Timers */}
            {(state.sleepTimerStart || state.bottleTimerStart) && (
              <div className="hs-timer-card">
                {state.sleepTimerStart && (
                  <div className="hs-timer-row">
                    <div>
                      <span className="hs-timer-label">שינה בעיצומה ⏱️ </span>
                      <span className="hs-timer-time">{fmtTimer(timerNow - new Date(state.sleepTimerStart).getTime())}</span>
                    </div>
                    <button className="hs-timer-end" onClick={()=>handleAction('sleep')}>סיום</button>
                  </div>
                )}
                {state.bottleTimerStart && (
                  <div className="hs-timer-row">
                    <div>
                      <span className="hs-timer-label">בקבוק בעיצומה ⏱️ </span>
                      <span className="hs-timer-time">{fmtTimer(timerNow - new Date(state.bottleTimerStart).getTime())}</span>
                    </div>
                    <button className="hs-timer-end" onClick={handleEndBottle}>סיום</button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="hs-card">
              <div className="hs-card-title">
                <span style={{fontSize:'clamp(16px,5vw,22px)'}}>⚡</span>
                <span>פעולות מהירות</span>
              </div>
              <div className="hs-features-grid">
                {ACTION_BUTTONS.map(action => (
                  <button key={action.id} className="hs-feat-btn" onClick={()=>handleAction(action.id)}>
                    <div className="hs-feat-icon" style={{background: action.id==='sleep' && state.sleepTimerStart ? '#9C89E6' : action.bg}}>
                      {action.emoji}
                    </div>
                    <span className="hs-feat-lbl">{action.id==='sleep' && state.sleepTimerStart ? 'סיום שינה' : action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent */}
            {recentLogs.length > 0 && (
              <div className="hs-card">
                <div className="hs-card-title">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/>
                  </svg>
                  <span>הפעולות האחרונות</span>
                </div>
                {recentLogs.map(log => {
                  const info = getCatInfo(log)
                  return (
                    <div key={log.id} className="hs-recent-row">
                      <div className="hs-recent-circle" style={{background:info.bg}}>{info.emoji}</div>
                      <div style={{flex:1}}>
                        <p className="hs-recent-name">{info.label}</p>
                        <p className="hs-recent-detail">{getLogDetail(log)}</p>
                      </div>
                      <div style={{minWidth:'clamp(44px,12vw,58px)',flexShrink:0,textAlign:'left'}}>
                        <p className="hs-recent-time-val">{formatTime(log.timestamp)}</p>
                        <p className="hs-recent-time-rel">{getRelativeTime(log.timestamp)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        </div>

        {/* BOTTOM NAV */}
        <nav className="hs-nav">
          <NavBtn icon={<PersonIcon/>} label="פרופיל" color="#9CA3AF" onClick={()=>setTab('profile')}/>
          <NavBtn icon={<ChartIcon/>} label="גרפים" color="#9CA3AF" onClick={()=>setTab('stats')}/>
          <button className="hs-nav-plus" onClick={()=>setManualOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"><path d="M12 4v16M4 12h16"/></svg>
          </button>
          <NavBtn icon={<ClockIcon/>} label="היסטוריה" color="#9CA3AF" onClick={()=>setTab('history')}/>
          <NavBtn icon={<HomeIconSvg/>} label="בית" color="#0096C7" onClick={()=>{}}/>
        </nav>

        {/* Modals */}
        {feedingOpen && <FeedingAmountSheet quickAmounts={state.feedingQuickAmounts} onConfirm={handleFeedingConfirm} onClose={()=>setFeedingOpen(false)}/>}
        {diaperOpen && <DiaperModal onConfirm={handleDiaperConfirm} onClose={()=>setDiaperOpen(false)}/>}
        {growthOpen && <GrowthModal onConfirm={handleGrowthConfirm} onClose={()=>setGrowthOpen(false)}/>}
        {milestoneOpen && <MilestoneModal onConfirm={handleMilestoneConfirm} onClose={()=>setMilestoneOpen(false)}/>}
        {vaccinationOpen && <VaccinationModal onConfirm={handleVaccinationConfirm} onClose={()=>setVaccinationOpen(false)}/>}
        {manualOpen && <ManualLogForm categories={state.categories} onSave={handleManualSave} onClose={()=>setManualOpen(false)}/>}
      </div>
    </>
  )
}

function BabyOnCloud() {
  return (
    <svg viewBox="0 0 240 118" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="120" cy="108" rx="108" ry="16" fill="white" opacity="0.96"/>
      <ellipse cx="78" cy="97" rx="42" ry="25" fill="white" opacity="0.96"/>
      <ellipse cx="120" cy="90" rx="50" ry="30" fill="white" opacity="0.96"/>
      <ellipse cx="162" cy="97" rx="42" ry="25" fill="white" opacity="0.96"/>
      <ellipse cx="143" cy="82" rx="45" ry="24" fill="#6BBFDF"/>
      <ellipse cx="143" cy="82" rx="42" ry="21" fill="#5BAED6"/>
      <circle cx="87" cy="74" r="30" fill="#FFCBA4"/>
      <ellipse cx="87" cy="49" rx="22" ry="10" fill="#5C3317"/>
      <ellipse cx="87" cy="53" rx="18" ry="9" fill="#6B3D1E"/>
      <path d="M78 86 Q87 94 96 86" stroke="#C0784A" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="68" cy="80" rx="10" ry="7" fill="#FFB3A5" opacity="0.65"/>
      <ellipse cx="106" cy="80" rx="10" ry="7" fill="#FFB3A5" opacity="0.65"/>
      <text x="100" y="54" fontSize="16" fill="#FF6B8A" opacity="0.85" fontFamily="sans-serif">♥</text>
    </svg>
  )
}

function NavBtn({ icon, label, onClick, color }) {
  return (
    <button className="hs-nav-btn" onClick={onClick} style={{color}}>
      {icon}
      <span style={{color}}>{label}</span>
    </button>
  )
}

function PersonIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>
}
function ChartIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>
}
function ClockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
}
function HomeIconSvg() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinejoin="round"/></svg>
}
