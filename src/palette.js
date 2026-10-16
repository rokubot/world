/**
 * Roku World — Anime / Cel-Shaded Master Palette (Step 7.1)
 * Every material and visual element pulls from this file only.
 * Saturated but soft tones. No pure black fills (deep navy used for outlines and deep shadows).
 */

export const PALETTE = Object.freeze({
  // Outline & Deep Shadows (Deep navy instead of pure black)
  outline: 0x141a29,
  deepShadow: 0x0e131f,

  // Base Colors with Light & Shadow Tints
  skin: {
    base: 0xffcc99,
    light: 0xffe2c2,
    shadow: 0xe0a672
  },

  red: {
    base: 0xee4242,
    light: 0xff6b6b,
    shadow: 0xb32424
  },

  blue: {
    base: 0x3b82f6,
    light: 0x60a5fa,
    shadow: 0x1d4ed8
  },

  yellow: {
    base: 0xf59e0b,
    light: 0xfbbf24,
    shadow: 0xb45309
  },

  green: {
    base: 0x22c55e,
    light: 0x4ade80,
    shadow: 0x15803d
  },

  purple: {
    base: 0x8b5cf6,
    light: 0xa78bfa,
    shadow: 0x6d28d9
  },

  orange: {
    base: 0xf97316,
    light: 0xfb923c,
    shadow: 0xc2410c
  },

  gold: {
    base: 0xeab308,
    light: 0xfde047,
    shadow: 0xa16207
  },

  slate: {
    base: 0x475569,
    light: 0x64748b,
    shadow: 0x334155
  },

  dark: {
    base: 0x1e2430,
    light: 0x333e52,
    shadow: 0x141a29
  },

  white: {
    base: 0xf8fafc,
    light: 0xffffff,
    shadow: 0xdae2ed
  },

  // Biome & World Colors
  biome: {
    grass: 0x589e52,
    grassLight: 0x6dbf66,
    grassShadow: 0x40783c,

    sand: 0xe2ba6c,
    sandLight: 0xf0cf8a,
    sandShadow: 0xb88e45,

    snow: 0xe2e8f0,
    snowLight: 0xf8fafc,
    snowShadow: 0xcbd5e1,

    rock: 0x64748b,
    rockLight: 0x94a3b8,
    rockShadow: 0x475569,

    water: 0x38bdf8,
    waterDeep: 0x0284c7,
    waterFoam: 0xe0f2fe,

    road: 0x334155,
    roadMarking: 0xf1f5f9
  },

  // Atmosphere & Lighting
  atmosphere: {
    skyTop: 0x38bdf8,
    skyHorizon: 0xbae6fd,
    fog: 0xbae6fd,
    sunLight: 0xfffaed,
    hemiSky: 0xdbeafe,
    hemiGround: 0x86efac,
    cloud: 0xffffff,
    cloudShadow: 0xcfdbe8
  },

  // Character Professions
  professions: {
    wayfarer: {
      jacket: 0xb46b38,
      jacketLight: 0xcd8550,
      trouser: 0x2b3e58,
      trouserLight: 0x3d5475,
      hair: 0x5a2d12,
      hairHighlight: 0x7a3e1b,
      belt: 0x3e200c,
      accent: 0xeab308
    },
    artificer: {
      jacket: 0x3b444f,
      jacketLight: 0x4e5966,
      trouser: 0x242b35,
      trouserLight: 0x363f4c,
      hair: 0x1e2430,
      hairHighlight: 0x333e52,
      belt: 0x141a22,
      accent: 0xf97316,
      headphones: 0xf59e0b
    },
    mystic: {
      jacket: 0x58217f,
      jacketLight: 0x7330a3,
      trouser: 0x2f0e47,
      trouserLight: 0x441966,
      hair: 0x7e3a9c,
      hairHighlight: 0xa152c4,
      belt: 0x1d082c,
      accent: 0xa855f7,
      hood: 0x491868,
      hoodTrim: 0xa855f7
    },
    tycoon: {
      jacket: 0x1e293b,
      jacketLight: 0x334155,
      trouser: 0x0f172a,
      trouserLight: 0x1e293b,
      hair: 0x141a24,
      hairHighlight: 0x273142,
      belt: 0x452312,
      accent: 0xfacc15
    }
  }
})
