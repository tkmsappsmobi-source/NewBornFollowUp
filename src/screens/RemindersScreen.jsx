import { useState, useEffect, useMemo } from 'react'
import { useStore } from '../store/useStore'
import ReminderForm from '../components/ReminderForm'
import BottomNav, { NAV_SPACER } from '../components/BottomNav'
import { formatDateTime } from '../lib/time'

const DUE_SOON_MINUTES = 10

function intervalLabel(r) {
  if (r.type === 'once') return `חד-פעמית · ${formatDateTime(r.datetime)}`
  const h = Math.floor(r.intervalMinutes / 60)
  const m = r.intervalMinutes % 60
  const parts = []
  if (h) parts.push(`${h} שעות`)
  if (m) parts.push(`${m} דקות`)
  return `כל ${parts.join(' ו')}`
}

// A once-reminder that already fired has no future occurrence — it belongs in
// its own "completed" bucket rather than lingering in the active list forever.
function classify(r) {
  if (r.type === 'once' && r.lastFired && r.datetime && new Date(r.lastFired) >= new Date(r.datetime)) return 'done'
  if (!r.enabled) return 'off'
  return 'active'
}

// Never-fired recurring reminders are due immediately (matches the scheduler's
// own shouldFire logic in lib/notifications.js), so they sort to the top too.
function getDueMs(r, now) {
  if (r.type === 'once') return r.datetime ? new Date(r.datetime).getTime() : null
  if (r.type === 'recurring' && r.intervalMinutes) {
    const lastMs = r.lastFired ? new Date(r.lastFired).getTime() : null
    return lastMs != null ? lastMs + r.intervalMinutes * 60000 : now
  }
  return null
}

function formatDue(dueMs, now) {
  if (dueMs == null) return null
  const diff = dueMs - now
  const overdue = diff < 0
  const absMin = Math.round(Math.abs(diff) / 60000)
  let amount
  if (absMin < 1) amount = null
  else if (absMin < 60) amount = `${absMin} דק'`
  else {
    const h = Math.floor(absMin / 60)
    const m = absMin % 60
    amount = m ? `${h} שע' ו-${m} דק'` : `${h} שע'`
  }
  const text = amount == null ? 'ממש עכשיו' : overdue ? `איחור של ${amount}` : `בעוד ${amount}`
  return { text, overdue, soon: !overdue && absMin <= DUE_SOON_MINUTES }
}

function ReminderCard({ r, due, isNext, muted, done, onToggle, onDelete }) {
  return (
    <div className={`rem-card${muted ? ' muted' : ''}`}>
      <div className="rem-card-icon">
        <img src="reminders-icon.png" alt="" />
      </div>
      <div className="rem-card-body">
        <div className="rem-card-toprow">
          <span className="rem-label">{r.label}</span>
          {isNext && <span className="rem-next-chip">הבא בתור</span>}
        </div>
        {done ? (
          <div className="rem-status done">✓ בוצע · {formatDateTime(r.lastFired)}</div>
        ) : due ? (
          <div className={`rem-due${due.overdue ? ' overdue' : due.soon ? ' soon' : ''}`}>{due.text}</div>
        ) : null}
        <div className="rem-interval">{intervalLabel(r)}</div>
      </div>
      {!done && (
        <button
          type="button"
          role="switch"
          aria-checked={r.enabled}
          aria-label={r.enabled ? `כבה תזכורת: ${r.label}` : `הפעל תזכורת: ${r.label}`}
          onClick={onToggle}
          className="rem-toggle-btn"
        >
          <span className="rem-toggle-track" style={{ background: r.enabled ? '#0096C7' : '#E5E7EB' }}>
            <span className="rem-toggle-knob" style={{ transform: r.enabled ? 'translateX(100%)' : 'translateX(0)' }} />
          </span>
        </button>
      )}
      <button type="button" aria-label={`מחק תזכורת: ${r.label}`} onClick={onDelete} className="rem-delete-btn">
        <img src="delete-icon.png" alt="" />
      </button>
    </div>
  )
}

