import * as THREE from 'three'

/**
 * Profession color & style configurations as specified
 */
export const PROFESSIONS = {
  wayfarer: {
    name: 'Wayfarer',
    torsoColor: 0x945a24, // warm leather adventurer jacket
    trouserColor: 0x24354b, // classic dark indigo denim jeans
    hairColor: 0x42200a, // rich chestnut brown
    accessoryType: 'sunglasses_adventurer',
    accentColor: 0xd4af37, // gold accent
    beltColor: 0x4a2812, // warm saddle brown leather belt
    torsoHeight: 1.0
  },
  artificer: {
    name: 'Artificer',
    torsoColor: 0x3e444c,
    trouserColor: 0x282f3a, // tactical slate cargo pants
    hairColor: 0x1a1a1a,
    accessoryType: 'cyber_visor_headphones',
    accentColor: 0xff6600,
    beltColor: 0x14171d, // dark utility belt
    torsoHeight: 1.0,
    hasApron: true
  },
  mystic: {
    name: 'Mystic',
    torsoColor: 0x4a1a6b,
    trouserColor: 0x220938,
    hairColor: 0x6b3a8a,
    accessoryType: 'mystic_cowl_visor',
    accentColor: 0xa855f7,
    beltColor: 0x130621,
    torsoHeight: 1.25
  },
  tycoon: {
    name: 'Tycoon',
    torsoColor: 0x14203b,
    trouserColor: 0x0c1424,
    hairColor: 0x1a1a1a,
    accessoryType: 'designer_shades_chain',
    accentColor: 0xe5c07b,
    beltColor: 0x382212, // luxury leather belt
    torsoHeight: 1.0
  }
}

const SKIN_COLOR = 0xffcc99
const SHOE_COLOR = 0x1c1e22

