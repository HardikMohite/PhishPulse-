import { useState } from 'react';
import { getAvatarUrlFromUser } from '@/avatarSystem';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trophy, X } from 'lucide-react';
import CustomShield from '@/components/CustomShield';

export interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    level: number;
    xp: number;
    role: string;
    coins: number;
  };
  xpToNextLevel: number;
  xpPct: number;
  notifications?: any[];
  userAvatarSeed?: string;
  userAvatarStyle?: string;
}

export default function AppHeader({ user, xpToNextLevel, xpPct, notifications = [], userAvatarSeed, userAvatarStyle }: AppHeaderProps) {
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 h-20 px-8 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full" />
          <CustomShield className="text-cyan-400 w-10 h-10 relative z-10" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline leading-none">
            <span className="text-2xl font-black tracking-tighter text-white uppercase">PHISH</span>
            <span className="text-2xl font-black tracking-tighter text-cyan-400 uppercase">PULSE</span>
          </div>
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1 ml-0.5">
            Control Center
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6">
        {/* Bell / Notifications */}
        <motion.button
          onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 text-slate-400 hover:text-cyan-400 transition-colors bg-white/5 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-cyan-400 rounded-full border-2 border-[#0a0a0f] animate-pulse" />
        </motion.button>

        {/* Notifications panel (slide-down) */}
        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              style={{ boxShadow: '0 20px 60px rgba(6, 182, 212, 0.15)' }}
              className="absolute top-20 right-8 w-80 bg-[#0d1117] border border-cyan-500/20 rounded-2xl p-5 backdrop-blur-xl z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Notifications
                </p>
                <button onClick={() => setIsNotificationsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-slate-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-300 mb-1">No new notifications</p>
                  <p className="text-xs text-slate-500">You're all caught up! Check back later.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {notifications.map((notif: any, i: number) => (
                    <div key={i} className={`p-3 rounded-xl bg-white/5 border-l-2 ${notif.type === 'alert' ? 'border-red-500' : notif.type === 'success' ? 'border-green-500' : 'border-cyan-500'}`}>
                      <p className="text-xs font-bold text-white mb-1">{notif.title}</p>
                      <p className="text-[10px] text-slate-400">{notif.message}</p>
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-2">{notif.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar + XP tooltip */}
        <div className="relative flex items-center gap-4 pl-6 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-white uppercase tracking-tight">{user.name}</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
              <span className="text-[8px] font-black bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase tracking-widest">
                LVL_{user.level}
              </span>
            </div>
          </div>

          <div
            className="relative cursor-pointer group"
            onMouseEnter={() => setShowAvatarTooltip(true)}
            onMouseLeave={() => setShowAvatarTooltip(false)}
          >
            <div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/20 overflow-hidden ring-2 ring-cyan-500/10 group-hover:ring-cyan-500/40 transition-all"
              onClick={() => navigate('/profile')}
            >
              <img
                src={getAvatarUrlFromUser(userAvatarSeed, userAvatarStyle)}
                alt="avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || user?.email || 'agent')}`;
                }}
              />
            </div>

            <AnimatePresence>
              {showAvatarTooltip && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-64 bg-[#0d1117] border border-cyan-500/20 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl z-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs font-black text-white uppercase">Level {user.level}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {user.role}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                      <span className="text-slate-400">Experience</span>
                      <span className="text-cyan-400">
                        {user.xp} / {xpToNextLevel} XP
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${xpPct}%` }}
                        className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                      />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {user.email}
                    </span>
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-full py-2 bg-white/5 hover:bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors border border-transparent hover:border-cyan-500/30"
                    >
                      View Full Profile
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}