export default function RemindersScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  // Keeps the "in N minutes" countdowns live without re-running the whole app.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const buckets = useMemo(() => {
    const active = [], off = [], done = []
    ;(state.reminders || []).forEach(r => {
      const bucket = classify(r)
      if (bucket === 'active') active.push({ ...r, due: getDueMs(r, now) })
      else if (bucket === 'off') off.push(r)
      else done.push(r)
    })
    active.sort((a, b) => (a.due ?? Infinity) - (b.due ?? Infinity))
    return { active, off, done }
  }, [state.reminders, now])

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_REMINDER', ...data })
    setFormOpen(false)
    showToast('🔔 תזכורת נוספה')
  }

  const handleToggle = (r) => dispatch({ type: 'TOGGLE_REMINDER', id: r.id })

  const handleDelete = (r) => {
    dispatch({ type: 'DELETE_REMINDER', id: r.id })
    showToast('תזכורת נמחקה', 'success', 'delete-icon.png')
  }

  const isEmpty = state.reminders.length === 0

  return (
    <>
      <style>{`
        .rem-root { display:flex; flex-direction:column; height:100%; background:#F0F8FF; font-family:Heebo,sans-serif; }
        .rem-header { background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%); padding:clamp(12px,3.5vw,18px) clamp(12px,4vw,18px); padding-top:max(env(safe-area-inset-top,16px),16px); flex-shrink:0; display:flex; align-items:center; justify-content:center; position:relative; }
        .rem-header-title { font-size:clamp(15px,4.5vw,19px); font-weight:800; color:#0D2640; }
        .rem-back { position:absolute; left:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:10px; color:#0D2640; }
        .rem-list { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding: clamp(10px,3vw,14px) clamp(10px,4vw,16px); display:flex; flex-direction:column; gap: clamp(8px,2vw,12px); }
        .rem-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:10px; color:#9CA3AF; text-align:center; padding:0 24px; }
        .rem-empty-icon { width:clamp(56px,16vw,76px); height:clamp(56px,16vw,76px); object-fit:contain; opacity:0.8; }
        .rem-empty-text { font-size: clamp(14px,3.8vw,17px); font-weight:700; color:#374151; }
        .rem-empty-hint { font-size: clamp(11px,3vw,13px); color:#9CA3AF; line-height:1.5; max-width:240px; }
        .rem-section-label { font-size:12px; font-weight:700; color:#6B7280; padding:8px 4px 2px; }
        .rem-card { background:white; border-radius: clamp(14px,4vw,18px); padding: clamp(12px,3.5vw,16px); box-shadow:0 2px 12px rgba(15,45,70,0.07); display:flex; align-items:center; gap: clamp(10px,3vw,14px); }
        .rem-card-icon { width:clamp(44px,12vw,54px); height:clamp(44px,12vw,54px); border-radius:50%; background:#CFF3FF; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .rem-card-icon img { width:60%; height:60%; object-fit:contain; }
        .rem-card.muted .rem-card-icon { background:#E9EFF3; }
        .rem-card.muted .rem-label { color:#4B5563; }
        .rem-card-body { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
        .rem-card-toprow { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .rem-label { font-size: clamp(13px,3.5vw,15px); font-weight:700; color:#111827; line-height:1.3; }
        .rem-next-chip { font-size:10px; font-weight:700; color:#0096C7; background:rgba(0,150,199,0.12); padding:2px 8px; border-radius:999px; white-space:nowrap; }
        .rem-due { font-size: clamp(13px,3.6vw,15px); font-weight:800; color:#0096C7; font-variant-numeric:tabular-nums; }
        .rem-due.soon { color:#D97706; }
        .rem-due.overdue { color:#EF4444; }
        .rem-status { font-size: clamp(11px,3vw,13px); font-weight:600; color:#9CA3AF; }
        .rem-status.done { color:#16A34A; }
        .rem-interval { font-size: clamp(10px,2.5vw,12px); color:#9CA3AF; margin-top:1px; }
        .rem-toggle-btn { background:none; border:none; cursor:pointer; padding:11px 5px; display:flex; align-items:center; justify-content:center; flex-shrink:0; -webkit-tap-highlight-color:transparent; }
        .rem-toggle-track { position:relative; display:block; width: clamp(40px,11vw,48px); height: clamp(22px,6vw,26px); border-radius:999px; transition:background 0.2s; }
        .rem-toggle-knob { position:absolute; top:2px; width: calc(50% - 2px); height: calc(100% - 4px); background:white; border-radius:50%; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:transform 0.2s; }
        .rem-delete-btn { background:none; border:1.5px solid #EEF2F6; border-radius:12px; width:clamp(40px,11vw,44px); height:clamp(40px,11vw,44px); display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:background 0.15s,border-color 0.15s; -webkit-tap-highlight-color:transparent; }
        .rem-delete-btn img { width:20px; height:20px; object-fit:contain; }
        .rem-delete-btn:active { background:#FEF2F2; border-color:#FCA5A5; }
        .rem-root button:focus-visible { outline:2.5px solid #0096C7; outline-offset:2px; border-radius:10px; }
        .rem-footer { padding: clamp(10px,3vw,14px) clamp(10px,4vw,16px); padding-bottom: ${NAV_SPACER}; flex-shrink:0; display:flex; flex-direction:column; gap: clamp(8px,2vw,12px); }
        .rem-warning { font-size: clamp(10px,2.5vw,12px); color:#D97706; background:#FFFBEB; border-radius: clamp(8px,2.5vw,12px); padding: clamp(8px,2.5vw,12px) clamp(12px,3.5vw,16px); text-align:center; }
        .rem-add-btn { width:100%; background: linear-gradient(135deg,#48CAE4,#0096C7); color:white; border:none; border-radius: clamp(12px,3.5vw,18px); padding: clamp(13px,4vw,17px); font-size: clamp(14px,4vw,17px); font-weight:700; font-family:Heebo,sans-serif; cursor:pointer; transition:transform 0.12s; }
        .rem-add-btn:active { transform:scale(0.97); }
        @media (prefers-reduced-motion: no-preference) {
          .rem-card { animation: remCardIn 0.25s ease both; }
          @keyframes remCardIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        }
      `}</style>
      <div className="rem-root" dir="rtl">
        <div className="rem-header">
          <span className="rem-header-title">תזכורות</span>
          {setTab && (
            <button className="rem-back" onClick={() => setTab('home')} aria-label="חזרה למסך הבית">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        <div className="rem-list">
          {isEmpty ? (
            <div className="rem-empty">
              <img className="rem-empty-icon" src="reminders-icon.png" alt="" />
              <span className="rem-empty-text">עדיין אין תזכורות</span>
              <span className="rem-empty-hint">הוסיפו תזכורת ותקבלו התראה בזמן שתבחרו</span>
            </div>
          ) : (
            <>
              {buckets.active.map((r, i) => (
                <ReminderCard
                  key={r.id}
                  r={r}
                  due={formatDue(r.due, now)}
                  isNext={i === 0 && buckets.active.length > 1}
                  onToggle={() => handleToggle(r)}
                  onDelete={() => handleDelete(r)}
                />
              ))}

              {buckets.off.length > 0 && (
                <>
                  <div className="rem-section-label">מושהות</div>
                  {buckets.off.map(r => (
                    <ReminderCard key={r.id} r={r} muted onToggle={() => handleToggle(r)} onDelete={() => handleDelete(r)} />
                  ))}
                </>
              )}

              {buckets.done.length > 0 && (
                <>
                  <div className="rem-section-label">הושלמו</div>
                  {buckets.done.map(r => (
                    <ReminderCard key={r.id} r={r} muted done onDelete={() => handleDelete(r)} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <div className="rem-footer">
          <div className="rem-warning">⚠️ תזכורות פועלות רק כשהאפליקציה פתוחה בדפדפן</div>
          <button onClick={() => setFormOpen(true)} className="rem-add-btn">+ תזכורת חדשה</button>
        </div>

        {formOpen && (
          <ReminderForm onSave={handleAdd} onClose={() => setFormOpen(false)} />
        )}

        <BottomNav tab="reminders" setTab={setTab}/>
      </div>
    </>
  )
}
