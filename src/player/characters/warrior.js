import * as THREE from 'three'
import { PALETTE } from '../../palette.js'
import { getToonMaterial, applyOutlinesToGroup } from '../../materials.js'

export function createWarrior(playerName, createNameTag) {
  const group = new THREE.Group()
  group.name = `Warrior_${playerName}`
  
  const visualGroup = new THREE.Group()
  visualGroup.name = 'CharacterVisuals'
  visualGroup.position.y = 0.25
  group.add(visualGroup)

  // --- MATERIALS ---
  const matMaroon = getToonMaterial(PALETTE.armourMaroon)
  const matGrey = getToonMaterial(PALETTE.plateGrey)
  const matDark = getToonMaterial(PALETTE.gauntletDark)
  const matTan = getToonMaterial(PALETTE.armourTrimTan)
  const matBrown = getToonMaterial(PALETTE.leatherBrown)
  const matHair = getToonMaterial(PALETTE.hairBrown)
  const matSkin = getToonMaterial(PALETTE.skinTone)
  const matTycoonFrame = getToonMaterial(0x050505)
  const matTycoonLens = getToonMaterial(0x1e293b)
  const matBlade = getToonMaterial(PALETTE.bladeGrey)
  const matRed = getToonMaterial(PALETTE.gemRed)
  const matGold = getToonMaterial(PALETTE.pommelGold)

  // --- RIGGING GROUPS ---
  const torso = new THREE.Group()
  const head = new THREE.Group()
  const leftArmGroup = new THREE.Group()
  const rightArmGroup = new THREE.Group()
  const leftLegGroup = new THREE.Group()
  const rightLegGroup = new THREE.Group()

  // --- 1. HEAD (Blocky Face, Skin Exposed) ---
  head.position.y = 1.95
  
  const headBase = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.42, 6), matSkin)
  headBase.position.y = -0.1
  
  const glassesGroup = new THREE.Group()
  glassesGroup.position.set(0, 0.02, 0)
  glassesGroup.scale.setScalar(0.5)
  
  const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.08), matTycoonLens)
  lensL.position.set(-0.16, 0.06, 0.38)
  const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.16, 0.08), matTycoonLens)
  lensR.position.set(0.16, 0.06, 0.38)
  
  const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.20, 0.06), matTycoonFrame)
  frameOuter.position.set(0, 0.06, 0.36)
  
  const templeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.58), matTycoonFrame)
  templeL.position.set(-0.34, 0.08, 0.13)
  const templeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.58), matTycoonFrame)
  templeR.position.set(0.34, 0.08, 0.13)
  
  glassesGroup.add(lensL, lensR, frameOuter, templeL, templeR)
  
  const hairBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.48), matHair)
  hairBase.position.set(0, 0.17, -0.02)
  const hairLock1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.3), matHair)
  hairLock1.position.set(-0.08, 0.25, 0.12)
  hairLock1.rotation.z = -0.35
  hairLock1.rotation.x = 0.25
  const hairLock2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.28), matHair)
  hairLock2.position.set(0.12, 0.20, 0.14)
  hairLock2.rotation.z = 0.3
  hairLock2.rotation.x = 0.2
  const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.24, 0.2), matHair)
  hairBack.position.set(0, 0.14, -0.24)
  
  head.add(headBase, glassesGroup, hairBase, hairLock1, hairLock2, hairBack)

  // --- 2. TORSO (Armour Plate + Tunic + Tabard) ---
  torso.position.y = 1.15
  
  const tunic = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.72, 0.38), matMaroon)
  
  const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.42, 0.44), matGrey)
  chestPlate.position.set(0, 0.18, 0.015)
  chestPlate.rotation.z = -0.03
  const chestLowerPlate = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.22, 0.45), matGrey)
  chestLowerPlate.position.set(0, -0.12, 0.02)
  const chestRidge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.04), matDark)
  chestRidge.position.set(0, 0.16, 0.25)
  const plateTrim = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.46), matDark)
  plateTrim.position.set(0, 0.38, 0.01)
  
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.41), matBrown)
  belt.position.y = -0.3
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 0.05), matGrey)
  buckle.position.set(0, -0.3, 0.21)
  const beltStrap = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.1, 0.04), matTan)
  beltStrap.position.set(0, -0.2, 0.24)
  beltStrap.rotation.z = -0.2
  
  const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), matBrown)
  pouchL.position.set(-0.4, -0.32, 0.08)
  const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), matBrown)
  pouchR.position.set(0.4, -0.32, 0.08)

  const tabardGroup = new THREE.Group()
  tabardGroup.position.set(0, -0.3, 0.22)
  const tabard = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.72, 0.05), matMaroon)
  tabard.position.y = -0.33
  const tabardTrim = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.06), matTan)
  tabardTrim.position.y = -0.68
  const tabardSideL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.06), matTan)
  tabardSideL.position.set(-0.17, -0.34, 0.01)
  const tabardSideR = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.06), matTan)
  tabardSideR.position.set(0.17, -0.34, 0.01)
  tabardGroup.add(tabard, tabardTrim, tabardSideL, tabardSideR)

  torso.add(tunic, chestPlate, chestLowerPlate, chestRidge, plateTrim, belt, beltStrap, buckle, pouchL, pouchR, tabardGroup)

  // --- 3. ARMS (Pauldrons + Bracers + Gauntlets) ---
  const armHeight = 0.68
  leftArmGroup.position.set(-0.54, 1.45, 0)
  rightArmGroup.position.set(0.54, 1.45, 0)

  const buildArm = (isRight) => {
    const arm = new THREE.Group()
    
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.35, 0.24), matMaroon)
    sleeve.position.y = -0.15
    
    const bracer = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.26), matGrey)
    bracer.position.y = -0.45
    
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), matDark)
    hand.position.y = -armHeight
    
    const pauldron = new THREE.Mesh(
      new THREE.BoxGeometry(isRight ? 0.48 : 0.44, 0.34, 0.44),
      matGrey
    )
    pauldron.position.set(isRight ? 0.1 : -0.1, 0.12, 0)
    pauldron.rotation.z = isRight ? -0.25 : 0.25
    const pauldronRim = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.45), matDark)
    pauldronRim.position.set(isRight ? 0.1 : -0.1, -0.04, 0.015)
    pauldronRim.rotation.z = isRight ? -0.25 : 0.25

    arm.add(sleeve, bracer, hand, pauldron, pauldronRim)
    return arm
  }

  leftArmGroup.add(buildArm(false))
  rightArmGroup.add(buildArm(true))

  // --- 4. LEGS (Greaves + Boots) ---
  const legHeight = 0.85
  leftLegGroup.position.set(-0.20, 0.62, 0)
  rightLegGroup.position.set(0.20, 0.62, 0)

  const buildLeg = () => {
    const leg = new THREE.Group()
    
    const trouser = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.3), matMaroon)
    trouser.position.y = -0.2
    
    const greave = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.35, 0.34), matGrey)
    greave.position.y = -0.55
    const kneePlate = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.36), matDark)
    kneePlate.position.set(0, -0.39, 0.04)
    
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.15, 0.38), matBrown)
    boot.position.set(0, -0.77, 0.02)
    
    const toeCap = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.1, 0.15), matGrey)
    toeCap.position.set(0, -0.79, 0.15)
    
    leg.add(trouser, greave, kneePlate, boot, toeCap)
    return leg
  }

  leftLegGroup.add(buildLeg())
  rightLegGroup.add(buildLeg())

  // --- 5. WEAPON: GREATSWORD ---
  const sword = new THREE.Group()
  // Hand is at Y = -0.68 relative to arm pivot. Sword attaches here.
  sword.position.set(0, -armHeight, 0.1) 
  
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), matRed)
  
  const guard = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.15), matDark)
  guard.position.y = -0.2
  
  const gem = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.17), matRed)
  gem.position.y = -0.2
  
  const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.15), matGold)
  pommel.position.y = 0.2
  
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.2, 0.05), matBlade)
  blade.position.y = -0.85 // Points down naturally when arm hangs down
  
  sword.add(grip, guard, gem, pommel, blade)
  
  // Rotate slightly so the broad side of the blade faces outward
  sword.rotation.y = Math.PI / 2
  rightArmGroup.add(sword)

  // --- ASSEMBLY ---
  visualGroup.add(torso, head, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup)

  if (createNameTag) {
    const nameTag = createNameTag(playerName)
    nameTag.position.y = 2.95
    visualGroup.add(nameTag)
  }

  // Refined outline thickness to prevent geometry clipping
  applyOutlinesToGroup(visualGroup, 0.012, PALETTE.outline)

  return { group, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup, torso, head }
}