export const ARCHETYPE_DEFINITIONS = Object.freeze([
  {
    id: 'warrior',
    name: 'Warrior',
    title: 'Augmenter',
    description: 'Close-range combat with heavy armour and a sweeping greatsword.'
  },
  {
    id: 'mage',
    name: 'Mage',
    title: 'Conjurer',
    description: 'Ranged combat with mystic robes and a staff.'
  }
])

export const ARCHETYPE_IDS = new Set(ARCHETYPE_DEFINITIONS.map(({ id }) => id))

export function getArchetypeDefinition(id) {
  return ARCHETYPE_DEFINITIONS.find(archetype => archetype.id === id) ?? null
}