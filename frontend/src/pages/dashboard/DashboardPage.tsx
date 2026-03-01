import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Settings, ChevronDown, User, Trophy, BarChart2,
  Bell, LogOut, Flame, Lock, ArrowRight,
  CheckCircle2, Star, Activity, Flag, TrendingUp, Clock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { logout, getMe } from "@/services/authService";
import CustomShield from "@/components/CustomShield";

// ── Subcomponents ─────────────────────────────────────────────────────────────

function CircularScore({ score }: { score: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
      <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="5" />
        <motion.circle
          cx="36" cy="36" r={radius} fill="none"
          stroke="#06b6d4" strokeWidth="5"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 6px #06b6d4)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold text-white">{score}%</span>
      </div>
    </div>
  );
}

const DROPDOWN_ITEMS = [
  { icon: User, label: "View Profile", path: "/profile" },
  { icon: Trophy, label: "My Titles", path: "/profile/titles" },
  { icon: BarChart2, label: "Statistics", path: "/profile/stats" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, clearUser, setUser } = useAuthStore();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from API on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getMe();
        setUser(userData);
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        setError(err.message || 'Failed to load user data');
        // If unauthorized, redirect to login
        if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
          clearUser();
          navigate('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [setUser, clearUser, navigate]);

  // Calculate player data from user object
  const player = user ? {
    name: user.name,
    level: user.level || 1,
    xp: user.xp || 0,
    xpRequired: (user.level || 1) * 100,
    streak: user.streak || 0,
    coins: user.coins || 0,
    securityScore: 0,
    titles: [] as string[],
    vaultsCompleted: 0,
    totalVaults: 5,
    recentActivity: null as string | null,
    ctfChallenge: {
      title: "Suspicious Login Alert",
      difficulty: "Medium",
      xpReward: 50,
      coinsReward: 30,
      expiresAt: new Date(Date.now() + 14 * 60 * 60 * 1000), // 14 hours from now
      solved: false,
    },
  } : null;

  // Countdown timer state for CTF
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    if (!player?.ctfChallenge.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = player.ctfChallenge.expiresAt.getTime() - now;

      if (distance < 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [player?.ctfChallenge.expiresAt]);

  useEffect(() => {
    const close = () => setDropdownOpen(false);
    if (dropdownOpen) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearUser();
      navigate("/auth/login");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <CustomShield size={48} className="text-cyan-400 mx-auto mb-4" />
          </motion.div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-center max-w-md">
          <CustomShield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-400 mb-4">{error || 'User data not available'}</p>
          <button
            onClick={() => navigate('/auth/login')}
            className="px-6 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const xpPct = Math.min((player.xp / player.xpRequired) * 100, 100);
  const vaultPct = Math.min((player.vaultsCompleted / player.totalVaults) * 100, 100);

  const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
  });

  const cardStyle = {
    background: "rgba(6,182,212,0.03)",
    border: "1px solid rgba(6,182,212,0.15)",
    boxShadow: "0 0 30px rgba(6,182,212,0.04)",
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
        style={{ background: "rgba(10,10,15,0.95)", borderBottom: "1px solid rgba(6,182,212,0.1)", backdropFilter: "blur(12px)" }}>

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <CustomShield size={32} className="text-cyan-400" style={{ filter: "drop-shadow(0 0 8px #06b6d4)" }} />
          <div>
            <div className="text-2xl font-bold leading-none tracking-tight">
              <span className="text-white">Phish</span>
              <span className="text-cyan-400">Pulse</span>
            </div>
            <div className="text-xs" style={{ color: "#475569", letterSpacing: "0.1em" }}>Command Center</div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Gear */}
          <motion.button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-lg transition-all"
            style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", color: "#94a3b8" }}
            whileHover={{ borderColor: "rgba(6,182,212,0.4)", color: "#06b6d4", scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings size={18} />
          </motion.button>

          {/* Player dropdown */}
          <div className="relative">
            <motion.button
              onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)" }}
              whileHover={{ borderColor: "rgba(6,182,212,0.4)" }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)" }}>
                <User size={14} className="text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-white">{player.name}</span>
              <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} style={{ color: "#64748b" }} />
              </motion.div>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden"
                  style={{ background: "#0d1117", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(6,182,212,0.1)" }}>
                    <p className="text-sm font-semibold text-white">{player.name}</p>
                    <p className="text-xs" style={{ color: "#475569" }}>Level {player.level} Agent</p>
                  </div>

                  <div className="py-1">
                    {DROPDOWN_ITEMS.map((item) => (
                      <button key={item.label}
                        onClick={() => { navigate(item.path); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left"
                        style={{ color: "#94a3b8" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(6,182,212,0.06)"; e.currentTarget.style.color = "#f8fafc"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}
                      >
                        <item.icon size={15} />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid rgba(6,182,212,0.1)" }} className="py-1">
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left"
                      style={{ color: "#ef4444" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <LogOut size={15} />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div className="max-w-7xl mx-auto px-8 py-8">

        {/* Welcome */}
        <motion.div variants={fadeUp(0)} initial="hidden" animate="visible" className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, <span className="text-cyan-400">{player.name.split(" ")[0]}</span>!
          </h1>
          <p className="text-sm" style={{ color: "#475569" }}>Your PhishPulse command center is ready.</p>

          {/* Title badges */}
          <div className="flex items-center gap-2 mt-3">
            {player.titles.length === 0 ? (
              <span className="text-xs px-3 py-1 rounded-full" style={{ color: "#475569", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                No titles yet — complete vaults to earn titles
              </span>
            ) : (
              player.titles.map((t) => (
                <span key={t} className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ color: "#06b6d4", background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  {t}
                </span>
              ))
            )}
          </div>
        </motion.div>

        {/* ── Stats Strip ── */}
        <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible"
          className="grid grid-cols-4 gap-4 mb-8">

          {/* Level + XP */}
          <div className="col-span-2 rounded-xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-cyan-400" />
                <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>Level</span>
              </div>
              <span className="text-xs" style={{ color: "#475569" }}>{player.xp} / {player.xpRequired} XP</span>
            </div>
            <div className="text-3xl font-bold text-white mb-3">{player.level}</div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #0891b2, #06b6d4)", boxShadow: "0 0 10px rgba(6,182,212,0.5)" }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: "#475569" }}>{player.xpRequired - player.xp} XP to next level</p>
          </div>

          {/* Streak */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={16} style={{ color: "#f59e0b" }} />
              <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>Streak</span>
            </div>
            <div className="text-3xl font-bold text-white">{player.streak}</div>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>days</p>
          </div>

          {/* Coins */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} style={{ color: "#f59e0b" }} />
              <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>Coins</span>
            </div>
            <div className="text-3xl font-bold text-white">{player.coins}</div>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>earned</p>
          </div>
        </motion.div>

        {/* ── Hero Cards ── */}
        <motion.div variants={fadeUp(0.2)} initial="hidden" animate="visible"
          className="grid grid-cols-2 gap-6 mb-8">

          {/* Vault Realm */}
          <motion.div
            className="relative rounded-2xl p-7 cursor-pointer overflow-hidden"
            style={{
              background: "rgba(6,182,212,0.04)",
              border: "1px solid rgba(6,182,212,0.2)",
              boxShadow: "0 0 40px rgba(6,182,212,0.06)",
            }}
            whileHover={{ borderColor: "rgba(6,182,212,0.5)", boxShadow: "0 0 50px rgba(6,182,212,0.12)", scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate("/vault-realm")}
          >
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top left, rgba(6,182,212,0.06) 0%, transparent 70%)" }} />

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <Shield size={28} className="text-cyan-400" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Vault Realm</h2>
                  <p className="text-sm" style={{ color: "#64748b" }}>Phishing training missions</p>
                </div>
              </div>
              <motion.div
                className="p-2 rounded-lg"
                style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", color: "#06b6d4" }}
                whileHover={{ scale: 1.1 }}
              >
                <ArrowRight size={18} />
              </motion.div>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs" style={{ color: "#94a3b8" }}>Vaults Completed</span>
                <span className="text-xs font-semibold text-white">{player.vaultsCompleted} / {player.totalVaults}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #0891b2, #06b6d4)", boxShadow: "0 0 8px rgba(6,182,212,0.4)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${vaultPct}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Difficulty breakdown */}
            <div className="flex gap-2">
              {[
                { label: "Beginner", color: "#3b82f6" },
                { label: "Intermediate", color: "#f59e0b" },
                { label: "Advanced", color: "#ef4444" },
                { label: "Expert", color: "#7c3aed" },
              ].map((d) => (
                <span key={d.label} className="text-xs px-2 py-1 rounded"
                  style={{ background: `${d.color}15`, border: `1px solid ${d.color}40`, color: d.color }}>
                  {d.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Incident Gate */}
          <motion.div
            className="relative rounded-2xl p-7 cursor-pointer overflow-hidden"
            style={{
              background: "rgba(239,68,68,0.03)",
              border: "1px solid rgba(239,68,68,0.2)",
              boxShadow: "0 0 40px rgba(239,68,68,0.04)",
            }}
            whileHover={{ borderColor: "rgba(239,68,68,0.4)", scale: 1.01 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate("/incident-gate")}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top right, rgba(239,68,68,0.05) 0%, transparent 70%)" }} />

            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <Lock size={28} style={{ color: "#ef4444" }} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Incident Gate</h2>
                  <p className="text-sm" style={{ color: "#ef4444" }}>
                    Live incident simulations
                  </p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                0 / 2 Unlocked
              </span>
            </div>

            <p className="text-sm mb-6" style={{ color: "#475569" }}>
              Complete vaults and level up to unlock incident simulations.
            </p>

            <motion.div
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "#ef4444" }}
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              Enter Gate <ArrowRight size={16} />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Bottom Row ── */}
        <motion.div variants={fadeUp(0.3)} initial="hidden" animate="visible"
          className="grid grid-cols-2 gap-5">

          {/* CTF Daily Challenge */}
          <motion.div
            variants={fadeUp(0.3)}
            initial="hidden"
            animate="visible"
            className="rounded-2xl p-6 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(239,68,68,0.15) 100%)",
              border: "2px solid rgba(245,158,11,0.5)",
              boxShadow: "0 0 40px rgba(245,158,11,0.2)"
            }}
            whileHover={{ boxShadow: "0 0 60px rgba(245,158,11,0.4)", scale: 1.01 }}
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flag size={16} style={{ color: "#f59e0b" }} />
                <span className="font-bold text-sm" style={{ color: "#f59e0b" }}>CTF Challenge</span>
              </div>
              <motion.div
                className="px-2 py-0.5 rounded-full text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🔥 NEW DAILY
              </motion.div>
            </div>

            <h3 className="text-white font-bold text-lg mb-2">
              {player.ctfChallenge.title}
            </h3>

            <div className="flex items-center gap-3 mb-2 text-sm">
              <span className="text-yellow-400 font-semibold">🏆 XP: {player.ctfChallenge.xpReward}</span>
              <span className="text-amber-400 font-semibold">🪙 Coins: {player.ctfChallenge.coinsReward}</span>
            </div>

            <p className="text-xs mb-4 flex items-center gap-1" style={{ color: "#ef4444" }}>
              <Clock size={11} />
              Expires in {timeRemaining}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 rounded font-semibold"
                style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#f59e0b" }}>
                {player.ctfChallenge.difficulty}
              </span>
              <motion.button
                onClick={() => navigate("/ctf")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", boxShadow: "0 0 15px rgba(245,158,11,0.4)" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Flag size={14} />
                View Challenge →
              </motion.button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="rounded-xl p-5" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Activity size={15} className="text-cyan-400" />
              <span className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Recent Activity</span>
            </div>
            {player.recentActivity
              ? <p className="text-sm text-white">{player.recentActivity}</p>
              : (
                <div className="flex flex-col items-center justify-center py-4 gap-2">
                  <TrendingUp size={24} style={{ color: "#1e293b" }} />
                  <p className="text-xs text-center" style={{ color: "#475569" }}>No activity yet — complete your first vault</p>
                </div>
              )
            }
          </div>
        </motion.div>

        {/* Security Score — floating bottom right */}
        <motion.div
          variants={fadeUp(0.4)} initial="hidden" animate="visible"
          className="fixed bottom-8 right-8 flex items-center gap-4 px-5 py-4 rounded-2xl"
          style={{ background: "#0d1117", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}
        >
          <CircularScore score={player.securityScore} />
          <div>
            <p className="text-xs font-semibold text-white">Security Score</p>
            <p className="text-xs" style={{ color: "#475569" }}>Overall accuracy</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}