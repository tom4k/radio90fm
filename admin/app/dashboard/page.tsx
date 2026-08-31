"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "override" | "stream" | "contacts" | "audit"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [onAir, setOnAir] = useState<any>(null);
  const [streamTestResult, setStreamTestResult] = useState<any>(null);
  const [testingStream, setTestingStream] = useState(false);

  // Schedule filtering & view state
  const [scheduleDayFilter, setScheduleDayFilter] = useState<number | "ALL">("ALL");
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [scheduleViewMode, setScheduleViewMode] = useState<"timeline" | "table">("timeline");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [streamUrl, setStreamUrl] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [msg, setMsg] = useState("");

  // New program state
  const [newProgTitle, setNewProgTitle] = useState("");
  const [newProgPresenter, setNewProgPresenter] = useState("");
  const [newProgDay, setNewProgDay] = useState(0);
  const [newProgStartTime, setNewProgStartTime] = useState("08:00");
  const [newProgEndTime, setNewProgEndTime] = useState("09:00");
  const [newProgEnableCall, setNewProgEnableCall] = useState(true);
  const [newProgEnableWhatsapp, setNewProgEnableWhatsapp] = useState(true);

  // Override state
  const [overrideTitle, setOverrideTitle] = useState("");
  const [overridePresenter, setOverridePresenter] = useState("");
  const [overrideDurationMinutes, setOverrideDurationMinutes] = useState(60);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [stationRes, scheduleRes, onAirRes] = await Promise.all([
        fetch("/api/v1/admin/station"),
        fetch("/api/v1/admin/programs"),
        fetch("/api/v1/public/on-air"),
      ]);

      const stationData = await stationRes.json();
      const scheduleData = await scheduleRes.json();
      const onAirData = await onAirRes.json();

      if (stationData.success) {
        setStation(stationData.data);
        setStreamUrl(stationData.data.stream.url || "");
        setFallbackUrl(stationData.data.stream.fallbackUrl || "");
        setPhone(stationData.data.contacts.phone || "");
        setWhatsapp(stationData.data.contacts.whatsapp || "");
      }

      if (scheduleData.success && Array.isArray(scheduleData.data) && scheduleData.data.length > 0) {
        setPrograms(scheduleData.data);
      } else {
        // Fallback to public schedule endpoint
        try {
          const publicScheduleRes = await fetch("/api/v1/public/schedule");
          const publicScheduleData = await publicScheduleRes.json();
          if (publicScheduleData.success && Array.isArray(publicScheduleData.data)) {
            setPrograms(publicScheduleData.data);
          }
        } catch (_) {}
      }

      if (onAirData.success) {
        setOnAir(onAirData.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTestStream() {
    setTestingStream(true);
    setStreamTestResult(null);
    try {
      const res = await fetch("/api/v1/admin/stream/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamUrl }),
      });
      const data = await res.json();
      setStreamTestResult(data.data || { reachable: false });
    } catch (err) {
      setStreamTestResult({ reachable: false, error: "Connection error" });
    } finally {
      setTestingStream(false);
    }
  }

  async function handleSaveStationConfig(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch("/api/v1/admin/station", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamUrl,
          fallbackStreamUrl: fallbackUrl,
          defaultPhone: phone,
          defaultWhatsapp: whatsapp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Station configuration saved successfully!");
        fetchData();
      } else {
        setMsg(data.error?.message || "Failed to save configuration");
      }
    } catch (err) {
      setMsg("Error saving station config");
    }
  }

  function timeStringToMinutes(timeStr: string): number {
    const [h, m] = timeStr.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  function minutesToFormattedTime(mins: number): string {
    const hours = Math.floor(mins / 60) % 24;
    const minutes = mins % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${h12}:${mStr} ${period}`;
  }

  function calculateDuration(start: number, end: number): string {
    let diff = end - start;
    if (diff < 0) diff += 1440;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  }

  async function handleCreateProgram(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const startMins = timeStringToMinutes(newProgStartTime);
      const endMins = timeStringToMinutes(newProgEndTime);

      const res = await fetch("/api/v1/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProgTitle,
          presenter: newProgPresenter,
          dayOfWeek: Number(newProgDay),
          startMinutes: startMins,
          endMinutes: endMins,
          enableCall: newProgEnableCall,
          enableWhatsapp: newProgEnableWhatsapp,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.warning || "Program created successfully!");
        setNewProgTitle("");
        setNewProgPresenter("");
        setShowAddForm(false);
        fetchData();
      } else {
        setMsg(data.error?.message || "Failed to create program");
      }
    } catch (err) {
      setMsg("Error creating program");
    }
  }

  async function handleDeleteProgram(id: string) {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      const res = await fetch(`/api/v1/admin/programs/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStartOverride(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + overrideDurationMinutes * 60000);

      const res = await fetch("/api/v1/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: overrideTitle,
          presenter: overridePresenter,
          startsAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          enabled: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg("Live Override started!");
        setOverrideTitle("");
        setOverridePresenter("");
        fetchData();
      }
    } catch (err) {
      setMsg("Failed to start Live Override");
    }
  }

  async function handleLogout() {
    await fetch("/api/v1/admin/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Program counts per day
  const dayCounts = useMemo(() => {
    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    programs.forEach((p) => {
      if (counts[p.dayOfWeek] !== undefined) {
        counts[p.dayOfWeek]++;
      }
    });
    return counts;
  }, [programs]);

  const liveShowsCount = useMemo(() => {
    return programs.filter((p) => (p.title || "").toLowerCase().includes("live")).length;
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    return programs
      .filter((p) => {
        if (scheduleDayFilter !== "ALL" && p.dayOfWeek !== scheduleDayFilter) {
          return false;
        }
        if (scheduleSearch.trim()) {
          const q = scheduleSearch.toLowerCase();
          const titleMatch = (p.title || "").toLowerCase().includes(q);
          const presenterMatch = (p.presenter || "").toLowerCase().includes(q);
          return titleMatch || presenterMatch;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        return a.startMinutes - b.startMinutes;
      });
  }, [programs, scheduleDayFilter, scheduleSearch]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navbar Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/80 sticky top-0 z-20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Radio 90 FM"
              className="h-10 w-10 object-contain rounded-full border border-neutral-800 bg-neutral-900 p-0.5 shadow-md shadow-red-950/60"
            />
            <div>
              <h1 className="font-bold text-base text-white leading-none tracking-tight">
                Radio 90 FM Admin Console
              </h1>
              <p className="text-xs text-neutral-400">Voice of Amal Jyothi • 90.0 MHz</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium">STREAM ONLINE</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3.5 py-1.5 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
              activeTab === "overview"
                ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <span>Dashboard Overview</span>
            <span className="text-xs font-semibold opacity-75">✦</span>
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
              activeTab === "schedule"
                ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <span>Weekly Schedule</span>
            <span className="text-xs bg-neutral-950/60 text-white px-2 py-0.5 rounded-full border border-white/10 font-bold">
              {programs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("override")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
              activeTab === "override"
                ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <span>Live Override</span>
            {onAir?.data?.isOverride && (
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("stream")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
              activeTab === "stream"
                ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <span>Stream Settings</span>
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
              activeTab === "contacts"
                ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <span>Station Contacts</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="md:col-span-3 space-y-6">
          {msg && (
            <div className="p-4 bg-neutral-900 border border-red-700/80 text-red-200 text-sm rounded-xl flex items-center justify-between shadow-lg animate-in fade-in">
              <span>{msg}</span>
              <button onClick={() => setMsg("")} className="text-xs text-neutral-400 hover:text-white">
                ✕ Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white tracking-tight">Dashboard Overview</h2>

              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
                  <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                    STREAM STATUS
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-950"></span>
                    <span className="text-xl font-bold text-white">Configured & Live</span>
                  </div>
                  <p className="text-xs text-neutral-400 truncate font-mono">
                    {station?.stream?.url || "https://icecast.octosignals.com/radio90_final"}
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-3">
                  <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider">
                    NOW ON AIR
                  </div>
                  <div className="text-xl font-bold text-red-400">
                    {onAir?.data?.currentProgram?.title || "Radio 90 FM Live"}
                  </div>
                  <p className="text-xs text-neutral-300">
                    Presenter: <span className="font-semibold">{onAir?.data?.currentProgram?.presenter || "Voice of Amal Jyothi"}</span>
                  </p>
                </div>
              </div>

              {/* Up Next */}
              {onAir?.data?.nextProgram && (
                <div className="bg-neutral-900/70 border border-neutral-800/80 rounded-2xl p-6">
                  <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider mb-2">
                    UP NEXT
                  </div>
                  <div className="font-bold text-white text-lg">
                    {onAir.data.nextProgram.title}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Presenter: {onAir.data.nextProgram.presenter || "N/A"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCHEDULE MANAGER (PREMIUM REDESIGN) */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              {/* Header & KPI Summary Banner */}
              <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Weekly Broadcast Schedule
                    </h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Manage programs, live call actions, and broadcast timing across the 7-day schedule.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-950 transition flex items-center gap-2"
                    >
                      <span>{showAddForm ? "✕ Close Form" : "+ Add New Program"}</span>
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      TOTAL PROGRAMS
                    </div>
                    <div className="text-2xl font-extrabold text-white mt-1">
                      {programs.length}
                    </div>
                  </div>

                  <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      FLAGSHIP LIVE SHOWS
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                      {liveShowsCount}
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1 bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4">
                    <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      SELECTED DAY SHOWS
                    </div>
                    <div className="text-2xl font-extrabold text-red-400 mt-1">
                      {filteredPrograms.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Program Collapsible Form */}
              {showAddForm && (
                <form
                  onSubmit={handleCreateProgram}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5 shadow-2xl animate-in slide-in-from-top-4 duration-300"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Create New Scheduled Program
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                        Program Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ennu Swantham Live"
                        required
                        value={newProgTitle}
                        onChange={(e) => setNewProgTitle(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                        Presenter Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Voice of Amal Jyothi"
                        value={newProgPresenter}
                        onChange={(e) => setNewProgPresenter(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                        Broadcast Day
                      </label>
                      <select
                        value={newProgDay}
                        onChange={(e) => setNewProgDay(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                      >
                        {daysOfWeek.map((day, idx) => (
                          <option key={idx} value={idx}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="time"
                        required
                        value={newProgStartTime}
                        onChange={(e) => setNewProgStartTime(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                        End Time
                      </label>
                      <input
                        type="time"
                        required
                        value={newProgEndTime}
                        onChange={(e) => setNewProgEndTime(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div className="flex items-center space-x-6 pt-5">
                      <label className="flex items-center space-x-2.5 text-xs font-medium text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProgEnableCall}
                          onChange={(e) => setNewProgEnableCall(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-700 text-red-600 focus:ring-red-600 bg-neutral-950"
                        />
                        <span>Enable Calls</span>
                      </label>

                      <label className="flex items-center space-x-2.5 text-xs font-medium text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newProgEnableWhatsapp}
                          onChange={(e) => setNewProgEnableWhatsapp(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-700 text-red-600 focus:ring-red-600 bg-neutral-950"
                        />
                        <span>Enable WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end space-x-3 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition"
                    >
                      Save & Publish Program
                    </button>
                  </div>
                </form>
              )}

              {/* Day Selector & Search Toolbar */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-4 shadow-lg">
                {/* Day Filter Chips */}
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setScheduleDayFilter("ALL")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                      scheduleDayFilter === "ALL"
                        ? "bg-red-600 text-white shadow-md shadow-red-950"
                        : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    <span>All Days</span>
                    <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-md">
                      {programs.length}
                    </span>
                  </button>

                  {daysOfWeek.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setScheduleDayFilter(idx)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-2 ${
                        scheduleDayFilter === idx
                          ? "bg-red-600 text-white shadow-md shadow-red-950"
                          : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                      }`}
                    >
                      <span>{day.substring(0, 3).toUpperCase()}</span>
                      <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded-md">
                        {dayCounts[idx] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                {/* View Switcher & Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-neutral-800/80">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search program by title or presenter..."
                      value={scheduleSearch}
                      onChange={(e) => setScheduleSearch(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
                    />
                    {scheduleSearch && (
                      <button
                        onClick={() => setScheduleSearch("")}
                        className="absolute right-3 top-2 text-xs text-neutral-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setScheduleViewMode("timeline")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        scheduleViewMode === "timeline"
                          ? "bg-neutral-800 text-white border border-neutral-700"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      ☰ Timeline Cards
                    </button>
                    <button
                      onClick={() => setScheduleViewMode("table")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        scheduleViewMode === "table"
                          ? "bg-neutral-800 text-white border border-neutral-700"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      ☷ Data Table
                    </button>
                  </div>
                </div>
              </div>

              {/* Program List View */}
              {filteredPrograms.length === 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center text-neutral-400 text-sm">
                  <div className="text-3xl mb-2">📻</div>
                  No scheduled programs found matching your selected day or search criteria.
                </div>
              ) : scheduleViewMode === "timeline" ? (
                /* TIMELINE CARDS VIEW */
                <div className="space-y-3">
                  {filteredPrograms.map((p) => {
                    const isLive = (p.title || "").toLowerCase().includes("live");
                    const durationStr = calculateDuration(p.startMinutes, p.endMinutes);

                    return (
                      <div
                        key={p.id}
                        className="bg-neutral-900 border border-neutral-800/90 hover:border-neutral-700 rounded-2xl p-5 transition shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <span className="text-xs font-bold bg-neutral-950 border border-neutral-800 text-red-400 px-3 py-1 rounded-lg">
                              {daysOfWeek[p.dayOfWeek]} • {minutesToFormattedTime(p.startMinutes)} –{" "}
                              {minutesToFormattedTime(p.endMinutes)} ({durationStr})
                            </span>

                            {isLive && (
                              <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                LIVE SHOW
                              </span>
                            )}
                          </div>

                          <div className="font-extrabold text-white text-lg tracking-tight group-hover:text-red-400 transition-colors">
                            {p.title}
                          </div>

                          <div className="text-xs text-neutral-400 flex items-center space-x-4">
                            <span>
                              Presenter: <strong className="text-neutral-200">{p.presenter || "Voice of Amal Jyothi"}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 self-end sm:self-center">
                          <div className="flex items-center space-x-2 text-xs font-medium">
                            {p.enableCall && (
                              <span className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded-lg">
                                📞 Calls
                              </span>
                            )}
                            {p.enableWhatsapp && (
                              <span className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-2.5 py-1 rounded-lg">
                                💬 WhatsApp
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleDeleteProgram(p.id)}
                            className="text-xs text-red-400 hover:text-white bg-red-950/50 hover:bg-red-600 border border-red-900/60 hover:border-red-600 px-3.5 py-2 rounded-xl transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* DATA TABLE VIEW */
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 uppercase font-bold border-b border-neutral-800">
                        <tr>
                          <th className="px-4 py-3">Day</th>
                          <th className="px-4 py-3">Time Range</th>
                          <th className="px-4 py-3">Program Title</th>
                          <th className="px-4 py-3">Presenter</th>
                          <th className="px-4 py-3">Actions Enabled</th>
                          <th className="px-4 py-3 text-right">Options</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {filteredPrograms.map((p) => (
                          <tr key={p.id} className="hover:bg-neutral-800/40 transition">
                            <td className="px-4 py-3 font-semibold text-neutral-300">
                              {daysOfWeek[p.dayOfWeek]}
                            </td>
                            <td className="px-4 py-3 font-mono text-red-400 font-bold whitespace-nowrap">
                              {minutesToFormattedTime(p.startMinutes)} – {minutesToFormattedTime(p.endMinutes)}
                            </td>
                            <td className="px-4 py-3 font-bold text-white">{p.title}</td>
                            <td className="px-4 py-3 text-neutral-400">{p.presenter || "—"}</td>
                            <td className="px-4 py-3 text-emerald-400 font-medium">
                              {[p.enableCall && "Calls", p.enableWhatsapp && "WhatsApp"]
                                .filter(Boolean)
                                .join(", ") || "None"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteProgram(p.id)}
                                className="text-red-400 hover:text-red-200 bg-red-950/40 border border-red-900/60 px-2.5 py-1 rounded-md"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LIVE OVERRIDE */}
          {activeTab === "override" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Manual Live Override</h2>
              <p className="text-xs text-neutral-400">
                Instantly broadcast a special live announcement or emergency program overriding the regular schedule.
              </p>

              <form
                onSubmit={handleStartOverride}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Override Broadcast Title (e.g. Special College Day Live)"
                    required
                    value={overrideTitle}
                    onChange={(e) => setOverrideTitle(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Presenter / Anchor"
                    value={overridePresenter}
                    onChange={(e) => setOverridePresenter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex items-center space-x-3 text-xs text-neutral-300">
                  <span>Duration (Minutes):</span>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={overrideDurationMinutes}
                    onChange={(e) => setOverrideDurationMinutes(Number(e.target.value))}
                    className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-white text-center"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Activate Live Override Now
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: STREAM CONFIGURATION */}
          {activeTab === "stream" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Stream Configuration</h2>

              <form
                onSubmit={handleSaveStationConfig}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Primary Icecast Stream URL</label>
                  <input
                    type="url"
                    required
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Fallback Stream URL (Optional)</label>
                  <input
                    type="url"
                    value={fallbackUrl}
                    onChange={(e) => setFallbackUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >
                    Save Stream Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleTestStream}
                    disabled={testingStream}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    {testingStream ? "Testing Connection..." : "Test Stream Reachability"}
                  </button>
                </div>

                {streamTestResult && (
                  <div
                    className={`p-3 text-xs rounded-xl border ${
                      streamTestResult.reachable
                        ? "bg-emerald-950/60 border-emerald-800 text-emerald-200"
                        : "bg-red-950/60 border-red-800 text-red-200"
                    }`}
                  >
                    {streamTestResult.reachable
                      ? `Stream Reachable! HTTP Status: ${streamTestResult.statusCode || 200}`
                      : `Stream Error: ${streamTestResult.error || "Unable to reach endpoint"}`}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 5: STATION CONTACTS */}
          {activeTab === "contacts" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Station Contacts & Live Actions</h2>

              <form
                onSubmit={handleSaveStationConfig}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4"
              >
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Default Call Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    placeholder="9496345029"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Default WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    placeholder="9048389090"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition"
                >
                  Save Contacts
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
