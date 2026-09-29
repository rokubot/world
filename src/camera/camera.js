import * as THREE from 'three'

const CAMERA_LERP = 0.12
const THIRD_PERSON_DISTANCE = 10
const THIRD_PERSON_HEIGHT = 5
const TOP_DOWN_HEIGHT = 80
const ISOMETRIC_DISTANCE = 60

export function createCameraController(camera) {
  const target = new THREE.Vector3()
  const lookAt = new THREE.Vector3()
  let panX = 0
  let panZ = 0
  let flyTarget = null

  return {
    update(playerGroup, yaw, pitch, cameraMode, movement) {
      if (flyTarget) {
        camera.position.lerp(flyTarget.position, 0.06)
        camera.lookAt(flyTarget.lookAt)
        if (camera.position.distanceTo(flyTarget.position) < 0.2) flyTarget = null
        return
      }

      if (cameraMode === 0) {
        target.set(
          playerGroup.position.x + Math.sin(yaw) * THIRD_PERSON_DISTANCE,
          playerGroup.position.y + THIRD_PERSON_HEIGHT + Math.sin(pitch) * THIRD_PERSON_DISTANCE,
          playerGroup.position.z + Math.cos(yaw) * THIRD_PERSON_DISTANCE
        )
        lookAt.set(playerGroup.position.x, playerGroup.position.y + 1.5, playerGroup.position.z)
        camera.position.lerp(target, CAMERA_LERP)
        camera.lookAt(lookAt)
        return
      }

      panX += movement.x
      panZ += movement.z
      if (cameraMode === 1) {
        camera.position.set(panX, TOP_DOWN_HEIGHT, panZ)
      } else {
        camera.position.set(panX + ISOMETRIC_DISTANCE, ISOMETRIC_DISTANCE, panZ + ISOMETRIC_DISTANCE)
      }
      camera.lookAt(panX, 0, panZ)
    },
    flyTo(x, y, z, lookX, lookY, lookZ) {
      flyTarget = {
        position: new THREE.Vector3(x, y, z),
        lookAt: new THREE.Vector3(lookX, lookY, lookZ)
      }
    },
    syncToPlayer(playerGroup) {
      panX = playerGroup.position.x
      panZ = playerGroup.position.z
    }
  }
}