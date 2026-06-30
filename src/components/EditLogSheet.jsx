import { useState } from 'react'

function toDateInput(iso) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 10)
}

function toTimeInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function buildTimestamp(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

export default function EditLogSheet({ log, category, onConfirm, onClose }) {
  const [note, setNote] = useState(log.note || '')
  const [amount, setAmount] = useState(log.amount ? String(log.amount) : '')
  const [date, setDate] = useState(toDateInput(log.timestamp))
  const [time, setTime] = useState(toTimeInput(log.timestamp))

  const isFeeding = category?.type === 'feeding'

  const handleConfirm = () => {
    const patch = { note }
    if (isFeeding && amount) patch.amount = parseInt(amount) || log.amount
    const ts = buildTimestamp(date, time)
    if (ts) patch.timestamp = ts
    onConfirm(patch)
  }

  return (
    <>
      <style>{`
        .els-backdrop { position:fixed; inset:0; z-index:60; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .els-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px 0; box-shadow:0 -4px 30px rgba(0,0,0,0.15); padding-bottom:calc(env(safe-area-inset-bottom,0px) + 90px); }
        .els-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 14px; }
        .els-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .els-title { font-size:clamp(15px,4.5vw,18px); font-weight:800; color:#111827; flex:1; text-align:center; }
        .els-close { width:34px; height:34px; border-radius:50%; background:#F3F4F6; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6B7280; font-size:16px; flex-shrink:0; }
        .els-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
        .els-input { width:100%; border:1.5px solid #E5E7EB; border-radius:12px; padding:11px 14px; font-size:15px; font-family:Heebo,sans-serif; outline:none; box-sizing:border-box; background:white; }
        .els-input:focus { border-color:#0096C7; }
        .els-field { margin-bottom:12px; }
        .els-row { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
        .els-btn-confirm { width:100%; background:linear-gradient(135deg,#48CAE4,#0096C7); color:white; border:none; border-radius:14px; padding:13px; font-size:15px; font-weight:700; cursor:pointer; font-family:Heebo,sans-serif; margin-top:8px; }
      `}</style>
      <div className="els-backdrop" onClick={onClose}>
        <div className="els-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="els-handle" />
          <div className="els-topbar">
            <div style={{width:34}}/>
            <div className="els-title">עריכה</div>
            <button className="els-close" onClick={onClose}>✕</button>
          </div>

          <div className="els-row">
            <div>
              <div className="els-label">תאריך</div>
              <input className="els-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <div className="els-label">שעה</div>
              <input className="els-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          {isFeeding && (
            <div className="els-field">
              <div className="els-label">כמות (מ"ל)</div>
              <input className="els-input" type="number" min="1" max="500" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
          )}

          <div className="els-field">
            <div className="els-label">הערות</div>
            <input className="els-input" type="text" placeholder='הערה...' value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <button className="els-btn-confirm" onClick={handleConfirm}>שמור שינויים</button>
        </div>
      </div>
    </>
  )
}
