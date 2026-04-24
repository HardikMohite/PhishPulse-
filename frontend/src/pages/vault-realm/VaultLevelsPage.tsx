import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, HelpCircle, Crosshair } from "lucide-react";
import VaultCube from "@/components/VaultCube";

const ROADMAP_LEVELS = [
  {
    id: 1,
    title: "Basic Email Phishing",
    description: "Learn the basics of identifying suspicious emails.",
    difficulty: "Beginner",
    status: "completed",
    xpReward: 100,
    coinsReward: 50,
    pos: { top: '35%', left: '25%' },
    connectTo: 2
  },
  {
    id: 2,
    title: "Spear Phishing",
    description: "Identify fraudulent login pages designed to steal credentials.",
    difficulty: "Intermediate",
    status: "completed",
    xpReward: 150,
    coinsReward: 75,
    pos: { top: '65%', left: '38%' },
    connectTo: 3
  },
  {
    id: 3,
    title: "Link Manipulation — URL Analysis",
    description: "Recognize targeted attacks aimed at specific individuals.",
    difficulty: "Advanced",
    status: "unlocked",
    xpReward: 250,
    coinsReward: 100,
    pos: { top: '35%', left: '50%' },
    connectTo: 4
  },
  {
    id: 4,
    title: "Smishing — SMS Phishing",
    description: "Safely handle and identify dangerous mobile text attachments.",
    difficulty: "Intermediate",
    status: "locked",
    xpReward: 300,
    coinsReward: 150,
    pos: { top: '65%', left: '62%' },
    connectTo: 5
  },
  {
    id: 5,
    title: "CEO Fraud / Whaling",
    description: "Defend against complex multi-stage social engineering attacks targeting executives.",
    difficulty: "Expert",
    status: "locked",
    xpReward: 500,
    coinsReward: 250,
    pos: { top: '35%', left: '75%' },
    connectTo: null
  }
] as const;

// Derive counts from data — no magic numbers
const TOTAL_LEVELS = ROADMAP_LEVELS.length;
const COMPLETED_COUNT = ROADMAP_LEVELS.filter(v => v.status === "completed").length;

