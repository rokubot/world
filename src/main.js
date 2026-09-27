import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createWorldTerrain, projectCoord, testLocations, SCALE } from './world/terrain.js'
import { createCharacter } from './player/character.js'

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

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.maxPolarAngle = Math.PI / 2 - 0.02 // don't go below ground
controls.minDistance = 2
controls.maxDistance = 1800

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

// Smooth camera transition state
let targetCamPos = null
let targetLookAt = null

function flyTo(x, y, z, lookX, lookY, lookZ) {
  targetCamPos = new THREE.Vector3(x, y, z)
  targetLookAt = new THREE.Vector3(lookX, lookY, lookZ)
}

// Player state (Step 3)
let player = null
let currentProfession = 'wayfarer'
let playerName = 'Tariq (Roku)'
// Spawn position: Dubai (lng 55.2, lat 25.2)
const spawnCoord = projectCoord(55.2, 25.2, SCALE)
const spawnPos = { x: spawnCoord.x, y: 0.5, z: spawnCoord.z }

function spawnPlayer(profession = currentProfession, name = playerName) {
  if (player && player.group) {
    scene.remove(player.group)
  }
  player = createCharacter(profession, name)
  player.group.position.set(spawnPos.x, spawnPos.y, spawnPos.z)
  scene.add(player.group)
  return player
}

function focusPlayer() {
  if (!player) return
  const p = player.group.position
  flyTo(p.x + 6, p.y + 4, p.z + 8, p.x, p.y + 1.2, p.z)
}

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
        const { x, z } = projectCoord(loc.lng, loc.lat, SCALE)
        flyTo(x + 25, 35, z + 35, x, 1.5, z)
      }
    })
  })

  // Focus player button
  const focusBtn = document.getElementById('btn-focus-player')
  if (focusBtn) {
    focusBtn.addEventListener('click', focusPlayer)
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

    // Spawn player character (Step 3)
    spawnPlayer(currentProfession, playerName)

    // Position camera near player initially for immediate visibility
    camera.position.set(spawnPos.x + 8, spawnPos.y + 5, spawnPos.z + 10)
    controls.target.set(spawnPos.x, spawnPos.y + 1.2, spawnPos.z)
    controls.update()

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

  // Smooth camera interpolation if flying to target
  if (targetCamPos && targetLookAt) {
    camera.position.lerp(targetCamPos, 0.06)
    controls.target.lerp(targetLookAt, 0.06)

    if (camera.position.distanceTo(targetCamPos) < 0.2) {
      targetCamPos = null
      targetLookAt = null
    }
  }

  // Billboard effect: name tag always faces camera (Step 3 requirement)
  if (player && player.nameTag) {
    player.nameTag.quaternion.copy(camera.quaternion)
  }

  controls.update()
  renderer.render(scene, camera)
}

init()
animate()
