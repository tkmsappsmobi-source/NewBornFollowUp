import { useState } from 'react'

export default function ReminderForm({ onSave, onClose }) {
  const [label, setLabel] = useState('')
  const [type, setType] = useState('recurring')
  const [hours, setHours] = useState('3')
  const [minutes, setMinutes] = useState('0')
  const [datetime, setDatetime] = useState(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })

  const minDatetime = (() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })()

  // Number('') is 0, but Number('abc') is NaN — the `|| 0` catches both so a
  // field the user left blank (e.g. cleared hours to set a minutes-only
  // reminder) never silently turns the whole interval into NaN/null.
  const hoursNum = Number(hours) || 0
  const minutesNum = Number(minutes) || 0
  const intervalMinutes = hoursNum * 60 + minutesNum
  const isValid = label.trim() && (type === 'once' || intervalMinutes > 0)

  const handleSave = () => {
    if (!isValid) return
    onSave({
      label: label.trim(),
      reminderType: type,
      intervalMinutes: type === 'recurring' ? intervalMinutes : null,
      datetime: type === 'once' ? new Date(datetime).toISOString() : null,
    })
  }

  return (
    <>
      <style>{`
        .rf-backdrop{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-end;background:rgba(0,0,0,0.45);}
        .rf-panel{width:100%;max-width:480px;margin:0 auto;background:white;border-radius:24px 24px 0 0;padding:20px 20px 0;box-shadow:0 -4px 30px rgba(0,0,0,0.15);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 90px);}
        .rf-handle{width:40px;height:4px;background:#E5E7EB;border-radius:4px;margin:0 auto 14px;}
        .rf-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .rf-title{font-size:clamp(16px,5vw,20px);font-weight:800;color:#111827;flex:1;text-align:center;font-family:Heebo,sans-serif;}
        .rf-close{width:34px;height:34px;border-radius:50%;background:#F3F4F6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6B7280;font-size:16px;flex-shrink:0;}
        .rf-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;font-family:Heebo,sans-serif;}
        .rf-input{width:100%;border:1.5px solid #E5E7EB;border-radius:12px;padding:12px 14px;font-size:15px;font-family:Heebo,sans-serif;outline:none;box-sizing:border-box;direction:rtl;}
        .rf-input:focus{border-color:#0096C7;}
        .rf-field{margin-bottom:12px;}
        .rf-toggle{display:flex;background:#F3F4F6;border-radius:12px;padding:3px;margin-bottom:12px;}
        .rf-toggle-btn{flex:1;border:none;border-radius:10px;padding:9px;font-size:14px;font-weight:600;cursor:pointer;font-family:Heebo,sans-serif;transition:all 0.15s;background:transparent;color:#6B7280;}
        .rf-toggle-btn.active{background:#0096C7;color:white;}
        .rf-interval-row{display:flex;align-items:center;gap:10px;}
        .rf-interval-input{width:72px;border:1.5px solid #E5E7EB;border-radius:12px;padding:10px;font-size:15px;font-family:Heebo,sans-serif;outline:none;text-align:center;box-sizing:border-box;}
        .rf-interval-input:focus{border-color:#0096C7;}
        .rf-interval-label{font-size:14px;color:#374151;font-family:Heebo,sans-serif;font-weight:500;}
        .rf-btn-save{width:100%;background:linear-gradient(135deg,#48CAE4,#0096C7);color:white;border:none;border-radius:14px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;margin-top:8px;}
        .rf-btn-save:disabled{opacity:0.4;cursor:default;}
      `}</style>
      <div className="rf-backdrop" onClick={onClose}>
        <div className="rf-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="rf-handle" />
          <div className="rf-topbar">
            <div style={{width:34}}/>
            <div className="rf-title">🔔 תזכורת חדשה</div>
            <button className="rf-close" onClick={onClose}>✕</button>
          </div>

          <div className="rf-field">
            <div className="rf-label">תיאור התזכורת</div>
            <input className="rf-input" type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder='לדוגמה: זמן האכלה' autoFocus/>
          </div>

          <div className="rf-field">
            <div className="rf-label">סוג תזכורת</div>
            <div className="rf-toggle">
              {[['recurring', 'חוזרת'], ['once', 'חד-פעמית']].map(([val, txt]) => (
                <button key={val} className={`rf-toggle-btn${type===val?' active':''}`} onClick={() => setType(val)}>{txt}</button>
              ))}
            </div>
          </div>

          {type === 'recurring' ? (
            <div className="rf-field">
              <div className="rf-label">כל כמה זמן?</div>
              <div className="rf-interval-row">
                <input className="rf-interval-input" type="number" value={hours} onChange={e => setHours(e.target.value)} min="0" max="23"/>
                <span className="rf-interval-label">שעות</span>
                <input className="rf-interval-input" type="number" value={minutes} onChange={e => setMinutes(e.target.value)} min="0" max="59"/>
                <span className="rf-interval-label">דקות</span>
              </div>
            </div>
          ) : (
            <div className="rf-field">
              <div className="rf-label">תאריך ושעה</div>
              <input className="rf-input" type="datetime-local" value={datetime} min={minDatetime} onChange={e => setDatetime(e.target.value)}/>
            </div>
          )}

          <button className="rf-btn-save" disabled={!isValid} onClick={handleSave}>שמור</button>
        </div>
      </div>
    </>
  )
}
