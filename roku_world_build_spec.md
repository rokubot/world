# Roku World — Complete Build Specification
> Hand this document to an AI coding assistant and say: **"Build this step by step, one section at a time."**

---

## What You Are Building

A low-poly 3D multiplayer browser game where:
- The game world is a stylised real Earth (Natural Earth GeoJSON data)
- Players control a blocky Roblox-style avatar (no face, profession outfit)
- Discord servers that added the Roku bot appear as Guild Halls on the map
- Famous real-world landmarks (Burj Khalifa, Eiffel Tower etc) are 3D props
- Players can walk, sprint, drive, and teleport between locations
- Real-time multiplayer via Socket.io (see other players moving)
- Text chat (proximity + global) via Socket.io
- Voice chat = "Join Discord Voice" button only (no WebRTC needed)
- All economy data (coins, inventory, GDP) comes from existing MongoDB
- Existing Python aiohttp backend — just add 4 new routes

**Style reference:** kerala.dhilber.com — low-poly, browser-based, real geography, multiplayer, driveable roads, walkable world, other players visible.

---

## Tech Stack

```
Frontend:     Three.js r160 (WebGL 3D rendering)
Map Data:     Natural Earth 1:50m GeoJSON (free, public domain)
Roads:        OpenStreetMap major highways only (simplified)
Multiplayer:  socketio.AsyncServer (async_mode='aiohttp') integrated into existing Python aiohttp app
Build tool:   Vite 5.x
Backend:      Existing Python aiohttp (add socketio + routes/world.py)
Database:     Existing MongoDB (add world_position field)
Auth:         Existing Discord OAuth (reuse)
Hosting:      Vercel (frontend) + existing Python aiohttp host (socket.io + API)
```

### Dependencies (package.json)
```json
{
  "dependencies": {
    "three": "^0.160.0",
    "d3-geo": "^3.1.0",
    "socket.io-client": "^4.7.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

---

## File Structure

```
roku-world/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.js                  # entry point — scene init, game loop
│   ├── world/
│   │   ├── terrain.js           # GeoJSON → Three.js continent geometry
│   │   ├── ocean.js             # ocean plane
│   │   ├── roads.js             # OSM road paths as flat geometry
│   │   └── landmarks.js         # all 11 Tier 1 landmark 3D models
│   ├── player/
│   │   ├── character.js         # blocky character builder (BoxGeometry parts)
│   │   ├── animation.js         # walk / idle / sprint cycles
│   │   └── controls.js          # WASD + mouse pointer lock input
│   ├── camera/
│   │   └── camera.js            # third-person / top-down / isometric (C key)
│   ├── vehicles/
│   │   └── vehicle.js           # enter/exit car, follow road path
│   ├── multiplayer/
│   │   ├── socket.js            # socket.io-client connection
│   │   └── otherPlayers.js      # render remote players from socket data
│   ├── systems/
│   │   ├── teleport.js          # cost calc, cooldown, anti-exploit
│   │   ├── chat.js              # proximity + global text chat
│   │   └── performance.js       # LOD, adaptive render, quality settings
│   ├── ui/
│   │   ├── hud.js               # top bar, zone banner, minimap
│   │   ├── map.js               # M key world map overlay
│   │   ├── guildPanel.js        # E key guild hall info panel
│   │   └── teleportUI.js        # teleport confirmation modal
│   └── api.js                   # fetch calls to Python aiohttp backend
├── assets/
│   ├── world.geojson            # Natural Earth 1:50m countries
│   └── textures/
│       ├── ocean.jpg
│       └── land.jpg
└── (no separate server/ folder — socket.io runs inside ../roku-backend/main.py)
```

---

## Build Order — Follow This Exactly

Do not skip steps. Each step must work before moving to the next.

---

### STEP 1 — World Geometry

**File:** `src/world/terrain.js`

**Task:** Convert Natural Earth GeoJSON into 3D continent geometry.

**Requirements:**
1. Load `assets/world.geojson` (Natural Earth 1:50m countries)
2. For each country feature, convert the polygon coordinates to a `THREE.Shape`
3. Use `THREE.ExtrudeGeometry` with `depth: 0.5`, `bevelEnabled: false`
4. Coordinate projection — this is critical:
   ```javascript
   function projectCoord(lng, lat, scale = 3) {
     return {
       x: lng * scale,
       z: -lat * scale   // NEGATIVE Z — or map renders upside down
     }
   }
   ```
5. After creating ExtrudeGeometry, rotate it: `geometry.rotateX(-Math.PI / 2)` so it lies flat
6. Continent material: `MeshLambertMaterial({ color: 0x4a6741 })`
7. Add a `PlaneGeometry(1200, 600)` ocean at Y=0, `MeshLambertMaterial({ color: 0x0d2a4a })`
8. Add ambient light and directional light so geometry is visible

**Done when:** Browser shows recognisable continent shapes with ocean underneath.

**Data source:** https://github.com/nvkelso/natural-earth-vector — file: `ne_50m_admin_0_countries.geojson`

---

### STEP 2 — Coordinate Validation

**File:** `src/world/terrain.js` (add to existing)

**Task:** Place test boxes at known real-world coordinates to validate projection.

**Requirements:**
Place a red `BoxGeometry(2,2,2)` box at each of these coordinates:
```javascript
const testLocations = [
  { name: "Dubai",   lng: 55.2,   lat: 25.2  },
  { name: "Paris",   lng: 2.3,    lat: 48.8  },
  { name: "Sydney",  lng: 151.2,  lat: -33.8 },
  { name: "New York",lng: -74.0,  lat: 40.7  },
  { name: "Tokyo",   lng: 139.7,  lat: 35.7  },
]
```
Each box should visually sit on top of the correct country.

**Done when:** All 5 boxes are sitting on the correct countries on the map.

---

### STEP 3 — Player Character

**File:** `src/player/character.js`

**Task:** Build a blocky humanoid character from primitive geometry. No face. No textures — solid colours only.

**Character parts (all BoxGeometry unless noted):**

| Part | Geometry | Y position in group | Colour |
|---|---|---|---|
| Head | Box(0.8, 0.8, 0.8) | 1.8 | `0xffcc99` |
| Hair | Box(0.85, 0.25, 0.85) | 2.25 | `0x3a2010` (varies by profession) |
| Torso | Box(0.7, 1.0, 0.4) | 1.0 | Profession colour |
| Left Arm | Cylinder(0.18, 0.18, 0.9) | attached via group at shoulder | `0xffcc99` |
| Right Arm | Cylinder(0.18, 0.18, 0.9) | mirror | `0xffcc99` |
| Left Leg | Box(0.28, 0.9, 0.35) | 0.2 | Profession trouser colour |
| Right Leg | Box(0.28, 0.9, 0.35) | 0.2 | mirror |
| Shoes | Box(0.32, 0.2, 0.42) | -0.25 | `0x1a1a1a` |

**Critical — arm pivot setup:**
```javascript
// Arms must rotate around shoulder, not arm center
const leftArmGroup = new THREE.Group()
leftArmGroup.position.set(-0.5, 1.4, 0)  // shoulder position
const leftArmMesh = new THREE.Mesh(armGeo, armMat)
leftArmMesh.position.set(0, -0.45, 0)    // arm hangs DOWN from pivot
leftArmGroup.add(leftArmMesh)
characterGroup.add(leftArmGroup)
// Same pattern for right arm and both legs
```

**Profession colours:**

| Profession | Torso | Trouser | Hair colour |
|---|---|---|---|
| Wayfarer | `0x8B6914` (brown) | `0x4a5a2a` (olive) | `0x3a2010` |
| Artificer | `0x444444` (grey) with orange apron strip | `0x222222` | `0x1a1a1a` |
| Mystic | `0x4a1a6b` (purple, taller box 1.3h) | `0x2a0a4a` | `0x6b3a8a` |
| Tycoon | `0x1a2a5a` (navy) | `0x0a1a3a` | `0x1a1a1a` |

**Name tag (billboard above head) / username / displayname:**
```javascript
// Canvas texture showing player name
const canvas = document.createElement('canvas')
canvas.width = 256; canvas.height = 64
const ctx = canvas.getContext('2d')
ctx.fillStyle = 'rgba(10,10,20,0.8)'
ctx.fillRect(0, 0, 256, 64)
ctx.fillStyle = '#c9a84c'
ctx.font = 'bold 24px Arial'
ctx.textAlign = 'center'
ctx.fillText(playerName, 128, 40)
const tex = new THREE.CanvasTexture(canvas)
const nameTag = new THREE.Mesh(
  new THREE.PlaneGeometry(2.0, 0.5),
  new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
)
nameTag.position.y = 2.8
characterGroup.add(nameTag)
// In render loop: nameTag.quaternion.copy(camera.quaternion) — billboard effect
```

**Export:**
```javascript
export function createCharacter(profession, playerName) { ... }
// Returns: { group: THREE.Group, leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup, nameTag }
```

**Done when:** Blocky figure visible on the map, correct colours per profession, name above head.

---

### STEP 4 — Animation

**File:** `src/player/animation.js`

**Task:** Animate character limbs for walk, idle, sprint states.

```javascript
export function animateCharacter(parts, state, t) {
  const { leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup, torso } = parts

  if (state === 'idle') {
    // Subtle breathing — torso bobs slightly
    torso.position.y = 1.0 + Math.sin(t * 1.5) * 0.02
    // Arms hang naturally
    leftArmGroup.rotation.x = 0
    rightArmGroup.rotation.x = 0
  }

  if (state === 'walk') {
    const swing = Math.sin(t * 6) * 0.5
    leftArmGroup.rotation.x = swing
    rightArmGroup.rotation.x = -swing
    leftLegGroup.rotation.x = -swing * 0.7
    rightLegGroup.rotation.x = swing * 0.7
    // Slight vertical bob
    parts.group.position.y = Math.abs(Math.sin(t * 6)) * 0.04
  }

  if (state === 'sprint') {
    const swing = Math.sin(t * 10) * 0.7
    leftArmGroup.rotation.x = swing
    rightArmGroup.rotation.x = -swing
    leftLegGroup.rotation.x = -swing * 0.8
    rightLegGroup.rotation.x = swing * 0.8
    // Forward lean
    parts.group.rotation.x = 0.15
  } else {
    parts.group.rotation.x = 0
  }
}
```

**Done when:** Character visibly walks when WASD pressed, idles when still.

---

### STEP 5 — Controls & Camera

**File:** `src/player/controls.js` and `src/camera/camera.js`

**Controls requirements:**
```javascript
const keys = {}
document.addEventListener('keydown', e => { keys[e.code] = true })
document.addEventListener('keyup',   e => { keys[e.code] = false })

