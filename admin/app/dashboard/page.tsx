"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "overview" | "schedule" | "override" | "stream" | "contacts" | "audit" | "notifications" | "users"
  >("overview");

  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [onAir, setOnAir] = useState<any>(null);
  const [streamTestResult, setStreamTestResult] = useState<any>(null);
  const [testingStream, setTestingStream] = useState(false);

  // Current Logged in User Profile
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Change Password Modal States
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassInput, setCurrentPassInput] = useState("");
  const [newPassInput, setNewPassInput] = useState("");
  const [confirmPassInput, setConfirmPassInput] = useState("");
  const [changePassError, setChangePassError] = useState("");
  const [changePassSuccess, setChangePassSuccess] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Admin User Management States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");
  const [userError, setUserError] = useState("");
  const [userSuccess, setUserSuccess] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);

  // Super Admin Reset Password for specific admin user
  const [resetUserTarget, setResetUserTarget] = useState<any>(null);
  const [showResetUserModal, setShowResetUserModal] = useState(false);
  const [resetUserNewPassword, setResetUserNewPassword] = useState("");
  const [resetUserConfirmPassword, setResetUserConfirmPassword] = useState("");
  const [resetUserError, setResetUserError] = useState("");
  const [resetUserSuccess, setResetUserSuccess] = useState("");
  const [resettingUserPass, setResettingUserPass] = useState(false);

  // Audio player state
  const [streamState, setStreamState] = useState<"idle" | "buffering" | "playing">("idle");
  const [audioVolume, setAudioVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Edit program modal state
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [savingProgramEdit, setSavingProgramEdit] = useState(false);
  const [editProgTitle, setEditProgTitle] = useState("");
  const [editProgPresenter, setEditProgPresenter] = useState("");
  const [editProgDay, setEditProgDay] = useState(0);
  const [editProgStartTime, setEditProgStartTime] = useState("08:00");
  const [editProgEndTime, setEditProgEndTime] = useState("09:00");
  const [editProgEnableCall, setEditProgEnableCall] = useState(true);
  const [editProgEnableWhatsapp, setEditProgEnableWhatsapp] = useState(true);

  // Override state
  const [overrideTitle, setOverrideTitle] = useState("");
  const [overridePresenter, setOverridePresenter] = useState("");
  const [overrideDurationMinutes, setOverrideDurationMinutes] = useState(60);
  const [overrideMode, setOverrideMode] = useState<"instant" | "scheduled">("instant");
  const [overrideStartDateTime, setOverrideStartDateTime] = useState("");
  const [overrideEndDateTime, setOverrideEndDateTime] = useState("");
  const [overrideEnableCall, setOverrideEnableCall] = useState(true);
  const [overrideEnableWhatsapp, setOverrideEnableWhatsapp] = useState(true);
  const [overridesList, setOverridesList] = useState<any[]>([]);
  const [loadingOverridesList, setLoadingOverridesList] = useState(false);

  const fetchOverridesList = async () => {
    setLoadingOverridesList(true);
    try {
      const res = await fetch("/api/v1/admin/live");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setOverridesList(json.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading overrides list", err);
    } finally {
      setLoadingOverridesList(false);
    }
  };

  // Broadcast notifications state
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"standard" | "app_update">("standard");
  const [notifActionUrl, setNotifActionUrl] = useState("https://onelink.to/243uae");
  const [notifTargetPlatform, setNotifTargetPlatform] = useState<"all" | "android" | "ios">("all");
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [loadingNotifsList, setLoadingNotifsList] = useState(false);

  const fetchNotificationsList = async () => {
    setLoadingNotifsList(true);
    try {
      const res = await fetch("/api/v1/admin/notifications");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotificationsList(json.data || []);
        }
      }
    } catch (err) {
      console.error("Error loading notifications list", err);
    } finally {
      setLoadingNotifsList(false);
    }
  };

  const handleSendBroadcastNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    setSendingNotif(true);
    try {
      const res = await fetch("/api/v1/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notifTitle,
          message: notifMessage,
          type: notifType,
          actionUrl: notifType === "app_update" ? notifActionUrl : null,
          targetPlatform: notifTargetPlatform,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotifTitle("");
        setNotifMessage("");
        setNotifType("standard");
        setMsg("🚀 Broadcast push notification sent to mobile users!");
        fetchNotificationsList();
      } else {
        setMsg(json.error?.message || "Failed to send notification");
      }
    } catch (err: any) {
      setMsg("Error sending notification: " + err.message);
    } finally {
      setSendingNotif(false);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [liveServerTime, setLiveServerTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setLiveServerTime(timeStr + " IST");
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/v1/admin/users");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsersList(data.data.users || []);
        }
      }
    } catch (err) {
      console.error("Error fetching users list", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  async function handleChangePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChangePassError("");
    setChangePassSuccess("");

    if (newPassInput.length < 6) {
      setChangePassError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setChangePassError("Passwords do not match.");
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/v1/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPassInput,
          newPassword: newPassInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setChangePassError(data.error?.message || "Failed to change password.");
        setChangingPass(false);
        return;
      }
      setChangePassSuccess("Password updated successfully!");
      setCurrentPassInput("");
      setNewPassInput("");
      setConfirmPassInput("");
      setChangingPass(false);
      setTimeout(() => {
        setShowChangePasswordModal(false);
      }, 2000);
    } catch (err: any) {
      setChangePassError("Error updating password.");
      setChangingPass(false);
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setUserError("");
    setUserSuccess("");

    if (!newUserName || !newUserEmail || !newUserPassword) {
      setUserError("All fields are required.");
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
          role: newUserRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setUserError(data.error?.message || "Failed to create user account.");
        setCreatingUser(false);
        return;
      }
      setUserSuccess(data.message || "Admin account created!");
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("ADMIN");
      setCreatingUser(false);
      setShowAddUserModal(false);
      fetchUsersList();
    } catch (err: any) {
      setUserError("Error creating admin account.");
      setCreatingUser(false);
    }
  }

  async function handleUpdateUserRole(userId: string, newRole: string) {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchUsersList();
      } else {
        setMsg(data.error?.message || "Failed to update role");
      }
    } catch (err) {
      setMsg("Error updating user role");
    }
  }

  async function handleToggleUserActive(userId: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchUsersList();
      } else {
        setMsg(data.error?.message || "Failed to toggle status");
      }
    } catch (err) {
      setMsg("Error toggling user status");
    }
  }

  async function handleDeleteUser(userId: string, name: string) {
    if (!confirm(`Are you sure you want to delete admin account '${name}'?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        fetchUsersList();
      } else {
        setMsg(data.error?.message || "Failed to delete user");
      }
    } catch (err) {
      setMsg("Error deleting user");
    }
  }

  async function handleSuperAdminResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setResetUserError("");
    setResetUserSuccess("");

    if (!resetUserTarget) return;

    if (resetUserNewPassword.length < 6) {
      setResetUserError("New password must be at least 6 characters long.");
      return;
    }
    if (resetUserNewPassword !== resetUserConfirmPassword) {
      setResetUserError("Passwords do not match.");
      return;
    }

    setResettingUserPass(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${resetUserTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetUserNewPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setResetUserError(data.error?.message || "Failed to reset password.");
        setResettingUserPass(false);
        return;
      }

      setResetUserSuccess(`Password for '${resetUserTarget.name}' reset successfully!`);
      setResetUserNewPassword("");
      setResetUserConfirmPassword("");
      setResettingUserPass(false);
      setTimeout(() => {
        setShowResetUserModal(false);
        setResetUserTarget(null);
      }, 2000);
    } catch (err: any) {
      setResetUserError("Error resetting password.");
      setResettingUserPass(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData(showFullLoader = true) {
    if (showFullLoader) {
      setLoading(true);
    }
    try {
      // 0. Fetch logged in user profile
      try {
        const meRes = await fetch("/api/v1/admin/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success) {
            setCurrentUser(meData.data.user);
          }
        }
      } catch (err) {}

      // 1. Station Config
      try {
        const stationRes = await fetch("/api/v1/admin/station");
        if (stationRes.ok) {
          const stationData = await stationRes.json();
          if (stationData.success && stationData.data) {
            setStation(stationData.data);
            const sUrl = stationData.data.streamUrl || stationData.data.stream?.url || "https://icecast.octosignals.com/radio90_final";
            const fUrl = stationData.data.fallbackStreamUrl || stationData.data.stream?.fallbackUrl || "";
            const pNum = stationData.data.defaultPhone || stationData.data.contacts?.phone || "9496345029";
            const wNum = stationData.data.defaultWhatsapp || stationData.data.contacts?.whatsapp || "9048389090";

            setStreamUrl(sUrl);
            setFallbackUrl(fUrl);
            setPhone(pNum);
            setWhatsapp(wNum);
          }
        }
      } catch (err) {
        console.error("Error loading station config", err);
      }

      // 2. Weekly Programs Schedule
      try {
        let loadedPrograms: any[] = [];
        const scheduleRes = await fetch("/api/v1/admin/programs");
        if (scheduleRes.ok) {
          const scheduleData = await scheduleRes.json();
          if (scheduleData.success && Array.isArray(scheduleData.data) && scheduleData.data.length > 0) {
            loadedPrograms = scheduleData.data;
          }
        }

        if (loadedPrograms.length === 0) {
          const publicScheduleRes = await fetch("/api/v1/public/schedule");
          if (publicScheduleRes.ok) {
            const publicScheduleData = await publicScheduleRes.json();
            if (publicScheduleData.success && Array.isArray(publicScheduleData.data)) {
              loadedPrograms = publicScheduleData.data;
            }
          }
        }

        setPrograms(loadedPrograms);
      } catch (err) {
        console.error("Error loading programs schedule", err);
      }

      // 3. On-Air Status
      try {
        const onAirRes = await fetch("/api/v1/public/on-air");
        if (onAirRes.ok) {
          const onAirData = await onAirRes.json();
          if (onAirData.success) {
            setOnAir(onAirData.data);
          }
        }
      } catch (err) {
        console.error("Error loading on-air status", err);
      }

      // 4. Notifications & Live Overrides Lists
      fetchNotificationsList();
      fetchOverridesList();
    } finally {
      if (showFullLoader) {
        setLoading(false);
      }
    }
  }

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (streamState === "playing" || streamState === "buffering") {
      audio.pause();
      setStreamState("idle");
    } else {
      setStreamState("buffering");
      audio.load();
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setStreamState("playing");
          })
          .catch((err) => {
            console.error("Audio playback error:", err);
            setStreamState("idle");
          });
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAudioVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

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
        fetchData(false);
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

  function minutesToHHMM(mins: number): string {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    const hStr = h < 10 ? `0${h}` : `${h}`;
    const mStr = m < 10 ? `0${m}` : `${m}`;
    return `${hStr}:${mStr}`;
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

  function openEditModal(program: any) {
    setEditingProgramId(program.id);
    setEditProgTitle(program.title || "");
    setEditProgPresenter(program.presenter || "");
    setEditProgDay(program.dayOfWeek ?? 0);
    setEditProgStartTime(minutesToHHMM(program.startMinutes ?? 480));
    setEditProgEndTime(minutesToHHMM(program.endMinutes ?? 540));
    setEditProgEnableCall(program.enableCall ?? true);
    setEditProgEnableWhatsapp(program.enableWhatsapp ?? true);
  }

  async function handleSaveProgramEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProgramId) return;
    setMsg("");
    setSavingProgramEdit(true);

    try {
      const startMins = timeStringToMinutes(editProgStartTime);
      const endMins = timeStringToMinutes(editProgEndTime);

      const res = await fetch(`/api/v1/admin/programs/${editingProgramId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editProgTitle,
          presenter: editProgPresenter,
          dayOfWeek: Number(editProgDay),
          startMinutes: startMins,
          endMinutes: endMins,
          enableCall: editProgEnableCall,
          enableWhatsapp: editProgEnableWhatsapp,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg("Program updated successfully!");
        await fetchData(false);
        setEditingProgramId(null);
      } else {
        setMsg(data.error?.message || "Failed to update program");
      }
    } catch (err) {
      setMsg("Error updating program");
    } finally {
      setSavingProgramEdit(false);
    }
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
        fetchData(false);
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
        fetchData(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleStartOverride(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      let startsAt: Date;
      let expiresAt: Date;

      if (overrideMode === "instant") {
        startsAt = new Date();
        expiresAt = new Date(startsAt.getTime() + overrideDurationMinutes * 60000);
      } else {
        startsAt = new Date(overrideStartDateTime);
        expiresAt = new Date(overrideEndDateTime);
      }

      if (isNaN(startsAt.getTime()) || isNaN(expiresAt.getTime())) {
        setMsg("Please enter valid start and end dates/times.");
        return;
      }

      if (expiresAt <= startsAt) {
        setMsg("End date/time must be after start date/time.");
        return;
      }

      const res = await fetch("/api/v1/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: overrideTitle,
          presenter: overridePresenter,
          enableCall: overrideEnableCall,
          enableWhatsapp: overrideEnableWhatsapp,
          startsAt: startsAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
          enabled: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg(
          overrideMode === "instant"
            ? "🚀 Live Override started immediately!"
            : "📅 Live Override scheduled successfully!"
        );
        setOverrideTitle("");
        setOverridePresenter("");
        fetchData(false);
        fetchOverridesList();
      } else {
        setMsg(data.error?.message || "Failed to save Live Override");
      }
    } catch (err) {
      setMsg("Failed to start Live Override");
    }
  }

  async function handleDeactivateOverride() {
    setMsg("");
    try {
      const res = await fetch("/api/v1/admin/live", {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMsg("✅ Live Override deactivated! Reverted to standard weekly schedule.");
        fetchData(false);
        fetchOverridesList();
      } else {
        setMsg(data.error?.message || "Failed to deactivate Live Override");
      }
    } catch (err) {
      setMsg("Error deactivating Live Override");
    }
  }

  async function handleDeleteOverrideItem(id: string) {
    if (!confirm("Are you sure you want to remove this Live Override?")) return;
    try {
      const res = await fetch(`/api/v1/admin/live/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Live Override removed.");
        fetchData(false);
        fetchOverridesList();
      }
    } catch (err) {
      console.error(err);
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

  const currentProgData = useMemo(() => {
    const cur = onAir?.currentProgram || onAir?.data?.currentProgram;
    if (!cur) return null;
    const matched = programs.find(
      (p) => p.id === cur.id || (p.dayOfWeek === cur.dayOfWeek && p.startMinutes === cur.startMinutes)
    );
    return matched || cur;
  }, [onAir, programs]);

  const nextProgData = useMemo(() => {
    const nextP = onAir?.nextProgram || onAir?.data?.nextProgram;
    if (!nextP) return null;
    const matched = programs.find(
      (p) => p.id === nextP.id || (p.dayOfWeek === nextP.dayOfWeek && p.startMinutes === nextP.startMinutes)
    );
    return matched || nextP;
  }, [onAir, programs]);

  const filteredPrograms = useMemo(() => {
    return programs
      .filter((p) => {
        if (scheduleDayFilter !== "ALL" && p.dayOfWeek !== scheduleDayFilter) {
          return false;
        }
        if (scheduleSearch.trim()) {
          const q = scheduleSearch.toLowerCase();
          const titleMatch = (p.title || "").toLowerCase().includes(q);
          return titleMatch;
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
      {/* PERSISTENT AUDIO ELEMENT - ALWAYS MOUNTED ACROSS ALL TABS */}
      <audio
        ref={audioRef}
        src={streamUrl || "https://icecast.octosignals.com/radio90_final"}
        preload="none"
        onWaiting={() => setStreamState("buffering")}
        onPlaying={() => setStreamState("playing")}
        onPause={() => setStreamState("idle")}
        onError={() => setStreamState("idle")}
      />

      {/* Top Navbar Header with PERSISTENT MINI PLAYER WIDGET */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/90 sticky top-0 z-30 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3 shrink-0">
            <img
              src="/logo.png"
              alt="Radio 90 FM"
              className="h-10 w-10 object-contain rounded-full border border-neutral-800 bg-neutral-900 p-0.5 shadow-md shadow-red-950/60"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-base text-white leading-none tracking-tight">
                Radio 90 FM Admin Console
              </h1>
              <p className="text-xs text-neutral-400">Voice of Amal Jyothi • 90.0 MHz</p>
            </div>
          </div>

          {/* PERSISTENT TOP BAR MINI AUDIO PLAYER WIDGET */}
          <div className="flex items-center space-x-3 bg-neutral-950/90 border border-neutral-800 px-3 py-1.5 rounded-2xl shadow-inner max-w-md w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={togglePlayPause}
              className="h-9 w-9 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-center shadow-md transition transform hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
              title={streamState === "playing" ? "Pause Stream" : "Play Stream"}
            >
              {streamState === "buffering" ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : streamState === "playing" ? (
                <span className="text-xs font-bold">❚❚</span>
              ) : (
                <span className="text-xs font-bold ml-0.5">▶</span>
              )}
            </button>

            <div className="flex flex-col min-w-0 pr-2">
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${streamState === "buffering" ? "bg-amber-400" : streamState === "playing" ? "bg-red-400" : "bg-emerald-400"} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${streamState === "buffering" ? "bg-amber-500" : streamState === "playing" ? "bg-red-500" : "bg-emerald-500"}`}></span>
                </span>
                <span className="text-[11px] font-bold text-white truncate max-w-[150px] sm:max-w-[200px]">
                  {streamState === "buffering"
                    ? "Buffering Stream..."
                    : streamState === "playing"
                    ? (currentProgData?.title || "Broadcasting Live")
                    : "Radio 90 FM Stream"}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono truncate">
                {streamState === "playing" ? "LIVE ON AIR" : "90.0 MHz Icecast"}
              </span>
            </div>

            {/* Equalizer Bars on Mini Player */}
            <div className="hidden md:flex items-end space-x-0.5 h-4 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded-md">
              <span className={`w-0.5 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-3 animate-pulse" : "h-1"}`}></span>
              <span className={`w-0.5 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-4 animate-bounce" : "h-1.5"}`}></span>
              <span className={`w-0.5 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-2.5 animate-pulse" : "h-1"}`}></span>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {currentUser && (
              <div className="hidden sm:flex flex-col items-end mr-1 text-right">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  {currentUser.name}
                  {(currentUser.role === "SUPER_ADMIN" || (currentUser.email || "").toLowerCase().includes("tomkurian")) && (
                    <span className="text-[10px] bg-amber-950/80 border border-amber-500/40 text-amber-300 font-extrabold px-1.5 py-0.2 rounded">
                      SUPER
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[140px]">
                  {currentUser.email}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setChangePassError("");
                setChangePassSuccess("");
                setShowChangePasswordModal(true);
              }}
              className="text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 border border-neutral-700/60"
              title="Change Password"
            >
              🔑 Password
            </button>

            <button
              onClick={handleLogout}
              className="text-xs font-semibold bg-red-950/60 hover:bg-red-900 border border-red-900/60 text-red-200 px-3 py-1.5 rounded-lg transition"
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
            onClick={() => {
              setActiveTab("override");
              fetchOverridesList();
            }}
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
          <button
            onClick={() => {
              setActiveTab("notifications");
              fetchNotificationsList();
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
              activeTab === "notifications"
                ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-950"
                : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <span>Broadcast Notifications</span>
            <span className="text-xs bg-neutral-950/60 text-white px-2 py-0.5 rounded-full border border-white/10 font-bold">
              📢
            </span>
          </button>

          {/* SUPER ADMIN USERS TAB */}
          {(currentUser?.role === "SUPER_ADMIN" ||
            (currentUser?.email || "").toLowerCase().includes("tomkurian") ||
            (currentUser?.name || "").toLowerCase().includes("tomkurian")) && (
            <button
              onClick={() => {
                setActiveTab("users");
                fetchUsersList();
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between border ${
                activeTab === "users"
                  ? "bg-amber-600 border-amber-500 text-white font-semibold shadow-lg shadow-amber-950"
                  : "bg-amber-950/30 border-amber-900/40 text-amber-300 hover:bg-amber-900/50 hover:text-amber-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>👑</span>
                <span>Admin Users</span>
              </span>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-extrabold">
                SUPER
              </span>
            </button>
          )}
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

          {/* DATABASE LOADER & SKELETON WIDGET */}
          {loading ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-12 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
                  <img
                    src="/logo.png"
                    alt="Radio 90 FM"
                    className="h-8 w-8 object-contain absolute rounded-full border border-neutral-800 bg-neutral-950 p-0.5"
                  />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Fetching Database Schedule...
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Connecting to Neon PostgreSQL database and retrieving live broadcast schedule & station settings.
                </p>
              </div>

              {/* Skeleton Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 max-w-xl mx-auto">
                <div className="h-24 bg-neutral-950/80 border border-neutral-800/80 rounded-2xl animate-pulse"></div>
                <div className="h-24 bg-neutral-950/80 border border-neutral-800/80 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Live stream monitor, real-time audio playback, and active broadcast controls.
                  </p>
                </div>
              </div>

              {/* LIVE STREAMING PLAYER WIDGET */}
              <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                  <div className="flex items-center space-x-3">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${streamState === "buffering" ? "bg-amber-400" : streamState === "playing" ? "bg-red-400" : "bg-emerald-400"} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${streamState === "buffering" ? "bg-amber-500" : streamState === "playing" ? "bg-red-500" : "bg-emerald-500"}`}></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      {streamState === "buffering"
                        ? "CONNECTING & BUFFERING STREAM..."
                        : streamState === "playing"
                        ? "NOW BROADCASTING LIVE"
                        : "LIVE ICECAST AUDIO STREAM"}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                    90.0 MHz • Icecast Stream
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
                  <div className="flex items-center space-x-5 w-full sm:w-auto">
                    <button
                      onClick={togglePlayPause}
                      className="h-16 w-16 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white flex items-center justify-center shadow-xl shadow-red-950/80 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      {streamState === "buffering" ? (
                        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : streamState === "playing" ? (
                        <span className="text-2xl font-bold">❚❚</span>
                      ) : (
                        <span className="text-2xl font-bold ml-1">▶</span>
                      )}
                    </button>

                    <div>
                      <div className="font-extrabold text-white text-lg tracking-tight">
                        Radio 90 FM Live Stream
                      </div>
                      <div className="text-xs text-neutral-400 truncate max-w-xs font-mono mt-0.5">
                        {streamUrl || "https://icecast.octosignals.com/radio90_final"}
                      </div>
                    </div>
                  </div>

                  {/* Equalizer Visualizer Bars & Volume Control */}
                  <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Equalizer Bars Animation */}
                    <div className="flex items-end space-x-1 h-8 px-3 py-1 bg-neutral-950 border border-neutral-800 rounded-xl">
                      <span className={`w-1 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-6 animate-pulse" : "h-2"}`}></span>
                      <span className={`w-1 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-8 animate-bounce" : "h-3"}`}></span>
                      <span className={`w-1 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-4 animate-pulse" : "h-2"}`}></span>
                      <span className={`w-1 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-7 animate-bounce" : "h-4"}`}></span>
                      <span className={`w-1 bg-red-500 rounded-full transition-all duration-300 ${streamState === "playing" ? "h-5 animate-pulse" : "h-2"}`}></span>
                    </div>

                    {/* Volume Slider */}
                    <div className="flex items-center space-x-2 bg-neutral-950 border border-neutral-800 px-3 py-2 rounded-xl">
                      <span className="text-xs text-neutral-400">🔊</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioVolume}
                        onChange={handleVolumeChange}
                        className="w-20 accent-red-600 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
                        {Math.round(audioVolume * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Current Program Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NOW ON AIR CARD WITH LIVE SERVER TIME & EDIT BUTTON */}
                <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  {(() => {
                    const curProg = onAir?.currentProgram || onAir?.data?.currentProgram;
                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                          <div className="flex items-center space-x-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                            <span className="text-xs uppercase font-bold text-red-400 tracking-wider">
                              NOW ON AIR
                            </span>
                          </div>

                          {/* LIVE SERVER STATION CLOCK */}
                          <div className="text-[11px] font-mono text-emerald-400 bg-neutral-950 border border-emerald-900/60 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 shadow-inner">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>{liveServerTime || onAir?.serverTime || onAir?.data?.serverTime || "Loading time..."}</span>
                          </div>
                        </div>

                        <div className="flex items-start justify-between gap-3 pt-1">
                          <div>
                            <div className="text-2xl font-extrabold text-white tracking-tight">
                              {curProg?.title || "Radio 90 FM Broadcast"}
                            </div>
                            <div className="text-xs text-neutral-300 space-y-1 mt-1">
                              {curProg?.startMinutes !== undefined && (
                                <div className="text-neutral-400 font-mono">
                                  Schedule Slot: {minutesToFormattedTime(curProg.startMinutes)} – {minutesToFormattedTime(curProg.endMinutes)}
                                </div>
                              )}
                            </div>
                          </div>

                          {currentProgData && (
                            <button
                              onClick={() => openEditModal(currentProgData)}
                              className="text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <span>✏️ Edit Program</span>
                            </button>
                          )}
                        </div>

                        {/* Features enabled */}
                        <div className="flex items-center space-x-2 pt-2 text-xs">
                          {curProg?.enableCall ? (
                            <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded-lg">
                              📞 Calls Enabled
                            </span>
                          ) : (
                            <span className="bg-neutral-950 border border-neutral-800 text-neutral-500 px-2.5 py-1 rounded-lg">
                              📞 Calls Off
                            </span>
                          )}

                          {curProg?.enableWhatsapp ? (
                            <span className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2.5 py-1 rounded-lg">
                              💬 WhatsApp Enabled
                            </span>
                          ) : (
                            <span className="bg-neutral-950 border border-neutral-800 text-neutral-500 px-2.5 py-1 rounded-lg">
                              💬 WhatsApp Off
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* UP NEXT SHOW CARD WITH DIRECT EDIT BUTTON */}
                <div className="bg-neutral-900 border border-neutral-800/90 rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
                      <div className="text-xs uppercase font-bold text-neutral-400 tracking-wider flex items-center gap-2">
                        <span>⏭️</span>
                        <span>UP NEXT IN SCHEDULE</span>
                      </div>

                      {nextProgData && (
                        <button
                          onClick={() => openEditModal(nextProgData)}
                          className="text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3 py-1.5 rounded-xl transition shadow-md flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <span>✏️ Edit Up Next Program</span>
                        </button>
                      )}
                    </div>

                    {(() => {
                      const nextProg = onAir?.nextProgram || onAir?.data?.nextProgram;
                      return nextProg ? (
                        <div className="space-y-2 pt-1">
                          <div className="text-xl font-bold text-white tracking-tight">
                            {nextProg.title}
                          </div>
                          <div className="text-xs text-neutral-300 space-y-1">
                            {nextProg.startMinutes !== undefined && (
                              <div className="text-neutral-400 font-mono">
                                Scheduled Time: {minutesToFormattedTime(nextProg.startMinutes)} {nextProg.endMinutes !== undefined ? `– ${minutesToFormattedTime(nextProg.endMinutes)}` : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-neutral-400 italic pt-2">
                          Continuous broadcast streaming.
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE MANAGER */}
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
                      placeholder="Search program by title..."
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


                        </div>

                        <div className="flex items-center space-x-3 self-end sm:self-center">
                          <div className="flex items-center space-x-2 text-xs font-medium mr-2">
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
                            onClick={() => openEditModal(p)}
                            className="text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3.5 py-2 rounded-xl transition"
                          >
                            Edit
                          </button>

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
                            <td className="px-4 py-3 text-emerald-400 font-medium">
                              {[p.enableCall && "Calls", p.enableWhatsapp && "WhatsApp"]
                                .filter(Boolean)
                                .join(", ") || "None"}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => openEditModal(p)}
                                className="text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-2.5 py-1 rounded-md"
                              >
                                Edit
                              </button>
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

          {/* BROADCAST PUSH NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center text-red-500 text-xl font-bold">
                    📢
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">Broadcast Push Notifications</h3>
                    <p className="text-xs text-neutral-400">
                      Send real-time alerts and announcements to all mobile app listeners instantly.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800 w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifType("standard");
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      notifType === "standard"
                        ? "bg-red-600 text-white shadow-md"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span>📢 Standard Announcement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifType("app_update");
                      if (!notifTitle) setNotifTitle("🎉 New App Update Available!");
                      if (!notifMessage) setNotifMessage("A new version of Radio 90 FM is now available on the App Store & Play Store. Tap to update now!");
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      notifType === "app_update"
                        ? "bg-purple-600 text-white shadow-md"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    <span>📲 App Update Alert</span>
                  </button>
                </div>

                <form onSubmit={handleSendBroadcastNotif} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                      Notification Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={notifType === "app_update" ? "e.g. 🎉 New App Update Available!" : "e.g. Special Live Broadcast Starting Now!"}
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 placeholder-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1.5">
                      Message / Announcement *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={notifType === "app_update" ? "e.g. A new version of Radio 90 FM is now available. Tap to update!" : "e.g. Tune in to Radio 90 FM for live interaction!"}
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 placeholder-neutral-600"
                    ></textarea>
                  </div>

                  {notifType === "app_update" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-950/20 border border-purple-900/40 p-4 rounded-xl">
                      <div>
                        <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                          Store / Update Link (URL) *
                        </label>
                        <input
                          type="text"
                          required
                          value={notifActionUrl}
                          onChange={(e) => setNotifActionUrl(e.target.value)}
                          placeholder="e.g. https://onelink.to/243uae"
                          className="w-full bg-neutral-950 border border-purple-900/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-purple-300 mb-1.5">
                          Target Devices
                        </label>
                        <select
                          value={notifTargetPlatform}
                          onChange={(e: any) => setNotifTargetPlatform(e.target.value)}
                          className="w-full bg-neutral-950 border border-purple-900/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="all">All Devices (Auto Detect Store)</option>
                          <option value="android">Android Only (Play Store)</option>
                          <option value="ios">iOS Only (App Store)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={sendingNotif}
                    className={`w-full sm:w-auto font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer ${
                      notifType === "app_update"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-950/80"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-950/80"
                    }`}
                  >
                    {sendingNotif ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <span>{notifType === "app_update" ? "📲 Send App Update Notification" : "🚀 Send Broadcast Notification"}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Sent History Table */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Recent Broadcast Notifications
                  </h4>
                  <button
                    onClick={fetchNotificationsList}
                    className="text-xs text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 px-3 py-1 rounded-lg transition"
                  >
                    {loadingNotifsList ? "Refreshing..." : "🔄 Refresh List"}
                  </button>
                </div>

                {notificationsList.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-neutral-800 rounded-xl">
                    <p className="text-xs text-neutral-500">No broadcast notifications sent yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-neutral-950 text-neutral-400 font-semibold border-b border-neutral-800">
                        <tr>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Title</th>
                          <th className="px-4 py-3">Message</th>
                          <th className="px-4 py-3">Action / Link</th>
                          <th className="px-4 py-3">Sent By</th>
                          <th className="px-4 py-3">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {notificationsList.map((notif: any) => (
                          <tr key={notif.id} className="hover:bg-neutral-850/50 transition">
                            <td className="px-4 py-3">
                              {notif.type === "app_update" ? (
                                <span className="bg-purple-950 border border-purple-800 text-purple-300 font-bold px-2 py-0.5 rounded text-[10px]">
                                  📲 App Update
                                </span>
                              ) : (
                                <span className="bg-neutral-950 border border-neutral-800 text-neutral-400 font-semibold px-2 py-0.5 rounded text-[10px]">
                                  📢 Standard
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 font-semibold text-white">{notif.title}</td>
                            <td className="px-4 py-3 text-neutral-300">{notif.message}</td>
                            <td className="px-4 py-3 text-purple-400 font-mono text-[11px] max-w-[150px] truncate">
                              {notif.actionUrl || "—"}
                            </td>
                            <td className="px-4 py-3 text-neutral-400">{notif.sentBy || "Admin"}</td>
                            <td className="px-4 py-3 text-neutral-500 font-mono">
                              {new Date(notif.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EDIT PROGRAM MODAL */}
          {editingProgramId && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
                {/* FOREGROUND LOADING SPINNER OVERLAY */}
                {savingProgramEdit && (
                  <div className="absolute inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-200">
                    <div className="relative flex items-center justify-center">
                      <div className="h-14 w-14 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
                      <span className="text-xl absolute">✏️</span>
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-bold text-white tracking-tight">Saving Changes & Syncing Data...</h4>
                      <p className="text-xs text-neutral-400">Updating database and fetching fresh broadcast schedule.</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Edit Broadcast Program
                  </h3>
                  <button onClick={() => setEditingProgramId(null)} className="text-neutral-400 hover:text-white" disabled={savingProgramEdit}>✕</button>
                </div>

                <form onSubmit={handleSaveProgramEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">Program Title *</label>
                    <input
                      type="text"
                      required
                      value={editProgTitle}
                      onChange={(e) => setEditProgTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>



                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">Broadcast Day</label>
                      <select
                        value={editProgDay}
                        onChange={(e) => setEditProgDay(Number(e.target.value))}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                      >
                        {daysOfWeek.map((day, idx) => (
                          <option key={idx} value={idx}>{day}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">Start Time</label>
                      <input
                        type="time"
                        required
                        value={editProgStartTime}
                        onChange={(e) => setEditProgStartTime(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">End Time</label>
                    <input
                      type="time"
                      required
                      value={editProgEndTime}
                      onChange={(e) => setEditProgEndTime(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div className="flex items-center space-x-6 pt-2">
                    <label className="flex items-center space-x-2 text-xs font-medium text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editProgEnableCall}
                        onChange={(e) => setEditProgEnableCall(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-700 text-red-600 focus:ring-red-600 bg-neutral-950"
                      />
                      <span>Enable Calls</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs font-medium text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editProgEnableWhatsapp}
                        onChange={(e) => setEditProgEnableWhatsapp(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-700 text-red-600 focus:ring-red-600 bg-neutral-950"
                      />
                      <span>Enable WhatsApp</span>
                    </label>
                  </div>

                  <div className="pt-3 flex justify-end space-x-3 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setEditingProgramId(null)}
                      className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
                      disabled={savingProgramEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProgramEdit}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {savingProgramEdit && (
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <span>{savingProgramEdit ? "Saving..." : "Save Changes"}</span>
                    </button>
                  </div>
                </form>
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

              {/* Active Override Status Banner */}
              {onAir?.isLiveOverride || onAir?.data?.isLiveOverride ? (
                <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-neutral-900 border border-red-600 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                        LIVE OVERRIDE IS CURRENTLY ACTIVE
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeactivateOverride}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
                    >
                      <span>⏹ Deactivate Live Override Now</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-800 pt-3">
                    <h3 className="text-base font-bold text-white">
                      {onAir?.currentProgram?.title || onAir?.data?.currentProgram?.title || "Special Live Override"}
                    </h3>

                  </div>
                </div>
              ) : (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Standard Automated Broadcast Schedule is currently active.</span>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleStartOverride}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Create / Schedule Live Override</h3>

                  {/* Mode Selector */}
                  <div className="flex items-center space-x-2 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setOverrideMode("instant")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        overrideMode === "instant"
                          ? "bg-red-600 text-white font-bold shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      ⚡ Start Immediately
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverrideMode("scheduled")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        overrideMode === "scheduled"
                          ? "bg-red-600 text-white font-bold shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      📅 Schedule Future Date & Time
                    </button>
                  </div>
                </div>

                <div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-400 mb-1">
                      Override Program Title *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Special Annual Sports Day Live"
                      required
                      value={overrideTitle}
                      onChange={(e) => setOverrideTitle(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                {overrideMode === "instant" ? (
                  <div className="flex items-center space-x-3 text-xs text-neutral-300 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                    <span className="font-semibold text-white">Broadcast Duration:</span>
                    <input
                      type="number"
                      min={5}
                      max={360}
                      value={overrideDurationMinutes}
                      onChange={(e) => setOverrideDurationMinutes(Number(e.target.value))}
                      className="w-24 bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-white text-center font-bold"
                    />
                    <span className="text-neutral-400">Minutes (starts right now)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/80">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        Start Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={overrideStartDateTime}
                        onChange={(e) => setOverrideStartDateTime(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-400 mb-1">
                        End Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={overrideEndDateTime}
                        onChange={(e) => setOverrideEndDateTime(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-6 pt-1 bg-neutral-950/60 p-3 rounded-xl border border-neutral-800/80">
                  <span className="text-xs font-semibold text-neutral-400">Interactive Actions:</span>
                  <label className="flex items-center space-x-2 text-xs font-medium text-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideEnableCall}
                      onChange={(e) => setOverrideEnableCall(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-700 text-red-600 focus:ring-red-600 bg-neutral-900"
                    />
                    <span>📞 Enable Call Live</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-medium text-neutral-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideEnableWhatsapp}
                      onChange={(e) => setOverrideEnableWhatsapp(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-700 text-emerald-600 focus:ring-emerald-600 bg-neutral-900"
                    />
                    <span>💬 Enable WhatsApp Live</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-red-950/80 cursor-pointer flex items-center space-x-2"
                  >
                    <span>
                      {overrideMode === "instant"
                        ? "🚀 Activate Live Override Now"
                        : "📅 Schedule Live Override"}
                    </span>
                  </button>

                  {(onAir?.isLiveOverride || onAir?.data?.isLiveOverride) && (
                    <button
                      type="button"
                      onClick={handleDeactivateOverride}
                      className="bg-neutral-800 hover:bg-neutral-700 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl transition cursor-pointer"
                    >
                      Deactivate Active Override
                    </button>
                  )}
                </div>
              </form>

              {/* OVERRIDES SCHEDULE & HISTORY TABLE */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span> Live Overrides List & Schedule
                  </h3>
                  <button
                    onClick={fetchOverridesList}
                    className="text-xs text-neutral-400 hover:text-white bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-700"
                  >
                    🔄 Refresh List
                  </button>
                </div>

                {overridesList.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 text-xs">
                    No active or scheduled live overrides found.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-neutral-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950 text-neutral-400 uppercase font-bold border-b border-neutral-800">
                        <tr>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Override Title</th>
                          <th className="px-4 py-3">Interactive Actions</th>
                          <th className="px-4 py-3">Start Time</th>
                          <th className="px-4 py-3">End Time</th>
                          <th className="px-4 py-3 text-right">Option</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {overridesList.map((item) => {
                          const now = new Date();
                          const sAt = new Date(item.startsAt);
                          const eAt = new Date(item.expiresAt);
                          const isActiveNow = item.enabled && sAt <= now && eAt >= now;
                          const isUpcoming = item.enabled && sAt > now;
                          const actionsText = [item.enableCall && "Calls", item.enableWhatsapp && "WhatsApp"]
                            .filter(Boolean)
                            .join(", ") || "None";

                          return (
                            <tr key={item.id} className="hover:bg-neutral-800/40 transition">
                              <td className="px-4 py-3">
                                {isActiveNow ? (
                                  <span className="bg-red-950 border border-red-800 text-red-400 px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center gap-1.5 w-max">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                                    LIVE NOW
                                  </span>
                                ) : isUpcoming ? (
                                  <span className="bg-amber-950 border border-amber-800 text-amber-300 px-2.5 py-1 rounded-full font-bold text-[10px] flex items-center gap-1.5 w-max">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                                    SCHEDULED
                                  </span>
                                ) : (
                                  <span className="bg-neutral-950 border border-neutral-800 text-neutral-500 px-2.5 py-1 rounded-full text-[10px] w-max block">
                                    EXPIRED
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 font-bold text-white">{item.title}</td>
                              <td className="px-4 py-3 text-emerald-400 font-medium">{actionsText}</td>
                              <td className="px-4 py-3 font-mono text-neutral-300">
                                {sAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                              </td>
                              <td className="px-4 py-3 font-mono text-neutral-300">
                                {eAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteOverrideItem(item.id)}
                                  className="text-red-400 hover:text-red-200 bg-red-950/40 border border-red-900/60 px-2.5 py-1 rounded-md transition"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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

          {/* TAB 7: SUPER ADMIN USER MANAGEMENT */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    👑 Admin User Management
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Super Admin Console • Create admin accounts, assign Super Admin roles, & manage permissions.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUserError("");
                    setUserSuccess("");
                    setShowAddUserModal(true);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-950/40 w-fit"
                >
                  <span>+ Create Admin Account</span>
                </button>
              </div>

              {loadingUsers ? (
                <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <p className="text-sm text-neutral-400">Loading admin user database...</p>
                </div>
              ) : usersList.length === 0 ? (
                <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <p className="text-sm text-neutral-400">No admin accounts found.</p>
                </div>
              ) : (
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-950/80 text-neutral-400 border-b border-neutral-800 uppercase tracking-wider font-semibold">
                        <tr>
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {usersList.map((usr) => {
                          const isTom = (usr.email || "").toLowerCase().includes("tomkurian") || (usr.name || "").toLowerCase().includes("tomkurian");
                          const isSuper = usr.role === "SUPER_ADMIN" || isTom;

                          return (
                            <tr key={usr.id} className="hover:bg-neutral-800/40 transition">
                              <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                                <span className="h-7 w-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs">
                                  {isSuper ? "👑" : "🛡️"}
                                </span>
                                {usr.name}
                              </td>
                              <td className="px-4 py-3.5 text-neutral-300 font-mono">{usr.email}</td>
                              <td className="px-4 py-3.5">
                                {isSuper ? (
                                  <span className="bg-amber-950 border border-amber-700/80 text-amber-300 px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                                    👑 SUPER ADMIN
                                  </span>
                                ) : (
                                  <span className="bg-red-950/60 border border-red-800/60 text-red-300 px-2.5 py-1 rounded-full font-semibold text-[10px] inline-flex items-center gap-1">
                                    🛡️ ADMIN
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5">
                                {usr.active ? (
                                  <span className="text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[10px]">
                                    ● Active
                                  </span>
                                ) : (
                                  <span className="text-neutral-500 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded-full text-[10px]">
                                    ○ Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-neutral-400 font-mono text-[11px]">
                                {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString("en-IN") : "—"}
                              </td>
                              <td className="px-4 py-3.5 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setResetUserTarget(usr);
                                    setResetUserNewPassword("");
                                    setResetUserConfirmPassword("");
                                    setResetUserError("");
                                    setResetUserSuccess("");
                                    setShowResetUserModal(true);
                                  }}
                                  className="text-cyan-400 hover:text-cyan-200 bg-cyan-950/40 border border-cyan-900/60 px-2.5 py-1 rounded-md transition text-[11px]"
                                  title={`Reset password for ${usr.name}`}
                                >
                                  🔑 Reset Password
                                </button>
                                {!isTom && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateUserRole(usr.id, isSuper ? "ADMIN" : "SUPER_ADMIN")}
                                      className="text-amber-400 hover:text-amber-200 bg-amber-950/40 border border-amber-900/60 px-2.5 py-1 rounded-md transition text-[11px]"
                                    >
                                      {isSuper ? "Make Admin" : "Make Super Admin"}
                                    </button>
                                    <button
                                      onClick={() => handleToggleUserActive(usr.id, usr.active)}
                                      className="text-neutral-300 hover:text-white bg-neutral-800 border border-neutral-700 px-2.5 py-1 rounded-md transition text-[11px]"
                                    >
                                      {usr.active ? "Deactivate" : "Activate"}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(usr.id, usr.name)}
                                      className="text-red-400 hover:text-red-200 bg-red-950/40 border border-red-900/60 px-2.5 py-1 rounded-md transition text-[11px]"
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* SUPER ADMIN RESET USER PASSWORD MODAL */}
      {showResetUserModal && resetUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🔑 Reset Password for {resetUserTarget.name}
              </h3>
              <button
                onClick={() => {
                  setShowResetUserModal(false);
                  setResetUserTarget(null);
                }}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-400">
              Super Admin Reset: Set a new password for <span className="text-white font-semibold">{resetUserTarget.email}</span>.
            </p>

            {resetUserError && (
              <div className="p-3 text-xs bg-red-950/80 border border-red-800 text-red-200 rounded-xl">
                {resetUserError}
              </div>
            )}
            {resetUserSuccess && (
              <div className="p-3 text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl">
                {resetUserSuccess}
              </div>
            )}

            <form onSubmit={handleSuperAdminResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={resetUserNewPassword}
                  onChange={(e) => setResetUserNewPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={resetUserConfirmPassword}
                  onChange={(e) => setResetUserConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetUserModal(false);
                    setResetUserTarget(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resettingUserPass}
                  className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition disabled:opacity-50"
                >
                  {resettingUserPass ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                🔑 Change Your Password
              </h3>
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {changePassError && (
              <div className="p-3 text-xs bg-red-950/80 border border-red-800 text-red-200 rounded-xl">
                {changePassError}
              </div>
            )}
            {changePassSuccess && (
              <div className="p-3 text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl">
                {changePassSuccess}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-red-600"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPass}
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition disabled:opacity-50"
                >
                  {changingPass ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW ADMIN USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                👑 Create New Admin Account
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {userError && (
              <div className="p-3 text-xs bg-red-950/80 border border-red-800 text-red-200 rounded-xl">
                {userError}
              </div>
            )}
            {userSuccess && (
              <div className="p-3 text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl">
                {userSuccess}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="admin@amaljyothi.ac.in"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Account Privilege Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ADMIN">🛡️ Standard Admin</option>
                  <option value="SUPER_ADMIN">👑 Super Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition disabled:opacity-50"
                >
                  {creatingUser ? "Creating..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
