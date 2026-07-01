import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useStore } from './store/useStore'
import { useToast, ToastContainer } from './components/Toast'
import HomeScreen from './screens/HomeScreen'
import HistoryScreen from './screens/HistoryScreen'
import StatsScreen from './screens/StatsScreen'
import ProfileScreen from './screens/ProfileScreen'
import SettingsScreen from './screens/SettingsScreen'
import RemindersScreen from './screens/RemindersScreen'
import WeightScreen from './screens/WeightScreen'

const THEMES = {
  blue:   { accent: '#0096C7', light: '#E0F4FB', grad: 'linear-gradient(180deg,#6EC6E6 0%,#9DDAF4 100%)' },
  purple: { accent: '#7B3FDB', light: '#EDE5FF', grad: 'linear-gradient(180deg,#9C89E6 0%,#C4B0F7 100%)' },
  teal:   { accent: '#00ACC1', light: '#E0F7FA', grad: 'linear-gradient(180deg,#4DD0E1 0%,#80DEEA 100%)' },
}

function NewbornLogo({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="118" cy="112" r="88" stroke="#B8DFF0" strokeWidth="3.5" fill="none"/>

      {/* Holding hand / arc at bottom */}
      <path d="M48 168 Q60 192 100 196 Q128 198 160 185 Q178 178 185 165"
        stroke="#90C4E8" strokeWidth="10" strokeLinecap="round" fill="none"/>

      {/* Baby swaddle body */}
      <ellipse cx="110" cy="138" rx="44" ry="52" fill="#80CBC4" transform="rotate(-8 110 138)"/>
      <ellipse cx="112" cy="142" rx="34" ry="40" fill="#A5D6D0" transform="rotate(-8 112 142)"/>
      {/* Swaddle fold line */}
      <path d="M88 115 Q112 108 134 118" stroke="#6ABFB8" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Baby neck */}
      <rect x="103" y="88" width="16" height="14" rx="6" fill="#FFCCB3"/>

      {/* Baby head */}
      <circle cx="111" cy="74" r="28" fill="#FFCCB3"/>
      {/* Cheeks */}
      <ellipse cx="96" cy="80" rx="8" ry="6" fill="#F9A8A0" opacity="0.55"/>
      <ellipse cx="126" cy="80" rx="8" ry="6" fill="#F9A8A0" opacity="0.55"/>
      {/* Closed eyes */}
      <path d="M101 71 Q106 68 111 71" stroke="#7B5E52" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M113 71 Q118 68 123 71" stroke="#7B5E52" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Eyelashes */}
      <line x1="101" y1="71" x2="99" y2="69" stroke="#7B5E52" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="123" y1="71" x2="125" y2="69" stroke="#7B5E52" strokeWidth="1.2" strokeLinecap="round"/>
      {/* Smile */}
      <path d="M104 82 Q111 88 118 82" stroke="#D4846E" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Hair curl */}
      <path d="M111 46 Q122 38 118 52" stroke="#A1745E" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="118" cy="52" r="2" fill="#A1745E"/>

      {/* Heart outline (upper right) */}
      <path d="M152 68 C152 63 157 59 162 63 C167 59 172 63 172 68 C172 76 162 84 162 84 C162 84 152 76 152 68Z"
        fill="none" stroke="#F48BB0" strokeWidth="2.2"/>

      {/* ECG / heartbeat line */}
      <path d="M148 92 L156 92 L160 80 L165 106 L170 86 L174 92 L184 92"
        stroke="#F48BB0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* Dot connector line from ECG to checkmark */}
      <path d="M188 92 Q200 105 196 130" stroke="#A5D6D0" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
      <circle cx="191" cy="100" r="4.5" fill="#80CBC4"/>
      <circle cx="196" cy="116" r="3.5" fill="#80CBC4"/>

      {/* Checkmark circle */}
      <circle cx="193" cy="135" r="13" fill="#4DB6AC"/>
      <path d="M186 135 L191 141 L201 128" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function SplashScreen() {
  return (
    <div dir="rtl" style={{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      height:'100dvh', background:'linear-gradient(180deg,#E8F6FC 0%,#F0F8FF 50%,#E0F4FB 100%)',
      fontFamily:'Heebo,sans-serif', gap:0, overflow:'hidden', position:'relative',
    }}>
      <style>{`
        @keyframes splashFadeIn { from{opacity:0;transform:scale(0.88) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes splashTextIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heartbeat { 0%,100%{transform:scale(1)} 30%{transform:scale(1.08)} 60%{transform:scale(0.97)} }
        @keyframes pulseRing { 0%{transform:scale(0.92);opacity:0.5} 100%{transform:scale(1.12);opacity:0} }
        @keyframes dotBounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
        .splash-logo { animation: splashFadeIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both, heartbeat 2.2s ease-in-out 0.8s infinite; }
        .splash-ring { position:absolute; border-radius:50%; border:2.5px solid #80CBC4; animation: pulseRing 2s ease-out 0.5s infinite; }
        .splash-title { animation: splashTextIn 0.6s ease 0.4s both; }
        .splash-sub { animation: splashTextIn 0.6s ease 0.6s both; }
        .splash-dots span { display:inline-block; width:9px; height:9px; border-radius:50%; background:#4DB6AC; margin:0 4px; animation: dotBounce 1.4s ease-in-out infinite; }
        .splash-dots span:nth-child(2) { background:#80CBC4; animation-delay:0.2s; }
        .splash-dots span:nth-child(3) { background:#B8DFF0; animation-delay:0.4s; }
      `}</style>

      {/* Decorative background stars */}
      {[[12,8],[88,5],[5,55],[92,40],[20,80],[78,72],[50,6],[8,35]].map(([l,t],i)=>(
        <span key={i} style={{position:'absolute',left:`${l}%`,top:`${t}%`,fontSize:Math.random()*6+7,color:'#80CBC4',opacity:0.35,lineHeight:1,pointerEvents:'none'}}>★</span>
      ))}

      {/* Pulse ring behind logo */}
      <div style={{position:'relative', marginBottom:24}}>
        <div className="splash-ring" style={{width:220,height:220,top:'50%',left:'50%',transform:'translate(-50%,-50%)',position:'absolute'}}/>
        <div className="splash-ring" style={{width:220,height:220,top:'50%',left:'50%',transform:'translate(-50%,-50%)',position:'absolute',animationDelay:'0.7s'}}/>
        <div className="splash-logo">
          <NewbornLogo size={200}/>
        </div>
      </div>

      {/* App name */}
      <div className="splash-title" style={{textAlign:'center',marginBottom:6}}>
        <span style={{fontSize:28,fontWeight:900,color:'#0D2640',letterSpacing:-0.5}}>מעקב </span>
        <span style={{fontSize:28,fontWeight:900,color:'#4DB6AC',letterSpacing:-0.5}}>ניו בורן</span>
      </div>

      {/* Tagline */}
      <div className="splash-sub" style={{fontSize:13,color:'#7BA8C4',fontWeight:500,marginBottom:40,letterSpacing:0.2}}>
        עוקבים יחד אחרי הרגעים הראשונים
      </div>

      {/* Loading dots */}
      <div className="splash-dots">
        <span/><span/><span/>
      </div>

      {/* Bottom divider + heart */}
      <div style={{position:'absolute',bottom:40,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
        <div style={{width:48,height:1.5,background:'linear-gradient(90deg,transparent,#B8DFF0,transparent)'}}/>
        <span style={{fontSize:14,color:'#F48BB0'}}>♥</span>
      </div>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')
  const { state } = useStore()
  const { toasts, showToast, dismiss } = useToast()
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 1800)
    return () => clearTimeout(t)
  }, [])

  const theme = THEMES[state.colorTheme] || THEMES.blue

  if (state.loading || !splashDone) {
    return <SplashScreen />
  }

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
        {tab === 'settings' && <SettingsScreen showToast={showToast} setTab={setTab} />}
        {tab === 'reminders' && <RemindersScreen showToast={showToast} setTab={setTab} />}
        {tab === 'weight' && <WeightScreen showToast={showToast} setTab={setTab} />}
      </main>
    </div>
  )
}
