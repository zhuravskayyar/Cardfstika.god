import { CARD_MAX_LEVEL } from '../store/cards.seed.js';

const COSTS_BY_LEVEL = new Map([
  [2, 1], [3, 1], [4, 1], [5, 2], [6, 1], [7, 1], [8, 1], [9, 1], [10, 2],
  [11, 1], [12, 1], [13, 1], [14, 1], [15, 4], [16, 2], [17, 2], [18, 2], [19, 2], [20, 10],
  [21, 5], [22, 5], [23, 5], [24, 5], [25, 16], [26, 8], [27, 8], [28, 8], [29, 8], [30, 20],
  [31, 10], [32, 10], [33, 10], [34, 10], [35, 30], [36, 15], [37, 15], [38, 15], [39, 15], [40, 40],
  [41, 20], [42, 20], [43, 20], [44, 20], [45, 60], [46, 30], [47, 30], [48, 30], [49, 30], [50, 100],
  [51, 50], [52, 50], [53, 50], [54, 50], [55, 200], [56, 100], [57, 100], [58, 100], [59, 100], [60, 400],
  [61, 400], [62, 400], [63, 400], [64, 400], [65, 800], [66, 800], [67, 800], [68, 800], [69, 800], [70, 1600],
  [71, 1600], [72, 1600], [73, 1600], [74, 1600], [75, 3200], [76, 3200], [77, 3200], [78, 3200], [79, 3200], [80, 6400],
  [81, 6400], [82, 6400], [83, 6400], [84, 6400], [85, 12500], [86, 12500], [87, 12500], [88, 12500], [89, 12500],
  [90, 3000], [91, 3400], [92, 3800], [93, 4200], [94, 4800], [95, 5800], [96, 2500], [97, 3000], [98, 3500], [99, 4000],
  [100, 4500], [101, 5000], [102, 5500], [103, 6000], [104, 7000], [105, 9000], [106, 3000], [107, 3000], [108, 4000], [109, 4000],
  [110, 4800], [111, 4800], [112, 5600], [113, 5600], [114, 6000], [115, 7000], [116, 8000], [117, 8400], [118, 10000], [119, 10800],
  [120, 15000], [121, 4000], [122, 6000], [123, 8000], [124, 10000], [125, 14000], [126, 6000], [127, 8400], [128, 10800], [129, 13200],
  [130, 18000], [131, 8400], [132, 11200], [133, 14000], [134, 16800], [135, 22400], [136, 11200], [137, 14400], [138, 17600], [139, 20800],
  [140, 27200], [141, 14400], [142, 18000], [143, 21600], [144, 25200], [145, 32400], [146, 20000], [147, 24000], [148, 28000], [149, 32000],
  [150, 36000], [151, 14400], [152, 18000], [153, 21600], [154, 25200], [155, 32400], [156, 20000], [157, 24000], [158, 28000], [159, 32000],
  [160, 36000], [161, 14400], [162, 18000], [163, 21600], [164, 25200], [165, 32400], [166, 20000], [167, 24000], [168, 28000], [169, 32000],
  [170, 36000], [171, 14400], [172, 18000], [173, 21600], [174, 25200], [175, 32400], [176, 20000], [177, 24000], [178, 28000], [179, 32000],
  [180, 40000],
]);

function parseAmount(value) {
  if (typeof value === 'number') return value;
  const text = String(value).replace(',', '.').trim();
  if (text.endsWith('K')) return Number(text.slice(0, -1)) * 1000;
  if (text.endsWith('M')) return Number(text.slice(0, -1)) * 1000000;
  return Number(text) || 0;
}

