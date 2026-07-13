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

export function calcAge(birthDateStr) {
  if (!birthDateStr) return null
  // Parse as local time — avoids UTC offset shifting birth date by a day
  const [y, mo, d] = birthDateStr.split('-').map(Number)
  const birth = new Date(y, mo - 1, d)
  const now = new Date()
  const totalDays = Math.floor((now - birth) / 86400000)
  if (totalDays < 0) return null
  if (totalDays === 0) return 'נולד היום 🎉'
  if (totalDays < 7) return `${totalDays} ימים`
  // Accurate month count: subtract 1 if haven't passed birth day yet this month
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (now.getDate() < birth.getDate()) months--
  if (months < 1) { const weeks = Math.floor(totalDays / 7); return `${weeks} שבועות` }
  if (months < 24) return `${months} חודשים`
  const years = Math.floor(months / 12); const m = months % 12
  return m ? `${years} שנ' ו-${m} חודשים` : `${years} שנים`
}

export function getRelativeTime(timestamp) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'עכשיו'
  if (minutes < 60) return `לפני ${minutes} דק'`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `לפני ${hours} שע'`
  return `לפני ${hours}:${String(mins).padStart(2,'0')} שע'`
}

export function formatDuration(minutes) {
  if (!minutes) return "0 דק'"
  const h = Math.floor(minutes / 60); const m = minutes % 60
  if (h === 0) return `${m} דק'`
  if (m === 0) return `${h} שע'`
  return `${h}:${String(m).padStart(2,'0')} שע'`
}

export function formatDateLabel(isoOrDate) {
  const d = new Date(isoOrDate)
  const today = new Date(); today.setHours(0,0,0,0)
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1)
  const day = new Date(d); day.setHours(0,0,0,0)
  if (day.getTime() === today.getTime()) return 'היום'
  if (day.getTime() === yesterday.getTime()) return 'אתמול'
  return d.toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit' })
}

export function activityByDay(logs, nDays = 7) {
  return Array.from({ length: nDays }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (nDays - 1 - i)); d.setHours(0,0,0,0)
    const label = nDays === 7
      ? d.toLocaleDateString('he-IL', { weekday: 'short' })
      : d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })
    return { label, date: d, count: 0 }
  }).map(day => {
    const count = logs.filter(l => { const t = new Date(l.timestamp); return t >= day.date && t < new Date(day.date.getTime()+86400000) }).length
    return { ...day, count }
  })
}
