# Roku World — Build Progress

> Auto-generated session log. Last updated: 2026-09-28
> Based on: [`roku_world_build_spec.md`](./roku_world_build_spec.md)

---

## ✅ What Has Been Built

### Step 1 — World Geometry ✅ DONE
**Files:** [`src/world/terrain.js`](./src/world/terrain.js) · [`src/world/ocean.js`](./src/world/ocean.js)

- Downloads and parses **Natural Earth 1:50m GeoJSON** (`public/assets/world.geojson` — 241 countries, 1,618 polygons, 3.9 MB)
- Converts each country polygon to `THREE.Shape` → `ExtrudeGeometry` (depth 0.5, bevelEnabled false)
- Coordinate projection exactly as specced:
  ```js
  function projectCoord(lng, lat, scale = 3) {
    return { x: lng * scale, z: -lat * scale }
  }
  ```
- Geometry rotated flat: `geometry.rotateX(-Math.PI / 2)`
- Land material: `MeshLambertMaterial({ color: 0x4a6741 })`
- Ocean: `PlaneGeometry(1400, 700)` at Y=−0.05, `MeshLambertMaterial({ color: 0x0d2a4a })`
- Ambient light + directional sunlight with PCF soft shadows (2048×2048 shadow map)
- Secondary fill light

---

### Step 2 — Coordinate Validation ✅ DONE
**File:** [`src/world/terrain.js`](./src/world/terrain.js) (integrated)

- Red `BoxGeometry(2,2,2)` markers at 5 real-world coordinates:
  - Dubai (lng 55.2, lat 25.2)
  - Paris (lng 2.3, lat 48.8)
  - Sydney (lng 151.2, lat -33.8)
  - New York (lng -74.0, lat 40.7)
  - Tokyo (lng 139.7, lat 35.7)
- All boxes confirmed sitting on correct countries ✓
- **"Hide/Show Test Boxes"** toggle button in UI

---

### Step 3 — Player Character ✅ DONE (+ Iterative Polish)
**File:** [`src/player/character.js`](./src/player/character.js)

#### Head
- **Rounded Roblox-style** head: `CylinderGeometry(0.38, 0.40, 0.65, 24)` + spherical dome cap + chin bevel + neck joint
- **No face** — completely blank, no eyes/nose/mouth

#### Creative Face Coverings (no bare faces — spec requirement)
| Profession | Covering | Accessories |
|---|---|---|
| **Wayfarer** | Gold aviator sunglasses (dark lenses + gold temple bars) | Layered swept hair + subtle jacket zipper |
| **Artificer** | Amber cyber tactical visor (dark shield + orange glow strip) | Industrial yellow/orange over-ear studio headphones |
| **Mystic** | Deep purple shadow cowl + purple runic visor slit | Royal purple draped hood with amethyst trim |
| **Tycoon** | Designer black square sunglasses (thick luxury frames) | Gold chain necklace draped across chest |

#### Body Construction
- **Torso**: Chest block + waist block + belt (profession `beltColor`) + accent buckle
- **Backpack** on back (−Z) with shoulder straps on front (+Z) → clear front/back directionality
- **Arms**: Cylinder sleeves with shoulder pivot groups (`leftArmGroup.position.set(-0.54, shoulder_Y, 0)`)
- **Hands**: Roblox C-clamp shape (`TorusGeometry` arc, 270°)
- **Legs**: Box geometry with hip pivot groups
- **Shoes**: Box base + rounded front toe dome (`SphereGeometry` half, scaled)
- **Name tag**: Canvas texture billboard that always faces camera (`nameTag.quaternion.copy(camera.quaternion)`)

#### Profession Configs
| Profession | Jacket | Pants | Belt |
|---|---|---|---|
| Wayfarer | Caramel leather `#945a24` | Dark indigo denim `#24354b` | Saddle-brown `#4a2812` |
| Artificer | Tactical slate `#3e444c` | Dark cargo `#282f3a` | Dark utility `#14171d` |
| Mystic | Deep purple `#4a1a6b` | Dark amethyst `#220938` | Obsidian `#130621` |
| Tycoon | Navy suit `#14203b` | Dark midnight `#0c1424` | Luxury leather `#382212` |

#### Artificer Apron Fix (applied)
- Apron positioned **above belt** (bottom edge `y=0.84 > belt y=0.73`) — no notch overlap bug
- Darker bib pocket detail

---

