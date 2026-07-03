function PersonIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/></svg>
}
function ChartIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>
}
function ClockIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" strokeLinecap="round"/></svg>
}
function HomeIconSvg() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinejoin="round"/></svg>
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
export default function BottomNav({ tab, setTab, onPlus }) {
  return (
    <>
      <style>{`
        .app-nav{position:fixed;bottom:0;left:0;right:0;max-width:480px;margin:0 auto;background:white;border-top:1px solid #E5E7EB;z-index:50;direction:ltr;}
        .app-nav-inner{display:flex;align-items:center;justify-content:space-around;height:60px;padding:0 4px;}
        .app-nav-safe{height:env(safe-area-inset-bottom,0px);}
        .app-nav-btn{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:0 12px;height:60px;-webkit-tap-highlight-color:transparent;min-width:52px;}
        .app-nav-btn span{font-size:11px;font-weight:600;}
        .app-nav-plus{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#48CAE4 0%,#0096C7 100%);border:none;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(0,150,199,0.45);transition:transform 0.12s;-webkit-tap-highlight-color:transparent;}
        .app-nav-plus:active{transform:scale(0.91);}
        .app-nav-plus svg{width:28px;height:28px;}
      `}</style>
      <nav className="app-nav">
        <div className="app-nav-inner">
          <NavBtn icon={<PersonIcon/>} label="פרופיל" active={tab==='profile'} onClick={()=>setTab('profile')}/>
          <NavBtn icon={<ChartIcon/>} label="גרפים" active={tab==='stats'} onClick={()=>setTab('stats')}/>
          <button className="app-nav-plus" onClick={onPlus}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"><path d="M12 4v16M4 12h16"/></svg>
          </button>
          <NavBtn icon={<ClockIcon/>} label="היסטוריה" active={tab==='history'} onClick={()=>setTab('history')}/>
          <NavBtn icon={<HomeIconSvg/>} label="בית" active={tab==='home'} onClick={()=>setTab('home')}/>
        </div>
        <div className="app-nav-safe"/>
      </nav>
    </>
  )
}

// Standard bottom padding every scrollable screen should reserve so content never sits under the fixed nav.
export const NAV_SPACER = 'calc(68px + env(safe-area-inset-bottom, 20px))'