// Movement — relative to camera facing direction
const SPEED = 8
const SPRINT = 16

function updateMovement(dt, playerGroup, yaw) {
  const speed = (keys['ShiftLeft'] || keys['ShiftRight']) ? SPRINT : SPEED
  const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw))
  const right   = new THREE.Vector3( Math.cos(yaw), 0, -Math.sin(yaw))
  const move    = new THREE.Vector3()

  if (keys['KeyW']) move.add(forward)
  if (keys['KeyS']) move.sub(forward)
  if (keys['KeyA']) move.sub(right)
  if (keys['KeyD']) move.add(right)

  if (move.length() > 0) {
    move.normalize().multiplyScalar(speed * dt)
    playerGroup.position.x += move.x
    playerGroup.position.z += move.z
    playerGroup.rotation.y = yaw
  }

  return move.length() > 0  // returns true if moving
}

// Mouse look — pointer lock
let yaw = 0, pitch = 0.3
renderer.domElement.addEventListener('click', () => renderer.domElement.requestPointerLock())
document.addEventListener('mousemove', e => {
  if (document.pointerLockElement !== renderer.domElement) return
  yaw   -= e.movementX * 0.002
  pitch -= e.movementY * 0.002
  pitch  = Math.max(-0.6, Math.min(0.6, pitch))
})
```

**Camera modes (C key cycles):**
```javascript
let cameraMode = 0  // 0=third-person, 1=top-down, 2=isometric
document.addEventListener('keydown', e => {
  if (e.code === 'KeyC') cameraMode = (cameraMode + 1) % 3
})

