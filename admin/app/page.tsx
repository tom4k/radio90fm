"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";

// Types
interface OnAirData {
  title: string;
  phone: string;
  whatsapp: string;
  enableCall: boolean;
  enableWhatsapp: boolean;
  isLiveOverride: boolean;
  nextTitle?: string | null;
  isNetworkAvailable?: boolean;
}

interface Program {
  id: string;
  title: string;
  presenter?: string;
  description?: string;
  dayOfWeek: number;
  startMinutes: number;
  endMinutes: number;
  enableCall: boolean;
  enableWhatsapp: boolean;
}

interface StationConfig {
  streamUrl?: string;
  fallbackStreamUrl?: string;
  defaultPhone?: string;
  defaultWhatsapp?: string;
  settingsEnabled?: boolean;
}

interface NotificationSettings {
  enableNotifications: boolean;
  enableShowReminders: boolean;
  reminderLeadMinutes: number;
  enableLiveAlerts: boolean;
  enableSound: boolean;
  enableVibration: boolean;
  quietHoursEnabled: boolean;
  quietStartHour: number;
  quietEndHour: number;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableNotifications: true,
  enableShowReminders: true,
  reminderLeadMinutes: 5,
  enableLiveAlerts: true,
  enableSound: true,
  enableVibration: true,
  quietHoursEnabled: false,
  quietStartHour: 22,
  quietEndHour: 7,
};

