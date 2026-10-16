import * as THREE from 'three'
import { PALETTE } from '../palette.js'
import { CONFIG } from '../config.js'
import { getToonMaterial, applyOutlinesToGroup } from '../materials.js'

/**
 * Profession color & style configurations pulling strictly from PALETTE (Step 7.1)
 */
export const PROFESSIONS = {
  wayfarer: {
    name: 'Wayfarer',
    torsoColor: PALETTE.professions.wayfarer.jacket,
    trouserColor: PALETTE.professions.wayfarer.trouser,
    hairColor: PALETTE.professions.wayfarer.hair,
    hairHighlight: PALETTE.professions.wayfarer.hairHighlight,
    accessoryType: 'adventurer_hair',
    accentColor: PALETTE.professions.wayfarer.accent,
    beltColor: PALETTE.professions.wayfarer.belt,
    torsoHeight: 1.0
  },
  artificer: {
    name: 'Artificer',
    torsoColor: PALETTE.professions.artificer.jacket,
    trouserColor: PALETTE.professions.artificer.trouser,
    hairColor: PALETTE.professions.artificer.hair,
    hairHighlight: PALETTE.professions.artificer.hairHighlight,
    headphonesColor: PALETTE.professions.artificer.headphones,
    accessoryType: 'headphones_hair',
    accentColor: PALETTE.professions.artificer.accent,
    beltColor: PALETTE.professions.artificer.belt,
    torsoHeight: 1.0,
    hasApron: true
  },
  mystic: {
    name: 'Mystic',
    torsoColor: PALETTE.professions.mystic.jacket,
    trouserColor: PALETTE.professions.mystic.trouser,
    hairColor: PALETTE.professions.mystic.hair,
    hairHighlight: PALETTE.professions.mystic.hairHighlight,
    hoodColor: PALETTE.professions.mystic.hood,
    hoodTrimColor: PALETTE.professions.mystic.hoodTrim,
    accessoryType: 'mystic_cowl',
    accentColor: PALETTE.professions.mystic.accent,
    beltColor: PALETTE.professions.mystic.belt,
    torsoHeight: 1.25
  },
  tycoon: {
    name: 'Tycoon',
    torsoColor: PALETTE.professions.tycoon.jacket,
    trouserColor: PALETTE.professions.tycoon.trouser,
    hairColor: PALETTE.professions.tycoon.hair,
    hairHighlight: PALETTE.professions.tycoon.hairHighlight,
    accessoryType: 'styled_hair',
    accentColor: PALETTE.professions.tycoon.accent,
    beltColor: PALETTE.professions.tycoon.belt,
    torsoHeight: 1.0
  }
}

const HEAD_CYLINDER_GEO = new THREE.CylinderGeometry(0.38, 0.40, 0.65, 24)
const HEAD_TOP_DOME_GEO = new THREE.SphereGeometry(0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)
const HEAD_BOTTOM_DOME_GEO = new THREE.SphereGeometry(0.40, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2)
const NECK_GEO = new THREE.CylinderGeometry(0.18, 0.20, 0.14, 16)
const HAIR_CROWN_GEO = new THREE.SphereGeometry(0.44, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2)
const HAIR_BANG_ONE_GEO = new THREE.BoxGeometry(0.24, 0.16, 0.14)
const HAIR_BANG_TWO_GEO = new THREE.BoxGeometry(0.22, 0.15, 0.14)
const HAIR_BANG_THREE_GEO = new THREE.BoxGeometry(0.18, 0.13, 0.12)
const BACK_HAIR_GEO = new THREE.CylinderGeometry(0.41, 0.42, 0.36, 18, 1, false, Math.PI * 0.5, Math.PI)
const HEADPHONE_PAD_GEO = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 16)
const HEADPHONE_BAND_GEO = new THREE.TorusGeometry(0.44, 0.04, 8, 20, Math.PI)
const ARTIFICER_HAIR_GEO = new THREE.BoxGeometry(0.68, 0.18, 0.68)
const MYSTIC_HOOD_GEO = new THREE.SphereGeometry(0.46, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2)
const MYSTIC_HOOD_RIM_GEO = new THREE.TorusGeometry(0.46, 0.06, 8, 20, Math.PI * 1.2)
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

