import { getArchetypeDefinition } from './characterDefinitions.js'

export function createConfirmationDialog(onConfirm) {
  const dialog = document.createElement('dialog')
  dialog.className = 'character-selection__confirmation'
  dialog.setAttribute('aria-labelledby', 'character-confirmation-title')

  const title = document.createElement('h2')
  title.id = 'character-confirmation-title'
  title.textContent = 'Confirm your archetype'

  const message = document.createElement('p')
  const actions = document.createElement('div')
  actions.className = 'character-selection__confirmation-actions'

  const cancel = document.createElement('button')
  cancel.type = 'button'
  cancel.className = 'character-selection__cancel'
  cancel.textContent = 'Go back'
  cancel.addEventListener('click', () => dialog.close())

  const confirm = document.createElement('button')
  confirm.type = 'button'
  confirm.className = 'character-selection__confirm'
  confirm.textContent = 'Confirm permanently'
  confirm.addEventListener('click', () => {
    if (dialog.dataset.archetype) onConfirm(dialog.dataset.archetype)
  })

  actions.append(cancel, confirm)
  dialog.append(title, message, actions)

  function open(id) {
    const archetype = getArchetypeDefinition(id)
    if (!archetype) return
    dialog.dataset.archetype = id
    message.textContent = `Your ${archetype.name} choice is permanent and will be saved to your player account.`
    dialog.showModal()
  }

  function setBusy(busy) {
    cancel.disabled = busy
    confirm.disabled = busy
    confirm.textContent = busy ? 'Saving choice...' : 'Confirm permanently'
  }

  return {
    element: dialog,
    open,
    close: () => dialog.close(),
    setBusy
  }
}