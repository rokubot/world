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