function updateCamera(camera, playerGroup, yaw, pitch, dt) {
  if (cameraMode === 0) {
    // Third-person: follow behind + above player
    const dist = 10, height = 5
    const target = new THREE.Vector3(
      playerGroup.position.x + Math.sin(yaw) * dist,
      playerGroup.position.y + height + Math.sin(pitch) * dist,
      playerGroup.position.z + Math.cos(yaw) * dist
    )
    camera.position.lerp(target, 0.12)
    camera.lookAt(playerGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0)))

  } else if (cameraMode === 1) {
    // Top-down: orthographic, directly above
    // WASD pans camera instead of moving player in this mode
    camera.position.set(panX, 80, panZ)
    camera.lookAt(panX, 0, panZ)

  } else if (cameraMode === 2) {
    // Isometric: 45 degree fixed angle
    camera.position.set(panX + 60, 60, panZ + 60)
    camera.lookAt(panX, 0, panZ)
  }
}
```

**Keys for all modes:**
- `E` → interact (call `tryInteract()`)
- `M` → toggle world map overlay
- `F` → enter/exit vehicle
- `Escape` → close any open panel
- `Enter` → focus chat input

**Done when:** WASD moves character, mouse rotates view, C cycles through 3 camera modes.

---

### STEP 6 — Vehicle System

**File:** `src/vehicles/vehicle.js`

**Requirements:**
- Press `F` near a vehicle spawn point to enter/exit
- While in vehicle: WASD/arrow keys drives the car, character sits inside (set character visible=false, show car mesh)
- Vehicle speeds: Car = 60 units/sec, Motorcycle = 40 units/sec Bicycle = 20 units/sec
- No physics simulation — simple position update along movement direction
- Off-road penalty: if not on a road, speed *= 0.4
- Vehicle mesh: Simple box car — body `BoxGeometry(2, 0.8, 4)`, roof `BoxGeometry(1.5, 0.7, 2.5)`, 4 wheel cylinders `CylinderGeometry(0.4, 0.4, 0.3)` rotated 90 degrees

```javascript
export function createCar(color = 0x2244aa) {
  const group = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(2, 0.8, 4), new THREE.MeshLambertMaterial({ color }))
  body.position.y = 0.5
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 2.5), new THREE.MeshLambertMaterial({ color }))
  roof.position.y = 1.25
  group.add(body, roof)
  // Add 4 wheels at corners
  return group
}
```

**Done when:** Can press F to enter car, drive faster than walking, press F to exit.

---

### STEP 7 — Socket.io Server (Python aiohttp + socketio)
DONT DO THESE STEPS AS FOR NOW CZ I WILL ADD IT LATER
> **IMPORTANT:** Use Python `socketio.AsyncServer` with `async_mode='aiohttp'` attached to your existing aiohttp app. Do NOT create a separate Node.js server.

**File:** Add to existing `main.py` in `../roku-backend`

**Complete integration code:**
```python
# In your existing main.py

import socketio
import time

sio = socketio.AsyncServer(
    async_mode='aiohttp',
    cors_allowed_origins='*'
)

# Attach to your existing aiohttp app
sio.attach(app)

# ─── Player state ────────────────────────────────
players = {}  # { sid: { name, profession, position, last_update } }

def get_nearby(sid, position, radius=300):
    result = []
    for pid, p in players.items():
        if pid == sid: continue
        dx = p['position']['x'] - position['x']
        dz = p['position']['z'] - position['z']
        if (dx*dx + dz*dz) ** 0.5 < radius:
            result.append((pid, p))
    return result

# ─── Events ──────────────────────────────────────
@sio.event
async def connect(sid, environ):
    print(f'Player connected: {sid}')

@sio.event
async def disconnect(sid):
    players.pop(sid, None)
    await sio.emit('player:leave', { 'id': sid })

@sio.event
async def player_join(sid, data):
    players[sid] = {
        'id':        sid,
        'name':      data.get('name', 'Unknown'),
        'profession':data.get('profession', 'wayfarer'),
        'position':  { 'x': 0, 'z': 0 },
        'rotation':  0,
        'animation': 'idle',
        'last_update': time.time()
    }
    # Tell this player about everyone else
    await sio.emit('world:players', list(players.values()), to=sid)
    # Tell everyone else about this player
    await sio.emit('player:join', players[sid], skip_sid=sid)

@sio.event
async def player_move(sid, data):
    if sid not in players: return
    players[sid]['position']    = { 'x': data['x'], 'z': data['z'] }
    players[sid]['rotation']    = data.get('rotation', 0)
    players[sid]['animation']   = data.get('animation', 'idle')
    players[sid]['last_update'] = time.time()

    nearby = get_nearby(sid, players[sid]['position'])
    for pid, _ in nearby:
        await sio.emit('world:players', [players[sid]], to=pid)

@sio.event
async def chat_message(sid, data):
    if sid not in players: return
    msg = {
        'senderId': sid,
        'name':     players[sid]['name'],
        'text':     data['text'],
        'type':     'proximity'
    }
    nearby = get_nearby(sid, players[sid]['position'], radius=80)
    for pid, _ in nearby:
        await sio.emit('chat:message', msg, to=pid)
    await sio.emit('chat:message', msg, to=sid)
    await sio.emit('chat:global', msg)

# ─── Idle timeout ────────────────────────────────
# Disconnect idle players after 5 minutes of no position updates
IDLE_TIMEOUT = 5 * 60

async def check_idle_players():
    while True:
        await asyncio.sleep(60)
        now = time.time()
        for pid, p in list(players.items()):
            if now - p['last_update'] > IDLE_TIMEOUT:
                await sio.emit('kicked', { 'reason': 'idle' }, to=pid)
                await sio.disconnect(pid)
                players.pop(pid, None)

# Start idle checker when app starts
@app.on_startup
async def start_idle_checker():
    asyncio.create_task(check_idle_players())
```

**Done when:** Two browser tabs open → can see each other's position update in real time.

---

### STEP 8 — Other Players Rendering

**File:** `src/multiplayer/otherPlayers.js`

**Requirements:**
```javascript
const remotePlayers = {}  // { [id]: { group, parts, targetPos, currentPos } }

export function onPlayerJoin(data, scene) {
  const { group, ...parts } = createCharacter(data.profession, data.name)
  group.position.set(data.position.x, 0, data.position.z)
  scene.add(group)
  remotePlayers[data.id] = { group, parts, targetPos: {...data.position}, currentPos: {...data.position} }
}

export function onPlayersUpdate(playerArray) {
  playerArray.forEach(data => {
    if (remotePlayers[data.id]) {
      // Don't snap — store as target, lerp in update loop
      remotePlayers[data.id].targetPos = { x: data.position.x, z: data.position.z }
      remotePlayers[data.id].animation = data.animation
    }
  })
}

export function onPlayerLeave(id, scene) {
  if (remotePlayers[id]) {
    scene.remove(remotePlayers[id].group)
    delete remotePlayers[id]
  }
}

