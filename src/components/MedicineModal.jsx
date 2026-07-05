const MEDICINES = [
  { name: 'סימיקול', bg: '#FCE7F3', badgeBg: '#FBCFE8', badgeColor: '#9D174D' },
  { name: 'נורופן',   bg: '#FFE4CC', badgeBg: '#FED7AA', badgeColor: '#9A3412' },
  { name: 'ויטמין D', bg: '#E8E0FF', badgeBg: '#DDD6FE', badgeColor: '#5B21B6' },
  { name: 'סטרימר',  bg: '#C8F0E8', badgeBg: '#99F6E4', badgeColor: '#115E59' },
  { name: 'ברזל',    bg: '#FFF3CC', badgeBg: '#FDE68A', badgeColor: '#92400E' },
]

export default function MedicineModal({ onConfirm, onClose }) {
  return (
    <>
      <style>{`
        .med-backdrop { position:fixed; inset:0; z-index:60; display:flex; align-items:flex-end; background:rgba(0,0,0,0.35); }
        .med-panel { width:100%; max-width:480px; margin:0 auto; background:white; border-radius:24px 24px 0 0; padding:20px 20px; box-shadow:0 -4px 30px rgba(0,0,0,0.15); padding-bottom:calc(env(safe-area-inset-bottom,0px) + 20px); }
        .med-handle { width:40px; height:4px; background:#E5E7EB; border-radius:4px; margin:0 auto 14px; }
        .med-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .med-title { font-size:clamp(16px,5vw,20px); font-weight:800; color:#111827; flex:1; text-align:center; font-family:Heebo,sans-serif; display:flex; align-items:center; justify-content:center; gap:8px; }
        .med-close { width:34px; height:34px; border-radius:50%; background:#F3F4F6; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6B7280; font-size:16px; flex-shrink:0; }
        .med-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .med-tile { background:none; border:none; padding:0; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; -webkit-tap-highlight-color:transparent; }
        .med-tile-icon { width:100%; aspect-ratio:1; border-radius:20px; display:flex; align-items:center; justify-content:center; transition:transform 0.12s; }
        .med-tile-icon:active { transform:scale(0.88); }
        .med-tile-lbl { font-size:clamp(10px,2.8vw,12px); font-weight:700; padding:4px 12px; border-radius:20px; }
      `}</style>

      <div className="med-backdrop" onClick={onClose}>
        <div className="med-panel" onClick={e => e.stopPropagation()} dir="rtl">
          <div className="med-handle" />
          <div className="med-topbar">
            <div style={{width:34}}/>
            <div className="med-title"><img src="/medicine-icon.png" alt="" style={{width:22,height:22,objectFit:'contain'}}/> תרופה</div>
            <button className="med-close" onClick={onClose}>✕</button>
          </div>

          <div className="med-grid">
            {MEDICINES.map(m => (
              <button key={m.name} className="med-tile" onClick={() => onConfirm(m.name)}>
                <div className="med-tile-icon" style={{background: m.bg}}>
                  <img src="/medicine-icon.png" alt={m.name} style={{width:'70%',height:'70%',objectFit:'contain',display:'block'}}/>
                </div>
                <span className="med-tile-lbl" style={{background: m.badgeBg, color: m.badgeColor}}>{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
