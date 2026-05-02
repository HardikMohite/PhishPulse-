import { useState, useEffect, useCallback } from 'react';
import { isGateLocked, GATE_REQUIREMENT } from '../utils/gateConfig';

// ─── Phase type ────────────────────────────────────────────────────────────────
/**
 * The four phases of the incident gate lifecycle:
 *
 *  locked    → gate is closed; user must click to begin the unlock sequence
 *  charging  → mid-transition; energy is building (animation plays)
 *  ready     → gate is open and waiting for the user to enter
 *  entering  → user has clicked the open gate; navigating into the incident
 */
export type GatePhase = 'locked' | 'charging' | 'ready' | 'entering';

// ─── Hook return shape ─────────────────────────────────────────────────────────
export interface UseGatePhaseReturn {
  /** Current phase of the gate state machine. */
  phase: GatePhase;
  showRequirements: boolean;
  closeRequirements: (granted?: boolean) => void;
  advanceToCharging: () => void;
  /**
   * Click handler attached to the gate visual.
   * locked    → advances to 'charging' (starts the energy-fill animation)
   * charging  → no-op (animation is already running, double-click ignored)
   * ready     → advances to 'entering' (starts the enter-flash animation)
   * entering  → no-op (navigation already in flight, double-click ignored)
   */
  handleGateClick: () => void;
  /**
   * Called by the page's Framer Motion onAnimationComplete callback when the
   * charging animation finishes, advancing the state from 'charging' → 'ready'.
   */
  onChargingComplete: () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useGatePhase
 *
 * Manages the gate phase state machine.
 *
 * Transition table:
 *   locked   --[handleGateClick]---→ charging
 *   charging --[onChargingComplete]-→ ready
 *   ready    --[handleGateClick]---→ entering
 *   entering --[flash anim end]----→ navigate('/incident-gate/simulation')
 */
const useGatePhase = (): UseGatePhaseReturn => {
  const [phase, setPhase] = useState<GatePhase>(() =>
    isGateLocked ? 'locked' : 'ready'
  );
  const [showRequirements, setShowRequirements] = useState(false);

  // Sync with the env flag on mount.
  useEffect(() => {
    setPhase(isGateLocked ? 'locked' : 'ready');
  }, []);

  const closeRequirements = useCallback((granted?: boolean) => {
    setShowRequirements(false);
    if (granted) {
      setPhase((current) => {
        if (current === 'locked') {
          console.log('[useGatePhase] locked → charging (requirements met)');
          return 'charging';
        }
        return current;
      });
    }
  }, []);

  const advanceToCharging = useCallback(() => {
    setPhase((current) => {
      if (current === 'locked') {
        console.log('[useGatePhase] locked → charging (bypassed reqs)');
        return 'charging';
      }
      return current;
    });
  }, []);

  /** locked → charging | ready → entering */
  const handleGateClick = useCallback(() => {
    setPhase((current) => {
      if (current === 'locked') {
        if (GATE_REQUIREMENT) {
          setShowRequirements(true);
          return current;
        } else {
          console.log('[useGatePhase] locked → charging');
          return 'charging';
        }
      }
      if (current === 'ready') {
        console.log('[useGatePhase] ready → entering');
        return 'entering';
      }
      // charging / entering → no-op (animation already in flight)
      return current;
    });
  }, []);

  /** charging → ready (called by page after animation completes) */
  const onChargingComplete = useCallback(() => {
    setPhase((current) => {
      if (current === 'charging') {
        console.log('[useGatePhase] charging → ready');
        return 'ready';
      }
      return current;
    });
  }, []);

  return { phase, handleGateClick, onChargingComplete, showRequirements, closeRequirements, advanceToCharging };
};

export default useGatePhase;