function createEyewear(headGroup, eyewearConfig) {
  if (!eyewearConfig?.enabled) return

  const style = eyewearConfig.type
  const size = CONFIG.eyewear.sizes[style]
  if (!size) {
    throw new Error(`Unsupported eyewear type "${style}".`)
  }

  const eyewear = new THREE.Group()
  eyewear.name = `Eyewear_${style}`

  const addMesh = (geometry, color, x, y, z) => {
    const mesh = new THREE.Mesh(geometry, getToonMaterial(color))
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    eyewear.add(mesh)
  }

  if (style === 'sunglasses') {
    const frameColor = PALETTE.eyewear.sunglassesFrame
    const lensColor = PALETTE.eyewear.sunglassesLens
    const lensGeometry = new THREE.BoxGeometry(size.lensWidth, size.lensHeight, size.lensDepth)
    const frameGeometry = new THREE.BoxGeometry(size.lensWidth, size.frameWidth, size.frameDepth)
    const bridgeGeometry = new THREE.BoxGeometry(size.bridgeWidth, size.frameWidth, size.frameDepth)
    const templeGeometry = new THREE.BoxGeometry(
      size.templeWidth,
      size.templeHeight,
      size.templeLength
    )

    for (const side of [-1, 1]) {
      addMesh(lensGeometry, lensColor, side * size.lensSpacing / 2, size.lensY, size.frontZ)
      addMesh(
        frameGeometry,
        frameColor,
        side * size.lensSpacing / 2,
        size.lensY + size.lensHeight / 2,
        size.frontZ
      )
      addMesh(
        templeGeometry,
        frameColor,
        side * (size.lensSpacing / 2 + size.lensWidth / 2),
        size.lensY,
        size.frontZ - size.templeLength / 2
      )
    }
    addMesh(bridgeGeometry, frameColor, 0, size.lensY, size.frontZ)
  } else if (style === 'goldAviators') {
    const frameColor = PALETTE.eyewear.aviatorFrame
    const lensColor = PALETTE.eyewear.aviatorLens
    const lensGeometry = new THREE.CircleGeometry(size.lensRadius, size.segments)
    const frameGeometry = new THREE.TorusGeometry(
      size.frameRadius,
      size.frameTubeRadius,
      size.frameRadialSegments,
      size.segments
    )
    const bridgeGeometry = new THREE.BoxGeometry(
      size.bridgeWidth,
      size.bridgeHeight,
      size.bridgeDepth
    )
    const templeGeometry = new THREE.BoxGeometry(
      size.templeWidth,
      size.templeHeight,
      size.templeLength
    )

    for (const side of [-1, 1]) {
      const x = side * size.lensSpacing
      const lens = new THREE.Mesh(lensGeometry, getToonMaterial(lensColor))
      lens.scale.y = size.lensHeightScale
      lens.position.set(x, size.lensY, size.frontZ)
      lens.castShadow = true
      eyewear.add(lens)

      const frame = new THREE.Mesh(frameGeometry, getToonMaterial(frameColor))
      frame.scale.y = size.lensHeightScale
      frame.position.set(x, size.lensY, size.frontZ)
      frame.castShadow = true
      eyewear.add(frame)

      addMesh(
        templeGeometry,
        frameColor,
        side * (size.lensSpacing + size.frameRadius),
        size.lensY,
        size.frontZ - size.templeLength / 2
      )
    }
    addMesh(bridgeGeometry, frameColor, 0, size.lensY + size.bridgeYOffset, size.frontZ)
  } else if (style === 'amberVisor') {
    const visorColor = PALETTE.eyewear.visor
    const visor = new THREE.BoxGeometry(size.width, size.height, size.depth)
    const sidePiece = new THREE.BoxGeometry(size.sideWidth, size.sideHeight, size.sideDepth)
    addMesh(visor, visorColor, 0, size.y, size.frontZ)
    for (const side of [-1, 1]) {
      addMesh(sidePiece, visorColor, side * size.width / 2, size.y, size.frontZ - size.sideDepth / 2)
    }
  } else if (style === 'goggles') {
    const frameColor = PALETTE.eyewear.gogglesFrame
    const lensColor = PALETTE.eyewear.gogglesLens
    const lensGeometry = new THREE.CircleGeometry(size.lensRadius, size.segments)
    const frameGeometry = new THREE.TorusGeometry(
      size.frameRadius,
      size.frameTubeRadius,
      size.frameRadialSegments,
      size.segments
    )
    const bridgeGeometry = new THREE.BoxGeometry(
      size.bridgeWidth,
      size.bridgeHeight,
      size.bridgeDepth
    )
    const strapGeometry = new THREE.BoxGeometry(size.strapLength, size.strapHeight, size.strapDepth)

    addMesh(strapGeometry, PALETTE.eyewear.strap, 0, size.lensY, size.frontZ - size.strapDepth)
    for (const side of [-1, 1]) {
      const x = side * size.lensSpacing
      addMesh(lensGeometry, lensColor, x, size.lensY, size.frontZ)
      addMesh(frameGeometry, frameColor, x, size.lensY, size.frontZ)
    }
    addMesh(bridgeGeometry, frameColor, 0, size.lensY, size.frontZ)
  }

  headGroup.add(eyewear)
}