export default function RootPwaHomePage() {
  const [activeTab, setActiveTab] = useState<"listen" | "schedule" | "about" | "settings">("listen");

  // Station & On-Air Data
  const [stationConfig, setStationConfig] = useState<StationConfig | null>(null);
  const [onAir, setOnAir] = useState<OnAirData | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  // Audio Player State
  const [audioState, setAudioState] = useState<"idle" | "connecting" | "buffering" | "playing" | "error" | "offline">("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // On-Air Cards Swipe/Toggle state
  const [cardIndex, setCardIndex] = useState<number>(0);

  // Schedule Screen filter states
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay(); // 0 is Sun, 1 is Mon...
    return (today + 6) % 7; // Convert to 0=Mon, ..., 6=Sun
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Notification Settings state
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  // Load notification settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("radio90_notification_settings");
      if (saved) {
        setNotifSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error("Error loading notification settings", e);
    }
  }, []);

  const saveSettings = (newSettings: NotificationSettings) => {
    setNotifSettings(newSettings);
    try {
      localStorage.setItem("radio90_notification_settings", JSON.stringify(newSettings));
    } catch (e) {
      console.error("Error saving notification settings", e);
    }
  };

  // Fetch Station Config & On-Air & Schedule
  useEffect(() => {
    fetchConfig();
    fetchOnAir();
    fetchSchedule();

    const interval = setInterval(() => {
      fetchOnAir();
    }, 15000); // refresh every 15s

    return () => clearInterval(interval);
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/v1/public/config");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setStationConfig(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching station config", err);
    }
  };

  const fetchOnAir = async () => {
    try {
      const res = await fetch("/api/v1/public/on-air");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setOnAir(data.data);
          setNetworkError(false);
        }
      }
    } catch (err) {
      setNetworkError(true);
    }
  };

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await fetch("/api/v1/public/schedule");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setPrograms(data.data);
        }
      }
    } catch (err) {
      console.error("Error fetching schedule", err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Stream URL setup
  const streamUrl = useMemo(() => {
    return stationConfig?.streamUrl || "https://icecast.octosignals.com/radio90_final";
  }, [stationConfig]);

  // Audio control
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (audioState === "playing" || audioState === "buffering" || audioState === "connecting") {
      audioRef.current.pause();
      setAudioState("idle");
    } else {
      setAudioState("connecting");
      audioRef.current.src = streamUrl;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setAudioState("playing");
        })
        .catch((err) => {
          console.error("Playback error:", err);
          setAudioState("error");
        });
    }
  };

  // Ticker text
  const tickerMessage = useMemo(() => {
    switch (audioState) {
      case "connecting":
        return "Connecting to Radio 90 FM...";
      case "buffering":
        return "Buffering live audio...";
      case "offline":
        return "Offline — Check your internet connection";
      case "error":
        return "Unable to connect to live stream";
      default:
        return "Radio 90 FM Live from Amal Jyothi College of Engineering";
    }
  }, [audioState]);

  // Days helper
  const daysList = [
    { short: "MON", full: "Monday" },
    { short: "TUE", intVal: 1, full: "Tuesday" },
    { short: "WED", intVal: 2, full: "Wednesday" },
    { short: "THU", intVal: 3, full: "Thursday" },
    { short: "FRI", intVal: 4, full: "Friday" },
    { short: "SAT", intVal: 5, full: "Saturday" },
    { short: "SUN", intVal: 6, full: "Sunday" },
  ];

  const formatMinutesToTime = (mins: number) => {
    const hours = Math.floor(mins / 60) % 24;
    const minutes = mins % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    return `${h12}:${mStr} ${period}`;
  };

  const isCurrentlyOnAir = (p: Program) => {
    const now = new Date();
    const todayIndex = (now.getDay() + 6) % 7;
    if (p.dayOfWeek !== todayIndex) return false;
    const currentMins = now.getHours() * 60 + now.getMinutes();
    return currentMins >= p.startMinutes && currentMins < p.endMinutes;
  };

  const filteredPrograms = useMemo(() => {
    let dayProgs = programs.filter((p) => p.dayOfWeek === selectedDay);
    dayProgs.sort((a, b) => a.startMinutes - b.startMinutes);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      dayProgs = dayProgs.filter((p) => p.title.toLowerCase().includes(q) || (p.presenter && p.presenter.toLowerCase().includes(q)));
    }
    return dayProgs;
  }, [programs, selectedDay, searchQuery]);

  const activePhone = onAir?.phone || stationConfig?.defaultPhone || "9496345029";
  const activeWhatsapp = onAir?.whatsapp || stationConfig?.defaultWhatsapp || "9048389090";

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-between font-sans selection:bg-[#E50914] selection:text-white overflow-x-hidden">
      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        onWaiting={() => setAudioState("buffering")}
        onPlaying={() => setAudioState("playing")}
        onError={() => setAudioState("error")}
        onEnded={() => setAudioState("idle")}
        preload="none"
      />

      {/* Dynamic Animated Liquid Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-radial from-[#E50914]/25 via-[#E50914]/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[15%] w-[550px] h-[550px] bg-radial from-[#8B5CF6]/20 via-[#4C1D95]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-[20%] left-[20%] w-[500px] h-[500px] bg-radial from-[#E50914]/15 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main Content Container (Mobile-App Frame styling) */}
      <main className="relative z-10 w-full max-w-md min-h-screen flex flex-col pb-24 px-4 pt-4">
        {/* LISTEN SCREEN (HOME) */}
        {activeTab === "listen" && (
          <div className="flex-1 flex flex-col justify-between items-center space-y-6 my-auto py-4">
            {/* Prominent Station Logo */}
            <div className="w-full flex justify-center py-2">
              <Image
                src="/icon.png"
                alt="Radio 90 FM Logo"
                width={240}
                height={120}
                className="object-contain drop-shadow-[0_10px_25px_rgba(229,9,20,0.3)] transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>

            {/* Offline Network Warning */}
            {networkError && (
              <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 backdrop-blur-xl flex items-center space-x-3 text-amber-400 text-xs">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-2.828-2.828a5 5 0 010-7.071m-4.243 4.243a1 1 0 11-1.414-1.414 1 1 0 011.414 1.414zM4.93 4.93l14.14 14.14" />
                </svg>
                <div>
                  <p className="font-bold">No Network Connection</p>
                  <p className="text-white/70">Please check your internet connection.</p>
                </div>
              </div>
            )}

            {/* On-Air & Up-Next Swipeable / Toggleable Glass Cards */}
            <div className="w-full space-y-3">
              <div className="w-full p-5 rounded-3xl bg-[#141414]/80 border border-white/10 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-[#E50914]/40">
                {cardIndex === 0 ? (
                  /* LIVE CARD */
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/40">
                      <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                      <span className="text-[11px] font-bold tracking-widest text-[#E50914]">
                        {onAir?.isLiveOverride ? "SPECIAL LIVE PROGRAM" : "LIVE NOW"}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white tracking-wide line-clamp-1">
                      {onAir?.title || "Radio 90 FM Live"}
                    </h2>
                    <p className="text-xs text-[#A3A3A3]">Radio 90: Voice of Amal Jyothi</p>

                    {/* Studio Communication Action Buttons */}
                    <div className="pt-2 flex items-center justify-center space-x-3 w-full">
                      {(onAir?.enableCall ?? true) && (
                        <a
                          href={`tel:${activePhone}`}
                          className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-semibold text-xs transition-all hover:bg-emerald-600 hover:text-white active:scale-95 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27c1.21.49 2.53.76 3.88.76a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.27 2.67.76 3.88a1 1 0 01-.27 1.11l-2.2 2.2z" />
                          </svg>
                          <span>Call Studio</span>
                        </a>
                      )}

                      {(onAir?.enableWhatsapp ?? true) && (
                        <a
                          href={`https://wa.me/${activeWhatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-semibold text-xs transition-all hover:bg-emerald-600 hover:text-white active:scale-95 shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.84 9.84 0 0012.04 2z" />
                          </svg>
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  /* UP NEXT CARD */
                  <div className="flex flex-col items-center text-center space-y-3 min-h-[140px] justify-center">
                    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                      <svg className="w-3.5 h-3.5 text-[#E50914]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                      <span className="text-[11px] font-bold tracking-widest text-[#E50914]">UP NEXT PROGRAM</span>
                    </div>

                    <h2 className="text-xl font-bold text-white tracking-wide line-clamp-1">
                      {onAir?.nextTitle || "Stay Tuned"}
                    </h2>
                    <p className="text-xs text-[#A3A3A3]">Radio 90: Voice of Amal Jyothi</p>
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-[11px] text-white/60">
                      Starts following current show
                    </span>
                  </div>
                )}
              </div>

              {/* Card Toggle Indicators */}
              {onAir?.nextTitle && (
                <div className="flex justify-center items-center space-x-2 pt-1">
                  <button
                    onClick={() => setCardIndex(0)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center space-x-1 ${
                      cardIndex === 0
                        ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/40 border border-[#E50914]"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cardIndex === 0 ? "bg-white" : "bg-white/40"}`} />
                    <span>LIVE NOW</span>
                  </button>
                  <button
                    onClick={() => setCardIndex(1)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center space-x-1 ${
                      cardIndex === 1
                        ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/40 border border-[#E50914]"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cardIndex === 1 ? "bg-white" : "bg-white/40"}`} />
                    <span>UP NEXT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Central Red Circular Player Button */}
            <div className="py-4">
              <button
                onClick={togglePlayPause}
                className={`relative w-24 h-24 rounded-full bg-[#E50914] flex items-center justify-center shadow-[0_0_40px_rgba(229,9,20,0.5)] transition-all duration-300 active:scale-95 ${
                  audioState === "playing" ? "shadow-[0_0_60px_rgba(229,9,20,0.8)] scale-105" : "hover:scale-105"
                }`}
                aria-label={audioState === "playing" ? "Pause Radio" : "Play Radio"}
              >
                {audioState === "connecting" || audioState === "buffering" ? (
                  <div className="w-11 h-11 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : audioState === "playing" ? (
                  <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-14 h-14 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Text Marquee Status Ticker */}
            <div className="w-full overflow-hidden py-2 bg-black/40 rounded-xl border border-white/5 backdrop-blur-md">
              <div className="whitespace-nowrap animate-marquee flex space-x-8 text-sm font-semibold text-[#E50914]">
                <span>{tickerMessage}</span>
                <span>•</span>
                <span>Radio 90 FM — Voice of Amal Jyothi</span>
                <span>•</span>
                <span>Celebration of Knowledge</span>
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE SCREEN */}
        {activeTab === "schedule" && (
          <div className="flex-1 flex flex-col space-y-4 pt-2">
            <div className="flex justify-between items-center pb-2">
              <h1 className="text-xl font-bold text-white">Broadcast Schedule</h1>
              <button
                onClick={fetchSchedule}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#141414] text-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-[#E50914] focus:outline-none"
              />
              <svg className="w-4 h-4 text-[#E50914] absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Horizontal Day Tabs */}
            <div className="flex overflow-x-auto space-x-2 py-1 scrollbar-none">
              {daysList.map((day, idx) => {
                const isSelected = selectedDay === idx;
                const todayIdx = (new Date().getDay() + 6) % 7;
                const isToday = todayIdx === idx;

                return (
                  <button
                    key={day.short}
                    onClick={() => setSelectedDay(idx)}
                    className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? "bg-[#E50914] text-white shadow-lg shadow-[#E50914]/30"
                        : "bg-[#141414] text-[#A3A3A3] hover:text-white border border-white/5"
                    }`}
                  >
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    <span>{day.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Program Cards List */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {loadingSchedule ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredPrograms.length === 0 ? (
                <div className="text-center py-12 text-[#A3A3A3] text-sm">
                  No programs found for {daysList[selectedDay].full}.
                </div>
              ) : (
                filteredPrograms.map((prog) => {
                  const onAirNow = isCurrentlyOnAir(prog);
                  return (
                    <div
                      key={prog.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        onAirNow
                          ? "bg-[#1F0A0A] border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.2)]"
                          : "bg-[#141414]/90 border-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            onAirNow ? "bg-[#E50914] text-white" : "bg-[#E50914]/15 text-[#E50914]"
                          }`}
                        >
                          {formatMinutesToTime(prog.startMinutes)} - {formatMinutesToTime(prog.endMinutes)}
                        </span>

                        {onAirNow && (
                          <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>ON AIR NOW</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white mb-1">{prog.title}</h3>
                      <p className="text-xs text-[#A3A3A3] mb-2">Radio 90: Voice of Amal Jyothi</p>
                      {prog.description && <p className="text-xs text-white/70 line-clamp-2">{prog.description}</p>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ABOUT SCREEN */}
        {activeTab === "about" && (
          <div className="flex-1 flex flex-col space-y-6 pt-2 overflow-y-auto">
            {/* Header Branding Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#1F0505] to-[#141414] border border-[#E50914]/40 text-center shadow-xl">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full border-2 border-[#E50914] overflow-hidden p-1 shadow-lg shadow-[#E50914]/30">
                <Image src="/logo.png" alt="Logo" width={80} height={80} className="w-full h-full object-cover rounded-full" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">Radio 90 FM</h1>
              <p className="text-xs font-semibold text-[#E50914] mt-1">Voice of Amal Jyothi • 90.0 MHz</p>
              <p className="text-xs italic text-white/60 mt-1">Celebration of Knowledge</p>
            </div>

            {/* Vision Card */}
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#E50914]/30 space-y-2">
              <div className="flex items-center space-x-2 text-[#E50914] font-bold text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Our Vision</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Provide a platform to become the voice of the common man by giving importance to the concept of education and agriculture and aiming at the overall uplift of society through infotainment and edutainment.
              </p>
            </div>

            {/* Mission Card */}
            <div className="p-5 rounded-2xl bg-[#141414] border border-[#E50914]/30 space-y-2">
              <div className="flex items-center space-x-2 text-[#E50914] font-bold text-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span>Our Mission</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                To be one of the leading radio services (Radio 90 FM) by providing infotainment, and edutainment to the people and bringing the world closer.
              </p>
            </div>

            {/* Address & Contact Info */}
            <div className="p-5 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white">Contact Us</h3>
              <p className="text-xs text-white/80 leading-relaxed">
                <strong className="text-white">Station Master, Radio 90 FM</strong><br />
                Amal Jyothi College of Engineering<br />
                Kanjirappally, Koovappally P.O.<br />
                Kottayam Dt., Kerala, India - 686518
              </p>
              <div className="pt-2 space-y-2 text-xs border-t border-white/10">
                <a href="tel:+918139090358" className="flex items-center space-x-2 text-white/90 hover:text-[#E50914]">
                  <span>Advertisements: +91 8139090358</span>
                </a>
                <a href="tel:+919048389090" className="flex items-center space-x-2 text-white/90 hover:text-[#E50914]">
                  <span>Suggestions: +91 9048389090</span>
                </a>
                <a href="mailto:radio90@amaljyothi.ac.in" className="flex items-center space-x-2 text-white/90 hover:text-[#E50914]">
                  <span>Email: radio90@amaljyothi.ac.in</span>
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3 text-center">
              <p className="text-xs font-bold text-white">Connect With Us</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.instagram.com/radio90.fm?igsi=bDB0ZWoyZWI0anV3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#E1306C]/15 border border-[#E1306C]/40 text-[#E1306C] font-bold text-xs hover:bg-[#E1306C] hover:text-white transition-all"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/share/1HA2JvouSG/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#1877F2]/15 border border-[#1877F2]/40 text-[#1877F2] font-bold text-xs hover:bg-[#1877F2] hover:text-white transition-all"
                >
                  Facebook
                </a>
                <a
                  href="https://youtube.com/@radio90fmajce?si=Ibut1XLijXKQfXyo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-red-600/15 border border-red-600/40 text-red-500 font-bold text-xs hover:bg-red-600 hover:text-white transition-all"
                >
                  YouTube
                </a>
                <a
                  href="https://www.radio90.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-xs hover:bg-white hover:text-black transition-all"
                >
                  Official Website
                </a>
              </div>
            </div>

            {/* Footer Copyright */}
            <div className="text-center text-[10px] text-white/40 pt-4">
              <p>© 2026 Amal Jyothi College of Engineering</p>
              <p>Radio 90 FM • All Rights Reserved</p>
            </div>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {activeTab === "settings" && (
          <div className="flex-1 flex flex-col space-y-5 pt-2 overflow-y-auto">
            <h1 className="text-xl font-bold text-white">Notification Settings</h1>

            {/* Master Switch */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 flex justify-between items-center">
              <div>
                <p className="text-sm font-bold text-white">Allow Notifications</p>
                <p className="text-xs text-white/60">Enable or disable all app notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifSettings.enableNotifications}
                onChange={(e) => saveSettings({ ...notifSettings, enableNotifications: e.target.checked })}
                className="w-5 h-5 accent-[#E50914]"
              />
            </div>

            {/* Reminders & Alerts */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#E50914] uppercase tracking-wider">Show Reminders & Live Alerts</p>
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">Program Start Reminders</p>
                    <p className="text-xs text-white/60">Get notified before scheduled shows begin</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.enableShowReminders}
                    onChange={(e) => saveSettings({ ...notifSettings, enableShowReminders: e.target.checked })}
                    className="w-5 h-5 accent-[#E50914]"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-white">Live Broadcast Alerts</p>
                    <p className="text-xs text-white/60">Notify when special live programs go on-air</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.enableLiveAlerts}
                    onChange={(e) => saveSettings({ ...notifSettings, enableLiveAlerts: e.target.checked })}
                    className="w-5 h-5 accent-[#E50914]"
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#E50914] uppercase tracking-wider">Quiet Hours (Do Not Disturb)</p>
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-white">Quiet Hours</p>
                    <p className="text-xs text-white/60">Silence all notifications during specified times</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.quietHoursEnabled}
                    onChange={(e) => saveSettings({ ...notifSettings, quietHoursEnabled: e.target.checked })}
                    className="w-5 h-5 accent-[#E50914]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FIXED TRANSLUCENT BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 pt-1 pointer-events-auto">
        <div className="w-full max-w-md bg-black/60 backdrop-blur-2xl border border-white/15 rounded-3xl px-3 py-2 flex justify-around items-center shadow-2xl">
          <button
            onClick={() => setActiveTab("listen")}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-2xl transition-all ${
              activeTab === "listen" ? "text-[#E50914]" : "text-white/60 hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            <span className="text-[10px] font-bold">Listen</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-2xl transition-all ${
              activeTab === "schedule" ? "text-[#E50914]" : "text-white/60 hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-bold">Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-2xl transition-all ${
              activeTab === "about" ? "text-[#E50914]" : "text-white/60 hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-bold">About</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center space-y-1 py-1 px-4 rounded-2xl transition-all ${
              activeTab === "settings" ? "text-[#E50914]" : "text-white/60 hover:text-white"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-[10px] font-bold">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
