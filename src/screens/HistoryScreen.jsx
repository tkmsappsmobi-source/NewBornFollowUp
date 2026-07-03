import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import EditLogSheet from '../components/EditLogSheet'
import BottomNav, { NAV_SPACER } from '../components/BottomNav'
import { formatTime, formatDateLabel } from '../lib/time'

const FILTER_OPTIONS = [
  { id: null,         label: 'הכל' },
  { id: 'feeding',    label: 'האכלה',   icon: '/bottle-icon.png' },
  { id: 'diaper',     label: 'חיתול',   icon: '/diaper-icon.png' },
  { id: 'sleep',      label: 'שינה',    icon: '/sleep-icon.png' },
  { id: 'bath',       label: 'מקלחת',  icon: '/bath-icon.png' },
  { id: 'growth',     label: 'משקל',   icon: '/growth-icon.png' },
  { id: 'milestone',  label: 'אבן דרך', emoji: '⭐' },
  { id: 'vaccination',label: 'חיסון',   icon: '/vaccine-icon.png' },
  { id: 'medicine',   label: 'תרופה',   icon: '/medicine-icon.png' },
]

const CAT_INFO = {
  feeding:     { icon: '/bottle-icon.png', label: 'האכלה',    bg: '#FFF3CC' },
  diaper:      { icon: '/diaper-icon.png', label: 'חיתול',    bg: '#C8F0E0' },
  sleep:       { icon: '/sleep-icon.png', label: 'שינה',     bg: '#E0D8FF' },
  bath:        { icon: '/bath-icon.png', label: 'מקלחת',   bg: '#FFE4CC' },
  growth:      { icon: '/growth-icon.png', label: 'משקל',    bg: '#C8F0E8' },
  milestone:   { emoji: '⭐', label: 'אבן דרך', bg: '#FFD6EC' },
  vaccination: { icon: '/vaccine-icon.png', label: 'חיסון',   bg: '#E8E0FF' },
  medicine:    { icon: '/medicine-icon.png', label: 'תרופה',   bg: '#FCE7F3' },
}

function CatIcon({ info, size = '58%' }) {
  if (info.icon) return <img src={info.icon} alt={info.label} style={{width:size,height:size,objectFit:'contain'}}/>
  return <span>{info.emoji}</span>
}

const SUBTYPE_ICONS = {
  pee:  { src: '/pee-icon.png',   label: 'פיפי' },
  poop: { src: '/poop-icon.png',  label: 'קקי' },
  both: { src: null,              label: 'שניהם' },
}

function getDetail(log) {
  if (log._source === 'weight') return `${log.weight} ק"ג${log.height ? ` • ${log.height} ס"מ` : ''}`
  if (log._source === 'milestone') return log.description || ''
  if (log.amount) return `${log.amount} מ"ל`
  if (log.data && log.data.subtype) {
    const s = { pee: 'פיפי', poop: 'קקי', both: 'שניהם' }
    return s[log.data.subtype] || ''
  }
  if (log.data && log.data.medicineName) return `${log.data.medicineName}${log.data.dose ? ` · ${log.data.dose} ${log.data.unit}` : ''}`
  if (log.data && log.data.vaccineName) return log.data.vaccineName
  if (log.data && log.data.durationMinutes) return `${log.data.durationMinutes} דקות`
  return log.note || ''
}

function SubtypeDetail({ subtype }) {
  if (subtype === 'pee') return <span style={{display:'flex',alignItems:'center',gap:4}}><img src="/pee-icon.png" style={{width:14,height:14,objectFit:'contain'}} alt=""/>פיפי</span>
  if (subtype === 'poop') return <span style={{display:'flex',alignItems:'center',gap:4}}><img src="/poop-icon.png" style={{width:14,height:14,objectFit:'contain'}} alt=""/>קקי</span>
  if (subtype === 'both') return <span style={{display:'flex',alignItems:'center',gap:3}}><img src="/pee-icon.png" style={{width:12,height:12,objectFit:'contain'}} alt=""/><img src="/poop-icon.png" style={{width:12,height:12,objectFit:'contain'}} alt=""/>שניהם</span>
  return null
}

