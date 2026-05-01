/**
 * gateConfig.ts
 * Reads the VITE_INCIDENT_GATE_LOCKED environment variable and exposes it
 * as a typed boolean constant for use throughout the incidentGate feature.
 *
 * Set VITE_INCIDENT_GATE_LOCKED=true  → gate is locked   (access denied)
 * Set VITE_INCIDENT_GATE_LOCKED=false → gate is unlocked (access allowed)
 */

export const isGateLocked: boolean =
  import.meta.env.VITE_INCIDENT_GATE_LOCKED === "true";
