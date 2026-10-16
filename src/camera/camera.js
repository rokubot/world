import * as THREE from 'three'
import { CONFIG } from '../config.js'

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
          playerGroup.position.x + Math.sin(yaw) * CONFIG.camera.thirdPersonDistance,
          playerGroup.position.y + CONFIG.camera.thirdPersonHeight + Math.sin(pitch) * CONFIG.camera.thirdPersonDistance,
          playerGroup.position.z + Math.cos(yaw) * CONFIG.camera.thirdPersonDistance
        )
        lookAt.set(playerGroup.position.x, playerGroup.position.y + 1.5, playerGroup.position.z)
        camera.position.lerp(target, CONFIG.camera.lerp)
        camera.lookAt(lookAt)
        return
      }

      panX += movement.x
      panZ += movement.z
      if (cameraMode === 1) {
        camera.position.set(panX, CONFIG.camera.topDownHeight, panZ)
      } else {
        camera.position.set(panX + CONFIG.camera.isometricDistance, CONFIG.camera.isometricDistance, panZ + CONFIG.camera.isometricDistance)
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