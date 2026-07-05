import { useState } from 'react'
import { useStore } from '../store/useStore'
import CategoryManager from '../components/CategoryManager'
import BottomNav, { NAV_SPACER } from '../components/BottomNav'
import { requestPermission, isGranted } from '../lib/notifications'

export default function SettingsScreen({ showToast, setTab }) {
  const { state, dispatch } = useStore()
  const [nameInput, setNameInput] = useState(state.babyName)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleNameSave = () => {
    dispatch({ type: 'SET_BABY_NAME', name: nameInput.trim() })
    showToast('שם נשמר ✓')
  }

  const handleNotifications = async () => {
    if (isGranted()) {
      showToast('הרשאת התראות כבר אושרה ✓')
      return
    }
    const granted = await requestPermission()
    if (granted) {
      dispatch({ type: 'SET_NOTIFICATIONS_ENABLED', enabled: true })
      showToast('התראות הופעלו ✓')
    } else {
      showToast('ההרשאה נדחתה בדפדפן')
    }
  }

  const handleClearAll = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    dispatch({ type: 'CLEAR_ALL' })
    setConfirmClear(false)
    showToast('כל הנתונים נמחקו')
  }

  return (
    <>
      <style>{`
        .sett-root { height:100%; overflow-y:auto; -webkit-overflow-scrolling:touch; background:#F0F8FF; font-family:Heebo,sans-serif; display:flex; flex-direction:column; }
        .sett-header { background:linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%); padding:clamp(12px,3.5vw,18px) clamp(12px,4vw,18px); padding-top:max(env(safe-area-inset-top,16px),16px); flex-shrink:0; display:flex; align-items:center; justify-content:center; position:relative; }
        .sett-header-title { font-size:clamp(15px,4.5vw,19px); font-weight:800; color:#0D2640; }
        .sett-back { position:absolute; left:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:10px; color:#0D2640; }
        .sett-scroll { flex:1; overflow-y:auto; padding: clamp(10px,3vw,16px) clamp(10px,4vw,16px); padding-bottom: ${NAV_SPACER}; display:flex; flex-direction:column; gap: clamp(12px,3vw,18px); }
        .sett-card { background:white; border-radius: clamp(14px,4vw,20px); padding: clamp(14px,4vw,20px); box-shadow:0 2px 14px rgba(0,0,0,0.07); }
        .sett-title { font-size: clamp(11px,3vw,13px); font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:0.06em; margin-bottom: clamp(10px,3vw,14px); }
        .sett-input { width:100%; border:1.5px solid #D1D5DB; border-radius: clamp(10px,3vw,14px); padding: clamp(10px,3vw,14px) clamp(12px,3.5vw,16px); font-size: clamp(13px,3.5vw,16px); font-family:Heebo,sans-serif; direction:rtl; outline:none; box-sizing:border-box; transition:border-color 0.15s; }
        .sett-input:focus { border-color:#0096C7; }
        .sett-row { display:flex; gap: clamp(8px,2.5vw,12px); }
        .sett-btn-primary { background: linear-gradient(135deg,#48CAE4,#0096C7); color:white; border:none; border-radius: clamp(10px,3vw,14px); padding: clamp(10px,3vw,14px) clamp(16px,4.5vw,22px); font-size: clamp(13px,3.5vw,15px); font-weight:700; font-family:Heebo,sans-serif; cursor:pointer; white-space:nowrap; transition:transform 0.12s; }
        .sett-btn-primary:active { transform:scale(0.95); }
        .sett-btn-outline-blue { width:100%; border:1.5px solid #0096C7; color:#0096C7; background:#E0F4FB; border-radius: clamp(10px,3vw,14px); padding: clamp(12px,3.5vw,15px); font-size: clamp(13px,3.5vw,15px); font-weight:600; font-family:Heebo,sans-serif; cursor:pointer; transition:transform 0.12s; }
        .sett-btn-outline-blue:active { transform:scale(0.97); }
        .sett-btn-outline-red { width:100%; border:1.5px solid #FCA5A5; color:#EF4444; background:#FEF2F2; border-radius: clamp(10px,3vw,14px); padding: clamp(12px,3.5vw,15px); font-size: clamp(13px,3.5vw,15px); font-weight:600; font-family:Heebo,sans-serif; cursor:pointer; transition:transform 0.12s; }
        .sett-btn-outline-red:active { transform:scale(0.97); }
        .sett-btn-solid-red { width:100%; background:#EF4444; color:white; border:none; border-radius: clamp(10px,3vw,14px); padding: clamp(12px,3.5vw,15px); font-size: clamp(13px,3.5vw,15px); font-weight:700; font-family:Heebo,sans-serif; cursor:pointer; transition:transform 0.12s; }
        .sett-btn-solid-red:active { transform:scale(0.97); }
        .sett-btn-cancel { width:100%; background:none; border:none; color:#9CA3AF; font-size: clamp(12px,3vw,14px); font-family:Heebo,sans-serif; cursor:pointer; padding: clamp(8px,2vw,10px); }
        .sett-hint { font-size: clamp(10px,2.5vw,12px); color:#9CA3AF; text-align:center; margin-top:8px; }
      `}</style>
      <div className="sett-root" dir="rtl">
        <div className="sett-header">
          <span className="sett-header-title">הגדרות</span>
          {setTab && (
            <button className="sett-back" onClick={() => setTab('profile')} title="חזרה">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
        </div>
        <div className="sett-scroll">

        {/* שם התינוק */}
        <div className="sett-card">
          <p className="sett-title">שם התינוק</p>
          <div className="sett-row">
            <input
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="שם התינוק"
              className="sett-input"
              style={{ flex: 1 }}
            />
            <button onClick={handleNameSave} className="sett-btn-primary">שמור</button>
          </div>
        </div>

        {/* ניהול קטגוריות */}
        <div className="sett-card">
          <p className="sett-title">ניהול קטגוריות</p>
          <CategoryManager
            categories={state.categories}
            onToggle={(id) => dispatch({ type: 'TOGGLE_CATEGORY', id })}
            onAdd={(label, emoji) => dispatch({ type: 'ADD_CATEGORY', label, emoji })}
            onDelete={(id) => dispatch({ type: 'DELETE_CATEGORY', id })}
          />
        </div>

        {/* התראות */}
        <div className="sett-card">
          <p className="sett-title">התראות</p>
          <button onClick={handleNotifications} className="sett-btn-outline-blue">
            {isGranted() ? '✅ התראות מופעלות' : '🔔 הפעל התראות דפדפן'}
          </button>
          <p className="sett-hint">התראות יורות רק כשהאפליקציה פתוחה בדפדפן</p>
        </div>

        {/* נתונים */}
        <div className="sett-card">
          <p className="sett-title">נתונים</p>
          {confirmClear ? (
            <>
              <button onClick={handleClearAll} className="sett-btn-solid-red">⚠️ לחץ שוב לאישור מחיקה</button>
              <button onClick={() => setConfirmClear(false)} className="sett-btn-cancel">ביטול</button>
            </>
          ) : (
            <button onClick={handleClearAll} className="sett-btn-outline-red" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><img src="/delete-icon.png" alt="" style={{width:18,height:18,objectFit:'contain'}}/> מחק את כל הנתונים</button>
          )}
        </div>

        </div>

        <BottomNav tab="settings" setTab={setTab} onPlus={()=>setTab('home')}/>
      </div>
    </>
  )
}
