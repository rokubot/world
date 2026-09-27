import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { createOcean } from './ocean.js'

export const SCALE = 3

/**
 * Coordinate projection according to spec:
 * Longitude maps to X, Latitude maps to NEGATIVE Z.
 */
export function projectCoord(lng, lat, scale = SCALE) {
  return {
    x: lng * scale,
    z: -lat * scale // NEGATIVE Z — or map renders upside down
  }
}

/**
 * Step 2 test locations for coordinate validation
 */
export const testLocations = [
  { name: 'Dubai', lng: 55.2, lat: 25.2 },
  { name: 'Paris', lng: 2.3, lat: 48.8 },
  { name: 'Sydney', lng: 151.2, lat: -33.8 },
  { name: 'New York', lng: -74.0, lat: 40.7 },
  { name: 'Tokyo', lng: 139.7, lat: 35.7 },
]

/**
 * Converts GeoJSON ring coordinates to a THREE.Shape
 */
function createShapeFromRing(ring, scale = SCALE) {
  if (!ring || ring.length < 3) return null
  const shape = new THREE.Shape()
  let validCount = 0

  for (let i = 0; i < ring.length; i++) {
    const [lng, lat] = ring[i]
    if (isNaN(lng) || isNaN(lat)) continue
    const x = lng * scale
    const y = lat * scale // y in shape corresponds to -z in 3D world after rotateX(-PI/2)

    if (validCount === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
    validCount++
  }

  return validCount >= 3 ? shape : null
}

/**
 * Convert GeoJSON polygon (outer ring + holes) to THREE.Shape
 */
function createPolygonShape(polygonCoords, scale = SCALE) {
  if (!polygonCoords || polygonCoords.length === 0) return null
  const outerRing = polygonCoords[0]
  const shape = createShapeFromRing(outerRing, scale)
  if (!shape) return null

  // Process holes
  for (let h = 1; h < polygonCoords.length; h++) {
    const holeRing = polygonCoords[h]
    if (!holeRing || holeRing.length < 3) continue
    const holePath = new THREE.Path()
    let valid = 0

    for (let i = 0; i < holeRing.length; i++) {
      const [lng, lat] = holeRing[i]
      if (isNaN(lng) || isNaN(lat)) continue
      const x = lng * scale
      const y = lat * scale

      if (valid === 0) holePath.moveTo(x, y)
      else holePath.lineTo(x, y)
      valid++
    }

    if (valid >= 3) {
      shape.holes.push(holePath)
    }
  }

  return shape
}

/**
 * Builds 3D extruded continent geometry from GeoJSON.
 */
export async function createWorldTerrain(scene, geojsonUrl = '/assets/world.geojson') {
  const worldGroup = new THREE.Group()
  worldGroup.name = 'WorldTerrain'

  // Step 1: Add ocean plane
  createOcean(worldGroup)

  // Step 1: Fetch and parse GeoJSON
  const res = await fetch(geojsonUrl)
  if (!res.ok) {
    throw new Error(`Failed to load world GeoJSON from ${geojsonUrl}: ${res.statusText}`)
  }
  const geojson = await res.json()

  const extrudeSettings = {
    depth: 0.5,
    bevelEnabled: false
  }

  // Continent material: MeshLambertMaterial({ color: 0x4a6741 })
  const defaultLandMaterial = new THREE.MeshLambertMaterial({
    color: 0x4a6741,
    side: THREE.DoubleSide
  })

  const countryMeshes = []
  let processedFeatures = 0

  for (const feature of geojson.features) {
    const geom = feature.geometry
    if (!geom) continue

    const name = feature.properties?.name || feature.properties?.admin || 'Unknown'
    const polygons = geom.type === 'Polygon'
      ? [geom.coordinates]
      : (geom.type === 'MultiPolygon' ? geom.coordinates : [])

    const countryGeometries = []

    for (const poly of polygons) {
      const shape = createPolygonShape(poly, SCALE)
      if (!shape) continue

      try {
        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        // Step 1: Rotate so geometry lies flat (XZ plane)
        geo.rotateX(-Math.PI / 2)
        countryGeometries.push(geo)
      } catch (err) {
        console.warn(`Error extruding polygon in ${name}:`, err)
      }
    }

    if (countryGeometries.length > 0) {
      let finalGeometry
      if (countryGeometries.length === 1) {
        finalGeometry = countryGeometries[0]
      } else {
        finalGeometry = BufferGeometryUtils.mergeGeometries(countryGeometries, false)
        // Dispose individual geometries
        countryGeometries.forEach(g => g.dispose())
      }

      if (finalGeometry) {
        finalGeometry.computeVertexNormals()
        const mesh = new THREE.Mesh(finalGeometry, defaultLandMaterial)
        mesh.name = `Country_${name}`
        mesh.userData = {
          isCountry: true,
          name: name,
          properties: feature.properties
        }
        mesh.receiveShadow = true
        mesh.castShadow = true
        worldGroup.add(mesh)
        countryMeshes.push(mesh)
      }
    }
    processedFeatures++
  }

  scene.add(worldGroup)

  // Step 2: Place red test validation boxes at known coordinates
  const testBoxGroup = addTestValidationBoxes(scene)

  return {
    worldGroup,
    countryMeshes,
    testBoxGroup,
    totalCountries: countryMeshes.length
  }
}

/**
 * Creates a floating text label sprite for test markers
 */
function createTextLabel(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'rgba(15, 20, 30, 0.85)'
  ctx.strokeStyle = '#ff4444'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.roundRect(4, 4, 248, 56, 12)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 26px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 32)

  const texture = new THREE.CanvasTexture(canvas)
  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false })
  const sprite = new THREE.Sprite(spriteMaterial)
  sprite.scale.set(16, 4, 1)
  return sprite
}

/**
 * Step 2 — Place red BoxGeometry(2,2,2) boxes at known real-world coordinates to validate projection.
 */
export function addTestValidationBoxes(scene) {
  const group = new THREE.Group()
  group.name = 'TestValidationBoxes'

  const boxGeo = new THREE.BoxGeometry(2, 2, 2)
  const boxMat = new THREE.MeshLambertMaterial({
    color: 0xff1111,
    emissive: 0x330000
  })

  testLocations.forEach(loc => {
    const { x, z } = projectCoord(loc.lng, loc.lat, SCALE)
    const box = new THREE.Mesh(boxGeo, boxMat)

    // Base of land is Y=0, top of land is Y=0.5.
    // Box height is 2, so Y=1.5 places the box sitting on top of the continent!
    box.position.set(x, 1.5, z)
    box.castShadow = true
    box.receiveShadow = true
    box.name = `TestBox_${loc.name}`
    box.userData = { isTestBox: true, ...loc }

    // Floating text label
    const label = createTextLabel(loc.name)
    label.position.set(x, 4.5, z)

    group.add(box)
    group.add(label)
  })

  scene.add(group)
  return group
}