const HEAD_CYLINDER_GEO = new THREE.CylinderGeometry(0.38, 0.40, 0.65, 24)
const HEAD_TOP_DOME_GEO = new THREE.SphereGeometry(0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
const HEAD_BOTTOM_DOME_GEO = new THREE.SphereGeometry(0.40, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)
const NECK_GEO = new THREE.CylinderGeometry(0.18, 0.20, 0.14, 16)
const SUNGLASSES_LENS_GEO = new THREE.BoxGeometry(0.24, 0.16, 0.08)
const SUNGLASSES_BRIDGE_GEO = new THREE.BoxGeometry(0.10, 0.04, 0.09)
const SUNGLASSES_TOP_BAR_GEO = new THREE.BoxGeometry(0.62, 0.04, 0.08)
const SUNGLASSES_TEMPLE_GEO = new THREE.BoxGeometry(0.04, 0.04, 0.38)
const HAIR_CROWN_GEO = new THREE.SphereGeometry(0.44, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2)
const HAIR_BANG_ONE_GEO = new THREE.BoxGeometry(0.24, 0.16, 0.14)
const HAIR_BANG_TWO_GEO = new THREE.BoxGeometry(0.22, 0.15, 0.14)
const HAIR_BANG_THREE_GEO = new THREE.BoxGeometry(0.18, 0.13, 0.12)
const BACK_HAIR_GEO = new THREE.CylinderGeometry(0.41, 0.42, 0.36, 18, 1, false, Math.PI * 0.5, Math.PI)
const ARTIFICER_VISOR_GEO = new THREE.BoxGeometry(0.64, 0.18, 0.12)
const ARTIFICER_GLOW_STRIP_GEO = new THREE.BoxGeometry(0.56, 0.05, 0.14)
const HEADPHONE_PAD_GEO = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16)
const HEADPHONE_BAND_GEO = new THREE.TorusGeometry(0.44, 0.04, 8, 20, Math.PI)
const ARTIFICER_HAIR_GEO = new THREE.BoxGeometry(0.68, 0.18, 0.68)
const MYSTIC_VISOR_GEO = new THREE.BoxGeometry(0.58, 0.14, 0.10)
const MYSTIC_RUNE_GEO = new THREE.BoxGeometry(0.38, 0.03, 0.12)
const MYSTIC_HOOD_GEO = new THREE.SphereGeometry(0.46, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2)
const MYSTIC_HOOD_RIM_GEO = new THREE.TorusGeometry(0.46, 0.06, 8, 20, Math.PI * 1.2)
const TYCOON_LENS_GEO = new THREE.BoxGeometry(0.25, 0.16, 0.08)
const TYCOON_FRAME_GEO = new THREE.BoxGeometry(0.66, 0.20, 0.06)
const TYCOON_ARMS_GEO = new THREE.BoxGeometry(0.04, 0.04, 0.42)
const TYCOON_HAIR_MAIN_GEO = new THREE.BoxGeometry(0.78, 0.22, 0.82)
const TYCOON_HAIR_BACK_GEO = new THREE.BoxGeometry(0.70, 0.35, 0.22)
const WRIST_GEO = new THREE.CylinderGeometry(0.10, 0.12, 0.10, 12)
const HAND_CLAMP_GEO = new THREE.TorusGeometry(0.11, 0.05, 8, 16, Math.PI * 1.5)
const SHOE_BASE_GEO = new THREE.BoxGeometry(0.34, 0.18, 0.40)
const SHOE_TOE_GEO = new THREE.SphereGeometry(0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)
const WAIST_GEO = new THREE.BoxGeometry(0.72, 0.22, 0.36)
const BELT_GEO = new THREE.BoxGeometry(0.76, 0.10, 0.39)
const BUCKLE_GEO = new THREE.BoxGeometry(0.18, 0.13, 0.04)
const BACKPACK_GEO = new THREE.BoxGeometry(0.56, 0.60, 0.20)
const SHOULDER_STRAP_GEO = new THREE.BoxGeometry(0.10, 0.65, 0.30)
const STANDARD_CHEST_GEO = new THREE.BoxGeometry(0.80, 0.72, 0.40)
const MYSTIC_CHEST_GEO = new THREE.BoxGeometry(0.80, 0.90, 0.40)
const APRON_GEO = new THREE.BoxGeometry(0.38, 0.48, 0.43)
const APRON_POCKET_GEO = new THREE.BoxGeometry(0.20, 0.14, 0.44)
const CHAIN_GEO = new THREE.TorusGeometry(0.22, 0.025, 8, 16, Math.PI)
const ZIPPER_GEO = new THREE.BoxGeometry(0.04, 0.65, 0.02)
const ARM_GEO = new THREE.CylinderGeometry(0.17, 0.17 * 0.9, 0.68, 14)
const LEG_GEO = new THREE.BoxGeometry(0.32, 0.85, 0.34)

const SKIN_MATERIAL = new THREE.MeshLambertMaterial({ color: SKIN_COLOR })
const SHOE_MATERIAL = new THREE.MeshLambertMaterial({ color: SHOE_COLOR })
const STRAP_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x181a1f })
const GLASSES_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x10141c })
const GOLD_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xd4af37 })
const BACKPACK_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x1e242c })
const ARTIFICER_VISOR_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x18202a })
const ARTIFICER_GLOW_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xff7700, emissive: 0x883300 })
const HEADPHONE_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xffa500 })
const HEADPHONE_STRAP_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x111111 })
const MYSTIC_VISOR_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x120824 })
const MYSTIC_RUNE_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xc084fc, emissive: 0x7e22ce })
const MYSTIC_HOOD_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x3b0764 })
const MYSTIC_TRIM_MATERIAL = new THREE.MeshLambertMaterial({ color: 0xa855f7 })
const TYCOON_FRAME_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x050505 })
const TYCOON_LENS_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x1e293b })

const lambertMaterialCache = new Map()
function getLambertMaterial(color, emissive = 0) {
  const key = `${color}:${emissive}`
  if (!lambertMaterialCache.has(key)) {
    lambertMaterialCache.set(key, new THREE.MeshLambertMaterial({ color, emissive }))
  }
  return lambertMaterialCache.get(key)
}

/**
 * Creates the rounded Roblox head geometry (Attachment 1 & 2 inspiration)
 */
