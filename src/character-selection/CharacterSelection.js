import { PALETTE } from '../palette.js'
import { API_BASE_URL } from '../config.js'
import { createArchetypeSelector } from './ArchetypeSelector.js'
import { createCharacterPreview } from './CharacterPreview.js'
import { createConfirmationDialog } from './ConfirmationDialog.js'
import { ARCHETYPE_IDS, getArchetypeDefinition } from './characterDefinitions.js'
import './CharacterSelection.css'

function colorHex(color) {
  return `#${color.toString(16).padStart(6, '0')}`
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

export async function initCharacterSelect() {
  let profile = null
  let profileError = null

  try {
    const payload = await requestPlayer('/player')
    profile = getPlayerProfile(payload)
    if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
      return profile.archetype
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
      confirmation.setBusy(true)
      status.classList.remove('is-error')
      status.textContent = 'Saving your permanent archetype choice...'
      try {
        const payload = await requestPlayer('/player/archetype', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ archetype: id })
        })
        const savedProfile = getPlayerProfile(payload)
        if (savedProfile?.archetype !== id || savedProfile?.archetype_confirmed !== true) {
          throw new Error('The player service did not confirm your archetype as permanently saved.')
        }

        const selectedArchetype = id
        confirmation.close()
        characterPreview.destroy()
        overlay.remove()
        resolve(selectedArchetype)
      } catch (error) {
        status.classList.add('is-error')
        status.textContent = error.message
        confirmation.setBusy(false)
      }
    })
    overlay.appendChild(confirmation.element)

    retry.addEventListener('click', async () => {
      retry.disabled = true
      status.classList.remove('is-error')
      status.textContent = 'Checking your player account...'
      try {
        const payload = await requestPlayer('/player')
        profile = getPlayerProfile(payload)
        if (profile?.archetype_confirmed === true && ARCHETYPE_IDS.has(profile.archetype)) {
          characterPreview.destroy()
          overlay.remove()
          resolve(profile.archetype)
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
      status.textContent = `Could not load your saved archetype: ${profileError.message}`
      retry.hidden = false
    } else {
      status.textContent = 'Choose an archetype to continue.'
    }

    document.body.appendChild(overlay)
    previewArchetype('warrior')
  })
}