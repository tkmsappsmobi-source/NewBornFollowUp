import { useStore } from '../store/useStore'
import BarChart from '../components/BarChart'
import { isToday, last24hBuckets, weeklyActivity } from '../lib/time'

export default function StatsScreen() {
  const { state } = useStore()
  const todayLogs = state.logs.filter(l => isToday(l.timestamp))

  const feedingCat = state.categories.find(c => c.type === 'feeding')
  const feeding24h = feedingCat ? last24hBuckets(state.logs, feedingCat.id) : []
  const weekly = weeklyActivity(state.logs)

  const todayByCategory = state.categories.filter(c => c.enabled).map(cat => {
    const logs = todayLogs.filter(l => l.categoryId === cat.id)
    const totalMl = logs.reduce((s, l) => s + (l.amount || 0), 0)
    return { cat, count: logs.length, totalMl }
  }).filter(x => x.count > 0)

  return (
    <>
      <style>{`
        .stats-root { height:100%; overflow-y:auto; -webkit-overflow-scrolling:touch; background:#F0F8FF; font-family:Heebo,sans-serif; padding: clamp(10px,3vw,16px) clamp(10px,4vw,16px); padding-bottom: clamp(80px,20vw,100px); display:flex; flex-direction:column; gap: clamp(12px,3vw,18px); }
        .stats-card { background:white; border-radius: clamp(14px,4vw,20px); padding: clamp(12px,3.5vw,18px); box-shadow:0 2px 14px rgba(0,0,0,0.07); }
        .stats-section-title { font-size: clamp(11px,3vw,13px); font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:0.06em; margin-bottom: clamp(10px,3vw,14px); }
        .stats-row { display:flex; align-items:center; gap: clamp(8px,2.5vw,14px); padding: clamp(8px,2.5vw,12px) 0; border-bottom:1px solid #F3F4F6; }
        .stats-row:last-child { border-bottom:none; padding-bottom:0; }
        .stats-row:first-child { padding-top:0; }
        .stats-emoji { font-size: clamp(20px,6vw,26px); flex-shrink:0; }
        .stats-label { flex:1; font-size: clamp(12px,3.5vw,15px); font-weight:500; color:#374151; }
        .stats-count { font-size: clamp(18px,5vw,24px); font-weight:800; color:#0096C7; line-height:1; }
        .stats-unit { font-size: clamp(10px,2.5vw,12px); color:#9CA3AF; }
        .stats-ml { font-size: clamp(10px,2.5vw,12px); color:#6B7280; margin-top:2px; }
        .stats-empty { text-align:center; color:#9CA3AF; padding: clamp(16px,5vw,24px) 0; font-size: clamp(12px,3vw,14px); }
      `}</style>
      <div className="stats-root" dir="rtl">

        {/* Today */}
        <div className="stats-card">
          <p className="stats-section-title">היום</p>
          {todayByCategory.length === 0 ? (
            <p className="stats-empty">אין רישומים להיום 👶</p>
          ) : (
            todayByCategory.map(({ cat, count, totalMl }) => (
              <div key={cat.id} className="stats-row">
                <span className="stats-emoji">{cat.emoji}</span>
                <span className="stats-label">{cat.label}</span>
                <div style={{ textAlign: 'left' }}>
                  <div>
                    <span className="stats-count">{count}</span>
                    <span className="stats-unit"> פעמים</span>
                  </div>
                  {totalMl > 0 && <div className="stats-ml">{totalMl} מ״ל סה״כ</div>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Feeding 24h */}
        {feedingCat && (
          <div className="stats-card">
            <p className="stats-section-title">האכלות — 24 שעות אחרונות</p>
            {feeding24h.some(b => b.amount > 0) ? (
              <BarChart data={feeding24h} valueKey="amount" labelKey="label" unit=" מ״ל" />
            ) : (
              <p className="stats-empty">אין האכלות ב-24 שעות האחרונות</p>
            )}
          </div>
        )}

        {/* Weekly */}
        <div className="stats-card">
          <p className="stats-section-title">פעילות שבועית</p>
          <BarChart data={weekly} valueKey="count" labelKey="label" color="#0096C7" unit=" פעולות" />
        </div>

      </div>
    </>
  )
}