export function updateRemotePlayers(dt, t) {
  Object.values(remotePlayers).forEach(p => {
    // Lerp position for smooth movement
    p.currentPos.x += (p.targetPos.x - p.currentPos.x) * 0.2
    p.currentPos.z += (p.targetPos.z - p.currentPos.z) * 0.2
    p.group.position.set(p.currentPos.x, 0, p.currentPos.z)
    // Animate
    animateCharacter(p.parts, p.animation || 'idle', t)
  })
}
```

**Rate-limited position sending:**
```javascript
let lastSend = 0
function sendPosition(socket, x, z, rotation, animation) {
  const now = Date.now()
  if (now - lastSend < 100) return  // max 10 per second
  lastSend = now
  socket.emit('player:move', { x, z, rotation, animation })
}
```

---

### STEP 9 — Landmark Models

**File:** `src/world/landmarks.js`

Place all 11 Tier 1 landmarks at exact coordinates using `projectCoord(lng, lat)`.

```javascript
const LANDMARKS = [
  { name: "Burj Khalifa",       lng: 55.274,  lat: 25.197,  tier: 1 },
  { name: "Eiffel Tower",       lng: 2.294,   lat: 48.858,  tier: 1 },
  { name: "Taj Mahal",          lng: 78.042,  lat: 27.175,  tier: 1 },
  { name: "Statue of Liberty",  lng: -74.044, lat: 40.689,  tier: 1 },
  { name: "Big Ben",            lng: -0.124,  lat: 51.500,  tier: 1 },
  { name: "Colosseum",          lng: 12.492,  lat: 41.890,  tier: 1 },
  { name: "Pyramids of Giza",   lng: 31.134,  lat: 29.979,  tier: 1 },
  { name: "Great Wall",         lng: 116.570, lat: 40.431,  tier: 1 },
  { name: "Sydney Opera House", lng: 151.215, lat: -33.857, tier: 1 },
  { name: "Mount Fuji",         lng: 138.727, lat: 35.361,  tier: 1 },
  { name: "Christ the Redeemer",lng: -43.210, lat: -22.951, tier: 1 },
]
```

**Model descriptions — simple geometry only:**

```javascript
function buildBurjKhalifa() {
  // Tapered tower: wide base, narrow top
  const group = new THREE.Group()
  const base =  new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 8, 3),  mat)
  const mid  =  new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.2, 6, 3),  mat)
  const top  =  new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.6, 4, 3),  mat)
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.08, 3, 6), mat)
  mid.position.y = 7; top.position.y = 13; spire.position.y = 17.5
  group.add(base, mid, top, spire)
  return group
}

function buildEiffelTower() {
  // Four angled legs meeting at a point
  const group = new THREE.Group()
  // Four leg struts (thin cylinders angled inward)
  const legGeo = new THREE.CylinderGeometry(0.1, 0.3, 8, 4)
  const positions = [[-1.5,0,-1.5],[1.5,0,-1.5],[-1.5,0,1.5],[1.5,0,1.5]]
  positions.forEach(([x,y,z]) => {
    const leg = new THREE.Mesh(legGeo, mat)
    leg.position.set(x, 4, z)
    leg.lookAt(new THREE.Vector3(0, 10, 0))
    group.add(leg)
  })
  // Top section
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.3, 4, 4), mat)
  top.position.y = 10
  group.add(top)
  return group
}

function buildPyramids() {
  const group = new THREE.Group()
  // Three pyramid cones, slightly different sizes
  [[0,0,0,3,5], [-5,0,-2,2,4], [4,0,3,1.8,3.5]].forEach(([x,z,r,w,h]) => {
    const pyramid = new THREE.Mesh(new THREE.ConeGeometry(w, h, 4), sandMat)
    pyramid.position.set(x, h/2, z)
    pyramid.rotation.y = Math.PI/4
    group.add(pyramid)
  })
  return group
}

// Build remaining landmarks with same approach:
// Taj Mahal: white box body + dome SphereGeometry + 4 corner cylinder minarets
// Statue of Liberty: CylinderGeometry pedestal + simple humanoid shape on top
// Big Ben: tall thin BoxGeometry + small PointLight on top
// Colosseum: TorusGeometry (ring shape) with open top
// Great Wall: long thin BoxGeometry following terrain
// Sydney Opera House: 2-3 curved shell shapes (CylinderGeometry halves)
// Mount Fuji: ConeGeometry with white cap material on top portion
// Christ the Redeemer: cross-shape using two BoxGeometry pieces on a cone mountain
```

**Each landmark gets:**
- A gold `PointLight` above it (intensity 0.8, range 20)
- A floating name label (same CanvasTexture approach as player name tag)
- An interaction zone (sphere trigger) — when player enters, show landmark info

**Done when:** All 11 landmarks visible at correct world positions with name labels.


This is exactly the right instinct. A flat green extrusion of every country looks the same everywhere — there's no sense of place. Even simple differentiation makes it feel like a real world.

---

## How to Implement This Without Going Overboard

You don't need a terrain engine. You need **3-4 simple data layers** on top of your existing GeoJSON geometry.

---

### Layer 1 — Ground Colour by Biome

The cheapest possible differentiation. Just change the `MeshLambertMaterial` colour per country/region based on a biome lookup:

```javascript
const BIOME_COLOURS = {
  desert:      0xC9A84C,  // sandy gold — UAE, Egypt, Sahara, Arabia
  tropical:    0x2d7a35,  // rich green — Kerala, SE Asia, Amazon
  temperate:   0x4a6741,  // medium green — Europe, Eastern US, China
  urban_dense: 0x6a6a7a,  // grey-green — Japan, Western Europe
  sparse:      0x8a7a5a,  // dry brown — Africa interior, Australia outback
  arctic:      0xddeeff,  // pale blue-white — Russia north, Canada north
  island:      0x3a8a4a,  // bright green — islands pop against ocean
}

// Per-country biome mapping (just key countries to start)
const COUNTRY_BIOMES = {
  "United Arab Emirates": "desert",
  "Egypt":                "desert",
  "Saudi Arabia":         "desert",
  "India":                "tropical",
  "Kerala":               "tropical",   // if you split by state later
  "Japan":                "urban_dense",
  "Germany":              "urban_dense",
  "France":               "urban_dense",
  "Congo":                "tropical",
  "Chad":                 "sparse",
  "Australia":            "sparse",
  "Russia":               "arctic",
  // ... default everything else to "temperate"
}
```

Zero performance cost. Massive visual impact.

---

### Layer 2 — Simple Height Variation

Not a full heightmap — just a few elevation zones per region using noise:

```javascript
import { createNoise2D } from 'simplex-noise'
const noise2D = createNoise2D()

