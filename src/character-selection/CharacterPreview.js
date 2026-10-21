import { attachPreviewControls } from './PreviewControls.js'
import { createSelectionScene } from './SelectionScene.js'

export function createCharacterPreview(container) {
  const canvas = document.createElement('canvas')
  canvas.className = 'character-selection__preview-canvas'
  canvas.setAttribute('aria-label', 'Interactive character preview')
  container.appendChild(canvas)

  const scene = createSelectionScene(canvas)
  let detachControls = null

  function showArchetype(id) {
    detachControls?.()
    const character = scene.setArchetype(id)
    detachControls = attachPreviewControls(canvas, character)
  }

  function destroy() {
    detachControls?.()
    scene.destroy()
    canvas.remove()
  }

  return { showArchetype, destroy }
}