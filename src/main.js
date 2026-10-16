import * as THREE from 'three'
import { createWorldTerrain, projectCoord, testLocations, SCALE } from './world/terrain.js'
import { createCharacter } from './player/character.js'
import { animateCharacter } from './player/animation.js'
import { createControls } from './player/controls.js'
import { createCameraController } from './camera/camera.js'
import { createVehicleSystem } from './vehicles/vehicle.js'
import { CONFIG } from './config.js'
import { PALETTE } from './palette.js'
import { getToonMaterial } from './materials.js'

// Setup canvas and renderer
const canvas = document.getElementById('game-canvas')
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance'
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

// Scene & Anime Atmosphere (Step 7.5)
const scene = new THREE.Scene()
scene.background = new THREE.Color(PALETTE.atmosphere.skyHorizon)
scene.fog = new THREE.Fog(PALETTE.atmosphere.fog, 200, 1400)

// Gradient Sky Dome (Step 7.5)
function createSkyDome() {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#38bdf8') // top deep blue
  grad.addColorStop(0.55, '#a5f3fc') // mid soft sky
  grad.addColorStop(1.0, '#bae6fd') // pale horizon
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 32, 256)

  const texture = new THREE.CanvasTexture(canvas)
  const skyGeo = new THREE.SphereGeometry(1800, 32, 16)
  const skyMat = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    depthWrite: false
  })
  const skyMesh = new THREE.Mesh(skyGeo, skyMat)
  skyMesh.name = 'SkyDome'
  skyMesh.userData.skipOutline = true
  return skyMesh
}
const skyDome = createSkyDome()
scene.add(skyDome)

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.5,
  5000
)
const clock = new THREE.Clock()

const cameraController = createCameraController(camera)
const controls = createControls(renderer, {
  onCameraModeChange: mode => {
    // Keep map panning centered on the current player location.
    if (mode !== 0 && player) {
      cameraController.syncToPlayer(player.group)
    }
  },
  onInteract: () => window.dispatchEvent(new Event('roku:interact')),
  onMap: () => window.dispatchEvent(new Event('roku:toggle-map')),
  onVehicle: () => window.dispatchEvent(new Event('roku:toggle-vehicle')),
  onClose: () => window.dispatchEvent(new Event('roku:close-panel')),
  onChatFocus: () => window.dispatchEvent(new Event('roku:focus-chat'))
})

// Stylized Lighting (Step 7.5: 1 Directional soft warm + 1 Hemisphere light)
const sunLight = new THREE.DirectionalLight(PALETTE.atmosphere.sunLight, 1.25)
sunLight.position.set(250, 400, 200)
sunLight.castShadow = true
sunLight.shadow.mapSize.width = 2048
sunLight.shadow.mapSize.height = 2048
sunLight.shadow.camera.near = 50
sunLight.shadow.camera.far = 1200
const d = 600
sunLight.shadow.camera.left = -d
sunLight.shadow.camera.right = d
sunLight.shadow.camera.top = d
sunLight.shadow.camera.bottom = -d
scene.add(sunLight)

const hemiLight = new THREE.HemisphereLight(
  PALETTE.atmosphere.hemiSky,
  PALETTE.atmosphere.hemiGround,
  0.65
)
scene.add(hemiLight)

// Stylized Low-Poly Clouds (Step 7.5)
function createStylizedClouds(scene) {
  const cloudGroup = new THREE.Group()
  cloudGroup.name = 'StylizedClouds'
  const cloudGeo = new THREE.DodecahedronGeometry(7, 0)
  const cloudMat = getToonMaterial(PALETTE.atmosphere.cloud, {
    transparent: true,
    opacity: 0.92
  })

  const clouds = []
  for (let i = 0; i < 22; i++) {
    const cluster = new THREE.Group()
    const partsCount = 3 + Math.floor(Math.random() * 3)
    for (let p = 0; p < partsCount; p++) {
      const part = new THREE.Mesh(cloudGeo, cloudMat)
      part.scale.set(
        1.6 + Math.random() * 1.4,
        0.5 + Math.random() * 0.4,
        1.3 + Math.random() * 1.2
      )
      part.position.set(
        (p - partsCount / 2) * 7 + (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 5
      )
      part.castShadow = false
      part.receiveShadow = false
      cluster.add(part)
    }
    cluster.position.set(
      (Math.random() - 0.5) * 900,
      130 + Math.random() * 60,
      (Math.random() - 0.5) * 700
    )
    cluster.userData.driftSpeed = 1.8 + Math.random() * 2.2
    cloudGroup.add(cluster)
    clouds.push(cluster)
  }
  scene.add(cloudGroup)
  return {
    group: cloudGroup,
    update(dt) {
      clouds.forEach(c => {
        c.position.x += c.userData.driftSpeed * dt
        if (c.position.x > 500) c.position.x = -500
      })
    }
  }
}
let cloudSystem = null

function flyTo(x, y, z, lookX, lookY, lookZ) {
  cameraController.flyTo(x, y, z, lookX, lookY, lookZ)
}

// Player state (Step 3 & 7)
let player = null
let currentProfession = 'wayfarer'
let playerName = 'Tariq (Roku)'
const animationStart = performance.now()

// Spawn position from CONFIG
const spawnCoord = projectCoord(CONFIG.player.spawnCoord.lng, CONFIG.player.spawnCoord.lat, SCALE)
const spawnPos = {
  x: spawnCoord.x + CONFIG.player.spawnOffset.x,
  y: CONFIG.player.spawnOffset.y,
  z: spawnCoord.z + CONFIG.player.spawnOffset.z
}

function spawnPlayer(profession = currentProfession, name = playerName) {
  if (player && player.group) {
    scene.remove(player.group)
  }
  player = createCharacter(profession, name)
  player.group.position.set(spawnPos.x, spawnPos.y, spawnPos.z)
  vehicleSystem?.setCharacter(player)
  cameraController.syncToPlayer(player.group)
  scene.add(player.group)
  return player
}

function focusPlayer() {
  if (!player) return
  const p = player.group.position
  flyTo(p.x + 3.5, p.y + 2.5, p.z + 4.5, p.x, p.y + 1.2, p.z)
}

// Terrain references for UI toggles
let terrainRef = null
let vehicleSystem = null

// Setup navigation & profession buttons
function setupUI() {
  // Step 2 validation location buttons
  const buttons = document.querySelectorAll('.test-btn[data-loc]')
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const locName = btn.dataset.loc
      if (locName === 'Overview') {
        flyTo(0, 550, 450, 0, 0, 0)
        return
      }

      const loc = testLocations.find(l => l.name === locName)
      if (loc) {
        if (controls.getCameraMode() === 0) {
          controls.setCameraMode(1)
        }
        const { x, z } = projectCoord(loc.lng, loc.lat, SCALE)
        flyTo(x + 15, 20, z + 20, x, 1.5, z)
      }
    })
  })

  // Focus player button
  const focusBtn = document.getElementById('btn-focus-player')
  if (focusBtn) {
    focusBtn.addEventListener('click', focusPlayer)
  }

  // Toggle test boxes button
  const toggleBoxesBtn = document.getElementById('btn-toggle-boxes')
  if (toggleBoxesBtn && terrainRef?.testBoxGroup) {
    toggleBoxesBtn.addEventListener('click', () => {
      const visible = !terrainRef.testBoxGroup.visible
      terrainRef.testBoxGroup.visible = visible
      toggleBoxesBtn.textContent = visible ? 'Hide Test Boxes 🟥' : 'Show Test Boxes 🟥'
    })
  }

  // Step 3 profession switcher buttons
  const profButtons = document.querySelectorAll('.prof-btn')
  profButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      profButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      currentProfession = btn.dataset.prof
      spawnPlayer(currentProfession, playerName)
    })
  })
}

