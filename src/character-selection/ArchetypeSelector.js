import { ARCHETYPE_DEFINITIONS } from './characterDefinitions.js'

export function createArchetypeSelector({ onSelect, onPreview }) {
  const element = document.createElement('div')
  element.className = 'character-selection__choices'
  element.setAttribute('aria-label', 'Choose an archetype')

  const buttons = new Map()

  for (const archetype of ARCHETYPE_DEFINITIONS) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'character-selection__choice'
    button.setAttribute('aria-pressed', 'false')

    const title = document.createElement('span')
    title.className = 'character-selection__choice-name'
    title.textContent = archetype.name

    const role = document.createElement('span')
    role.className = 'character-selection__choice-role'
    role.textContent = archetype.title

    const description = document.createElement('span')
    description.className = 'character-selection__choice-description'
    description.textContent = archetype.description

    const action = document.createElement('span')
    action.className = 'character-selection__choice-action'
    action.textContent = 'Choose class'

    button.append(title, role, description, action)
    button.addEventListener('pointerenter', () => onPreview(archetype.id))
    button.addEventListener('focus', () => onPreview(archetype.id))
    button.addEventListener('click', () => onSelect(archetype.id))
    element.appendChild(button)
    buttons.set(archetype.id, button)
  }

  function setPreviewed(id) {
    buttons.forEach((button, buttonId) => {
      const active = buttonId === id
      button.classList.toggle('is-previewed', active)
      button.setAttribute('aria-pressed', String(active))
    })
  }

  return { element, setPreviewed }
}