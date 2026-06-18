import { useEffect, useState } from "react";

import { Shell, StatCard } from "./DashboardLayout";
import { LoadingState } from "../components/ui/LoadingState";
import { getAdminDashboard, getAdminUsers, updateAdminUserStatus } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { formatISTDate, formatRelativeTime } from "../utils/dateTime";

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ClickIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function Spark({ data, color = "#3b82f6" }) {
  const max = Math.max(...data, 1);
  const w = 60;
  const h = 24;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} opacity="0.8" />
    </svg>
  );
}

function Pill({ label, variant = "blue", dark }) {
  const v = {
    blue: dark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600",
    green: dark ? "bg-green-500/15 text-green-400" : "bg-green-50 text-green-600",
    amber: dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-50 text-amber-600",
    red: dark ? "bg-red-500/15 text-red-400" : "bg-red-50 text-red-500",
    slate: dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500",
  };
  return <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${v[variant]}`}>{label}</span>;
}

function LineChart({ data, color = "#3b82f6" }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 100;
  const H = 50;
  const pts = data.map((d, i) => `${(i / Math.max(data.length - 1, 1)) * W},${H - (d.value / max) * H}`).join(" ");
  const fill = data.map((d, i) => `${(i / Math.max(data.length - 1, 1)) * W},${H - (d.value / max) * H}`).join(" ") + ` ${W},${H} 0,${H}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#fillGrad)" points={fill} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
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

const emptyUsersPayload = {
  items: [],
  page: 1,
  page_size: 8,
  total_items: 0,
  total_pages: 1,
};

const STATUS_VARIANT = { active: "green", inactive: "slate", suspended: "red", admin: "blue" };
const sortByNewest = (items = []) => [...items].sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());

