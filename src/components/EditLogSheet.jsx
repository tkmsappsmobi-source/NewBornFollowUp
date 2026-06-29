import { useState } from 'react'

export default function EditLogSheet({ log, category, onConfirm, onClose }) {
  const [note, setNote] = useState(log.note || '')
  const [amount, setAmount] = useState(log.amount ? String(log.amount) : '')

  const isFeeding = category?.type === 'feeding'

  const handleConfirm = () => {
    const patch = { note }
    if (isFeeding && amount) patch.amount = parseInt(amount) || log.amount
    onConfirm(patch)
  }

  return (
    <>
      <style>{`
        .els-backdrop { position:fixed; inset:0; z-index:50; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .els-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px 32px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); }
        .els-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 16px; }
        .els-title { font-size:clamp(15px,4.5vw,18px); font-weight:800; text-align:center; margin-bottom:18px; color:#111827; }
        .els-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
        .els-input { width:100%; border:1.5px solid #E5E7EB; border-radius:12px; padding:11px 14px; font-size:15px; font-family:Heebo,sans-serif; outline:none; box-sizing:border-box; }
        .els-input:focus { border-color:#0096C7; }
        .els-field { margin-bottom:12px; }
        .els-btn-confirm { width:100%; background:#0096C7; color:white; border:none; border-radius:14px; padding:13px; font-size:15px; font-weight:700; cursor:pointer; font-family:Heebo,sans-serif; margin-top:8px; }
        .els-btn-cancel { width:100%; background:none; border:none; color:#9CA3AF; font-size:14px; padding:10px; cursor:pointer; font-family:Heebo,sans-serif; }
      `}</style>
      <div className="els-backdrop" onClick={onClose}>
        <div className="els-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="els-handle" />
          <div className="els-title">עריכה — {category?.label || 'רישום'} {category?.emoji || ''}</div>
          {isFeeding && (
            <div className="els-field">
              <div className="els-label">כמות (מ"ל)</div>
              <input className="els-input" type="number" min="1" max="500" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
          )}
          <div className="els-field">
            <div className="els-label">הערה</div>
            <input className="els-input" type="text" placeholder='הערה...' value={note} onChange={e => setNote(e.target.value)} autoFocus={!isFeeding} />
          </div>
          <button className="els-btn-confirm" onClick={handleConfirm}>שמור</button>
          <button className="els-btn-cancel" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </>
  )
}