/**
 * Creates the rounded Roblox head geometry.
 * Solid, completely featureless shape with no eyes, nose, or mouth.
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
 * Adds hairstyle and head accessories with chunky toon shapes and highlight layers.
 */
function addCreativeCovering(headGroup, prof) {
  const type = prof.accessoryType

  if (type === 'adventurer_hair' || type === 'sunglasses_adventurer' || type === 'sunglasses_beanie') {
    const hairMat = getToonMaterial(prof.hairColor)
    const highlightMat = getToonMaterial(prof.hairHighlight)

    // Voluminous hair crown dome
    const crown = new THREE.Mesh(HAIR_CROWN_GEO, hairMat)
    crown.scale.set(1.05, 0.82, 1.06)
    crown.position.set(0, 0.22, 0)
    crown.castShadow = true
    headGroup.add(crown)

    // Side-swept front bangs with anime highlight chunk
    const bang1 = new THREE.Mesh(HAIR_BANG_ONE_GEO, highlightMat)
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

    // Smooth rounded back hair
    const backHair = new THREE.Mesh(BACK_HAIR_GEO, hairMat)
    backHair.position.set(0, 0.10, 0)
    headGroup.add(backHair)
  }

  else if (type === 'headphones_hair' || type === 'cyber_visor_headphones') {
    const phoneMat = getToonMaterial(prof.headphonesColor || PALETTE.yellow.base)
    const strapMat = getToonMaterial(PALETTE.dark.base)
    const hairMat = getToonMaterial(prof.hairColor)
    const highlightMat = getToonMaterial(prof.hairHighlight)

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

    // Spiky dark hair on top with highlight shape
    const topHair = new THREE.Mesh(ARTIFICER_HAIR_GEO, hairMat)
    topHair.position.y = 0.38
    const hairSpike = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.3), highlightMat)
    hairSpike.position.set(0.12, 0.46, 0.1)
    headGroup.add(topHair, hairSpike)
  }

  else if (type === 'mystic_cowl' || type === 'mystic_cowl_visor') {
    const hoodMat = getToonMaterial(prof.hoodColor || PALETTE.professions.mystic.hood)
    const hoodTrimMat = getToonMaterial(prof.hoodTrimColor || PALETTE.professions.mystic.hoodTrim)

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

  else if (type === 'styled_hair' || type === 'designer_shades_chain') {
    const hairMat = getToonMaterial(prof.hairColor)
    const highlightMat = getToonMaterial(prof.hairHighlight)

    const hairMain = new THREE.Mesh(TYCOON_HAIR_MAIN_GEO, hairMat)
    hairMain.position.set(0, 0.35, -0.04)

    const hairHighlight = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.6), highlightMat)
    hairHighlight.position.set(-0.15, 0.46, -0.04)

    const hairBack = new THREE.Mesh(TYCOON_HAIR_BACK_GEO, hairMat)
    hairBack.position.set(0, 0.15, -0.34)

    headGroup.add(hairMain, hairHighlight, hairBack)
  }
}

