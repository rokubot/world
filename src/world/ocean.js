import * as THREE from 'three'
import { PALETTE } from '../palette.js'
import { getToonMaterial } from '../materials.js'

/**
 * Creates the base ocean plane according to Step 7 anime style:
 * Flat vibrant anime blue, no reflections, toon material.
 */
export function createOcean(scene) {
  const geometry = new THREE.PlaneGeometry(1600, 900)
  geometry.rotateX(-Math.PI / 2)

  const material = getToonMaterial(PALETTE.biome.waterDeep)

  const ocean = new THREE.Mesh(geometry, material)
  ocean.position.y = -0.05
  ocean.receiveShadow = false
  ocean.castShadow = false
  ocean.name = 'Ocean'
  ocean.userData = { isOcean: true, skipOutline: true }

  scene.add(ocean)
  return ocean
}
