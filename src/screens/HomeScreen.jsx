import { useState, useMemo, useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'
import FeedingAmountSheet from '../components/FeedingAmountSheet'
import ManualLogForm from '../components/ManualLogForm'
import DiaperModal from '../components/DiaperModal'
import GrowthModal from '../components/GrowthModal'
import MilestoneModal from '../components/MilestoneModal'
import VaccinationModal from '../components/VaccinationModal'
import MedicineModal from '../components/MedicineModal'
import { formatTime, isToday, calcAge } from '../lib/time'

const ACTION_BUTTONS = [
  { id: 'diaper',      label: 'חיתול',    bg: '#C8F0E0', emoji: null, icon: '/diaper-icon.png' },
  { id: 'feeding',     label: 'האכלה',    bg: '#FFF3CC', emoji: null, icon: '/bottle-icon.png' },
  { id: 'sleep',       label: 'שינה',     bg: '#E0D8FF', emoji: null, icon: '/sleep-icon.png' },
  { id: 'bath',        label: 'מקלחת',   bg: '#FFE4CC', emoji: null, icon: '/bath-icon.png' },
  { id: 'growth',      label: 'משקל',    bg: '#C8F0E8', emoji: null, icon: '/growth-icon.png' },
  { id: 'vaccination', label: 'חיסון',   bg: '#E8E0FF', emoji: null, icon: '/vaccine-icon.png' },
  { id: 'medicine',    label: 'תרופה',   bg: '#FCE7F3', emoji: null, icon: '/medicine-icon.png' },
  { id: 'milestone',   label: 'אבן דרך', bg: '#FFD6EC', emoji: '⭐', icon: null },
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

// Isolated so its 1s tick re-renders only this small subtree, not the whole HomeScreen.
function TimerSection({ sleepTimerStart, bottleTimerStart, onEndSleep, onEndBottle, onCancelSleep, onCancelBottle }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!sleepTimerStart && !bottleTimerStart) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [sleepTimerStart, bottleTimerStart])

  const active = !!(sleepTimerStart || bottleTimerStart)
  return (
    <div className={`hs-timer-wrap${active ? ' active' : ''}`}>
      <div className="hs-timer-card">
        {sleepTimerStart && (
          <div className="hs-timer-row">
            <div>
              <span className="hs-timer-label">שינה בעיצומה ⏱️ </span>
              <span className="hs-timer-time">{fmtTimer(now - new Date(sleepTimerStart).getTime())}</span>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button className="hs-timer-cancel" onClick={onCancelSleep} title="בטל טיימר">✕</button>
              <button className="hs-timer-end" onClick={onEndSleep}>סיום</button>
            </div>
          </div>
        )}
        {bottleTimerStart && (
          <div className="hs-timer-row">
            <div>
              <span className="hs-timer-label">בקבוק בעיצומו ⏱️ </span>
              <span className="hs-timer-time">{fmtTimer(now - new Date(bottleTimerStart).getTime())}</span>
            </div>
            <div style={{display:'flex',gap:6}}>
              <button className="hs-timer-cancel" onClick={onCancelBottle} title="בטל טיימר">✕</button>
              <button className="hs-timer-end" onClick={onEndBottle}>סיום</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomeScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [feedingOpen, setFeedingOpen] = useState(false)
  const [manualOpen, setManualOpen] = useState(false)
  const [diaperOpen, setDiaperOpen] = useState(false)
  const [growthOpen, setGrowthOpen] = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [vaccinationOpen, setVaccinationOpen] = useState(false)
  const [medicineOpen, setMedicineOpen] = useState(false)
  const profileInputRef = useRef(null)

  const babyName = state.babyName || 'התינוק שלי'
  const ageStr = calcAge(state.birthDate)
  const birthDateStr = state.birthDate
    ? new Date(state.birthDate).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

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
  const catMap = useMemo(() => Object.fromEntries(state.categories.map(c => [c.id, c])), [state.categories])

  const sleepToday = todayLogs.filter(l => l.categoryId === 'sleep').length
  const feedingToday = todayLogs.filter(l => l.categoryId === 'feeding').length
  const peeToday = todayLogs.filter(l => l.categoryId === 'diaper' && (l.data?.subtype === 'pee' || l.data?.subtype === 'both')).length
  const poopToday = todayLogs.filter(l => l.categoryId === 'diaper' && (l.data?.subtype === 'poop' || l.data?.subtype === 'both')).length
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

  const ICON_MAP = {
    feeding:     '/bottle-icon.png',
    sleep:       '/sleep-icon.png',
    bath:        '/bath-icon.png',
    vaccination: '/vaccine-icon.png',
    diaper:      (log) => log.data?.subtype === 'pee' ? '/pee-icon.png' : log.data?.subtype === 'poop' ? '/poop-icon.png' : '/diaper-icon.png',
    medicine:    '/medicine-icon.png',
  }
  const getCatInfo = (log) => {
    if (log._source === 'weight')    return { icon: '/growth-icon.png', label: 'משקל',    bg: '#C8F0E8' }
    if (log._source === 'milestone') return { emoji: '⭐', label: 'אבן דרך', bg: '#FFD6EC' }
    const cat = catMap[log.categoryId]
    const iconVal = ICON_MAP[log.categoryId]
    const icon = typeof iconVal === 'function' ? iconVal(log) : iconVal || null
    return { emoji: cat?.emoji || '📝', icon, label: cat?.label || 'פעולה', bg: BG_MAP[log.categoryId] || '#F3F4F6' }
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
        showToast(`שינה נרשמה — ${durationMinutes} דקות`, 'success', '/sleep-icon.png')
      } else {
        dispatch({ type: 'SET_SLEEP_TIMER', start: new Date().toISOString() })
        showToast('טיימר שינה התחיל', 'success', '/sleep-icon.png')
      }
      return
    }
    if (actionId === 'bath') {
      dispatch({ type: 'ADD_LOG', categoryId: 'bath' })
      showToast('מקלחת נרשמה', 'success', '/bath-icon.png')
      return
    }
    if (actionId === 'growth') { setGrowthOpen(true); return }
    if (actionId === 'milestone') { setMilestoneOpen(true); return }
    if (actionId === 'vaccination') { setVaccinationOpen(true); return }
    if (actionId === 'medicine') { setMedicineOpen(true); return }
    if (actionId === 'manual') { setManualOpen(true); return }
  }

  const handleFeedingConfirm = (ml, bottleStart) => {
    setFeedingOpen(false)
    const now = new Date().toISOString()
    if (bottleStart) {
      const durationMs = Date.now() - new Date(bottleStart).getTime()
      const durationMinutes = Math.round(durationMs / 60000)
      dispatch({ type: 'ADD_LOG', categoryId: 'feeding', amount: ml, data: { start: bottleStart, end: now, durationMinutes } })
      dispatch({ type: 'SET_BOTTLE_TIMER', start: null })
    } else {
      dispatch({ type: 'ADD_LOG', categoryId: 'feeding', amount: ml })
    }
    showToast(`האכלה ${ml} מ"ל נרשמה`, 'success', '/bottle-icon.png')
  }

  const handleStartBottle = () => {
    setFeedingOpen(false)
    dispatch({ type: 'SET_BOTTLE_TIMER', start: new Date().toISOString() })
    showToast('טיימר בקבוק התחיל', 'success', '/bottle-icon.png')
  }

  const handleDiaperConfirm = (subtype) => {
    setDiaperOpen(false)
    const labels = { pee: 'פיפי', poop: 'קקי', both: 'שניהם' }
    const icons  = { pee: '/pee-icon.png', poop: '/poop-icon.png', both: '/diaper-icon.png' }
    dispatch({ type: 'ADD_LOG', categoryId: 'diaper', data: { subtype } })
    showToast(`חיתול (${labels[subtype]}) נרשם`, 'success', icons[subtype])
  }

  const handleGrowthConfirm = ({ weight, note, timestamp }) => {
    setGrowthOpen(false)
    dispatch({ type: 'ADD_WEIGHT', weight, note, timestamp })
    showToast(`משקל ${weight} ק"ג נשמר`, 'success', null)
  }

  const handleMilestoneConfirm = ({ description, category }) => {
    setMilestoneOpen(false)
    dispatch({ type: 'ADD_MILESTONE', description, category })
    showToast('אבן דרך נשמרה', 'success', null)
  }

  const handleVaccinationConfirm = ({ vaccineName, doctor, notes }) => {
    setVaccinationOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId: 'vaccination', note: vaccineName, data: { vaccineName, doctor, notes } })
    showToast(`חיסון "${vaccineName}" נרשם`, 'success', '/vaccine-icon.png')
  }

  const handleMedicineConfirm = ({ medicineName, dose, unit, reminderHours, nextDoseAt }) => {
    setMedicineOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId: 'medicine', note: medicineName, data: { medicineName, dose, unit, reminderHours, nextDoseAt } })
    showToast(`${medicineName}${dose ? ` ${dose} ${unit}` : ''} נרשם`, 'success', '/medicine-icon.png')
  }

  const handleManualSave = ({ categoryId, amount, note, timestamp }) => {
    setManualOpen(false)
    dispatch({ type: 'ADD_LOG', categoryId, amount, note, timestamp })
    const cat = state.categories.find(c => c.id === categoryId)
    const iconMap = { feeding: '/bottle-icon.png', diaper: '/diaper-icon.png', sleep: '/sleep-icon.png', bath: '/bath-icon.png', vaccination: '/vaccine-icon.png' }
    showToast(`${cat?.label ?? ''} נרשם`, 'success', iconMap[categoryId] || null)
  }

  const handleEndBottle = () => {
    setFeedingOpen(true)
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
        .hs-header-top{display:flex;flex-direction:column;align-items:center;padding:12px 18px 14px;padding-top:max(env(safe-area-inset-top,14px),14px);position:relative;z-index:2;}
        .hs-profile-circle{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,0.85);display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer;border:3px solid rgba(255,255,255,0.9);box-shadow:0 2px 10px rgba(0,0,0,0.12);overflow:hidden;margin-bottom:6px;}
        .hs-profile-circle img{width:100%;height:100%;object-fit:cover;}
        .hs-name{margin:0;font-size:26px;font-weight:900;color:#0D2640;line-height:1.05;letter-spacing:-0.5px;}
        .hs-age{font-size:12px;font-weight:600;color:#1A5A8A;margin:2px 0 0;}
        .hs-date{font-size:11px;color:#3A7BA8;margin:1px 0 0;}
        .hs-scroll{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:calc(68px + env(safe-area-inset-bottom,20px));}
        .hs-inner{padding:10px 14px 0;}
        .hs-card{background:white;border-radius:18px;padding:14px;margin-bottom:10px;box-shadow:0 2px 14px rgba(0,0,0,0.07);}
        .hs-card-title{display:flex;flex-direction:row;justify-content:flex-start;align-items:center;gap:6px;margin-bottom:10px;}
        .hs-card-title span{font-size:16px;font-weight:700;color:#111827;}
        .hs-stats-grid-top{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:6px;}
        .hs-stats-grid-bottom{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;}
        .hs-stat-box{border-radius:12px;padding:8px 4px;text-align:center;display:flex;flex-direction:column;align-items:center;}
        .hs-stat-emoji{display:flex;align-items:center;justify-content:center;margin-bottom:3px;}
        .hs-stat-num{font-size:18px;font-weight:800;color:#111827;margin:0;line-height:1;}
        .hs-stat-lbl{font-size:11px;color:#6B7280;margin:2px 0 0;font-weight:600;}
        .hs-features-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
        .hs-feat-btn{background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;-webkit-tap-highlight-color:transparent;}
        .hs-feat-icon{width:100%;aspect-ratio:1;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:28px;transition:transform 0.12s;}
        .hs-feat-icon:active{transform:scale(0.88);}
        .hs-feat-lbl{font-size:14px;font-weight:700;color:#374151;text-align:center;line-height:1.2;}
        .hs-timer-wrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows 0.25s ease, margin-bottom 0.25s ease;margin-bottom:0;}
        .hs-timer-wrap.active{grid-template-rows:1fr;margin-bottom:12px;}
        .hs-timer-wrap > .hs-timer-card{min-height:0;overflow:hidden;}
        .hs-timer-card{background:#FFF3E0;border-radius:20px;padding:14px 16px;box-shadow:0 2px 10px rgba(0,0,0,0.06);}
        .hs-timer-row{display:flex;align-items:center;justify-content:space-between;padding:6px 0;gap:8px;}
        .hs-timer-label{font-size:15px;font-weight:700;color:#374151;}
        .hs-timer-time{font-size:18px;font-weight:800;color:#D97706;font-variant-numeric:tabular-nums;}
        .hs-timer-end{background:#EF4444;color:white;border:none;border-radius:12px;padding:11px 18px;font-size:14px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;min-height:46px;flex-shrink:0;}
        .hs-timer-cancel{background:white;color:#9CA3AF;border:1.5px solid #E5E7EB;border-radius:12px;width:46px;height:46px;font-size:16px;cursor:pointer;flex-shrink:0;}
        .hs-recent-row{display:flex;align-items:center;gap:12px;padding:12px 0;direction:rtl;}
        .hs-recent-row + .hs-recent-row{border-top:1px solid #F3F4F6;}
        .hs-recent-time-val{font-size:14px;font-weight:700;color:#111827;margin:0;line-height:1.25;}
        .hs-recent-time-rel{font-size:11px;color:#9CA3AF;margin:0;line-height:1.4;}
        .hs-recent-circle{border-radius:50%;display:flex;align-items:center;justify-content:center;width:46px;height:46px;font-size:22px;flex-shrink:0;}
        .hs-recent-name{font-size:15px;font-weight:700;color:#111827;margin:0;line-height:1.25;}
        .hs-recent-detail{font-size:12px;color:#9CA3AF;margin:0;line-height:1.4;}
        .hs-nav{position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:white;border-top:1px solid #E5E7EB;z-index:50;direction:ltr;}
        .hs-nav-inner{display:flex;align-items:center;justify-content:space-around;height:60px;padding:0 4px;}
        .hs-nav-safe{height:env(safe-area-inset-bottom,0px);}
        .hs-nav-btn{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0 12px;height:60px;-webkit-tap-highlight-color:transparent;min-width:52px;}
        .hs-nav-btn span{font-size:11px;font-weight:600;}
        .hs-nav-plus{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#48CAE4 0%,#0096C7 100%);border:none;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,150,199,0.45);transition:transform 0.12s;-webkit-tap-highlight-color:transparent;}
        .hs-nav-plus:active{transform:scale(0.91);}
        .hs-nav-plus svg{width:28px;height:28px;}
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
            {birthDateStr && <p className="hs-date">{birthDateStr}</p>}
          </div>

        </div>

        {/* SCROLL */}
        <div className="hs-scroll">
          <div className="hs-inner">

            {/* Daily summary */}
            <div className="hs-card">
              <div className="hs-card-title">
                <span>סיכום היום</span>
              </div>
              <div className="hs-stats-grid-top">
                <div className="hs-stat-box" style={{background:'#E0D8FF'}}>
                  <div className="hs-stat-emoji"><img src="/sleep-icon.png" alt="שינה" style={{width:20,height:20,objectFit:'contain'}}/></div>
                  <p className="hs-stat-num">{sleepToday}</p>
                  <p className="hs-stat-lbl">שינה</p>
                </div>
                <div className="hs-stat-box" style={{background:'#FFF3CC'}}>
                  <div className="hs-stat-emoji"><img src="/bottle-icon.png" alt="האכלה" style={{width:26,height:26,objectFit:'contain'}}/></div>
                  <p className="hs-stat-num">{feedingToday}</p>
                  <p className="hs-stat-lbl">האכלה</p>
                </div>
                <div className="hs-stat-box" style={{background:'#C8F0E0'}}>
                  <div className="hs-stat-emoji"><img src="/diaper-icon.png" alt="חיתול" style={{width:26,height:26,objectFit:'contain'}}/></div>
                  <p className="hs-stat-num">{diaperToday}</p>
                  <p className="hs-stat-lbl">חיתול</p>
                </div>
              </div>
              <div className="hs-stats-grid-bottom">
                <div className="hs-stat-box" style={{background:'#DBEAFE'}}>
                  <div className="hs-stat-emoji"><img src="/pee-icon.png" alt="פיפי" style={{width:26,height:26,objectFit:'contain'}}/></div>
                  <p className="hs-stat-num">{peeToday}</p>
                  <p className="hs-stat-lbl">פיפי</p>
                </div>
                <div className="hs-stat-box" style={{background:'#FEF3C7'}}>
                  <div className="hs-stat-emoji"><img src="/poop-icon.png" alt="קקי" style={{width:26,height:26,objectFit:'contain'}}/></div>
                  <p className="hs-stat-num">{poopToday}</p>
                  <p className="hs-stat-lbl">קקי</p>
                </div>
              </div>
            </div>

            {/* Live Timers — always mounted so start/stop animates height instead of jumping layout */}
            <TimerSection
              sleepTimerStart={state.sleepTimerStart}
              bottleTimerStart={state.bottleTimerStart}
              onEndSleep={()=>handleAction('sleep')}
              onEndBottle={handleEndBottle}
              onCancelSleep={()=>{ dispatch({ type: 'SET_SLEEP_TIMER', start: null }); showToast('טיימר שינה בוטל') }}
              onCancelBottle={()=>{ dispatch({ type: 'SET_BOTTLE_TIMER', start: null }); showToast('טיימר בקבוק בוטל') }}
            />

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
                      {action.icon
                        ? <img src={action.icon} alt={action.label} style={{width:'70%',height:'70%',objectFit:'contain',display:'block'}}/>
                        : action.emoji}
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
                      <div className="hs-recent-circle" style={{background:info.bg}}>
                        {info.icon
                          ? <img src={info.icon} alt="" style={{width:'58%',height:'58%',objectFit:'contain'}}/>
                          : info.emoji}
                      </div>
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
          <div className="hs-nav-inner">
            <NavBtn icon={<PersonIcon/>} label="פרופיל" color="#9CA3AF" onClick={()=>setTab('profile')}/>
            <NavBtn icon={<ChartIcon/>} label="גרפים" color="#9CA3AF" onClick={()=>setTab('stats')}/>
            <button className="hs-nav-plus" onClick={()=>setManualOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"><path d="M12 4v16M4 12h16"/></svg>
            </button>
            <NavBtn icon={<ClockIcon/>} label="היסטוריה" color="#9CA3AF" onClick={()=>setTab('history')}/>
            <NavBtn icon={<HomeIconSvg/>} label="בית" color="#0096C7" onClick={()=>{}}/>
          </div>
          <div className="hs-nav-safe"/>
        </nav>

        {/* Modals */}
        {feedingOpen && <FeedingAmountSheet quickAmounts={state.feedingQuickAmounts} onConfirm={handleFeedingConfirm} onClose={()=>setFeedingOpen(false)} bottleTimerStart={state.bottleTimerStart} onStartBottle={handleStartBottle}/>}
        {diaperOpen && <DiaperModal onConfirm={handleDiaperConfirm} onClose={()=>setDiaperOpen(false)}/>}
        {growthOpen && <GrowthModal onConfirm={handleGrowthConfirm} onClose={()=>setGrowthOpen(false)} lastWeight={state.weightLogs?.[0]?.weight ?? null}/>}
        {milestoneOpen && <MilestoneModal onConfirm={handleMilestoneConfirm} onClose={()=>setMilestoneOpen(false)}/>}
        {vaccinationOpen && <VaccinationModal onConfirm={handleVaccinationConfirm} onClose={()=>setVaccinationOpen(false)}/>}
        {medicineOpen && <MedicineModal onConfirm={handleMedicineConfirm} onClose={()=>setMedicineOpen(false)} notificationsEnabled={state.settings?.notificationsEnabled}/>}
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
