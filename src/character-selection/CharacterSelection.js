import { PALETTE } from '../palette.js'
import { API_BASE_URL } from '../config.js'
import { createArchetypeSelector } from './ArchetypeSelector.js'
import { createCharacterPreview } from './CharacterPreview.js'
import { createConfirmationDialog } from './ConfirmationDialog.js'
import { ARCHETYPE_IDS, getArchetypeDefinition } from './characterDefinitions.js'
import './CharacterSelection.css'

const PLAYER_CACHE_KEY = 'roku-world:savedPlayer'

function createRevision() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function colorHex(color) {
  return `#${color.toString(16).padStart(6, '0')}`
}

function readLocalSelection() {
  try {
    const cached = JSON.parse(localStorage.getItem(PLAYER_CACHE_KEY))
    if (ARCHETYPE_IDS.has(cached?.characterId)) {
      return {
        archetype: cached.characterId,
        characterName: cached.characterName,
        pendingSync: cached.pendingSync === true,
        revision: cached.revision,
        playerId: cached.playerId ?? null
      }
    }
    localStorage.removeItem(PLAYER_CACHE_KEY)
  } catch {
    return null
  }
  return null
}

function saveLocalSelection(archetype, { pendingSync = true, playerId = null, revision = createRevision() } = {}) {
  const definition = getArchetypeDefinition(archetype)
  if (!definition) return null

  const selection = {
    characterId: archetype,
    characterName: definition.name,
    pendingSync,
    updatedAt: Date.now(),
    revision,
    playerId
  }

  try {
    localStorage.setItem(PLAYER_CACHE_KEY, JSON.stringify(selection))
  } catch {
    // Keep the current selection usable if browser storage is unavailable.
  }
  return selection
}

function cacheConfirmedArchetype(profile, expectedRevision = null) {
  if (profile?.archetype_confirmed !== true || !ARCHETYPE_IDS.has(profile.archetype)) return false
  const current = readLocalSelection()
  if (expectedRevision && current?.revision !== expectedRevision) return false
  return Boolean(saveLocalSelection(profile.archetype, {
    pendingSync: false,
    playerId: profile.player_id ?? current?.playerId ?? null,
    revision: current?.revision ?? createRevision()
  }))
}

function clearLocalSelection() {
  try {
    localStorage.removeItem(PLAYER_CACHE_KEY)
  } catch {
    // Storage is an optimization; the server remains authoritative.
  }
}

function retryBackendSync(revision, initialDelay = 1000) {
  let delay = 1000

  const retry = async () => {
    const selection = readLocalSelection()
    if (!selection || selection.revision !== revision) return

    let profileReadSucceeded = false
    try {
      const payload = await requestPlayer('/player')
      const profile = getPlayerProfile(payload)
      profileReadSucceeded = true
      if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
        cacheConfirmedArchetype(profile)
        window.dispatchEvent(new CustomEvent('roku:archetype-synced', { detail: { archetype: profile.archetype } }))
        return
      }
    } catch {
      // Try the pending selection below if this profile read failed.
    }

    const latestSelection = readLocalSelection()
    if (!latestSelection || latestSelection.revision !== revision) return

    if (profileReadSucceeded && !latestSelection.pendingSync) {
      clearLocalSelection()
      window.dispatchEvent(new Event('roku:archetype-invalidated'))
      return
    }

    if (latestSelection.pendingSync) {
      try {
        const payload = await saveArchetype(latestSelection.archetype)
        const profile = getPlayerProfile(payload)
        if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
          if (profile.archetype === latestSelection.archetype) {
            cacheConfirmedArchetype(profile, revision)
          } else {
            cacheConfirmedArchetype(profile)
          }
          window.dispatchEvent(new CustomEvent('roku:archetype-synced', { detail: { archetype: profile.archetype } }))
          return
        }
      } catch {
        // Continue retrying while this exact local revision is pending.
      }
    }

    window.setTimeout(retry, delay)
    delay = Math.min(delay * 2, 30000)
  }

  window.setTimeout(retry, initialDelay)
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.error || `Player service returned ${response.status}.`)
  }
  if (payload?.ok === false) throw new Error(payload.error || 'The player service rejected the request.')
  return payload
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
  const cachedSelection = readLocalSelection()
  if (cachedSelection) {
    retryBackendSync(cachedSelection.revision, 0)
    return {
      archetype: cachedSelection.archetype,
      syncState: cachedSelection.pendingSync ? 'pending-sync' : 'offline-cache'
    }
  }

  let profileError = null

  try {
    const payload = await requestPlayer('/player')
    const profile = getPlayerProfile(payload)
    if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
      cacheConfirmedArchetype(profile)
      return { archetype: profile.archetype, syncState: 'server-confirmed' }
    }
  } catch (error) {
    profileError = error
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
      status.textContent = 'Saved locally. Synchronizing your permanent choice...'
      const localSelection = saveLocalSelection(id, { pendingSync: true })
      retryBackendSync(localSelection.revision, 0)
      confirmation.close()
      characterPreview.destroy()
      overlay.remove()
      resolve({ archetype: id, syncState: 'pending-sync' })
    })
    overlay.appendChild(confirmation.element)

    retry.addEventListener('click', async () => {
      retry.disabled = true
      status.classList.remove('is-error')
      status.textContent = 'Checking your player account...'
      try {
        const payload = await requestPlayer('/player')
        const profile = getPlayerProfile(payload)
        if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
          cacheConfirmedArchetype(profile)
          characterPreview.destroy()
          overlay.remove()
          resolve({ archetype: profile.archetype, syncState: 'server-confirmed' })
          return
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