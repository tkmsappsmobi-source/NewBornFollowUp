import { useState } from 'react'

export default function ManualLogForm({ categories, onSave, onClose }) {
  const enabled = categories.filter(c => c.enabled)
  const [categoryId, setCategoryId] = useState(enabled[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [datetime, setDatetime] = useState(() => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  })

  const selected = categories.find(c => c.id === categoryId)
  const isFeeding = selected?.type === 'feeding'

  const handleSave = () => {
    if (!categoryId) return
    onSave({
      categoryId,
      amount: isFeeding && amount ? parseInt(amount) : null,
      note,
      timestamp: new Date(datetime).toISOString(),
    })
  }

  return (
    <>
      <style>{`
        .mlf-backdrop{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-end;background:rgba(0,0,0,0.45);}
        .mlf-panel{width:100%;max-width:480px;margin:0 auto;background:white;border-radius:24px 24px 0 0;padding:20px 20px 0;box-shadow:0 -4px 30px rgba(0,0,0,0.15);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 90px);}
        .mlf-handle{width:40px;height:4px;background:#E5E7EB;border-radius:4px;margin:0 auto 14px;}
        .mlf-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
        .mlf-title{font-size:clamp(16px,5vw,20px);font-weight:800;color:#111827;flex:1;text-align:center;font-family:Heebo,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;}
        .mlf-close{width:34px;height:34px;border-radius:50%;background:#F3F4F6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6B7280;font-size:16px;flex-shrink:0;}
        .mlf-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;font-family:Heebo,sans-serif;}
        .mlf-input{width:100%;border:1.5px solid #E5E7EB;border-radius:12px;padding:12px 14px;font-size:15px;font-family:Heebo,sans-serif;outline:none;box-sizing:border-box;direction:rtl;}
        .mlf-input:focus{border-color:#0096C7;}
        .mlf-select{width:100%;border:1.5px solid #E5E7EB;border-radius:12px;padding:12px 14px;font-size:15px;font-family:Heebo,sans-serif;outline:none;box-sizing:border-box;background:white;direction:rtl;}
        .mlf-select:focus{border-color:#0096C7;}
        .mlf-field{margin-bottom:12px;}
        .mlf-btn-save{width:100%;background:linear-gradient(135deg,#48CAE4,#0096C7);color:white;border:none;border-radius:14px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;margin-top:8px;}
        .mlf-btn-save:disabled{opacity:0.4;cursor:default;}
      `}</style>
      <div className="mlf-backdrop" onClick={onClose}>
        <div className="mlf-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="mlf-handle" />
          <div className="mlf-topbar">
            <div style={{width:34}}/>
            <div className="mlf-title"><img src="/edit-icon.png" alt="" style={{width:22,height:22,objectFit:'contain'}}/> רישום ידני</div>
            <button className="mlf-close" onClick={onClose}>✕</button>
          </div>

          <div className="mlf-field">
            <div className="mlf-label">קטגוריה</div>
            <select className="mlf-select" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
              {enabled.map(c => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>

          {isFeeding && (
            <div className="mlf-field">
              <div className="mlf-label">כמות (מ"ל)</div>
              <input className="mlf-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder='לדוגמה: 120' min="1" max="500"/>
            </div>
          )}

          <div className="mlf-field">
            <div className="mlf-label">תאריך ושעה</div>
            <input className="mlf-input" type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)}/>
          </div>

          <div className="mlf-field">
            <div className="mlf-label">הערה</div>
            <input className="mlf-input" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder='הערה חופשית (אופציונלי)'/>
          </div>

          <button className="mlf-btn-save" disabled={!categoryId} onClick={handleSave}>שמור</button>
        </div>
      </div>
    </>
  )
}
