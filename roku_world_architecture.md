# Roku World — Architecture Document
**Version:** 1.2  
**Date:** 2026-10-19  
**Status:** Active — hand this to any AI session working on this project

---

## 0. Read this first

This document is the single source of truth for the Roku World game architecture. Before writing any code, read the entire document. Do not invent architecture that contradicts it.

**Repo:** https://github.com/rokubot/world  
**Backend repo:** https://github.com/rokubot/website-backend  
**Stack:** Three.js r160 + Vite (JavaScript, no TypeScript) — frontend. Python aiohttp — backend.  
**No Socket.io anywhere.** No `python-socketio`, no `socket.io-client`.

---

## 1. What Roku World is

A browser-based 3D multiplayer exploration and combat game built on a real-world map. Discord communities become Guilds with Guild Halls placed at real geographic coordinates. Players explore the world, fight creatures, complete missions, and rank up.

**Halal design rules (mandatory, non-negotiable):**
- No visible eyes, nose or mouth on any character, NPC or creature. Eyewear and visors are allowed as accessories.
- No gambling, alcohol, pigs or dogs as enemies.
- Magic is allowed only as non-sihr mechanical mana (no divine framing, no occult).
- No divine beings or gods in the game world.
- Scholar review required before launch.

---

## 2. World model: base ground, settlements, roads, travel

The world is built settlement by settlement. The client only loads what is near the player. There is no "load the whole world" moment.

### 2.1 Prototype state

Only one settlement exists: **Plana, Bulgaria**. The game starts and stays there until more are built. No world map, roads or teleport are needed yet, but the data model below is designed so they can be added without rework.

### 2.2 The four pieces

| Piece | What it is | Loading |
|---|---|---|
| **Base ground** | Old Natural Earth country meshes (one mesh per country, flat toon, no detail). Stops players driving through a void between settlements. | Always loaded, frustum-culled per country. Cheap. |
| **Settlements** | Villages and cities. A city is the same kind of thing as a village, just bigger. Every real-world city uses the same template (streets, Guild Hall, receptionist, missions) plus its own flavour and landmark. | Streamed in when the player is within range, unloaded when far. |
| **Roads** | Connect settlements. Required for open travel. | Road segments near the player stream in with the settlement data. |
| **Travel** | Open travel on roads, plus teleport between unlocked settlements. | See 2.4. |

Settlements are generated gradually, layer by layer. Unbuilt places simply show base ground.

### 2.3 Roads

- Each settlement has one or more **gates** (road entry points).
- A **road** is a polyline between two gates, stored as data (list of lng/lat points), not as a hand-built scene.
- Road meshes are generated on the client from the polyline (flat strip, toon material, no outline) and only for segments within load range of the player.
- Source of geometry: start with simple generated roads (straight or lightly curved between gates). Later, replace with real road geometry from OSM or Natural Earth roads, per region, without changing the data model.
- Vehicles (car) are intended for roads. Walking is allowed off-road. Whether cars may leave roads is **provisional**: default is slower and handled by the vehicle code, not blocked.
- Roads exist only between settlements that are built. Unbuilt destinations have no road.

### 2.4 Travel

**Open travel:** players can always walk or drive between nearby settlements along roads, meeting creatures and loot on the way.

**Teleport (fast travel):**
- Only to settlements the player has already **visited/unlocked**.
- **Costs both a cooldown and money.** Both are required, not either/or.
- Cost scales with distance (provisional). Exact numbers live in `config.js` / server config, never inline.
- Cooldown and payment are enforced **server-side**. The client only requests; the server validates unlock, cooldown, balance, then moves the player.
- Teleport is blocked while in combat (provisional).
- The teleport destination picker is a **2D map UI overlay**, not a loaded 3D world.

### 2.5 Streaming

```
Player position (real-world coords)
        |
        v
Backend: GET /api/nearby?lat=..&lng=..&radius=..
        |  returns settlements + road segments within range
        v
Client loads those scenes and road segments
        |
        v
Client unloads anything that left range
```

**SCALE = 80** (`x = lng * 80`, `z = -lat * 80`) is the projection used for placing everything on one shared coordinate plane.

### 2.6 Open items

