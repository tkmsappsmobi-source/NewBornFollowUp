function PersonIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>
}
function ChartIcon({ active }) {
  return <img src={active ? '/stats-icon.png' : '/stats-icon-inactive.png'} alt="" style={{width:24,height:24,objectFit:'contain'}}/>
}
function ClockIcon({ active }) {
  return <img src={active ? '/history-icon.png' : '/history-icon-inactive.png'} alt="" style={{width:24,height:24,objectFit:'contain'}}/>
}
function HomeBadgeIcon() {
  return <img src="/home-badge-icon.png" alt="" style={{width:42,height:42,objectFit:'contain'}}/>
}
function BellIcon({ active }) {
  return <img src={active ? '/reminders-icon.png' : '/reminders-icon-inactive.png'} alt="" style={{width:24,height:24,objectFit:'contain'}}/>
}

function NavBtn({ icon, label, onClick, active }) {
  const color = active ? '#0096C7' : '#9CA3AF'
  return (
    <button className="app-nav-btn" onClick={onClick} style={{color}}>
      {icon}
      <span style={{color}}>{label}</span>
    </button>
  )
}

// Consistent bottom navigation used on every screen so proportions/height never vary between pages.
export default function BottomNav({ tab, setTab }) {
  return (
    <>
      <style>{`
        .app-nav{flex-shrink:0;background:white;border-top:1px solid #E5E7EB;direction:ltr;}
        .app-nav-inner{display:flex;align-items:center;justify-content:space-around;height:60px;padding:0 4px;}
        .app-nav-safe{height:env(safe-area-inset-bottom,0px);}
        .app-nav-btn{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0 12px;height:60px;-webkit-tap-highlight-color:transparent;min-width:52px;}
        .app-nav-btn span{font-size:11px;font-weight:600;}
      `}</style>
      <nav className="app-nav">
        <div className="app-nav-inner">
          <NavBtn icon={<PersonIcon/>} label="פרופיל" active={tab==='profile'} onClick={()=>setTab('profile')}/>
          <NavBtn icon={<ChartIcon active={tab==='stats'}/>} label="גרפים" active={tab==='stats'} onClick={()=>setTab('stats')}/>
          <NavBtn icon={<HomeBadgeIcon/>} label="בית" active={tab==='home'} onClick={()=>setTab('home')}/>
          <NavBtn icon={<ClockIcon active={tab==='history'}/>} label="היסטוריה" active={tab==='history'} onClick={()=>setTab('history')}/>
          <NavBtn icon={<BellIcon active={tab==='reminders'}/>} label="תזכורות" active={tab==='reminders'} onClick={()=>setTab('reminders')}/>
        </div>
        <div className="app-nav-safe"/>
      </nav>
    </>
  )
}

// BottomNav now sits in normal document flow (not position:fixed), so screens
// no longer need to reserve height for it — just a little breathing room
// under the last scrollable card.
export const NAV_SPACER = '16px'
