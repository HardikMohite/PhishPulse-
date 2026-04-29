/**
 * Vault01Intro
 * The hero section at the top of the vault map page.
 * Shows vault title, description, stats, and the Begin Training button.
 * Uses real data from meta + progress. Uses CustomShield, framer-motion, Inter font.
 */

import { motion } from 'framer-motion';
import {
  Mail,
  Trophy,
  Layers,
  Clock,
  ChevronRight,
} from 'lucide-react';
import CustomShield from '@/components/CustomShield';
import type { VaultMeta, Level } from '../types/vault01.types';

interface Vault01IntroProps {
  meta: VaultMeta;
  levels: Level[];
  onBeginTraining: () => void;
}

export default function Vault01Intro({ meta, levels, onBeginTraining }: Vault01IntroProps) {
  const completedCount = levels.filter((l) => l.status === 'completed').length;
  const activeLevel = levels.find((l) => l.status === 'active' || l.status === 'unlocked');

  const stats = [
    { icon: Mail,   label: `${meta.total_xp} XP`,              color: 'text-cyan-400' },
    { icon: Trophy, label: meta.badge_name,                     color: 'text-purple-400' },
    { icon: Layers, label: `${meta.total_levels} LVLS`,        color: 'text-green-400' },
    { icon: Clock,  label: `${meta.est_total_minutes} MIN`,    color: 'text-amber-400' },
  ];

  return (
    <section className="grid md:grid-cols-2 gap-12 items-center relative">
      {/* Watermark number */}
      <div className="absolute -left-20 top-24 text-[20rem] font-black text-white/[0.02] select-none leading-none pointer-events-none z-0">
        01
      </div>

      {/* Left — animated shield visual */}
      <div className="relative flex justify-center md:justify-start order-2 md:order-1 z-10">
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-400/20 blur-3xl opacity-40 shrink-0" />

          {/* Radiating rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: 'easeOut' }}
                className="absolute w-40 h-40 border-2 border-cyan-400/40 rounded-full"
              />
            ))}
          </div>

          {/* Shield card */}
          <div className="relative z-10 p-10 bg-[#0a0a0f]/60 border-2 border-cyan-400/40 rounded-[3rem] backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.2)]">
            <motion.div
              animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CustomShield
                size={160}
                className="text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                strokeWidth={1}
              />
            </motion.div>

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [-20, 20, -20], x: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
                className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                style={{ top: `${20 + i * 15}%`, left: `${10 + (i % 2) * 80}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right — text content */}
      <div className="space-y-6 order-1 md:order-2 z-10">
        <div>
          <span className="inline-block px-3 py-1 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-[10px] font-bold rounded-full uppercase tracking-widest mb-6">
            {meta.tier}
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-4 uppercase text-white">
            {meta.title.split(' ').slice(0, -1).join(' ')}{' '}
            <br />
            <span className="text-cyan-400">{meta.title.split(' ').slice(-1)}</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">{meta.subtitle}</p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap gap-3 text-[10px] font-bold">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white/5 p-2 px-3 rounded-lg border border-white/5 flex items-center gap-2"
            >
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="tracking-wide text-white/80">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-8 pt-4">
          <motion.button
            onClick={onBeginTraining}
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(6,182,212,0.1)' }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-cyan-400 text-cyan-400 px-10 py-4 rounded-xl font-black uppercase tracking-tighter shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-3 bg-transparent transition-colors"
          >
            Begin Training
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <div className="flex flex-col">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">
              Progress
            </div>
            <div className="text-2xl font-black text-cyan-400 flex items-baseline gap-2">
              {completedCount}/{meta.total_levels}
              <span className="text-[10px] font-normal opacity-50 uppercase tracking-widest">
                Complete
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}