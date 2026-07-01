import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import BarChart from '../components/BarChart'
import { activityByDay } from '../lib/time'

export default function StatsScreen({ setTab }) {
  const { state } = useStore()
  const [nDays, setNDays] = useState(7)

  const sleepLogs = state.logs.filter(l => l.categoryId === 'sleep')
  const feedingLogs = state.logs.filter(l => l.categoryId === 'feeding')
  const diaperLogs = state.logs.filter(l => l.categoryId === 'diaper')
  const bathLogs = state.logs.filter(l => l.categoryId === 'bath')
  const medicineLogs = state.logs.filter(l => l.categoryId === 'medicine')
  const vaccinationLogs = state.logs.filter(l => l.categoryId === 'vaccination')

  // Summary stats for the period
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - nDays); cutoff.setHours(0,0,0,0)
  const inPeriod = (l) => new Date(l.timestamp) >= cutoff

  const sleepMinutes = sleepLogs.filter(inPeriod).reduce((s, l) => s + (l.data?.durationMinutes || 0), 0)
  const feedingMl = feedingLogs.filter(inPeriod).reduce((s, l) => s + (l.amount || 0), 0)
  const diaperCount = diaperLogs.filter(inPeriod).length
  const bathCount = bathLogs.filter(inPeriod).length
  const medicineCount = medicineLogs.filter(inPeriod).length
  const vaccinationCount = vaccinationLogs.filter(inPeriod).length

  const feedingByDay = useMemo(() => activityByDay(feedingLogs, nDays).map(d => ({
    ...d,
    amount: feedingLogs.filter(l => {
      const t = new Date(l.timestamp)
      return t >= d.date && t < new Date(d.date.getTime() + 86400000)
    }).reduce((s, l) => s + (l.amount || 0), 0),
  })), [feedingLogs, nDays])

  const diaperByDay = useMemo(() => activityByDay(diaperLogs, nDays), [diaperLogs, nDays])
  const sleepByDay = useMemo(() => activityByDay(sleepLogs, nDays).map(d => ({
    ...d,
    hours: +(sleepLogs.filter(l => {
      const t = new Date(l.timestamp)
      return t >= d.date && t < new Date(d.date.getTime() + 86400000)
    }).reduce((s, l) => s + (l.data?.durationMinutes || 0), 0) / 60).toFixed(1),
  })), [sleepLogs, nDays])

  const fmtH = (m) => {
    const h = Math.floor(m / 60); const min = m % 60
    return h > 0 ? `${h}:${String(min).padStart(2,'0')} שע'` : `${min} דק'`
  }

  return (
    <>
      <style>{`
        .stats-root{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#F0F8FF;font-family:Heebo,sans-serif;display:flex;flex-direction:column;}
        .stats-header{background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%);padding:16px 16px;padding-top:max(env(safe-area-inset-top,16px),16px);flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;}
        .stats-title{font-size:18px;font-weight:800;color:#0D2640;}
        .stats-back{position:absolute;left:12px;top:50%;transform:translateY(-50%);margin-top:max(calc(env(safe-area-inset-top,0px)/2),0px);background:none;border:none;cursor:pointer;padding:10px;color:#0D2640;}
        .stats-scroll{flex:1;overflow-y:auto;padding:14px 16px;padding-bottom:calc(env(safe-area-inset-bottom,0px)+24px);display:flex;flex-direction:column;gap:14px;}
        .stats-toggle{display:flex;background:white;border-radius:22px;padding:4px;box-shadow:0 1px 6px rgba(0,0,0,0.08);width:fit-content;margin:0 auto;}
        .stats-toggle-btn{border:none;border-radius:18px;padding:9px 24px;font-size:15px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;transition:all 0.15s;background:transparent;color:#6B7280;}
        .stats-toggle-btn.active{background:#0096C7;color:white;}
        .stats-card{background:white;border-radius:20px;padding:16px;box-shadow:0 2px 14px rgba(0,0,0,0.07);}
        .stats-summary-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .stats-sum-box{border-radius:14px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:5px;}
        .stats-sum-emoji{font-size:28px;line-height:1;}
        .stats-sum-val{font-size:20px;font-weight:800;color:#111827;margin:0;}
        .stats-sum-lbl{font-size:12px;color:#6B7280;margin:0;font-weight:500;}
        .stats-section-title{font-size:12px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;}
        .stats-empty{text-align:center;color:#9CA3AF;padding:16px 0;font-size:14px;}
      `}</style>
      <div className="stats-root" dir="rtl">
        <div className="stats-header">
          <span className="stats-title">סטטיסטיקות</span>
          <button className="stats-back" onClick={()=>setTab('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="stats-scroll">
          <div className="stats-toggle">
            <button className={`stats-toggle-btn${nDays===7?' active':''}`} onClick={()=>setNDays(7)}>7 ימים</button>
            <button className={`stats-toggle-btn${nDays===30?' active':''}`} onClick={()=>setNDays(30)}>30 ימים</button>
          </div>

          {/* Summary */}
          <div className="stats-card">
            <p className="stats-section-title">סיכום {nDays} ימים</p>
            <div className="stats-summary-grid">
              <div className="stats-sum-box" style={{background:'#E0D8FF'}}>
                <img src="/sleep-icon.png" alt="שינה" style={{width:'clamp(22px,6.5vw,30px)',height:'clamp(22px,6.5vw,30px)',objectFit:'contain'}}/>
                <p className="stats-sum-val">{fmtH(sleepMinutes)}</p>
                <p className="stats-sum-lbl">שינה סה"כ</p>
              </div>
              <div className="stats-sum-box" style={{background:'#FFF3CC'}}>
                <img src="/bottle-icon.png" alt="האכלה" style={{width:'clamp(22px,6.5vw,30px)',height:'clamp(22px,6.5vw,30px)',objectFit:'contain'}}/>
                <p className="stats-sum-val">{feedingMl} מ"ל</p>
                <p className="stats-sum-lbl">האכלה סה"כ</p>
              </div>
              <div className="stats-sum-box" style={{background:'#C8F0E0'}}>
                <img src="/diaper-icon.png" alt="חיתול" style={{width:'clamp(22px,6.5vw,30px)',height:'clamp(22px,6.5vw,30px)',objectFit:'contain'}}/>
                <p className="stats-sum-val">{diaperCount}</p>
                <p className="stats-sum-lbl">חיתולים</p>
              </div>
              <div className="stats-sum-box" style={{background:'#FFE4CC'}}>
                <img src="/bath-icon.png" alt="מקלחת" style={{width:'clamp(22px,6.5vw,30px)',height:'clamp(22px,6.5vw,30px)',objectFit:'contain'}}/>
                <p className="stats-sum-val">{bathCount}</p>
                <p className="stats-sum-lbl">מקלחות</p>
              </div>
              <div className="stats-sum-box" style={{background:'#FCE7F3'}}>
                <img src="/medicine-icon.png" alt="תרופות" style={{width:'clamp(22px,6.5vw,30px)',height:'clamp(22px,6.5vw,30px)',objectFit:'contain'}}/>
                <p className="stats-sum-val">{medicineCount}</p>
                <p className="stats-sum-lbl">תרופות</p>
              </div>
              <div className="stats-sum-box" style={{background:'#E8E0FF'}}>
                <img src="/vaccine-icon.png" alt="חיסונים" style={{width:'clamp(22px,6.5vw,30px)',height:'clamp(22px,6.5vw,30px)',objectFit:'contain'}}/>
                <p className="stats-sum-val">{vaccinationCount}</p>
                <p className="stats-sum-lbl">חיסונים</p>
              </div>
            </div>
          </div>

          {/* Feeding chart */}
          <div className="stats-card">
            <p className="stats-section-title">האכלה מ"ל ליום</p>
            {feedingByDay.some(d => d.amount > 0) ? (
              <BarChart data={feedingByDay} valueKey="amount" labelKey="label" unit=' מ"ל' color="#F59E0B"/>
            ) : (
              <p className="stats-empty">אין נתוני האכלה</p>
            )}
          </div>

          {/* Diaper chart */}
          <div className="stats-card">
            <p className="stats-section-title">חיתולים ליום</p>
            {diaperByDay.some(d => d.count > 0) ? (
              <BarChart data={diaperByDay} valueKey="count" labelKey="label" unit=" חיתולים" color="#10B981"/>
            ) : (
              <p className="stats-empty">אין נתוני חיתולים</p>
            )}
          </div>

          {/* Sleep chart */}
          <div className="stats-card">
            <p className="stats-section-title">שינה שעות ליום</p>
            {sleepByDay.some(d => d.hours > 0) ? (
              <BarChart data={sleepByDay} valueKey="hours" labelKey="label" unit=" שע'" color="#8B5CF6"/>
            ) : (
              <p className="stats-empty">אין נתוני שינה</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
