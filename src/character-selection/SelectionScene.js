import * as THREE from 'three'
import { PALETTE } from '../palette.js'
import { createMage } from '../player/characters/mage.js'
import { createWarrior } from '../player/characters/warrior.js'

export function createSelectionScene(canvas) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(PALETTE.dark.shadow)

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 30)
  camera.position.set(0, 1.45, 5.6)
  camera.lookAt(0, 1.25, 0)

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  const keyLight = new THREE.DirectionalLight(PALETTE.atmosphere.sunLight, 2)
  keyLight.position.set(-3, 5, 5)
  scene.add(keyLight)
  scene.add(new THREE.HemisphereLight(PALETTE.atmosphere.hemiSky, PALETTE.atmosphere.hemiGround, 1.1))

  let characterGroup = null

  const resize = () => {
    const width = Math.max(canvas.clientWidth, 1)
    const height = Math.max(canvas.clientHeight, 1)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()
  renderer.setAnimationLoop(() => renderer.render(scene, camera))

  function setArchetype(id) {
    if (characterGroup) {
      scene.remove(characterGroup)
      characterGroup.traverse(child => child.geometry?.dispose())
    }

    const character = id === 'warrior'
      ? createWarrior('Preview')
      : createMage('Preview')
    characterGroup = character.group
    characterGroup.position.set(0, 0, 0)
    characterGroup.rotation.set(0, 0, 0)
    scene.add(characterGroup)
    renderer.render(scene, camera)
    return characterGroup
  }

  function destroy() {
    resizeObserver.disconnect()
    renderer.setAnimationLoop(null)
    if (characterGroup) {
      scene.remove(characterGroup)
      characterGroup.traverse(child => child.geometry?.dispose())
    }
    renderer.dispose()
  }

  return { setArchetype, destroy }
}