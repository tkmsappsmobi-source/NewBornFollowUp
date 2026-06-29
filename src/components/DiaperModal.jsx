export default function DiaperModal({ onConfirm, onClose }) {
  return (
    <>
      <style>{`
        .diaper-backdrop { position:fixed; inset:0; z-index:40; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .diaper-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px 32px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); }
        .diaper-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 16px; }
        .diaper-title { font-size:clamp(16px,5vw,20px); font-weight:800; text-align:center; margin-bottom:20px; color:#111827; display:flex; align-items:center; justify-content:center; gap:10px; }
        .diaper-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:16px; }
        .diaper-btn { border:none; cursor:pointer; border-radius:16px; padding:clamp(16px,5vw,22px) 8px; display:flex; flex-direction:column; align-items:center; gap:8px; transition:transform 0.12s; min-height:88px; }
        .diaper-btn:active { transform:scale(0.93); }
        .diaper-btn-icon { width:clamp(36px,10vw,48px); height:clamp(36px,10vw,48px); object-fit:contain; }
        .diaper-btn-label { font-size:clamp(11px,3vw,14px); font-weight:700; color:#374151; }
        .diaper-cancel { width:100%; background:none; border:none; color:#9CA3AF; font-size:14px; padding:10px; cursor:pointer; font-family:Heebo,sans-serif; }
      `}</style>
      <div className="diaper-backdrop" onClick={onClose}>
        <div className="diaper-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="diaper-handle" />
          <div className="diaper-title">
            <img src="/diaper-icon.svg" alt="חיתול" style={{width:28,height:28,objectFit:'contain'}}/>
            חיתול
          </div>
          <div className="diaper-grid">
            <button className="diaper-btn" style={{ background: '#FFFDE0' }} onClick={() => onConfirm('pee')}>
              <img src="/pee-icon.svg" alt="פיפי" className="diaper-btn-icon"/>
              <span className="diaper-btn-label">פיפי</span>
            </button>
            <button className="diaper-btn" style={{ background: '#FFF3CC' }} onClick={() => onConfirm('poop')}>
              <img src="/poop-icon.svg" alt="קקי" className="diaper-btn-icon"/>
              <span className="diaper-btn-label">קקי</span>
            </button>
            <button className="diaper-btn" style={{ background: '#C8F0E0' }} onClick={() => onConfirm('both')}>
              <div style={{display:'flex',gap:2,alignItems:'center'}}>
                <img src="/pee-icon.svg" alt="" style={{width:'clamp(18px,5vw,22px)',height:'clamp(18px,5vw,22px)',objectFit:'contain'}}/>
                <img src="/poop-icon.svg" alt="" style={{width:'clamp(18px,5vw,22px)',height:'clamp(18px,5vw,22px)',objectFit:'contain'}}/>
              </div>
              <span className="diaper-btn-label">שניהם</span>
            </button>
          </div>
          <button className="diaper-cancel" onClick={onClose}>ביטול</button>
        </div>
      </div>
    </>
  )
}