// After building continent geometry, displace vertices slightly
function addTerrainNoise(geometry, regionType) {
  const pos = geometry.attributes.position
  const scale = {
    mountain: 0.8,   // Japan, Nepal, Switzerland, Kerala Ghats
    hilly:    0.3,   // most of Europe, East Africa
    flat:     0.05,  // UAE, Egypt, Netherlands, Bangladesh
    island:   0.4,   // islands have coastal slope
  }[regionType] || 0.15

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const elevation = noise2D(x * 0.02, z * 0.02) * scale
    pos.setY(i, pos.getY(i) + Math.max(0, elevation))
  }
  pos.needsUpdate = true
  geometry.computeVertexNormals()
}
```

This gives mountains a genuine raised look and desert areas stay dead flat — exactly what you described.

---

### Layer 3 — Vegetation Clusters

Scattered instanced meshes (trees, palms, cacti) placed based on biome. Use `THREE.InstancedMesh` — renders thousands of trees in one draw call:

```javascript
function spawnVegetation(biome, bounds, count) {
  const configs = {
    tropical: { color: 0x1a6b2a, shape: 'round',  scale: 1.2 },  // lush round trees
    desert:   { color: 0x8a7a2a, shape: 'cactus', scale: 0.8 },  // sparse cacti
    temperate:{ color: 0x3a6a30, shape: 'cone',   scale: 1.0 },  // pine-ish cones
    sparse:   { color: 0x7a6a3a, shape: 'round',  scale: 0.6 },  // scrubby small
    arctic:   { color: 0x5a7a6a, shape: 'cone',   scale: 0.9 },  // sparse pines
  }

  const cfg = configs[biome] || configs.temperate
  const geo = cfg.shape === 'cone'
    ? new THREE.ConeGeometry(0.5, 1.5, 5)
    : new THREE.SphereGeometry(0.7, 5, 4)

  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: cfg.color }), count)
  const matrix = new THREE.Matrix4()

  for (let i = 0; i < count; i++) {
    const x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX)
    const z = bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ)
    const s = cfg.scale * (0.7 + Math.random() * 0.6)
    matrix.makeScale(s, s, s)
    matrix.setPosition(x, 0.5, z)
    mesh.setMatrixAt(i, matrix)
  }
  return mesh
}

// Usage
// Desert — very sparse (few cacti)
spawnVegetation('desert', uaeBounds, 50)
// Tropical — dense (Kerala, Amazon)
spawnVegetation('tropical', keralaBounds, 800)
// Europe — medium
spawnVegetation('temperate', franceBounds, 300)
// Africa interior — very sparse
spawnVegetation('sparse', chadBounds, 80)
```

---

### Layer 4 — Road Density by Region

OSM road data already has this naturally — just filter what you load:

```javascript
const ROAD_DENSITY = {
  // Load all road types
  urban_dense: ['motorway', 'trunk', 'primary', 'secondary'],
  // Load only major roads
  temperate:   ['motorway', 'trunk', 'primary'],
  // Load only highways
  sparse:      ['motorway', 'trunk'],
  // Almost nothing
  desert:      ['motorway'],
}
```

Japan and Europe naturally get dense road networks. Africa interior gets almost none. No extra work — just filter the OSM query by region.

---

### Special Cases You Mentioned

**Dubai / UAE — desert feel:**
- Flat terrain (noise scale 0.05)
- Sandy ground colour
- Almost no vegetation
- Burj Khalifa landmark
- Add a subtle sand particle system near the ground (very cheap with `THREE.Points`)

**Egypt:**
- Same as UAE but add the Nile as a blue ribbon geometry cutting through
- Pyramids landmark
- Slight dune shapes via noise near landmark

**Japan:**
- Urban dense colour
- Mount Fuji as landmark with actual elevation (cone geometry rising from terrain)
- Dense road network
- Mix of urban grey near coasts and green forested areas inland

**Kerala:**
- Richest green in the world
- Western Ghats as elevated ridge along the west (mountain noise along that strip)
- Backwaters as thin blue geometry strips along the coast
- Dense tropical vegetation

**Islands:**
- Slight elevation in centre (island shape)
- Beach strip (sand colour) around the coastline
- Ocean around them already handles the "feels like island" effect from the GeoJSON
- Add a subtle shore foam ring at water level (`THREE.RingGeometry` with white semi-transparent material)

**Africa interior:**
- Sparse ground, dry brown
- Very few roads
- Occasional baobab tree shape (fat trunk, tiny top — inverted cone)
- Makes it feel genuinely vast and empty compared to Europe

---

## Build Order for This

Don't add all of this at once. Layer it in after the base world works:

```
Base world working     → Add Layer 1 (biome colours) first
                         Instant visual improvement, 1 hour of work

Once colours work      → Add Layer 2 (height noise)
                         Mountains appear, deserts stay flat

Once height works      → Add Layer 3 (vegetation clusters)
                         World feels alive

Once vegetation works  → Add special cases
                         Kerala backwaters, Nile, island shores
```

Layer 1 alone transforms the world from "flat green blob" to something that actually reads as Earth. Do that first before anything else in this list.


---

### STEP 10 — Guild Halls (from API)

**File:** `src/api.js` and integrate into `src/world/landmarks.js`

**API call:**
```javascript
export async function fetchGuilds() {
  const res = await fetch('https://rokubot.com/api/world/servers')
  return res.json()
  // Returns: [{ server_id, name, position: {lat, lng}, tier, gdp, member_count }]
}
```

**Guild Hall 3D model:**
```javascript
function buildGuildHall(tier) {
  const group = new THREE.Group()
  const size = tier === 'inner' ? 2 : tier === 'middle' ? 1.5 : 1.2
  // Main building body
  const body = new THREE.Mesh(new THREE.BoxGeometry(size, size*1.5, size), guildMat)
  body.position.y = size * 0.75
  // Pointed roof (cone)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(size * 0.8, size * 0.8, 4), roofMat)
  roof.position.y = size * 1.5 + size * 0.4
  roof.rotation.y = Math.PI / 4
  // Flag pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, size), poleMat)
  pole.position.set(size*0.4, size*1.5 + size*0.8, 0)
  group.add(body, roof, pole)
  return group
}
```

**Tier colours:**
```javascript
const tierColours = {
  wilderness: 0x888888,
  outer:      0x4488aa,
  middle:     0x44aa66,
  inner:      0xc9a84c,  // gold
}
```

**Cylinder GDP indicator (height = GDP proportion):**
```javascript
// Glowing cylinder under guild hall, height proportional to GDP
const maxGDP = 500000
const gdpHeight = (guild.gdp / maxGDP) * 3
const indicator = new THREE.Mesh(
  new THREE.CylinderGeometry(0.3, 0.3, gdpHeight, 8),
  new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.4 })
)
```

**Done when:** Real Discord servers from your API appear as buildings on the world map.

---

### STEP 11 — Teleport System

**File:** `src/systems/teleport.js`

```javascript
const COSTS = {
  same_country:     10,
  neighbouring:    200,
  same_continent:  500,
  diff_continent: 1500,
  opposite:       2500,
}

