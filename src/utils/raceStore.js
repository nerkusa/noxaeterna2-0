import { RACES } from '../data/races';

// Runtime race list. App injects custom races (from Firebase) via setRaces();
// when none are configured we fall back to the built-in RACES.
let _races = null;
export function setRaces(r) { _races = (Array.isArray(r) && r.length) ? r : null; }
export function getRaces() { return _races || RACES; }
