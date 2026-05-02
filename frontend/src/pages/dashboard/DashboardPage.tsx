import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield as ShieldIcon,
  Flame as FlameIcon,
  Star as StarIcon,
  Activity as ActivityIcon,
  Zap as ZapIcon,
  Vault as VaultIcon,
  ChevronRight,
  Swords as SwordsIcon,
  ArrowUpRight,
  AlertTriangle,
  X as XIcon,
  ShieldCheck as ShieldCheckIcon,
  Heart as HeartIcon,
  Trophy as TrophyIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logout, getMe } from '@/services/authService';
import { getDailyChallenge } from '@/services/ctfService';
import type { CTFChallenge } from '@/services/ctfService';
import CustomShield from '@/components/CustomShield';
import AppHeader from '@/components/layout/AppHeader';
import Sidebar from '@/components/layout/Sidebar';
import StoreDrawer from '@/components/layout/StoreDrawer';

const BRAND_CYAN = '#06b6d4';

/* ─── Circular Progress ─────────────────────────────────── */
const CircularProgress = ({
  value, size = 120, strokeWidth = 8, label = 'Security Score', trend,
}: {
  value: number; size?: number; strokeWidth?: number; label?: string; trend?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-800" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={BRAND_CYAN} strokeWidth={strokeWidth} fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="flex items-baseline gap-0.5">
          <span className={`${size > 75 ? 'text-3xl' : 'text-xl'} font-black text-white`}>{value}</span>
          {trend && <span className="text-[8px] text-green-400 font-bold mb-1">{trend}</span>}
        </div>
        <span className="text-[10px] uppercase tracking-[0.1em] text-slate-500 font-bold leading-none">{label}</span>
      </div>
    </div>
  );
};

