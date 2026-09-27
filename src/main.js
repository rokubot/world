import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createWorldTerrain, projectCoord, testLocations, SCALE } from './world/terrain.js'

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
camera.position.set(0, 500, 450)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.maxPolarAngle = Math.PI / 2 - 0.02 // don't go below ground
controls.minDistance = 10
controls.maxDistance = 1800
controls.target.set(0, 0, 0)

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

// Setup navigation buttons for Step 2 validation
function setupTestNav() {
  const buttons = document.querySelectorAll('.test-btn')
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
}

// Window resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

// Initialize World
async function initWorld() {
  const loadingOverlay = document.getElementById('loading-overlay')
  const loadingStatus = document.getElementById('loading-status')
  const hudStats = document.getElementById('hud-stats')

  try {
    loadingStatus.textContent = 'Generating continent 3D meshes...'
    const terrainData = await createWorldTerrain(scene, '/assets/world.geojson')

    hudStats.textContent = `✓ ${terrainData.totalCountries} countries extruded • ${testLocations.length} validation markers placed`

    setupTestNav()

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

    if (camera.position.distanceTo(targetCamPos) < 0.5) {
      targetCamPos = null
      targetLookAt = null
    }
  }

  controls.update()
  renderer.render(scene, camera)
}

initWorld()
animate()
