import { useState } from 'react'

const PRESETS = ['אקמול', 'אדוויל', 'ויטמין D', 'אנטיביוטיקה', 'סטרימר', 'סימיקול']
const UNITS = ['מ"ל', 'מ"ג', 'טיפות', 'כמוסה']
const REMINDER_OPTIONS = [
  { label: 'ללא', hours: null },
  { label: '4 שע\'', hours: 4 },
  { label: '6 שע\'', hours: 6 },
  { label: '8 שע\'', hours: 8 },
  { label: '12 שע\'', hours: 12 },
]

function scheduleNotification(medicineName, dose, unit, hours) {
  if (!hours) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const ms = hours * 60 * 60 * 1000
  setTimeout(() => {
    new Notification(`💊 מנה הבאה: ${medicineName}`, {
      body: `${dose} ${unit}`,
      icon: '/favicon.ico',
    })
  }, ms)
}

export default function MedicineModal({ onConfirm, onClose, notificationsEnabled }) {
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [unit, setUnit] = useState('מ"ל')
  const [reminderHours, setReminderHours] = useState(null)

  const handlePreset = (preset) => setName(preset)

  const handleConfirm = () => {
    if (!name.trim()) return
    const nextDoseAt = reminderHours
      ? new Date(Date.now() + reminderHours * 3600000).toISOString()
      : null
    if (notificationsEnabled) scheduleNotification(name, dose, unit, reminderHours)
    onConfirm({ medicineName: name.trim(), dose: dose || null, unit, reminderHours, nextDoseAt })
  }

  return (
    <>
      <style>{`
        .med-backdrop { position:fixed; inset:0; z-index:60; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .med-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); padding-bottom:calc(env(safe-area-inset-bottom,0px) + 20px); overflow-y:auto; max-height:90dvh; }
        .med-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 14px; }
        .med-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .med-title { font-size:clamp(15px,4.5vw,18px); font-weight:800; color:#111827; flex:1; text-align:center; font-family:Heebo,sans-serif; }
        .med-close { width:34px; height:34px; border-radius:50%; background:#F3F4F6; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6B7280; font-size:16px; flex-shrink:0; }
        .med-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; font-family:Heebo,sans-serif; }
        .med-field { margin-bottom:14px; }
        .med-input { width:100%; border:1.5px solid #E5E7EB; border-radius:12px; padding:11px 14px; font-size:15px; font-family:Heebo,sans-serif; outline:none; box-sizing:border-box; background:white; }
        .med-input:focus { border-color:#0096C7; }
        .med-presets { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }
        .med-preset { border:1.5px solid #E5E7EB; border-radius:20px; padding:7px 14px; font-size:13px; font-weight:600; cursor:pointer; font-family:Heebo,sans-serif; background:white; color:#374151; transition:all 0.12s; }
        .med-preset.sel { background:#0096C7; color:white; border-color:#0096C7; }
        .med-preset:active { transform:scale(0.94); }
        .med-dose-row { display:grid; grid-template-columns:1fr auto; gap:10px; margin-bottom:14px; align-items:end; }
        .med-units { display:flex; gap:6px; flex-wrap:wrap; }
        .med-unit { border:1.5px solid #E5E7EB; border-radius:10px; padding:8px 12px; font-size:13px; font-weight:600; cursor:pointer; font-family:Heebo,sans-serif; background:white; color:#374151; transition:all 0.12s; }
        .med-unit.sel { background:#0096C7; color:white; border-color:#0096C7; }
        .med-reminder-row { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:6px; }
        .med-reminder-btn { border:1.5px solid #E5E7EB; border-radius:10px; padding:8px 12px; font-size:12px; font-weight:600; cursor:pointer; font-family:Heebo,sans-serif; background:white; color:#374151; transition:all 0.12s; }
        .med-reminder-btn.sel { background:#7C3AED; color:white; border-color:#7C3AED; }
        .med-confirm { width:100%; background:linear-gradient(135deg,#48CAE4,#0096C7); color:white; border:none; border-radius:14px; padding:14px; font-size:16px; font-weight:700; cursor:pointer; font-family:Heebo,sans-serif; margin-top:10px; }
        .med-confirm:disabled { opacity:0.45; cursor:not-allowed; }
      `}</style>

      <div className="med-backdrop" onClick={onClose}>
        <div className="med-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="med-handle" />
          <div className="med-topbar">
            <div style={{width:34}}/>
            <div className="med-title" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><img src="/medicine-icon.png" alt="" style={{width:22,height:22,objectFit:'contain'}}/> רישום תרופה</div>
            <button className="med-close" onClick={onClose}>✕</button>
          </div>

          {/* Presets */}
          <div className="med-field">
            <div className="med-label">תרופות נפוצות</div>
            <div className="med-presets">
              {PRESETS.map(p => (
                <button key={p} className={`med-preset${name === p ? ' sel' : ''}`} onClick={() => handlePreset(p)}>{p}</button>
              ))}
            </div>
          </div>

          {/* Free name input */}
          <div className="med-field">
            <div className="med-label">שם תרופה</div>
            <input
              className="med-input"
              type="text"
              placeholder="הזן שם תרופה..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Dose + unit */}
          <div className="med-field">
            <div className="med-label">מינון</div>
            <div className="med-dose-row">
              <input
                className="med-input"
                type="number"
                placeholder="כמות..."
                value={dose}
                onChange={e => setDose(e.target.value)}
                style={{margin:0}}
              />
            </div>
            <div className="med-units">
              {UNITS.map(u => (
                <button key={u} className={`med-unit${unit === u ? ' sel' : ''}`} onClick={() => setUnit(u)}>{u}</button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div className="med-field">
            <div className="med-label">תזכורת למנה הבאה</div>
            <div className="med-reminder-row">
              {REMINDER_OPTIONS.map(r => (
                <button
                  key={String(r.hours)}
                  className={`med-reminder-btn${reminderHours === r.hours ? ' sel' : ''}`}
                  onClick={() => setReminderHours(r.hours)}
                >{r.label}</button>
              ))}
            </div>
            {reminderHours && (
              <p style={{fontSize:11,color:'#7C3AED',marginTop:6,fontFamily:'Heebo,sans-serif',fontWeight:600}}>
                🔔 תזכורת תישלח בעוד {reminderHours} שעות
              </p>
            )}
          </div>

          <button className="med-confirm" onClick={handleConfirm} disabled={!name.trim()}>
            רשום תרופה
          </button>
        </div>
      </div>
    </>
  )
}
