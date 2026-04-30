/**
 * PreSimulationModal
 * Full-screen modal briefing shown before the inbox simulation loads.
 * Displays the user's dynamically generated PhishPulse training email address.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertTriangle, X, ArrowUpRight, Activity } from 'lucide-react';
import CustomShield from '@/components/CustomShield';

interface PreSimulationModalProps {
  isOpen: boolean;
  trainingEmail: string;
  onLaunch: () => void;
  onCancel: () => void;
}

export default function PreSimulationModal({
  isOpen,
  trainingEmail,
  onLaunch,
  onCancel,
}: PreSimulationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-[#0d1117] border border-cyan-500/20 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(6,182,212,0.15)]"
          >
            {/* Gradient shimmer top border */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="relative z-10 p-8 flex flex-col gap-6">

              {/* ── Header ── */}
              <div className="flex items-center gap-4">
                {/* Logo block — matches dashboard sidebar */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                  <div className="relative w-14 h-14 bg-[#0f172a] border border-cyan-500/20 rounded-2xl flex items-center justify-center">
                    <CustomShield size={30} className="text-cyan-400" strokeWidth={1.5} />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-0">
                    <span className="text-xl font-black tracking-tighter text-white uppercase">PHISH</span>
                    <span className="text-xl font-black tracking-tighter text-cyan-400 uppercase">PULSE</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-cyan-500 shadow-[0_0_5px_#06b6d4]" />
                    <p className="text-[7px] uppercase tracking-[0.4em] text-slate-500 font-bold">SECURE_MISSION_BRIEF</p>
                  </div>
                </div>
              </div>

              {/* ── Mission label + title ── */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={12} className="text-cyan-400" />
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Inbox Assignment</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tighter leading-tight">
                  Your secure training inbox<br />
                  has been <span className="text-cyan-400">activated.</span>
                </h2>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                  All simulation emails for this mission will be routed to your assigned PhishPulse address below.
                </p>
              </div>

              {/* ── Divider ── */}
              <div className="h-px bg-white/5" />

              {/* ── Email card — matches StatCard style ── */}
              <div className="bg-[#0f172a]/80 border border-cyan-500/10 p-5 rounded-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Assigned Address</p>
                  <Mail className="w-4 h-4 text-cyan-400" />
                </div>
                <p className="text-lg font-black text-cyan-400 tracking-tight break-all leading-tight">
                  {trainingEmail}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Inbox Active</span>
                </div>
              </div>

              {/* ── Warning — matches dashboard alert style ── */}
              <div className="flex items-start gap-3 bg-[#0f172a]/80 border border-orange-500/20 p-4 rounded-2xl">
                <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Threat Advisory</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Attackers will imitate trusted brands, create fake urgency, and spoof login alerts. Stay sharp.
                  </p>
                </div>
              </div>

              {/* ── Actions ── */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={onCancel}
                  className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border border-white/5 rounded-xl hover:border-white/10 hover:text-slate-400 transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={onLaunch}
                  whileHover={{ scale: 1.02, filter: 'brightness(1.15)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-500/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)] text-cyan-400 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl transition-all"
                >
                  Initiate Simulation
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </motion.button>
              </div>
            </div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 inset-x-0 h-px bg-white/5" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}