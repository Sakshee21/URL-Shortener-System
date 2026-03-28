import { useState, useEffect } from "react";
import { Shell, StatCard } from "./DashboardLayout";
import { getMyUrls, shortenUrl } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function MiniBar({ data, color = "#3b82f6" }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-300"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.7 + (i / data.length) * 0.3 }}
        />
      ))}
    </div>
  );
}

function StatusBadge({ active, dark }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
      active
        ? dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600"
        : dark ? "bg-slate-700 text-slate-400"    : "bg-slate-100 text-slate-500"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const mapApiLinkToUi = (item) => ({
  id: item.id,
  original: item.original_url,
  short: item.short_url.replace(/^https?:\/\//, ""),
  shortUrl: item.short_url,
  clicks: item.click_count ?? 0,
  created: new Date(item.created_at).toISOString().slice(0, 10),
  lastAccessed: item.last_accessed_at
    ? new Date(item.last_accessed_at).toLocaleString()
    : "-",
  active: true,
  trend: [0, 0, 0, 0, 0, 0, 0],
});

export default function DashboardPage() {
  const [dark, setDark] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | inactive
  const [links, setLinks] = useState([]);
  const [createError, setCreateError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const { token, logout } = useAuth();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Syne:wght@700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    setTimeout(() => setAnimate(true), 80);
  }, []);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoadError("");
      setIsLoadingLinks(true);

      try {
        const items = await getMyUrls({ token });
        setLinks(items.map(mapApiLinkToUi));
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }

        setLoadError(err.message || "Unable to load your links");
      } finally {
        setIsLoadingLinks(false);
      }
    };

    fetchLinks();
  }, [token, logout]);

  const filtered = links.filter(l => {
    const matchSearch = l.short.includes(search) || l.original.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "active" ? l.active : !l.active);
    return matchSearch && matchFilter;
  });

  const totalClicks  = links.reduce((s, l) => s + l.clicks, 0);
  const activeLinks  = links.filter(l => l.active).length;
  const topLink = links.reduce((currentTop, link) => {
    if (!currentTop || link.clicks > currentTop.clicks) {
      return link;
    }

    return currentTop;
  }, null);

  const getLinkUrl = (link) => {
    if (link.shortUrl) {
      return link.shortUrl;
    }

    if (link.short.startsWith("http://") || link.short.startsWith("https://")) {
      return link.short;
    }

    return `https://${link.short}`;
  };

  const handleCopy = (id, link) => {
    navigator.clipboard.writeText(getLinkUrl(link));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCreateShortLink = async () => {
    if (!newUrl.trim()) {
      return;
    }

    setCreateError("");
    setIsCreating(true);

    try {
      const result = await shortenUrl(newUrl, { includeAuth: true, token });
      const shortWithoutProtocol = result.short_url.replace(/^https?:\/\//, "");

      setLinks((prev) => [
        {
          id: Date.now(),
          original: result.original_url,
          short: shortWithoutProtocol,
          shortUrl: result.short_url,
          clicks: 0,
          created: new Date(result.created_at).toISOString().slice(0, 10),
          lastAccessed: "just now",
          active: true,
          trend: [0, 0, 0, 0, 0, 0, 0],
        },
        ...prev,
      ]);
      setNewUrl("");
    } catch (err) {
      if (err.status === 401) {
        logout();
      }
      setCreateError(err.message || "Unable to create short link");
    } finally {
      setIsCreating(false);
    }
  };

  const card = dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100";

  return (
    <Shell
      dark={dark}
      onToggleTheme={() => setDark(d => !d)}
      activePage="dashboard"
      isAdmin={false}
      onSignOut={logout}
      title="Dashboard"
      subtitle="Welcome back 👋  Here's your link activity"
    >
      <div className={`transition-all duration-700 ease-out space-y-6 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard dark={dark} label="Total Links" value={links.length} sub="All time" accent="blue" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Total Clicks" value={totalClicks.toLocaleString()} sub="Across all links" accent="violet" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Active Links" value={activeLinks} sub={`${links.length - activeLinks} inactive`} accent="green" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }/>
          <StatCard dark={dark} label="Top Link Clicks" value={topLink ? topLink.clicks.toLocaleString() : "0"} sub={topLink ? topLink.short : "No links yet"} accent="amber" icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          }/>
        </div>

        {/* ── Quick shorten form ── */}
        <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-bold text-sm ${dark ? "text-white" : "text-slate-800"}`} style={{ fontFamily: "'Syne',sans-serif" }}>Shorten a New URL</h2>
          </div>
          <div className={`flex gap-3 items-center rounded-xl border p-2 transition-colors duration-300 ${dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-slate-50"}`}>
            <input
              type="url"
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className={`flex-1 bg-transparent text-sm py-2 px-2 outline-none ${dark ? "text-white placeholder-slate-500" : "text-slate-800 placeholder-slate-400"}`}
            />
            <button onClick={handleCreateShortLink} disabled={isCreating} className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 disabled:opacity-70 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-500/20">
              {isCreating ? "Creating..." : "Shorten"}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
          {createError && (
            <p className={`text-xs mt-3 ${dark ? "text-red-400" : "text-red-600"}`}>{createError}</p>
          )}
        </div>

        {/* ── Links table ── */}
        <div className={`rounded-2xl border transition-colors duration-300 ${card}`}>
          {/* Table header */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b ${dark ? "border-slate-800" : "border-slate-100"}`}>
            <h2 className={`font-bold text-sm ${dark ? "text-white" : "text-slate-800"}`} style={{ fontFamily: "'Syne',sans-serif" }}>Your Links</h2>
            <div className="flex items-center gap-3">
              {/* Filter tabs */}
              <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                {["all","active","inactive"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-md capitalize transition-all duration-200 ${
                      filter === f
                        ? dark ? "bg-slate-700 text-white" : "bg-white text-slate-800 shadow-sm"
                        : dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
              {/* Search */}
              <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-white"}`}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={dark ? "text-slate-500" : "text-slate-400"}>
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search links…"
                  className={`bg-transparent outline-none w-32 text-xs ${dark ? "text-white placeholder-slate-600" : "text-slate-700 placeholder-slate-400"}`} />
              </div>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-800/30">
            {isLoadingLinks && (
              <div className={`py-12 text-center text-sm ${dark ? "text-slate-600" : "text-slate-400"}`}>Loading links...</div>
            )}
            {loadError && (
              <div className={`py-4 text-center text-sm ${dark ? "text-red-400" : "text-red-600"}`}>{loadError}</div>
            )}
            {!isLoadingLinks && !loadError && filtered.length === 0 && (
              <div className={`py-12 text-center text-sm ${dark ? "text-slate-600" : "text-slate-400"}`}>No links found.</div>
            )}
            {!isLoadingLinks && filtered.map((link, i) => (
              <div key={link.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors duration-200 ${dark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}
                style={{ animationDelay: `${i * 50}ms` }}>

                {/* Short URL + original */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <a
                      href={getLinkUrl(link)}
                      target="_blank"
                      rel="noreferrer"
                      className={`text-sm font-semibold hover:underline ${dark ? "text-blue-400" : "text-blue-600"}`}
                    >
                      {link.short}
                    </a>
                    <button onClick={() => handleCopy(link.id, link)}
                      className={`text-xs px-2 py-0.5 rounded-md transition-all duration-200 ${
                        copied === link.id
                          ? dark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                          : dark ? "bg-slate-800 text-slate-400 hover:text-white" : "bg-slate-100 text-slate-400 hover:text-slate-600"
                      }`}>
                      {copied === link.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className={`text-xs truncate max-w-[280px] ${dark ? "text-slate-600" : "text-slate-400"}`}>{link.original}</p>
                </div>

                {/* Trend sparkline */}
                <div className="hidden md:block w-20">
                  <MiniBar data={link.trend} color={link.active ? "#3b82f6" : "#64748b"} />
                </div>

                {/* Clicks */}
                <div className="hidden sm:block text-center w-16">
                  <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{link.clicks.toLocaleString()}</p>
                  <p className={`text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>clicks</p>
                </div>

                {/* Last accessed */}
                <div className="hidden lg:block text-center w-24">
                  <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{link.lastAccessed}</p>
                  <p className={`text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>last visited</p>
                </div>

                {/* Created */}
                <div className="hidden lg:block text-center w-20">
                  <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{link.created}</p>
                  <p className={`text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>created</p>
                </div>

                {/* Status */}
                <div className="w-20 flex justify-center">
                  <StatusBadge active={link.active} dark={dark} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a href={`/analytics?link=${link.id}`}
                    className={`p-2 rounded-lg transition-all duration-200 ${dark ? "text-slate-500 hover:bg-slate-800 hover:text-blue-400" : "text-slate-400 hover:bg-blue-50 hover:text-blue-600"}`}
                    title="View analytics">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  </a>
                  <button className={`p-2 rounded-lg transition-all duration-200 ${dark ? "text-slate-500 hover:bg-red-500/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"}`} title="Delete">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className={`px-5 py-3 border-t flex items-center justify-between ${dark ? "border-slate-800" : "border-slate-100"}`}>
            <p className={`text-xs ${dark ? "text-slate-600" : "text-slate-400"}`}>Showing {filtered.length} of {links.length} links</p>
            <div className="flex gap-1">
              {[1,2,3].map(p => (
                <button key={p} className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  p === 1
                    ? "bg-blue-500 text-white"
                    : dark ? "text-slate-500 hover:bg-slate-800 hover:text-white" : "text-slate-400 hover:bg-slate-100"
                }`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}