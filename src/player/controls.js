import * as THREE from 'three'

const SPEED = 8
const SPRINT = 16
const keys = new Set()
const forward = new THREE.Vector3()
const right = new THREE.Vector3()
const move = new THREE.Vector3()

export function createControls(renderer, callbacks = {}) {
  let yaw = 0
  let pitch = 0.3
  let cameraMode = 0
  let lastMove = new THREE.Vector3()
  let isDragging = false

  const onKeyDown = event => {
    keys.add(event.code)

    if (event.repeat) return
    if (event.code === 'KeyC') {
      cameraMode = (cameraMode + 1) % 3
      callbacks.onCameraModeChange?.(cameraMode)
    }
    if (event.code === 'KeyE') callbacks.onInteract?.()
    if (event.code === 'KeyM') callbacks.onMap?.()
    if (event.code === 'KeyF') callbacks.onVehicle?.()
    if (event.code === 'Escape') callbacks.onClose?.()
    if (event.code === 'Enter') callbacks.onChatFocus?.()
  }

  const onKeyUp = event => {
    keys.delete(event.code)
  }

  const onMouseDown = event => {
    if (event.target === renderer.domElement) {
      isDragging = true
    }
  }

  const onMouseUp = () => {
    isDragging = false
  }

  const onMouseMove = event => {
    if (!isDragging) return
    yaw -= event.movementX * 0.005
    pitch -= event.movementY * 0.005
    pitch = Math.max(-0.6, Math.min(0.6, pitch))
  }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  renderer.domElement.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mousemove', onMouseMove)

  return {
    updateMovement(dt, playerGroup) {
      const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? SPRINT : SPEED
      move.set(0, 0, 0)

      if (cameraMode === 0) {
        forward.set(-Math.sin(yaw), 0, -Math.cos(yaw))
        right.set(Math.cos(yaw), 0, -Math.sin(yaw))
      } else {
        forward.set(0, 0, -1)
        right.set(1, 0, 0)
        
        if (cameraMode === 2) {
          const isoOffset = Math.PI / 4
          forward.set(-Math.sin(isoOffset), 0, -Math.cos(isoOffset))
          right.set(Math.cos(isoOffset), 0, -Math.sin(isoOffset))
        }
      }

      // WASD + Arrow Key Support
      if (keys.has('KeyW') || keys.has('ArrowUp')) move.add(forward)
      if (keys.has('KeyS') || keys.has('ArrowDown')) move.sub(forward)
      if (keys.has('KeyA') || keys.has('ArrowLeft')) move.sub(right)
      if (keys.has('KeyD') || keys.has('ArrowRight')) move.add(right)

      if (move.lengthSq() === 0) {
        lastMove.set(0, 0, 0)
        return false
      }

      move.normalize().multiplyScalar(speed * dt)
      lastMove.copy(move)

      if (cameraMode === 0) {
        playerGroup.position.x += move.x
        playerGroup.position.z += move.z
        
        // Aligns character orientation mapping +Z to forward movement
        const targetRotation = Math.atan2(move.x, move.z)
        
        let diff = targetRotation - playerGroup.rotation.y
        while (diff < -Math.PI) diff += Math.PI * 2
        while (diff > Math.PI) diff -= Math.PI * 2
        playerGroup.rotation.y += diff * 0.15
      }

      return true
    },
    getYaw: () => yaw,
    getPitch: () => pitch,
    getCameraMode: () => cameraMode,
    getMove: () => lastMove,
    getAnimationState: () => {
      if (cameraMode !== 0 || lastMove.lengthSq() === 0) return 'idle'
      return keys.has('ShiftLeft') || keys.has('ShiftRight') ? 'sprint' : 'walk'
    },
    setCameraMode: (mode) => {
      cameraMode = mode
      callbacks.onCameraModeChange?.(cameraMode)
    },
    dispose() {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }
}