import { useState } from 'react'

const CATEGORIES = [
  { id: 'motor', label: 'מוטורי 🏃' },
  { id: 'social', label: 'חברתי 😊' },
  { id: 'speech', label: 'דיבור 🗣️' },
  { id: 'cognitive', label: 'קוגניטיבי 🧠' },
]

export default function MilestoneModal({ onConfirm, onClose }) {
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('motor')

  const handleConfirm = () => {
    if (!description.trim()) return
    onConfirm({ description: description.trim(), category })
  }

  return (
    <>
      <style>{`
        .mm-backdrop { position:fixed; inset:0; z-index:40; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .mm-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px 32px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); }
        .mm-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 16px; }
        .mm-title { font-size:clamp(16px,5vw,20px); font-weight:800; text-align:center; margin-bottom:20px; color:#111827; }
        .mm-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
        .mm-textarea { width:100%; border:1.5px solid #E5E7EB; border-radius:12px; padding:12px 14px; font-size:15px; font-family:Heebo,sans-serif; outline:none; resize:none; box-sizing:border-box; min-height:80px; }
        .mm-textarea:focus { border-color:#0096C7; }
        .mm-pills { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px; }
        .mm-pill { border:1.5px solid #E5E7EB; border-radius:20px; padding:8px 14px; font-size:13px; font-weight:600; cursor:pointer; font-family:Heebo,sans-serif; background:white; transition:all 0.15s; min-height:44px; display:flex; align-items:center; }
        .mm-pill.active { background:#0096C7; color:white; border-color:#0096C7; }
        .mm-btn-confirm { width:100%; background:#0096C7; color:white; border:none; border-radius:14px; padding:14px; font-size:16px; font-weight:700; cursor:pointer; font-family:Heebo,sans-serif; margin-top:8px; }
        .mm-btn-confirm:disabled { opacity:0.4; cursor:default; }
        .mm-btn-cancel { width:100%; background:none; border:none; color:#9CA3AF; font-size:14px; padding:10px; cursor:pointer; font-family:Heebo,sans-serif; }
      `}</style>
      <div className="mm-backdrop" onClick={onClose}>
        <div className="mm-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="mm-handle" />
          <div className="mm-title">אבן דרך ⭐</div>
          <div style={{ marginBottom: 12 }}>
            <div className="mm-label">תיאור *</div>
            <textarea
              className="mm-textarea"
              placeholder="תאר את האבן דרך..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div className="mm-label">קטגוריה</div>
            <div className="mm-pills">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  className={`mm-pill${category === c.id ? ' active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >{c.label}</button>
              ))}
            </div>
          </div>
          <button className="mm-btn-confirm" disabled={!description.trim()} onClick={handleConfirm}>שמור</button>
          <button className="mm-btn-cancel" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </>
  )
}
