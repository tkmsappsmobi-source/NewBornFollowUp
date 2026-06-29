import { useState } from 'react'

export default function GrowthModal({ onConfirm, onClose }) {
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [head, setHead] = useState('')
  const [note, setNote] = useState('')

  const handleConfirm = () => {
    const w = parseFloat(weight)
    if (!w) return
    onConfirm({
      weight: w,
      height: parseFloat(height) || null,
      headCircumference: parseFloat(head) || null,
      note,
    })
  }

  return (
    <>
      <style>{`
        .gm-backdrop { position:fixed; inset:0; z-index:40; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .gm-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px 32px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); }
        .gm-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 16px; }
        .gm-title { font-size:clamp(16px,5vw,20px); font-weight:800; text-align:center; margin-bottom:20px; color:#111827; }
        .gm-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
        .gm-input { width:100%; border:1.5px solid #E5E7EB; border-radius:12px; padding:12px 14px; font-size:15px; font-family:Heebo,sans-serif; outline:none; box-sizing:border-box; }
        .gm-input:focus { border-color:#0096C7; }
        .gm-field { margin-bottom:12px; }
        .gm-btn-confirm { width:100%; background:#0096C7; color:white; border:none; border-radius:14px; padding:14px; font-size:16px; font-weight:700; cursor:pointer; font-family:Heebo,sans-serif; margin-top:8px; }
        .gm-btn-confirm:disabled { opacity:0.4; cursor:default; }
        .gm-btn-cancel { width:100%; background:none; border:none; color:#9CA3AF; font-size:14px; padding:10px; cursor:pointer; font-family:Heebo,sans-serif; }
      `}</style>
      <div className="gm-backdrop" onClick={onClose}>
        <div className="gm-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="gm-handle" />
          <div className="gm-title">גדילה 📏</div>
          <div className="gm-field">
            <div className="gm-label">משקל (ק"ג) *</div>
            <input className="gm-input" type="number" step="0.01" placeholder='לדוגמה: 3.5' value={weight} onChange={e => setWeight(e.target.value)} autoFocus />
          </div>
          <div className="gm-field">
            <div className="gm-label">גובה (ס"מ)</div>
            <input className="gm-input" type="number" step="0.1" placeholder='לדוגמה: 52.0' value={height} onChange={e => setHeight(e.target.value)} />
          </div>
          <div className="gm-field">
            <div className="gm-label">היקף ראש (ס"מ)</div>
            <input className="gm-input" type="number" step="0.1" placeholder='לדוגמה: 35.0' value={head} onChange={e => setHead(e.target.value)} />
          </div>
          <div className="gm-field">
            <div className="gm-label">הערה</div>
            <input className="gm-input" type="text" placeholder='הערה אופציונלית' value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <button className="gm-btn-confirm" disabled={!parseFloat(weight)} onClick={handleConfirm}>שמור</button>
          <button className="gm-btn-cancel" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </>
  )
}
