const WALK_CYCLE = 6
const SPRINT_CYCLE = 10

export function animateCharacter(parts, state, t) {
  const { leftArmGroup, rightArmGroup, leftLegGroup, rightLegGroup, torso } = parts

  // Preserve the character's scene placement while applying animation offsets.
  if (parts.animationBaseY === undefined) {
    parts.animationBaseY = parts.group.position.y
  }
  if (parts.animationTorsoY === undefined) {
    parts.animationTorsoY = torso.position.y
  }

  const resetPose = () => {
    leftArmGroup.rotation.x = 0
    rightArmGroup.rotation.x = 0
    leftLegGroup.rotation.x = 0
    rightLegGroup.rotation.x = 0
    parts.group.rotation.x = 0
    parts.group.position.y = parts.animationBaseY
    torso.position.y = parts.animationTorsoY
  }

  if (state === 'idle') {
    resetPose()
    torso.position.y = parts.animationTorsoY + Math.sin(t * 1.5) * 0.02
    return
  }

  if (state === 'walk') {
    const swing = Math.sin(t * WALK_CYCLE) * 0.5
    leftArmGroup.rotation.x = swing
    rightArmGroup.rotation.x = -swing
    leftLegGroup.rotation.x = -swing * 0.7
    rightLegGroup.rotation.x = swing * 0.7
    parts.group.position.y = parts.animationBaseY + Math.abs(Math.sin(t * WALK_CYCLE)) * 0.04
    parts.group.rotation.x = 0
    torso.position.y = parts.animationTorsoY
    return
  }

  if (state === 'sprint') {
    const swing = Math.sin(t * SPRINT_CYCLE) * 0.7
    leftArmGroup.rotation.x = swing
    rightArmGroup.rotation.x = -swing
    leftLegGroup.rotation.x = -swing * 0.8
    rightLegGroup.rotation.x = swing * 0.8
    parts.group.position.y = parts.animationBaseY + Math.abs(Math.sin(t * SPRINT_CYCLE)) * 0.06
    parts.group.rotation.x = 0.15
    torso.position.y = parts.animationTorsoY
    return
  }

  resetPose()
}
