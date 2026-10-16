# Roku World: Step-by-Step Build Guide

Companion to `roku_world_specification.md` (the spec is the source of truth for rules and values; this file says **what to do in each step**).

**Stack:** Three.js r160 + Vite (JavaScript) frontend. Python **aiohttp** backend with a **raw aiohttp WebSocket** (`/ws`, JSON messages). **Socket.io is not used anywhere**: no `python-socketio`, no `socket.io-client`, no `sio.emit`. If you see any of these in existing code or docs, replace them.

**Rules for the AI building this:**
1. Do one step at a time. Do not start the next step until the "Done when" check passes.
2. Do not build features from later steps early.
3. Keep every tunable number (speeds, damage, XP, drop rates, timers) in one config file per side (`src/config.js`, `config.py`), never inline.
4. Characters have solid, featureless heads. Optional eyewear may be added only as separate meshes on top of the head; never create eyes, pupils, eyelids, nose or mouth.
5. Do not touch the bot's aiohttp server on port 5300. The world backend is its own service on port 8991.

---

## Step 1: Terrain (DONE)
**Goal:** Continents and ocean render from Natural Earth data.
- Load Natural Earth 1:50m GeoJSON, extrude to `ExtrudeGeometry`.
- Projection: `x = lng * 3`, `z = -lat * 3`.
**Done when:** Continents are visible with ocean around them.

## Step 2: Coordinate Markers (DONE)
**Goal:** Place things by real lat/lng.
- Helper `latLngToWorld(lat, lng)` using the projection above. Use it for every placement.
**Done when:** A test marker lands on the correct country.

## Step 3: Character
**Goal:** Blocky humanoid with hair, clothes and shoes, with optional eyewear and no facial features.
- Keep the head a solid, featureless shape. Never create eyes, pupils, eyelids, nose or mouth, including behind eyewear.
- Sunglasses, gold aviator glasses, amber visors and goggles may be attached as separate meshes on top of the head. Lenses must be solid or tinted surfaces that do not reveal eye shapes.
- Configure eyewear enabled/disabled and its style per character in `src/config.js`. Keep all eyewear colours in `src/palette.js` and all eyewear sizes in `src/config.js`.
- Keep eyewear attached to the head so it follows idle and walk animations.
- Keep silhouettes distinct (male, female, child variants if present).
**Done when:** Characters can optionally wear the allowed eyewear, it stays attached during animation, and no facial feature is visible from any camera angle.

## Step 4: Animation (DONE)
**Goal:** Idle, walk, sprint.
- Procedural limb swing driven by speed. Blend idle to walk to sprint.
**Done when:** Animations switch cleanly with movement speed.

## Step 5: Controls and Camera (DONE)
**Goal:** Move and look.
- WASD move, Shift sprint, C cycles third person / top-down / first person.
**Done when:** All three views work and movement is camera-relative.

## Step 6: Car (MESH DONE, behaviour to verify)
**Goal:** A drivable vehicle. The red car mesh already exists in the scene, so do not rebuild it. Check each item below against the current code and build only what is missing.
- [ ] F near the car enters it, F again exits at a side position.
- [ ] While driving: WASD steers and accelerates, car speed 60 vs walking, off-road multiplier 0.4.
- [ ] Camera follows the car; player mesh hidden while inside.
- [ ] Only one occupant for now.
- [ ] Wheels spin with speed (optional).
**Done when:** F enters and exits, the car is clearly faster than walking, and it slows off roads.

## Step 7: Anime-Like Style (Toon Shading, Outlines, Palette)
**Goal:** The whole world reads as anime / cel-shaded. Do this before adding more content so every later asset is built in the same style.

Note: anime normally relies on expressive faces. Because every character is faceless, the style must come from **outlines, flat shading, colour, hair shapes and proportions** instead.

### 7.1 Palette (`src/palette.js`)
- 6-8 base colours, plus a light and a shadow tint for each. Every material pulls from this file only.
- Saturated but soft colours. No pure black fills (use a deep navy for outlines and shadows).
- Biome colours (grass, sand, snow, rock, water) defined here too.

### 7.2 Toon materials
- Use `MeshToonMaterial` on characters, vehicles, landmarks, creatures.
- Create one shared `gradientMap` texture (`DataTexture`, `NearestFilter`, 3 steps: shadow / mid / light). Reuse it everywhere.
- Terrain also uses toon material (flat colour per biome), but no outline.
- Keep textures minimal: flat colours, optional small detail shapes (stripes, trim) as geometry, not photo textures.

### 7.3 Outlines (inverted hull)
- Helper `addOutline(mesh, thickness = 0.03, color = palette.outline)`:
  clone the geometry, `MeshBasicMaterial({ color, side: THREE.BackSide })`, scale or push vertices along normals.
