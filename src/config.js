/**
 * Central Configuration for Roku World (Client)
 * All tunable gameplay parameters, speeds, combat values, timers, etc. must live here.
 */

export const CONFIG = {
  // Movement & Player Speeds
  player: {
    walkSpeed: 8,
    sprintSpeed: 16,
    baseHealth: 100,
    spawnCoord: { lng: 55.2, lat: 25.2 }, // Dubai
    spawnOffset: { x: 4.0, y: 0.5, z: 4.0 }
  },

  // Character appearance options, keyed by character so each can opt in or out.
  characters: {
    player: {
      eyewear: { enabled: true, type: 'sunglasses' }
    },
    npcDefault: {
      eyewear: { enabled: true, type: 'goldAviators' }
    }
  },

  // Eyewear dimensions are shared by all characters and styles.
  eyewear: {
    sizes: {
      sunglasses: {
        lensWidth: 0.29,
        lensHeight: 0.16,
        lensDepth: 0.035,
        lensSpacing: 0.34,
        lensY: 0.02,
        frontZ: 0.46,
        frameWidth: 0.02,
        frameDepth: 0.04,
        bridgeWidth: 0.10,
        templeLength: 0.36,
        templeWidth: 0.025,
        templeHeight: 0.03
      },
      goldAviators: {
        lensRadius: 0.18,
        lensHeightScale: 1.12,
        lensSpacing: 0.19,
        lensY: -0.005,
        frontZ: 0.455,
        frameRadius: 0.195,
        frameTubeRadius: 0.018,
        frameRadialSegments: 8,
        bridgeWidth: 0.12,
        bridgeHeight: 0.025,
        bridgeDepth: 0.036,
        bridgeYOffset: 0.107,
        templeLength: 0.37,
        templeWidth: 0.025,
        templeHeight: 0.025,
        segments: 24
      },
      amberVisor: {
        width: 0.88,
        height: 0.20,
        depth: 0.075,
        frontZ: 0.445,
        y: 0.035,
        sideWidth: 0.18,
        sideHeight: 0.07,
        sideDepth: 0.30
      },
      goggles: {
        lensRadius: 0.145,
        lensSpacing: 0.16,
        lensY: 0.015,
        frontZ: 0.46,
        frameRadius: 0.165,
        frameTubeRadius: 0.035,
        frameRadialSegments: 8,
        bridgeWidth: 0.07,
        bridgeHeight: 0.045,
        bridgeDepth: 0.07,
        strapLength: 0.84,
        strapHeight: 0.06,
        strapDepth: 0.07,
        segments: 24
      }
    }
  },

  // Vehicles
  vehicles: {
    speeds: {
      car: 60,
      motorcycle: 40,
      bicycle: 20
    },
    offRoadMultiplier: 0.4,
    enterDistance: 5.0,
    steerLerp: 0.08,
    wheelRadius: 0.4,
    exitOffsetDistance: 2.5
  },

  // Camera settings
  camera: {
    lerp: 0.12,
    thirdPersonDistance: 8,
    thirdPersonHeight: 3.2,
    topDownHeight: 80,
    isometricDistance: 60,
    firstPersonHeight: 1.6
  },

  // Combat (Step 10)
  combat: {
    strikeDamage: 15,
    strikeCooldown: 0.4,
    strikeRange: 3.5,
    strikeAngle: Math.PI / 3, // 60 degree arc in front

    heavyStrikeDamage: 40,
    heavyStrikeCooldown: 1.5,
    heavyStrikeRange: 4.0,
    heavyStrikeAngle: Math.PI / 2.5,

    dodgeDistance: 6.0,
    dodgeDuration: 0.25,
    dodgeCooldown: 1.0,
    dodgeInvulnerabilityDuration: 0.25
  },

  // Slime Creature (Step 9)
  slime: {
    maxHealth: 50,
    speed: 3.5,
    damage: 8,
    attackRange: 1.5,
    attackCooldown: 1.2,
    noticeRadius: 15,
    chaseRadius: 25,
    xpReward: 10,
    respawnTimer: 20 // seconds
  },

  // Progression & XP (Step 11)
  progression: {
    // XP to reach level n: 5n^2 + 50n + 100
    getXPForLevel: (n) => 5 * n * n + 50 * n + 100,
    healthPerLevel: 20
  },

  // Death, Loot & Discovery (Steps 12 & 13)
  loot: {
    unequippedDropRateMin: 0.3,
    unequippedDropRateMax: 0.5,
    currencyDropRate: 0.05,
    currencyDropCap: 50,
    bundleLifetimeSec: 15 * 60 // 15 minutes
  }
}