const COOLDOWNS = {
  same_country:    0,
  neighbouring:    2 * 60 * 60 * 1000,   // 2 hours in ms
  same_continent:  6 * 60 * 60 * 1000,
  diff_continent: 18 * 60 * 60 * 1000,
  opposite:       24 * 60 * 60 * 1000,
}

// Anti-exploit: track daily cumulative distance
let dailyDistanceKm = 0
let lastResetDay = new Date().getDate()

function resetDailyIfNeeded() {
  const today = new Date().getDate()
  if (today !== lastResetDay) { dailyDistanceKm = 0; lastResetDay = today }
}

export function getTeleportCategory(fromLng, fromLat, toLng, toLat) {
  const distKm = haversineDistance(fromLng, fromLat, toLng, toLat)
  resetDailyIfNeeded()
  dailyDistanceKm += distKm

  // Anti-exploit: if cumulative today exceeds continent width (5000km), charge up
  if (dailyDistanceKm > 5000 && distKm < 1000) return 'same_continent'

  if (distKm < 200)   return 'same_country'
  if (distKm < 800)   return 'neighbouring'
  if (distKm < 5000)  return 'same_continent'
  if (distKm < 15000) return 'diff_continent'
  return 'opposite'
}

export function getCost(category) { return COSTS[category] }
export function getCooldown(category) { return COOLDOWNS[category] }

function haversineDistance(lng1, lat1, lng2, lat2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// Cooldown state
let cooldownUntil = 0

export function isOnCooldown() { return Date.now() < cooldownUntil }
export function getRemainingCooldown() { return Math.max(0, cooldownUntil - Date.now()) }

export async function executeTeleport(scene, playerGroup, toLng, toLat, playerCoins, deductCoins) {
  if (isOnCooldown()) return { success: false, reason: 'cooldown' }
  const category = getTeleportCategory(/* current pos */ 0, 0, toLng, toLat)
  const cost = getCost(category)
  if (playerCoins < cost) return { success: false, reason: 'insufficient_coins' }

  await deductCoins(cost)  // call your backend API

  // Fade to black
  await fadeOut()
  const { x, z } = projectCoord(toLng, toLat)
  playerGroup.position.set(x, 0, z)
  await fadeIn()

  cooldownUntil = Date.now() + getCooldown(category)
  return { success: true, cost, category }
}
```

---

### STEP 12 — Chat System

**File:** `src/systems/chat.js`

```javascript
// Proximity chat — floating text above player head
export function showProximityMessage(playerGroup, text, scene) {
  const canvas = document.createElement('canvas')
  canvas.width = 300; canvas.height = 80
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.roundRect(4, 4, 292, 72, 8); ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = '20px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(text, 150, 48)

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 0.8),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false })
  )
  mesh.position.copy(playerGroup.position)
  mesh.position.y = 3.5
  scene.add(mesh)

  // Billboard every frame + auto-remove after 4 seconds
  setTimeout(() => scene.remove(mesh), 4000)
  return mesh
}

// HTML chat panel (not Three.js — just DOM)
export function createChatUI() {
  const panel = document.createElement('div')
  panel.innerHTML = `
    <div id="chat-panel" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:380px;z-index:100">
      <div style="display:flex;gap:8px;margin-bottom:4px">
        <button onclick="switchTab('proximity')" id="tab-proximity">Nearby</button>
        <button onclick="switchTab('global')"    id="tab-global">Global</button>
        <button onclick="switchTab('guild')"     id="tab-guild">Guild</button>
      </div>
      <div id="chat-log" style="height:120px;overflow-y:auto;background:rgba(0,0,0,0.7);padding:8px;border-radius:8px 8px 0 0;color:#fff;font-size:13px"></div>
      <div style="display:flex">
        <input id="chat-input" placeholder="Press Enter to chat" style="flex:1;padding:8px;background:rgba(0,0,0,0.8);border:none;color:#fff;outline:none">
        <button onclick="sendChat()">Send</button>
      </div>
    </div>
  `
  document.body.appendChild(panel)

  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.code === 'Enter') sendChat()
    e.stopPropagation()  // prevent WASD from triggering while typing
  })
}
```

---

### STEP 13 — HUD

**File:** `src/ui/hud.js`

Pure HTML/CSS overlay. Not Three.js. Position fixed over the canvas.

**Elements to build:**
1. **Top bar** (top centre): player name, profession badge, coin balance (updates from API), country name, online count
2. **Zone banner** (below top bar): fades in/out when entering new country or zone — `opacity: 0` normally, `opacity: 1` for 2.5s on zone change
3. **Interact prompt** (bottom centre above chat): "Press E to enter [Guild Name]" — shows when within 15 units of a guild hall or landmark
4. **Teleport cooldown** (top right): countdown timer, hidden when no cooldown
5. **Minimap** (bottom right): 160×160 `<canvas>` — draw world outline (simplified), player dot (gold), nearby guild dots (coloured by tier), update every frame
6. **Quality settings** (bottom right corner): small button cycling Battery Saver / Balanced / Performance

**Coin balance update:**
```javascript
// Poll your existing API every 30 seconds
async function refreshBalance() {
  const res = await fetch('/api/player/balance')
  const { coins } = await res.json()
  document.getElementById('hud-coins').textContent = coins.toLocaleString() + ' 🪙'
}
setInterval(refreshBalance, 30000)
```

---

### STEP 14 — Performance System

**File:** `src/systems/performance.js`

Implement ALL of these. Not optional.

```javascript
// 1. Adaptive render — only render when something changed
let needsRender = true
export function markDirty() { needsRender = true }
export function shouldRender() {
  if (needsRender) { needsRender = false; return true }
  return false
}
// Call markDirty() from: player move, other player update, chat message, world event, UI change

// 2. Pause when tab hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    renderer.setAnimationLoop(null)
  } else {
    renderer.setAnimationLoop(gameLoop)
    markDirty()
  }
})

// 3. Pixel ratio cap
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

// 4. Shadow optimisation
renderer.shadowMap.autoUpdate = false
// Call renderer.shadowMap.needsUpdate = true only when a player moves

