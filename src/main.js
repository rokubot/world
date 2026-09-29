import * as THREE from 'three'
import { createWorldTerrain, projectCoord, testLocations, SCALE } from './world/terrain.js'
import { createCharacter } from './player/character.js'
import { animateCharacter } from './player/animation.js'
import { createControls } from './player/controls.js'
import { createCameraController } from './camera/camera.js'

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

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x090d16)
scene.fog = new THREE.FogExp2(0x090d16, 0.0008)

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

// Lighting (Step 1 requirement 8)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75)
scene.add(ambientLight)

const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.3)
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

const secondaryLight = new THREE.DirectionalLight(0x4466aa, 0.4)
secondaryLight.position.set(-200, 150, -200)
scene.add(secondaryLight)

function flyTo(x, y, z, lookX, lookY, lookZ) {
  cameraController.flyTo(x, y, z, lookX, lookY, lookZ)
}

// Player state (Step 3)
let player = null
let currentProfession = 'wayfarer'
let playerName = 'Tariq (Roku)'
const animationStart = performance.now()
// Spawn position: beside Dubai marker (lng 55.2, lat 25.2) on UAE land
const spawnCoord = projectCoord(55.2, 25.2, SCALE)
// Offset by 4 units so player stands freely beside the red box, not inside it
const spawnPos = { x: spawnCoord.x + 4.0, y: 0.5, z: spawnCoord.z + 4.0 }

function spawnPlayer(profession = currentProfession, name = playerName) {
  if (player && player.group) {
    scene.remove(player.group)
  }
  player = createCharacter(profession, name)
  player.group.position.set(spawnPos.x, spawnPos.y, spawnPos.z)
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
        // Test locations are camera destinations, so leave player-follow mode first.
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

    // Spawn player character (Step 3)
    spawnPlayer(currentProfession, playerName)

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
    controls.updateMovement(dt, player.group)
    cameraController.update(
      player.group,
      controls.getYaw(),
      controls.getPitch(),
      controls.getCameraMode(),
      controls.getMove()
    )
    animationState = controls.getAnimationState()
  }

  // Billboard effect: name tag always faces camera (Step 3 requirement)
  if (player && player.nameTag) {
    player.nameTag.quaternion.copy(camera.quaternion)
  }

  if (player) {
    const elapsed = (performance.now() - animationStart) / 1000
    animateCharacter(player, animationState, elapsed)
  }

  renderer.render(scene, camera)
}

init()
animate()