/**
 * Creates the classic Roblox C-clamp shaped hand
 */
function createRobloxCHand(skinMat, side = 'left') {
  const handGroup = new THREE.Group()
  handGroup.name = 'RobloxCHand'

  const wrist = new THREE.Mesh(WRIST_GEO, skinMat)
  wrist.position.y = 0.05
  handGroup.add(wrist)

  const clamp = new THREE.Mesh(HAND_CLAMP_GEO, skinMat)
  clamp.rotation.x = Math.PI / 2
  clamp.rotation.y = side === 'left' ? Math.PI : 0
  clamp.position.y = -0.06
  handGroup.add(clamp)

  handGroup.traverse(object => {
    object.castShadow = true
    object.receiveShadow = true
  })
  return handGroup
}

/**
 * Creates shoe with rounded toe dome
 */
function createRobloxShoe(shoeMat) {
  const shoeGroup = new THREE.Group()
  shoeGroup.name = 'RobloxShoe'

  const base = new THREE.Mesh(SHOE_BASE_GEO, shoeMat)
  base.position.set(0, -0.01, 0)
  base.castShadow = true
  base.receiveShadow = true
  shoeGroup.add(base)

  const toe = new THREE.Mesh(SHOE_TOE_GEO, shoeMat)
  toe.rotation.x = Math.PI / 2
  toe.scale.set(1.0, 1.25, 0.95)
  toe.position.set(0, 0.0, 0.20)
  toe.castShadow = true
  toe.receiveShadow = true
  shoeGroup.add(toe)

  return shoeGroup
}

/**
 * High-resolution canvas billboard name tag
 */