// 5. LOD for guild halls and landmarks
function createLOD(highMesh, position) {
  const lod = new THREE.LOD()
  const medMesh = simplify(highMesh)         // remove detail
  const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1,2,1), lowMat)
  lod.addLevel(highMesh, 0)
  lod.addLevel(medMesh,  50)
  lod.addLevel(boxMesh,  150)
  lod.addLevel(new THREE.Mesh(), 300)        // invisible
  lod.position.copy(position)
  return lod
}

// 6. Render distance — hide objects beyond 300 units
function cullByDistance(scene, playerPos, radius = 300) {
  scene.children.forEach(obj => {
    if (!obj.userData.isWorldObject) return
    const dx = obj.position.x - playerPos.x
    const dz = obj.position.z - playerPos.z
    obj.visible = Math.sqrt(dx*dx + dz*dz) < radius
  })
}
// Call cullByDistance every 3 seconds (not every frame)

// 7. Quality presets
export const QUALITY = {
  battery: {
    pixelRatio: 1.0,
    renderDistance: 100,
    shadows: false,
    fps: 30,
    adaptiveRender: true,
  },
  balanced: {
    pixelRatio: 1.5,
    renderDistance: 200,
    shadows: true,
    fps: 60,
    adaptiveRender: true,
  },
  performance: {
    pixelRatio: window.devicePixelRatio,
    renderDistance: 400,
    shadows: true,
    fps: 60,
    adaptiveRender: false,
  }
}

export function applyQuality(preset, renderer, scene) {
  const q = QUALITY[preset]
  renderer.setPixelRatio(q.pixelRatio)
  renderer.shadowMap.enabled = q.shadows
  // Store renderDistance for cullByDistance
  window.RENDER_DISTANCE = q.renderDistance
}
```

---

### STEP 15 — Backend Routes (Python aiohttp)
> Its already built in different folder ../roku-backend

**File:** `routes/world.py` (add to existing backend)

```python
from aiohttp import web
from database import db  # your existing db connection
import json

routes = web.RouteTableDef()

@routes.get('/api/world/servers')
async def get_world_servers(request):
    """All guild halls: position, GDP, tier, server name"""
    servers = await db.world_guilds.find(
        { 'world_position': { '$exists': True } },
        { 'server_id': 1, 'name': 1, 'world_position': 1, 'tier': 1, 'weekly_gdp': 1, 'member_count': 1 }
    ).to_list(length=None)
    return web.json_response(servers)

@routes.get('/api/world/server/{server_id}')
async def get_world_server(request):
    server_id = request.match_info['server_id']
    server = await db.world_guilds.find_one({ 'server_id': server_id })
    if not server:
        return web.json_response({ 'error': 'not found' }, status=404)
    return web.json_response(server)

@routes.get('/api/world/leaderboard')
async def get_leaderboard(request):
    servers = await db.world_guilds.find().sort('weekly_gdp', -1).limit(50).to_list(length=50)
    return web.json_response(servers)

@routes.post('/api/world/place')
async def place_guild(request):
    """Server owner sets their guild hall position. Requires auth."""
    data = await request.json()
    # Validate Discord auth token here using your existing auth system
    server_id = data.get('server_id')
    lat = data.get('lat')
    lng = data.get('lng')
    tier = data.get('tier', 'wilderness')

    # Calculate relocation cost
    existing = await db.world_guilds.find_one({ 'server_id': server_id })
    if existing and existing.get('world_position'):
        cost = calculate_relocation_cost(existing['world_position'], {'lat': lat, 'lng': lng}, existing.get('tier'), tier)
        # Deduct from server GDP pool
        # ... your existing coin deduction logic

    await db.world_guilds.update_one(
        { 'server_id': server_id },
        { '$set': { 'world_position': { 'lat': lat, 'lng': lng }, 'tier': tier } },
        upsert=True
    )
    return web.json_response({ 'success': True })

# Add to main.py:
# from routes.world import routes as world_routes
# app.router.add_routes(world_routes)
```

**MongoDB document shape for guild:**
```javascript
{
  server_id:      "123456789",
  name:           "The Steel Brotherhood",
  world_position: { lat: 25.197, lng: 55.274 },
  tier:           "inner",          // wilderness | outer | middle | inner
  weekly_gdp:     145000,
  member_count:   2400,
  discord_invite: "https://discord.gg/...",
  landmark_near:  "Burj Khalifa",
  settled_at:     ISODate("2025-01-01")
}
```

---

### STEP 16 — Discord OAuth Login

**Reuse your existing auth system.** The world frontend just needs to:

1. Redirect to `https://rokubot.com/api/auth/discord` (your existing route)
2. After OAuth, store the returned `access_token` in localStorage
3. Include token in API headers: `Authorization: Bearer ${token}`
4. Fetch player data: `GET /api/player/me` → get name, profession, coins, inventory

```javascript
// api.js
const TOKEN = localStorage.getItem('roku_token')

export async function getPlayerProfile() {
  const res = await fetch('https://rokubot.com/api/player/me', {
    headers: { 'Authorization': `Bearer ${TOKEN}` }
  })
  return res.json()
}

export async function deductCoins(amount, reason) {
  const res = await fetch('https://rokubot.com/api/player/deduct', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, reason })
  })
  return res.json()
}
```

---
## One Optimisation That Helps A Lot

The biggest socketio RAM cost is storing all player state in memory. You're already doing spatial filtering (only send nearby players) which helps. Also add:

```python
# Disconnect idle players after 5 minutes of no position updates
# Add this to your existing main.py (Python aiohttp + socketio)

import asyncio

IDLE_TIMEOUT = 5 * 60 # 5 minutes / 300 seconds

async def check_idle_players():
    while True:
        await asyncio.sleep(60)  # check every minute
        now = time.time()
        for pid, p in list(players.items()):
            if now - p['last_update'] > IDLE_TIMEOUT:
                await sio.emit('kicked', { 'reason': 'idle' }, to=pid)
                await sio.disconnect(pid)
                players.pop(pid, None)

# Start the idle checker when the app starts
@app.on_startup
async def start_idle_checker():
    asyncio.create_task(check_idle_players())
```

Players who tab out or forget the game open stop consuming server resources.
---
## Chat & Voice

### Text Chat
Fully handled by Socket.io. Already built in Step 7 + Step 12.

### Voice Chat
**Do not build voice chat for now.** Add a single button in the guild hall panel:

```html
<button onclick="window.open(guildDiscordInvite)">
  🎙️ Join Voice on Discord
</button>
```

