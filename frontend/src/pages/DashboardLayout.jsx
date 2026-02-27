import { useState, useEffect } from "react";


export const Icons = {
  link: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  sun: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  moon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  menu: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

export function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className={`relative w-12 h-6 rounded-full transition-all duration-500 focus:outline-none ${dark ? "bg-slate-700" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full shadow transition-all duration-400 flex items-center justify-center ${dark ? "translate-x-6 bg-slate-900 text-blue-400" : "translate-x-0.5 bg-white text-amber-500"}`}>
        {dark ? Icons.moon : Icons.sun}
      </span>
    </button>
  );
}


export function Sidebar({ dark, onToggleTheme, activePage, isAdmin = false, mobileOpen, onMobileClose }) {
  const userLinks = [
    { id: "dashboard", label: "Dashboard", icon: Icons.link },
    { id: "analytics", label: "Analytics",  icon: Icons.chart },
  ];
  const adminLinks = [
    { id: "admin", label: "Admin Panel", icon: Icons.shield },
  ];


  let links;

  if (isAdmin) {
    links = adminLinks;
  } else {
    links = userLinks;
  }
  const sidebarBg     = dark ? "bg-[#0a0f1e] border-slate-800" : "bg-white border-slate-100";
  const linkActive    = dark ? "bg-blue-500/15 text-blue-400 border-r-2 border-blue-500" : "bg-blue-50 text-blue-600 border-r-2 border-blue-500";
  const linkInactive  = dark ? "text-slate-400 hover:bg-slate-800/60 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-60 border-r z-50 flex flex-col transition-all duration-500 ${sidebarBg} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className={`h-16 flex items-center justify-between px-5 border-b ${dark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <span className={`font-bold text-sm tracking-tight ${dark ? "text-white" : "text-slate-800"}`} style={{ fontFamily: "'DM Sans',sans-serif" }}>
               <h1 className="text-xl font-extrabold tracking-tight">
                <span className="text-blue-600">Link</span>
                <span className="dark:text-white">Sprint</span>
            </h1>
            </span>
          </div>
          <button onClick={onMobileClose} className="lg:hidden text-slate-400 hover:text-slate-600">{Icons.close}</button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className={`text-[10px] font-bold uppercase tracking-widest px-5 mb-2 ${dark ? "text-slate-600" : "text-slate-400"}`}>Navigation</p>
          {links.map(l => (
            <a
              key={l.id} href={`/${l.id}`}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all duration-200 ${activePage === l.id ? linkActive : linkInactive}`}
            >
              {l.icon}
              {l.label}
            </a>
          ))}
        </nav>

        {/* Bottom: theme + logout */}
        <div className={`p-4 border-t space-y-2 ${dark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{dark ? "Dark mode" : "Light mode"}</span>
            <ThemeToggle dark={dark} onToggle={onToggleTheme} />
          </div>
          <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${dark ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400" : "text-slate-500 hover:bg-red-50 hover:text-red-500"}`}>
            {Icons.logout} Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ dark, title, subtitle, onMenuClick }) {
  return (
    <header className={`h-16 flex items-center justify-between px-6 border-b transition-colors duration-300 ${dark ? "bg-[#060b18] border-slate-800" : "bg-slate-50/80 border-slate-100"}`}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className={`lg:hidden ${dark ? "text-slate-400" : "text-slate-500"}`}>{Icons.menu}</button>
        <div>
          <h1 className={`text-lg font-extrabold leading-tight ${dark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "'Syne',sans-serif" }}>{title}</h1>
          {subtitle && <p className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</p>}
        </div>
      </div>
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-blue-500/20">
        U
      </div>
    </header>
  );
}

export function StatCard({ dark, label, value, sub, accent = "blue", icon }) {
  const accents = {
    blue:   { bg: dark ? "bg-blue-500/10"   : "bg-blue-50",   text: "text-blue-500",   ring: dark ? "ring-blue-500/20"   : "ring-blue-100" },
    violet: { bg: dark ? "bg-violet-500/10" : "bg-violet-50", text: "text-violet-500", ring: dark ? "ring-violet-500/20" : "ring-violet-100" },
    green:  { bg: dark ? "bg-green-500/10"  : "bg-green-50",  text: "text-green-500",  ring: dark ? "ring-green-500/20"  : "ring-green-100" },
    amber:  { bg: dark ? "bg-amber-500/10"  : "bg-amber-50",  text: "text-amber-500",  ring: dark ? "ring-amber-500/20"  : "ring-amber-100" },
  };
  const a = accents[accent];
  return (
    <div className={`rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${dark ? "bg-slate-900/60 border-slate-800 hover:shadow-black/30" : "bg-white border-slate-100 hover:shadow-slate-200/80"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ring-1 flex items-center justify-center ${a.bg} ${a.text} ${a.ring}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-extrabold mb-0.5 ${dark ? "text-white" : "text-slate-900"}`} style={{ fontFamily: "'Syne',sans-serif" }}>{value}</p>
      <p className={`text-sm font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      {sub && <p className={`text-xs mt-1 ${dark ? "text-slate-600" : "text-slate-400"}`}>{sub}</p>}
    </div>
  );
}

export function Shell({ dark, onToggleTheme, activePage, isAdmin, title, subtitle, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${dark ? "bg-[#060b18]" : "bg-slate-50"}`} style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <Sidebar dark={dark} onToggleTheme={onToggleTheme} activePage={activePage} isAdmin={isAdmin} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        <Topbar dark={dark} title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}