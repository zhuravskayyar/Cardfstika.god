import { CARD_MAX_LEVEL } from '../data/cards.js';

export function getCardPower(card, level = card?.level ?? 1) {
  if (!card?.basePower || !card?.growth) return 0;

  const maxLevel = card.maxLevel ?? CARD_MAX_LEVEL;
  const safeLevel = Math.max(1, Math.min(level, maxLevel));
  return Math.floor(card.basePower * Math.pow(card.growth, safeLevel - 1));
}

