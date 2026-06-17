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
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-5">
      <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">היום</h2>
        {todayByCategory.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">אין רישומים להיום</p>
        ) : (
          <div className="space-y-2">
            {todayByCategory.map(({ cat, count, totalMl }) => (
              <div key={cat.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                <span className="text-2xl">{cat.emoji}</span>
                <span className="flex-1 text-sm font-medium text-gray-700">{cat.label}</span>
                <div className="text-left">
                  <span className="text-lg font-bold text-indigo-600">{count}</span>
                  <span className="text-xs text-gray-400"> פעמים</span>
                  {totalMl > 0 && (
                    <div className="text-xs text-gray-500">{totalMl} מ״ל סה״כ</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {feedingCat && (
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">האכלות — 24 שעות אחרונות</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            {feeding24h.some(b => b.amount > 0) ? (
              <BarChart data={feeding24h} valueKey="amount" labelKey="label" unit=" מ״ל" />
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">אין האכלות ב-24 שעות האחרונות</p>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">פעילות שבועית</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <BarChart data={weekly} valueKey="count" labelKey="label" color="#10b981" unit=" פעולות" />
        </div>
      </section>
    </div>
  )
}