## 📁 Current File Structure

```
roku-world/
├── index.html                    ✅  App shell, loading overlay, HUD, test nav buttons
├── vite.config.js                ✅  Vite 5.x config with dev proxy
├── package.json                  ✅  three@0.160, d3-geo, socket.io-client, vite
├── package-lock.json
├── .gitignore
├── roku_world_build_spec.md      📋  Full original specification
├── PROGRESS.md                   📝  This file
│
├── public/
│   └── assets/
│       └── world.geojson         ✅  Natural Earth 1:50m (3.9 MB, 241 countries)
│
├── assets/
│   └── world.geojson             (local copy, same file)
│
└── src/
    ├── main.js                   ✅  Scene init, renderer, OrbitControls, init(), animate()
    │
    ├── world/
    │   ├── terrain.js            ✅  GeoJSON → ExtrudeGeometry, coord projection, test boxes
    │   └── ocean.js              ✅  Ocean plane
    │
    └── player/
        └── character.js          ✅  Roblox character builder (all 4 professions)

── MISSING (not yet built) ──────────────────────────────────────────────
    ├── world/
    │   ├── roads.js              ❌  OSM road paths as flat geometry
    │   └── landmarks.js          ❌  11 Tier 1 landmark 3D models
    │
    ├── player/
    │   ├── animation.js          ✅  Walk / idle / sprint cycles
    │   └── controls.js           ❌  WASD + mouse pointer lock input
    │
    ├── camera/
    │   └── camera.js             ❌  Third-person / top-down / isometric (C key)
    │
    ├── vehicles/
    │   └── vehicle.js            ❌  Enter/exit car, follow road path
    │
    ├── multiplayer/
    │   ├── socket.js             ❌  socket.io-client connection (skip until backend ready)
    │   └── otherPlayers.js       ❌  Render remote players from socket data
    │
    ├── systems/
    │   ├── teleport.js           ❌  Cost calc, cooldown, anti-exploit
    │   ├── chat.js               ❌  Proximity + global text chat
    │   └── performance.js        ❌  LOD, adaptive render, quality settings
    │
    ├── ui/
    │   ├── hud.js                ❌  Top bar, zone banner, minimap
    │   ├── map.js                ❌  M key world map overlay
    │   ├── guildPanel.js         ❌  E key guild hall info panel
    │   └── teleportUI.js         ❌  Teleport confirmation modal
    │
    └── api.js                    ❌  Fetch calls to Python aiohttp backend
```

---

## 🔜 What To Build Next (In Order)

> Follow the spec's rule: **each step must work before the next**

### Step 4 — Animation ✅ DONE
**Files:** `src/player/animation.js` · `src/main.js`

```js
export function animateCharacter(parts, state, t) { ... }
```


**Done when:** Character visibly walks when WASD pressed, idles when still.


### Step 5 — Controls & Camera ❌
**Files to create:** `src/player/controls.js` · `src/camera/camera.js`

  - `0` Third-person: follow behind + above
  - `1` Top-down: WASD pans camera (orthographic feel)
  - `2` Isometric: 45° fixed

**Done when:** WASD moves character, mouse rotates view, C cycles modes.

  ├── main.js                   ✅  Scene init, renderer, controls/camera integration, init(), animate()
  │   ├── controls.js           ✅  WASD, sprint, pointer lock, and action key bindings
  │   └── camera.js             ✅  Third-person / top-down / isometric (C key)


### Step 6: Vehicle
**File to create:** `src/vehicles/vehicle.js`

- Press `F` near spawn point → enter/exit
- Simple box-car mesh (body + roof + 4 wheel cylinders)
- Speeds: Car=60, Motorcycle=40, Bicycle=20 units/sec
- Off-road penalty: `speed *= 0.4`
- No physics — straight position update along movement direction

---

### Step 7 — Socket.io Server (Python) ❌ SKIP FOR NOW
> Per spec note on line 396: *"DONT DO THESE STEPS AS FOR NOW CZ I WILL ADD IT LATER"*
> Backend lives in `../roku-backend/main.py`

---

### Step 8 — Other Players Rendering ❌ (depends on Step 7)
**File to create:** `src/multiplayer/otherPlayers.js`

- `onPlayerJoin`, `onPlayersUpdate`, `onPlayerLeave`, `updateRemotePlayers`
- Lerp position for smooth movement (not snap)
- Rate-limited position send: max 10/sec

---