Players are already in Discord. They voice there. Proximity WebRTC adds 3+ weeks of work for a feature players already have. Add it in Phase 2 if users specifically request it.

---

## Hosting Setup

```
world.rokubot.com      Vercel — deploy from GitHub, auto on push OR VPS (Nginx serves Vite /dist build)
rokubot.com            Existing Python aiohttp — runs both API + socket.io
```

**Vercel config (`vite.config.js`):**
```javascript
export default {
  build: { outDir: 'dist' },
  server: {
    proxy: {
      '/api': 'https://rokubot.com',
      '/socket.io': { target: 'https://rokubot.com', ws: true }
    }
}
}
```

**Python aiohttp — socket.io runs on the same server as your API:**
- socketio.AsyncServer attaches to your existing aiohttp app via `sio.attach(app)`
- No separate process needed — everything runs in one Python server
- Set `VITE_SOCKET_URL` to your existing aiohttp domain (e.g. `https://rokubot.com`)
- socket.io-client connects to the same origin as the API

---

## How to Use This Document With AI

Say this to your AI assistant:

> "I am building a 3D browser game called Roku World. Here is the complete specification. Build it step by step, starting with Step 1 only. Do not build multiple steps at once. After each step, wait for me to test it before moving to the next."

Then after each step works, say:

> "Step [N] is working. Now build Step [N+1] from the spec."

This prevents the AI from generating 2000 lines of untested code at once.

---

## What You Do NOT Need to Build

- ❌ Physics engine (no collision, no gravity simulation)
- ❌ Pathfinding AI (NPCs come later)
- ❌ Voice chat (Discord handles this for now)
- ❌ New economy system (reuse existing MongoDB)
- ❌ New auth system (reuse existing Discord OAuth)
- ❌ Mobile app (browser works on mobile via URL)
- ❌ High-poly models (blocky low-poly is the design)
- ❌ Realistic road simulation (simple path following)

---

---

## The Reality of Three.js on Mobile

The 3D world will run in a mobile browser — Three.js is WebGL and WebGL works on iOS Safari and Android Chrome. But the controls are the entire problem. WASD + mouse pointer lock is desktop-only. Mobile needs touch controls.

---

## What You Need to Add

**Virtual Joystick (left thumb) — movement**
```javascript
// Use nipplejs library — easiest virtual joystick
// npm install nipplejs

import nipplejs from 'nipplejs'

const joystick = nipplejs.create({
  zone: document.getElementById('joystick-zone'),
  mode: 'static',
  position: { left: '60px', bottom: '60px' },
  color: 'rgba(201,168,76,0.5)'
})

joystick.on('move', (evt, data) => {
  const angle = data.angle.radian
  const force = Math.min(data.force, 1)
  moveX = Math.cos(angle) * force
  moveZ = -Math.sin(angle) * force  // convert joystick to world movement
})

joystick.on('end', () => {
  moveX = 0
  moveZ = 0
})
```

**Touch drag (right side of screen) — camera look**
```javascript
let touchStartX = 0, touchStartY = 0

document.addEventListener('touchstart', e => {
  // Only right half of screen controls camera
  if (e.touches[0].clientX > window.innerWidth / 2) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }
})

document.addEventListener('touchmove', e => {
  if (e.touches[0].clientX > window.innerWidth / 2) {
    const dx = e.touches[0].clientX - touchStartX
    const dy = e.touches[0].clientY - touchStartY
    yaw   -= dx * 0.005
    pitch -= dy * 0.005
    pitch  = Math.max(-0.6, Math.min(0.6, pitch))
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }
})
```

**On-screen buttons (replace keyboard shortcuts)**
```html
<!-- Bottom right corner button cluster -->
<div id="mobile-buttons" style="position:fixed;bottom:80px;right:20px;display:flex;flex-direction:column;gap:8px">
  <button class="mobile-btn" id="btn-interact">E</button>
  <button class="mobile-btn" id="btn-camera">C</button>
  <button class="mobile-btn" id="btn-map">M</button>
  <button class="mobile-btn" id="btn-sprint">⚡</button>
</div>
```

---

## Device Detection

Show/hide controls based on device:

```javascript
const isMobile = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent)
              || window.innerWidth < 768

if (isMobile) {
  document.getElementById('mobile-buttons').style.display = 'flex'
  document.getElementById('joystick-zone').style.display = 'block'
  document.getElementById('controls-hint').style.display = 'none' // hide WASD hint
  // Force battery saver quality on mobile
  applyQuality('battery', renderer, scene)
} else {
  document.getElementById('mobile-buttons').style.display = 'none'
  document.getElementById('joystick-zone').style.display = 'none'
}
```

---

## Mobile-Specific Performance Rules

Mobile GPUs are far weaker than desktop. Force these settings regardless of what the user picks:

```javascript
if (isMobile) {
  renderer.setPixelRatio(1.0)        // never exceed 1x on mobile
  window.RENDER_DISTANCE = 80        // half of battery saver desktop
  renderer.shadowMap.enabled = false // no shadows ever on mobile
  // Cap at 30fps
  let lastFrame = 0
  function mobileLoop(timestamp) {
    requestAnimationFrame(mobileLoop)
    if (timestamp - lastFrame < 33) return  // 33ms = 30fps
    lastFrame = timestamp
    if (needsRender) { renderer.render(scene, camera); needsRender = false }
  }
}
```

---

## Viewport Meta Tag (Critical)

Without this mobile browsers zoom in weirdly and the canvas doesn't fill correctly:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
      maximum-scale=1.0, user-scalable=no">
```

`user-scalable=no` prevents pinch-zoom interfering with your touch camera controls.

---

## PWA (Optional but Worth It)

Add a `manifest.json` and service worker so players can "install" the game to their home screen. Makes it feel like a native app:

```json
{
  "name": "Roku World",
  "short_name": "Roku",
  "start_url": "/",
  "display": "fullscreen",
  "background_color": "#0d1117",
  "theme_color": "#c9a84c",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Players tap "Add to Home Screen" → opens full screen, no browser chrome, feels native.

---

## Summary of What to Add to the Build Spec

```
New dependency    nipplejs (virtual joystick)
New file          src/ui/mobileControls.js
index.html        viewport meta tag + joystick zone div + mobile button divs
main.js           isMobile detection, branch controls accordingly
performance.js    force battery saver settings on mobile
manifest.json     PWA support (optional)
```

Add this as **Step 17** in your build spec after everything else works on desktop. Get the desktop version solid first — mobile controls are a layer on top, not a foundation.


---


*Roku World Build Specification v1.0 — 2025*