function createRobloxHead(skinMat) {
  const headGroup = new THREE.Group()
  headGroup.name = 'RobloxHead'

  // 1. Main cylindrical head body
  const cylinder = new THREE.Mesh(HEAD_CYLINDER_GEO, skinMat)
  cylinder.castShadow = true
  cylinder.receiveShadow = true
  headGroup.add(cylinder)

  // 2. Rounded top dome cap
  const topDome = new THREE.Mesh(HEAD_TOP_DOME_GEO, skinMat)
  topDome.scale.set(1, 0.32, 1)
  topDome.position.y = 0.325
  topDome.castShadow = true
  headGroup.add(topDome)

  // 3. Rounded bottom chin bevel
  const bottomDome = new THREE.Mesh(HEAD_BOTTOM_DOME_GEO, skinMat)
  bottomDome.scale.set(1, 0.22, 1)
  bottomDome.position.y = -0.325
  bottomDome.castShadow = true
  headGroup.add(bottomDome)

  // 4. Neck connector
  const neck = new THREE.Mesh(NECK_GEO, skinMat)
  neck.position.y = -0.42
  neck.castShadow = true
  headGroup.add(neck)

  return headGroup
}

/**
 * Adds creative face coverings / accessories (Attachment 3 inspiration):
 * Sunglasses, visors, headphones, beanies, hoods, and chains.
 */