### Step 9 — Landmark Models ❌
**File to create:** `src/world/landmarks.js`

All 11 Tier 1 landmarks at exact coordinates using `projectCoord`:
Burj Khalifa · Eiffel Tower · Taj Mahal · Statue of Liberty · Big Ben · Colosseum · Pyramids of Giza · Great Wall · Sydney Opera House · Mount Fuji · Christ the Redeemer

Each gets: gold `PointLight`, floating name label, interaction trigger zone.

---

### Step 10 — Guild Halls ❌
**Files:** `src/api.js` + `src/world/landmarks.js` (extend)

- `fetchGuilds()` → `GET https://rokubot.com/api/world/servers`
- 3D guild hall models (box body + cone roof + flag pole)
- Tier colours: wilderness→grey, outer→blue, middle→green, inner→gold
- GDP height indicator cylinder (glowing green, `opacity: 0.4`)

---

### Step 11 — Teleport System ❌
**File to create:** `src/systems/teleport.js`

- Distance-based cost tiers (same_country → opposite: 10–2500 coins)
- Cooldown timers per tier (0h → 24h)
- Anti-exploit: daily cumulative distance cap (5000km)
- Fade out → reposition → fade in
- Haversine distance formula

---

### Step 12 — Chat System ❌
**File to create:** `src/systems/chat.js`

- Proximity messages: floating canvas text above player head (auto-removes in 4s)
- HTML chat panel (DOM, not Three.js) with tabs: Nearby / Global / Guild
- `Enter` key focuses chat input, `stopPropagation` so WASD doesn't fire

---

### Step 13 — HUD ❌
**File to create:** `src/ui/hud.js`

- Top bar: player name, profession badge, coin balance, country name, online count
- Zone banner: fades in/out on zone change
- Interact prompt: "Press E to enter [Guild Name]" when within 15 units
- Teleport cooldown timer (top right)
- Minimap: 160×160 canvas (world outline + player dot + guild dots)
- Quality settings button: Battery Saver / Balanced / Performance

---

### Step 14 — Performance System ❌
**File to create:** `src/systems/performance.js`

- Adaptive render: only render when `needsRender = true`
- Pause game loop when tab hidden (`visibilitychange`)
- Pixel ratio cap: `Math.min(devicePixelRatio, 1.5)`
- Shadow auto-update disabled (update only on player move)
- LOD for landmarks and guild halls (high → medium → box → invisible at 300u)
- Distance culling every 3 seconds
- Quality presets: Battery / Balanced / Performance

---

### Step 15 — Backend Routes (Python aiohttp) ❌ SKIP FOR NOW
> Lives in `../roku-backend/routes/world.py`
> Routes: `GET /api/world/servers`, `GET /api/world/server/{id}`, `GET /api/world/leaderboard`, `POST /api/world/place`

---

### Step 16 — Discord OAuth Login ❌
**File to create:** `src/api.js`

- Redirect to `https://rokubot.com/api/auth/discord`
- Store `access_token` in localStorage
- `getPlayerProfile()` + `deductCoins()`

---

### Step 17 — Mobile Controls ❌ (last, after desktop works)
**File to create:** `src/ui/mobileControls.js`

- **nipplejs** virtual joystick (left thumb for movement)
- Touch drag right-half of screen → camera look
- On-screen buttons: E · C · M · Sprint (⚡)
- `isMobile` detection → force battery saver quality
- `renderer.setPixelRatio(1.0)`, shadow disabled, 30fps cap
- PWA `manifest.json` (optional)

---

## 🗒️ Tech Notes & Decisions Made

| Topic | Decision |
|---|---|
| Package manager | **fnm** (Fast Node Manager) — activate with `eval "$(/home/tariq/.local/share/fnm/fnm env --shell bash)"` |
| Node version | v22.14.0 |
| GeoJSON source | Cloudfront CDN mirror (`d2ad6b4ur7yvpq.cloudfront.net`) — GitHub raw SSL fails |
| Test boxes | Toggleable via "Hide Test Boxes 🟥" button (keep them until Step 9 landmarks work) |
| Dev server | `http://localhost:5173` |
| Player spawn | Dubai coordinates + 4 unit offset (not inside test box) |
| No face policy | All professions use creative coverings — no bare blank faces |
| Socket.io | **Skipped** — backend in `../roku-backend`, will integrate later |

---

*Roku World Build Progress — session started 2026-09-27*
