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

/**
 * Creates the rounded Roblox head geometry (Attachment 1 & 2 inspiration)
 */
function createRobloxHead(skinMat) {
  const headGroup = new THREE.Group()
  headGroup.name = 'RobloxHead'

  // 1. Main cylindrical head body
  const cylinderGeo = new THREE.CylinderGeometry(0.38, 0.40, 0.65, 24)
  const cylinder = new THREE.Mesh(cylinderGeo, skinMat)
  cylinder.castShadow = true
  cylinder.receiveShadow = true
  headGroup.add(cylinder)

  // 2. Rounded top dome cap
  const topDomeGeo = new THREE.SphereGeometry(0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
  topDomeGeo.scale(1, 0.32, 1)
  const topDome = new THREE.Mesh(topDomeGeo, skinMat)
  topDome.position.y = 0.325
  topDome.castShadow = true
  headGroup.add(topDome)

  // 3. Rounded bottom chin bevel
  const bottomDomeGeo = new THREE.SphereGeometry(0.40, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)
  bottomDomeGeo.scale(1, 0.22, 1)
  const bottomDome = new THREE.Mesh(bottomDomeGeo, skinMat)
  bottomDome.position.y = -0.325
  bottomDome.castShadow = true
  headGroup.add(bottomDome)

  // 4. Neck connector
  const neckGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.14, 16)
  const neck = new THREE.Mesh(neckGeo, skinMat)
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
    const glassMat = new THREE.MeshLambertMaterial({ color: 0x10141c, roughness: 0.15 })
    const frameMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 }) // sleek gold

    const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.08), glassMat)
    leftLens.position.set(-0.16, 0.06, 0.38)

    const rightLens = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.08), glassMat)
    rightLens.position.set(0.16, 0.06, 0.38)

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.04, 0.09), frameMat)
    bridge.position.set(0, 0.09, 0.38)

    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.08), frameMat)
    topBar.position.set(0, 0.15, 0.38)

    // Side temple bars connecting to ears
    const leftTemple = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.38), frameMat)
    leftTemple.position.set(-0.35, 0.08, 0.18)
    const rightTemple = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.38), frameMat)
    rightTemple.position.set(0.35, 0.08, 0.18)

    headGroup.add(leftLens, rightLens, bridge, topBar, leftTemple, rightTemple)

    // 2. Stylish Adventurer Layered Hair (textured crown + swept front bangs, no leftover blocks)
    const hairMat = new THREE.MeshLambertMaterial({ color: prof.hairColor })

    // Voluminous hair crown dome
    const crownGeo = new THREE.SphereGeometry(0.44, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2)
    crownGeo.scale(1.05, 0.82, 1.06)
    const crown = new THREE.Mesh(crownGeo, hairMat)
    crown.position.set(0, 0.22, 0)
    crown.castShadow = true
    headGroup.add(crown)

    // Side-swept front bangs
    const bang1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.14), hairMat)
    bang1.position.set(-0.16, 0.25, 0.36)
    bang1.rotation.z = 0.22
    bang1.rotation.y = 0.08

    const bang2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.14), hairMat)
    bang2.position.set(0.08, 0.27, 0.38)
    bang2.rotation.z = -0.15

    const bang3 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.13, 0.12), hairMat)
    bang3.position.set(0.24, 0.25, 0.35)
    bang3.rotation.z = -0.28

    headGroup.add(bang1, bang2, bang3)

    // Smooth rounded back hair that neatly wraps the head without protruding blocks
    const backHairGeo = new THREE.CylinderGeometry(0.41, 0.42, 0.36, 18, 1, false, Math.PI * 0.5, Math.PI)
    const backHair = new THREE.Mesh(backHairGeo, hairMat)
    backHair.position.set(0, 0.10, 0)
    headGroup.add(backHair)

  }

  else if (type === 'cyber_visor_headphones') {
    // 1. Artificer Cyber Visor (amber-glowing tactical shield on front +Z)
    const visorMat = new THREE.MeshLambertMaterial({ color: 0x18202a })
    const glowMat = new THREE.MeshLambertMaterial({ color: 0xff7700, emissive: 0x883300 })

    const visorShield = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.18, 0.12), visorMat)
    visorShield.position.set(0, 0.05, 0.37)

    const glowStrip = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.14), glowMat)
    glowStrip.position.set(0, 0.05, 0.375)

    headGroup.add(visorShield, glowStrip)

    // 2. Heavy-duty Studio Headphones (like yellow headphones in Attachment 3)
    const phoneMat = new THREE.MeshLambertMaterial({ color: 0xffa500 }) // industrial yellow/orange
    const strapMat = new THREE.MeshLambertMaterial({ color: 0x111111 })

    // Over-ear pads
    const leftPad = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16), phoneMat)
    leftPad.rotation.z = Math.PI / 2
    leftPad.position.set(-0.43, 0.05, 0)

    const rightPad = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16), phoneMat)
    rightPad.rotation.z = Math.PI / 2
    rightPad.position.set(0.43, 0.05, 0)

    // Headband connecting over the top
    const bandGeo = new THREE.TorusGeometry(0.44, 0.04, 8, 20, Math.PI)
    const band = new THREE.Mesh(bandGeo, strapMat)
    band.position.set(0, 0.12, 0)
    band.rotation.x = Math.PI / 2

    headGroup.add(leftPad, rightPad, band)

    // Spiky dark hair on top
    const hairMat = new THREE.MeshLambertMaterial({ color: prof.hairColor })
    const topHair = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.18, 0.68), hairMat)
    topHair.position.y = 0.38
    headGroup.add(topHair)
  }

  else if (type === 'mystic_cowl_visor') {
    // 1. Mystic Shadow Visor with glowing runic slit
    const darkVisorMat = new THREE.MeshLambertMaterial({ color: 0x120824 })
    const runeGlowMat = new THREE.MeshLambertMaterial({ color: 0xc084fc, emissive: 0x7e22ce })

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.10), darkVisorMat)
    visor.position.set(0, 0.04, 0.37)

    const runicSlit = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.03, 0.12), runeGlowMat)
    runicSlit.position.set(0, 0.04, 0.375)

    headGroup.add(visor, runicSlit)

    // 2. Mystic Hood / Cowl draped around the head
    const hoodMat = new THREE.MeshLambertMaterial({ color: 0x3b0764 }) // deep royal purple
    const hoodTrimMat = new THREE.MeshLambertMaterial({ color: 0xa855f7 })

    const hoodDome = new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), hoodMat)
    hoodDome.scale.set(1.05, 0.9, 1.1)
    hoodDome.position.set(0, 0.18, -0.05)

    // Flared hood cowl trim on front
    const hoodRim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.06, 8, 20, Math.PI * 1.2), hoodTrimMat)
    hoodRim.rotation.x = Math.PI / 2.8
    hoodRim.rotation.z = Math.PI / 1.1
    hoodRim.position.set(0, 0.15, 0.15)

    headGroup.add(hoodDome, hoodRim)
  }

  else if (type === 'designer_shades_chain') {
    // 1. Tycoon Designer Black Sunglasses (like center avatar in Attachment 3)
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x050505, roughness: 0.1 })
    const lensMat = new THREE.MeshLambertMaterial({ color: 0x1e293b, roughness: 0.1 })

    const leftLens = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.08), lensMat)
    leftLens.position.set(-0.16, 0.06, 0.38)

    const rightLens = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.08), lensMat)
    rightLens.position.set(0.16, 0.06, 0.38)

    const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.20, 0.06), frameMat)
    frameOuter.position.set(0, 0.06, 0.36)

    const armsLeft = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.42), frameMat)
    armsLeft.position.set(-0.35, 0.08, 0.16)

    const armsRight = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.42), frameMat)
    armsRight.position.set(0.35, 0.08, 0.16)

    headGroup.add(leftLens, rightLens, frameOuter, armsLeft, armsRight)

    // 2. Sleek styled dark hair (combed back and parted)
    const hairMat = new THREE.MeshLambertMaterial({ color: prof.hairColor })
    const hairMain = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.22, 0.82), hairMat)
    hairMain.position.set(0, 0.35, -0.04)

    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.35, 0.22), hairMat)
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
  const wristGeo = new THREE.CylinderGeometry(0.10, 0.12, 0.10, 12)
  const wrist = new THREE.Mesh(wristGeo, skinMat)
  wrist.position.y = 0.05
  handGroup.add(wrist)

  // C-Clamp hand using open Torus geometry (arc of 270 degrees)
  const clampGeo = new THREE.TorusGeometry(0.11, 0.05, 8, 16, Math.PI * 1.5)
  const clamp = new THREE.Mesh(clampGeo, skinMat)
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
  const baseGeo = new THREE.BoxGeometry(0.34, 0.18, 0.40)
  const base = new THREE.Mesh(baseGeo, shoeMat)
  base.position.set(0, 0, -0.04)
  base.castShadow = true
  base.receiveShadow = true
  shoeGroup.add(base)

  // 2. Rounded Toe Dome on the FRONT (+Z)
  const toeGeo = new THREE.SphereGeometry(0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2)
  toeGeo.scale(1.0, 0.72, 1.25)
  const toe = new THREE.Mesh(toeGeo, shoeMat)
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
  const nameTag = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 0.5),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  )
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

  // Common materials
  const skinMat = new THREE.MeshLambertMaterial({ color: SKIN_COLOR })
  const torsoMat = new THREE.MeshLambertMaterial({ color: prof.torsoColor })
  const trouserMat = new THREE.MeshLambertMaterial({ color: prof.trouserColor })
  const shoeMat = new THREE.MeshLambertMaterial({ color: SHOE_COLOR })
  const beltMat = new THREE.MeshLambertMaterial({ color: prof.beltColor || 0x3d2414 })
  const buckleMat = new THREE.MeshLambertMaterial({ color: prof.accentColor })
  const strapMat = new THREE.MeshLambertMaterial({ color: 0x181a1f })

  const torsoHeight = prof.torsoHeight

  // ─── 1. TORSO (Tapered upper chest + waist + backpack) ───────────────────
  const torsoGroup = new THREE.Group()
  torsoGroup.name = 'TorsoGroup'

  // Upper Chest (wider at shoulders)
  const chestGeo = new THREE.BoxGeometry(0.80, 0.72 * torsoHeight, 0.40)
  const chest = new THREE.Mesh(chestGeo, torsoMat)
  chest.position.y = 1.15 + (torsoHeight - 1.0) * 0.4
  chest.castShadow = true
  chest.receiveShadow = true
  torsoGroup.add(chest)

  // Waist
  const waistGeo = new THREE.BoxGeometry(0.72, 0.22, 0.36)
  const waist = new THREE.Mesh(waistGeo, trouserMat)
  waist.position.y = 0.70
  waist.castShadow = true
  torsoGroup.add(waist)

  // Belt - clearly pronounced and distinct from pants
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.10, 0.39), beltMat)
  belt.position.y = 0.73
  torsoGroup.add(belt)

  // Belt Buckle on FRONT (+Z)
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.13, 0.04), buckleMat)
  buckle.position.set(0, 0.73, 0.20)
  torsoGroup.add(buckle)

  // Backpack on BACK (-Z) with straps on FRONT (+Z) (Attachment 3 inspiration)
  const backpackMat = new THREE.MeshLambertMaterial({ color: 0x1e242c })
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.60, 0.20), backpackMat)
  backpack.position.set(0, 1.15 + (torsoHeight - 1.0) * 0.4, -0.28) // Sitting on BACK
  backpack.castShadow = true
  torsoGroup.add(backpack)

  // Front shoulder straps (clearly indicates FRONT of torso)
  const leftStrap = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.65, 0.40), strapMat)
  leftStrap.position.set(-0.25, 1.15 + (torsoHeight - 1.0) * 0.4, 0.01)
  const rightStrap = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.65, 0.40), strapMat)
  rightStrap.position.set(0.25, 1.15 + (torsoHeight - 1.0) * 0.4, 0.01)
  torsoGroup.add(leftStrap, rightStrap)

  // Profession details on chest
  if (prof.hasApron) {
    // Artificer high-vis apron — stays above belt (belt top = ~0.785, apron bottom must be > 0.785)
    // apron height 0.48, center at y=1.07 → bottom edge = 1.07 - 0.24 = 0.83 ✓
    const apronMat = new THREE.MeshLambertMaterial({ color: 0xe85d04 }) // vivid orange
    const apronBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.43), apronMat)
    apronBody.position.set(0, 1.08, 0)
    torsoGroup.add(apronBody)

    // Apron bib pocket (darker tone)
    const pocketMat = new THREE.MeshLambertMaterial({ color: 0xc2440a })
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.44), pocketMat)
    pocket.position.set(0, 0.96, 0)
    torsoGroup.add(pocket)
  } else if (prof.accessoryType === 'designer_shades_chain') {
    // Tycoon gold chain necklace on front chest
    const chainMat = new THREE.MeshLambertMaterial({ color: 0xe5c07b })
    const chain = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 16, Math.PI), chainMat)
    chain.position.set(0, 1.40, 0.21)
    chain.rotation.x = Math.PI / 1.4
    torsoGroup.add(chain)
  } else if (prof.name === 'Wayfarer') {
    // Subtle central zipper line on leather jacket
    const zipperMat = new THREE.MeshLambertMaterial({ color: 0x1f242d })
    const zipper = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.65, 0.41), zipperMat)
    zipper.position.set(0, 1.15 + (torsoHeight - 1.0) * 0.4, 0.005)
    torsoGroup.add(zipper)
  }

  characterGroup.add(torsoGroup)

  // ─── 2. HEAD & CREATIVE COVERINGS (Attachment 1, 2 & 3) ───────────────────
  const headGroup = createRobloxHead(skinMat)
  headGroup.position.y = 1.95 + (torsoHeight - 1.0)
  addCreativeCovering(headGroup, prof)
  characterGroup.add(headGroup)

  // ─── 3. ARMS WITH C-HANDS & SHOULDER PIVOTS ───────────────────────────────
  const armRadius = 0.17
  const armHeight = 0.68
  const armGeo = new THREE.CylinderGeometry(armRadius, armRadius * 0.9, armHeight, 14)

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

  characterGroup.add(leftArmGroup)

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

  characterGroup.add(rightArmGroup)

  // ─── 4. LEGS WITH ROUNDED TOE CAPS & HIP PIVOTS ───────────────────────────
  const legWidth = 0.32
  const legHeight = 0.85
  const legDepth = 0.34
  const legGeo = new THREE.BoxGeometry(legWidth, legHeight, legDepth)
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

  characterGroup.add(leftLegGroup)

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

  characterGroup.add(rightLegGroup)

  // ─── 5. BILLBOARD NAME TAG ────────────────────────────────────────────────
  const nameTag = createNameTag(playerName)
  nameTag.position.y = 2.95 + (torsoHeight - 1.0)
  characterGroup.add(nameTag)

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
