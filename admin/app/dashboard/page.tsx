"use client";

import { useState, useEffect } from "react";
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
  const [newProgStartHour, setNewProgStartHour] = useState(8);
  const [newProgEndHour, setNewProgEndHour] = useState(9);

  // Live Override state
  const [overrideTitle, setOverrideTitle] = useState("");
  const [overridePresenter, setOverridePresenter] = useState("");
  const [overrideDurationMinutes, setOverrideDurationMinutes] = useState(60);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [stationRes, scheduleRes, onAirRes] = await Promise.all([
        fetch("/api/v1/public/config"),
        fetch("/api/v1/public/schedule"),
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

  async function handleCreateProgram(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await fetch("/api/v1/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProgTitle,
          presenter: newProgPresenter,
          dayOfWeek: Number(newProgDay),
          startMinutes: newProgStartHour * 60,
          endMinutes: newProgEndHour * 60,
          enableCall: true,
          enableWhatsapp: true,
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

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-red-900/50">
              90
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">Radio 90 FM Admin</h1>
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
            Weekly Schedule
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
            <div className="p-4 bg-neutral-900 border border-red-700 text-red-300 text-sm rounded-lg">
              {msg}
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
              <h2 className="text-xl font-bold text-white">Weekly Program Schedule</h2>

              {/* Add Program Form */}
              <form
                onSubmit={handleCreateProgram}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <h3 className="text-sm font-semibold text-neutral-300">Add New Program</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Program Title"
                    required
                    value={newProgTitle}
                    onChange={(e) => setNewProgTitle(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  <input
                    type="text"
                    placeholder="Presenter Name"
                    value={newProgPresenter}
                    onChange={(e) => setNewProgPresenter(e.target.value)}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                  <select
                    value={newProgDay}
                    onChange={(e) => setNewProgDay(Number(e.target.value))}
                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {daysOfWeek.map((day, idx) => (
                      <option key={idx} value={idx}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <div className="flex space-x-2 items-center text-xs text-neutral-400">
                    <span>Start Hour:</span>
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={newProgStartHour}
                      onChange={(e) => setNewProgStartHour(Number(e.target.value))}
                      className="w-16 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-white text-center"
                    />
                    <span>End Hour:</span>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={newProgEndHour}
                      onChange={(e) => setNewProgEndHour(Number(e.target.value))}
                      className="w-16 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-white text-center"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Save Program
                </button>
              </form>

              {/* Schedule List */}
              <div className="space-y-3">
                {programs.length === 0 ? (
                  <div className="text-neutral-500 text-sm italic">No programs scheduled yet.</div>
                ) : (
                  programs.map((p) => (
                    <div
                      key={p.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white">{p.title}</div>
                        <div className="text-xs text-neutral-400">
                          {daysOfWeek[p.dayOfWeek]} | {Math.floor(p.startMinutes / 60)}:00 -{" "}
                          {Math.floor(p.endMinutes / 60)}:00 | Presenter: {p.presenter || "N/A"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteProgram(p.id)}
                        className="text-xs text-red-400 hover:text-red-300 bg-red-950/40 border border-red-900/60 px-3 py-1.5 rounded-lg"
                      >
                        Delete
                      </button>
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
                Use this to broadcast special live events or breaking college announcements that take priority over the weekly schedule.
              </p>

              <form
                onSubmit={handleStartOverride}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Override Broadcast Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Special College Convocation Live"
                    value={overrideTitle}
                    onChange={(e) => setOverrideTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Presenter</label>
                  <input
                    type="text"
                    placeholder="Special Guest / Host"
                    value={overridePresenter}
                    onChange={(e) => setOverridePresenter(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={overrideDurationMinutes}
                    onChange={(e) => setOverrideDurationMinutes(Number(e.target.value))}
                    className="w-32 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg transition"
                >
                  Start Live Override Now
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: STREAM CONFIG */}
          {activeTab === "stream" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Stream Configuration</h2>

              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Icecast Stream URL</label>
                  <input
                    type="url"
                    required
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Fallback Stream URL</label>
                  <input
                    type="url"
                    value={fallbackUrl}
                    onChange={(e) => setFallbackUrl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleTestStream}
                    disabled={testingStream}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    {testingStream ? "Testing Endpoint..." : "Test Stream Reachability"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveStationConfig}
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    Save Changes
                  </button>
                </div>

                {streamTestResult && (
                  <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-white">Test Stream Result:</div>
                    <div className={streamTestResult.reachable ? "text-emerald-400" : "text-red-400"}>
                      Reachable: {streamTestResult.reachable ? "YES (HTTP " + streamTestResult.status + ")" : "NO"}
                    </div>
                    <div>Content Type: {streamTestResult.contentType}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CONTACTS */}
          {activeTab === "contacts" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Station Contacts</h2>

              <form
                onSubmit={handleSaveStationConfig}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4"
              >
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Default Station Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Default Station WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white"
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