function addCreativeCovering(headGroup, prof) {
  const type = prof.accessoryType

  if (type === 'sunglasses_adventurer' || type === 'sunglasses_beanie') {
    // 1. Wayfarer Aviator Sunglasses (Dark curved lenses + gold frame on front +Z)
    const glassMat = GLASSES_MATERIAL
    const frameMat = GOLD_MATERIAL // sleek gold

    const leftLens = new THREE.Mesh(SUNGLASSES_LENS_GEO, glassMat)
    leftLens.position.set(-0.16, 0.06, 0.38)

    const rightLens = new THREE.Mesh(SUNGLASSES_LENS_GEO, glassMat)
    rightLens.position.set(0.16, 0.06, 0.38)

    const bridge = new THREE.Mesh(SUNGLASSES_BRIDGE_GEO, frameMat)
    bridge.position.set(0, 0.09, 0.38)

    const topBar = new THREE.Mesh(SUNGLASSES_TOP_BAR_GEO, frameMat)
    topBar.position.set(0, 0.15, 0.38)

    // Side temple bars connecting to ears
    const leftTemple = new THREE.Mesh(SUNGLASSES_TEMPLE_GEO, frameMat)
    leftTemple.position.set(-0.35, 0.08, 0.18)
    const rightTemple = new THREE.Mesh(SUNGLASSES_TEMPLE_GEO, frameMat)
    rightTemple.position.set(0.35, 0.08, 0.18)

    headGroup.add(leftLens, rightLens, bridge, topBar, leftTemple, rightTemple)

    // 2. Stylish Adventurer Layered Hair (textured crown + swept front bangs, no leftover blocks)
    const hairMat = getLambertMaterial(prof.hairColor)

    // Voluminous hair crown dome
    const crown = new THREE.Mesh(HAIR_CROWN_GEO, hairMat)
    crown.scale.set(1.05, 0.82, 1.06)
    crown.position.set(0, 0.22, 0)
    crown.castShadow = true
    headGroup.add(crown)

    // Side-swept front bangs
    const bang1 = new THREE.Mesh(HAIR_BANG_ONE_GEO, hairMat)
    bang1.position.set(-0.16, 0.25, 0.36)
    bang1.rotation.z = 0.22
    bang1.rotation.y = 0.08

    const bang2 = new THREE.Mesh(HAIR_BANG_TWO_GEO, hairMat)
    bang2.position.set(0.08, 0.27, 0.38)
    bang2.rotation.z = -0.15

    const bang3 = new THREE.Mesh(HAIR_BANG_THREE_GEO, hairMat)
    bang3.position.set(0.24, 0.25, 0.35)
    bang3.rotation.z = -0.28

    headGroup.add(bang1, bang2, bang3)

    // Smooth rounded back hair that neatly wraps the head without protruding blocks
    const backHair = new THREE.Mesh(BACK_HAIR_GEO, hairMat)
    backHair.position.set(0, 0.10, 0)
    headGroup.add(backHair)

  }

  else if (type === 'cyber_visor_headphones') {
    // 1. Artificer Cyber Visor (amber-glowing tactical shield on front +Z)
    const visorMat = ARTIFICER_VISOR_MATERIAL
    const glowMat = ARTIFICER_GLOW_MATERIAL

    const visorShield = new THREE.Mesh(ARTIFICER_VISOR_GEO, visorMat)
    visorShield.position.set(0, 0.05, 0.37)

    const glowStrip = new THREE.Mesh(ARTIFICER_GLOW_STRIP_GEO, glowMat)
    glowStrip.position.set(0, 0.05, 0.375)

    headGroup.add(visorShield, glowStrip)

    // 2. Heavy-duty Studio Headphones (like yellow headphones in Attachment 3)
    const phoneMat = HEADPHONE_MATERIAL // industrial yellow/orange
    const strapMat = HEADPHONE_STRAP_MATERIAL

    // Over-ear pads
    const leftPad = new THREE.Mesh(HEADPHONE_PAD_GEO, phoneMat)
    leftPad.rotation.z = Math.PI / 2
    leftPad.position.set(-0.43, 0.05, 0)

    const rightPad = new THREE.Mesh(HEADPHONE_PAD_GEO, phoneMat)
    rightPad.rotation.z = Math.PI / 2
    rightPad.position.set(0.43, 0.05, 0)

    // Headband connecting over the top
    const band = new THREE.Mesh(HEADPHONE_BAND_GEO, strapMat)
    band.position.set(0, 0.12, 0)
    band.rotation.x = Math.PI / 2

    headGroup.add(leftPad, rightPad, band)

    // Spiky dark hair on top
    const hairMat = getLambertMaterial(prof.hairColor)
    const topHair = new THREE.Mesh(ARTIFICER_HAIR_GEO, hairMat)
    topHair.position.y = 0.38
    headGroup.add(topHair)
  }

  else if (type === 'mystic_cowl_visor') {
    // 1. Mystic Shadow Visor with glowing runic slit
    const darkVisorMat = MYSTIC_VISOR_MATERIAL
    const runeGlowMat = MYSTIC_RUNE_MATERIAL

    const visor = new THREE.Mesh(MYSTIC_VISOR_GEO, darkVisorMat)
    visor.position.set(0, 0.04, 0.37)

    const runicSlit = new THREE.Mesh(MYSTIC_RUNE_GEO, runeGlowMat)
    runicSlit.position.set(0, 0.04, 0.375)

    headGroup.add(visor, runicSlit)

    // 2. Mystic Hood / Cowl draped around the head
    const hoodMat = MYSTIC_HOOD_MATERIAL // deep royal purple
    const hoodTrimMat = MYSTIC_TRIM_MATERIAL

    const hoodDome = new THREE.Mesh(MYSTIC_HOOD_GEO, hoodMat)
    hoodDome.scale.set(1.05, 0.9, 1.1)
    hoodDome.position.set(0, 0.18, -0.05)

    // Flared hood cowl trim on front
    const hoodRim = new THREE.Mesh(MYSTIC_HOOD_RIM_GEO, hoodTrimMat)
    hoodRim.rotation.x = Math.PI / 2.8
    hoodRim.rotation.z = Math.PI / 1.1
    hoodRim.position.set(0, 0.15, 0.15)

    headGroup.add(hoodDome, hoodRim)
  }

  else if (type === 'designer_shades_chain') {
    // 1. Tycoon Designer Black Sunglasses (like center avatar in Attachment 3)
    const frameMat = TYCOON_FRAME_MATERIAL
    const lensMat = TYCOON_LENS_MATERIAL

    const leftLens = new THREE.Mesh(TYCOON_LENS_GEO, lensMat)
    leftLens.position.set(-0.16, 0.06, 0.38)

    const rightLens = new THREE.Mesh(TYCOON_LENS_GEO, lensMat)
    rightLens.position.set(0.16, 0.06, 0.38)

    const frameOuter = new THREE.Mesh(TYCOON_FRAME_GEO, frameMat)
    frameOuter.position.set(0, 0.06, 0.36)

    const armsLeft = new THREE.Mesh(TYCOON_ARMS_GEO, frameMat)
    armsLeft.position.set(-0.35, 0.08, 0.16)

    const armsRight = new THREE.Mesh(TYCOON_ARMS_GEO, frameMat)
    armsRight.position.set(0.35, 0.08, 0.16)

    headGroup.add(leftLens, rightLens, frameOuter, armsLeft, armsRight)

    // 2. Sleek styled dark hair (combed back and parted)
    const hairMat = getLambertMaterial(prof.hairColor)
    const hairMain = new THREE.Mesh(TYCOON_HAIR_MAIN_GEO, hairMat)
    hairMain.position.set(0, 0.35, -0.04)

    const hairBack = new THREE.Mesh(TYCOON_HAIR_BACK_GEO, hairMat)
    hairBack.position.set(0, 0.15, -0.34)

    headGroup.add(hairMain, hairBack)
  }
}

