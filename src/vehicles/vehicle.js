import * as THREE from 'three'

export const VEHICLE_SPEEDS = Object.freeze({
  car: 60,
  motorcycle: 40,
  bicycle: 20
})

export function createCar(color = 0x2244aa) {
  const group = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.8, 4),
    new THREE.MeshLambertMaterial({ color })
  )
  body.position.y = 0.5

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.7, 2.5),
    new THREE.MeshLambertMaterial({ color })
  )
  roof.position.y = 1.25
  group.add(body, roof)

  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3)
  const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x151515 })
  for (const x of [-0.95, 0.95]) {
    for (const z of [-1.35, 1.35]) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
      wheel.rotation.z = Math.PI / 2
      wheel.position.set(x, 0.4, z)
      group.add(wheel)
    }
  }

  group.name = 'VehicleCar'
  group.traverse(object => {
    object.castShadow = true
    object.receiveShadow = true
  })
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
  enterDistance = 5
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
    if (activeVehicle) {
      const vehicle = activeVehicle
      vehicle.occupied = false
      vehicle.mesh.visible = true
      currentCharacter.group.visible = true
      currentCharacter.group.position.set(
        vehicle.mesh.position.x + 2.5,
        currentCharacter.group.position.y,
        vehicle.mesh.position.z
      )
      activeVehicle = null
      return false
    }

    const nearest = vehicles
      .filter(vehicle => !vehicle.occupied)
      .sort((a, b) => a.mesh.position.distanceTo(currentCharacter.group.position) - b.mesh.position.distanceTo(currentCharacter.group.position))[0]
    if (!nearest || nearest.mesh.position.distanceTo(currentCharacter.group.position) > enterDistance) return false

    activeVehicle = nearest
    nearest.occupied = true
    nearest.mesh.position.copy(currentCharacter.group.position)
    nearest.mesh.rotation.y = currentCharacter.group.rotation.y
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
    const speed = VEHICLE_SPEEDS[activeVehicle.type] || VEHICLE_SPEEDS.car
    const roadMultiplier = isRoadAt(activeVehicle.mesh.position, roadMeshes, roadCheck) ? 1 : 0.4
    activeVehicle.mesh.position.addScaledVector(move, speed * roadMultiplier * dt)

    const targetRotation = Math.atan2(move.x, move.z)
    let diff = targetRotation - activeVehicle.mesh.rotation.y
    while (diff < -Math.PI) diff += Math.PI * 2
    while (diff > Math.PI) diff -= Math.PI * 2
    activeVehicle.mesh.rotation.y += diff * 0.08

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
    dispose() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      vehicles.forEach(vehicle => scene.remove(vehicle.mesh))
    }
  }
}