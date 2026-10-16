# Roku World — Build Progress

> Auto-generated session log. Last updated: 2026-10-16  
> Source of truth: [`roku_world_build_steps(1).md`](./roku_world_build_steps(1).md)

---

## 🛠️ Stack & Global Architecture Rules

- **Frontend:** Three.js r160 + Vite 5.x (JavaScript).
- **Backend:** Python `aiohttp` on port **8991** with raw WebSocket (`/ws`, JSON messages).
- **No Socket.io:** Pure raw WebSocket only (no `socket.io-client`, no `python-socketio`, no `sio.emit`).
- **Tunable Configs:** Every tunable number (speeds, damage, XP, drop rates, timers) lives in [`src/config.js`](./src/config.js) / `config.py`, never inline.
- **Strict Faceless Rule:** Every character and creature is completely faceless (no eyes, mouth, nose, visors, sunglasses, or slits).

---

## 📋 Step Status Summary

| Step | Feature | Status | Notes |
|---|---|---|---|
| **Step 1** | Terrain | ✅ DONE | Natural Earth 1:50m extruded geometry with ocean plane. |
| **Step 2** | Coordinate Markers | ✅ DONE | Real lat/lng projection validation boxes (Dubai, Paris, Sydney, NY, Tokyo). |
| **Step 3** | Character (Faceless) | ✅ DONE | All sunglasses, visors, and slits removed. Solid featureless head with distinct silhouettes. |
| **Step 4** | Animation | ✅ DONE | Procedural limb swing blending idle, walk, and sprint. |
| **Step 5** | Controls & Camera | ✅ DONE | WASD + shift sprint, mouse look, C key camera mode cycling. |
| **Step 6** | Car (Drivable Vehicle) | ✅ DONE | F to enter/exit, car speed 60, off-road 0.4x penalty on terrain, spinning wheels. |
| **Step 7** | Anime-Like Style | ✅ DONE | Master palette, 3-step toon gradient map, inverted hull outlines, sky dome, clouds. |
| **Step 8** | Burj Khalifa | ⏳ **NEXT** | First landmark in Dubai with LOD. |
| **Step 9** | Slime (single-player) | 🔜 PENDING | Faceless blob creature, AI states (wander, notice, chase, attack, return). |
| **Step 10** | Warrior Combat | 🔜 PENDING | Strike, Heavy Strike, Dodge, arc hit detection, headless resolveAttack logic. |
| **Step 11** | XP & Levels | 🔜 PENDING | Level formula $5n^2 + 50n + 100$, Slime kills give 10 XP, HP scaling. |
| **Step 12** | Death, Respawn, Loot Bundle | 🔜 PENDING | Drop 30-50% unequipped stacks, 5% currency cap 50, atomic claim, LootService. |
| **Step 13** | Discovery Loot Pile | 🔜 PENDING | Hidden fixed location loot pile, glow shimmer, one-time claim. |
| **Step 14** | Multiplayer over aiohttp WS | 🔜 PENDING | Raw aiohttp WebSocket, JSON protocol, client lerp, room regions. |
| **Step 15** | Shared Slime Rewards | 🔜 PENDING | Damage contributor tracking, shared XP, independent loot roll tables. |
| **Step 16** | Mobile Controls | 🔜 PENDING | nipplejs joystick, on-screen action buttons, 30 fps cap, low-power mode. |
| **Step 17** | Performance Pass | 🔜 PENDING | Adaptive render loop, tab visibility pause, quality presets. |

---

## ✅ Details of Completed Steps

### Step 1 — World Geometry ✅ DONE
**Files:** [`src/world/terrain.js`](./src/world/terrain.js) · [`src/world/ocean.js`](./src/world/ocean.js)
- Natural Earth 1:50m GeoJSON extruded into 3D continent meshes (`ExtrudeGeometry`, depth 0.5).
- Projection: `x = lng * 3`, `z = -lat * 3`.
- Ocean base plane at Y=−0.05.

### Step 2 — Coordinate Validation ✅ DONE
**File:** [`src/world/terrain.js`](./src/world/terrain.js)
- Coordinate markers at Dubai, Paris, Sydney, New York, Tokyo.
- "Hide/Show Test Boxes" UI toggle.

### Step 3 — Faceless Character System ✅ DONE
**File:** [`src/player/character.js`](./src/player/character.js)
- Fully compliant with faceless requirement: no eyes, mouth, nose, visors, sunglasses, or slits.
- Solid head shape (`CylinderGeometry` + top/bottom dome bevels + neck).
- Silhouettes maintained across 4 professions:
  - **Wayfarer:** Layered side-swept adventure hair with highlight bangs.
  - **Artificer:** Studio over-ear headphones + spiky hair + high-vis apron above belt.
  - **Mystic:** Flared cowl hood dome and brim.
  - **Tycoon:** Combed-back luxury hair + gold chest chain.