/* ─── Health Card ─────────────────────────────────────────── */
const HealthCard = ({ currentHp = 80, maxHp = 100 }: { currentHp?: number; maxHp?: number }) => {
  const percentage = (currentHp / maxHp) * 100;
  const segments = 10;
  const filledSegments = Math.ceil((currentHp / maxHp) * segments);

  const getColorClass = () => {
    if (percentage > 70) return 'bg-green-500 shadow-[0_0_10px_#22c55e]';
    if (percentage > 40) return 'bg-yellow-500 shadow-[0_0_10px_#eab308]';
    if (percentage > 20) return 'bg-orange-500 shadow-[0_0_10px_#f97316]';
    return 'bg-red-500 shadow-[0_0_10px_#ef4444]';
  };

  const getTextColorClass = () => {
    if (percentage > 70) return 'text-green-400';
    if (percentage > 40) return 'text-yellow-400';
    if (percentage > 20) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-[#0f172a]/80 border border-cyan-500/10 p-5 rounded-2xl backdrop-blur-xl group transition-all"
    >
      <div className="flex flex-col h-full">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">Integrity Levels</p>
        <div className="flex items-center gap-3">
          <HeartIcon className={`w-6 h-6 ${getTextColorClass()}`} strokeWidth={2.5} fill="currentColor" fillOpacity={0.2} />
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black ${getTextColorClass()}`}>{currentHp}</span>
            <span className="text-xs text-slate-500 font-bold">/ {maxHp} HP</span>
          </div>
        </div>
        <div className="mt-4 flex gap-1 items-end">
          {Array.from({ length: segments }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scaleY: 0.5, opacity: 0.5 }}
              animate={{ scaleY: i < filledSegments ? 1 : 0.8, opacity: i < filledSegments ? 1 : 0.2 }}
              className={`h-2 flex-1 rounded-sm transition-all duration-500 ${i < filledSegments ? getColorClass() : 'bg-slate-800'}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Stat Card ───────────────────────────────────────────── */
const StatCard = ({
  icon: Icon, label, value, subtext, color = 'cyan', progress,
}: {
  icon: any; label: string; value: string | number; subtext?: string; color?: string; progress?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-[#0f172a]/80 border border-cyan-500/10 p-5 rounded-2xl backdrop-blur-xl group transition-all"
  >
    <div className="flex flex-col h-full">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-black ${color === 'yellow' ? 'text-yellow-400' : color === 'orange' ? 'text-orange-400' : 'text-white'}`}>
          {value}
        </span>
      </div>
      {progress !== undefined ? (
        <>
          <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
            />
          </div>
          <p className="text-[10px] text-right mt-2 text-slate-500 font-bold uppercase tracking-tight">{subtext}</p>
        </>
      ) : (
        <div className="mt-4">
          {subtext === '+1 today' ? (
            <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded font-bold uppercase">Active Today</span>
          ) : (
            <p className="text-[10px] text-slate-500 font-bold uppercase">{subtext}</p>
          )}
        </div>
      )}
    </div>
  </motion.div>
);

/* ─── Dashboard Page ──────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, health: currentHp, setUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [dailyChallenge, setDailyChallenge] = useState<CTFChallenge | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  const [showDefenseTooltip, setShowDefenseTooltip] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  /* Fetch real data on mount */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, challenge] = await Promise.all([
          getMe(),
          getDailyChallenge().catch(() => null),
        ]);
        setUser(userData);
        setDailyChallenge(challenge);
      } catch {
        // Global axios interceptor handles 401 → redirect to /auth/login
        // No need to duplicate the redirect logic here
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setUser]);

  /* Countdown timer */
  useEffect(() => {
    if (!dailyChallenge?.expires_at) return;
    const updateTime = () => {
      const now = new Date();
      const expires = new Date(dailyChallenge.expires_at!);
      const diff = expires.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft('00:00:00'); return; }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [dailyChallenge]);

  // Re-evaluate every second by including `timeLeft` in the dep array.
  // `timeLeft` is updated every second by the countdown interval, so this
  // useMemo will re-run on each tick and never go stale.
  const isCriticalTime = useMemo(() => {
    if (!dailyChallenge?.expires_at) return false;
    return new Date(dailyChallenge.expires_at).getTime() - Date.now() < 5 * 60 * 1000;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyChallenge, timeLeft]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } catch {}
    setUser(null);
    navigate('/auth/login');
  };


  /* ── Loading screen ── */
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <CustomShield className="text-cyan-400 w-12 h-12 mx-auto mb-4" strokeWidth={1.5} />
          </motion.div>
          <p className="text-white text-lg font-medium">Loading your command center...</p>
        </div>
      </div>
    );
  }

  /* Derived values */
  const xpToNextLevel = user.level * 100;
  const xpPct = Math.min((user.xp / xpToNextLevel) * 100, 100);
  // HP mapped from level progress as a fun stat (80–100 range)
  // currentHp comes from useAuthStore above — real persisted health

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 flex overflow-x-hidden">
      <Sidebar
        activeTab="dashboard"
        onStoreClick={() => setIsStoreOpen(true)}
        onLogout={handleLogout}
        userName={user.name}
        userAvatarSeed={user.avatar_seed || 'agent-one'}
        userAvatarStyle={user.avatar_style || 'avataaars'}
      />

      {/* Main Content */}
      <div className="flex-1 ml-16 transition-all duration-300">
        {/* Top Header */}
        <AppHeader 
          user={user} 
          xpToNextLevel={xpToNextLevel} 
          xpPct={xpPct} 
          userAvatarSeed={user.avatar_seed || 'agent-one'}
          userAvatarStyle={user.avatar_style || 'avataaars'}
        />

        <main className="p-8 lg:p-14 max-w-[1500px] mx-auto">
          {/* Welcome Banner */}
          <section className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-white leading-tight">
                Welcome back, {user.name.split(' ')[0]}
              </h2>
              <div className="flex items-center gap-3 mt-4">
                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center gap-2">
                  <ActivityIcon size={12} className="text-cyan-400" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Outstanding Posture</span>
                </div>
                <p className="text-slate-500 text-sm font-medium">
                  No vulnerabilities detected in the last <span className="text-white font-bold">24h</span>.
                </p>
              </div>
            </motion.div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/leaderboard')}
                className="px-6 py-3 text-xs font-black uppercase tracking-[0.2em] border border-cyan-500/30 text-cyan-400 rounded-xl hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all bg-cyan-400/5 backdrop-blur-md"
              >
                Leaderboard
              </button>
            </div>
          </section>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            <HealthCard currentHp={currentHp} maxHp={100} />
            <StatCard
              icon={FlameIcon}
              label="Active Streak"
              value={`${user.streak} DAYS`}
              subtext="+1 today"
              color="orange"
            />
            <StatCard
              icon={StarIcon}
              label="Pulse Credits"
              value={user.coins.toLocaleString()}
              subtext="EARN IN DAILY CTF"
              color="yellow"
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0f172a]/80 border border-cyan-500/10 p-6 rounded-2xl backdrop-blur-xl flex items-center justify-between shadow-xl"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-3">XP Progress</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-black text-white">{user.xp}</span>
                  <span className="text-[10px] text-cyan-400 font-black ml-1 uppercase tracking-widest">XP</span>
                </div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="4" />
                  <motion.circle
                    cx="18" cy="18" r="16" fill="none" className="stroke-cyan-400"
                    strokeWidth="4" strokeDasharray="100 100"
                    initial={{ strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: 100 - xpPct }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheckIcon className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="w-full h-px bg-white/5 mb-14" />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-14">
              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => navigate('/vault-realm')}
                  className="group h-[200px] bg-[#0f172a]/80 border border-cyan-500/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden transition-all shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/40 cursor-pointer"
                >
                  <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-10 transition-all duration-700">
                    <ShieldIcon className="w-48 h-48 text-cyan-400" />
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                      <VaultIcon className="w-10 h-10 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]" />
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">Vault Realm</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                      Status: <span className="text-cyan-400">0/5 Deployed</span>
                    </p>
                    <div className="mt-6 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 w-0 group-hover:w-[15%] transition-all duration-1000" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="group h-[200px] bg-[#1a1410]/80 border border-orange-500/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden transition-all shadow-lg hover:shadow-orange-500/10 hover:border-orange-500/40"
                >
                  <div className="absolute top-5 right-5">
                    <span className="text-[9px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-orange-500/20">
                      RESTRICTED_ACCESS
                    </span>
                  </div>
                  <div className="w-12 h-12 flex items-center justify-center text-orange-400 mb-6 opacity-40">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black text-white opacity-30 uppercase tracking-tight">Incident Gate</h4>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1 opacity-50">
                    Complex breach telemetry simulations
                  </p>
                </motion.div>
              </div>

              {/* Daily CTF Hero Card */}
              <div className="relative group">
                <div className="absolute -inset-[3px] bg-gradient-to-r from-purple-600 via-cyan-400 to-pink-600 rounded-[28px] opacity-40 blur-[4px]" style={{ animation: 'pulse-slow 5s infinite ease-in-out' }} />
                <div className="relative h-auto md:h-[420px] bg-[#0d1117] rounded-[25px] overflow-hidden p-10 flex flex-col shadow-2xl">
                  <div className="absolute inset-0 pointer-events-none opacity-5" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)', backgroundSize: '100% 4px' }} />

                  {dailyChallenge ? (
                    <>
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <span className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_0_20px_rgba(239,68,68,0.6)]" style={{ animation: 'bounce-slow 2s infinite ease-in-out' }}>
                              MISSION_RECLAIM_PROTOCOL
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OP: GHOST_SHELL</span>
                          </div>
                          <h3 className="text-5xl font-black text-white mt-4 tracking-tighter drop-shadow-2xl">
                            {dailyChallenge.title}
                          </h3>
                          <p className="text-slate-400 max-w-lg text-sm mt-4 font-medium leading-relaxed">
                            {dailyChallenge.description.split('\n\n')[0] || dailyChallenge.description}
                          </p>
                        </div>
                        {dailyChallenge.expires_at && (
                          <div className="text-left md:text-right bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
                            <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mb-2">Operation Expiration</p>
                            <p className={`text-4xl font-mono font-black ${isCriticalTime ? 'text-red-500' : 'text-cyan-400'}`}>
                              {timeLeft}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-10 md:mt-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10 relative z-10">
                        <div className="flex gap-12">
                          <div className="flex flex-col gap-3">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Difficulty</p>
                            <span className={`text-sm font-black px-3 py-1 rounded-lg ${
                              dailyChallenge.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10 border border-green-400/30'
                              : dailyChallenge.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30'
                              : 'text-red-400 bg-red-400/10 border border-red-400/30'
                            }`}>
                              {dailyChallenge.difficulty}
                            </span>
                          </div>
                          <div className="flex flex-col gap-3">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Tactical Rewards</p>
                            <div className="flex gap-3">
                              <span className="text-[11px] font-black text-cyan-400 border border-cyan-400/30 px-3 py-1.5 rounded-lg bg-cyan-400/5">
                                +{dailyChallenge.xp_reward} XP
                              </span>
                              <span className="text-[11px] font-black text-yellow-500 border border-yellow-500/30 px-3 py-1.5 rounded-lg bg-yellow-500/5">
                                +{dailyChallenge.coins_reward} CR
                              </span>
                            </div>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05, filter: 'brightness(1.2)' }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate('/ctf')}
                          className="w-full md:w-auto px-10 py-5 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_15px_40px_rgba(6,182,212,0.4)] flex items-center justify-center gap-3"
                        >
                          {dailyChallenge.solved ? 'View Challenge' : 'Initiate Breach'} <ArrowUpRight className="w-6 h-6 stroke-[3]" />
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4 relative z-10">
                      <SwordsIcon className="w-16 h-16 text-slate-700" />
                      <p className="text-white font-bold text-xl">No Active Challenge</p>
                      <p className="text-slate-500 text-sm">Check back soon — a new daily CTF will be posted.</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/ctf')}
                        className="mt-4 px-8 py-4 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl"
                      >
                        View Past Challenges
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Stats Panel */}
              <section className="bg-[#0f172a]/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-3">
                    <TrophyIcon className="w-5 h-5 text-yellow-400" />
                    Agent Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/30 border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Level Progress</span>
                      <span className="text-[10px] font-black text-cyan-400">{user.xp} / {xpToNextLevel} XP</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPct}%` }}
                        transition={{ duration: 1.2 }}
                        className="h-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] text-slate-600 font-bold uppercase">LVL {user.level}</span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase">LVL {user.level + 1}</span>
                    </div>
                  </div>

                  {[
                    { label: 'Total XP', value: user.xp.toLocaleString(), color: 'text-cyan-400' },
                    { label: 'Pulse Credits', value: user.coins.toLocaleString(), color: 'text-yellow-400' },
                    { label: 'Day Streak', value: `${user.streak} days`, color: 'text-orange-400' },
                    { label: 'Role', value: user.role, color: 'text-slate-300' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                      <span className={`text-sm font-black ${stat.color} uppercase tracking-tight`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Quick Actions */}
              <section className="bg-[#0f172a]/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
                <h3 className="text-xl font-black text-white tracking-tighter mb-6 flex items-center gap-3">
                  <ZapIcon className="w-5 h-5 text-cyan-400" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'CTF Challenges', path: '/ctf', icon: SwordsIcon, color: 'text-purple-400' },
                    { label: 'Leaderboard', path: '/leaderboard', icon: TrophyIcon, color: 'text-yellow-400' },
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(action.path)}
                      className="w-full p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between group hover:border-cyan-400/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                        <span className="text-[11px] font-black text-white uppercase tracking-[0.1em]">{action.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Store Drawer */}
              <StoreDrawer
                isOpen={isStoreOpen}
                onClose={() => setIsStoreOpen(false)}
                userCoins={user.coins}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Defense Pulse Widget — Bottom Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 1 }}
        whileHover={{ scale: 1.03 }}
        onHoverStart={() => setShowDefenseTooltip(true)}
        onHoverEnd={() => setShowDefenseTooltip(false)}
        className="fixed bottom-10 right-10 z-[60] cursor-pointer"
      >
        <AnimatePresence>
          {showDefenseTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-[70] whitespace-nowrap overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
              <p className="text-[10px] font-black text-white uppercase tracking-[0.1em]">
                Level <span className="text-cyan-400">{user.level}</span> | <span className="text-green-400">{user.xp} XP</span>
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-slate-900/95" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative p-5 bg-[#0d1117]/80 backdrop-blur-2xl border border-cyan-400/20 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(6,182,212,0.25)] flex items-center gap-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" style={{ animation: 'shimmer 4s infinite linear' }} />
          <CircularProgress value={Math.min(Math.round(xpPct), 99) || 1} size={80} strokeWidth={6} label="XP" trend={`Lv${user.level}`} />
          <div className="pr-6 relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full" />
                <CustomShield className="w-4 h-4 text-cyan-400 relative z-10" strokeWidth={2} />
              </motion.div>
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Security Rating</div>
              <div className="px-1.5 py-0.5 bg-red-600 rounded-sm flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                <span className="text-[8px] font-black text-white leading-none">LIVE</span>
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tighter leading-none mb-1">
              {user.role || 'Agent'}
            </div>
            <div className="text-[9px] font-bold text-cyan-500/60 uppercase tracking-widest mb-2">
              {user.streak} Day Streak Active
            </div>
            <div className="flex items-end gap-1 h-3 mb-2 opacity-60">
              {[40, 70, 50, 90, 60].map((h, i) => (
                <div key={i} className="w-1.5 bg-cyan-400 rounded-t-[1px]" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-slate-500 tracking-widest">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              OPERATIONAL_MODE
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; filter: blur(4px); }
          50% { opacity: 0.6; filter: blur(6px); }
        }
      `}</style>
    </div>
  );
}