- Apply to characters, vehicles, creatures, landmarks. **Not** terrain or water.
- Outline thickness scales with camera distance so far objects do not turn black blobs (reduce thickness or skip outline past a distance).
- Skip outlines entirely in Battery Saver mode.

### 7.4 Character look (without faces)
- Slightly stylised proportions: larger head, simple body, clear silhouette.
- Hair is the main personality: layered chunky shapes (spiky, bob, long, ponytail), each a separate toon-shaded mesh, with a slightly lighter highlight shape.
- Clothes: bold colour blocks with contrasting trim.
- Head stays a solid, featureless shape. Never add eyes, pupils, eyelids, nose, mouth or slits. Optional eyewear is separate from the head and follows the Step 3 rules.

### 7.5 Lighting and atmosphere
- One directional light (soft warm), one hemisphere light. No shadows on mobile.
- Optional rim light effect: fresnel shader on characters (a thin bright edge) for the anime glow.
- Sky: gradient (top blue, horizon pale), soft stylised clouds as flat low-poly shapes.
- Water: flat blue with a light animated foam edge, no reflections.
- Light fog matching the horizon colour to hide the render distance edge.

### 7.6 Effects
- Combat hits: flat star or slash shapes (billboards) that flash for a few frames. No realistic particles.
- Keep post-processing off by default. An optional bloom pass is only allowed in the Performance preset.

### 7.7 Performance rules
- Share materials and the gradient map across meshes. Do not create a new material per object.
- Outlines add draw calls: merge geometry where possible.

**Done when:** Character, car and Slime all use toon shading with outlines, the palette comes from one file, the sky is a gradient, and a screenshot reads as anime-style at a glance.

## Step 8: Burj Khalifa
**Goal:** First landmark.
- Place at Dubai using `latLngToWorld`. Simple tapered tower, toon material.
- Add an LOD: full model near, simple prism far.
**Done when:** It is visible at the correct location and hidden detail at distance.

## Step 9: Slime (single-player)
**Goal:** First creature, faceless.
- Round blob, solid colour, no eyes or mouth.
- States: wander, notice (within radius), chase, attack, return.
- Health, speed, damage, XP 10 in config.
- Spawn 5-10 in a test area near the player start. Respawn after a timer.
**Done when:** Slimes wander, chase when close, and give up if the player leaves.

## Step 10: Warrior Combat
**Goal:** Strike, Heavy Strike, Dodge.
- Left click Strike (fast, low damage), hold or second input Heavy Strike (slow, high damage, cooldown), right click/Q Dodge (short dash with brief invulnerability, cooldown).
- Hit detection: arc in front of the player, range and angle in config.
- Health bar for player and targeted Slime (simple bar, no faces).
- Write combat logic so it can move to the server later: a function `resolveAttack(attacker, target)` with no rendering code inside.
**Done when:** Attacks reduce Slime health, Slimes damage the player, Dodge avoids a hit.

## Step 11: XP and Levels
**Goal:** Progression.
- `XP(n) = 5n² + 50n + 100` to reach the next level. Keep the table as data.
- Kill a Slime: +10 XP. Level-up triggers a message and raises max health.
- Cumulative kills to level: 16 / 38 / 67 / 105.
**Done when:** Kills fill the XP bar and level-ups happen at the right counts.

## Step 12: Death, Respawn, Loot Bundle
**Goal:** Death has a cost but is fair.
- On death: keep XP, gear and mission progress. Drop 30-50% of unequipped stacks and 5% currency (capped at 50) into a **loot bundle** at the death spot.
- Bundle lifetime 15 minutes (provisional). Visible only to nearby players. Anyone can claim.
- Claim is **atomic**: one lock per bundle, first claim wins, second is rejected. Duplicate death events create one bundle and one penalty (idempotent).
- Respawn at the Guild medical room (use a fixed spawn point until Guilds exist).
- Build this as a `LootService` class now (in-memory) so Step 14 can move it to the server.
**Done when:** Dying drops one bundle, claiming works once, expiry removes it.

## Step 13: Discovery Loot Pile
**Goal:** Reward exploring.
- Hidden pile at a fixed location, small glow or shimmer only when close.
- Claim once, then it is gone (respawn timer later).
**Done when:** Found, claimed once, cannot be claimed again.

## Step 14: Multiplayer over aiohttp WebSocket
**Goal:** Two browser tabs share one world. **No Socket.io.**

### Backend (`rokubot/website-backend`, port 8991)
Add a WebSocket route to the existing aiohttp app:

```python
import json, time, asyncio
from aiohttp import web, WSMsgType

players = {}   # player_id -> {"ws": ws, "x":..., "z":..., "region":..., "last_update": ts}
regions = {}   # region_id -> set(player_id)

async def ws_handler(request):
    ws = web.WebSocketResponse(heartbeat=25)
    await ws.prepare(request)
    pid = None
    try:
        async for msg in ws:
            if msg.type != WSMsgType.TEXT:
                continue
            data = json.loads(msg.data)
            t = data.get("type")
            if t == "join":
                pid = data["player_id"]          # verify auth/session here
                players[pid] = {"ws": ws, "x": 0, "z": 0, "region": "r0", "last_update": time.time()}
                regions.setdefault("r0", set()).add(pid)
                await ws.send_json({"type": "joined", "player_id": pid})
            elif t == "move" and pid:
                handle_move(pid, data)           # rate limit, sanity check speed
            elif t == "attack" and pid:
                await handle_attack(pid, data)   # server resolves the result
            elif t == "claim" and pid:
                await handle_claim(pid, data)
    finally:
        if pid:
            players.pop(pid, None)
            for s in regions.values():
                s.discard(pid)

app.router.add_get("/ws", ws_handler)
```

Idle checker (seconds only):
```python
IDLE_TIMEOUT = 5 * 60
async def check_idle_players():
    while True:
        await asyncio.sleep(60)
        now = time.time()
        for pid, p in list(players.items()):
            if now - p["last_update"] > IDLE_TIMEOUT:
                await p["ws"].send_json({"type": "kicked", "reason": "idle"})
                await p["ws"].close()
                players.pop(pid, None)
```
Start it in `app.on_startup` with `asyncio.create_task`.

### Message protocol (JSON, `type` field)
| Direction | type | Fields |
|---|---|---|
| C to S | `join` | `player_id`, token |
| C to S | `move` | `x`, `z`, `ry`, `anim` (max 10/s) |
| C to S | `attack` | `target_id`, `kind` (strike/heavy) |
| C to S | `dodge` | none |
| C to S | `claim` | `bundle_id` |
| S to C | `state` | nearby players and creatures (within about 300 units) |
| S to C | `hit` | `target_id`, `damage`, `hp` |
| S to C | `death` | `entity_id` |
| S to C | `bundle_spawned` / `bundle_gone` | `bundle_id`, `x`, `z` |
| S to C | `claim_result` | `ok`, `reason` |
| S to C | `kicked` | `reason` |

### Frontend
- `net.js` with `connect()`, `send(type, payload)`, `on(type, handler)`.
- Reconnect with exponential backoff (1s, 2s, 4s, up to 30s). On reconnect, send `join` again.
- Other players are interpolated (lerp) toward their last known position.
- Player never sends results ("I killed it"), only requests ("I attacked #id").

### Server work
- Move Slime AI and `resolveAttack` and `LootService` from client to server. The client only renders.
- Rooms by region: players in different regions never see each other. Crossing a boundary moves the player.
- Rate-limit every incoming message per connection.

### nginx
Proxy `/ws` with `proxy_http_version 1.1; proxy_set_header Upgrade $http_upgrade; proxy_set_header Connection "upgrade"; proxy_read_timeout 3600;`.

**Done when:** Two tabs see each other move and fight the same Slime, and a disconnect removes the player cleanly.

## Step 15: Shared Slime Rewards
**Goal:** Cooperation pays.
- Server tracks damage contributors per Slime.
- On death, every contributor above a minimum damage threshold gets full XP and its own loot roll (roll table: `min`, `max`, `weight`).
**Done when:** Two players hit one Slime and both receive XP.

## Step 16: Mobile Controls
**Goal:** Playable on a phone.
- `nipplejs` joystick for movement, on-screen buttons for attack, dodge, interact, vehicle.
- 30 fps cap, no shadows, pixel ratio 1.0, shorter render distance (about 80).
**Done when:** A phone can walk, fight, enter the car and claim loot.

## Step 17: Performance Pass
**Goal:** Low battery and CPU use.
- Adaptive render loop (render only on change), pause when the tab is hidden.
- Pixel ratio cap 1.5 desktop / 1.0 mobile, LOD on landmarks, render distance limits.
- Quality presets: Battery Saver, Balanced, Performance.
**Done when:** Battery Saver measurably lowers GPU and CPU use and idle tabs use almost none.

---

## After Step 17
Not in the prototype: Guild Halls, teleport costs, Mage, crafting, trading, chat panel, voice (use Discord voice), economy and GDP. See the spec section 20.

## Test checklist (run after Step 14)
- Two players claim the same bundle at the same time: exactly one succeeds.
- Send `death` twice: one bundle, one penalty.
- Owner disconnects: bundle remains until claimed or expired.
- Unclaimed bundle disappears after 15 minutes.
- No face visible on any character or creature.
