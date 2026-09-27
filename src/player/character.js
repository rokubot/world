import * as THREE from 'three'

/**
 * Profession color configurations as specified
 */
export const PROFESSIONS = {
  wayfarer: {
    name: 'Wayfarer',
    torsoColor: 0x8b6914,
    trouserColor: 0x4a5a2a,
    hairColor: 0x3a2010,
    torsoHeight: 1.0
  },
  artificer: {
    name: 'Artificer',
    torsoColor: 0x444444,
    trouserColor: 0x222222,
    hairColor: 0x1a1a1a,
    torsoHeight: 1.0,
    hasApron: true
  },
  mystic: {
    name: 'Mystic',
    torsoColor: 0x4a1a6b,
    trouserColor: 0x2a0a4a,
    hairColor: 0x6b3a8a,
    torsoHeight: 1.3
  },
  tycoon: {
    name: 'Tycoon',
    torsoColor: 0x1a2a5a,
    trouserColor: 0x0a1a3a,
    hairColor: 0x1a1a1a,
    torsoHeight: 1.0
  }
}

const SKIN_COLOR = 0xffcc99
const SHOE_COLOR = 0x1a1a1a

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
 * Builds a blocky Roblox-style humanoid character from primitive geometry.
 * Returns character group and pivot groups for animation.
 */
export function createCharacter(professionKey = 'wayfarer', playerName = 'Player') {
  const prof = PROFESSIONS[professionKey.toLowerCase()] || PROFESSIONS.wayfarer
  const characterGroup = new THREE.Group()
  characterGroup.name = `Character_${playerName}`

  // Common materials
  const skinMat = new THREE.MeshLambertMaterial({ color: SKIN_COLOR })
  const hairMat = new THREE.MeshLambertMaterial({ color: prof.hairColor })
  const torsoMat = new THREE.MeshLambertMaterial({ color: prof.torsoColor })
  const trouserMat = new THREE.MeshLambertMaterial({ color: prof.trouserColor })
  const shoeMat = new THREE.MeshLambertMaterial({ color: SHOE_COLOR })

  // 1. Torso
  const torsoHeight = prof.torsoHeight
  const torsoGeo = new THREE.BoxGeometry(0.7, torsoHeight, 0.4)
  const torso = new THREE.Mesh(torsoGeo, torsoMat)
  torso.position.y = 1.0 + (torsoHeight - 1.0) / 2
  torso.castShadow = true
  torso.receiveShadow = true
  characterGroup.add(torso)

  // Artificer orange apron strip
  if (prof.hasApron) {
    const apronMat = new THREE.MeshLambertMaterial({ color: 0xff6600 })
    const apron = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.7, 0.42), apronMat)
    apron.position.set(0, 0.9, 0)
    characterGroup.add(apron)
  }

  // 2. Head
  const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8)
  const head = new THREE.Mesh(headGeo, skinMat)
  head.position.y = 1.8 + (torsoHeight - 1.0)
  head.castShadow = true
  head.receiveShadow = true
  characterGroup.add(head)

  // 3. Hair
  const hairGeo = new THREE.BoxGeometry(0.85, 0.25, 0.85)
  const hair = new THREE.Mesh(hairGeo, hairMat)
  hair.position.y = 2.25 + (torsoHeight - 1.0)
  hair.castShadow = true
  characterGroup.add(hair)

  // 4. Arms (Pivoted from shoulders)
  const armRadius = 0.18
  const armHeight = 0.9
  const armGeo = new THREE.CylinderGeometry(armRadius, armRadius, armHeight, 8)

  // Left Arm
  const leftArmGroup = new THREE.Group()
  leftArmGroup.position.set(-0.52, 1.4 + (torsoHeight - 1.0), 0)
  const leftArmMesh = new THREE.Mesh(armGeo, skinMat)
  leftArmMesh.position.set(0, -armHeight / 2, 0) // Hang down from shoulder pivot
  leftArmMesh.castShadow = true
  leftArmGroup.add(leftArmMesh)
  characterGroup.add(leftArmGroup)

  // Right Arm
  const rightArmGroup = new THREE.Group()
  rightArmGroup.position.set(0.52, 1.4 + (torsoHeight - 1.0), 0)
  const rightArmMesh = new THREE.Mesh(armGeo, skinMat)
  rightArmMesh.position.set(0, -armHeight / 2, 0) // Hang down from shoulder pivot
  rightArmMesh.castShadow = true
  rightArmGroup.add(rightArmMesh)
  characterGroup.add(rightArmGroup)

  // 5. Legs & Shoes (Pivoted from hips)
  const legWidth = 0.28
  const legHeight = 0.9
  const legDepth = 0.35
  const legGeo = new THREE.BoxGeometry(legWidth, legHeight, legDepth)
  const shoeGeo = new THREE.BoxGeometry(0.32, 0.2, 0.42)

  // Hip pivot height
  const hipPivotY = 0.65

  // Left Leg
  const leftLegGroup = new THREE.Group()
  leftLegGroup.position.set(-0.2, hipPivotY, 0)

  const leftLegMesh = new THREE.Mesh(legGeo, trouserMat)
  leftLegMesh.position.set(0, -legHeight / 2, 0) // Hang down from hip pivot
  leftLegMesh.castShadow = true
  leftLegMesh.receiveShadow = true
  leftLegGroup.add(leftLegMesh)

  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat)
  leftShoe.position.set(0, -legHeight + 0.1, 0.035) // Slight forward protrusion
  leftShoe.castShadow = true
  leftShoe.receiveShadow = true
  leftLegGroup.add(leftShoe)

  characterGroup.add(leftLegGroup)

  // Right Leg
  const rightLegGroup = new THREE.Group()
  rightLegGroup.position.set(0.2, hipPivotY, 0)

  const rightLegMesh = new THREE.Mesh(legGeo, trouserMat)
  rightLegMesh.position.set(0, -legHeight / 2, 0) // Hang down from hip pivot
  rightLegMesh.castShadow = true
  rightLegMesh.receiveShadow = true
  rightLegGroup.add(rightLegMesh)

  const rightShoe = new THREE.Mesh(shoeGeo, shoeMat)
  rightShoe.position.set(0, -legHeight + 0.1, 0.035)
  rightShoe.castShadow = true
  rightShoe.receiveShadow = true
  rightLegGroup.add(rightShoe)

  characterGroup.add(rightLegGroup)

  // 6. Name tag (billboard above head)
  const nameTag = createNameTag(playerName)
  nameTag.position.y = 2.8 + (torsoHeight - 1.0)
  characterGroup.add(nameTag)

  return {
    group: characterGroup,
    leftArmGroup,
    rightArmGroup,
    leftLegGroup,
    rightLegGroup,
    torso,
    head,
    nameTag,
    profession: prof
  }
}
