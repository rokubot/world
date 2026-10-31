export function attachPreviewControls(element, character) {
  let pointerId = null
  let lastX = 0
  let lastY = 0

  const onPointerDown = event => {
    pointerId = event.pointerId
    lastX = event.clientX
    lastY = event.clientY
    element.setPointerCapture(pointerId)
  }

  const onPointerMove = event => {
    if (event.pointerId !== pointerId) return
    character.rotation.y += (event.clientX - lastX) * 0.01
    character.rotation.x = Math.max(-0.18, Math.min(0.18, character.rotation.x + (event.clientY - lastY) * 0.004))
    lastX = event.clientX
    lastY = event.clientY
  }

  const stopDragging = event => {
    if (event.pointerId !== pointerId) return
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId)
    pointerId = null
  }

  element.addEventListener('pointerdown', onPointerDown)
  element.addEventListener('pointermove', onPointerMove)
  element.addEventListener('pointerup', stopDragging)
  element.addEventListener('pointercancel', stopDragging)

  return () => {
    element.removeEventListener('pointerdown', onPointerDown)
    element.removeEventListener('pointermove', onPointerMove)
    element.removeEventListener('pointerup', stopDragging)
    element.removeEventListener('pointercancel', stopDragging)
  }
}