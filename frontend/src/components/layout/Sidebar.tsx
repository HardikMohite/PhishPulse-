import { useState } from 'react';
import { getAvatarUrlFromUser } from '@/avatarSystem';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Vault as VaultIcon,
  AlertTriangle,
  Swords as SwordsIcon,
  Trophy as TrophyIcon,
  ShoppingBag as ShoppingBagIcon,
  LockKeyhole,
  LogOut,
} from 'lucide-react';
import CustomShield from '@/components/CustomShield';

interface SidebarProps {
  activeTab: string;
  onLogout: () => void;
  userName: string;
  onStoreClick?: () => void;
  userAvatarSeed?: string;
  userAvatarStyle?: string;
}

const Sidebar = ({ activeTab, onStoreClick, onLogout, userName, userAvatarSeed, userAvatarStyle }: SidebarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard', path: '/dashboard' },
    { label: 'Vault Realm', icon: VaultIcon, id: 'vault', path: '/vault-realm' },
    { label: 'Incident Gate', icon: AlertTriangle, id: 'incident', locked: true, path: '/incident-gate' },
    { label: 'CTF Challenges', icon: SwordsIcon, id: 'ctf', path: '/ctf' },
    { label: 'Leaderboard', icon: TrophyIcon, id: 'leaderboard', path: '/leaderboard' },
    { label: 'Store', icon: ShoppingBagIcon, id: 'store' },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 bottom-0 z-50 bg-[#0d1117] border-r border-cyan-500/10 flex flex-col ${isHovered ? 'w-64' : 'w-16'}`}
      style={{ transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)', boxShadow: isHovered ? '20px 0 60px rgba(0,0,0,0.5)' : 'none' }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

      {/* Logo */}
      <div className={`px-4 h-28 flex items-center transition-all duration-300 ${isHovered ? 'gap-4' : 'justify-center'}`}>
        <motion.div
          className="flex-shrink-0 relative"
          animate={isHovered ? { rotate: [0, 5, 0, -5, 0], scale: [1, 1.08, 1] } : { rotate: -12, scale: 1 }}
          transition={isHovered ? { rotate: { duration: 6, repeat: Infinity }, scale: { duration: 4, repeat: Infinity } } : { duration: 0.5 }}
        >
          <motion.div
            animate={isHovered ? { opacity: [0.4, 0.8, 0.4], scale: [1, 1.2, 1] } : { opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-cyan-500/30 blur-2xl rounded-full"
          />
          <CustomShield
            className={`text-cyan-400 relative z-10 transition-all duration-500 ${isHovered ? 'w-12 h-12' : 'w-9 h-9'}`}
            strokeWidth={1.5}
          />
        </motion.div>
        <div className={`flex flex-col whitespace-nowrap transition-all duration-500 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12 pointer-events-none'}`}>
          <div className="flex items-baseline">
            <span className="text-2xl font-black tracking-tighter text-white uppercase">PHISH</span>
            <span className="text-2xl font-black tracking-tighter text-cyan-400 uppercase">PULSE</span>
          </div>
          <div className="flex items-center gap-1.5 -mt-0.5">
            <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" />
            <p className="text-[7.5px] uppercase tracking-[0.5em] text-slate-500 font-bold">TERMINAL_ACTIVE</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 mt-8 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'store') { onStoreClick?.(); return; }
              if (item.path) navigate(item.path);
            }}
            className="w-full group relative flex items-center gap-4 p-3 rounded-xl transition-all"
            style={{
              background: activeTab === item.id ? 'rgba(6,182,212,0.05)' : 'transparent',
              color: activeTab === item.id ? '#22d3ee' : '#94a3b8',
              borderLeft: activeTab === item.id ? '2px solid #22d3ee' : '2px solid transparent',
            }}
          >
            <div className="relative">
              <item.icon className="w-5 h-5 min-w-[20px] transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-400" />
              {item.locked && activeTab !== item.id && (
                <div className="absolute -bottom-1 -right-1 text-orange-500 bg-[#0d1117] rounded-full p-0.5">
                  <LockKeyhole size={8} />
                </div>
              )}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              {item.label}
            </span>
            {item.locked && isHovered && activeTab !== item.id && (
              <span className="ml-auto text-[8px] font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 px-1.5 py-0.5 rounded">LOCKED</span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-6 mt-auto border-t border-white/5 pt-4 space-y-4">

        {/* PROFILE (same motion as logout) */}
        <motion.div
          onClick={() => navigate('/profile')}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
          className={`cursor-pointer p-3 rounded-2xl bg-white/5 flex items-center gap-3 transition-all overflow-hidden ${!isHovered ? 'justify-center p-2' : ''}`}
        >
          <div className="w-8 h-8 min-w-[32px] rounded-full bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
            <img
              src={getAvatarUrlFromUser(userAvatarSeed, userAvatarStyle)}
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(userName || 'A')}`;
              }}
            />
          </div>

          <div className={`transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
            <p className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[140px]">
              {userName}
            </p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
        </motion.div>

        {/* Logout */}
        <motion.button
          onClick={onLogout}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
          className="w-full group flex items-center gap-4 p-3 rounded-xl text-red-400 border border-red-500/30 bg-red-500/5 hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.25)] hover:bg-red-400/5 transition-all overflow-hidden"
        >
          <LogOut className="w-5 h-5 min-w-[20px]" />
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
            Logout
          </span>
        </motion.button>

      </div>
    </div>
  );
};

export default Sidebar;