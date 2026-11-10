/** Maximum number of player-character HP and Stress slots. */
export const CHARACTER_RESOURCE_LIMIT = 12

export function limitCharacterResourceMax(target: string, value: number): number {
  return target === "hpMax" || target === "stressMax"
    ? Math.min(value, CHARACTER_RESOURCE_LIMIT)
    : value
}
