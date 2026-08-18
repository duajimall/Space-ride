// Deterministic-ish fictional cosmic name generator.
// Combines a "catalog" prefix with an invented star/nebula word and a
// roman-numeral-style designation, e.g. "Nebula Kaelvire IX", "Aurora Sythrion II".

const CATALOGS = [
  'Nebula', 'Comet', 'Quasar', 'Aurora', 'Vela', 'Lyra', 'Orion', 'Corona',
  'Halcyon', 'Solace', 'Meridian', 'Zenith', 'Eclipse', 'Borealis', 'Celestia',
  'Voyager', 'Wanderer', 'Cascade', 'Drift', 'Echo', 'Lumen', 'Tidal', 'Astra',
  'Ember', 'Glacia', 'Umbral', 'Radiant', 'Silken', 'Hollow', 'Pale'
]

const ROOTS = [
  'Kael', 'Syth', 'Vantor', 'Orix', 'Nyra', 'Thess', 'Velin', 'Mordris',
  'Halvex', 'Corvyn', 'Elowen', 'Ashryn', 'Talvor', 'Ondrix', 'Fenwyr',
  'Ilyra', 'Draven', 'Selvix', 'Marren', 'Quorin', 'Aveth', 'Isolde',
  'Ryven', 'Thalor', 'Zephyra', 'Corian', 'Naveth', 'Kestryl', 'Voss', 'Wrenna'
]

const SUFFIXES = ['ion', 'wen', 'dris', 'vos', 'lune', 'ara', 'eth', 'oria', 'nyx', 'thys', 'ire', 'ene']

const DESIGNATIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']

function seedFromString(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

/**
 * Generates a cosmic name from a stable input (the file's content hash).
 * Pass `attempt` > 0 to get a different-but-still-deterministic variant
 * if the first result collides with an existing name in the database.
 */
export function generateCosmicName(seedInput: string, attempt = 0): string {
  const rng = mulberry32(seedFromString(seedInput + ':' + attempt))
  const catalog = pick(rng, CATALOGS)
  const root = pick(rng, ROOTS)
  const suffix = pick(rng, SUFFIXES)
  const designation = pick(rng, DESIGNATIONS)
  const word = root + suffix
  return `${catalog} ${word} ${designation}`
}
