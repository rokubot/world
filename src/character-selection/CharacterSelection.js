import { PALETTE } from '../palette.js'
import { API_BASE_URL, CONFIG } from '../config.js'
import { createArchetypeSelector } from './ArchetypeSelector.js'
import { createCharacterPreview } from './CharacterPreview.js'
import { createConfirmationDialog } from './ConfirmationDialog.js'
import { ARCHETYPE_IDS, getArchetypeDefinition } from './characterDefinitions.js'
import './CharacterSelection.css'

const PLAYER_CACHE_PREFIX = 'roku-world:savedPlayer:'
const PLAYER_CACHE_POINTER = 'roku-world:lastSavedPlayerKey'
const UNOWNED_CACHE_KEY = `${PLAYER_CACHE_PREFIX}unassigned`
const LEGACY_CACHE_KEY = 'roku-world:savedPlayer'
const memorySelections = new Map()
let memoryLastCacheKey = null

function createRevision() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function colorHex(color) {
  return `#${color.toString(16).padStart(6, '0')}`
}

function readLocalRecord(cacheKey) {
  const memorySelection = memorySelections.get(cacheKey)
  if (memorySelection) return { ...memorySelection }

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey))
    if (ARCHETYPE_IDS.has(cached?.characterId)) {
      const selection = {
        archetype: cached.characterId,
        characterName: cached.characterName,
        pendingSync: cached.pendingSync === true,
        revision: cached.revision,
        ownerPlayerId: cached.ownerPlayerId ?? null,
        createdAt: cached.createdAt,
        persistent: true,
        cacheKey
      }
      memorySelections.set(cacheKey, selection)
      return { ...selection }
    }
    if (cached) localStorage.removeItem(cacheKey)
  } catch {
    return null
  }
  return null
}

function readLocalSelection(playerId) {
  if (typeof playerId !== 'string' || !playerId.trim()) return null
  return readLocalRecord(`${PLAYER_CACHE_PREFIX}${encodeURIComponent(playerId)}`)
}

function readLastLocalSelection() {
  try {
    const cacheKey = memoryLastCacheKey ?? localStorage.getItem(PLAYER_CACHE_POINTER)
    if (cacheKey) {
      const cached = readLocalRecord(cacheKey)
      if (cached) return cached
    }

    const cachedKeys = Object.keys(localStorage)
      .filter(key => key.startsWith(PLAYER_CACHE_PREFIX))
      .sort((left, right) => {
        const leftSelection = readLocalRecord(left)
        const rightSelection = readLocalRecord(right)
        return (rightSelection?.createdAt ?? 0) - (leftSelection?.createdAt ?? 0)
      })
    for (const key of cachedKeys) {
      const cached = readLocalRecord(key)
      if (cached) return cached
    }

    const legacy = JSON.parse(localStorage.getItem(LEGACY_CACHE_KEY))
    if (ARCHETYPE_IDS.has(legacy?.characterId)) {
      return saveLocalSelection(legacy.characterId, {
        pendingSync: legacy.pendingSync === true,
        ownerPlayerId: legacy.ownerPlayerId ?? legacy.playerId ?? null,
        revision: legacy.revision ?? createRevision(),
        createdAt: legacy.createdAt ?? legacy.updatedAt ?? Date.now()
      })
    }
  } catch {
    return null
  }
  return null
}

function saveLocalSelection(archetype, {
  pendingSync = true,
  ownerPlayerId = null,
  revision = createRevision(),
  createdAt = Date.now()
} = {}) {
  const definition = getArchetypeDefinition(archetype)
  if (!definition) return null

  const selection = {
    characterId: archetype,
    characterName: definition.name,
    pendingSync,
    createdAt,
    revision,
    ownerPlayerId
  }
  const cacheKey = typeof ownerPlayerId === 'string' && ownerPlayerId.trim()
    ? `${PLAYER_CACHE_PREFIX}${encodeURIComponent(ownerPlayerId)}`
    : UNOWNED_CACHE_KEY
  const memorySelection = { ...selection, cacheKey, persistent: false }
  memorySelections.set(cacheKey, memorySelection)
  memoryLastCacheKey = cacheKey

  try {
    localStorage.setItem(cacheKey, JSON.stringify(selection))
    localStorage.setItem(PLAYER_CACHE_POINTER, cacheKey)
    localStorage.removeItem(LEGACY_CACHE_KEY)
    memorySelection.persistent = true
  } catch {
    // Keep the current selection usable if browser storage is unavailable.
  }
  return { ...memorySelection }
}

