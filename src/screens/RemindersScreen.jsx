import { useState } from 'react'
import { useStore } from '../store/useStore'
import ReminderForm from '../components/ReminderForm'
import BottomNav, { NAV_SPACER } from '../components/BottomNav'
import { formatDateTime } from '../lib/time'

function intervalLabel(r) {
  if (r.type === 'once') return `חד-פעמית · ${formatDateTime(r.datetime)}`
  const h = Math.floor(r.intervalMinutes / 60)
  const m = r.intervalMinutes % 60
  const parts = []
  if (h) parts.push(`${h} שעות`)
  if (m) parts.push(`${m} דקות`)
  return `כל ${parts.join(' ו')}`
}

export default function RemindersScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [formOpen, setFormOpen] = useState(false)

  const handleAdd = (data) => {
    dispatch({ type: 'ADD_REMINDER', ...data })
    setFormOpen(false)
    showToast('🔔 תזכורת נוספה')
  }

  return (
    <>
      <style>{`
        .rem-root { display:flex; flex-direction:column; height:100%; background:#F0F8FF; font-family:Heebo,sans-serif; }
        .rem-header { background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%); padding:clamp(12px,3.5vw,18px) clamp(12px,4vw,18px); padding-top:max(env(safe-area-inset-top,16px),16px); flex-shrink:0; display:flex; align-items:center; justify-content:center; position:relative; }
        .rem-header-title { font-size:clamp(15px,4.5vw,19px); font-weight:800; color:#0D2640; }
        .rem-back { position:absolute; left:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:10px; color:#0D2640; }
        .rem-list { flex:1; overflow-y:auto; -webkit-overflow-scrolling:touch; padding: clamp(10px,3vw,14px) clamp(10px,4vw,16px); display:flex; flex-direction:column; gap: clamp(8px,2vw,12px); }
        .rem-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:10px; color:#9CA3AF; }
        .rem-empty-icon { font-size: clamp(40px,12vw,56px); }
        .rem-empty-text { font-size: clamp(13px,3.5vw,16px); font-weight:500; }
        .rem-empty-hint { font-size: clamp(11px,3vw,13px); color:#D1D5DB; }
        .rem-card { background:white; border-radius: clamp(12px,3.5vw,18px); padding: clamp(12px,3.5vw,16px); box-shadow:0 2px 10px rgba(0,0,0,0.06); display:flex; align-items:center; gap: clamp(10px,3vw,14px); }
        .rem-label { font-size: clamp(13px,3.5vw,15px); font-weight:600; color:#111827; line-height:1.3; }
        .rem-interval { font-size: clamp(10px,2.5vw,12px); color:#9CA3AF; margin-top:2px; }
        .rem-fired { font-size: clamp(9px,2.5vw,11px); color:#D1D5DB; margin-top:2px; }
        .rem-toggle { position:relative; width: clamp(44px,12vw,52px); height: clamp(24px,6.5vw,28px); border-radius:999px; border:none; cursor:pointer; flex-shrink:0; transition:background 0.2s; }
        .rem-toggle-knob { position:absolute; top:2px; width: calc(50% - 2px); height: calc(100% - 4px); background:white; border-radius:50%; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:transform 0.2s; }
        .rem-delete { background:none; border:none; font-size: clamp(18px,5vw,22px); color:#D1D5DB; cursor:pointer; flex-shrink:0; line-height:1; padding:0 2px; transition:color 0.15s; }
        .rem-delete:active { color:#EF4444; }
        .rem-footer { padding: clamp(10px,3vw,14px) clamp(10px,4vw,16px); padding-bottom: ${NAV_SPACER}; flex-shrink:0; display:flex; flex-direction:column; gap: clamp(8px,2vw,12px); }
        .rem-warning { font-size: clamp(10px,2.5vw,12px); color:#D97706; background:#FFFBEB; border-radius: clamp(8px,2.5vw,12px); padding: clamp(8px,2.5vw,12px) clamp(12px,3.5vw,16px); text-align:center; }
        .rem-add-btn { width:100%; background: linear-gradient(135deg,#48CAE4,#0096C7); color:white; border:none; border-radius: clamp(12px,3.5vw,18px); padding: clamp(13px,4vw,17px); font-size: clamp(14px,4vw,17px); font-weight:700; font-family:Heebo,sans-serif; cursor:pointer; transition:transform 0.12s; }
        .rem-add-btn:active { transform:scale(0.97); }
      `}</style>
      <div className="rem-root" dir="rtl">
        <div className="rem-header">
          <span className="rem-header-title">תזכורות</span>
          {setTab && (
            <button className="rem-back" onClick={() => setTab('profile')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        <div className="rem-list">
          {state.reminders.length === 0 ? (
            <div className="rem-empty">
              <span className="rem-empty-icon">🔔</span>
              <span className="rem-empty-text">אין תזכורות עדיין</span>
              <span className="rem-empty-hint">תזכורות פועלות כשהאפליקציה פתוחה</span>
            </div>
          ) : (
            state.reminders.map(r => (
              <div key={r.id} className="rem-card">
                <span style={{ fontSize: 'clamp(20px,6vw,26px)', flexShrink: 0 }}>🔔</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rem-label">{r.label}</div>
                  <div className="rem-interval">{intervalLabel(r)}</div>
                  {r.lastFired && (
                    <div className="rem-fired">הופעל לאחרונה: {formatDateTime(r.lastFired)}</div>
                  )}
                </div>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_REMINDER', id: r.id })}
                  className="rem-toggle"
                  style={{ background: r.enabled ? '#0096C7' : '#E5E7EB' }}
                >
                  <span
                    className="rem-toggle-knob"
                    style={{ transform: r.enabled ? 'translateX(calc(100% + 0px))' : 'translateX(0)' }}
                  />
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_REMINDER', id: r.id })}
                  className="rem-delete"
                >×</button>
              </div>
            ))
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
