import { useState } from 'react'

export default function VaccinationModal({ onConfirm, onClose }) {
  const [vaccineName, setVaccineName] = useState('')
  const [doctor, setDoctor] = useState('')
  const [notes, setNotes] = useState('')

  const handleConfirm = () => {
    if (!vaccineName.trim()) return
    onConfirm({ vaccineName: vaccineName.trim(), doctor: doctor.trim(), notes: notes.trim() })
  }

  return (
    <>
      <style>{`
        .vm-backdrop { position:fixed; inset:0; z-index:40; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .vm-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px 32px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); }
        .vm-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 16px; }
        .vm-title { font-size:clamp(16px,5vw,20px); font-weight:800; text-align:center; margin-bottom:20px; color:#111827; }
        .vm-label { font-size:13px; font-weight:600; color:#374151; margin-bottom:6px; }
        .vm-input { width:100%; border:1.5px solid #E5E7EB; border-radius:12px; padding:12px 14px; font-size:15px; font-family:Heebo,sans-serif; outline:none; box-sizing:border-box; }
        .vm-input:focus { border-color:#0096C7; }
        .vm-textarea { width:100%; border:1.5px solid #E5E7EB; border-radius:12px; padding:12px 14px; font-size:15px; font-family:Heebo,sans-serif; outline:none; resize:none; box-sizing:border-box; min-height:72px; }
        .vm-textarea:focus { border-color:#0096C7; }
        .vm-field { margin-bottom:12px; }
        .vm-btn-confirm { width:100%; background:#0096C7; color:white; border:none; border-radius:14px; padding:14px; font-size:16px; font-weight:700; cursor:pointer; font-family:Heebo,sans-serif; margin-top:8px; }
        .vm-btn-confirm:disabled { opacity:0.4; cursor:default; }
        .vm-btn-cancel { width:100%; background:none; border:none; color:#9CA3AF; font-size:14px; padding:10px; cursor:pointer; font-family:Heebo,sans-serif; }
      `}</style>
      <div className="vm-backdrop" onClick={onClose}>
        <div className="vm-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="vm-handle" />
          <div className="vm-title">חיסון 💉</div>
          <div className="vm-field">
            <div className="vm-label">שם חיסון *</div>
            <input className="vm-input" type="text" placeholder='לדוגמה: פוליו, MMR...' value={vaccineName} onChange={e => setVaccineName(e.target.value)} autoFocus />
          </div>
          <div className="vm-field">
            <div className="vm-label">שם רופא</div>
            <input className="vm-input" type="text" placeholder='שם הרופא/ה' value={doctor} onChange={e => setDoctor(e.target.value)} />
          </div>
          <div className="vm-field">
            <div className="vm-label">הערות</div>
            <textarea className="vm-textarea" placeholder='הערות נוספות...' value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button className="vm-btn-confirm" disabled={!vaccineName.trim()} onClick={handleConfirm}>שמור</button>
          <button className="vm-btn-cancel" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </>
  )
}