- Teleport cost formula and cooldown length.
- Whether cars can leave roads.
- Road data source beyond the first generated roads.
- Settlement template: exact shared structure for cities vs villages.

---

## 3. Current game flow (onboarding)

```
1. Player opens the game in browser
       ↓
2. Character selection screen (src/character-selection/)
   - Warrior (Augmenter) — melee, mana-enhanced body, sword
   - Mage (Conjurer) — ranged spells, staff
   - Choice is permanent. Server saves to Postgres.
   - Returning players skip this screen.
       ↓
3. Spawn in Plana village (Layer 1)
   - On-screen control hints fade after 10 seconds (no NPC tutorial)
   - WASD move, Shift sprint, C camera, E interact
       ↓
4. Walk to Guild Hall (visible from spawn, short forest path)
       ↓
5. Press E at Guild Hall → Receptionist NPC (faceless)
   - Welcomes player, explains Guild
   - Assigns Mission 001: "Triple Pine"
       ↓
6. Mission 001 — Triple Pine
   - Walk to Triple Pine forest zone (marked, edge of village)
   - Fight Slimes inside (faceless creatures)
   - Find discovery loot pile at the centre
   - Return to Receptionist
   - Reward: XP + coins
       ↓
7. World gate unlocks
   - Player walks through the village gate
   - Layer 1 unloads, Layer 2 loads
   - Player appears at Plana's real-world coordinates on the world map
   - (lat 42.28, lng 23.56 — near Sofia, Bulgaria)
```

---

## 4. Repo structure

### Frontend (`rokubot/world`)

```
src/
  main.js                          ← game entry point
  palette.js                       ← all colours defined here, nowhere else
  materials.js                     ← getToonMaterial(), addOutline()
  config.js                        ← all tunable numbers (speeds, distances, timers)
  
  character-selection/             ← NEW (not built yet)
    CharacterSelection.js          ← entry, state machine
    SelectionScene.js              ← isolated Three.js scene for the selection
    CharacterPreview.js            ← 3D model display, animations
    PreviewControls.js             ← mouse/touch drag rotation
    ArchetypeSelector.js           ← Warrior/Mage cards
    ConfirmationDialog.js          ← permanent-choice warning
    characterDefinitions.js        ← archetype data (no GLB, procedural only)

  village/                         ← NEW (not built yet)
    VillageScene.js                ← Plana village, Layer 1
    GuildHall.js                   ← interior, Receptionist NPC
    TuplePineForest.js             ← Triple Pine zone, Slimes, loot pile
    missions/
      mission001.js                ← Triple Pine mission logic

  world/
    terrain.js                     ← GeoJSON → ExtrudeGeometry, SCALE = 80
    ocean.js                       ← flat toon ocean plane
    landmarks/
      burjKhalifa.js               ← Dubai landmark (Step 8)

  player/
    character.js                   ← createCharacter(), createWarrior(), createMage()
    animation.js                   ← procedural limb animation
    controls.js                    ← WASD, Shift, C, E, F, Q

  camera/
    camera.js                      ← third person, top-down, first person

  vehicles/
    vehicle.js                     ← car, motorcycle, bicycle

  combat/                          ← NEW (not built yet)
    warrior.js                     ← Strike, Heavy Strike, Dodge
    mage.js                        ← Energy Bolt, Wind Push, Ember Burst (after scholar review)
    resolveAttack.js               ← server-authoritative combat function

  creatures/                       ← NEW (not built yet)
    slime.js                       ← faceless, wander/chase/attack AI

  loot/                            ← NEW (not built yet)
    LootService.js                 ← bundles, atomic claim, expiry

  net/                             ← NEW (not built yet)
    net.js                         ← WebSocket client, reconnect with backoff

public/
  assets/
    world.geojson                  ← Natural Earth 1:50m
index.html
vite.config.js
```

### Backend (`rokubot/website-backend`)

```
Port 8991. Python aiohttp. Systemd service behind nginx.
Do NOT touch the Discord bot's aiohttp server on port 5300.

routes/
  player.py          ← GET /api/player, POST /api/player/archetype
  ws.py              ← GET /ws  (raw aiohttp WebSocket, NOT Socket.io)
  region.py          ← GET /api/region/:id  (Layer 3, not built yet)

db/
  postgres.py        ← asyncpg connection pool
  schema.sql         ← table definitions

config.py            ← port, DB URL, secrets
```

