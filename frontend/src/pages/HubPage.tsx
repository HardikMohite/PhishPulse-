import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield as ShieldIcon,
  Lock as LockIcon,
  Terminal as TerminalIcon,
  CheckCircle,
  ChevronRight,
  Activity as ActivityIcon,
  Zap as ZapIcon,
  Target as TargetIcon,
  Swords as SwordsIcon,
  AlertTriangle,
  Monitor as MonitorIcon,
  Globe as GlobeIcon,
  ShieldCheck as ShieldCheckIcon,
  Heart as HeartIcon,
  Mail as MailIcon,
  Send as SendIcon,
  Vault as VaultIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomShield from '@/components/CustomShield';
import { useAuthStore } from '@/store/authStore';

const BRAND_CYAN = '#06b6d4';
const VAULT_COUNT = 5;

interface HubParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  canvasWidth: number;
  canvasHeight: number;
}

const createParticle = (cw: number, ch: number): HubParticle => ({
  x: Math.random() * cw,
  y: Math.random() * ch,
  vx: (Math.random() - 0.5) * 0.5,
  vy: (Math.random() - 0.5) * 0.5,
  size: Math.random() * 2,
  canvasWidth: cw,
  canvasHeight: ch,
});

const updateParticle = (p: HubParticle) => {
  p.x += p.vx;
  p.y += p.vy;
  if (p.x < 0 || p.x > p.canvasWidth) p.vx *= -1;
  if (p.y < 0 || p.y > p.canvasHeight) p.vy *= -1;
};

const drawParticle = (p: HubParticle, ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = BRAND_CYAN;
  ctx.globalAlpha = 0.4;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  ctx.fill();
};

const ParticleCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: HubParticle[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 80 }, () =>
        createParticle(canvas.width, canvas.height)
      );
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        updateParticle(p);
        drawParticle(p, ctx);
        particles.forEach((p2) => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = BRAND_CYAN;
            ctx.globalAlpha = 0.1 * (1 - dist / 100);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();
    const handleResize = () => init();
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ background: '#0a0a0f' }}
    />
  );
};

const NetworkAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const countersRef = useRef({ blocked: 0, detected: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const nodeConfigs = [
      { id: 'SERVER_P1', label: 'SERVER_P1', x: 0.5, y: 0.18, type: 'safe' },
      { id: 'DEVICE_A', label: 'DEVICE_A', x: 0.18, y: 0.32, type: 'safe' },
      { id: 'DEVICE_B', label: 'DEVICE_B', x: 0.78, y: 0.28, type: 'safe' },
      { id: 'GATEWAY', label: 'GATEWAY', x: 0.3, y: 0.62, type: 'safe' },
      { id: 'NODE_X', label: 'NODE_X', x: 0.68, y: 0.58, type: 'safe' },
      { id: 'ENDPOINT', label: 'ENDPOINT', x: 0.5, y: 0.8, type: 'safe' },
      { id: 'THREAT_NODE', label: 'THREAT_NODE', x: 0.5, y: 0.94, type: 'threat' },
    ];

    const nodes = nodeConfigs.map((config, index) => ({
      ...config,
      px: config.x * canvas.width,
      py: config.y * canvas.height,
      phase: index * (Math.PI / 4),
      orbit: 0,
      glow: 0,
      flicker: 0,
      radar: 0,
      successPulse: 0,
    }));

    const edges: any[] = [];
    const threshold = canvas.width * 0.38;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].type === 'safe' && nodes[j].type === 'safe') {
          const dx = nodes[i].px - nodes[j].px;
          const dy = nodes[i].py - nodes[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < threshold) {
            edges.push({
              n1: nodes[i],
              n2: nodes[j],
              dots: Array.from({ length: 2 }, () => ({
                pos: Math.random(),
                speed: 0.001 + Math.random() * 0.002,
                opacity: 0,
              })),
            });
          }
        }
      }
    }

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: 1.5,
    }));

    let packets: any[] = [];
    let alerts: any[] = [];
    let lastTime = performance.now();
    let spawnTimer = 2000;

    const createPacket = (from: any, to: any, type: 'safe' | 'phishing') => {
      const midX = (from.px + to.px) / 2;
      const midY = (from.py + to.py) / 2;
      const angle = Math.atan2(to.py - from.py, to.px - from.px);
      const dist = Math.sqrt(Math.pow(to.px - from.px, 2) + Math.pow(to.py - from.py, 2));
      const offset = dist * 0.25;
      const cpX = midX + Math.cos(angle + Math.PI / 2) * offset;
      const cpY = midY + Math.sin(angle + Math.PI / 2) * offset;
      packets.push({ from, to, type, cpX, cpY, progress: 0, speed: 0.0008 + Math.random() * 0.0005, trail: [] });
    };

    const getBezierPoint = (t: number, p0: any, p1: any, p2: any) => ({
      x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
      y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
    });

    const drawMonitor = (x: number, y: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x - 7, y - 6, 14, 10);
      ctx.beginPath(); ctx.moveTo(x - 3, y + 6); ctx.lineTo(x + 3, y + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 1, y + 4); ctx.lineTo(x - 1, y + 6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 1, y + 4); ctx.lineTo(x + 1, y + 6); ctx.stroke();
    };

    const drawDanger = (x: number, y: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y - 1, 1, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x - 0.5, y + 1, 1, 3);
    };

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255,255,255,0.012)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
      }

      particles.forEach((p, i) => {
        p.x += p.vx * (deltaTime / 16);
        p.y += p.vy * (deltaTime / 16);
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 80) {
            ctx.strokeStyle = `rgba(6,182,212,${0.06 * (1 - d / 80)})`;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;

      edges.forEach((edge) => {
        ctx.strokeStyle = 'rgba(6,182,212,0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(edge.n1.px, edge.n1.py); ctx.lineTo(edge.n2.px, edge.n2.py); ctx.stroke();
        edge.dots.forEach((dot: any) => {
          dot.pos += dot.speed * (deltaTime / 16);
          if (dot.pos > 1) dot.pos = 0;
          const x = edge.n1.px + (edge.n2.px - edge.n1.px) * dot.pos;
          const y = edge.n1.py + (edge.n2.py - edge.n1.py) * dot.pos;
          const dotAlpha = Math.sin(dot.pos * Math.PI) * 0.4;
          ctx.fillStyle = `rgba(6,182,212,${dotAlpha})`;
          ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI * 2); ctx.fill();
        });
      });

      spawnTimer -= deltaTime;
      if (spawnTimer <= 0) {
        spawnTimer = 1800 + Math.random() * 1700;
        const isSafe = Math.random() < 0.7;
        const safes = nodes.filter((n) => n.type === 'safe');
        if (isSafe) {
          const s1 = safes[Math.floor(Math.random() * safes.length)];
          let s2 = safes[Math.floor(Math.random() * safes.length)];
          while (s1 === s2) s2 = safes[Math.floor(Math.random() * safes.length)];
          createPacket(s1, s2, 'safe');
        } else {
          const target = safes[Math.floor(Math.random() * safes.length)];
          createPacket(nodes.find((n) => n.type === 'threat'), target, 'phishing');
        }
      }

      packets = packets.filter((p) => {
        p.progress += p.speed * (deltaTime / 16);
        const pos = getBezierPoint(p.progress, { x: p.from.px, y: p.from.py }, { x: p.cpX, y: p.cpY }, { x: p.to.px, y: p.to.py });
        p.trail.push(pos);
        if (p.trail.length > 45) p.trail.shift();
        const color = p.type === 'safe' ? '#06b6d4' : '#ef4444';
        p.trail.forEach((posT: any, idx: number) => {
          const fadeRatio = idx / p.trail.length;
          ctx.globalAlpha = Math.pow(fadeRatio, 2) * 0.7;
          ctx.fillStyle = color;
          const size = 0.5 + fadeRatio * 2;
          ctx.beginPath(); ctx.arc(posT.x, posT.y, size, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(Math.atan2(p.to.py - p.from.py, p.to.py - p.from.py));
        ctx.fillRect(-4, -2.5, 8, 5);
        ctx.restore();
        ctx.shadowBlur = 0;
        if (p.type === 'phishing' && p.progress > 0.6) {
          p.to.flicker = Math.random() > 0.5 ? 1 : 0;
        }
        if (p.progress >= 1) {
          if (p.type === 'safe') {
            p.to.glow = 1;
            countersRef.current.blocked++;
            alerts.push({ x: p.to.px, y: p.to.py - 25, text: '✓ SECURED', color: '#22c55e', life: 1, type: 'secured' });
          } else {
            p.to.flicker = 1;
            countersRef.current.detected++;
            p.from.successPulse = 1;
            alerts.push({ x: p.to.px, y: p.to.py - 25, text: '⚠ PHISHING ATTEMPT', color: '#ef4444', life: 1, type: 'phishing', shake: 0 });
          }
          return false;
        }
        return true;
      });

      nodes.forEach((n) => {
        const isSafe = n.type === 'safe';
        const color = isSafe ? '#06b6d4' : '#ef4444';
        const pulseRate = isSafe ? 0.002 : 0.005;
        const opacity = 0.3 + Math.sin(time * pulseRate + n.phase) * 0.2;
        n.orbit += (isSafe ? 0.01 : 0.02) * (deltaTime / 16);
        ctx.strokeStyle = `rgba(${isSafe ? '6,182,212' : '239,68,68'}, 0.1)`;
        ctx.beginPath(); ctx.arc(n.px, n.py, 32, 0, Math.PI * 2); ctx.stroke();
        const ox = n.px + Math.cos(n.orbit) * 32;
        const oy = n.py + Math.sin(n.orbit) * 32;
        ctx.fillStyle = `rgba(${isSafe ? '6,182,212' : '239,68,68'}, 0.3)`;
        ctx.beginPath(); ctx.arc(ox, oy, 2, 0, Math.PI * 2); ctx.fill();
        let strokeColor = color;
        if (isSafe && n.glow > 0) { n.glow -= 0.02 * (deltaTime / 16); strokeColor = `rgba(34,197,94,${n.glow})`; }
        if (n.flicker > 0) { n.flicker -= 0.05 * (deltaTime / 16); if (Math.round(time / 40) % 2 === 0) strokeColor = '#ef4444'; }
        if (!isSafe) {
          n.radar += 0.01 * (deltaTime / 16);
          if (n.radar > 1) n.radar = 0;
          ctx.strokeStyle = `rgba(239,68,68, ${0.4 * (1 - n.radar)})`;
          ctx.beginPath(); ctx.arc(n.px, n.py, 20 + n.radar * 40, 0, Math.PI * 2); ctx.stroke();
          if (n.successPulse > 0) { n.successPulse -= 0.02; ctx.shadowBlur = 20 * n.successPulse; ctx.shadowColor = '#ef4444'; }
        }
        ctx.strokeStyle = isSafe ? `rgba(6,182,212,${opacity})` : `rgba(239,68,68,${opacity * 1.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(n.px, n.py, 24, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(n.px, n.py, 18, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (isSafe) drawMonitor(n.px, n.py, color);
        else drawDanger(n.px, n.py, color);
        ctx.fillStyle = color;
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.px, n.py + 45);
        ctx.shadowBlur = 0;
      });

      alerts = alerts.filter((a) => {
        a.life -= 0.01 * (deltaTime / 16);
        a.y -= 0.5 * (deltaTime / 16);
        if (a.type === 'phishing') a.shake = Math.round(time / 60) % 2 === 0 ? 4 : -4;
        ctx.globalAlpha = a.life;
        const xPos = a.x + (a.shake || 0);
        const txtWidth = ctx.measureText(a.text).width;
        ctx.fillStyle = a.color;
        ctx.beginPath(); ctx.roundRect(xPos - txtWidth / 2 - 8, a.y - 12, txtWidth + 16, 18, 10); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(a.text, xPos, a.y);
        ctx.globalAlpha = 1;
        return a.life > 0;
      });

      const statusActive = Math.round(time / 800) % 2 === 0;
      ctx.textAlign = 'right';
      ctx.fillStyle = '#22c55e';
      ctx.font = '10px monospace';
      ctx.fillText('SYSTEM STATUS: ACTIVE', canvas.width - 30, 30);
      if (statusActive) { ctx.beginPath(); ctx.arc(canvas.width - 20, 27, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.textAlign = 'left';
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`THREATS BLOCKED: ${countersRef.current.blocked}`, 30, canvas.height - 50);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`ATTACKS DETECTED: ${countersRef.current.detected}`, 30, canvas.height - 30);

      requestAnimationFrame(animate);
    };

    const requestId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestId);
  }, [dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#0a0a0f] rounded-3xl overflow-hidden border border-white/5">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    className="flex-1 bg-[#0f172a]/60 backdrop-blur-md border border-white/5 border-l-2 border-l-cyan-500/60 p-4 rounded-xl transition-all hover:bg-white/5"
  >
    <div className="w-10 h-10 flex items-center justify-center text-cyan-400 mb-4">
      <Icon className="w-8 h-8 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
    </div>
    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{title}</h4>
    <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

export default function HubPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const handleEnterCommandCenter = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 selection:bg-cyan-500/30 overflow-y-auto font-sans flex flex-col">
      <ParticleCanvas />

      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 max-w-7xl mx-auto w-full">
        {/* Navigation/Logo Header */}
        <div className="absolute top-8 left-6 right-6 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [0, 2, 0, -2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CustomShield className="text-cyan-400 w-9 h-9" strokeWidth={1.5} />
            </motion.div>
            <div className="flex flex-col leading-none">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tighter text-white uppercase">PHISH</span>
                <span className="text-3xl font-black tracking-tighter text-cyan-400 uppercase">PULSE</span>
              </div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Defensive Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline font-mono text-[10px] text-slate-600 uppercase tracking-widest animate-pulse">
              System Status: Active
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left Column */}
          <div className="text-left space-y-6">
            <div className="space-y-8 flex flex-col items-start w-fit max-w-full">
              <div className="relative">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[1.1] uppercase flex flex-wrap max-w-2xl">
                  {'Building the Human Firewall'.split(' ').map((word, i) => (
                    <span key={i} className="inline-block overflow-hidden mr-[0.25em] py-1">
                      <motion.span
                        initial={{ y: '110%' }}
                        animate={{ y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        className={`inline-block ${word.toUpperCase() === 'HUMAN' || word.toUpperCase() === 'FIREWALL' ? 'text-cyan-400' : ''}`}
                      >
                        {word}
                      </motion.span>
                    </span>
                  ))}
                </h1>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.8, duration: 1.2, ease: 'circOut' }}
                  className="absolute -bottom-2 left-0 h-1.5 bg-cyan-500 shadow-[0_0_25px_rgba(6,182,212,1)] rounded-full z-20"
                />
              </div>
            </div>

            <p className="text-lg text-slate-400 max-w-md leading-relaxed font-medium">
              Your Organization's Cyber Defense Training Platform. Experience high-fidelity simulations that transform vulnerability into tactical advantage.
            </p>

            <motion.button
              onClick={handleEnterCommandCenter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-10 py-5 bg-cyan-600/10 border-2 border-cyan-500/50 text-white font-black uppercase tracking-[0.3em] rounded-xl transition-all flex items-center gap-4 overflow-hidden hover:bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              style={{ animation: 'pulse-glow 2s infinite ease-in-out' }}
            >
              {isAuthenticated ? 'Enter Dashboard' : 'Enter Command Center'}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-cyan-400" />
            </motion.button>
          </div>

          {/* Right Column - Network Animation */}
          <div className="w-full aspect-square max-w-[500px] mx-auto hidden lg:block overflow-hidden rounded-3xl border border-white/5 shadow-2xl mt-12 lg:mt-24">
            <NetworkAnimation />
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          <FeatureItem icon={VaultIcon} title={`${VAULT_COUNT}+ Threat Types Covered`} description="Exhaustive library of tactical simulation modules." />
          <FeatureItem icon={SwordsIcon} title="Real-Time Incident Simulation" description="Live-action response training for current breach vectors." />
          <FeatureItem icon={ZapIcon} title="AI-Powered Phishing Detection" description="Context-aware algorithms adapted to evolving human risks." />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pt-32 pb-12 px-6 border-t border-white/5 bg-[#050507] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-4 group">
                <div className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <CustomShield className="text-cyan-400 w-8 h-8 transition-transform group-hover:scale-110" strokeWidth={1.5} />
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                    PHISH<span className="text-cyan-500">PULSE</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em]">Infrastructure_Stable</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-base leading-relaxed max-w-sm font-medium text-left">
                Pioneering defensive awareness for the next generation of digital infrastructure. We turn organizational vulnerability into tactical resilience.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12 text-left">
              {[
                { label: 'Operation', items: ['Dashboard', 'Simulation', 'Training', 'Intelligence'] },
                { label: 'Company', items: ['About', 'Careers', 'Security', 'Legal'] },
                { label: 'System', items: ['API Status', 'Change Logs', 'Compliance', 'Uptime'] },
              ].map((group) => (
                <div key={group.label} className="space-y-6">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">{group.label}</h4>
                  <ul className="space-y-3">
                    {group.items.map((item) => (
                      <li key={item}>
                        <a href="#" className="text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8">
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                PHISHPULSE © 2026 // <span className="text-slate-800">ISO_27001_CERTIFIED</span>
              </p>
            </div>
            <div className="flex gap-10">
              {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                <a key={social} href="#" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(6,182,212,0.3); border-color: rgba(6,182,212,0.3); }
          50% { box-shadow: 0 0 35px rgba(6,182,212,0.7); border-color: rgba(6,182,212,0.7); }
        }
      `}</style>
    </div>
  );
}