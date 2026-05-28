export const RARITIES = {
  common: { label: 'Звичайна', powerRange: [1, 4], rank: 1 },
  uncommon: { label: 'Незвичайна', powerRange: [5, 9], rank: 2 },
  rare: { label: 'Рідкісна', powerRange: [10, 19], rank: 3 },
  epic: { label: 'Епічна', powerRange: [20, 34], rank: 4 },
  legendary: { label: 'Легендарна', powerRange: [35, 59], rank: 5 },
  mythic: { label: 'Міфічна', powerRange: [60, 180], rank: 6 },
};

export const RARITY_DROP_WEIGHT = {
  common: 6500,
  uncommon: 2200,
  rare: 900,
  epic: 300,
  legendary: 90,
  mythic: 10,
};

export const RARITY_POWER_RANGE = Object.fromEntries(
  Object.entries(RARITIES).map(([rarity, config]) => [rarity, config.powerRange]),
);

export function rarityRank(rarity) {
  return RARITIES[rarity]?.rank ?? 0;
}

export function rarityLabel(rarity) {
  return RARITIES[rarity]?.label ?? rarity;
}

