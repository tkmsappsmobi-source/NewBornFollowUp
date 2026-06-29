import { useState } from 'react'

const PRESETS = Array.from({ length: 55 }, (_, i) => 10 + i * 5) // 10..280

function fmtTime(isoStr) {
  if (!isoStr) return ''
  return new Date(isoStr).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export default function FeedingAmountSheet({ quickAmounts, onConfirm, onClose, bottleTimerStart, onStartBottle }) {
  const [selected, setSelected] = useState(120)
  const [customInput, setCustomInput] = useState('')

  const adjust = (delta) => {
    setSelected(prev => Math.min(500, Math.max(5, prev + delta)))
    setCustomInput('')
  }

  const handleCustomChange = (val) => {
    setCustomInput(val)
    const n = parseInt(val)
    if (n > 0) setSelected(n)
  }

  const handleConfirm = () => {
    if (selected > 0) onConfirm(selected, bottleTimerStart || null)
  }

  const handlePreset = (ml) => {
    setSelected(ml)
    setCustomInput('')
  }

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:50,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'flex-end'}}
      onClick={onClose}
    >
      <div
        style={{width:'100%',maxWidth:480,margin:'0 auto',background:'#1a0a2e',borderRadius:'24px 24px 0 0',padding:'0 0 env(safe-area-inset-bottom,0px)',overflow:'hidden'}}
        onClick={e=>e.stopPropagation()}
      >
        <style>{`
          .fas-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 16px;max-height:200px;overflow-y:auto;scrollbar-width:none;}
          .fas-presets::-webkit-scrollbar{display:none;}
          .fas-preset-btn{border:none;border-radius:12px;padding:10px 4px;font-size:15px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;transition:all 0.1s;display:flex;flex-direction:column;align-items:center;gap:2px;min-height:52px;}
          .fas-preset-btn.sel{background:#0096C7;color:white;}
          .fas-preset-btn:not(.sel){background:#2d1855;color:#e0d0ff;}
          .fas-preset-btn:active{transform:scale(0.94);}
          .fas-preset-unit{font-size:10px;font-weight:500;opacity:0.7;}
        `}</style>

        {/* Handle */}
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 4px'}}>
          <div style={{width:36,height:4,background:'rgba(255,255,255,0.25)',borderRadius:2}}/>
        </div>

        {/* Title */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 16px 10px',direction:'rtl'}}>
          <p style={{margin:0,fontSize:18,fontWeight:800,color:'white',fontFamily:'Heebo,sans-serif'}}>
            🍼 כמה אכל?
          </p>
          {bottleTimerStart && (
            <span style={{fontSize:12,color:'#90E0F0',fontFamily:'Heebo,sans-serif',fontWeight:600}}>
              בקבוק פעיל · {fmtTime(bottleTimerStart)}
            </span>
          )}
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.12)',border:'none',borderRadius:20,width:30,height:30,color:'white',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>

        {/* Presets grid */}
        <div className="fas-presets" dir="rtl">
          {PRESETS.map(ml => (
            <button
              key={ml}
              className={`fas-preset-btn${selected===ml?' sel':''}`}
              onClick={()=>handlePreset(ml)}
            >
              <span>{ml}</span>
              <span className="fas-preset-unit">מ"ל</span>
            </button>
          ))}
        </div>

        {/* Amount selector */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20,padding:'16px 16px 8px'}}>
          <button
            onClick={()=>adjust(-5)}
            style={{width:50,height:50,borderRadius:25,background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:26,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:300}}
          >−</button>
          <div style={{textAlign:'center'}}>
            <input
              type="number"
              value={customInput !== '' ? customInput : selected}
              onChange={e=>handleCustomChange(e.target.value)}
              style={{background:'none',border:'none',outline:'none',textAlign:'center',fontSize:52,fontWeight:800,color:'white',fontFamily:'Heebo,sans-serif',width:130,direction:'ltr'}}
            />
            <div style={{fontSize:14,color:'rgba(255,255,255,0.6)',fontFamily:'Heebo,sans-serif',marginTop:-8}}>מ"ל</div>
          </div>
          <button
            onClick={()=>adjust(5)}
            style={{width:50,height:50,borderRadius:25,background:'rgba(255,255,255,0.15)',border:'none',color:'white',fontSize:26,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:300}}
          >+</button>
        </div>

        {/* Action buttons */}
        <div style={{padding:'8px 16px 16px',display:'flex',flexDirection:'column',gap:10}}>
          <button
            onClick={handleConfirm}
            style={{width:'100%',background:'#00B4D8',color:'white',border:'none',borderRadius:16,padding:'15px',fontSize:17,fontWeight:800,cursor:'pointer',fontFamily:'Heebo,sans-serif',minHeight:52}}
          >
            {bottleTimerStart ? `✅ סיום + רשום ${selected} מ"ל` : `רשום ${selected} מ"ל`}
          </button>
          {!bottleTimerStart && onStartBottle && (
            <button
              onClick={onStartBottle}
              style={{width:'100%',background:'#3d2a1e',color:'#e8c49a',border:'1.5px solid #6b4c2a',borderRadius:16,padding:'13px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Heebo,sans-serif',minHeight:48,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
            >
              <span>🍼</span>
              <span>התחל בקבוק (מדוד זמן)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
