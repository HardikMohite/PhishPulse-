import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check } from 'lucide-react';

interface VaultCubeProps {
    id: number;
    title: string;
    status: 'locked' | 'unlocked' | 'completed';
    top: string;
    left: string;
    onClick: () => void;
    selected: boolean;
}

export default function VaultCube({ id, title, status, top, left, onClick, selected }: VaultCubeProps) {
    const [isHovered, setIsHovered] = useState(false);
    const isLocked = status === 'locked';
    const isCompleted = status === 'completed';
    const isCurrent = status === 'unlocked';

    // Base colors
    const mainColor = isCurrent ? '#06b6d4' : isCompleted ? '#3b82f6' : '#334155';
    const glowShadow = isCurrent ? '0 0 30px rgba(6,182,212,0.8)' : isCompleted ? '0 0 15px rgba(59,130,246,0.4)' : 'none';
    const baseRingColor = selected ? 'rgba(6,182,212,1)' : isCurrent ? 'rgba(6,182,212,0.8)' : isCompleted ? 'rgba(59,130,246,0.5)' : 'rgba(51,65,85,0.4)';

    const cubeSize = 80;

    return (
        <div
            className="absolute cursor-pointer flex flex-col items-center justify-end transition-transform duration-300"
            style={{
                top,
                left,
                width: 140, // Container size
                height: 160,
                transform: `translate(-50%, ${isHovered && !isLocked ? '-55%' : '-50%'})`,
                zIndex: selected || isHovered ? 50 : (20 - id) // Higher id nodes render in front on isometric map
            }}
            onClick={!isLocked ? onClick : undefined}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Title Label (Visible on Hover or Selected) */}
            <AnimatePresence>
                {(selected || isHovered) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: selected ? 1.1 : 1, y: -10 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute -top-10 whitespace-nowrap px-4 py-1.5 rounded bg-black/80 border backdrop-blur-sm text-sm font-bold z-20 shadow-lg ${selected || isCurrent ? 'text-cyan-400 border-cyan-500/50 shadow-cyan-500/20' : 'text-blue-200 border-blue-500/30 shadow-blue-500/10'}`}
                    >
                        {isLocked && <Lock size={14} className="inline mr-1.5 -mt-0.5 text-slate-400" />}
                        {isCompleted && <Check size={14} className="inline mr-1.5 -mt-0.5" />}
                        {title}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative" style={{ width: cubeSize, height: cubeSize * 1.5 }}>

                {/* Isometric base shadows and glowing plates */}
                <div className="absolute left-[20px] top-[74px] w-[56px] h-[56px] origin-center transition-all duration-300"
                    style={{
                        transform: `rotateX(60deg) rotateZ(45deg) ${selected ? 'scale(1.3)' : 'scale(1.15)'}`,
                    }}
                >
                    {/* Dark ambient occlusion shadow (anchors the cube) */}
                    <div className="absolute inset-0 bg-black/80 blur-md rounded-sm transform translate-y-2 translate-x-2" />

                    {/* Glowing base plate */}
                    <div className="absolute inset-[-4px] border-2 rounded-sm"
                        style={{
                            borderColor: baseRingColor,
                            background: isCurrent ? 'rgba(6,182,212,0.1)' : isCompleted ? 'rgba(59,130,246,0.05)' : 'rgba(51,65,85,0.1)',
                            boxShadow: `0 0 15px ${baseRingColor}, inset 0 0 10px ${baseRingColor}`,
                            mixBlendMode: 'screen'
                        }}
                    />

                    {/* Inner detail ring */}
                    <div className="absolute inset-[6px] border border-dashed rounded-sm"
                        style={{
                            borderColor: baseRingColor,
                            opacity: 0.6
                        }}
                    />
                </div>

                {/* --- 3D CSS CUBE CONSTRUCTION --- */}
                {/* 
                   Perfect Isometric Math:
                   Side width = 40px
                   Side height = 50px
                   Skew = 26.565deg (atan(0.5))
                   Vertical offset = W/2 = 20px
                   Top Face width/height for rotation = W/cos(45) approx 56.5px
                */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80px] h-[70px] origin-bottom transition-all duration-300"
                    style={{
                        filter: `drop-shadow(${glowShadow})`
                    }}
                >
                    {/* Top Face (Rhombus) */}
                    <div className="absolute origin-center"
                        style={{
                            width: '56.568px',  /* 40 * sqrt(2) */
                            height: '56.568px',
                            top: '-8.284px',     /* Centering adjustment */
                            left: '11.716px',    /* Centering adjustment */
                            transform: 'rotateX(60deg) rotateZ(45deg)', /* Standard isometric top face projection */
                            background: isCurrent ? 'rgba(6,182,212,0.6)' : isCompleted ? 'rgba(59,130,246,0.3)' : 'rgba(30,41,59,0.5)',
                            border: `2px solid ${mainColor}`,
                            boxShadow: isCurrent ? 'inset 0 0 20px rgba(6,182,212,0.6)' : 'inset 0 0 10px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Inner Top Frame Detailing */}
                        <div className="absolute inset-2 border-[1.5px] border-cyan-500/30 rounded-full flex items-center justify-center bg-black/40" style={{ borderColor: isLocked ? 'rgba(51,65,85,0.4)' : mainColor }}>
                            {/* Glowing Center Core — spins on hover via framer-motion */}
                            <motion.div
                                className="w-6 h-6 rounded-full border border-cyan-400/50 flex items-center justify-center"
                                animate={{ rotate: isHovered && !isLocked ? 90 : 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ background: isCurrent ? 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' : 'transparent', borderColor: isLocked ? 'rgba(51,65,85,0.4)' : mainColor }}
                            >
                                <div className="w-2 h-2 rounded-full" style={{ background: mainColor, boxShadow: isCurrent ? '0 0 10px #a5f3fc' : 'none' }} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Left Face (Side Panel) */}
                    <div className="absolute origin-top-left overflow-hidden"
                        style={{
                            width: '40px',
                            height: '50px',
                            top: '20px',
                            left: '0px',
                            transform: 'skewY(26.565deg)',
                            background: isCurrent ? 'linear-gradient(to bottom right, rgba(6,182,212,0.15), rgba(6,182,212,0.02))' : isCompleted ? 'rgba(59,130,246,0.1)' : 'rgba(9,14,23,0.9)',
                            border: `2px solid ${mainColor}`,
                            borderRight: 'none',
                            borderTop: 'none',
                            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)'
                        }}
                    >
                        {/* Outer Left Frame */}
                        <div className="absolute inset-[3px] border border-cyan-500/20 rounded-sm bg-black/30 flex justify-center" style={{ borderColor: isLocked ? 'rgba(51,65,85,0.3)' : mainColor }}>
                            {/* Central panel indentation */}
                            <div className="w-4 my-2 border border-cyan-500/30 bg-black/50 flex flex-col items-center justify-around py-1" style={{ borderColor: isLocked ? 'rgba(51,65,85,0.2)' : 'rgba(6,182,212,0.3)' }}>
                                <div className="w-2.5 h-0.5 rounded-full" style={{ background: isLocked ? '#334155' : '#06b6d4', opacity: 0.6 }} />
                                <div className="w-2.5 h-0.5 rounded-full" style={{ background: isLocked ? '#334155' : '#06b6d4', opacity: 0.6 }} />
                                <div className="w-2.5 h-0.5 rounded-full" style={{ background: isLocked ? '#334155' : '#06b6d4', opacity: 0.6 }} />
                            </div>
                        </div>
                    </div>

                    {/* Right Face (Vault Door) */}
                    <div className="absolute origin-top-left overflow-hidden"
                        style={{
                            width: '40px',
                            height: '50px',
                            top: '40px',
                            left: '40px',
                            transform: 'skewY(-26.565deg)',
                            background: isCurrent ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))' : isCompleted ? 'rgba(59,130,246,0.1)' : 'rgba(2,6,23,0.95)',
                            border: `2px solid ${mainColor}`,
                            borderLeft: 'none',
                            borderTop: 'none',
                            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.9)'
                        }}
                    >
                        {/* Outer Door Frame */}
                        <div className="absolute inset-[4px] border border-cyan-500/40 rounded-sm bg-slate-950 shadow-[inset_0_0_10px_rgba(0,0,0,1)]" style={{ borderColor: isLocked ? 'rgba(51,65,85,0.4)' : mainColor }}>

                            {/* Vault Wheel / Dial Background Ridge */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-black bg-black/80 flex items-center justify-center">
                                {/* Actual Rotating Dial */}
                                <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-900 shadow-inner"
                                    style={{ borderColor: mainColor, boxShadow: isCurrent ? '0 0 8px rgba(6,182,212,0.6)' : 'none' }}>
                                    {/* Inner spinner spokes */}
                                    <div className="absolute w-full h-[1.5px]" style={{ background: mainColor }} />
                                    <div className="absolute w-[1.5px] h-full" style={{ background: mainColor }} />
                                    {/* Center locking pin */}
                                    <div className="absolute w-2.5 h-2.5 rounded-full border-[1.5px] border-black" style={{ background: mainColor }} />
                                </div>
                            </div>

                            {/* Horizontal Locking Bars (left side of door connecting to frame) */}
                            <div className="absolute left-[-4px] top-[20%] w-2 h-1.5 border-y border-r border-black rounded-r-sm z-10" style={{ background: mainColor }} />
                            <div className="absolute left-[-4px] top-[50%] -translate-y-1/2 w-2 h-1.5 border-y border-r border-black rounded-r-sm z-10" style={{ background: mainColor }} />
                            <div className="absolute left-[-4px] bottom-[20%] w-2 h-1.5 border-y border-r border-black rounded-r-sm z-10" style={{ background: mainColor }} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}