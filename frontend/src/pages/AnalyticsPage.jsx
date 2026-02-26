import { useState, useEffect, useRef } from "react";
import { Shell, StatCard } from "./DashboardLayout";

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

const DAYS = ["Mo","Tu","We","Th","Fr","Sa","Su","Mo","Tu","We","Th","Fr","Sa","Su","Mo","Tu","We","Th","Fr","Sa","Su","Mo","Tu","We","Th","Fr","Sa","Su","Mo","Tu"];
const CLICKS_DATA = DAYS.map((label, i) => ({
  label,
  clicks: Math.floor(30 + Math.sin(i * 0.6) * 20 + Math.random() * 40 + (i > 20 ? 30 : 0)),
}));

const TOP_LINKS = [
  { short: "linksprint.ly/aB3xZ", clicks: 1842, change: "+12%",  positive: true },
  { short: "linksprint.ly/cD7mQ", clicks: 934,  change: "+5%",   positive: true },
  { short: "linksprint.ly/eF2pL", clicks: 421,  change: "-3%",   positive: false },
  { short: "linksprint.ly/gH8kR", clicks: 208,  change: "-18%",  positive: false },
  { short: "linksprint.ly/iJ5nW", clicks: 87,   change: "+31%",  positive: true },
];

const GEO_DATA = [
  { label: "India",          value: 1420, color: "#3b82f6" },
  { label: "United States",  value: 980,  color: "#8b5cf6" },
  { label: "United Kingdom", value: 430,  color: "#06b6d4" },
  { label: "Germany",        value: 280,  color: "#10b981" },
  { label: "Others",         value: 382,  color: "#f59e0b" },
];

const DEVICE_DATA = [
  { label: "Mobile",  value: 1820, color: "#3b82f6" },
  { label: "Desktop", value: 1340, color: "#8b5cf6" },
  { label: "Tablet",  value: 332,  color: "#06b6d4" },
];

const BROWSER_DATA = [
  { label: "Chrome",  value: 1640, color: "#3b82f6" },
  { label: "Safari",  value: 820,  color: "#f59e0b" },
  { label: "Firefox", value: 480,  color: "#ef4444" },
  { label: "Edge",    value: 310,  color: "#10b981" },
  { label: "Others",  value: 242,  color: "#64748b" },
];

export default function AnalyticsPage() {
  const [dark, setDark] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setAnimate(true), 80);
  }, []);

  const card    = dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100";
  const heading = dark ? "text-white" : "text-slate-800";
  const sub     = dark ? "text-slate-500" : "text-slate-400";

  const maxGeo    = Math.max(...GEO_DATA.map(d => d.value));
  const maxDev    = Math.max(...DEVICE_DATA.map(d => d.value));
  const maxBrow   = Math.max(...BROWSER_DATA.map(d => d.value));

  return (
    <Shell
      dark={dark}
      onToggleTheme={() => setDark(d => !d)}
      activePage="analytics"
      isAdmin={false}
      title="Analytics"
      subtitle="Insights across all your shortened links"
    >
      <div className={`transition-all duration-700 ease-out space-y-6 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard dark={dark} label="Total Clicks" value="3,492" sub="Last 30 days" accent="blue" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Unique Visitors" value="2,108" sub="+18% vs last month" accent="violet" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Avg. Clicks/Day" value="116" sub="Across active links" accent="green" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Last Accessed" value="2 hrs ago" sub="linksprint.ly/aB3xZ" accent="amber" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          }/>
        </div>

        {/* ── Clicks over time ── */}
        <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className={`font-bold text-sm ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Clicks Over Time</h2>
              <p className={`text-xs mt-0.5 ${sub}`}>Daily click volume</p>
            </div>
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
          <ClicksChart dark={dark} data={range === "7d" ? CLICKS_DATA.slice(0, 7) : range === "30d" ? CLICKS_DATA : CLICKS_DATA} />
        </div>

        {/* ── Top links + Geo row ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Top performing links */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Top Performing Links</h2>
            <div className="space-y-1">
              {TOP_LINKS.map((l, i) => (
                <div key={l.short}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-200 ${dark ? "hover:bg-slate-800/60" : "hover:bg-slate-50"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-amber-400 text-white" : dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <span className={`text-sm font-medium ${dark ? "text-blue-400" : "text-blue-600"}`}>{l.short}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{l.clicks.toLocaleString()}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${l.positive ? dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600" : dark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-500"}`}>
                      {l.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic breakdown */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Geographic Breakdown</h2>
            {GEO_DATA.map(g => (
              <ProgressRow key={g.label} dark={dark} label={g.label} value={g.value} max={maxGeo} color={g.color} sub />
            ))}
          </div>
        </div>

        {/* ── Device + Browser row ── */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Device */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-5 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Device Breakdown</h2>
            <div className="flex items-center gap-8">
              <DonutChart dark={dark} segments={DEVICE_DATA} size={110} />
              <div className="flex-1 space-y-3">
                {DEVICE_DATA.map(d => (
                  <div key={d.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-600"}`}>{d.label}</span>
                    </div>
                    <span className={`text-xs font-bold ${dark ? "text-white" : "text-slate-800"}`}>
                      {Math.round(d.value / DEVICE_DATA.reduce((s, x) => s + x.value, 0) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Browser */}
          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Browser Breakdown</h2>
            {BROWSER_DATA.map(b => (
              <ProgressRow key={b.label} dark={dark} label={b.label} value={b.value} max={maxBrow} color={b.color} sub />
            ))}
          </div>
        </div>

        {/* ── Recent activity ── */}
        <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
          <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>Recent Activity</h2>
          <div className="space-y-0">
            {[
              { link: "linksprint.ly/aB3xZ", event: "Clicked from India", device: "Mobile · Chrome", time: "2 min ago" },
              { link: "linksprint.ly/cD7mQ", event: "Clicked from USA",   device: "Desktop · Safari", time: "11 min ago" },
              { link: "linksprint.ly/aB3xZ", event: "Clicked from UK",    device: "Mobile · Firefox", time: "18 min ago" },
              { link: "linksprint.ly/iJ5nW", event: "Clicked from Germany", device: "Desktop · Chrome", time: "34 min ago" },
              { link: "linksprint.ly/eF2pL", event: "Clicked from India", device: "Tablet · Safari", time: "1 hr ago" },
            ].map((ev, i) => (
              <div key={i} className={`flex items-center gap-4 py-3 border-b last:border-0 ${dark ? "border-slate-800" : "border-slate-50"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? "bg-blue-500/10" : "bg-blue-50"}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold ${dark ? "text-blue-400" : "text-blue-600"}`}>{ev.link}</p>
                  <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{ev.event} · {ev.device}</p>
                </div>
                <span className={`text-xs flex-shrink-0 ${dark ? "text-slate-600" : "text-slate-400"}`}>{ev.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}