/**
 * Creates the classic Roblox C-clamp shaped hand (Attachment 1 & 2)
 */
function createRobloxCHand(skinMat, side = 'left') {
  const handGroup = new THREE.Group()
  handGroup.name = 'RobloxCHand'

  // Wrist cylinder
  const wrist = new THREE.Mesh(WRIST_GEO, skinMat)
  wrist.position.y = 0.05
  handGroup.add(wrist)

  // C-Clamp hand using open Torus geometry (arc of 270 degrees)
  const clamp = new THREE.Mesh(HAND_CLAMP_GEO, skinMat)
  clamp.rotation.x = Math.PI / 2
  clamp.rotation.z = side === 'left' ? Math.PI / 4 : -Math.PI / 4
  clamp.position.y = -0.10
  clamp.castShadow = true
  handGroup.add(clamp)

  return handGroup
}

/**
 * Creates shoes with rounded front toe caps (Attachment 1 & 2)
 */
function createRobloxShoe(shoeMat) {
  const shoeGroup = new THREE.Group()

  // 1. Shoe base
  const base = new THREE.Mesh(SHOE_BASE_GEO, shoeMat)
  base.position.set(0, 0, -0.04)
  base.castShadow = true
  base.receiveShadow = true
  shoeGroup.add(base)

  // 2. Rounded Toe Dome on the FRONT (+Z)
  const toe = new THREE.Mesh(SHOE_TOE_GEO, shoeMat)
  toe.scale.set(1.0, 0.72, 1.25)
  toe.position.set(0, -0.09, 0.15) // Front of shoe
  toe.castShadow = true
  shoeGroup.add(toe)

  return shoeGroup
}

/**
 * Creates a billboard text canvas texture for player name tag
 */
export function createNameTag(playerName) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  // Dark background container
  ctx.fillStyle = 'rgba(10, 10, 20, 0.85)'
  ctx.beginPath()
  ctx.roundRect(4, 4, 248, 56, 12)
  ctx.fill()

  // Gold border
  ctx.strokeStyle = '#c9a84c'
  ctx.lineWidth = 2
  ctx.stroke()

  // Player name text
  ctx.fillStyle = '#c9a84c'
  ctx.font = 'bold 24px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(playerName, 128, 32)

  const tex = new THREE.CanvasTexture(canvas)
  const nameTag = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    })
  )
  nameTag.scale.set(2.0, 0.5, 1.0)
  nameTag.name = 'NameTag'
  return nameTag
}

/**
 * Builds a blocky Roblox-style humanoid character with rounded features,
 * creative coverings, distinct front/back directionality, and pivot groups.
 */
