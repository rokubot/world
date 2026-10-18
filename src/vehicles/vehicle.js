import * as THREE from 'three'
import { CONFIG } from '../config.js'
import { PALETTE } from '../palette.js'
import { getToonMaterial, applyOutlinesToGroup } from '../materials.js'

export function createCar(color = PALETTE.red.base) {
  const group = new THREE.Group()
  const carMat = getToonMaterial(color)
  const darkMat = getToonMaterial(PALETTE.dark.base)
  const windowMat = getToonMaterial(PALETTE.atmosphere.hemiSky)

  // Main chassis
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.8, 4),
    carMat
  )
  body.position.y = 0.5

  // Cabin roof
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.7, 2.4),
    carMat
  )
  roof.position.set(0, 1.25, -0.1)

  // Windshield & windows (flat blocky stylised anime windows)
  const frontWindshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.5, 0.05),
    windowMat
  )
  frontWindshield.position.set(0, 1.22, 1.11)

  const rearWindshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.5, 0.05),
    windowMat
  )
  rearWindshield.position.set(0, 1.22, -1.31)

  // Headlights (warm anime yellow)
  const headlightMat = getToonMaterial(PALETTE.yellow.light)
  const leftLight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), headlightMat)
  leftLight.position.set(-0.65, 0.55, 2.01)
  const rightLight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.1), headlightMat)
  rightLight.position.set(0.65, 0.55, 2.01)

  group.add(body, roof, frontWindshield, rearWindshield, leftLight, rightLight)

  const wheelGeometry = new THREE.CylinderGeometry(
    CONFIG.vehicles.wheelRadius,
    CONFIG.vehicles.wheelRadius,
    0.3,
    16
  )
  const wheels = []

  for (const x of [-0.95, 0.95]) {
    for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(wheelGeometry, darkMat)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, CONFIG.vehicles.wheelRadius, z)
      group.add(wheel)
      wheels.push(wheel)
    }
  }

  group.userData.wheels = wheels
  group.name = 'VehicleCar'
  group.traverse(object => {
    object.castShadow = true
    object.receiveShadow = true
  })

  // Apply inverted hull outlines to vehicle
  applyOutlinesToGroup(group, 0.035, PALETTE.outline)

  return group
}

function isRoadAt(position, roadMeshes, roadCheck) {
  if (roadCheck) return roadCheck(position)
  if (!roadMeshes?.length) return false

  const raycaster = new THREE.Raycaster(
    new THREE.Vector3(position.x, position.y + 100, position.z),
    new THREE.Vector3(0, -1, 0),
    0,
    200
  )
  const hits = raycaster.intersectObjects(roadMeshes, false)
  return hits.length > 0
}

export function createVehicleSystem(scene, {
  character = null,
  vehicleType = 'car',
  spawnPoints = [],
  roadMeshes = [],
  roadCheck = null,
  enterDistance = CONFIG.vehicles.enterDistance
} = {}) {
  const keys = new Set()
  const vehicles = spawnPoints.map((spawn, index) => {
    const mesh = spawn.mesh || createCar(spawn.color)
    mesh.visible = true
    mesh.position.set(spawn.x, spawn.y ?? 0, spawn.z)
    mesh.userData.isVehicle = true
    mesh.userData.vehicleType = spawn.type || vehicleType
    mesh.name = spawn.name || `Vehicle_${index + 1}`
    scene.add(mesh)
    return { mesh, type: mesh.userData.vehicleType, occupied: false }
  })

  let activeVehicle = null
  let currentCharacter = character
  const move = new THREE.Vector3()

  const onKeyDown = event => keys.add(event.code)
  const onKeyUp = event => keys.delete(event.code)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  function toggleVehicle() {
    if (!currentCharacter) return false

    // Exit active vehicle
    if (activeVehicle) {
      const vehicle = activeVehicle
      vehicle.occupied = false
      vehicle.mesh.visible = true
      currentCharacter.group.visible = true

      // Side position offset relative to car facing angle
      const sideDistance = CONFIG.vehicles.exitOffsetDistance
      const yaw = vehicle.mesh.rotation.y
      const exitOffset = new THREE.Vector3(
        Math.cos(yaw) * sideDistance,
        0,
        -Math.sin(yaw) * sideDistance
      )

      currentCharacter.group.position.copy(vehicle.mesh.position).add(exitOffset)
      currentCharacter.group.position.y = 0.5
      activeVehicle = null
      return false
    }

    // Find nearest unoccupied vehicle
    const nearest = vehicles
      .filter(vehicle => !vehicle.occupied)
      .sort((a, b) => a.mesh.position.distanceTo(currentCharacter.group.position) - b.mesh.position.distanceTo(currentCharacter.group.position))[0]

    if (!nearest || nearest.mesh.position.distanceTo(currentCharacter.group.position) > enterDistance) {
      return false
    }

    // Enter vehicle: move character into car, hide character, keep car where it is
    activeVehicle = nearest
    nearest.occupied = true
    currentCharacter.group.position.copy(nearest.mesh.position)
    currentCharacter.group.rotation.y = nearest.mesh.rotation.y
    nearest.mesh.visible = true
    currentCharacter.group.visible = false
    return true
  }

  function update(dt, yaw = 0) {
    if (!activeVehicle) return false

    move.set(0, 0, 0)
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
    const right = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw))
    if (keys.has('KeyW') || keys.has('ArrowUp')) move.add(forward)
    if (keys.has('KeyS') || keys.has('ArrowDown')) move.sub(forward)
    if (keys.has('KeyA') || keys.has('ArrowLeft')) move.sub(right)
    if (keys.has('KeyD') || keys.has('ArrowRight')) move.add(right)

    if (move.lengthSq() === 0) return false

    move.normalize()
    const speed = CONFIG.vehicles.speeds[activeVehicle.type] || CONFIG.vehicles.speeds.car
    const roadMultiplier = isRoadAt(activeVehicle.mesh.position, roadMeshes, roadCheck)
      ? 1.0
      : CONFIG.vehicles.offRoadMultiplier
    const dist = speed * roadMultiplier * dt
    activeVehicle.mesh.position.addScaledVector(move, dist)

    const targetRotation = Math.atan2(move.x, move.z)
    let diff = targetRotation - activeVehicle.mesh.rotation.y
    while (diff < -Math.PI) diff += Math.PI * 2
    while (diff > Math.PI) diff -= Math.PI * 2
    activeVehicle.mesh.rotation.y += diff * CONFIG.vehicles.steerLerp

    // Spin wheels with travel speed
    if (activeVehicle.mesh.userData.wheels) {
      const spinAngle = dist / CONFIG.vehicles.wheelRadius
      for (const wheel of activeVehicle.mesh.userData.wheels) {
        wheel.rotateY(spinAngle)
      }
    }

    currentCharacter.group.position.copy(activeVehicle.mesh.position)
    currentCharacter.group.rotation.y = activeVehicle.mesh.rotation.y
    return true
  }

  return {
    vehicles,
    update,
    toggleVehicle,
    setCharacter(nextCharacter) {
      currentCharacter = nextCharacter
    },
    isDriving: () => activeVehicle !== null,
    getActiveVehicle: () => activeVehicle,
    dispose() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      vehicles.forEach(vehicle => scene.remove(vehicle.mesh))
    }
  }
}