function cacheConfirmedArchetype(profile, expectedRevision = null) {
  if (profile?.archetype_confirmed !== true || !ARCHETYPE_IDS.has(profile.archetype)) return false
  const ownerPlayerId = profile.player_id
  if (typeof ownerPlayerId !== 'string' || !ownerPlayerId.trim()) return false
  const current = readLocalSelection(ownerPlayerId)
  if (expectedRevision && current?.revision !== expectedRevision) return false
  return Boolean(saveLocalSelection(profile.archetype, {
    pendingSync: false,
    ownerPlayerId,
    revision: current?.revision ?? createRevision()
  }))
}

function clearLocalSelection(ownerPlayerId, expectedRevision = null) {
  const cacheKey = typeof ownerPlayerId === 'string' && ownerPlayerId.trim()
    ? `${PLAYER_CACHE_PREFIX}${encodeURIComponent(ownerPlayerId)}`
    : UNOWNED_CACHE_KEY

  try {
    const current = readLocalRecord(cacheKey)
    if (expectedRevision && current?.revision !== expectedRevision) return
    memorySelections.delete(cacheKey)
    if (memoryLastCacheKey === cacheKey) memoryLastCacheKey = null
    localStorage.removeItem(cacheKey)
    if (localStorage.getItem(PLAYER_CACHE_POINTER) === cacheKey) {
      localStorage.removeItem(PLAYER_CACHE_POINTER)
    }
  } catch {
    // Storage is an optimization; the server remains authoritative.
  }
}

function retryBackendSync(initialSelection, initialDelay = 1000) {
  let delay = 1000

  const retry = async () => {
    const selection = initialSelection.ownerPlayerId
      ? readLocalSelection(initialSelection.ownerPlayerId)
      : readLocalRecord(UNOWNED_CACHE_KEY)
    if (!selection || selection.revision !== initialSelection.revision) return
    if (!selection.ownerPlayerId) {
      window.dispatchEvent(new CustomEvent('roku:archetype-sync-blocked', {
        detail: { reason: 'missing-owner', revision: selection.revision }
      }))
      return
    }

    let profile
    try {
      const payload = await requestPlayer('/player')
      profile = getPlayerProfile(payload)
      if (typeof profile?.player_id !== 'string' || !profile.player_id.trim()) {
        window.setTimeout(retry, delay)
        delay = Math.min(delay * 2, 30000)
        return
      }

      const currentSelection = readLocalSelection(selection.ownerPlayerId)
      if (!currentSelection || currentSelection.revision !== selection.revision) {
        if (currentSelection?.pendingSync) retryBackendSync(currentSelection, 0)
        return
      }

      if (profile.player_id !== selection.ownerPlayerId) {
        if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
          cacheConfirmedArchetype(profile)
          window.dispatchEvent(new CustomEvent('roku:archetype-synced', {
            detail: { archetype: profile.archetype, playerId: profile.player_id }
          }))
        } else {
          window.dispatchEvent(new CustomEvent('roku:archetype-sync-blocked', {
            detail: { reason: 'account-mismatch', revision: selection.revision }
          }))
        }
        return
      }
    } catch {
      window.setTimeout(retry, delay)
      delay = Math.min(delay * 2, 30000)
      return
    }

    if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
      if (!cacheConfirmedArchetype(profile, selection.revision)) return
      window.dispatchEvent(new CustomEvent('roku:archetype-synced', {
        detail: { archetype: profile.archetype, playerId: profile.player_id }
      }))
      return
    }

    const latestSelection = readLocalSelection(selection.ownerPlayerId)
    if (!latestSelection || latestSelection.revision !== selection.revision) return

    if (latestSelection.pendingSync) {
      try {
        const payload = await saveArchetype(latestSelection.archetype)
        const profile = getPlayerProfile(payload)
        if (profile?.player_id === latestSelection.ownerPlayerId
          && profile?.archetype_confirmed === true
          && ARCHETYPE_IDS.has(profile.archetype)) {
          const currentSelection = readLocalSelection(latestSelection.ownerPlayerId)
          if (currentSelection?.revision !== latestSelection.revision) {
            if (currentSelection?.pendingSync) retryBackendSync(currentSelection, 0)
            return
          }
          if (cacheConfirmedArchetype(profile, latestSelection.revision)) {
            window.dispatchEvent(new CustomEvent('roku:archetype-synced', {
              detail: { archetype: profile.archetype, playerId: profile.player_id }
            }))
          }
          return
        }
      } catch {
        // Continue retrying while this exact account-owned revision is pending.
      }
    }

    window.setTimeout(retry, delay)
    delay = Math.min(delay * 2, 30000)
  }

  if (initialSelection.ownerPlayerId) window.setTimeout(retry, initialDelay)
}

