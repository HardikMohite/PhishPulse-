import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { logout, getMe } from '@/services/authService';
import AppHeader from '@/components/layout/AppHeader';
import Sidebar from '@/components/layout/Sidebar';
import StoreDrawer from '@/components/layout/StoreDrawer';

import useGatePhase from '../hooks/useGatePhase';
import {
  gateLockedImage,
  gateCyanImage,
  lockHologram,
  energyHologram,
} from '../incidentGateAssets';

import styles from './IncidentGatePage.module.css';

/**
 * IncidentGatePage
 *
 * Redesigned layout:
 *  - No left/right HUD panels (removed)
 *  - "INCIDENT GATE" title lives at the top of the page content (below header)
 *  - Gate fills the center, larger
 *  - Gate outline glows via drop-shadow filter (not box-shadow on wrapper)
 *  - Hologram shifted 300 px lower
 *  - Sci-fi grid + floor-glow background enhancements
 */
const IncidentGatePage = () => {
  const navigate = useNavigate();
  const { phase, handleGateClick, onChargingComplete } = useGatePhase();

  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isStoreOpen, setIsStoreOpen] = useState(false);

  useEffect(() => {
    getMe().then(setUser).catch(() => {}).finally(() => setLoading(false));
  }, [setUser]);

  const xpToNextLevel = user ? user.level * 100 : 100;
  const xpPct = user ? Math.min((user.xp / xpToNextLevel) * 100, 100) : 0;

  const handleLogout = async () => {
    try { await logout(); } catch {}
    setUser(null);
    navigate('/auth/login');
  };

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const didNavigateRef = useRef(false);

  // ── Derived flags ────────────────────────────────────────────────────────
  const isCharging = phase === 'charging';
  const isReady    = phase === 'ready';
  const isEntering = phase === 'entering';
  const isOpen     = isReady || isEntering;

  const gateImage = isOpen ? gateCyanImage : gateLockedImage;
  const gateAlt   = isOpen ? 'Incident gate — open' : 'Incident gate — locked';

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <p className="text-white text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020d18] text-slate-200 flex overflow-x-hidden">
      <Sidebar activeTab="incident" onStoreClick={() => setIsStoreOpen(true)} onLogout={handleLogout} userName={user.name} />
      <div className="flex-1 ml-16 transition-all duration-300 flex flex-col">
        <AppHeader user={user} xpToNextLevel={xpToNextLevel} xpPct={xpPct} />
        <main className="flex-1">
          <div className={styles.root}>

            {/* Corner brackets */}
            <div className={styles.cornerTL} />
            <div className={styles.cornerTR} />
            <div className={styles.cornerBL} />
            <div className={styles.cornerBR} />

            {/* Sci-fi grid background */}
            <div className={styles.gridOverlay} />

            {/* Floor glow */}
            <div className={styles.floorGlow} />

            {/* ── Page title (now at the top of the page, not inside a side panel) ── */}
            <div className={styles.pageTitle}>
              <span className={styles.pageTitleWhite}>INCIDENT</span>
              <span className={styles.pageTitleRed}>GATE</span>
              <div className={styles.pageTitleUnderline} />
              <p className={styles.pageTitleSub}>BREACH TELEMETRY SIMULATION</p>
            </div>

            {/* ── Center panel — gate canvas ── */}
            <div className={styles.centerPanel}>
              <div className={styles.container}>

                {/* Gate wrapper — click target, no box-shadow glow */}
                <div
                  className={styles.layerWrapper}
                  onClick={handleGateClick}
                  role="button"
                  tabIndex={0}
                  aria-label={`Gate — ${phase}`}
                  onKeyDown={(e) => e.key === 'Enter' && handleGateClick()}
                >

                  {/* ── Layer 1: Gate base image ──────────────────────────────── */}
                  <motion.img
                    key={gateImage}
                    src={gateImage}
                    alt={gateAlt}
                    className={`${styles.gateImage} ${isOpen ? styles.gateImageGlowing : ''}`}
                    draggable={false}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* ── Layer 2: Cyan energy overlay ──────────────────────────── */}
                  <motion.img
                    src={gateCyanImage}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className={styles.overlayImage}
                    initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                    animate={isCharging
                      ? { clipPath: 'inset(0% 0% 0% 0%)' }
                      : { clipPath: 'inset(100% 0% 0% 0%)' }
                    }
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    onAnimationComplete={() => {
                      if (phaseRef.current === 'charging') {
                        onChargingComplete();
                      }
                    }}
                  />

                  {/* ── Layer 3: Hologram cross-fade ──────────────────────────── */}
                  <AnimatePresence mode="sync">

                    {!isOpen && (
                      <motion.img
                        key="lock-hologram"
                        src={lockHologram}
                        alt="Lock hologram"
                        draggable={false}
                        className={styles.hologramImage}
                        style={{ x: '-50%' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isCharging ? 0 : 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                      />
                    )}

                    {isOpen && (
                      <motion.img
                        key="energy-hologram"
                        src={energyHologram}
                        alt="Energy hologram"
                        draggable={false}
                        className={styles.hologramImage}
                        style={{ x: '-50%' }}
                        initial={{ opacity: 0, scale: 1 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          opacity: { duration: 0.8 },
                        }}
                      />
                    )}

                  </AnimatePresence>

                </div>
              </div>

              <p className={`${styles.hintText} ${isOpen ? styles.hintTextActive : ''}`}>
                {isOpen ? '[ click gate to enter simulation ]' : '[ awaiting authorization ]'}
              </p>

              {/* ── Layer 4: Enter flash ───────────────────────────────────── */}
              <AnimatePresence>
                {isEntering && (
                  <motion.div
                    className={styles.enterFlash}
                    aria-hidden
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    onAnimationComplete={() => {
                      if (!didNavigateRef.current) {
                        didNavigateRef.current = true;
                        navigate('/incident-gate/simulation');
                      }
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

          </div>
        </main>
      </div>
      <StoreDrawer isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} userCoins={user.coins} />
    </div>
  );
};

export default IncidentGatePage;