---

## 5. Database (PostgreSQL + asyncpg)

```sql
-- Player identity and archetype
CREATE TABLE IF NOT EXISTS players (
  player_id          TEXT PRIMARY KEY,   -- Discord user ID or session ID
  archetype          TEXT CHECK (archetype IN ('warrior', 'mage')),
  archetype_confirmed BOOLEAN DEFAULT FALSE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Player game state
CREATE TABLE IF NOT EXISTS player_state (
  player_id   TEXT PRIMARY KEY REFERENCES players(player_id),
  xp          INTEGER DEFAULT 0,
  level       INTEGER DEFAULT 1,
  currency    INTEGER DEFAULT 0,
  pos_x       FLOAT DEFAULT 0,
  pos_z       FLOAT DEFAULT 0,
  region      TEXT DEFAULT 'village',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Mission progress
CREATE TABLE IF NOT EXISTS mission_progress (
  player_id   TEXT REFERENCES players(player_id),
  mission_id  TEXT,
  status      TEXT CHECK (status IN ('active', 'completed')),
  data        JSONB DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (player_id, mission_id)
);

-- Layer 3: geo tiles (PostGIS, add later)
-- CREATE TABLE IF NOT EXISTS geo_tiles (
--   tile_id   TEXT PRIMARY KEY,
--   bbox      GEOMETRY(Polygon, 4326),
--   data      JSONB
-- );
-- CREATE INDEX ON geo_tiles USING GIST (bbox);
```

---

## 6. WebSocket protocol (aiohttp, raw JSON)

Endpoint: `wss://api.rokubot.com/ws`  
**No Socket.io. No python-socketio. Raw aiohttp WebSocket.**

```python
# Minimal server skeleton
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
                pid = data["player_id"]
                # auth check here
                players[pid] = {"ws": ws, "last_update": time.time(), ...}
                await ws.send_json({"type": "joined", "player_id": pid})
            elif t == "move" and pid:
                handle_move(pid, data)
            elif t == "attack" and pid:
                await handle_attack(pid, data)
            elif t == "claim" and pid:
                await handle_claim(pid, data)
    finally:
        if pid:
            players.pop(pid, None)
```

### Message table

| Direction | type | Key fields |
|---|---|---|
| C→S | `join` | `player_id`, token |
| C→S | `move` | `x`, `z`, `ry`, `anim` (max 10/s) |
| C→S | `attack` | `target_id`, `kind` |
| C→S | `dodge` | — |
| C→S | `claim` | `bundle_id` |
| S→C | `state` | nearby players and creatures (within ~300 units) |
| S→C | `hit` | `target_id`, `damage`, `hp` |
| S→C | `death` | `entity_id` |
| S→C | `bundle_spawned` | `bundle_id`, `x`, `z` |
| S→C | `bundle_gone` | `bundle_id` |
| S→C | `claim_result` | `ok`, `reason` |
| S→C | `kicked` | `reason` |

Client reconnect: exponential backoff (1s → 2s → 4s → … → 30s cap). On reconnect send `join` again.

---

## 7. Visual style

- **Anime-like low-poly cel shading.**
- `MeshToonMaterial` on all characters, vehicles, creatures, landmarks.
- One shared 3-step gradient map (`DataTexture`, `NearestFilter`). Reused everywhere.
- Inverted-hull outlines (back-face copy, black) on characters, vehicles, creatures, landmarks. Not on terrain or water.
- All colours defined in `palette.js` only. No inline hex values anywhere else.
- Gradient sky (deep blue top, lighter horizon). Soft low-poly clouds.
- Light fog matching horizon colour.

---

## 8. Character rules

- **No visible eyes, nose or mouth** on any character, NPC or creature.
- Eyewear (sunglasses, visors, goggles) is allowed as an accessory. No eye shapes drawn on or behind the lenses.
- Characters are built from `BoxGeometry` and `CylinderGeometry`. No GLB imports.
- Identity comes from silhouette, hair, outfit, accessories.
- Warrior: sword (thin BoxGeometry at right hand), battle-ready armour silhouette.
- Mage: staff (CylinderGeometry at right hand), robes silhouette.

