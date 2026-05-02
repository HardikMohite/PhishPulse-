import { useState, useEffect, type ComponentType, type SVGProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame as FlameIcon,
  Star as StarIcon,
  X as XIcon,
  Heart as HeartIcon,
  ArrowLeft,
  Zap as ZapIcon,
  Camera,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { logout, updateAvatar } from '@/services/authService';
import CustomShield from '@/components/CustomShield';
import Sidebar from '@/components/layout/Sidebar';
import {
  PRESET_AVATARS,
  MALE_AVATARS,
  FEMALE_AVATARS,
  CYBER_AVATARS,
  getAvatarUrl,
  getAvatarUrlFromUser,
  resolvePresetAvatar,
  type PresetAvatar,
} from '@/avatarSystem';

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

/* ─── Health Card ──────────────────────────────────────────── */
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
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
  icon: Icon,
  label,
  value,
  subtext,
  color = 'cyan',
  progress,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: string;
  progress?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="bg-[#0f172a]/80 border border-cyan-500/10 p-5 rounded-2xl backdrop-blur-xl group transition-all"
  >
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
        <Icon className={`w-6 h-6 ${color === 'yellow' ? 'text-yellow-400' : color === 'orange' ? 'text-orange-400' : 'text-cyan-400'}`} />
      </div>
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

/* ─── Edit Profile Modal ───────────────────────────────────── */
const EditProfileModal = ({
  isOpen,
  onClose,
  userName,
  userEmail,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  onSave: (name: string) => void;
}) => {
  const [formData, setFormData] = useState({ name: userName });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({ name: userName });
  }, [userName, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    onSave(formData.name);
    setIsSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-[#0d1117] border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black uppercase tracking-tight text-white">Edit Profile</h2>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XIcon size={20} className="text-slate-400" />
                </motion.button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-2">Email</label>
                  <div className="w-full bg-slate-900 border border-white/5 rounded-lg px-4 py-2.5 text-slate-400 text-sm">
                    {userEmail}
                  </div>
                  <p className="text-[9px] text-slate-600 mt-1">Contact support to change email</p>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-slate-400 font-bold uppercase tracking-wider text-xs hover:border-white/20 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-2.5 bg-cyan-500/20 border border-cyan-500/50 rounded-lg text-cyan-400 font-bold uppercase tracking-wider text-xs hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ─── Avatar Card ──────────────────────────────────────────── */
const AvatarCard = ({
  avatar,
  isSelected,
  isSaving,
  onSelect,
}: {
  avatar: PresetAvatar;
  isSelected: boolean;
  isSaving: boolean;
  onSelect: (avatar: PresetAvatar) => void;
}) => (
  <button
    onClick={() => onSelect(avatar)}
    disabled={isSaving}
    className={`relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all ${
      isSelected
        ? 'border-2 border-cyan-400 ring-2 ring-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] bg-cyan-400/5'
        : 'border border-white/10 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10'
    }`}
  >
    <img
      src={getAvatarUrl(avatar)}
      alt={avatar.label}
      className="w-[56px] h-[56px]"
      onError={(e) => {
        // Fallback: render a neutral placeholder if DiceBear fails
        (e.target as HTMLImageElement).src =
          `https://api.dicebear.com/9.x/initials/svg?seed=${avatar.label}`;
      }}
    />
    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-300">
      {avatar.label}
    </span>
    {isSelected && isSaving && (
      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )}
  </button>
);

/* ─── Avatar Picker Modal ──────────────────────────────────── */
const AvatarPickerModal = ({
  isOpen,
  onClose,
  selectedAvatarId,
  isSaving,
  onSelect,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: string;
  isSaving: boolean;
  onSelect: (avatar: PresetAvatar) => void;
  error: string | null;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
        >
          <div className="bg-[#0d1117] border border-cyan-500/20 rounded-2xl p-5 shadow-2xl relative max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-500/60 mb-1">
                  ● Identity Module
                </p>
                <h2 className="text-xl font-black uppercase tracking-widest text-white">
                  Choose Your Agent
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-6 mt-6">
              {/* Male agents */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                  Male Agents
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {MALE_AVATARS.map((avatar) => (
                    <AvatarCard
                      key={avatar.id}
                      avatar={avatar}
                      isSelected={selectedAvatarId === avatar.id}
                      isSaving={isSaving}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Female agents */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
                  Female Agents
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {FEMALE_AVATARS.map((avatar) => (
                    <AvatarCard
                      key={avatar.id}
                      avatar={avatar}
                      isSelected={selectedAvatarId === avatar.id}
                      isSaving={isSaving}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Cyber agents */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 text-center">
                  Cyber
                </p>
                <div className="flex justify-center gap-3">
                  {CYBER_AVATARS.map((avatar) => (
                    <AvatarCard
                      key={avatar.id}
                      avatar={avatar}
                      isSelected={selectedAvatarId === avatar.id}
                      isSaving={isSaving}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-xs font-bold text-red-400 text-center uppercase tracking-widest">
                {error}
              </p>
            )}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/* ─── Profile Page ─────────────────────────────────────────── */
export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, health: currentHp, setUser } = useAuthStore();
  const currentUser = user;

  const [displayName, setDisplayName] = useState(currentUser?.name || 'Agent');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(() => {
    return resolvePresetAvatar(user?.avatar_seed, user?.avatar_style).id;
  });
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] text-white">
        Loading...
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSaveProfile = async (newName: string) => {
    try {
      setDisplayName(newName);
      if (currentUser) setUser({ ...currentUser, name: newName });
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleAvatarSelect = async (avatar: PresetAvatar) => {
    setAvatarError(null);
    setAvatarSaving(true);
    setSelectedAvatarId(avatar.id);

    try {
      // Persist to backend — PATCH /auth/me
      await updateAvatar(avatar.seed, avatar.style);

      // Update local store so AppHeader re-renders immediately
      setUser({ ...currentUser!, avatar_seed: avatar.seed, avatar_style: avatar.style });
      setIsAvatarPickerOpen(false);
    } catch (err) {
      console.error('Avatar update failed:', err);
      setAvatarError('Failed to save avatar. Please try again.');

      // Revert selection to whatever was last saved
      setSelectedAvatarId(
        resolvePresetAvatar(currentUser.avatar_seed, currentUser.avatar_style).id,
      );
    } finally {
      setAvatarSaving(false);
    }
  };

  const xpToNextLevel = currentUser.level * 100;
  const xpPct = Math.min((currentUser.xp / xpToNextLevel) * 100, 100);

  // Current avatar URL for the profile display
  const currentAvatarUrl = getAvatarUrlFromUser(
    currentUser.avatar_seed,
    currentUser.avatar_style,
  );

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0a0f', fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeTab="profile" onLogout={handleLogout} userName={currentUser.name || 'Agent'} onStoreClick={() => {}} />

      <div className="flex-1 ml-16 transition-all duration-300 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 h-20 px-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 group px-4 py-2 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
          >
            <ArrowLeft size={14} className="text-cyan-500 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-cyan-400 transition-colors">Dashboard</span>
          </button>

          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center gap-1.5">
            <span className="text-base font-black uppercase tracking-[0.35em] text-white" style={{ textShadow: '0 0 20px rgba(6,182,212,0.4)' }}>
              Profile
            </span>
          </motion.div>

          <div></div>
        </header>

        {/* Main Content */}
        <div className="flex-1 max-w-6xl mx-auto px-8 py-10 w-full">
          {/* Profile Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-12">
            <div className="flex items-start gap-8">
              {/* Left: Avatar + Level */}
              <div className="flex flex-col items-center gap-4 flex-shrink-0">
                <div className="relative w-32 h-32">
                  <div
                    onClick={() => setIsAvatarPickerOpen(true)}
                    className="relative w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-cyan-500/30 overflow-hidden hover:border-cyan-400 transition-all cursor-pointer group"
                  >
                    <img
                      src={currentAvatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-40"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://api.dicebear.com/9.x/initials/svg?seed=${currentUser.name}`;
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                      <Camera className="w-8 h-8 text-white mb-1" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change</span>
                    </div>
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 rounded-lg px-3 py-1 flex items-center gap-2 border border-slate-700 shadow-lg pointer-events-none">
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Level</span>
                    <span className="text-base font-black text-white">{currentUser.level}</span>
                  </div>
                </div>
              </div>

              {/* Right: Name and Info */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-white">{displayName}</h1>
                    <p className="text-sm text-slate-400 mt-1">{currentUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Active</span>
                  <span className="text-xs text-slate-500">|</span>
                  <motion.button
                    onClick={() => setIsEditOpen(true)}
                    className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] border border-cyan-500/30 text-cyan-400 rounded-lg hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all bg-cyan-400/5 backdrop-blur-md"
                  >
                    Edit Profile
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <HealthCard currentHp={currentHp} maxHp={100} />
            <StatCard
              icon={StarIcon}
              label="Total XP"
              value={currentUser.xp}
              color="yellow"
              progress={xpPct}
              subtext={`Next level: ${xpToNextLevel - currentUser.xp} XP`}
            />
            <StatCard icon={ZapIcon} label="Credits" value={currentUser.coins} color="orange" />
            <StatCard
              icon={FlameIcon}
              label="Active Streak"
              value={`${currentUser.streak} days`}
              color="orange"
              subtext="+1 today"
            />
          </div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0f172a]/80 border border-cyan-500/10 rounded-2xl p-8 backdrop-blur-xl">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <div>
                    <p className="text-sm font-black text-white uppercase">Profile Viewed</p>
                    <p className="text-[10px] text-slate-500">Just now</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">NOW</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div>
                    <p className="text-sm font-black text-white uppercase">Last Active</p>
                    <p className="text-[10px] text-slate-500">On Dashboard</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-400 uppercase">Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        userName={displayName}
        userEmail={currentUser.email || ''}
        onSave={handleSaveProfile}
      />

      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        selectedAvatarId={selectedAvatarId}
        isSaving={avatarSaving}
        onSelect={handleAvatarSelect}
        error={avatarError}
      />
    </div>
  );
}