function injectPaletteVariables() {
  if (document.getElementById('character-selection-palette')) return
  const style = document.createElement('style')
  style.id = 'character-selection-palette'
  style.textContent = `
    :root {
      --selection-text: ${colorHex(PALETTE.white.base)};
      --selection-muted: ${colorHex(PALETTE.slate.light)};
      --selection-gold: ${colorHex(PALETTE.gold.base)};
      --selection-error: ${colorHex(PALETTE.red.light)};
      --selection-backdrop: ${colorHex(PALETTE.deepShadow)};
      --selection-glow: ${colorHex(PALETTE.dark.base)};
      --selection-surface: ${colorHex(PALETTE.deepShadow)};
      --selection-preview: ${colorHex(PALETTE.dark.shadow)};
      --selection-card: ${colorHex(PALETTE.dark.base)};
      --selection-card-active: ${colorHex(PALETTE.dark.light)};
      --selection-border: ${colorHex(PALETTE.dark.light)};
    }
  `
  document.head.appendChild(style)
}

async function requestPlayer(path, options = {}) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), CONFIG.api.requestTimeoutMs)

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      signal: controller.signal
    })
    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(payload?.error || `Player service returned ${response.status}.`)
    }
    if (payload?.ok === false) throw new Error(payload.error || 'The player service rejected the request.')
    return payload
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Player service request timed out.')
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }
}

function getPlayerProfile(payload) {
  return payload?.player ?? payload
}

function saveArchetype(archetype) {
  return requestPlayer('/player/archetype', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archetype })
  })
}

