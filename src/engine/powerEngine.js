import { CARD_MAX_LEVEL } from '../store/cards.seed.js';

export function getCardPower(card, level = card?.level ?? 1) {
  if (!card?.basePower || !card?.growth) return 0;

  const maxLevel = card.maxLevel ?? CARD_MAX_LEVEL;
  const safeLevel = Math.max(1, Math.min(level, maxLevel));
  return Math.floor(card.basePower * Math.pow(card.growth, safeLevel - 1));
}

export function getCardLevelForPower(card, power = card?.power) {
  if (!card?.basePower || !card?.growth) return 1;

  const targetPower = Number(power) || 0;
  const maxLevel = card.maxLevel ?? CARD_MAX_LEVEL;
  let bestLevel = 1;
  let bestPower = getCardPower(card, bestLevel);

  for (let level = 2; level <= maxLevel; level += 1) {
    const levelPower = getCardPower(card, level);
    if (levelPower === targetPower) return level;
    if (levelPower <= targetPower && levelPower >= bestPower) {
      bestLevel = level;
      bestPower = levelPower;
    }
    if (levelPower > targetPower) break;
  }

  return bestLevel;
}

export function getOwnedCardPower(baseCard, ownedCard = {}) {
  const savedLevel = Number(ownedCard.level) || 1;
  const savedPower = Number(ownedCard.power) || 0;
  return savedPower || getCardPower(baseCard, savedLevel) || baseCard?.power || baseCard?.basePower || 0;
}
