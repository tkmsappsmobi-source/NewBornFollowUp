import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import EditLogSheet from '../components/EditLogSheet'
import { formatTime, formatDateLabel } from '../lib/time'

const FILTER_OPTIONS = [
  { id: null, label: 'הכל' },
  { id: 'feeding', label: '🍼 האכלה' },
  { id: 'diaper', label: '🚼 חיתול' },
  { id: 'sleep', label: '🌙 שינה' },
  { id: 'bath', label: '🛁 מקלחת' },
  { id: 'growth', label: '📏 גדילה' },
  { id: 'milestone', label: '⭐ אבן דרך' },
  { id: 'vaccination', label: '💉 חיסון' },
]

const CAT_INFO = {
  feeding:     { icon: '/bottle-icon.svg', label: 'האכלה',    bg: '#FFF3CC' },
  diaper:      { icon: '/diaper-icon.svg', label: 'חיתול',    bg: '#C8F0E0' },
  sleep:       { emoji: '🌙', label: 'שינה',     bg: '#E0D8FF' },
  bath:        { emoji: '🛁', label: 'מקלחת',   bg: '#FFE4CC' },
  growth:      { emoji: '📏', label: 'גדילה',    bg: '#C8F0E8' },
  milestone:   { emoji: '⭐', label: 'אבן דרך', bg: '#FFD6EC' },
  vaccination: { emoji: '💉', label: 'חיסון',   bg: '#E8E0FF' },
}

function CatIcon({ info, size = '58%' }) {
  if (info.icon) return <img src={info.icon} alt={info.label} style={{width:size,height:size,objectFit:'contain'}}/>
  return <span>{info.emoji}</span>
}

const SUBTYPE_ICONS = {
  pee:  { src: '/pee-icon.svg',   label: 'פיפי' },
  poop: { src: '/poop-icon.svg',  label: 'קקי' },
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
  if (log.data && log.data.vaccineName) return log.data.vaccineName
  if (log.data && log.data.durationMinutes) return `${log.data.durationMinutes} דקות`
  return log.note || ''
}

function SubtypeDetail({ subtype }) {
  if (subtype === 'pee') return <span style={{display:'flex',alignItems:'center',gap:4}}><img src="/pee-icon.svg" style={{width:14,height:14,objectFit:'contain'}} alt=""/>פיפי</span>
  if (subtype === 'poop') return <span style={{display:'flex',alignItems:'center',gap:4}}><img src="/poop-icon.svg" style={{width:14,height:14,objectFit:'contain'}} alt=""/>קקי</span>
  if (subtype === 'both') return <span style={{display:'flex',alignItems:'center',gap:3}}><img src="/pee-icon.svg" style={{width:12,height:12,objectFit:'contain'}} alt=""/><img src="/poop-icon.svg" style={{width:12,height:12,objectFit:'contain'}} alt=""/>שניהם</span>
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
      showToast('🗑️ רשומת גדילה נמחקה')
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
        .hist-header{background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%);padding:clamp(12px,3.5vw,18px) clamp(12px,4vw,18px);flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;}
        .hist-title{font-size:clamp(15px,4.5vw,19px);font-weight:800;color:#0D2640;}
        .hist-back{position:absolute;left:12px;background:none;border:none;cursor:pointer;padding:8px;color:#0D2640;}
        .hist-filter-bar{padding:clamp(8px,2.5vw,12px) clamp(10px,4vw,16px);background:white;border-bottom:1px solid #E5E7EB;flex-shrink:0;overflow-x:auto;white-space:nowrap;display:flex;gap:8px;scrollbar-width:none;}
        .hist-filter-bar::-webkit-scrollbar{display:none;}
        .hist-pill{border:1.5px solid #E5E7EB;border-radius:20px;padding:6px 14px;font-size:clamp(11px,3vw,13px);font-weight:600;cursor:pointer;font-family:Heebo,sans-serif;background:white;white-space:nowrap;min-height:36px;transition:all 0.15s;}
        .hist-pill.active{background:#0096C7;color:white;border-color:#0096C7;}
        .hist-list{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:clamp(10px,3vw,14px) clamp(10px,4vw,16px);padding-bottom:clamp(80px,20vw,100px);}
        .hist-date-label{font-size:clamp(11px,3vw,13px);font-weight:700;color:#6B7280;padding:clamp(6px,2vw,10px) 0 clamp(4px,1.5vw,8px);letter-spacing:0.04em;}
        .hist-card{background:white;border-radius:clamp(12px,3.5vw,16px);padding:clamp(10px,3vw,14px);margin-bottom:8px;box-shadow:0 1px 8px rgba(0,0,0,0.06);display:flex;align-items:center;gap:clamp(8px,2.5vw,14px);}
        .hist-emoji-circle{width:clamp(38px,11vw,48px);height:clamp(38px,11vw,48px);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:clamp(18px,5.5vw,24px);flex-shrink:0;}
        .hist-info{flex:1;min-width:0;}
        .hist-info-label{font-size:clamp(12px,3.5vw,15px);font-weight:700;color:#111827;margin:0;}
        .hist-info-detail{font-size:clamp(10px,2.8vw,12px);color:#9CA3AF;margin:2px 0 0;}
        .hist-time{font-size:clamp(11px,3vw,13px);font-weight:600;color:#6B7280;flex-shrink:0;}
        .hist-actions{display:flex;gap:6px;flex-shrink:0;}
        .hist-action-btn{background:none;border:1.5px solid #E5E7EB;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;}
        .hist-action-btn:active{background:#F3F4F6;}
        .hist-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60%;gap:10px;color:#9CA3AF;}
        .hist-empty-icon{font-size:clamp(40px,12vw,56px);}
        .hist-empty-text{font-size:clamp(13px,3.5vw,16px);font-weight:500;}
      `}</style>
      <div className="hist-root" dir="rtl">
        <div className="hist-header">
          <span className="hist-title">היסטוריה</span>
          <button className="hist-back" onClick={()=>setTab('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="hist-filter-bar">
          {FILTER_OPTIONS.map(f => (
            <button
              key={String(f.id)}
              className={`hist-pill${filter === f.id ? ' active' : ''}`}
              onClick={()=>setFilter(f.id)}
            >{f.label}</button>
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
      </div>
    </>
  )
}