---

## 9. Progression

- XP formula: `XP(n) = 5n² + 50n + 100` to reach the next level.
- Cumulative Slime kills to level up: 16 / 38 / 67 / 105.
- Slime XP: 10.
- Ranks: F → E → D → C → B → A → S.
- Everyone starts at F-rank regardless of archetype.
- All level data kept as a data table in `config.js`, never inline.

---

## 10. Death and loot

- On death: keep XP, gear and mission progress.
- Drop 30–50% of unequipped item stacks + 5% currency (capped at 50 coins) into a **loot bundle** at the death position.
- Bundle lifetime: 15 minutes (provisional).
- Bundle visible only to nearby players. Anyone can claim it.
- Claim is **atomic** — one lock per bundle, first claim wins, duplicate requests rejected.
- Duplicate death events are idempotent — one bundle, one penalty.
- Respawn at Guild Hall medical room (fixed spawn point until Guild system is built).

---

## 11. Build order (current progress)

| Step | Task | Status |
|---|---|---|
| 1 | Terrain | ✅ Done |
| 2 | Coordinate markers | ✅ Done |
| 3 | Character | ✅ Done (eyewear present, no eyes/nose/mouth) |
| 4 | Animation | ✅ Done |
| 5 | Controls and camera | ✅ Done |
| 6 | Car driving behaviour | ✅ Mesh done, behaviour to verify |
| 7 | Toon material and outlines | 🔲 Next |
| 8 | Character selection screen | 🔲 Next |
| 9 | Village scene (Plana) | 🔲 |
| 10 | Guild Hall + Receptionist | 🔲 |
| 11 | Mission 001 — Triple Pine | 🔲 |
| 12 | Burj Khalifa landmark | 🔲 |
| 13 | Slime creature (faceless AI) | 🔲 |
| 14 | Warrior combat | 🔲 |
| 15 | XP and level table | 🔲 |
| 16 | Death, respawn, loot bundle | 🔲 |
| 17 | Discovery loot pile | 🔲 |
| 18 | Multiplayer (WebSocket) | 🔲 |
| 19 | Shared creature rewards | 🔲 |
| 20 | Mobile controls | 🔲 |
| 21 | Performance pass | 🔲 |
| 22 | World scale (SCALE 3 → 80) | 🔲 |
| 23 | Village gate → world map transition | 🔲 |
| 24 | Layer 3 region tiles (on-demand OSM) | 🔲 Post-prototype |

---

## 12. Infrastructure

- **VPS:** 3.8 GB RAM, ~2.1 GB available. nginx + systemd.
- **Frontend:** Vite build served by nginx at `world.rokubot.com`.
- **Backend:** aiohttp service on port 8991, nginx reverse proxy at `api.rokubot.com`.
- **Database:** PostgreSQL + asyncpg. PostGIS extension for Layer 3 (add later).
- **No Vercel.** No Railway. No Node.js backend.
- nginx WebSocket config for `/ws`:
  ```nginx
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  proxy_read_timeout 3600;
  ```

---

## 13. Out of scope (post-prototype)

- Guild creation, Guild Halls, Guild economics
- Teleport system and teleport costs
- Mage archetype combat (after scholar halal review)
- Layer 3 region/city detail
- Trading, crafting, economy
- Vehicle physics beyond basic movement
- Chat panel (use Discord voice channels for now)
- Anti-cheat beyond server authority
- Custom character appearance
- Mobile: motorcycle and bicycle (car only in prototype)

---

## 14. Revision log

| Version | Change |
|---|---|
| 1.0 | Initial architecture doc. Three-layer rendering, Plana village start, Postgres, aiohttp WebSocket, onboarding flow, build order. |
| 1.1 | Replaced "load world map on exit" with village-by-village on-demand model. Backend detail moved to roku_world_backend.md. |
| 1.2 | World model: old world map kept as cheap base ground; settlements (villages and cities share a template) stream in; road networks required for open travel; teleport costs cooldown AND money, server-enforced. |
