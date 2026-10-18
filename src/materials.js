import * as THREE from 'three'
import { PALETTE } from './palette.js'

/**
 * 3-step Gradient Map DataTexture for cel-shaded / toon look:
 * Step 1: Deep shadow
 * Step 2: Mid-tone
 * Step 3: Bright highlight
 */
function createThreeStepGradientMap() {
  const data = new Uint8Array([80, 175, 255])
  const texture = new THREE.DataTexture(data, 3, 1, THREE.RedFormat)
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

export const sharedGradientMap = createThreeStepGradientMap()

// Shared cache for toon materials (reuses instances to minimize WebGL state changes)
const toonMaterialCache = new Map()

export function getToonMaterial(color, options = {}) {
  const opacity = options.opacity ?? 1
  const transparent = options.transparent ?? (opacity < 1)
  const wireframe = options.wireframe ?? false
  const emissive = options.emissive ?? 0
  const key = `${color}_${emissive}_${opacity}_${transparent}_${wireframe}`

  if (!toonMaterialCache.has(key)) {
    const mat = new THREE.MeshToonMaterial({
      color,
      gradientMap: sharedGradientMap,
      transparent,
      opacity,
      wireframe,
      emissive,
      ...options
    })
    toonMaterialCache.set(key, mat)
  }
  return toonMaterialCache.get(key)
}

// Outline Material Cache
const outlineMaterialCache = new Map()

export function getOutlineMaterial(color = PALETTE.outline) {
  if (!outlineMaterialCache.has(color)) {
    const mat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.BackSide,
      depthWrite: true
    })
    outlineMaterialCache.set(color, mat)
  }
  return outlineMaterialCache.get(color)
}

/**
 * Clones geometry and offsets vertices outward along vertex normals
 * to create an inverted hull outline geometry.
 */
export function createInvertedHullGeometry(geometry, thickness = 0.03) {
  const cloned = geometry.clone()
  if (!cloned.attributes.normal) {
    cloned.computeVertexNormals()
  }
  const pos = cloned.attributes.position
  const norm = cloned.attributes.normal

  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      pos.getX(i) + norm.getX(i) * thickness,
      pos.getY(i) + norm.getY(i) * thickness,
      pos.getZ(i) + norm.getZ(i) * thickness
    )
  }
  pos.needsUpdate = true
  return cloned
}

/**
 * Adds an inverted hull outline to a single mesh
 */
export function addOutline(mesh, thickness = 0.03, color = PALETTE.outline) {
  if (!mesh.isMesh || !mesh.geometry || mesh.userData.isOutline) return null

  const outlineGeo = createInvertedHullGeometry(mesh.geometry, thickness)
  const outlineMat = getOutlineMaterial(color)
  const outlineMesh = new THREE.Mesh(outlineGeo, outlineMat)
  outlineMesh.name = `${mesh.name || 'Mesh'}_Outline`
  outlineMesh.userData.isOutline = true
  outlineMesh.castShadow = false
  outlineMesh.receiveShadow = false
  mesh.add(outlineMesh)
  return outlineMesh
}

/**
 * Recursively applies inverted hull outlines to all non-outline meshes in a group
 */
export function applyOutlinesToGroup(group, thickness = 0.028, color = PALETTE.outline) {
  const meshesToOutline = []
  group.traverse(child => {
    if (child.isMesh && !child.userData.isOutline && !child.userData.skipOutline && !child.isSprite) {
      meshesToOutline.push(child)
    }
  })

  meshesToOutline.forEach(mesh => {
    addOutline(mesh, thickness, color)
  })
}