function createNameTag(playerName = 'Player') {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'rgba(18, 24, 38, 0.85)'
  ctx.beginPath()
  ctx.roundRect(16, 8, 224, 48, 8)
  ctx.fill()

  ctx.strokeStyle = '#f5c518'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px Arial, sans-serif'
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
 * Builds a blocky Roblox-style humanoid character with toon shading,
 * palette integration, clean outlines, and an optional faceless design.
 */
export function createCharacter(
  professionKey = 'wayfarer',
  playerName = 'Player',
  characterConfig = CONFIG.characters.npcDefault
) {
  const prof = PROFESSIONS[professionKey.toLowerCase()] || PROFESSIONS.wayfarer
  const characterGroup = new THREE.Group()
  characterGroup.name = `Character_${playerName}`
  const visualGroup = new THREE.Group()
  visualGroup.name = 'CharacterVisuals'
  visualGroup.position.y = 0.25
  characterGroup.add(visualGroup)

  // Toon materials from master PALETTE
  const skinMat = getToonMaterial(PALETTE.skin.base)
  const torsoMat = getToonMaterial(prof.torsoColor)
  const trouserMat = getToonMaterial(prof.trouserColor)
  const shoeMat = getToonMaterial(PALETTE.dark.base)
  const beltMat = getToonMaterial(prof.beltColor || PALETTE.dark.shadow)
  const buckleMat = getToonMaterial(prof.accentColor)
  const strapMat = getToonMaterial(PALETTE.outline)
  const backpackMat = getToonMaterial(PALETTE.dark.base)

  const torsoHeight = prof.torsoHeight

  // ─── 1. TORSO ─────────────────────────────────────────────────────────────
  const torsoGroup = new THREE.Group()
  torsoGroup.name = 'TorsoGroup'

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

  // Belt
  const belt = new THREE.Mesh(BELT_GEO, beltMat)
  belt.position.y = 0.73
  torsoGroup.add(belt)

  // Belt Buckle on FRONT (+Z)
  const buckle = new THREE.Mesh(BUCKLE_GEO, buckleMat)
  buckle.position.set(0, 0.73, 0.20)
  torsoGroup.add(buckle)

  // Backpack on BACK (-Z)
  const backpack = new THREE.Mesh(BACKPACK_GEO, backpackMat)
  backpack.position.set(0, 1.15 + (torsoHeight - 1.0) * 0.4, -0.28)
  backpack.castShadow = true
  torsoGroup.add(backpack)

  // Front shoulder straps
  const leftStrap = new THREE.Mesh(SHOULDER_STRAP_GEO, strapMat)
  leftStrap.position.set(-0.25, 1.15 + (torsoHeight - 1.0) * 0.4, 0.06)
  const rightStrap = new THREE.Mesh(SHOULDER_STRAP_GEO, strapMat)
  rightStrap.position.set(0.25, 1.15 + (torsoHeight - 1.0) * 0.4, 0.06)
  torsoGroup.add(leftStrap, rightStrap)

  // Profession details on chest
  if (prof.hasApron) {
    const apronMat = getToonMaterial(PALETTE.orange.base)
    const apronBody = new THREE.Mesh(APRON_GEO, apronMat)
    apronBody.position.set(0, 1.08, 0)
    torsoGroup.add(apronBody)

    const pocketMat = getToonMaterial(PALETTE.orange.shadow)
    const pocket = new THREE.Mesh(APRON_POCKET_GEO, pocketMat)
    pocket.position.set(0, 0.96, 0)
    torsoGroup.add(pocket)
  } else if (prof.name === 'Tycoon') {
    const chainMat = getToonMaterial(PALETTE.gold.light)
    const chain = new THREE.Mesh(CHAIN_GEO, chainMat)
    chain.position.set(0, 1.40, 0.21)
    chain.rotation.x = Math.PI / 1.4
    torsoGroup.add(chain)
  } else if (prof.name === 'Wayfarer') {
    const zipperMat = getToonMaterial(PALETTE.gold.base)
    const zipper = new THREE.Mesh(ZIPPER_GEO, zipperMat)
    zipper.position.set(0, 1.15 + (torsoHeight - 1.0) * 0.4, 0.205)
    torsoGroup.add(zipper)
  }

  visualGroup.add(torsoGroup)

  // ─── 2. HEAD & CREATIVE COVERINGS (Faceless) ─────────────────────────────
  const headGroup = createRobloxHead(skinMat)
  headGroup.position.y = 1.95 + (torsoHeight - 1.0)
  addCreativeCovering(headGroup, prof)
  createEyewear(headGroup, characterConfig?.eyewear)
  visualGroup.add(headGroup)

  // ─── 3. ARMS WITH C-HANDS & SHOULDER PIVOTS ───────────────────────────────
  const armHeight = 0.68
  const armGeo = ARM_GEO

  // Left Arm
  const leftArmGroup = new THREE.Group()
  leftArmGroup.name = 'LeftArmGroup'
  leftArmGroup.position.set(-0.54, 1.45 + (torsoHeight - 1.0) * 0.6, 0)

  const leftArmMesh = new THREE.Mesh(armGeo, torsoMat)
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

  const rightArmMesh = new THREE.Mesh(armGeo, torsoMat)
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

  // ─── 6. CEL-SHADED OUTLINES (Step 7.3) ───────────────────────────────────
  applyOutlinesToGroup(visualGroup, 0.024, PALETTE.outline)

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