export async function initCharacterSelect() {
  let authenticatedPlayerId = null
  let profileError = null

  try {
    const payload = await requestPlayer('/player')
    const profile = getPlayerProfile(payload)
    authenticatedPlayerId = typeof profile?.player_id === 'string' && profile.player_id.trim()
      ? profile.player_id
      : null

    const cachedSelection = readLocalSelection(authenticatedPlayerId)
    if (cachedSelection?.pendingSync) {
      retryBackendSync(cachedSelection, 0)
      return {
        archetype: cachedSelection.archetype,
        syncState: cachedSelection.persistent ? 'pending-sync' : 'session-only'
      }
    }

    if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
      cacheConfirmedArchetype(profile)
      return { archetype: profile.archetype, syncState: 'server-confirmed' }
    }

    if (cachedSelection) clearLocalSelection(authenticatedPlayerId, cachedSelection.revision)
  } catch (error) {
    profileError = error
    const cachedSelection = readLastLocalSelection()
    if (cachedSelection) {
      if (cachedSelection.ownerPlayerId) retryBackendSync(cachedSelection, 0)
      return {
        archetype: cachedSelection.archetype,
        syncState: cachedSelection.pendingSync
          ? cachedSelection.ownerPlayerId
            ? cachedSelection.persistent ? 'pending-sync' : 'session-only'
            : 'account-unverified'
          : 'offline-cache'
      }
    }
  }

  injectPaletteVariables()

  return new Promise(resolve => {
    const overlay = document.createElement('main')
    overlay.className = 'character-selection'
    overlay.setAttribute('aria-labelledby', 'character-selection-title')

    const shell = document.createElement('section')
    shell.className = 'character-selection__shell'

    const header = document.createElement('header')
    header.className = 'character-selection__header'
    const eyebrow = document.createElement('p')
    eyebrow.className = 'character-selection__eyebrow'
    eyebrow.textContent = 'Roku World / Archetype'
    const title = document.createElement('h1')
    title.id = 'character-selection-title'
    title.textContent = 'Choose your path'
    const subtitle = document.createElement('p')
    subtitle.textContent = 'Review both archetypes. Your confirmed choice is permanent.'
    header.append(eyebrow, title, subtitle)

    const content = document.createElement('div')
    content.className = 'character-selection__content'
    const previewPanel = document.createElement('section')
    previewPanel.className = 'character-selection__preview'
    previewPanel.setAttribute('aria-label', 'Character preview')
    const previewCanvasHost = document.createElement('div')
    previewCanvasHost.className = 'character-selection__preview-canvas-host'
    previewPanel.appendChild(previewCanvasHost)
    const previewCaption = document.createElement('div')
    previewCaption.className = 'character-selection__preview-caption'
    const previewName = document.createElement('span')
    previewName.className = 'character-selection__preview-name'
    const previewRole = document.createElement('span')
    previewRole.className = 'character-selection__preview-role'
    previewCaption.append(previewName, previewRole)
    previewPanel.appendChild(previewCaption)

    const choicePanel = document.createElement('section')
    const status = document.createElement('p')
    status.className = 'character-selection__status'
    status.setAttribute('role', 'status')
    status.setAttribute('aria-live', 'polite')
    const retry = document.createElement('button')
    retry.type = 'button'
    retry.className = 'character-selection__retry'
    retry.textContent = 'Retry player connection'
    retry.hidden = true
    choicePanel.appendChild(status)

    const characterPreview = createCharacterPreview(previewCanvasHost)
    let previewedArchetype = null

    function previewArchetype(id) {
      if (previewedArchetype === id) return
      const definition = getArchetypeDefinition(id)
      if (!definition) return
      previewedArchetype = id
      characterPreview.showArchetype(id)
      selector.setPreviewed(id)
      previewName.textContent = definition.name
      previewRole.textContent = definition.title
    }

    const selector = createArchetypeSelector({
      onSelect: id => confirmation.open(id),
      onPreview: previewArchetype
    })
    choicePanel.append(selector.element, retry)
    content.append(previewPanel, choicePanel)
    shell.append(header, content)
    overlay.appendChild(shell)

    const confirmation = createConfirmationDialog(async id => {
      previewArchetype(id)
      confirmation.setBusy(true)
      status.classList.remove('is-error')
      const localSelection = saveLocalSelection(id, {
        pendingSync: true,
        ownerPlayerId: authenticatedPlayerId
      })
      if (authenticatedPlayerId) {
        status.textContent = localSelection.persistent
          ? 'Saved on this device. Synchronizing your permanent choice...'
          : 'Selected for this session. Browser storage is unavailable; synchronizing your permanent choice...'
        retryBackendSync(localSelection, 0)
      } else {
        status.textContent = localSelection.persistent
          ? 'Saved on this device. Account identity is unavailable, so synchronization is paused.'
          : 'Selected for this session. Storage and account identity are unavailable, so synchronization is paused.'
      }
      confirmation.close()
      characterPreview.destroy()
      overlay.remove()
      resolve({
        archetype: id,
        syncState: authenticatedPlayerId
          ? localSelection.persistent ? 'pending-sync' : 'session-only'
          : 'account-unverified'
      })
    })
    overlay.appendChild(confirmation.element)

    retry.addEventListener('click', async () => {
      retry.disabled = true
      status.classList.remove('is-error')
      status.textContent = 'Checking your player account...'
      try {
        const payload = await requestPlayer('/player')
        const profile = getPlayerProfile(payload)
        authenticatedPlayerId = typeof profile?.player_id === 'string' && profile.player_id.trim()
          ? profile.player_id
          : null
        if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
          cacheConfirmedArchetype(profile)
          characterPreview.destroy()
          overlay.remove()
          resolve({ archetype: profile.archetype, syncState: 'server-confirmed' })
          return
        }
        if (!authenticatedPlayerId) {
          throw new Error('The player profile did not include an account ID.')
        }
        status.textContent = 'Choose an archetype to continue.'
        retry.hidden = true
      } catch (error) {
        status.classList.add('is-error')
        status.textContent = error.message
      } finally {
        retry.disabled = false
      }
    })

    if (profileError) {
      status.classList.add('is-error')
      status.textContent = `Player service unavailable: ${profileError.message}. Your choice will be saved locally and synchronized when available.`
      retry.hidden = false
    } else {
      status.textContent = 'Choose an archetype to continue.'
    }

    document.body.appendChild(overlay)
    previewArchetype('warrior')
  })
}