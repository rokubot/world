import * as THREE from 'three'
import { PALETTE } from '../../palette.js'
import { getToonMaterial, applyOutlinesToGroup } from '../../materials.js'

export function createMage(playerName, createNameTag) {
  const group = new THREE.Group()
  group.name = `Mage_${playerName}`
  
  const visualGroup = new THREE.Group()
  visualGroup.name = 'CharacterVisuals'
  visualGroup.position.y = 0.25
  group.add(visualGroup)

  // --- MATERIALS ---
  const matHood = getToonMaterial(PALETTE.hoodCharcoal)
  const matRobeP = getToonMaterial(PALETTE.robePurple)
  const matRobeB = getToonMaterial(PALETTE.robeBlue)
  const matGold = getToonMaterial(PALETTE.trimGold)
  const matSash = getToonMaterial(PALETTE.sashPurple)
  const matStaff = getToonMaterial(PALETTE.staffBrown)
  const matBelt = getToonMaterial(PALETTE.leatherBrown)
  const matSkin = getToonMaterial(PALETTE.skinTone)
  const matSilver = getToonMaterial(PALETTE.plateGrey) // Reuse grey for buckle
  
  // Emissive material for the crystal (no toon shading needed, just glowing)
  const matCrystal = new THREE.MeshLambertMaterial({ 
    color: PALETTE.crystalBlue, 
    emissive: PALETTE.crystalBlue,
    emissiveIntensity: 0.8
  })

  // --- RIGGING GROUPS ---
  const torso = new THREE.Group()
  const head = new THREE.Group()
  const leftArmGroup = new THREE.Group()
  const rightArmGroup = new THREE.Group()
  const leftLegGroup = new THREE.Group()
  const rightLegGroup = new THREE.Group()

  // --- 1. HEAD (Classic Face, Tycoon Glasses, Hair, Wizard Hat) ---
  head.position.y = 1.83
  head.scale.setScalar(0.45)
  
  const matHair = getToonMaterial(0x1a1c29)
  const matHat = getToonMaterial(PALETTE.leatherBrown)
  
  // Tycoon Glasses Materials (Dark frames, slate lenses)
  const matTycoonFrame = getToonMaterial(0x050505)
  const matTycoonLens = getToonMaterial(0x1e293b)
  
  // Classic Pill Head (Skin)
  const headCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.40, 0.65, 24), matSkin)
  const topDome = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), matSkin)
  topDome.scale.set(1, 0.32, 1)
  topDome.position.y = 0.325
  const bottomDome = new THREE.Mesh(new THREE.SphereGeometry(0.40, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), matSkin)
  bottomDome.scale.set(1, 0.22, 1)
  bottomDome.position.y = -0.325
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 0.14, 16), matSkin)
  neck.position.y = -0.42

  // Hair Wrap (Covers back and sides)
  const hairWrap = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.44, 0.45, 16, 1, true, Math.PI / 3, Math.PI * 1.33), matHair)
  hairWrap.position.set(0, 0.1, 0)
  
  // Tycoon Designer Shades
  const glassesGroup = new THREE.Group()
  glassesGroup.position.set(0, 0.02, 0)
  
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

  // Wizard Hat (Low-poly faceted)
  const hatGroup = new THREE.Group()
  hatGroup.position.set(0, 0.45, 0)
  
  // Wide 8-sided brim
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 8), matHat)
  
  // Tall 8-sided cone with a slightly flat top
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.38, 0.8, 8), matHat)
  cone.position.y = 0.4
  
  hatGroup.add(brim, cone)
  
  head.add(headCylinder, topDome, bottomDome, neck, hairWrap, glassesGroup, hatGroup)

  // --- 2. TORSO (Clean Robe Core, Offset Depths) ---
  torso.position.y = 1.15
  
  // Purple outer robe
  const robeCore = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.72, 0.35), matRobeP)
  
  // Blue inner panel (Slightly thicker on Z to stop flickering)
  const robeFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.72, 0.37), matRobeB)
  
  // Gold V-neck trim
  const trimL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.39), matGold)
  trimL.position.set(-0.15, 0.12, 0)
  trimL.rotation.z = -0.3
  const trimR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.39), matGold)
  trimR.position.set(0.15, 0.12, 0)
  trimR.rotation.z = 0.3

  // Waist (Sash and Belt layered outward)
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.2, 0.39), matSash)
  sash.position.y = -0.2
  
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.08, 0.41), matBelt)
  belt.position.y = -0.2
  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.43), matSilver)
  buckle.position.y = -0.2
  
  const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.15), matBelt)
  pouchL.position.set(-0.38, -0.25, 0)
  const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.18, 0.15), matBelt)
  pouchR.position.set(0.38, -0.25, 0)

  // Lower Robe (Skirt)
  const skirtGroup = new THREE.Group()
  skirtGroup.position.set(0, -0.35, 0)
  
  // Flared purple skirt (4-sided cylinder)
  const skirtP = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.65, 0.9, 4), matRobeP)
  skirtP.position.y = -0.45
  skirtP.rotation.y = Math.PI / 4
  
  // Blue front panel of the skirt
  const skirtB = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.9, 0.4), matRobeB)
  skirtB.position.set(0, -0.45, 0.28)
  
  // Inverted V gold trim
  const frontTrimL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.42), matGold)
  frontTrimL.position.set(-0.16, -0.45, 0.28)
  frontTrimL.rotation.z = -0.12
  const frontTrimR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.42), matGold)
  frontTrimR.position.set(0.16, -0.45, 0.28)
  frontTrimR.rotation.z = 0.12
  
  // Gold hem at the very bottom
  const hemTrim = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 0.95), matGold)
  hemTrim.position.y = -0.86

  skirtGroup.add(skirtP, skirtB, hemTrim, frontTrimL, frontTrimR)
  torso.add(robeCore, robeFront, trimL, trimR, sash, belt, buckle, pouchL, pouchR, skirtGroup)

  // --- 3. ARMS (Flared Cylindrical Sleeves) ---
  const armHeight = 0.68
  leftArmGroup.position.set(-0.54, 1.45, 0)
  rightArmGroup.position.set(0.54, 1.45, 0)

  const buildSleeve = () => {
    const arm = new THREE.Group()
    
    // Upper sleeve (Rounded shoulders instead of square boxes)
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.5, 8), matRobeP)
    sleeve.position.y = -0.2
    
    // Flared cuff (Smoothly transitioning from the upper arm)
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.3, 8), matRobeP)
    cuff.position.y = -0.55
    
    // Gold trim wrapping the cylindrical cuff
    const cuffTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.29, 0.08, 8), matGold)
    cuffTrim.position.y = -0.66
    
    // Bare hand box
    const hand = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), matSkin)
    hand.position.y = -armHeight
    
    arm.add(sleeve, cuff, cuffTrim, hand)
    return arm
  }

  leftArmGroup.add(buildSleeve())
  rightArmGroup.add(buildSleeve())

  // --- 4. LEGS (Hidden behind skirt, just boots) ---
  const legHeight = 0.85
  leftLegGroup.position.set(-0.20, 0.62, 0)
  rightLegGroup.position.set(0.20, 0.62, 0)

  const buildLeg = () => {
    const leg = new THREE.Group()
    // Invisible leg block to keep rig spacing accurate
    const hiddenLeg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), new THREE.MeshBasicMaterial({visible: false}))
    hiddenLeg.position.y = -0.3
    
    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.15, 0.34), matBelt)
    boot.position.set(0, -0.77, 0.02)
    
    leg.add(hiddenLeg, boot)
    return leg
  }

  leftLegGroup.add(buildLeg())
  rightLegGroup.add(buildLeg())

  // --- 5. WEAPON: TWISTED STAFF ---
  const staff = new THREE.Group()
  staff.position.set(0, -armHeight, 0.2) 
  
  // Twisted wood segments
  const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.6), matStaff)
  s1.position.set(0, 0.3, 0); s1.rotation.z = 0.05
  const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6), matStaff)
  s2.position.set(-0.02, -0.3, 0); s2.rotation.z = -0.05
  const s3 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.6), matStaff)
  s3.position.set(0.02, -0.8, 0); s3.rotation.z = 0.05
  
  // Forked top
  const forkL = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.03, 0.3), matStaff)
  forkL.position.set(-0.08, 0.7, 0); forkL.rotation.z = 0.4
  const forkR = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.03, 0.4), matStaff)
  forkR.position.set(0.1, 0.75, 0); forkR.rotation.z = -0.3
  
  // Glowing Crystal (made of two cones to form an octahedron shape)
  const crystalGroup = new THREE.Group()
  crystalGroup.position.set(0, 0.8, 0)
  const cryTop = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), matCrystal)
  cryTop.position.y = 0.15
  cryTop.rotation.y = Math.PI / 4
  const cryBot = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 4), matCrystal)
  cryBot.position.y = -0.15
  cryBot.rotation.x = Math.PI
  cryBot.rotation.y = Math.PI / 4
  crystalGroup.add(cryTop, cryBot)

  // Add a subtle blue point light to the crystal
  const staffLight = new THREE.PointLight(PALETTE.crystalBlue, 1, 3)
  crystalGroup.add(staffLight)

  staff.add(s1, s2, s3, forkL, forkR, crystalGroup)
  
  // Angle the staff slightly forward in the hand
  staff.rotation.x = 0.2
  rightArmGroup.add(staff)

  // --- ASSEMBLY ---
  visualGroup.add(torso, head, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup)

  const nameTag = createNameTag ? createNameTag(playerName) : new THREE.Group()
  nameTag.position.y = 2.95
  visualGroup.add(nameTag)

  applyOutlinesToGroup(visualGroup, 0.024, PALETTE.outline)

  return { group, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup, torso, head, nameTag }
}