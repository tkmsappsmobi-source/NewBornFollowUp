export async function requestPermission() {
  if (!('Notification' in window)) return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function isGranted() {
  return 'Notification' in window && Notification.permission === 'granted'
}

export function fireNotification(title, body) {
  if (!isGranted()) return
  new Notification(title, { body, icon: '/NewBornFollowUp/icons/icon-192.png' })
}

export function startReminderScheduler(getState, dispatch, showToast) {
  const tick = () => {
    const { reminders = [], logs = [] } = getState()
    const now = new Date()

    reminders.forEach(r => {
      if (!r.enabled) return

      let shouldFire = false

      if (r.type === 'once' && r.datetime) {
        const target = new Date(r.datetime)
        const alreadyFired = r.lastFired && new Date(r.lastFired) >= target
        shouldFire = !alreadyFired && now >= target
      }

      if (r.type === 'recurring' && r.intervalMinutes) {
        const last = r.lastFired ? new Date(r.lastFired) : null
        const msSinceLast = last ? now - last : Infinity
        shouldFire = msSinceLast >= r.intervalMinutes * 60 * 1000
      }

      if (shouldFire) {
        dispatch({ type: 'FIRE_REMINDER', id: r.id })
        showToast(`🔔 ${r.label}`)
        fireNotification('מעקב תינוק', r.label)
      }
    })

    // Medicine dose reminders — checked here (not via setTimeout) so they
    // survive tab reloads/closes instead of silently vanishing.
    logs.forEach(log => {
      if (log.categoryId !== 'medicine') return
      const nextDoseAt = log.data?.nextDoseAt
      if (!nextDoseAt || log.data?.notified) return
      if (now >= new Date(nextDoseAt)) {
        dispatch({ type: 'EDIT_LOG', id: log.id, patch: { 'data.notified': true } })
        const label = log.data?.medicineName || 'תרופה'
        showToast(`💊 הגיע זמן המנה הבאה: ${label}`)
        fireNotification(`💊 מנה הבאה: ${label}`, log.data?.dose ? `${log.data.dose} ${log.data.unit || ''}` : '')
      }
    })
  }

  tick()
  const interval = setInterval(tick, 30_000)
  return () => clearInterval(interval)
}
