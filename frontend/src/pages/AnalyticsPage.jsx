import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Shell, StatCard } from "./DashboardLayout";
import { getMyAnalytics, getUrlAnalytics } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function ClicksChart({ dark, data }) {
  const max = Math.max(...data.map(d => d.clicks), 1);
  return (
    <div className="flex items-end gap-1.5 h-36 px-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="relative w-full flex items-end" style={{ height: "120px" }}>
            {/* Tooltip */}
            <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 ${dark ? "bg-slate-700 text-white" : "bg-slate-800 text-white"}`}>
              {d.clicks}
            </div>
            <div
              className="w-full rounded-t-md transition-all duration-700 ease-out"
              style={{
                height: `${(d.clicks / max) * 100}%`,
                background: `linear-gradient(to top, #3b82f6, #8b5cf6)`,
                opacity: 0.7 + (i / data.length) * 0.3,
                animationDelay: `${i * 40}ms`,
              }}
            />
          </div>
          <span className={`text-[10px] ${dark ? "text-slate-600" : "text-slate-400"}`}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ dark, segments, size = 100 }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = 38; const cx = 50; const cy = 50;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        {segments.map((seg, i) => {
          const pct    = seg.value / total;
          const dash   = pct * circumference;
          const gap    = circumference - dash;
          const offset = cumulative * circumference;
          cumulative  += pct;
          return (
            <circle
              key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={seg.color} strokeWidth="14"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${dark ? "text-white" : "text-slate-800"}`}>{total}</span>
      </div>
    </div>
  );
}

function ProgressRow({ dark, label, value, max, color = "#3b82f6", sub }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-medium ${dark ? "text-slate-300" : "text-slate-700"}`}>{label}</span>
        <span className={`text-xs font-bold ${dark ? "text-white" : "text-slate-800"}`}>{value.toLocaleString()} {sub && <span className={`font-normal ${dark ? "text-slate-500" : "text-slate-400"}`}>({pct}%)</span>}</span>
      </div>
      <div className={`w-full h-1.5 rounded-full ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

const SEGMENT_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#64748b"];

const withColors = (items = []) =>
  items.map((item, index) => ({
    ...item,
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));

const emptyAnalytics = {
  total_clicks: 0,
  unique_visitors: 0,
  average_clicks_per_day: 0,
  active_links: 0,
  last_accessed: null,
  clicks_over_time: [],
  top_links: [],
  device_breakdown: [],
  browser_breakdown: [],
  recent_activity: [],
};

function formatRelativeTime(value) {
  if (!value) {
    return "-";
  }

  let parsedValue = value;
  if (typeof value === "string") {
    const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(value);
    parsedValue = hasTimezone ? value : `${value}Z`;
  }

  const timestamp = new Date(parsedValue);
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

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function AnalyticsPage() {
  const [searchParams] = useSearchParams();
  const [dark, setDark] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [range, setRange] = useState("30d");
  const [selectedUrlId, setSelectedUrlId] = useState("all");
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [linkAnalytics, setLinkAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isLoadingLinkAnalytics, setIsLoadingLinkAnalytics] = useState(false);
  const { token, logout } = useAuth();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setAnimate(true), 80);
  }, []);

  useEffect(() => {
    const linkParam = searchParams.get("link");

    if (!linkParam) {
      return;
    }

    const parsedId = Number(linkParam);
    if (!Number.isNaN(parsedId) && parsedId > 0) {
      setSelectedUrlId(parsedId);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoadError("");
      setLoading(true);

      try {
        const payload = await getMyAnalytics({ token, range });
        setAnalytics(payload ?? emptyAnalytics);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }

        setLoadError(err.message || "Unable to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token, range, logout]);

  useEffect(() => {
    if (selectedUrlId === "all") {
      setLinkAnalytics(null);
      return;
    }

    const fetchLinkAnalytics = async () => {
      setIsLoadingLinkAnalytics(true);
      setLoadError("");

      try {
        const payload = await getUrlAnalytics(selectedUrlId, { token, range });
        setLinkAnalytics(payload);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }

        setLoadError(err.message || "Unable to load selected link analytics");
      } finally {
        setIsLoadingLinkAnalytics(false);
      }
    };

    fetchLinkAnalytics();
  }, [selectedUrlId, token, range, logout]);

  const card    = dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100";
  const heading = dark ? "text-white" : "text-slate-800";
  const sub     = dark ? "text-slate-500" : "text-slate-400";

  const activeAnalytics = selectedUrlId === "all" ? analytics : (linkAnalytics ?? emptyAnalytics);
  const topLinks = analytics.top_links || [];
  const clicksData = activeAnalytics.clicks_over_time || [];
  const deviceData = withColors(activeAnalytics.device_breakdown || []);
  const browserData = withColors(activeAnalytics.browser_breakdown || []);
  const recentActivity = activeAnalytics.recent_activity || [];

  const maxDev = Math.max(...deviceData.map((d) => d.value), 1);
  const maxBrow = Math.max(...browserData.map((d) => d.value), 1);
  const totalDevice = deviceData.reduce((sum, item) => sum + item.value, 0);
  const isLinkScope = selectedUrlId !== "all";
  const selectedLinkLabel = selectedUrlId === "all"
    ? "All links"
    : (topLinks.find((item) => item.id === selectedUrlId)?.short_url?.replace(/^https?:\/\//, "") || "Selected link");
  const allLinksTotalClicks = analytics.total_clicks || 0;
  const selectedLinkClicks = isLinkScope ? (linkAnalytics?.total_clicks || 0) : allLinksTotalClicks;
  const selectedSharePct = allLinksTotalClicks > 0 ? (selectedLinkClicks / allLinksTotalClicks) * 100 : 0;
  const selectedShareText = allLinksTotalClicks > 0
    ? `Selected link share: ${selectedSharePct.toFixed(1)}% (${selectedLinkClicks.toLocaleString()} of ${allLinksTotalClicks.toLocaleString()} clicks)`
    : "Selected link share: no clicks recorded yet";

  return (
    <Shell
      dark={dark}
      onToggleTheme={() => setDark(d => !d)}
      activePage="analytics"
      isAdmin={false}
      onSignOut={logout}
      title="Analytics"
      subtitle="Insights across all your shortened links"
    >
      <div className={`transition-all duration-700 ease-out space-y-6 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        {/* ── Stat cards ── */}
        <div className={`text-xs font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Scope: {selectedLinkLabel}
        </div>
        {isLinkScope && !loading && !isLoadingLinkAnalytics && (
          <div className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
            {selectedShareText}
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard dark={dark} label="Total Clicks" value={activeAnalytics.total_clicks.toLocaleString()} sub={isLinkScope ? `Selected link • ${range}` : `All links • ${range}`} accent="blue" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Unique Visitors" value={activeAnalytics.unique_visitors.toLocaleString()} sub={`Scope: ${selectedLinkLabel}`} accent="violet" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Avg. Clicks/Day" value={activeAnalytics.average_clicks_per_day.toLocaleString()} sub={isLinkScope ? "For selected link" : `Across ${activeAnalytics.active_links || 0} active links`} accent="green" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Last Accessed" value={formatRelativeTime(activeAnalytics.last_accessed?.timestamp || activeAnalytics.last_accessed)} sub={isLinkScope ? selectedLinkLabel : ((activeAnalytics.last_accessed?.short_url || "-").replace(/^https?:\/\//, "") || "-")} accent="amber" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          }/>
        </div>

        {loadError && (
          <div className={`text-sm rounded-xl border px-4 py-3 ${dark ? "text-red-300 border-red-500/40 bg-red-500/10" : "text-red-700 border-red-200 bg-red-50"}`}>
            {loadError}
          </div>
        )}

        {/* ── Clicks over time ── */}
        <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`font-bold text-sm ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Clicks Over Time</h2>
              <p className={`text-xs mt-0.5 ${sub}`}>Daily click volume</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedUrlId}
                onChange={(event) => setSelectedUrlId(event.target.value === "all" ? "all" : Number(event.target.value))}
                className={`text-xs rounded-lg px-2 py-1.5 border ${dark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
              >
                <option value="all">All Links</option>
                {topLinks.map((link) => (
                  <option key={link.id} value={link.id}>
                    {link.short_url.replace(/^https?:\/\//, "")}
                  </option>
                ))}
              </select>

              {/* Range selector */}
              <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                {["7d","30d","90d"].map(r => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                      range === r
                        ? dark ? "bg-slate-700 text-white" : "bg-white text-slate-800 shadow-sm"
                        : dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {(loading || isLoadingLinkAnalytics) ? (
            <div className={`text-sm py-12 text-center ${sub}`}>Loading analytics...</div>
          ) : clicksData.length === 0 ? (
            <div className={`text-sm py-12 text-center ${sub}`}>No click data for this range yet.</div>
          ) : (
            <ClicksChart dark={dark} data={clicksData} />
          )}
        </div>

        {/* ── Top links + Device row ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Top performing links */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Top Performing Links</h2>
            <div className="space-y-1">
              {topLinks.length === 0 && (
                <p className={`text-xs ${sub}`}>No links with clicks in this range.</p>
              )}
              {topLinks.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => setSelectedUrlId(l.id)}
                  className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-200 ${selectedUrlId === l.id ? dark ? "bg-slate-800" : "bg-slate-100" : dark ? "hover:bg-slate-800/60" : "hover:bg-slate-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-amber-400 text-white" : dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <span className={`text-sm font-medium ${dark ? "text-blue-400" : "text-blue-600"}`}>{l.short_url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{l.clicks.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Device breakdown */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Device Breakdown</h2>
            {deviceData.length === 0 && <p className={`text-xs ${sub}`}>No device analytics yet.</p>}
            {deviceData.map(g => (
              <ProgressRow key={g.label} dark={dark} label={g.label} value={g.value} max={maxDev} color={g.color} sub />
            ))}
          </div>
        </div>

        {/* ── Device + Browser row ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Device */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-5 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Device Share</h2>
            <div className="flex items-center gap-8">
              <DonutChart dark={dark} segments={deviceData.length > 0 ? deviceData : [{ label: "No data", value: 1, color: "#64748b" }]} size={110} />
              <div className="flex-1 space-y-3">
                {deviceData.map(d => (
                  <div key={d.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>{d.label}</span>
                    </div>
                    <span className={`text-xs font-bold ${dark ? "text-white" : "text-slate-800"}`}>
                      {totalDevice > 0 ? Math.round((d.value / totalDevice) * 100) : 0}%
                    </span>
                  </div>
                ))}
                {deviceData.length === 0 && <p className={`text-xs ${sub}`}>No device clicks available.</p>}
              </div>
            </div>
          </div>

          {/* Browser */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Browser Breakdown</h2>
            {browserData.length === 0 && <p className={`text-xs ${sub}`}>No browser analytics yet.</p>}
            {browserData.map(b => (
              <ProgressRow key={b.label} dark={dark} label={b.label} value={b.value} max={maxBrow} color={b.color} sub />
            ))}
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
          <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Recent Activity</h2>
          <div className="space-y-0">
            {recentActivity.length === 0 && <p className={`text-xs py-2 ${sub}`}>No recent clicks yet.</p>}
            {recentActivity.map((ev) => (
              <div key={`${ev.url_id}-${ev.timestamp}`} className={`flex items-center gap-4 py-3 border-b last:border-0 ${dark ? "border-slate-800" : "border-slate-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${dark ? "text-blue-400" : "text-blue-600"}`}>{ev.short_url.replace(/^https?:\/\//, "")}</p>
                  <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>Clicked link · {ev.device} · {ev.browser}</p>
                </div>
                <span className={`text-xs flex-shrink-0 ${dark ? "text-slate-600" : "text-slate-400"}`}>{formatRelativeTime(ev.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}