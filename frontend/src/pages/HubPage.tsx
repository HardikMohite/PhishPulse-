import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Clock, Brain, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Dynamic vault count — update this as vaults are added
const VAULT_COUNT = 5;

const FEATURES = [
  {
    icon: ShieldCheck,
    title: `${VAULT_COUNT}+ Threat Types Covered`,
    description: "Interactive vaults teaching modern phishing attacks.",
    dynamic: true,
  },
  {
    icon: Clock,
    title: "Real-Time Incident Simulation",
    description: "Practice responding to live cyber incidents.",
    dynamic: false,
  },
  {
    icon: Brain,
    title: "AI-Powered Phishing Detection",
    description: "Dynamic scenarios generated using AI.",
    dynamic: false,
  },
];

// Particle network canvas
function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 60;
    const CONNECTION_DIST = 150;
    const CYAN = "rgba(6, 182, 212,";

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
    };

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const opacity = 1 - dist / CONNECTION_DIST;
            ctx.beginPath();
            ctx.strokeStyle = `${CYAN}${opacity * 0.35})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${CYAN}0.7)`;
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// Sparkle icon bottom right
function Sparkle() {
  return (
    <motion.div
      className="absolute bottom-6 right-6"
      animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path
          d="M18 2L20.5 15.5L34 18L20.5 20.5L18 34L15.5 20.5L2 18L15.5 15.5L18 2Z"
          fill="#06b6d4"
          opacity="0.85"
        />
        <path
          d="M28 6L29.2 11.8L35 13L29.2 14.2L28 20L26.8 14.2L21 13L26.8 11.8L28 6Z"
          fill="#06b6d4"
          opacity="0.5"
        />
      </svg>
    </motion.div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HubPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleEnterCommandCenter = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#0a0a0f", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Particle background */}
      <ParticleNetwork />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center px-6 py-12 w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 mb-10"
        >
          <Shield
            size={28}
            className="text-cyan-400"
            strokeWidth={1.8}
          />
          <span className="text-2xl font-semibold tracking-wide">
            <span style={{ color: "#f8fafc" }}>Phish</span>
            <span style={{ color: "#06b6d4" }}>Pulse</span>
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          className="text-4xl md:text-5xl font-bold text-white text-center leading-tight mb-4"
          style={{ letterSpacing: "-0.5px" }}
        >
          PhishPulse Command Center
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          className="text-base md:text-lg text-center mb-2"
          style={{ color: "#06b6d4" }}
        >
        Building the Human Firewall
        </motion.p>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="text-sm text-center mb-12"
          style={{ color: "#94a3b8" }}
        >
        Your Organization's Cyber Defense Training Platform  
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mb-12"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="flex flex-col items-center text-center p-6 rounded-xl"
                style={{
                  background: "rgba(6, 182, 212, 0.04)",
                  border: "1px solid rgba(6, 182, 212, 0.35)",
                  boxShadow: "0 0 18px rgba(6, 182, 212, 0.08), inset 0 0 20px rgba(6,182,212,0.03)",
                  backdropFilter: "blur(8px)",
                }}
                whileHover={{
                  borderColor: "rgba(6, 182, 212, 0.7)",
                  boxShadow: "0 0 28px rgba(6, 182, 212, 0.18), inset 0 0 20px rgba(6,182,212,0.06)",
                  transition: { duration: 0.2 },
                }}
              >
                <div
                  className="mb-4 p-3 rounded-full"
                  style={{
                    background: "rgba(6, 182, 212, 0.08)",
                    border: "1px solid rgba(6, 182, 212, 0.25)",
                  }}
                >
                  <Icon size={28} style={{ color: "#06b6d4" }} strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3">
          <motion.button
            onClick={handleEnterCommandCenter}
            className="relative px-10 py-4 text-white font-semibold text-base rounded-lg tracking-wide"
            style={{
              background: "transparent",
              border: "2px solid #06b6d4",
              boxShadow: "0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.05)",
              minWidth: "280px",
              cursor: "pointer",
            }}
            whileHover={{
              boxShadow: "0 0 35px rgba(6, 182, 212, 0.65), inset 0 0 20px rgba(6, 182, 212, 0.1)",
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            whileTap={{ scale: 0.98 }}
          >
            {isAuthenticated ? "Enter Dashboard" : "Enter Command Center"}
          </motion.button>

          <p className="text-xs" style={{ color: "#475569" }}>
            Authorized personnel only
          </p>
        </motion.div>
      </motion.div>

      {/* Sparkle */}
      <Sparkle />
    </div>
  );
}