export default function DiaperModal({ onConfirm, onClose }) {
  return (
    <>
      <style>{`
        .diaper-backdrop { position:fixed; inset:0; z-index:60; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .diaper-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 16px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); padding-bottom:calc(env(safe-area-inset-bottom, 0px) + 20px); }
        .diaper-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 14px; }
        .diaper-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
        .diaper-close { width:34px; height:34px; border-radius:50%; background:#F3F4F6; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6B7280; font-size:16px; flex-shrink:0; }
        .diaper-title { font-size:clamp(16px,5vw,20px); font-weight:800; color:#111827; display:flex; align-items:center; gap:8px; font-family:Heebo,sans-serif; flex:1; justify-content:center; }
        .diaper-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:16px; }
        .diaper-card { border:none; cursor:pointer; border-radius:20px; padding:20px 8px 14px; display:flex; flex-direction:column; align-items:center; justify-content:space-between; gap:12px; transition:transform 0.12s; min-height:clamp(130px,35vw,160px); font-family:Heebo,sans-serif; }
        .diaper-card:active { transform:scale(0.93); }
        .diaper-card-icon { width:clamp(48px,14vw,64px); height:clamp(48px,14vw,64px); object-fit:contain; }
        .diaper-card-icon-both { display:flex; gap:4px; align-items:center; }
        .diaper-card-icon-both img { width:clamp(28px,8vw,36px); height:clamp(28px,8vw,36px); object-fit:contain; }
        .diaper-card-title { font-size:clamp(14px,4vw,17px); font-weight:800; color:#111827; }
        .diaper-card-badge { font-size:clamp(10px,2.8vw,12px); font-weight:700; padding:4px 12px; border-radius:20px; }
        .diaper-cancel { width:100%; background:none; border:none; color:#9CA3AF; font-size:14px; padding:10px; cursor:pointer; font-family:Heebo,sans-serif; }
      `}</style>
      <div className="diaper-backdrop" onClick={onClose}>
        <div className="diaper-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="diaper-handle" />
          <div className="diaper-topbar">
            <div style={{width:34}}/>
            <div className="diaper-title">
              <img src="diaper-icon.png" alt="חיתול" style={{width:26,height:26,objectFit:'contain'}}/>
              סוג חיתול?
            </div>
            <button className="diaper-close" onClick={onClose}>✕</button>
          </div>
          <div className="diaper-grid">

            <button className="diaper-card" style={{background:'#DBEAFE'}} onClick={() => onConfirm('pee')}>
              <img src="pee-icon.png" alt="פיפי" className="diaper-card-icon"/>
              <span className="diaper-card-title">פיפי</span>
              <span className="diaper-card-badge" style={{background:'#BFDBFE',color:'#1D4ED8'}}>שתן</span>
            </button>

            <button className="diaper-card" style={{background:'#FEF3C7'}} onClick={() => onConfirm('poop')}>
              <img src="poop-icon.png" alt="קקי" className="diaper-card-icon"/>
              <span className="diaper-card-title">קקי</span>
              <span className="diaper-card-badge" style={{background:'#FDE68A',color:'#92400E'}}>צואה</span>
            </button>

            <button className="diaper-card" style={{background:'#D1FAE5'}} onClick={() => onConfirm('both')}>
              <div className="diaper-card-icon-both">
                <img src="pee-icon.png" alt=""/>
                <img src="poop-icon.png" alt=""/>
              </div>
              <span className="diaper-card-title">שניהם</span>
              <span className="diaper-card-badge" style={{background:'#A7F3D0',color:'#065F46'}}>שתן וצואה</span>
            </button>

          </div>
        </div>
      </div>
    </>
  )
}
