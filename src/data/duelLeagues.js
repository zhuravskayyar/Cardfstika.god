export const DUEL_LEAGUE_DEFAULT_ID = 'league-novice-3';

const LEAGUE_GROUPS = [
  { legacy: 'gray', key: 'novice', title: 'Послушник', baseSilver: [100, 120, 150], minRating: [0, 500, 600], promoSilver: [null, 1000, 2000] },
  { legacy: 'green', key: 'squire', title: 'Зброєносець', baseSilver: [200, 250, 300], minRating: [800, 1000, 1200], promoSilver: [3000, 4000, 5000] },
  { legacy: 'blue', key: 'knight', title: 'Лицар', baseSilver: [400, 450, 500], minRating: [1400, 1600, 1800], promoSilver: [6000, 7000, 8000] },
  { legacy: 'purple', key: 'commander', title: 'Командор', baseSilver: [600, 650, 700], minRating: [2000, 2200, 2400], promoSilver: [10000, 15000, 20000] },
  { legacy: 'gold', key: 'paladin', title: 'Паладин', baseSilver: [1000, 1200, 1500], minRating: [2600, 2800, 3000], promoSilver: [30000, 40000, 50000] },
  { legacy: 'black', key: 'inquisitor', title: 'Інквізитор', baseSilver: [2000, 2200, 2500], minRating: [3200, 3400, 3600], promoSilver: [70000, 80000, 100000] },
  { legacy: 'masters', key: 'master', title: 'Магістр Ордену', baseSilver: [3000, 3500, 4000], minRating: [3800, 4000, 4200], promoSilver: [120000, 150000, 200000] },
];

const ROMAN_TIER = {
  3: 'III',
  2: 'II',
  1: 'I',
};

export const DUEL_LEAGUES = LEAGUE_GROUPS.flatMap((group) =>
  [3, 2, 1].map((tier, index) => {
    const id = `league-${group.key}-${tier}`;
    return {
      id,
      legacyId: `league-${group.legacy}-${tier}`,
      title: `${group.title} ${ROMAN_TIER[tier]}`,
      tier,
      minRating: group.minRating[index],
      baseSilver: group.baseSilver[index],
      promoSilver: group.promoSilver[index],
      assetKey: id,
    };
  }),
).sort((a, b) => a.minRating - b.minRating);

const BY_ID = new Map(DUEL_LEAGUES.map((league) => [league.id, league]));
const LEGACY_TO_ID = new Map(DUEL_LEAGUES.map((league) => [league.legacyId, league.id]));

export const LEAGUE_TITLES = Object.fromEntries(DUEL_LEAGUES.map((league) => [league.id, league.title]));

export function normalizeDuelLeagueId(id) {
  const value = String(id ?? '').trim();
  if (BY_ID.has(value)) return value;
  if (LEGACY_TO_ID.has(value)) return LEGACY_TO_ID.get(value);
  return DUEL_LEAGUE_DEFAULT_ID;
}

export function getDuelLeague(id) {
  return BY_ID.get(normalizeDuelLeagueId(id)) ?? BY_ID.get(DUEL_LEAGUE_DEFAULT_ID);
}

export function getDuelLeagueByRating(rating = 0) {
  const value = Math.max(0, Math.round(Number(rating) || 0));
  let best = getDuelLeague(DUEL_LEAGUE_DEFAULT_ID);
  for (const league of DUEL_LEAGUES) {
    if (league.minRating <= value) best = league;
    else break;
  }
  return best;
}

export function getNextDuelLeague(id) {
  const current = getDuelLeague(id);
  const currentIndex = DUEL_LEAGUES.findIndex((league) => league.id === current.id);
  return currentIndex >= 0 ? DUEL_LEAGUES[currentIndex + 1] ?? null : null;
}

export function getDuelLeagueProgress(rating = 0) {
  const current = getDuelLeagueByRating(rating);
  const next = getNextDuelLeague(current.id);
  const value = Math.max(0, Math.round(Number(rating) || 0));

  if (!next) {
    return { current, next: null, into: value - current.minRating, span: null, pct: 100, toNext: 0 };
  }

  const span = Math.max(1, next.minRating - current.minRating);
  const into = Math.max(0, value - current.minRating);
  const pct = Math.min(100, Math.max(0, Math.round((into / span) * 100)));

  return {
    current,
    next,
    into,
    span,
    pct,
    toNext: Math.max(0, next.minRating - value),
  };
}

export function listDuelLeagues() {
  return DUEL_LEAGUES.slice();
}
