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
      style={{position:'fixed',inset:0,zIndex:60,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'flex-end'}}
      onClick={onClose}
    >
      <div
        style={{width:'100%',maxWidth:480,margin:'0 auto',background:'white',borderRadius:'24px 24px 0 0',paddingBottom:'calc(env(safe-area-inset-bottom,0px) + 90px)',overflow:'hidden',boxShadow:'0 -4px 30px rgba(0,0,0,0.15)'}}
        onClick={e=>e.stopPropagation()}
        dir="rtl"
      >
        <style>{`
          .fas-presets{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 16px;max-height:200px;overflow-y:auto;scrollbar-width:none;}
          .fas-presets::-webkit-scrollbar{display:none;}
          input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0;}
          input[type=number]{-moz-appearance:textfield;}
          .fas-preset-btn{border:none;border-radius:12px;padding:10px 4px;font-size:18px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;transition:all 0.1s;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:3px;min-height:52px;}
          .fas-preset-btn.sel{background:#0096C7;color:white;}
          .fas-preset-btn:not(.sel){background:#F0F8FF;color:#374151;}
          .fas-preset-btn:active{transform:scale(0.94);}
          .fas-preset-unit{font-size:13px;font-weight:600;opacity:0.75;}
        `}</style>

        {/* Handle */}
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 4px'}}>
          <div style={{width:36,height:4,background:'#E5E7EB',borderRadius:2}}/>
        </div>

        {/* Title */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'4px 16px 10px'}}>
          <p style={{margin:0,fontSize:18,fontWeight:800,color:'#111827',fontFamily:'Heebo,sans-serif',display:'flex',alignItems:'center',gap:8}}>
            <img src="/bottle-icon.png" alt="" style={{width:22,height:22,objectFit:'contain'}}/>
            כמה אכל?
          </p>
          {bottleTimerStart && (
            <span style={{fontSize:12,color:'#0096C7',fontFamily:'Heebo,sans-serif',fontWeight:600}}>
              בקבוק פעיל · {fmtTime(bottleTimerStart)}
            </span>
          )}
          <button onClick={onClose} style={{background:'#F3F4F6',border:'none',borderRadius:20,width:30,height:30,color:'#6B7280',fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>

        {/* Presets grid */}
        <div className="fas-presets">
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
        <div style={{display:'grid',gridTemplateColumns:'64px 1fr 64px',alignItems:'center',padding:'16px 24px 8px',gap:12}}>
          <button
            onClick={()=>adjust(-5)}
            style={{width:64,height:64,borderRadius:32,background:'#F0F8FF',border:'1.5px solid #E5E7EB',color:'#374151',fontSize:34,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:300}}
          >−</button>
          <div style={{textAlign:'center'}}>
            <input
              type="number"
              value={customInput !== '' ? customInput : selected}
              onChange={e=>handleCustomChange(e.target.value)}
              style={{background:'none',border:'none',outline:'none',textAlign:'center',fontSize:52,fontWeight:800,color:'#0096C7',fontFamily:'Heebo,sans-serif',width:'100%',direction:'ltr'}}
            />
            <div style={{fontSize:14,color:'#9CA3AF',fontFamily:'Heebo,sans-serif',marginTop:-8}}>מ"ל</div>
          </div>
          <button
            onClick={()=>adjust(5)}
            style={{width:64,height:64,borderRadius:32,background:'#F0F8FF',border:'1.5px solid #E5E7EB',color:'#374151',fontSize:34,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:300}}
          >+</button>
        </div>

        {/* Action buttons */}
        <div style={{padding:'8px 16px 16px',display:'flex',flexDirection:'column',gap:10}}>
          <button
            onClick={handleConfirm}
            style={{width:'100%',background:'linear-gradient(135deg,#48CAE4,#0096C7)',color:'white',border:'none',borderRadius:16,padding:'15px',fontSize:17,fontWeight:800,cursor:'pointer',fontFamily:'Heebo,sans-serif',minHeight:52}}
          >
            {bottleTimerStart ? `✅ סיום + רשום ${selected} מ"ל` : `רשום ${selected} מ"ל`}
          </button>
          {!bottleTimerStart && onStartBottle && (
            <button
              onClick={onStartBottle}
              style={{width:'100%',background:'#F0F8FF',color:'#0096C7',border:'1.5px solid #0096C7',borderRadius:16,padding:'13px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'Heebo,sans-serif',minHeight:48,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
            >
              <img src="/bottle-icon.png" alt="" style={{width:20,height:20,objectFit:'contain'}}/>
              <span>התחל בקבוק (מדוד זמן)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
