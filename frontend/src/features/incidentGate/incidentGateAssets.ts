/**
 * incidentGateAssets.ts
 *
 * Imports each gate image as a raw text string (via Vite's `?raw` suffix) —
 * the .b64 files contain only the base64 payload without the data-URL prefix.
 * We prepend `data:image/jpeg;base64,` so the browser can render them
 * directly as <img src="..."> values.
 *
 * Why `?raw`?
 *   A normal Vite asset import returns a URL path to the copied file.
 *   `?raw` inlines the file's text content as a JS string — exactly what we
 *   need to build a data URL from a bare base64 file.
 */

import gateLockedRaw from './assets/gate_locked.b64?raw';
import gateCyanRaw from './assets/gate_cyan.b64?raw';
import lockHologramRaw from './assets/lock_hologram.b64?raw';
import energyHologramRaw from './assets/energy_hologram.b64?raw';

const toDataUrl = (raw: string) =>
  `data:image/jpeg;base64,${raw.trim()}`;

export const gateLockedImage = toDataUrl(gateLockedRaw);
export const gateCyanImage = toDataUrl(gateCyanRaw);
export const lockHologram = toDataUrl(lockHologramRaw);
export const energyHologram = toDataUrl(energyHologramRaw);