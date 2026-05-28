import { RARITY_DROP_WEIGHT } from '../data/rarity.js';

export function getRarityDropWeight(rarity) {
  return RARITY_DROP_WEIGHT[rarity] ?? 0;
}

