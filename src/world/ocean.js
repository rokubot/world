import * as THREE from 'three'

/**
 * Creates the base ocean plane according to specification.
 * PlaneGeometry(1200, 600) at Y=0 with MeshLambertMaterial({ color: 0x0d2a4a })
 */
export function createOcean(scene) {
  const geometry = new THREE.PlaneGeometry(1400, 700)
  geometry.rotateX(-Math.PI / 2)

  const material = new THREE.MeshLambertMaterial({
    color: 0x0d2a4a,
    roughness: 0.8,
    depthWrite: true
  })

  const ocean = new THREE.Mesh(geometry, material)
  ocean.position.y = -0.05 // Positioned slightly below extruded land (depth 0.5) to avoid z-fighting
  ocean.receiveShadow = true
  ocean.name = 'Ocean'
  ocean.userData = { isOcean: true }

  scene.add(ocean)
  return ocean
}
