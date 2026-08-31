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

  // Schedule filtering & search
  const [scheduleDayFilter, setScheduleDayFilter] = useState<number | "ALL">("ALL");
  const [scheduleSearch, setScheduleSearch] = useState("");

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

      if (scheduleData.success) {
        setPrograms(scheduleData.data || []);
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

  const filteredPrograms = useMemo(() => {
    return programs
      .filter((p) => {
        if (scheduleDayFilter !== "ALL" && p.dayOfWeek !== scheduleDayFilter) {
          return false;
        }
        if (scheduleSearch.trim()) {
          const q = scheduleSearch.toLowerCase();
          const titleMatch = p.title.toLowerCase().includes(q);
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
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-white shadow-md shadow-red-950">
              90
            </div>
            <div>
              <h1 className="font-bold text-base text-white leading-none">Radio 90 FM Admin</h1>
              <p className="text-xs text-neutral-400">Voice of Amal Jyothi</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 px-3 py-1.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>STREAM OK</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-lg transition"
            >
              Logout
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "overview"
                ? "bg-red-600 text-white font-semibold shadow-md shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "schedule"
                ? "bg-red-600 text-white font-semibold shadow-md shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Weekly Schedule ({programs.length})
          </button>
          <button
            onClick={() => setActiveTab("override")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "override"
                ? "bg-red-600 text-white font-semibold shadow-md shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Live Override
          </button>
          <button
            onClick={() => setActiveTab("stream")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "stream"
                ? "bg-red-600 text-white font-semibold shadow-md shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Stream Configuration
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === "contacts"
                ? "bg-red-600 text-white font-semibold shadow-md shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            Station Contacts
          </button>
        </aside>

        {/* Content Area */}
        <main className="md:col-span-3 space-y-6">
          {msg && (
            <div className="p-4 bg-neutral-900 border border-red-700 text-red-300 text-sm rounded-lg flex items-center justify-between">
              <span>{msg}</span>
              <button onClick={() => setMsg("")} className="text-xs text-neutral-400 hover:text-white">
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Dashboard Overview</h2>

              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                  <div className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                    STREAM STATUS
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="text-lg font-bold text-white">Configured & Live</span>
                  </div>
                  <p className="text-xs text-neutral-500 truncate">
                    {station?.stream?.url || "https://icecast.octosignals.com/radio90_final"}
                  </p>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-2">
                  <div className="text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                    NOW ON AIR
                  </div>
                  <div className="text-lg font-bold text-red-400">
                    {onAir?.data?.currentProgram?.title || "Radio 90 FM Live"}
                  </div>
                  <p className="text-xs text-neutral-400">
                    Presenter: {onAir?.data?.currentProgram?.presenter || "Voice of Amal Jyothi"}
                  </p>
                </div>
              </div>

              {/* Up Next */}
              {onAir?.data?.nextProgram && (
                <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-5">
                  <div className="text-xs uppercase font-semibold text-neutral-400 tracking-wider mb-2">
                    UP NEXT
                  </div>
                  <div className="font-semibold text-white">
                    {onAir.data.nextProgram.title}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Presenter: {onAir.data.nextProgram.presenter || "N/A"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Weekly Broadcast Schedule</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Manage and publish recurring weekly programs across all broadcast days.
                  </p>
                </div>

                <div className="text-xs bg-red-950/40 border border-red-900/60 text-red-300 px-3 py-1.5 rounded-lg">
                  Total Programs: <span className="font-bold text-white">{programs.length}</span>
                </div>
              </div>

              {/* Add Program Form */}
              <form
                onSubmit={handleCreateProgram}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500"></span> Add New Broadcast Program
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Program Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Ennu Swantham Live"
                      required
                      value={newProgTitle}
                      onChange={(e) => setNewProgTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Presenter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. RJ Alex"
                      value={newProgPresenter}
                      onChange={(e) => setNewProgPresenter(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Broadcast Day</label>
                    <select
                      value={newProgDay}
                      onChange={(e) => setNewProgDay(Number(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                    >
                      {daysOfWeek.map((day, idx) => (
                        <option key={idx} value={idx}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={newProgStartTime}
                      onChange={(e) => setNewProgStartTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={newProgEndTime}
                      onChange={(e) => setNewProgEndTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="flex items-center space-x-6 pt-5">
                    <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProgEnableCall}
                        onChange={(e) => setNewProgEnableCall(e.target.checked)}
                        className="rounded border-neutral-700 text-red-600 focus:ring-red-600 bg-neutral-950"
                      />
                      <span>Enable Calls</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProgEnableWhatsapp}
                        onChange={(e) => setNewProgEnableWhatsapp(e.target.checked)}
                        className="rounded border-neutral-700 text-red-600 focus:ring-red-600 bg-neutral-950"
                      />
                      <span>Enable WhatsApp</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-md transition"
                  >
                    Save & Publish Program
                  </button>
                </div>
              </form>

              {/* Day Filter Chips & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-neutral-900/60 p-4 border border-neutral-800/80 rounded-xl">
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setScheduleDayFilter("ALL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      scheduleDayFilter === "ALL"
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    All Days
                  </button>
                  {daysOfWeek.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => setScheduleDayFilter(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        scheduleDayFilter === idx
                          ? "bg-red-600 text-white shadow-sm"
                          : "bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800"
                      }`}
                    >
                      {day.substring(0, 3).toUpperCase()}
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[220px]">
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={scheduleSearch}
                    onChange={(e) => setScheduleSearch(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Schedule Program List */}
              <div className="space-y-2">
                {filteredPrograms.length === 0 ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-400 text-sm">
                    No programs found matching the selected filters.
                  </div>
                ) : (
                  filteredPrograms.map((p) => (
                    <div
                      key={p.id}
                      className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold bg-neutral-950 border border-neutral-800 text-red-400 px-2.5 py-1 rounded-md">
                            {daysOfWeek[p.dayOfWeek]} | {minutesToFormattedTime(p.startMinutes)} -{" "}
                            {minutesToFormattedTime(p.endMinutes)}
                          </span>
                          {p.title.toLowerCase().includes("live") && (
                            <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                              LIVE SHOW
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-white text-base pt-1">{p.title}</div>
                        <div className="text-xs text-neutral-400">
                          Presenter: <span className="text-neutral-300">{p.presenter || "Voice of Amal Jyothi"}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
                          {p.enableCall && <span className="text-emerald-400">📞 Calls</span>}
                          {p.enableWhatsapp && <span className="text-emerald-400">💬 WA</span>}
                        </div>

                        <button
                          onClick={() => handleDeleteProgram(p.id)}
                          className="text-xs text-red-400 hover:text-white bg-red-950/60 hover:bg-red-600 border border-red-900/60 hover:border-red-600 px-3 py-1.5 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Override Broadcast Title (e.g. Special College Day Live)"
                    required
                    value={overrideTitle}
                    onChange={(e) => setOverrideTitle(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Presenter / Anchor"
                    value={overridePresenter}
                    onChange={(e) => setOverridePresenter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
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
                    className="w-20 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-white text-center"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
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
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Primary Icecast Stream URL</label>
                  <input
                    type="url"
                    required
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Fallback Stream URL (Optional)</label>
                  <input
                    type="url"
                    value={fallbackUrl}
                    onChange={(e) => setFallbackUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Save Stream Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleTestStream}
                    disabled={testingStream}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {testingStream ? "Testing Connection..." : "Test Stream Reachability"}
                  </button>
                </div>

                {streamTestResult && (
                  <div
                    className={`p-3 text-xs rounded-lg border ${
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
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Default Call Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                    placeholder="9496345029"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Default WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                    placeholder="9048389090"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
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
