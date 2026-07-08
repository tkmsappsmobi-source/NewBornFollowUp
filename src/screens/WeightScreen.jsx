import { useState } from 'react'
import { useStore } from '../store/useStore'
import BarChart from '../components/BarChart'
import BottomNav, { NAV_SPACER } from '../components/BottomNav'
import { formatDateTime, formatDate } from '../lib/time'

export default function WeightScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')

  const handleSave = () => {
    const w = parseFloat(weight)
    if (w > 0) {
      dispatch({ type: 'ADD_WEIGHT', weight: w, note })
      showToast(`⚖️ משקל שמור: ${w} ק"ג`)
      setWeight('')
      setNote('')
    }
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_WEIGHT', id })
    showToast('משקל נמחק', 'success', 'delete-icon.png')
  }

  const sorted = [...state.weightLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  const current = sorted[0]
  const previous = sorted[1]

  let diffText = null
  let diffColor = '#6B7280'
  if (current && previous) {
    const diffNum = current.weight - previous.weight
    const diff = diffNum.toFixed(2)
    const currentDate = formatDate(new Date(current.timestamp))
    const previousDate = formatDate(new Date(previous.timestamp))
    if (Math.abs(diffNum) < 0.01) {
      diffText = `אין שינוי בין ${previousDate} ל-${currentDate}`
    } else if (diffNum > 0) {
      diffText = `בין ${previousDate} ל-${currentDate} עלה ${diff} ק"ג 📈`
      diffColor = '#059669'
    } else {
      diffText = `בין ${previousDate} ל-${currentDate} ירד ${Math.abs(diffNum).toFixed(2)} ק"ג 📉`
      diffColor = '#DC2626'
    }
  }

  const chartData = sorted.slice(0, 10).reverse().map(w => ({
    label: formatDate(new Date(w.timestamp)),
    amount: w.weight,
  }))

  return (
    <>
      <style>{`
        .wt-root{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#F0F8FF;font-family:Heebo,sans-serif;display:flex;flex-direction:column;}
        .wt-header{background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%);padding:clamp(12px,3.5vw,18px) clamp(12px,4vw,18px);flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;}
        .wt-title{font-size:clamp(15px,4.5vw,19px);font-weight:800;color:#0D2640;}
        .wt-back{position:absolute;left:12px;background:none;border:none;cursor:pointer;padding:8px;color:#0D2640;}
        .wt-scroll{flex:1;overflow-y:auto;padding:clamp(10px,3vw,16px) clamp(10px,4vw,16px);padding-bottom:${NAV_SPACER};display:flex;flex-direction:column;gap:clamp(12px,3vw,16px);}
        .wt-card{background:white;border-radius:clamp(14px,4vw,20px);padding:clamp(14px,4vw,20px);box-shadow:0 2px 14px rgba(0,0,0,0.07);}
        .wt-card-title{font-size:clamp(11px,3vw,13px);font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:clamp(10px,3vw,14px);}
        .wt-input{width:100%;border:1.5px solid #E5E7EB;border-radius:12px;padding:12px 14px;font-size:15px;font-family:Heebo,sans-serif;outline:none;box-sizing:border-box;direction:rtl;}
        .wt-input:focus{border-color:#0096C7;}
        .wt-input-row{display:flex;gap:10px;margin-bottom:10px;}
        .wt-save-btn{background:linear-gradient(135deg,#48CAE4,#0096C7);color:white;border:none;border-radius:12px;padding:12px 20px;font-size:15px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;white-space:nowrap;flex-shrink:0;}
        .wt-save-btn:disabled{opacity:0.4;cursor:default;}
        .wt-current-val{font-size:clamp(32px,10vw,44px);font-weight:900;color:#0096C7;text-align:center;margin:0;line-height:1;}
        .wt-current-lbl{font-size:clamp(10px,2.8vw,13px);color:#9CA3AF;text-align:center;margin:4px 0 0;}
        .wt-diff{font-size:clamp(12px,3.5vw,15px);font-weight:600;text-align:center;margin-top:10px;}
        .wt-log-item{display:flex;align-items:center;padding:clamp(10px,3vw,14px) 0;gap:clamp(8px,2.5vw,14px);}
        .wt-log-item+.wt-log-item{border-top:1px solid #F3F4F6;}
        .wt-log-circle{width:clamp(38px,10vw,46px);height:clamp(38px,10vw,46px);border-radius:50%;background:#C8F0E8;display:flex;align-items:center;justify-content:center;font-size:clamp(18px,5vw,22px);flex-shrink:0;}
        .wt-log-val{font-size:clamp(13px,3.5vw,15px);font-weight:700;color:#111827;margin:0;}
        .wt-log-date{font-size:clamp(10px,2.8vw,12px);color:#9CA3AF;margin:2px 0 0;}
        .wt-log-note{font-size:clamp(10px,2.5vw,12px);color:#6B7280;margin:2px 0 0;}
        .wt-del-btn{background:none;border:1.5px solid #E5E7EB;border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:15px;flex-shrink:0;}
        .wt-del-btn:active{background:#FEE2E2;}
        .wt-empty{text-align:center;color:#9CA3AF;padding:clamp(16px,5vw,24px) 0;font-size:clamp(13px,3.5vw,16px);}
        .wt-empty-icon{font-size:clamp(36px,10vw,48px);display:block;margin-bottom:8px;}
      `}</style>
      <div className="wt-root" dir="rtl">
        <div className="wt-header">
          <span className="wt-title">מעקב משקל</span>
          {setTab && (
            <button className="wt-back" onClick={() => setTab('profile')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>

        <div className="wt-scroll">

          {/* Input card */}
          <div className="wt-card">
            <p className="wt-card-title">הוסף מדידה</p>
            <div className="wt-input-row">
              <input
                className="wt-input"
                type="number"
                step="0.1"
                placeholder='משקל (ק"ג)'
                value={weight}
                onChange={e => setWeight(e.target.value)}
                style={{flex:1}}
              />
              <button className="wt-save-btn" onClick={handleSave} disabled={!parseFloat(weight)}>שמור</button>
            </div>
            <input
              className="wt-input"
              type="text"
              placeholder='הערה (אופציונלי)'
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Current weight */}
          {current && (
            <div className="wt-card" style={{textAlign:'center'}}>
              <p className="wt-card-title">המשקל הנוכחי</p>
              <p className="wt-current-val">{current.weight}</p>
              <p className="wt-current-lbl">ק"ג · {formatDateTime(new Date(current.timestamp))}</p>
              {diffText && <p className="wt-diff" style={{color: diffColor}}>{diffText}</p>}
            </div>
          )}

          {/* Chart */}
          {chartData.length > 1 && (
            <div className="wt-card">
              <p className="wt-card-title">10 מדידות אחרונות</p>
              <BarChart data={chartData} unit='ק"ג' height={200}/>
            </div>
          )}

          {/* History */}
          <div className="wt-card">
            <p className="wt-card-title">היסטוריה</p>
            {sorted.length === 0 ? (
              <div className="wt-empty">
                <span className="wt-empty-icon">⚖️</span>
                אין מדידות עדיין
              </div>
            ) : (
              sorted.map(w => (
                <div key={w.id} className="wt-log-item">
                  <div className="wt-log-circle">⚖️</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p className="wt-log-val">{w.weight} ק"ג</p>
                    <p className="wt-log-date">{formatDateTime(new Date(w.timestamp))}</p>
                    {w.note && <p className="wt-log-note">{w.note}</p>}
                  </div>
                  <button className="wt-del-btn" onClick={() => handleDelete(w.id)}><img src="delete-icon.png" alt="מחק" style={{width:20,height:20,objectFit:'contain'}}/></button>
                </div>
              ))
            )}
          </div>

        </div>

        <BottomNav tab="weight" setTab={setTab}/>
      </div>
    </>
  )
}