export default function VaultLevelsPage() {
  const navigate = useNavigate();
  const [selectedVault, setSelectedVault] = useState<number | null>(null);

  // Draw SVG connecting lines between nodes
  const drawLine = (fromNode: (typeof ROADMAP_LEVELS)[number], toNode: (typeof ROADMAP_LEVELS)[number], isActive: boolean) => {
    const fX = parseFloat(fromNode.pos.left);
    const fY = parseFloat(fromNode.pos.top);
    const tX = parseFloat(toNode.pos.left);
    const tY = parseFloat(toNode.pos.top);

    return (
      <line
        x1={`${fX}%`} y1={`${fY}%`} x2={`${tX}%`} y2={`${tY}%`}
        stroke={isActive ? "#06b6d4" : "rgba(6,182,212,0.15)"}
        strokeWidth={isActive ? "3" : "2"}
        strokeDasharray={isActive ? undefined : "8 8"}
        style={{ filter: isActive ? "drop-shadow(0 0 8px rgba(6,182,212,0.8))" : "none" }}
      />
    );
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-black select-none"
      style={{ fontFamily: "'Rajdhani', 'Share Tech Mono', monospace" }}
    >

      {/* ── Background Grid (Perspective) ── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden" style={{ zIndex: 0 }}>
        <div
          className="w-[200vw] h-[200vh]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            transformOrigin: "center center",
            transform: "rotateX(60deg) translateY(-20%) translateZ(-300px)",
            perspective: "1000px"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
      </div>

      {/* ── Top HUD Header ── */}
      <header className="absolute top-0 left-0 w-full p-6 flex items-start justify-between z-50 pointer-events-none">

        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="pointer-events-auto flex items-center justify-center w-12 h-12 border border-cyan-500/50 rounded bg-black/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          aria-label="Back to Dashboard"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Center Title Frame */}
        <div className="flex flex-col items-center">
          <div className="relative px-12 py-3 border-t-2 border-b-2 border-cyan-500/80 bg-black/60 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <div className="absolute -left-3 top-0 bottom-0 w-6 border-l-2 border-t-2 border-b-2 border-cyan-500/80 skew-x-12" />
            <div className="absolute -right-3 top-0 bottom-0 w-6 border-r-2 border-t-2 border-b-2 border-cyan-500/80 -skew-x-12" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 tracking-wider">
              Vault Realm
            </h1>
          </div>
          {/* Dynamic vault progress derived from data */}
          <div className="mt-4 px-6 py-1 border border-cyan-500/40 rounded-full bg-cyan-950/50 text-cyan-200 text-sm tracking-widest">
            VAULT {COMPLETED_COUNT}/{TOTAL_LEVELS}
          </div>
        </div>

        {/* Right spacer — matches back button width to keep title truly centered */}
        <div className="w-12 h-12" aria-hidden="true" />

      </header>

      {/* ── Connecting SVG Lines (Roadmap Branches) ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {ROADMAP_LEVELS.map(node => {
          if (!node.connectTo) return null;
          const targets = Array.isArray(node.connectTo) ? node.connectTo : [node.connectTo];

          return targets.map(targetId => {
            const targetNode = ROADMAP_LEVELS.find(n => n.id === targetId);
            if (!targetNode) return null;

            const isLineActive =
              node.status === 'completed' &&
              (targetNode.status === 'completed' || targetNode.status === 'unlocked');

            return (
              <g key={`${node.id}-${targetId}`}>
                {drawLine(node, targetNode, isLineActive)}
              </g>
            );
          });
        })}
      </svg>

      {/* ── The 3D Vault Nodes ── */}
      <div className="absolute inset-0 z-10">
        {ROADMAP_LEVELS.map((vault) => (
          <div
            key={vault.id}
            onMouseEnter={() => setSelectedVault(vault.id)}
            onMouseLeave={() => setSelectedVault(null)}
          >
            <VaultCube
              id={vault.id}
              title={vault.title}
              status={vault.status as 'locked' | 'unlocked' | 'completed'}
              top={vault.pos.top}
              left={vault.pos.left}
              selected={selectedVault === vault.id}
              onClick={() => {
                // Navigate to vault lesson when a route is available
                // e.g. navigate(`/vault-realm/${vault.id}`)
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Selection UI Panel (Bottom Center) ── */}
      <AnimatePresence>
        {selectedVault && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            {(() => {
              const vault = ROADMAP_LEVELS.find(v => v.id === selectedVault)!;
              const isLocked = vault.status === 'locked';
              return (
                <div className="border border-cyan-500/50 bg-black/80 backdrop-blur-xl rounded-xl p-1 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <div className="border border-cyan-500/20 rounded-lg p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Crosshair className="text-cyan-400" size={20} />
                        <h2 className="text-2xl font-bold text-white tracking-wider">{vault.title}</h2>
                      </div>
                      <p className="text-cyan-100/70 text-sm mb-4">{vault.description}</p>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-xs text-cyan-500/70 uppercase tracking-widest font-bold">Reward</span>
                          <span className="text-emerald-400 font-bold tracking-wider">+{vault.xpReward} XP</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-cyan-500/70 uppercase tracking-widest font-bold">Difficulty</span>
                          <span className="text-amber-400 font-bold tracking-wider">{vault.difficulty}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-cyan-500/70 uppercase tracking-widest font-bold">Status</span>
                          <span className={`font-bold tracking-wider capitalize ${
                            vault.status === 'completed' ? 'text-blue-400' :
                            vault.status === 'unlocked' ? 'text-cyan-400' :
                            'text-slate-500'
                          }`}>
                            {vault.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-8 border-l border-cyan-500/20 pl-8 flex items-center justify-center">
                      <button
                        disabled={isLocked}
                        onClick={() => {
                          if (!isLocked) {
                            // navigate(`/vault-realm/${vault.id}`);
                          }
                        }}
                        className={`relative group px-8 py-4 border overflow-hidden font-bold tracking-widest transition-all ${
                          isLocked
                            ? 'border-slate-700 text-slate-600 cursor-not-allowed bg-slate-900/30'
                            : 'border-cyan-400 bg-cyan-950/30 text-cyan-100 hover:bg-cyan-500 hover:text-white cursor-pointer'
                        }`}
                      >
                        {!isLocked && (
                          <div className="absolute inset-0 bg-cyan-500/20 w-0 group-hover:w-full transition-all duration-300 ease-out" />
                        )}
                        <span className="relative z-10">
                          {vault.status === 'completed' ? 'REVIEW' : isLocked ? 'LOCKED' : 'INITIATE'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings HUD (Bottom Corners) ── */}
      <div className="absolute bottom-6 left-6 z-40 border border-cyan-500/40 bg-black/50 p-3 rounded hover:bg-cyan-500/20 cursor-pointer pointer-events-auto transition-colors">
        <div className="w-6 h-1 bg-cyan-500 mb-1" />
        <div className="w-6 h-1 bg-cyan-500 mb-1" />
        <div className="w-4 h-1 bg-cyan-500" />
      </div>
      <div className="absolute bottom-6 right-6 z-40 border border-cyan-500/40 bg-black/50 p-3 rounded hover:bg-cyan-500/20 cursor-pointer pointer-events-auto transition-colors">
        <HelpCircle size={24} className="text-cyan-400" />
      </div>

    </div>
  );
}