export function createCharacter(professionKey = 'wayfarer', playerName = 'Player') {
  const prof = PROFESSIONS[professionKey.toLowerCase()] || PROFESSIONS.wayfarer
  const characterGroup = new THREE.Group()
  characterGroup.name = `Character_${playerName}`
  const visualGroup = new THREE.Group()
  visualGroup.name = 'CharacterVisuals'
  visualGroup.position.y = 0.25
  characterGroup.add(visualGroup)

  // Common materials
  const skinMat = SKIN_MATERIAL
  const torsoMat = getLambertMaterial(prof.torsoColor)
  const trouserMat = getLambertMaterial(prof.trouserColor)
  const shoeMat = SHOE_MATERIAL
  const beltMat = getLambertMaterial(prof.beltColor || 0x3d2414)
  const buckleMat = getLambertMaterial(prof.accentColor)
  const strapMat = STRAP_MATERIAL

  const torsoHeight = prof.torsoHeight

  // ─── 1. TORSO (Tapered upper chest + waist + backpack) ───────────────────
  const torsoGroup = new THREE.Group()
  torsoGroup.name = 'TorsoGroup'

  // Upper Chest (wider at shoulders)
  const chestGeo = torsoHeight === 1.25 ? MYSTIC_CHEST_GEO : STANDARD_CHEST_GEO
  const chest = new THREE.Mesh(chestGeo, torsoMat)
  chest.position.y = 1.15 + (torsoHeight - 1.0) * 0.4
  chest.castShadow = true
  chest.receiveShadow = true
  torsoGroup.add(chest)

  // Waist
  const waist = new THREE.Mesh(WAIST_GEO, trouserMat)
  waist.position.y = 0.70
  waist.castShadow = true
  torsoGroup.add(waist)

  // Belt - clearly pronounced and distinct from pants
  const belt = new THREE.Mesh(BELT_GEO, beltMat)
  belt.position.y = 0.73
  torsoGroup.add(belt)

  // Belt Buckle on FRONT (+Z)
  const buckle = new THREE.Mesh(BUCKLE_GEO, buckleMat)
  buckle.position.set(0, 0.73, 0.20)
  torsoGroup.add(buckle)

  // Backpack on BACK (-Z) with straps on FRONT (+Z) (Attachment 3 inspiration)
  const backpack = new THREE.Mesh(BACKPACK_GEO, BACKPACK_MATERIAL)
  backpack.position.set(0, 1.15 + (torsoHeight - 1.0) * 0.4, -0.28) // Sitting on BACK
  backpack.castShadow = true
  torsoGroup.add(backpack)

  // Front shoulder straps (clearly indicates FRONT of torso)
  const leftStrap = new THREE.Mesh(SHOULDER_STRAP_GEO, strapMat)
  leftStrap.position.set(-0.25, 1.15 + (torsoHeight - 1.0) * 0.4, 0.06)
  const rightStrap = new THREE.Mesh(SHOULDER_STRAP_GEO, strapMat)
  rightStrap.position.set(0.25, 1.15 + (torsoHeight - 1.0) * 0.4, 0.06)
  torsoGroup.add(leftStrap, rightStrap)

  // Profession details on chest
  if (prof.hasApron) {
    // Artificer high-vis apron — stays above belt (belt top = ~0.785, apron bottom must be > 0.785)
    // apron height 0.48, center at y=1.07 → bottom edge = 1.07 - 0.24 = 0.83 ✓
    const apronMat = getLambertMaterial(0xe85d04) // vivid orange
    const apronBody = new THREE.Mesh(APRON_GEO, apronMat)
    apronBody.position.set(0, 1.08, 0)
    torsoGroup.add(apronBody)

    // Apron bib pocket (darker tone)
    const pocketMat = getLambertMaterial(0xc2440a)
    const pocket = new THREE.Mesh(APRON_POCKET_GEO, pocketMat)
    pocket.position.set(0, 0.96, 0)
    torsoGroup.add(pocket)
  } else if (prof.accessoryType === 'designer_shades_chain') {
    // Tycoon gold chain necklace on front chest
    const chainMat = getLambertMaterial(0xe5c07b)
    const chain = new THREE.Mesh(CHAIN_GEO, chainMat)
    chain.position.set(0, 1.40, 0.21)
    chain.rotation.x = Math.PI / 1.4
    torsoGroup.add(chain)
  } else if (prof.name === 'Wayfarer') {
    // Subtle central zipper line on leather jacket
    const zipperMat = getLambertMaterial(0x1f242d)
    const zipper = new THREE.Mesh(ZIPPER_GEO, zipperMat)
    zipper.position.set(0, 1.15 + (torsoHeight - 1.0) * 0.4, 0.205)
    torsoGroup.add(zipper)
  }

  visualGroup.add(torsoGroup)

  // ─── 2. HEAD & CREATIVE COVERINGS (Attachment 1, 2 & 3) ───────────────────
  const headGroup = createRobloxHead(skinMat)
  headGroup.position.y = 1.95 + (torsoHeight - 1.0)
  addCreativeCovering(headGroup, prof)
  visualGroup.add(headGroup)

  // ─── 3. ARMS WITH C-HANDS & SHOULDER PIVOTS ───────────────────────────────
  const armHeight = 0.68
  const armGeo = ARM_GEO

  // Left Arm
  const leftArmGroup = new THREE.Group()
  leftArmGroup.name = 'LeftArmGroup'
  leftArmGroup.position.set(-0.54, 1.45 + (torsoHeight - 1.0) * 0.6, 0)

  const leftArmMesh = new THREE.Mesh(armGeo, torsoMat) // sleeve color
  leftArmMesh.position.set(0, -armHeight / 2, 0)
  leftArmMesh.castShadow = true
  leftArmGroup.add(leftArmMesh)

  const leftHand = createRobloxCHand(skinMat, 'left')
  leftHand.position.set(0, -armHeight, 0)
  leftHand.rotation.y = Math.PI / 6
  leftArmGroup.add(leftHand)

  visualGroup.add(leftArmGroup)

  // Right Arm
  const rightArmGroup = new THREE.Group()
  rightArmGroup.name = 'RightArmGroup'
  rightArmGroup.position.set(0.54, 1.45 + (torsoHeight - 1.0) * 0.6, 0)

  const rightArmMesh = new THREE.Mesh(armGeo, torsoMat) // sleeve color
  rightArmMesh.position.set(0, -armHeight / 2, 0)
  rightArmMesh.castShadow = true
  rightArmGroup.add(rightArmMesh)

  const rightHand = createRobloxCHand(skinMat, 'right')
  rightHand.position.set(0, -armHeight, 0)
  rightHand.rotation.y = -Math.PI / 6
  rightArmGroup.add(rightHand)

  visualGroup.add(rightArmGroup)

  // ─── 4. LEGS WITH ROUNDED TOE CAPS & HIP PIVOTS ───────────────────────────
  const legHeight = 0.85
  const legGeo = LEG_GEO
  const hipPivotY = 0.62

  // Left Leg
  const leftLegGroup = new THREE.Group()
  leftLegGroup.name = 'LeftLegGroup'
  leftLegGroup.position.set(-0.20, hipPivotY, 0)

  const leftLegMesh = new THREE.Mesh(legGeo, trouserMat)
  leftLegMesh.position.set(0, -legHeight / 2, 0)
  leftLegMesh.castShadow = true
  leftLegMesh.receiveShadow = true
  leftLegGroup.add(leftLegMesh)

  const leftShoe = createRobloxShoe(shoeMat)
  leftShoe.position.set(0, -legHeight + 0.08, 0)
  leftLegGroup.add(leftShoe)

  visualGroup.add(leftLegGroup)

  // Right Leg
  const rightLegGroup = new THREE.Group()
  rightLegGroup.name = 'RightLegGroup'
  rightLegGroup.position.set(0.20, hipPivotY, 0)

  const rightLegMesh = new THREE.Mesh(legGeo, trouserMat)
  rightLegMesh.position.set(0, -legHeight / 2, 0)
  rightLegMesh.castShadow = true
  rightLegMesh.receiveShadow = true
  rightLegGroup.add(rightLegMesh)

  const rightShoe = createRobloxShoe(shoeMat)
  rightShoe.position.set(0, -legHeight + 0.08, 0)
  rightLegGroup.add(rightShoe)

  visualGroup.add(rightLegGroup)

  // ─── 5. BILLBOARD NAME TAG ────────────────────────────────────────────────
  const nameTag = createNameTag(playerName)
  nameTag.position.y = 2.95 + (torsoHeight - 1.0)
  visualGroup.add(nameTag)

  return {
    group: characterGroup,
    leftArmGroup,
    rightArmGroup,
    leftLegGroup,
    rightLegGroup,
    torso: torsoGroup,
    head: headGroup,
    nameTag,
    profession: prof
  }
}