// Window resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Initialize World & Player
async function init() {
  const loadingOverlay = document.getElementById('loading-overlay')
  const loadingStatus = document.getElementById('loading-status')
  const hudStats = document.getElementById('hud-stats')

  try {
    loadingStatus.textContent = 'Generating continent 3D meshes...'
    const terrainData = await createWorldTerrain(scene, '/assets/world.geojson')
    terrainRef = terrainData

    // Spawn player character (Step 3 & 7)
    spawnPlayer(currentProfession, playerName)

    // Setup anime clouds
    cloudSystem = createStylizedClouds(scene)

    const dubaiCoord = projectCoord(55.274, 25.197, SCALE)
    const parisCoord = projectCoord(2.294, 48.858, SCALE)
    const sydneyCoord = projectCoord(151.215, -33.857, SCALE)

    // Paved road ribbon passing through Dubai vehicle spawn area
    const roadGeo = new THREE.PlaneGeometry(6, 120)
    roadGeo.rotateX(-Math.PI / 2)
    const roadMat = getToonMaterial(PALETTE.biome.road)
    const dubaiRoad = new THREE.Mesh(roadGeo, roadMat)
    dubaiRoad.position.set(dubaiCoord.x + 10, 0.52, dubaiCoord.z + 10)
    dubaiRoad.receiveShadow = true
    dubaiRoad.userData.skipOutline = true
    scene.add(dubaiRoad)

    vehicleSystem = createVehicleSystem(scene, {
      character: player,
      roadMeshes: [dubaiRoad],
      spawnPoints: [
        { x: dubaiCoord.x + 10, y: 0.5, z: dubaiCoord.z + 10, name: 'DubaiCar', color: PALETTE.red.base },
        { x: parisCoord.x + 10, y: 0.5, z: parisCoord.z + 10, name: 'ParisCar', color: PALETTE.blue.base },
        { x: sydneyCoord.x + 10, y: 0.5, z: sydneyCoord.z + 10, name: 'SydneyCar', color: PALETTE.green.base }
      ]
    })
    window.addEventListener('roku:toggle-vehicle', () => vehicleSystem.toggleVehicle())

    // Position camera near player initially for immediate visibility
    camera.position.set(spawnPos.x + 3.5, spawnPos.y + 2.5, spawnPos.z + 4.5)
    cameraController.syncToPlayer(player.group)

    hudStats.textContent = `✓ ${terrainData.totalCountries} countries extruded • Player: ${currentProfession} • Dubai`

    setupUI()

    // Hide loading screen
    setTimeout(() => {
      loadingOverlay.style.opacity = '0'
      setTimeout(() => {
        loadingOverlay.style.display = 'none'
      }, 500)
    }, 200)
  } catch (err) {
    console.error('Failed to initialize Roku World:', err)
    loadingStatus.textContent = `Error: ${err.message}`
    loadingStatus.style.color = '#ff6b6b'
  }
}

// Animation / Game Loop
function animate() {
  requestAnimationFrame(animate)

  const dt = Math.min(clock.getDelta(), 0.1)
  let animationState = 'idle'
  if (player) {
    if (vehicleSystem?.isDriving()) {
      vehicleSystem.update(dt, controls.getYaw())
    } else {
      controls.updateMovement(dt, player.group)
    }
    cameraController.update(
      player.group,
      controls.getYaw(),
      controls.getPitch(),
      controls.getCameraMode(),
      controls.getMove()
    )
    animationState = controls.getAnimationState()
  }

  if (player) {
    const elapsed = (performance.now() - animationStart) / 1000
    animateCharacter(player, animationState, elapsed)
  }

  cloudSystem?.update(dt)

  renderer.render(scene, camera)
}

init()
animate()
