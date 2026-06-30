import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useStore } from './store/useStore'
import { useToast, ToastContainer } from './components/Toast'
import HomeScreen from './screens/HomeScreen'
import HistoryScreen from './screens/HistoryScreen'
import StatsScreen from './screens/StatsScreen'
import ProfileScreen from './screens/ProfileScreen'

const THEMES = {
  blue:   { accent: '#0096C7', light: '#E0F4FB', grad: 'linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%)' },
  purple: { accent: '#7B3FDB', light: '#EDE5FF', grad: 'linear-gradient(180deg,#9C89E6 0%,#C4B0F7 100%)' },
  teal:   { accent: '#00ACC1', light: '#E0F7FA', grad: 'linear-gradient(180deg,#4DD0E1 0%,#80DEEA 100%)' },
}

export default function App() {
  const [tab, setTab] = useState('home')
  const { state } = useStore()
  const { toasts, showToast, dismiss } = useToast()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  const theme = THEMES[state.colorTheme] || THEMES.blue

  return (
    <div
      className="flex flex-col h-dvh"
      style={{
        background: '#F0F8FF',
        fontFamily: 'Heebo, sans-serif',
        '--accent': theme.accent,
        '--accent-light': theme.light,
        '--accent-grad': theme.grad,
      }}
      dir="rtl"
    >
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {needRefresh && (
        <div style={{position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',zIndex:999,background:'#0096C7',color:'white',borderRadius:16,padding:'12px 20px',display:'flex',alignItems:'center',gap:12,boxShadow:'0 4px 20px rgba(0,0,0,0.2)',fontFamily:'Heebo,sans-serif',whiteSpace:'nowrap'}}>
          <span style={{fontSize:14,fontWeight:600}}>גרסה חדשה זמינה!</span>
          <button onClick={() => updateServiceWorker(true)} style={{background:'white',color:'#0096C7',border:'none',borderRadius:10,padding:'6px 14px',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:'Heebo,sans-serif'}}>עדכן עכשיו</button>
        </div>
      )}

      <main className="flex-1 overflow-hidden flex flex-col">
        {tab === 'home' && <HomeScreen showToast={showToast} setTab={setTab} />}
        {tab === 'history' && <HistoryScreen showToast={showToast} setTab={setTab} />}
        {tab === 'stats' && <StatsScreen setTab={setTab} />}
        {tab === 'profile' && <ProfileScreen showToast={showToast} setTab={setTab} />}
      </main>
    </div>
  )
}
