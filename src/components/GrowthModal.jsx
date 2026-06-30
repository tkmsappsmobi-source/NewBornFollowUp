import { useState } from 'react'

export default function GrowthModal({ onConfirm, onClose, lastWeight }) {
  const [weight, setWeight] = useState(lastWeight != null ? String(lastWeight) : '')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')

  const parsed = parseFloat(weight)
  const valid = parsed > 0

  const adjust = (delta) => {
    const cur = parseFloat(weight) || 0
    const next = Math.max(0, Math.round((cur + delta) * 100) / 100)
    setWeight(String(next))
  }

  const handleConfirm = () => {
    if (!valid) return
    const timestamp = date
      ? new Date(date + 'T12:00:00').toISOString()
      : new Date().toISOString()
    onConfirm({ weight: parsed, note, timestamp })
  }

  return (
    <>
      <style>{`
        .gm-backdrop{position:fixed;inset:0;z-index:60;display:flex;align-items:flex-end;background:rgba(0,0,0,0.35);}
        .gm-panel{width:100%;max-width:480px;margin:0 auto;background:white;border-radius:24px 24px 0 0;padding:20px 20px 0;box-shadow:0 -4px 30px rgba(0,0,0,0.15);padding-bottom:calc(env(safe-area-inset-bottom,0px) + 24px);}
        .gm-handle{width:40px;height:4px;background:#E5E7EB;border-radius:4px;margin:0 auto 14px;}
        .gm-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
        .gm-title{font-size:18px;font-weight:800;color:#111827;flex:1;text-align:center;}
        .gm-close{width:34px;height:34px;border-radius:50%;background:#F3F4F6;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#6B7280;font-size:16px;flex-shrink:0;}
        .gm-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;}
        .gm-field{margin-bottom:14px;}
        .gm-weight-row{display:flex;align-items:center;gap:10px;}
        .gm-adj-btn{width:52px;height:52px;border-radius:16px;background:#F0F8FF;border:1.5px solid #0096C7;color:#0096C7;font-size:26px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;}
        .gm-weight-input{flex:1;border:1.5px solid #E5E7EB;border-radius:14px;padding:13px 14px;font-size:22px;font-weight:700;font-family:Heebo,sans-serif;outline:none;text-align:center;color:#111827;}
        .gm-weight-input:focus{border-color:#0096C7;}
        .gm-unit{font-size:13px;color:#9CA3AF;text-align:center;margin-top:4px;}
        .gm-input{width:100%;border:1.5px solid #E5E7EB;border-radius:12px;padding:12px 14px;font-size:15px;font-family:Heebo,sans-serif;outline:none;box-sizing:border-box;}
        .gm-input:focus{border-color:#0096C7;}
        .gm-btn-confirm{width:100%;background:linear-gradient(135deg,#48CAE4,#0096C7);color:white;border:none;border-radius:14px;padding:15px;font-size:16px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;margin-top:4px;min-height:52px;}
        .gm-btn-confirm:disabled{opacity:0.4;cursor:default;}
        .gm-last-hint{text-align:center;font-size:12px;color:#9CA3AF;margin-bottom:14px;}
      `}</style>
      <div className="gm-backdrop" onClick={onClose}>
        <div className="gm-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="gm-handle"/>
          <div className="gm-topbar">
            <div style={{width:34}}/>
            <div className="gm-title">⚖️ משקל</div>
            <button className="gm-close" onClick={onClose}>✕</button>
          </div>

          {lastWeight != null && (
            <div className="gm-last-hint">משקל אחרון: {lastWeight} ק"ג</div>
          )}

          <div className="gm-field">
            <div className="gm-label">משקל (ק"ג) *</div>
            <div className="gm-weight-row">
              <button className="gm-adj-btn" onClick={() => adjust(-0.05)}>−</button>
              <input
                className="gm-weight-input"
                type="number"
                step="0.05"
                min="0"
                placeholder="0.00"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                autoFocus
              />
              <button className="gm-adj-btn" onClick={() => adjust(0.05)}>+</button>
            </div>
            <div className="gm-unit">ק"ג</div>
          </div>

          <div className="gm-field">
            <div className="gm-label">תאריך</div>
            <input
              className="gm-input"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="gm-field">
            <div className="gm-label">הערה</div>
            <input
              className="gm-input"
              type="text"
              placeholder="הערה אופציונלית"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          <button className="gm-btn-confirm" disabled={!valid} onClick={handleConfirm}>
            שמור
          </button>
        </div>
      </div>
    </>
  )
}
