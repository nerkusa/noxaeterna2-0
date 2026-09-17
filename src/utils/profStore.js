import { PROFS } from '../data/professions';

// Runtime profession list. App injects custom professions (Firebase) via setProfs();
// falls back to built-in PROFS when none configured.
let _profs = null;
export function setProfs(p) { _profs = (Array.isArray(p) && p.length) ? p : null; }
export function getProfs() { return _profs || PROFS; }
