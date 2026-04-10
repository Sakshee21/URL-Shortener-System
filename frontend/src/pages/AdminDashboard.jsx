import { useState, useEffect } from "react";

import { Shell, StatCard } from "./DashboardLayout";
import { getAdminDashboard } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function Spark({ data, color = "#3b82f6" }) {
  const max  = Math.max(...data, 1);
  const w    = 60; const h = 24;
  const pts  = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.8" />
    </svg>
  );
}

function Pill({ label, variant = "blue", dark }) {
  const v = {
    blue:  dark ? "bg-blue-500/15 text-blue-400"   : "bg-blue-50 text-blue-600",
    green: dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600",
    amber: dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600",
    red:   dark ? "bg-red-500/15 text-red-400"     : "bg-red-50 text-red-500",
    slate: dark ? "bg-slate-700 text-slate-400"    : "bg-slate-100 text-slate-500",
  };
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${v[variant]}`}>{label}</span>;
}

function LineChart({ dark, data, color = "#3b82f6" }) {
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 100; const H = 50;
  const pts = data.map((d, i) => `${(i / (data.length - 1)) * W},${H - (d.value / max) * H}`).join(" ");
  const fill = data.map((d, i) => `${(i / (data.length - 1)) * W},${H - (d.value / max) * H}`).join(" ") + ` ${W},${H} 0,${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon fill="url(#fillGrad)" points={fill} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function formatRelativeTime(value) {
  if (!value) {
    return "-";
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return "-";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestamp.getTime()) / 1000));

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.floor(diffHours / 24)}d ago`;
}

const emptyDashboard = {
  total_users: 0,
  total_links: 0,
  total_clicks: 0,
  active_links: 0,
  user_growth: [],
  recent_users: [],
  recent_links: [],
  recent_activity: [],
};

const statusVariant = { active: "green", inactive: "slate", suspended: "red", admin: "blue" };

export default function AdminDashboard() {
  const [dark, setDark] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("users"); // users | links
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const { token, logout } = useAuth();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setAnimate(true), 80);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoadError("");
      setLoading(true);

      try {
        const payload = await getAdminDashboard({ token });
        setDashboard(payload ?? emptyDashboard);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }

        setLoadError(err.message || "Unable to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token, logout]);

  const card   = dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100";
  const h2cls  = dark ? "text-white" : "text-slate-800";
  const subcls = dark ? "text-slate-500" : "text-slate-400";

  const USERS = dashboard.recent_users.map((user) => ({
    id: user.id,
    name: user.email,
    email: user.email,
    links: user.total_links,
    clicks: user.total_clicks,
    joined: new Date(user.created_at).toLocaleDateString(),
    status: user.is_admin ? "admin" : "active",
    spark: [0, 0, 0, 0, 0, 0, Math.max(user.total_clicks, 1)],
  }));

  const RECENT_LINKS = dashboard.recent_links.map((link) => ({
    short: link.short_url.replace(/^https?:\/\//, ""),
    user: link.owner_email || "Guest",
    clicks: link.click_count,
    created: formatRelativeTime(link.created_at),
    status: link.is_active ? "active" : "inactive",
  }));

  const SYSTEM_EVENTS = dashboard.recent_activity.map((event) => ({
    type: event.type,
    msg: event.message,
    time: formatRelativeTime(event.timestamp),
    variant: event.type === "signup" ? "green" : event.type === "link_created" ? "blue" : "amber",
  }));

  const GROWTH = dashboard.user_growth;

  const filteredUsers = USERS.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) || user.email.includes(search)
  );

  return (
    <Shell
      dark={dark}
      onToggleTheme={() => setDark(d => !d)}
      activePage="admin"
      isAdmin={true}
      onSignOut={logout}
      title="Admin Panel"
      subtitle="Live platform overview"
    >
      <div className={`transition-all duration-700 ease-out space-y-6 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard dark={dark} label="Total Users" value={dashboard.total_users.toLocaleString()} sub="All registered accounts" accent="blue" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Total Links" value={dashboard.total_links.toLocaleString()} sub="All shortened URLs" accent="violet" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Total Clicks" value={dashboard.total_clicks.toLocaleString()} sub="Across the platform" accent="green" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Active Links" value={dashboard.active_links.toLocaleString()} sub="Currently redirecting" accent="amber" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          }/>
        </div>

        {loadError && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${dark ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
            {loadError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          <div className={`lg:col-span-2 rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`font-bold text-sm ${h2cls}`} style={{ fontFamily: "'Syne',sans-serif" }}>User Growth</h2>
                <p className={`text-xs mt-0.5 ${subcls}`}>New registrations per week</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"}`}>
                ↑ +28% this month
              </span>
            </div>
            <LineChart dark={dark} data={GROWTH} color="#3b82f6" />
            <div className="flex items-center justify-between mt-2">
              {GROWTH.map((g, i) => (
                <span key={i} className={`text-[10px] flex-1 text-center ${subcls}`}>{g.label}</span>
              ))}
            </div>
          </div>

          {/* System events */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${h2cls}`} style={{ fontFamily: "'Syne',sans-serif" }}>System Events</h2>
            <div className="space-y-3">
              {SYSTEM_EVENTS.map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    ev.variant === "green" ? "bg-green-500" :
                    ev.variant === "red"   ? "bg-red-500"   :
                    ev.variant === "amber" ? "bg-amber-500" : "bg-blue-500"
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs leading-snug ${dark ? "text-slate-300" : "text-slate-700"}`}>{ev.msg}</p>
                    <p className={`text-[10px] mt-0.5 ${subcls}`}>{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Users / Links tabs ── */}
        <div className={`rounded-2xl border transition-colors duration-300 ${card}`}>
          {/* Tab header */}
          <div className={`flex items-center justify-between gap-3 p-5 border-b ${dark ? "border-slate-800" : "border-slate-100"}`}>
            <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
              {["users","links"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-md capitalize transition-all duration-200 ${
                    tab === t
                      ? dark ? "bg-slate-700 text-white" : "bg-white text-slate-800 shadow-sm"
                      : dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}>
                  {t === "users" ? `Users (${USERS.length})` : `Recent Links (${RECENT_LINKS.length})`}
                </button>
              ))}
            </div>

            {tab === "users" && (
              <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-white"}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={dark ? "text-slate-500" : "text-slate-400"}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…"
                  className={`bg-transparent outline-none w-36 text-xs ${dark ? "text-white placeholder-slate-600" : "text-slate-700 placeholder-slate-400"}`} />
              </div>
            )}
          </div>

          {/* ── Users tab ── */}
          {tab === "users" && (
            <div className="divide-y" style={{ borderColor: dark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,1)" }}>
              {filteredUsers.map((u, i) => (
                <div key={u.id}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors duration-200 ${dark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}>
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>

                  {/* Name + email */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{u.name}</p>
                    <p className={`text-xs ${subcls} truncate`}>{u.email}</p>
                  </div>

                  {/* Sparkline */}
                  <div className="hidden md:block">
                    <Spark data={u.spark} color={u.status === "active" ? "#3b82f6" : "#64748b"} />
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-center">
                    <div>
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{u.links}</p>
                      <p className={`text-[10px] ${subcls}`}>links</p>
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{u.clicks.toLocaleString()}</p>
                      <p className={`text-[10px] ${subcls}`}>clicks</p>
                    </div>
                    <div>
                      <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{u.joined}</p>
                      <p className={`text-[10px] ${subcls}`}>joined</p>
                    </div>
                  </div>

                  {/* Status */}
                  <Pill label={u.status} variant={statusVariant[u.status]} dark={dark} />

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button className={`p-2 rounded-lg text-xs transition-all duration-200 ${dark ? "text-slate-500 hover:bg-slate-800 hover:text-blue-400" : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"}`} title="View user analytics">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                    </button>
                    {u.status !== "suspended" ? (
                      <button className={`p-2 rounded-lg transition-all duration-200 ${dark ? "text-slate-500 hover:bg-amber-500/10 hover:text-amber-400" : "text-slate-400 hover:bg-amber-50 hover:text-amber-500"}`} title="Suspend user">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                      </button>
                    ) : (
                      <button className={`p-2 rounded-lg transition-all duration-200 ${dark ? "text-slate-500 hover:bg-green-500/10 hover:text-green-400" : "text-slate-400 hover:bg-green-50 hover:text-green-600"}`} title="Reinstate user">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    )}
                    <button className={`p-2 rounded-lg transition-all duration-200 ${dark ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"}`} title="Delete user">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Links tab ── */}
          {tab === "links" && (
            <div className="divide-y" style={{ borderColor: dark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,1)" }}>
              {RECENT_LINKS.map((l, i) => (
                <div key={i}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors duration-200 ${dark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}>
                  <span className={`text-sm font-semibold ${dark ? "text-blue-400" : "text-blue-600"}`}>{l.short}</span>
                  <span className={`flex-1 text-xs ${subcls}`}>by {l.user}</span>
                  <span className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{l.clicks.toLocaleString()} clicks</span>
                  <span className={`text-xs ${subcls}`}>{l.created}</span>
                  <Pill label={l.status} variant={statusVariant[l.status]} dark={dark} />
                  <button className={`p-2 rounded-lg transition-all duration-200 ${dark ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}