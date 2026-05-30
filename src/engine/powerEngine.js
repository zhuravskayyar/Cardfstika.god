import { CARD_MAX_LEVEL } from '../store/cards.seed.js';

export const CARD_POWER_BY_LEVEL = Object.freeze([
  10, 20, 30, 40, 70, 80, 90, 100, 110, 170, 190, 210,
  230, 250, 310, 330, 350, 370, 390, 500, 530, 560, 590, 620,
  730, 760, 790, 820, 850, 960, 990, 1020, 1050, 1080, 1240, 1280,
  1320, 1360, 1400, 1560, 1600, 1640, 1680, 1720, 1880, 1920, 1960, 2000,
  2040, 2200, 2240, 2280, 2320, 2360, 2520, 2560, 2600, 2640, 2680, 2930,
  2980, 3030, 3080, 3130, 3430, 3480, 3530, 3580, 3630, 3980, 4030, 4080,
  4130, 4180, 4580, 4630, 4680, 4730, 4780, 5230, 5280, 5330, 5380, 5430,
  5980, 6030, 6080, 6130, 6180, 6260, 6350, 6450, 6560, 6680, 6830, 6880,
  6940, 7010, 7090, 7180, 7280, 7390, 7510, 7660, 7860, 7910, 7960, 8020,
  8080, 8150, 8220, 8300, 8380, 8470, 8570, 8680, 8800, 8940, 9100, 9320,
  9360, 9420, 9500, 9600, 9740, 9790, 9860, 9950, 10060, 10210, 10270, 10350,
  10450, 10570, 10730, 10800, 10890, 11000, 11130, 11300, 11380, 11480, 11600, 11740,
  11920, 12020, 12140, 12280, 12440, 12640, 12720, 12820, 12940, 13080, 13260, 13360,
  13480, 13620, 13780, 13980, 14060, 14160, 14280, 14420, 14600, 14700, 14820, 14960,
  15120, 15320, 15400, 15500, 15620, 15760, 15940, 16040, 16160, 16300, 16460, 16660,
]);

export function getCardPower(card, level = card?.level ?? 1) {
  const maxLevel = card?.maxLevel ?? CARD_MAX_LEVEL;
  const safeLevel = Math.max(1, Math.min(level, maxLevel));
  return CARD_POWER_BY_LEVEL[safeLevel - 1] ?? CARD_POWER_BY_LEVEL[CARD_POWER_BY_LEVEL.length - 1] ?? 0;
}

export function getCardLevelForPower(card, power = card?.power) {
  const targetPower = Number(power) || 0;
  const maxLevel = card?.maxLevel ?? CARD_MAX_LEVEL;
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
  return getCardPower(baseCard, savedLevel);
}