export default function HistoryScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [filter, setFilter] = useState(null)
  const [editLog, setEditLog] = useState(null)

  const catMap = Object.fromEntries(state.categories.map(c => [c.id, c]))

  const allLogs = useMemo(() => {
    const combined = [
      ...state.logs.map(l => ({ ...l, _source: 'log' })),
      ...(state.weightLogs || []).map(l => ({ ...l, categoryId: 'growth', _source: 'weight' })),
      ...(state.milestoneLogs || []).map(l => ({ ...l, categoryId: 'milestone', _source: 'milestone' })),
    ]
    return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [state.logs, state.weightLogs, state.milestoneLogs])

  const filtered = filter ? allLogs.filter(l => l.categoryId === filter) : allLogs

  // Group by date
  const groups = useMemo(() => {
    const map = {}
    filtered.forEach(log => {
      const label = formatDateLabel(log.timestamp)
      if (!map[label]) map[label] = []
      map[label].push(log)
    })
    // Order: today first, yesterday, then others
    const order = ['היום', 'אתמול']
    const keys = Object.keys(map)
    const sorted = [
      ...order.filter(k => map[k]),
      ...keys.filter(k => !order.includes(k)),
    ]
    return sorted.map(label => ({ label, logs: map[label] }))
  }, [filtered])

  const handleDelete = (log) => {
    if (log._source === 'weight') {
      dispatch({ type: 'DELETE_WEIGHT', id: log.id })
      showToast('🗑️ רשומת משקל נמחקה')
    } else if (log._source === 'milestone') {
      dispatch({ type: 'DELETE_MILESTONE', id: log.id })
      showToast('🗑️ אבן דרך נמחקה')
    } else {
      const cat = catMap[log.categoryId]
      dispatch({ type: 'DELETE_LOG', id: log.id })
      showToast(`🗑️ ${cat?.label ?? 'רישום'} נמחק`)
    }
  }

  const handleEditConfirm = (patch) => {
    if (editLog._source === 'log') {
      dispatch({ type: 'EDIT_LOG', id: editLog.id, patch })
      showToast('✏️ רישום עודכן')
    }
    setEditLog(null)
  }

  const getCatInfo = (log) => {
    const info = CAT_INFO[log.categoryId]
    if (info) return info
    const cat = catMap[log.categoryId]
    return { emoji: cat?.emoji || '📝', label: cat?.label || 'פעולה', bg: '#F3F4F6' }
  }

  return (
    <>
      <style>{`
        .hist-root{display:flex;flex-direction:column;height:100%;background:#F0F8FF;font-family:Heebo,sans-serif;}
        .hist-header{background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%);padding:16px 16px;padding-top:max(env(safe-area-inset-top,16px),16px);flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;}
        .hist-title{font-size:18px;font-weight:800;color:#0D2640;}
        .hist-back{position:absolute;left:12px;top:50%;transform:translateY(-50%);margin-top:max(calc(env(safe-area-inset-top,0px)/2),0px);background:none;border:none;cursor:pointer;padding:10px;color:#0D2640;}
        .hist-filter-bar{padding:8px 10px;background:white;border-bottom:1px solid #E5E7EB;flex-shrink:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
        .hist-pill{border:1.5px solid #E5E7EB;border-radius:14px;padding:7px 4px;font-size:12px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;background:white;min-height:40px;transition:all 0.15s;display:flex;align-items:center;justify-content:center;gap:3px;text-align:center;}
        .hist-pill.active{background:#0096C7;color:white;border-color:#0096C7;}
        .hist-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:14px 16px;padding-bottom:${NAV_SPACER};}
        .hist-date-label{font-size:12px;font-weight:700;color:#6B7280;padding:8px 0 6px;letter-spacing:0.04em;text-transform:uppercase;}
        .hist-card{background:white;border-radius:16px;padding:13px 14px;margin-bottom:8px;box-shadow:0 1px 8px rgba(0,0,0,0.06);display:flex;align-items:center;gap:12px;}
        .hist-emoji-circle{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
        .hist-info{flex:1;min-width:0;}
        .hist-info-label{font-size:15px;font-weight:700;color:#111827;margin:0;}
        .hist-info-detail{font-size:12px;color:#9CA3AF;margin:3px 0 0;}
        .hist-time{font-size:13px;font-weight:600;color:#6B7280;flex-shrink:0;}
        .hist-actions{display:flex;gap:6px;flex-shrink:0;}
        .hist-action-btn{background:none;border:1.5px solid #E5E7EB;border-radius:10px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;}
        .hist-action-btn:active{background:#F3F4F6;}
        .hist-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60%;gap:10px;color:#9CA3AF;}
        .hist-empty-icon{font-size:52px;}
        .hist-empty-text{font-size:16px;font-weight:500;}
      `}</style>
      <div className="hist-root" dir="rtl">
        <div className="hist-header">
          <span className="hist-title">היסטוריה</span>
          <button className="hist-back" onClick={()=>setTab('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="hist-filter-bar">
          {FILTER_OPTIONS.map(f => (
            <button
              key={String(f.id)}
              className={`hist-pill${filter === f.id ? ' active' : ''}`}
              onClick={()=>setFilter(f.id)}
              style={{display:'flex',alignItems:'center',gap:5}}
            >
              {f.icon && <img src={f.icon} alt="" style={{width:13,height:13,objectFit:'contain',flexShrink:0}}/>}
              {f.emoji && <span style={{fontSize:12,lineHeight:1}}>{f.emoji}</span>}
              {f.label}
            </button>
          ))}
        </div>

        <div className="hist-list">
          {groups.length === 0 ? (
            <div className="hist-empty">
              <span className="hist-empty-icon">📋</span>
              <span className="hist-empty-text">אין רישומים עדיין</span>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.label}>
                <div className="hist-date-label">{group.label}</div>
                {group.logs.map(log => {
                  const info = getCatInfo(log)
                  return (
                    <div key={log.id} className="hist-card">
                      <div className="hist-emoji-circle" style={{background:info.bg}}><CatIcon info={info}/></div>
                      <div className="hist-info">
                        <p className="hist-info-label">{info.label}</p>
                        <p className="hist-info-detail">
                          {log.data?.subtype ? <SubtypeDetail subtype={log.data.subtype}/> : getDetail(log)}
                        </p>
                      </div>
                      <span className="hist-time">{formatTime(log.timestamp)}</span>
                      <div className="hist-actions">
                        {log._source === 'log' && (
                          <button className="hist-action-btn" onClick={()=>setEditLog(log)} title="ערוך">✏️</button>
                        )}
                        <button className="hist-action-btn" onClick={()=>handleDelete(log)} title="מחק">🗑️</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {editLog && (
          <EditLogSheet
            log={editLog}
            category={catMap[editLog.categoryId] || CAT_INFO[editLog.categoryId]}
            onConfirm={handleEditConfirm}
            onClose={()=>setEditLog(null)}
          />
        )}

        <BottomNav tab="history" setTab={setTab} onPlus={()=>setTab('home')}/>
      </div>
    </>
  )
}
