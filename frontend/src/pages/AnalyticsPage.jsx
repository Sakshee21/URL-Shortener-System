import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Shell, StatCard } from "./DashboardLayout";
import { LoadingState } from "../components/ui/LoadingState";
import { exportMyAnalyticsCsv, exportUrlAnalyticsCsv, getMyAnalytics, getUrlAnalytics } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { formatRelativeTime } from "../utils/dateTime";

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
  const r = 38; const cx = 50; const cy = 50;
  const circumference = 2 * Math.PI * r;

  const segmentArcs = segments.reduce((arcs, seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const offset = arcs.length === 0 ? 0 : arcs[arcs.length - 1].offset + arcs[arcs.length - 1].dash;

    return [...arcs, { seg, dash, gap, offset }];
  }, []);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        {segmentArcs.map(({ seg, dash, gap, offset }, i) => (
          <circle
            key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth="14"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            className="transition-all duration-700"
          />
        ))}
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
  comparison: null,
};

function ComparisonBadge({ metric, dark }) {
  if (!metric) {
    return null;
  }

  const trendClass = metric.trend === "up"
    ? dark ? "bg-green-500/15 text-green-300" : "bg-green-100 text-green-700"
    : metric.trend === "down"
      ? dark ? "bg-red-500/15 text-red-300" : "bg-red-100 text-red-700"
      : dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600";

  const sign = metric.delta > 0 ? "+" : "";
  const suffix = metric.delta_pct === null ? "" : ` (${sign}${metric.delta_pct.toFixed(1)}%)`;

  return (
    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full ${trendClass}`}>
      {`${sign}${metric.delta}${suffix}`}
    </span>
  );
}

export default function AnalyticsPage() {
  const [searchParams] = useSearchParams();
  const [animate, setAnimate] = useState(false);
  const [range, setRange] = useState("30d");
  const [selectedUrlId, setSelectedUrlId] = useState("all");
  const [includeComparison, setIncludeComparison] = useState(true);
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [linkAnalytics, setLinkAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isLoadingLinkAnalytics, setIsLoadingLinkAnalytics] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { token, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();

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
        const payload = await getMyAnalytics({ token, range, includeComparison });
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
  }, [token, range, includeComparison, logout]);

  useEffect(() => {
    if (selectedUrlId === "all") {
      setLinkAnalytics(null);
      return;
    }

    const fetchLinkAnalytics = async () => {
      setIsLoadingLinkAnalytics(true);
      setLoadError("");

      try {
        const payload = await getUrlAnalytics(selectedUrlId, { token, range, includeComparison });
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
  }, [selectedUrlId, token, range, includeComparison, logout]);

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
  const comparison = activeAnalytics.comparison;

  const handleExportCsv = async () => {
    setIsExporting(true);
    setLoadError("");

    try {
      const blob = isLinkScope
        ? await exportUrlAnalyticsCsv(selectedUrlId, { token, range, includeComparison })
        : await exportMyAnalyticsCsv({ token, range, includeComparison });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = isLinkScope
        ? `analytics-${selectedUrlId}-${range}.csv`
        : `analytics-all-${range}.csv`;
      anchor.click();
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }

      setLoadError("Unable to export analytics CSV");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Shell
      dark={dark}
      onToggleTheme={toggleTheme}
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
        {comparison && !loading && !isLoadingLinkAnalytics && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`rounded-xl border px-3 py-2 ${card}`}>
              <p className={`text-[10px] ${sub}`}>Clicks vs previous period</p>
              <div className="mt-1"><ComparisonBadge metric={comparison.total_clicks} dark={dark} /></div>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${card}`}>
              <p className={`text-[10px] ${sub}`}>Unique visitors trend</p>
              <div className="mt-1"><ComparisonBadge metric={comparison.unique_visitors} dark={dark} /></div>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${card}`}>
              <p className={`text-[10px] ${sub}`}>Avg clicks/day trend</p>
              <div className="mt-1"><ComparisonBadge metric={comparison.average_clicks_per_day} dark={dark} /></div>
            </div>
          </div>
        )}

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
              <button
                onClick={() => setIncludeComparison((previous) => !previous)}
                className={`text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${includeComparison
                  ? dark ? "bg-slate-700 border-slate-600 text-slate-100" : "bg-slate-100 border-slate-300 text-slate-700"
                  : dark ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-white border-slate-200 text-slate-500"
                }`}
                title="Toggle period comparison"
              >
                Compare: {includeComparison ? "On" : "Off"}
              </button>

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
              <button
                onClick={handleExportCsv}
                disabled={isExporting}
                className={`text-xs rounded-lg px-2.5 py-1.5 border transition-colors disabled:opacity-60 ${dark ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                title="Export analytics as CSV"
              >
                {isExporting ? "Exporting..." : "Export CSV"}
              </button>
            </div>
          </div>
          {(loading || isLoadingLinkAnalytics) ? (
            <div className="py-4">
              <LoadingState dark={dark} message="Loading analytics..." />
            </div>
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

