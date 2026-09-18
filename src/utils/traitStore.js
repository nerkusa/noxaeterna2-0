import { TRAITS } from '../data/traits';

// Runtime trait catalog. App injects room-custom traits via setTraits();
// falls back to built-in TRAITS when none configured.
let _traits = null;
export function setTraits(t) { _traits = (Array.isArray(t) && t.length) ? t : null; }
export function getTraits() { return _traits || TRAITS; }
