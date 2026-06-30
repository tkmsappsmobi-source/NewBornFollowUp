import { useState, useRef } from 'react'
import { useStore } from '../store/useStore'


export default function ProfileScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [name, setName] = useState(state.babyName || '')
  const [birthDate, setBirthDate] = useState(state.birthDate || '')
  const [birthWeight, setBirthWeight] = useState(state.birthWeight ? String(state.birthWeight) : '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const profileInputRef = useRef(null)
  const importInputRef = useRef(null)

  const latestWeight = state.weightLogs && state.weightLogs.length > 0 ? state.weightLogs[0] : null
  const weightDiff = latestWeight && state.birthWeight
    ? (latestWeight.weight - state.birthWeight).toFixed(2)
    : null

  const handleSaveName = () => {
    dispatch({ type: 'SET_BABY_NAME', name })
    showToast('💾 שם נשמר')
  }

  const handleSaveBirthDate = () => {
    dispatch({ type: 'SET_BIRTH_DATE', birthDate })
    showToast('💾 תאריך לידה נשמר')
  }

  const handleSaveBirthWeight = () => {
    const w = parseFloat(birthWeight)
    if (!w) return
    dispatch({ type: 'SET_BIRTH_WEIGHT', weight: w })
    showToast('💾 משקל לידה נשמר')
  }

  const handleProfileImageUpload = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 200
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        dispatch({ type: 'SET_PROFILE_IMAGE', image: dataUrl })
        showToast('📸 תמונה עודכנה')
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `newborn-data-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('📤 נתונים יוצאו')
  }

  const handleImport = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        dispatch({ type: 'LOAD_STATE', payload: data })
        showToast('📥 נתונים יובאו בהצלחה')
      } catch {
        showToast('❌ שגיאה בייבוא קובץ')
      }
    }
    reader.readAsText(file)
  }

  const handleDeleteAll = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    dispatch({ type: 'CLEAR_ALL' })
    setConfirmDelete(false)
    showToast('🗑️ כל הנתונים נמחקו')
  }

  // Simple bar chart for last 5 weights
  const last5 = (state.weightLogs || []).slice(0, 5).reverse()
  const maxW = last5.length > 0 ? Math.max(...last5.map(w => w.weight)) : 1

  return (
    <>
      <style>{`
        .prof-root{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;background:#F0F8FF;font-family:Heebo,sans-serif;display:flex;flex-direction:column;}
        .prof-header{background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%);padding:16px 16px;padding-top:max(env(safe-area-inset-top,16px),16px);flex-shrink:0;display:flex;align-items:center;justify-content:center;position:relative;}
        .prof-title{font-size:18px;font-weight:800;color:#0D2640;}
        .prof-back{position:absolute;left:12px;top:50%;transform:translateY(-50%);margin-top:max(calc(env(safe-area-inset-top,0px)/2),0px);background:none;border:none;cursor:pointer;padding:10px;color:#0D2640;}
        .prof-scroll{flex:1;overflow-y:auto;padding:14px 16px;padding-bottom:calc(env(safe-area-inset-bottom,0px)+24px);display:flex;flex-direction:column;gap:14px;}
        .prof-card{background:white;border-radius:20px;padding:18px;box-shadow:0 2px 14px rgba(0,0,0,0.07);}
        .prof-card-title{font-size:16px;font-weight:800;color:#111827;margin-bottom:16px;}
        .prof-profile-circle{width:84px;height:84px;border-radius:50%;background:#E0F4FB;display:flex;align-items:center;justify-content:center;font-size:38px;cursor:pointer;border:3px solid #0096C7;overflow:hidden;margin:0 auto 14px;box-shadow:0 2px 10px rgba(0,150,199,0.2);}
        .prof-profile-circle img{width:100%;height:100%;object-fit:cover;}
        .prof-field{margin-bottom:14px;}
        .prof-label{font-size:13px;font-weight:600;color:#6B7280;margin-bottom:6px;}
        .prof-input{direction:rtl;text-align:right;width:100%;border:1.5px solid #E5E7EB;border-radius:12px;padding:12px 14px;font-size:16px;font-family:Heebo,sans-serif;outline:none;box-sizing:border-box;}
        .prof-input:focus{border-color:#0096C7;}
        .prof-save-btn{background:linear-gradient(135deg,#48CAE4,#0096C7);color:white;border:none;border-radius:14px;padding:13px 20px;font-size:15px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;min-height:48px;width:100%;margin-top:4px;}
        .prof-weight-diff{text-align:center;font-size:17px;font-weight:800;margin-bottom:12px;}
        .prof-weight-bars{display:flex;align-items:flex-end;gap:8px;height:70px;margin-top:8px;}
        .prof-weight-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;}
        .prof-weight-bar{width:100%;background:#0096C7;border-radius:6px 6px 0 0;transition:height 0.3s;}
        .prof-weight-bar-label{font-size:11px;color:#6B7280;}
        .prof-danger-btn{background:#FEE2E2;color:#DC2626;border:1.5px solid #FCA5A5;border-radius:14px;padding:14px 20px;font-size:15px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;width:100%;min-height:48px;}
        .prof-export-row{display:flex;gap:10px;}
        .prof-export-btn{flex:1;background:#F0F8FF;color:#0096C7;border:1.5px solid #0096C7;border-radius:14px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;font-family:Heebo,sans-serif;min-height:48px;}
      `}</style>
      <div className="prof-root" dir="rtl">
        <div className="prof-header">
          <span className="prof-title">פרופיל</span>
          <button className="prof-back" onClick={()=>setTab('home')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div className="prof-scroll">

          {/* Baby info */}
          <div className="prof-card">
            <div className="prof-card-title">התינוק שלי 👶</div>
            <input ref={profileInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleProfileImageUpload}/>
            <div className="prof-profile-circle" onClick={()=>profileInputRef.current&&profileInputRef.current.click()}>
              {state.profileImage ? <img src={state.profileImage} alt="פרופיל"/> : <span>👶</span>}
            </div>
            <p style={{textAlign:'center',fontSize:12,color:'#9CA3AF',marginBottom:16}}>לחץ לשינוי תמונה</p>

            <div className="prof-field">
              <div className="prof-label">שם</div>
              <input className="prof-input" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="שם התינוק"/>
            </div>
            <button className="prof-save-btn" onClick={handleSaveName}>שמור שם</button>

            <div className="prof-field" style={{marginTop:12}}>
              <div className="prof-label">תאריך לידה</div>
              <input className="prof-input" type="date" value={birthDate} onChange={e=>setBirthDate(e.target.value)}/>
            </div>
            <button className="prof-save-btn" onClick={handleSaveBirthDate}>שמור תאריך לידה</button>

            <div className="prof-field" style={{marginTop:12}}>
              <div className="prof-label">משקל לידה (ק"ג)</div>
              <input className="prof-input" type="number" step="0.01" value={birthWeight} onChange={e=>setBirthWeight(e.target.value)} placeholder='לדוגמה: 3.2'/>
            </div>
            <button className="prof-save-btn" onClick={handleSaveBirthWeight} disabled={!parseFloat(birthWeight)}>שמור משקל לידה</button>
          </div>

          {/* Growth tracking */}
          {(state.weightLogs && state.weightLogs.length > 0) && (
            <div className="prof-card">
              <div className="prof-card-title">מעקב גדילה 📏</div>
              {weightDiff !== null && (
                <div className="prof-weight-diff" style={{color: Number(weightDiff) >= 0 ? '#059669' : '#DC2626'}}>
                  {Number(weightDiff) >= 0 ? '+' : ''}{weightDiff} ק"ג ממשקל לידה
                </div>
              )}
              {latestWeight && (
                <p style={{textAlign:'center',fontSize:14,color:'#374151',marginBottom:12}}>
                  משקל נוכחי: <strong>{latestWeight.weight} ק"ג</strong>
                </p>
              )}
              {last5.length > 1 && (
                <div className="prof-weight-bars">
                  {last5.map((w, i) => (
                    <div key={w.id} className="prof-weight-bar-wrap">
                      <div className="prof-weight-bar" style={{height: `${(w.weight / maxW) * 100}%`}}/>
                      <span className="prof-weight-bar-label">{w.weight}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export/Import */}
          <div className="prof-card">
            <div className="prof-card-title">ייצוא / ייבוא 📂</div>
            <div className="prof-export-row">
              <button className="prof-export-btn" onClick={handleExport}>📤 ייצוא JSON</button>
              <button className="prof-export-btn" onClick={()=>importInputRef.current&&importInputRef.current.click()}>📥 ייבוא JSON</button>
              <input ref={importInputRef} type="file" accept=".json" style={{display:'none'}} onChange={handleImport}/>
            </div>
          </div>

          {/* Navigation shortcuts */}
          <div className="prof-card" style={{padding:'8px 4px'}}>
            {[
              { label: 'תזכורות', icon: '🔔', tab: 'reminders', desc: 'ניהול תזכורות' },
              { label: 'הגדרות', icon: '⚙️', tab: 'settings', desc: 'קטגוריות והתראות' },
              { label: 'מעקב משקל', icon: '⚖️', tab: 'weight', desc: 'היסטוריית מדידות' },
            ].map(item => (
              <button
                key={item.tab}
                onClick={() => setTab(item.tab)}
                style={{width:'100%',background:'none',border:'none',padding:'14px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:12,borderBottom:'1px solid #F3F4F6',fontFamily:'Heebo,sans-serif'}}
              >
                <span style={{fontSize:22,width:34,textAlign:'center',flexShrink:0}}>{item.icon}</span>
                <div style={{flex:1,textAlign:'right'}}>
                  <div style={{fontSize:15,fontWeight:700,color:'#111827'}}>{item.label}</div>
                  <div style={{fontSize:12,color:'#9CA3AF',marginTop:1}}>{item.desc}</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2.2" style={{flexShrink:0,transform:'rotate(180deg)'}}><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ))}
          </div>

          {/* Delete all */}
          <div className="prof-card">
            <div className="prof-card-title">מחיקת נתונים ⚠️</div>
            <button
              className="prof-danger-btn"
              onClick={handleDeleteAll}
            >
              {confirmDelete ? '⚠️ לחץ שוב לאישור מחיקה' : '🗑️ מחק הכל'}
            </button>
            {confirmDelete && (
              <button style={{width:'100%',background:'none',border:'none',color:'#9CA3AF',fontSize:13,padding:'8px',cursor:'pointer',marginTop:6,fontFamily:'Heebo,sans-serif'}} onClick={()=>setConfirmDelete(false)}>
                ביטול
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
