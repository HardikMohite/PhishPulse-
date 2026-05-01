import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  Heart,
  Snowflake,
  X,
} from 'lucide-react';

export interface StoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
}

const STORE_ITEMS = [
  {
    name: 'Health Potion',
    desc: 'Restore systems to operational status. Instantly restores 20 HP to your integrity level.',
    price: '150 Credits',
    icon: Heart,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/10 border-green-500/20',
    action: 'Deploy',
  },
  {
    name: 'Streak Freeze',
    desc: 'Preserve your active streak during mandatory downtime. Protects your daily streak for 24h.',
    price: '300 Credits',
    icon: Snowflake,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    action: 'Acquire',
  },
] as const;

export default function StoreDrawer({ isOpen, onClose, userCoins }: StoreDrawerProps) {
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  const handlePurchase = (itemName: string) => {
    setPurchaseFeedback(itemName);
    setTimeout(() => setPurchaseFeedback(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-md h-full bg-[#0a0a0f] border-l border-cyan-500/20 p-8 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-cyan-400" />
                <h3 className="text-2xl font-black text-white tracking-tighter uppercase">
                  Operator Store
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Balance */}
            <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="text-yellow-400 w-5 h-5" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Pulse Credits Balance
                </span>
              </div>
              <span className="text-xl font-black text-yellow-400 tracking-tight">
                {userCoins.toLocaleString()} CR
              </span>
            </div>

            {/* Items */}
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              {STORE_ITEMS.map((item) => (
                <div
                  key={item.name}
                  className="bg-[#0f172a] border border-white/5 hover:border-cyan-500/30 rounded-3xl p-6 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center border`}
                    >
                      <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                  </div>
                  <h4 className="text-lg font-black text-white">{item.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-yellow-400 uppercase">
                      {item.price}
                    </span>
                    <button
                      onClick={() => handlePurchase(item.name)}
                      className="px-6 py-2 bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg hover:shadow-cyan-500/20 active:scale-95 transition-all"
                    >
                      {purchaseFeedback === item.name ? '✓ Acquired' : item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
