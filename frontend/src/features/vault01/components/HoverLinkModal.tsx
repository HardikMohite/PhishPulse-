/**
 * HoverLinkModal
 * Floating tooltip that appears when the user hovers a link inside the email body.
 * Shows the real destination URL and a danger/safe indicator.
 */

import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EmailLink } from '../types/vault01.types';

interface HoverLinkModalProps {
  link: EmailLink | null;
  x: number;
  y: number;
}

export default function HoverLinkModal({ link, x, y }: HoverLinkModalProps) {
  return (
    <AnimatePresence>
      {link && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 4 }}
          transition={{ duration: 0.12 }}
          style={{ position: 'fixed', left: x, top: y - 8, zIndex: 9999, transform: 'translateY(-100%)' }}
          className="max-w-xs bg-[#1a1a2e] border border-white/20 rounded-xl px-4 py-3 shadow-2xl pointer-events-none"
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {link.is_dangerous ? (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            )}
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                link.is_dangerous ? 'text-red-400' : 'text-green-400'
              }`}
            >
              {link.is_dangerous ? 'Suspicious Link' : 'Safe Link'}
            </span>
          </div>

          {/* Real URL */}
          <div className="flex items-start gap-2">
            <ExternalLink className="w-3 h-3 text-white/40 mt-0.5 shrink-0" />
            <p
              className={`text-[11px] font-mono break-all leading-relaxed ${
                link.is_dangerous ? 'text-red-300' : 'text-green-300'
              }`}
            >
              {link.real_url}
            </p>
          </div>

          {link.is_dangerous && (
            <p className="text-[10px] text-white/50 mt-2 leading-relaxed">
              This domain does not belong to the claimed sender.
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
