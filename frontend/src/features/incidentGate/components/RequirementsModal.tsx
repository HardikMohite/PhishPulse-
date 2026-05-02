import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RequirementsModalProps {
  isOpen: boolean;
  allMet: boolean;
  onClose: (granted?: boolean) => void;
}

const RequirementsModal = ({ isOpen, allMet, onClose }: RequirementsModalProps) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isOpen && allMet) {
      timeoutId = setTimeout(() => {
        onClose(true);
      }, 1500);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, allMet, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-[#020d18] border border-[#00dcff]/30 shadow-[0_0_20px_rgba(0,220,255,0.15)] rounded p-6 w-[90%] max-w-sm flex flex-col font-mono"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <h2 className="text-[#00dcff] text-sm tracking-[0.2em] uppercase text-center mb-6">
              Authorization Terminal
            </h2>

            {allMet ? (
              <div className="flex flex-col items-center justify-center py-8">
                <span className="text-green-400 text-2xl font-bold tracking-widest uppercase drop-shadow-[0_0_12px_rgba(74,222,128,0.8)] animate-pulse">
                  Access Granted
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <ul className="space-y-4 mb-8 text-slate-300 text-sm">
                  <li className="flex items-center space-x-3">
                    <span className="text-red-500 text-lg">❌</span>
                    <span>Complete Vault 01</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-red-500 text-lg">❌</span>
                    <span>Minimum Level 3</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <span className="text-green-500 text-lg">✅</span>
                    <span>Active Streak</span>
                  </li>
                </ul>

                <div className="mt-auto flex flex-col items-center border-t border-[#00dcff]/20 pt-4">
                  <p className="text-red-500/90 text-[0.65rem] tracking-[0.15em] mb-4 text-center uppercase">
                    Access Denied — Requirements Not Met
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-transparent border border-[#00dcff]/50 text-[#00dcff] text-xs tracking-[0.2em] uppercase hover:bg-[#00dcff]/10 hover:shadow-[0_0_15px_rgba(0,220,255,0.2)] transition-all duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RequirementsModal;