export default function AdminDashboard() {
  const [animate, setAnimate] = useState(false);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [usersPayload, setUsersPayload] = useState(emptyUsersPayload);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("users");
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingUserIds, setPendingUserIds] = useState([]);
  const { token, user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();

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
      setLoadingDashboard(true);
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
        setLoadingDashboard(false);
      }
    };
    fetchDashboard();
  }, [token, logout]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setActionError("");
      try {
        const payload = await getAdminUsers({
          token,
          q: search,
          status: statusFilter,
          page,
          pageSize: 8,
        });
        setUsersPayload(payload ?? emptyUsersPayload);
      } catch (err) {
        if (err.status === 401) {
          logout();
          return;
        }
        setLoadError(err.message || "Unable to load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [token, logout, search, statusFilter, page]);

  const refreshUsers = async () => {
    const payload = await getAdminUsers({
      token,
      q: search,
      status: statusFilter,
      page,
      pageSize: 8,
    });
    setUsersPayload(payload ?? emptyUsersPayload);
  };

  const updatePending = (userId, pending) => {
    setPendingUserIds((previous) => {
      if (pending) {
        if (previous.includes(userId)) return previous;
        return [...previous, userId];
      }
      return previous.filter((id) => id !== userId);
    });
  };

  const handleToggleStatus = async (targetUser) => {
    setActionError("");
    updatePending(targetUser.id, true);
    try {
      await updateAdminUserStatus(targetUser.id, !targetUser.is_active, { token });
      await refreshUsers();
      const latest = await getAdminDashboard({ token });
      setDashboard(latest ?? emptyDashboard);
    } catch (err) {
      if (err.status === 401) {
        logout();
        return;
      }
      setActionError(err.message || "Unable to update user status");
    } finally {
      updatePending(targetUser.id, false);
    }
  };

  const card = dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100";
  const heading = dark ? "text-white" : "text-slate-800";
  const sub = dark ? "text-slate-500" : "text-slate-400";

  const users = usersPayload.items.map((entry) => ({
    ...entry,
    name: entry.email,
    links: entry.total_links,
    clicks: entry.total_clicks,
    joined: formatISTDate(entry.created_at),
    status: entry.is_admin ? "admin" : entry.is_active ? "active" : "suspended",
    spark: [0, 0, 0, 0, 0, 0, Math.max(entry.total_clicks, 1)],
  }));

  const systemEvents = sortByNewest(
    dashboard.recent_activity.map((event) => ({
      type: event.type,
      msg: event.message,
      time: formatRelativeTime(event.timestamp),
      timestamp: event.timestamp,
    }))
  );

  return (
    <Shell
      dark={dark}
      onToggleTheme={toggleTheme}
      activePage="admin"
      isAdmin={true}
      onSignOut={logout}
      title="Admin Panel"
      subtitle="Live platform overview"
    >
      <div className={`transition-all duration-700 ease-out space-y-6 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard dark={dark} label="Total Users" value={dashboard.total_users.toLocaleString()} sub="All registered accounts" accent="blue" icon={<UsersIcon />} />
          <StatCard dark={dark} label="Total Links" value={dashboard.total_links.toLocaleString()} sub="All shortened URLs" accent="violet" icon={<LinkIcon />} />
          <StatCard dark={dark} label="Total Clicks" value={dashboard.total_clicks.toLocaleString()} sub="Across the platform" accent="green" icon={<ClickIcon />} />
          <StatCard dark={dark} label="Active Links" value={dashboard.active_links.toLocaleString()} sub="Currently redirecting" accent="amber" icon={<ActivityIcon />} />
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
                <h2 className={`font-bold text-sm ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>User Growth</h2>
                <p className={`text-xs mt-0.5 ${sub}`}>New registrations per week</p>
              </div>
            </div>
            {loadingDashboard ? (
              <LoadingState dark={dark} message="Loading growth analytics..." />
            ) : (
              <>
                <LineChart data={dashboard.user_growth} color="#3b82f6" />
                <div className="flex items-center justify-between mt-2">
                  {dashboard.user_growth.map((item) => (
                    <span key={item.label} className={`text-[10px] flex-1 text-center ${sub}`}>{item.label}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={`rounded-2xl border p-5 transition-colors duration-300 ${card}`}>
            <h2 className={`font-bold text-sm mb-4 ${heading}`} style={{ fontFamily: "'Syne',sans-serif" }}>System Events</h2>
            <div className="space-y-3">
              {systemEvents.length === 0 && !loadingDashboard ? (
                <p className={`text-sm ${sub}`}>No activity yet.</p>
              ) : (
                systemEvents.map((event, index) => (
                  <div key={`${event.type}-${index}`} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl mt-0.5 flex items-center justify-center flex-shrink-0 ${dark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`}>
                      {event.type === "signup" ? <UsersIcon /> : event.type === "link_created" ? <LinkIcon /> : <ClickIcon />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs leading-snug ${dark ? "text-slate-300" : "text-slate-700"}`}>{event.msg}</p>
                      <p className={`text-[10px] mt-0.5 ${sub}`}>{event.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`rounded-2xl border transition-colors duration-300 ${card}`}>
          <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-5 border-b ${dark ? "border-slate-800" : "border-slate-100"}`}>
            <div className={`flex rounded-lg p-0.5 text-xs font-semibold ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
              {["users", "links"].map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`px-4 py-2 rounded-md capitalize transition-all duration-200 ${
                    tab === item
                      ? dark ? "bg-slate-700 text-white" : "bg-white text-slate-800 shadow-sm"
                      : dark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {item === "users" ? `Users (${usersPayload.total_items})` : `Recent Activity (${systemEvents.length})`}
                </button>
              ))}
            </div>

            {tab === "users" && (
              <div className="flex flex-wrap items-center gap-2">
                <div className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm ${dark ? "border-slate-700 bg-slate-800/40" : "border-slate-200 bg-white"}`}>
                  <SearchIcon />
                  <input
                    value={search}
                    onChange={(event) => {
                      setPage(1);
                      setSearch(event.target.value);
                    }}
                    placeholder="Search users..."
                    className={`bg-transparent outline-none w-44 text-xs ${dark ? "text-white placeholder-slate-600" : "text-slate-700 placeholder-slate-400"}`}
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setPage(1);
                    setStatusFilter(event.target.value);
                  }}
                  className={`text-xs rounded-lg px-2.5 py-2 border ${dark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>

          {tab === "users" && (
            <>
              {actionError && (
                <div className={`px-5 pt-4 text-sm ${dark ? "text-red-300" : "text-red-700"}`}>{actionError}</div>
              )}
              <div className="divide-y" style={{ borderColor: dark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,1)" }}>
                {loadingUsers ? (
                  <div className="py-4">
                    <LoadingState dark={dark} message="Loading users..." />
                  </div>
                ) : users.length === 0 ? (
                  <div className={`py-12 text-center text-sm ${sub}`}>No users found.</div>
                ) : (
                  users.map((entry) => {
                    const isSelf = user?.id === entry.id;
                    const pending = pendingUserIds.includes(entry.id);
                    const canToggle = !entry.is_admin && !isSelf;

                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center gap-4 px-5 py-4 transition-colors duration-200 ${dark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {entry.email.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{entry.email}</p>
                          <p className={`text-xs ${sub} truncate`}>{new Date(entry.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="hidden sm:flex items-center gap-6 text-center">
                          <div>
                            <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{entry.total_links}</p>
                            <p className={`text-[10px] ${sub}`}>links</p>
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-800"}`}>{entry.total_clicks.toLocaleString()}</p>
                            <p className={`text-[10px] ${sub}`}>clicks</p>
                          </div>
                        </div>

                        <Pill label={entry.statusLabel} dark={dark} variant={entry.is_admin ? "blue" : entry.is_active ? "green" : "red"} />

                        <button
                          disabled={!canToggle || pending}
                          onClick={() => handleToggleStatus(entry)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                            !canToggle || pending
                              ? dark ? "bg-slate-800 text-slate-600" : "bg-slate-100 text-slate-400"
                              : entry.is_active
                                ? dark ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                : dark ? "bg-green-500/10 text-green-300 hover:bg-green-500/20" : "bg-green-50 text-green-700 hover:bg-green-100"
                          }`}
                          title={isSelf ? "You cannot suspend your own account" : entry.is_admin ? "Cannot change another admin" : "Toggle user status"}
                        >
                          {pending ? "Saving..." : entry.is_active ? "Suspend" : "Reactivate"}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={`flex items-center justify-between px-5 py-4 border-t ${dark ? "border-slate-800" : "border-slate-100"}`}>
                <p className={`text-xs ${sub}`}>
                  Page {usersPayload.page} of {usersPayload.total_pages} · {usersPayload.total_items} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={usersPayload.page <= 1 || loadingUsers}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 ${dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"} disabled:opacity-50`}
                  >
                    <ChevronLeftIcon />
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((value) => Math.min(usersPayload.total_pages, value + 1))}
                    disabled={usersPayload.page >= usersPayload.total_pages || loadingUsers}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 ${dark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"} disabled:opacity-50`}
                  >
                    Next
                    <ChevronRightIcon />
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "links" && (
            <div className="divide-y" style={{ borderColor: dark ? "rgba(30,41,59,0.8)" : "rgba(241,245,249,1)" }}>
              {systemEvents.length === 0 ? (
                <div className={`py-12 text-center text-sm ${sub}`}>No activity found.</div>
              ) : (
                systemEvents.map((event, index) => (
                  <div
                    key={`${event.type}-${index}`}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors duration-200 ${dark ? "hover:bg-slate-800/40" : "hover:bg-slate-50/80"}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${dark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"}`}>
                      {event.type === "signup" ? <UsersIcon /> : event.type === "link_created" ? <LinkIcon /> : <ClickIcon />}
                    </div>
                    <span className={`text-sm font-semibold ${dark ? "text-blue-400" : "text-blue-600"}`}>{event.type}</span>
                    <span className={`flex-1 text-xs ${sub}`}>{event.msg}</span>
                    <span className={`text-xs ${sub}`}>{event.time}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}