function getElementsForLevel(level) {
  if (level <= 0) return 0;
  if (level <= 5) return [0, 0.02, 0.04, 0.08, 0.14, 0.2][level] ?? 0;
  if (level <= 10) return 0.32 + (level - 6) * 0.12;
  if (level <= 15) return 1.04 + (level - 11) * 0.24;
  if (level <= 20) return 2.4 + (level - 16) * 0.4;
  if (level <= 25) return 4.8 + (level - 21) * 0.8;
  if (level <= 30) return 9.6 + (level - 26) * 1.6;
  if (level <= 35) return 20 + (level - 31) * 4;
  if (level <= 40) return 44 + (level - 36) * 8;
  if (level <= 45) return 90 + (level - 41) * 15;
  if (level <= 50) return 180 + (level - 46) * 30;
  if (level <= 55) return 360 + (level - 51) * 60;
  if (level <= 60) return 760 + (level - 56) * 160;
  if (level <= 65) return 2000 + (level - 61) * 600;
  if (level <= 70) return [5800, 7200, 8600, 10000, 12000][level - 66] ?? 0;
  if (level <= 75) return 15000 + (level - 71) * 3000;
  if (level <= 80) return 34000 + (level - 76) * 7000;
  if (level <= 85) return 80000 + (level - 81) * 18000;
  if (level <= 89) return 194000 + (level - 86) * 44000;
  if (level <= 95) return [331000, 337000, 344000, 352000, 361000, 370000][level - 90] ?? 0;
  if (level <= 120) {
    const values = [
      '380K', '400K', '440K', '490K', '550K', '610K', '670K', '730K', '850K', '1.1M',
      '1.2M', '1.3M', '1.4M', '1.53M', '1.66M', '1.8M', '1.93M', '2.06M', '2.2M',
      '2.33M', '2.46M', '2.6M', '2.78M', '3M',
    ];
    return parseAmount(values[level - 96]);
  }
  if (level <= 150) {
    const values = [
      '3.2M', '3.5M', '3.9M', '4.4M', '5.1M', '5.4M', '5.82M', '6.36M', '7.02M', '7.92M',
      '8.34M', '8.9M', '9.6M', '10.44M', '11.56M', '12.12M', '12.84M', '13.72M', '14.76M',
      '16.12M', '16.92M', '17.92M', '19.12M', '20.52M', '22.32M', '24.32M', '26.72M',
      '29.52M', '32.72M', '36.72M',
    ];
    return parseAmount(values[level - 121]);
  }
  const level150 = parseAmount('36.72M');
  return level150 * Math.pow(2, level - 150);
}

export function isGoldenUpgradeLevel(level) {
  return level > 0 && (level % 5 === 0 || level >= 90);
}

export function getUpgradeLevelRule(level) {
  const safeLevel = Math.max(1, Math.min(Number(level) || 1, CARD_MAX_LEVEL));
  const cost = COSTS_BY_LEVEL.get(safeLevel) ?? 0;
  return {
    level: safeLevel,
    cost,
    goldMinCost: isGoldenUpgradeLevel(safeLevel) ? Math.ceil(cost / 2) : 0,
    elements: getElementsForLevel(safeLevel),
  };
}

export function getNextUpgradeRule(currentLevel) {
  const nextLevel = Math.min((Number(currentLevel) || 1) + 1, CARD_MAX_LEVEL);
  return getUpgradeLevelRule(nextLevel);
}

export function getCardAvailableElements(card) {
  const level = Number(card?.level) || 1;
  return getUpgradeLevelRule(level).elements + (Number(card?.absorbedElements) || 0);
}

export function getUpgradeProgress(card) {
  const level = Number(card?.level) || 1;
  if (level >= CARD_MAX_LEVEL) {
    return { level, nextLevel: level, required: 0, current: 0, ratio: 1, isMax: true, isGolden: false };
  }

  const next = getNextUpgradeRule(level);
  const current = Number(card?.upgradeProgressElements) || 0;
  const required = next.elements;
  return {
    level,
    nextLevel: next.level,
    required,
    current,
    ratio: required > 0 ? Math.min(1, current / required) : 0,
    isMax: false,
    isGolden: isGoldenUpgradeLevel(next.level),
    cost: next.cost,
    goldMinCost: next.goldMinCost,
  };
}

export function getGoldUpgradeCost(card) {
  const progress = getUpgradeProgress(card);
  if (progress.isMax) return 0;

  if (progress.isGolden) {
    const discount = (progress.cost - progress.goldMinCost) * progress.ratio;
    return Math.max(progress.goldMinCost, Math.ceil(progress.cost - discount));
  }

  return Math.max(0, Math.ceil(progress.cost * (1 - progress.ratio)));
}

export function canFreeUpgrade(card) {
  const progress = getUpgradeProgress(card);
  return !progress.isMax && !progress.isGolden && progress.required > 0 && progress.current >= progress.required;
}

export function getUpgradeIndicator(card, playerGold = 0) {
  if (canFreeUpgrade(card)) return 'free';
  const progress = getUpgradeProgress(card);
  if (progress.isMax || !progress.isGolden) return null;
  return Number(playerGold) >= getGoldUpgradeCost(card) ? 'gold' : null;
}
