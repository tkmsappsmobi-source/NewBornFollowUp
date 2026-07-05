function PersonIcon({ active }) {
  return <img src={active ? '/profile-icon.png' : '/profile-icon-inactive.png'} alt="" style={{width:33,height:33,objectFit:'contain'}}/>
}
function ChartIcon({ active }) {
  return <img src={active ? '/stats-icon.png' : '/stats-icon-inactive.png'} alt="" style={{width:33,height:33,objectFit:'contain'}}/>
}
function ClockIcon({ active }) {
  return <img src={active ? '/history-icon.png' : '/history-icon-inactive.png'} alt="" style={{width:33,height:33,objectFit:'contain'}}/>
}
function BellIcon({ active }) {
  return <img src={active ? '/reminders-icon.png' : '/reminders-icon-inactive.png'} alt="" style={{width:33,height:33,objectFit:'contain'}}/>
}

function NavBtn({ icon, label, onClick, active }) {
  const color = active ? '#0096C7' : '#9CA3AF'
  return (
    <button className="app-nav-btn" onClick={onClick} style={{color}}>
      <span className={`app-nav-icon-circle${active ? ' active' : ''}`}>{icon}</span>
      <span style={{color}}>{label}</span>
    </button>
  )
}

function HomeNavBtn({ active, onClick }) {
  return (
    <button className="app-nav-home-btn" onClick={onClick}>
      <span className="app-nav-home-circle">
        <img src="/home-badge-icon.png" alt="" style={{width:64,height:64,objectFit:'contain'}}/>
      </span>
      <span style={{color: active ? '#0096C7' : '#9CA3AF'}}>בית</span>
    </button>
  )
}

// Consistent bottom navigation used on every screen so proportions/height never vary between pages.
export default function BottomNav({ tab, setTab }) {
  return (
    <>
      <style>{`
        .app-nav{flex-shrink:0;position:relative;margin:0 14px max(env(safe-area-inset-bottom,10px),10px);height:80px;direction:ltr;overflow:visible;}
        .app-nav-bg{position:absolute;inset:0;border-radius:34px;background:transparent;border:1.5px solid rgba(90,140,180,0.55);box-shadow:0 10px 24px rgba(15,45,70,0.22);overflow:hidden;pointer-events:none;}
        .app-nav-inner{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-around;height:80px;padding:0 6px;}
        .app-nav-btn{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:0 10px;height:80px;-webkit-tap-highlight-color:transparent;min-width:50px;}
        .app-nav-btn span{font-size:10.5px;font-weight:600;}
        .app-nav-icon-circle{display:flex;align-items:center;justify-content:center;padding:6px;border-radius:50%;transition:background-color 0.15s;}
        .app-nav-icon-circle.active{background:rgba(0,150,199,0.14);}
        .app-nav-home-btn{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;-webkit-tap-highlight-color:transparent;min-width:62px;height:80px;position:relative;padding-bottom:7px;}
        .app-nav-home-btn span:first-child{position:absolute;top:-12px;left:50%;transform:translateX(-50%);width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:transform 0.12s;}
        .app-nav-home-btn:active span:first-child{transform:translateX(-50%) scale(0.92);}
        .app-nav-home-btn span:last-child{font-size:10.5px;font-weight:600;}
      `}</style>
      <nav className="app-nav">
        <div className="app-nav-bg"/>
        <div className="app-nav-inner">
          <NavBtn icon={<PersonIcon active={tab==='profile'}/>} label="פרופיל" active={tab==='profile'} onClick={()=>setTab('profile')}/>
          <NavBtn icon={<ChartIcon active={tab==='stats'}/>} label="גרפים" active={tab==='stats'} onClick={()=>setTab('stats')}/>
          <HomeNavBtn active={tab==='home'} onClick={()=>setTab('home')}/>
          <NavBtn icon={<ClockIcon active={tab==='history'}/>} label="היסטוריה" active={tab==='history'} onClick={()=>setTab('history')}/>
          <NavBtn icon={<BellIcon active={tab==='reminders'}/>} label="תזכורות" active={tab==='reminders'} onClick={()=>setTab('reminders')}/>
        </div>
      </nav>
    </>
  )
}

// BottomNav now sits in normal document flow (not position:fixed), so screens
// no longer need to reserve height for it — just a little breathing room
// under the last scrollable card.
export const NAV_SPACER = '16px'