- C-clamp Roblox hands, backpack with front straps, shoes with rounded toe dome.

### Step 4 — Animation ✅ DONE
**File:** [`src/player/animation.js`](./src/player/animation.js)
- Procedural limb swinging for arms and legs.
- Clean blending between idle, walk, and sprint driven by speed.

### Step 5 — Controls and Camera ✅ DONE
**Files:** [`src/player/controls.js`](./src/player/controls.js) · [`src/camera/camera.js`](./src/camera/camera.js)
- WASD + Arrow keys movement, Shift to sprint.
- Smooth mouse drag view rotation (yaw & pitch).
- C key cycles third-person, top-down, and isometric camera modes.

### Step 6 — Vehicle System ✅ DONE
**Files:** [`src/vehicles/vehicle.js`](./src/vehicles/vehicle.js) · [`src/config.js`](./src/config.js) · [`src/main.js`](./src/main.js)
- `F` enters the nearest unoccupied vehicle within 5 units; `F` again exits to the side of the car.
- Player character enters the car (character hidden, camera stays locked on car; car does not jump).
- Car speed: 60 units/sec (vs 8 walk, 16 sprint).
- Paved road ribbon passing through Dubai spawn: car drives at 60 on-road and slows to 24 (0.4x off-road multiplier) on open terrain.
- Dynamic wheel spin proportional to travel distance and speed.

### Step 7 — Anime-Like Style (Cel-Shading, Outlines, Palette) ✅ DONE
**Files:** [`src/palette.js`](./src/palette.js) · [`src/materials.js`](./src/materials.js) · [`src/main.js`](./src/main.js)
- **Palette:** Master palette for all entities, biomes, and lighting. No pure black fills (deep navy `0x141a29` for outlines and shadows).
- **Toon Shading:** Shared 3-step `gradientMap` DataTexture (`NearestFilter`, shadow/mid/highlight steps). Reusable `getToonMaterial(color)` cache.
- **Outlines:** Normal-extruded inverted hull outlines (`addOutline`, `applyOutlinesToGroup`) applied to character, vehicle, and landmark markers. Excluded from terrain and ocean.
- **Atmosphere:** Gradient sky dome (deep blue zenith to pale cyan horizon), soft horizon fog (`0xbae6fd`), soft warm directional sun light + hemisphere sky/ground light, and drifting low-poly stylized clouds.

---

## 📁 Current File Structure

```
roku-world/
├── index.html                    ✅  App shell, HUD, navigation buttons
├── vite.config.js                ✅  Vite 5.x build configuration
├── package.json                  ✅  three@0.160, d3-geo (socket.io removed)
├── package-lock.json
├── .gitignore
├── roku_world_build_steps(1).md  📋  Active step-by-step build guide
├── PROGRESS.md                   📝  This progress tracking file
│
├── public/
│   └── assets/
│       └── world.geojson         ✅  Natural Earth 1:50m GeoJSON
│
├── src/
│   ├── config.js                 ⚙️  Central tunable config (speeds, damage, XP, timers)
│   ├── palette.js                🎨  Master anime/cel-shaded color palette
│   ├── materials.js              🖌️  Toon material cache, gradientMap, inverted hull outlines
│   ├── main.js                   ✅  Scene setup, anime sky & lighting, clouds, game loop
│   │
│   ├── world/
│   │   ├── terrain.js            ✅  Toon continent extrusion & test markers
│   │   └── ocean.js              ✅  Flat anime blue ocean plane
│   │
│   ├── player/
│   │   ├── character.js          ✅  Toon faceless humanoid builder (4 professions)
│   │   ├── animation.js          ✅  Procedural limb swing animation
│   │   └── controls.js           ✅  WASD movement, camera pitch/yaw, action keys
│   │
│   ├── camera/
│   │   └── camera.js             ✅  Third-person, top-down, and isometric camera modes
│   │
│   └── vehicles/
│       └── vehicle.js            ✅  Drivable toon car with outlines, road detection, wheel spin
```

---

## 🔜 Next Step: Step 8 — Burj Khalifa

**Goal:** First landmark.
- Place at Dubai using coordinate projection `latLngToWorld(25.197, 55.274)`.
- Simple tapered tower in toon material with palette colors and outlines.
- Add LOD: full model near, simple prism far.
- **Done when:** Visible at the correct location with hidden detail at distance.
