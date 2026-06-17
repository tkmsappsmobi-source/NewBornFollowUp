export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: '2-digit' })
}

export function formatDateTime(iso) {
  return `${formatDate(iso)} ${formatTime(iso)}`
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function isToday(iso) {
  return new Date(iso) >= startOfToday()
}

export function startOfWeek() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  d.setHours(0, 0, 0, 0)
  return d
}

export function last24hBuckets(logs, categoryId) {
  const now = Date.now()
  const cutoff = now - 24 * 60 * 60 * 1000
  const filtered = logs.filter(
    l => l.categoryId === categoryId && new Date(l.timestamp).getTime() >= cutoff
  )
  // group by hour
  const buckets = Array.from({ length: 24 }, (_, i) => ({
    label: `${((new Date().getHours() - 23 + i + 24) % 24).toString().padStart(2, '0')}:00`,
    amount: 0,
    count: 0,
  }))
  filtered.forEach(l => {
    const hourOffset = Math.floor((now - new Date(l.timestamp).getTime()) / (60 * 60 * 1000))
    const idx = 23 - Math.min(hourOffset, 23)
    buckets[idx].amount += l.amount || 0
    buckets[idx].count += 1
  })
  return buckets
}

export function weeklyActivity(logs) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    d.setHours(0, 0, 0, 0)
    return { label: d.toLocaleDateString('he-IL', { weekday: 'short' }), date: d, count: 0 }
  })
  logs.forEach(l => {
    const ts = new Date(l.timestamp)
    const day = days.find(
      d => ts >= d.date && ts < new Date(d.date.getTime() + 86400000)
    )
    if (day) day.count++
  })
  return days
}
