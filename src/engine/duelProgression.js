import { getCompletedCollectionBonuses } from './collectionEngine.js';
import { computeLevelUps, getLevelProgressFromTotalXp, MEDAL_LEVELS } from './experienceEngine.js';
import {
  attackLane,
  createDuelBattle,
  createDuelOpponent,
} from './duelEngine.js';
import {
  DUEL_LEAGUE_DEFAULT_ID,
  getDuelLeague,
  getDuelLeagueByRating,
  getDuelLeagueProgress,
  normalizeDuelLeagueId,
} from '../data/duelLeagues.js';

export const BASE_DAILY_DUEL_LIMIT = 10;
export const BASE_DUEL_COOLDOWN_MS = 2 * 60 * 60 * 1000;
export const MIN_DUEL_COOLDOWN_MS = 90 * 60 * 1000;
export const DUEL_TIMEOUT_MS = 30 * 60 * 1000;
export const BASE_DUEL_OPEN_COST = 25;
export const DUEL_LOG_LIMIT = 7;

const DEFAULT_DUEL_STATS = Object.freeze({
  rating: 0,
  played: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  dailyGold: 0,
  dailyGoldDate: '',
  goldPity: 0,
  dailyPlayed: 0,
  dailyPlayedDate: '',
  promoLeaguesClaimed: [],
  availableDuels: BASE_DAILY_DUEL_LIMIT,
  cooldownStartedAt: 0,
  cooldownEndsAt: 0,
  lastActivityAt: 0,
  autoBattlesToday: 0,
  autoBattleDate: '',
  strongEnemyStreak: 0,
});

function asInt(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toDate(value = Date.now()) {
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function toMs(value) {
  const number = Number(value) || 0;
  if (number > 0) return Math.round(number);
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function todayKeyLocal(date = new Date()) {
  date = toDate(date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeBonusList(state) {
  return getCompletedCollectionBonuses(state.collections ?? [], state.ownedCardIds ?? []);
}

function sumBonus(bonuses, type, predicate = null) {
  return bonuses.reduce((sum, bonus) => {
    if (!bonus || bonus.type !== type) return sum;
    if (predicate && !predicate(bonus)) return sum;
    return sum + (Number(bonus.value) || 0);
  }, 0);
}

function roundRandom(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const low = Math.floor(number);
  const high = Math.ceil(number);
  if (low === high) return low;
  return Math.random() < number - low ? high : low;
}

export function normalizeDuelStats(rawDuel = {}, leagueId = DUEL_LEAGUE_DEFAULT_ID, now = Date.now()) {
  const duel = rawDuel && typeof rawDuel === 'object' ? rawDuel : {};
  const hadRating = Object.prototype.hasOwnProperty.call(duel, 'rating');
  const normalizedLeague = getDuelLeague(normalizeDuelLeagueId(leagueId));
  const today = todayKeyLocal(now);

  const next = {
    ...DEFAULT_DUEL_STATS,
    ...duel,
    rating: Math.max(0, hadRating ? asInt(duel.rating, 0) : asInt(normalizedLeague.minRating, 0)),
    played: Math.max(0, asInt(duel.played, 0)),
    wins: Math.max(0, asInt(duel.wins, 0)),
    losses: Math.max(0, asInt(duel.losses, 0)),
    draws: Math.max(0, asInt(duel.draws, 0)),
    dailyGold: Math.max(0, asInt(duel.dailyGold, 0)),
    dailyGoldDate: typeof duel.dailyGoldDate === 'string' ? duel.dailyGoldDate : '',
    goldPity: clamp(asInt(duel.goldPity, 0), 0, 999),
    dailyPlayed: Math.max(0, asInt(duel.dailyPlayed, 0)),
    dailyPlayedDate: typeof duel.dailyPlayedDate === 'string' ? duel.dailyPlayedDate : '',
    promoLeaguesClaimed: Array.isArray(duel.promoLeaguesClaimed) ? duel.promoLeaguesClaimed.map(String) : [],
    availableDuels: Math.max(0, asInt(duel.availableDuels, BASE_DAILY_DUEL_LIMIT)),
    cooldownStartedAt: Math.max(0, toMs(duel.cooldownStartedAt)),
    cooldownEndsAt: Math.max(0, toMs(duel.cooldownEndsAt)),
    lastActivityAt: Math.max(0, toMs(duel.lastActivityAt)),
    autoBattlesToday: Math.max(0, asInt(duel.autoBattlesToday, 0)),
    autoBattleDate: typeof duel.autoBattleDate === 'string' ? duel.autoBattleDate : '',
    strongEnemyStreak: Math.max(0, asInt(duel.strongEnemyStreak, 0)),
  };

  if (next.dailyGoldDate !== today) {
    next.dailyGoldDate = today;
    next.dailyGold = 0;
    next.goldPity = 0;
  }

  if (next.dailyPlayedDate !== today) {
    next.dailyPlayedDate = today;
    next.dailyPlayed = 0;
  }

  if (next.autoBattleDate !== today) {
    next.autoBattleDate = today;
    next.autoBattlesToday = 0;
  }

  return next;
}

function getDailyGoldLimit(level, bonuses) {
  const base = clamp(asInt(level, 1), 1, 120);
  const bonusPct = sumBonus(bonuses, 'daily_gold_limit_percent');
  return Math.max(1, Math.round(base * (1 + bonusPct / 100)));
}

function getDailyDuelLimit(bonuses) {
  return Math.max(1, BASE_DAILY_DUEL_LIMIT + sumBonus(bonuses, 'daily_duel_count'));
}

function getDuelCooldownMs(bonuses) {
  const pct = sumBonus(bonuses, 'duel_cooldown_percent');
  return clamp(Math.round(BASE_DUEL_COOLDOWN_MS * (1 + pct / 100)), MIN_DUEL_COOLDOWN_MS, BASE_DUEL_COOLDOWN_MS);
}

function autoBattleBaseCost(duel) {
  const battles = Math.max(0, asInt(duel?.autoBattlesToday, 0));
  if (battles >= 4000) return 500;
  if (battles >= 3000) return 250;
  if (battles >= 2000) return 100;
  if (battles >= 1000) return 50;
  return BASE_DUEL_OPEN_COST;
}

function proportionalCooldownCost(baseCost, availability) {
  if (!availability?.cooldownActive) return baseCost;
  const total = Math.max(1, availability.cooldownDurationMs || 1);
  const remaining = clamp(availability.cooldownRemainingMs || 0, 0, total);
  return clamp(Math.ceil(baseCost * remaining / total), 1, baseCost);
}

export function getDuelAvailabilityState(state, now = Date.now()) {
  const bonuses = normalizeBonusList(state ?? {});
  const duel = normalizeDuelStats(state?.duel, state?.duelLeagueId, now);
  const dailyDuelLimit = getDailyDuelLimit(bonuses);
  const cooldownDurationMs = getDuelCooldownMs(bonuses);
  const nowMs = toMs(now) || Date.now();
  let availableDuels = Math.max(0, asInt(duel.availableDuels, dailyDuelLimit));
  let cooldownStartedAt = Math.max(0, asInt(duel.cooldownStartedAt, 0));
  let cooldownEndsAt = Math.max(0, asInt(duel.cooldownEndsAt, 0));

  if (availableDuels < dailyDuelLimit && cooldownEndsAt > 0 && nowMs >= cooldownEndsAt) {
    availableDuels = dailyDuelLimit;
    cooldownStartedAt = 0;
    cooldownEndsAt = 0;
  }

  if (availableDuels >= dailyDuelLimit) {
    cooldownStartedAt = 0;
    cooldownEndsAt = 0;
  }

  const cooldownActive = cooldownEndsAt > nowMs && availableDuels < dailyDuelLimit;
  const cooldownRemainingMs = cooldownActive ? cooldownEndsAt - nowMs : 0;
  const normalizedDuel = {
    ...duel,
    availableDuels,
    cooldownStartedAt,
    cooldownEndsAt,
  };
  const baseAutoBattleCost = autoBattleBaseCost(normalizedDuel);

  return {
    duel: normalizedDuel,
    dailyDuelLimit,
    availableDuels,
    cooldownActive,
    cooldownStartedAt,
    cooldownEndsAt,
    cooldownDurationMs,
    cooldownRemainingMs,
    openCost: proportionalCooldownCost(BASE_DUEL_OPEN_COST, { cooldownActive, cooldownDurationMs, cooldownRemainingMs }),
    autoBattleCost: proportionalCooldownCost(baseAutoBattleCost, { cooldownActive, cooldownDurationMs, cooldownRemainingMs }),
    canStart: availableDuels > 0,
    canOpen: availableDuels <= 0,
  };
}

export function refreshDuelAvailability(state, now = Date.now()) {
  const availability = getDuelAvailabilityState(state, now);
  return {
    ...state,
    duel: availability.duel,
  };
}

export function consumeDuelStart(state, now = Date.now()) {
  const availability = getDuelAvailabilityState(state, now);
  if (availability.availableDuels <= 0) {
    return { state: { ...state, duel: availability.duel }, ok: false, availability };
  }

  const nowMs = toMs(now) || Date.now();
  const availableDuels = Math.max(0, availability.availableDuels - 1);
  const shouldStartCooldown = availableDuels < availability.dailyDuelLimit && !availability.cooldownActive;
  const duel = {
    ...availability.duel,
    availableDuels,
    cooldownStartedAt: shouldStartCooldown ? nowMs : availability.duel.cooldownStartedAt,
    cooldownEndsAt: shouldStartCooldown ? nowMs + availability.cooldownDurationMs : availability.duel.cooldownEndsAt,
    lastActivityAt: nowMs,
  };

  return {
    state: { ...state, duel },
    ok: true,
    availability: { ...availability, duel, availableDuels },
  };
}

export function grantExtraDuelForGoldUpgrade(state, now = Date.now()) {
  const availability = getDuelAvailabilityState(state, now);
  return {
    ...state,
    duel: {
      ...availability.duel,
      availableDuels: availability.availableDuels + 1,
    },
  };
}

export function openDuelsWithGold(state, now = Date.now()) {
  const availability = getDuelAvailabilityState(state, now);
  const gold = Math.max(0, asInt(state?.player?.gold, 0));
  if (gold < availability.openCost) {
    return { state: { ...state, duel: availability.duel }, ok: false, cost: availability.openCost };
  }

  const duel = {
    ...availability.duel,
    availableDuels: availability.dailyDuelLimit,
    cooldownStartedAt: 0,
    cooldownEndsAt: 0,
  };

  return {
    state: {
      ...state,
      duel,
      player: {
        ...state.player,
        gold: gold - availability.openCost,
      },
    },
    ok: true,
    cost: availability.openCost,
  };
}

export function makeTechnicalLossBattle(session) {
  const battle = session?.battle;
  if (!battle) return null;
  return {
    ...battle,
    player: { ...battle.player, hp: 0 },
    result: 'lose',
    finished: true,
    lastAction: battle.lastAction ?? null,
    log: Array.isArray(battle.log) ? battle.log : [],
    technicalLoss: true,
  };
}

export function applyTechnicalLossIfExpired(state, session, now = Date.now()) {
  const duel = normalizeDuelStats(state?.duel, state?.duelLeagueId, now);
  const lastActivityAt = Math.max(0, asInt(duel.lastActivityAt, 0));
  const nowMs = toMs(now) || Date.now();
  if (session?.phase !== 'battle' || !session.battle || !lastActivityAt || nowMs - lastActivityAt < DUEL_TIMEOUT_MS) {
    return { expired: false, state: { ...state, duel }, battle: null, summary: null };
  }

  const battle = makeTechnicalLossBattle(session);
  const applied = applyDuelBattleResultToState({ ...state, duel }, battle, now);
  return {
    expired: true,
    state: applied.state,
    battle,
    summary: {
      ...applied.summary,
      technicalLoss: true,
    },
  };
}

function computeGoldDrop({ duel, level, bonuses, result }) {
  const limit = getDailyGoldLimit(level, bonuses);
  const remaining = limit - Math.max(0, asInt(duel.dailyGold, 0));
  if (result !== 'win' || remaining <= 0) {
    return { amount: 0, dropped: false, limit };
  }

  const pity = clamp(asInt(duel.goldPity, 0), 0, 999);
  const chance = Math.min(0.9, 0.2 + pity * 0.15);
  const shouldDrop = pity >= 4 || Math.random() < chance;
  if (!shouldDrop) return { amount: 0, dropped: false, limit };

  const goldBonusPct = sumBonus(bonuses, 'duel_gold_percent');
  const rawAmount = limit * 0.05 * (1 + goldBonusPct / 100);
  const amount = clamp(roundRandom(rawAmount), 1, remaining);

  return { amount, dropped: amount > 0, limit };
}

function ratingDeltaForResult(result) {
  if (result === 'win') return 30;
  if (result === 'lose') return -20;
  if (result === 'draw') return 10;
  return 0;
}

function damageDealtFromBattle(battle) {
  const maxHp = Math.max(0, asInt(battle?.enemy?.maxHp, 0));
  const hp = Math.max(0, asInt(battle?.enemy?.hp, 0));
  return Math.max(0, maxHp - hp);
}

function makeMedals(existingMedals, levels) {
  const existing = Array.isArray(existingMedals) ? existingMedals : [];
  const knownLevels = new Set(existing.map((medal) => asInt(medal?.level, -1)));
  const earned = levels
    .filter((level) => MEDAL_LEVELS.includes(level) && !knownLevels.has(level))
    .map((level) => ({ level, kind: 'bronze', ts: Date.now() }));

  return { medals: [...existing, ...earned], earned };
}

export function getDuelProgressionState(state, now = Date.now()) {
  const availability = getDuelAvailabilityState(state, now);
  const duel = availability.duel;
  const bonuses = normalizeBonusList(state ?? {});
  const xpTotal = Math.max(0, asInt(state?.xpTotal, 0));
  const progress = getLevelProgressFromTotalXp(xpTotal);
  const league = getDuelLeagueByRating(duel.rating);
  const leagueProgress = getDuelLeagueProgress(duel.rating);
  const dailyDuelLimit = availability.dailyDuelLimit;

  return {
    level: progress.level,
    xpTotal,
    xpIntoLevel: progress.xpIntoLevel,
    xpForNextLevel: progress.xpForNextLevel,
    progressPercent: progress.progressPercent,
    league,
    leagueProgress,
    dailyGoldLimit: getDailyGoldLimit(progress.level, bonuses),
    dailyDuelLimit,
    dailyDuelsLeft: availability.availableDuels,
    availability,
    duel,
  };
}

export function applyDuelBattleResultToState(state, battle, now = Date.now()) {
  const result = battle?.result;
  if (!['win', 'lose', 'draw'].includes(result)) return { state, summary: null };

  const bonuses = normalizeBonusList(state);
  const duelBefore = getDuelAvailabilityState(state, now).duel;
  const ratingBefore = asInt(duelBefore.rating, 0);
  const ratingDelta = ratingDeltaForResult(result);
  const ratingAfter = Math.max(0, ratingBefore + ratingDelta);
  const beforeLeague = getDuelLeagueByRating(ratingBefore);
  const afterLeague = getDuelLeagueByRating(ratingAfter);
  const claimed = new Set(duelBefore.promoLeaguesClaimed ?? []);
  let promoSilver = 0;

  if (afterLeague.minRating > beforeLeague.minRating && afterLeague.promoSilver && !claimed.has(afterLeague.id)) {
    promoSilver = Math.max(0, asInt(afterLeague.promoSilver, 0));
    claimed.add(afterLeague.id);
  }

  const damageDealt = damageDealtFromBattle(battle);
  const xpTotalBefore = Math.max(0, asInt(state.xpTotal, 0));
  const xpBonusPct = sumBonus(bonuses, 'duel_exp_percent')
    + (result === 'win' ? sumBonus(bonuses, 'victory_exp_percent') : 0);
  const xpGained = Math.max(0, Math.round(damageDealt * (1 + xpBonusPct / 100)));
  const xpTotal = xpTotalBefore + xpGained;
  const levelUps = computeLevelUps(xpTotalBefore, xpTotal);
  const progress = getLevelProgressFromTotalXp(xpTotal);
  const levelUpGold = levelUps.levels.reduce((sum, level) => sum + level, 0);
  const medalResult = makeMedals(state.medals, levelUps.levels);

  const silverBonusPct = sumBonus(bonuses, 'duel_silver_percent')
    + (result !== 'win' ? sumBonus(bonuses, 'loss_reward_percent') : 0);
  const silverFactor = result === 'win' ? 1 : 0.5;
  const duelSilver = Math.max(0, Math.round(afterLeague.baseSilver * silverFactor * (1 + silverBonusPct / 100)));

  const goldDrop = computeGoldDrop({ duel: duelBefore, level: progress.level, bonuses, result });

  const duel = {
    ...duelBefore,
    rating: ratingAfter,
    played: duelBefore.played + 1,
    wins: duelBefore.wins + (result === 'win' ? 1 : 0),
    losses: duelBefore.losses + (result === 'lose' ? 1 : 0),
    draws: duelBefore.draws + (result === 'draw' ? 1 : 0),
    dailyPlayed: duelBefore.dailyPlayed + 1,
    dailyGold: duelBefore.dailyGold + goldDrop.amount,
    goldPity: goldDrop.dropped ? 0 : clamp(duelBefore.goldPity + 1, 0, 999),
    promoLeaguesClaimed: Array.from(claimed),
    lastActivityAt: 0,
  };

  const player = {
    ...state.player,
    level: progress.level,
    exp: progress.xpIntoLevel,
    expToNext: progress.xpForNextLevel ?? Math.max(1, progress.xpIntoLevel),
    silver: Math.max(0, asInt(state.player?.silver, 0) + duelSilver + promoSilver),
    gold: Math.max(0, asInt(state.player?.gold, 0) + goldDrop.amount + levelUpGold),
  };

  const summary = {
    result,
    rating: { before: ratingBefore, after: ratingAfter, delta: ratingDelta },
    league: afterLeague,
    leagueTransition: { from: beforeLeague, to: afterLeague, promoSilver },
    rewards: {
      silver: duelSilver + promoSilver,
      duelSilver,
      promoSilver,
      gold: goldDrop.amount,
      goldDropped: goldDrop.dropped,
      goldToday: duel.dailyGold,
      goldLimit: goldDrop.limit,
      levelUpGold,
    },
    xp: {
      base: damageDealt,
      gained: xpGained,
      bonusPct: xpBonusPct,
      levelBefore: levelUps.before,
      levelAfter: levelUps.after,
      medalsEarned: medalResult.earned,
    },
    player: { hp: battle.player.hp, maxHp: battle.player.maxHp },
    enemy: { hp: battle.enemy.hp, maxHp: battle.enemy.maxHp },
    battleLog: Array.isArray(battle.log) ? battle.log.slice(-DUEL_LOG_LIMIT) : [],
    ts: toMs(now) || Date.now(),
  };

  return {
    state: {
      ...state,
      xpTotal,
      duel,
      duelLeagueId: afterLeague.id,
      player,
      medals: medalResult.medals,
    },
    summary,
  };
}

function autoPlayBattle(battle) {
  let next = battle;
  let guard = 0;
  while (next && !next.finished && guard < 200) {
    next = attackLane(next, guard % 3);
    guard += 1;
  }
  return next;
}

function mergeAutoSummary(total, summary) {
  if (!summary) return total;
  return {
    battles: total.battles + 1,
    wins: total.wins + (summary.result === 'win' ? 1 : 0),
    losses: total.losses + (summary.result === 'lose' ? 1 : 0),
    draws: total.draws + (summary.result === 'draw' ? 1 : 0),
    silver: total.silver + (summary.rewards?.silver ?? 0),
    gold: total.gold + (summary.rewards?.gold ?? 0) + (summary.rewards?.levelUpGold ?? 0),
    xp: total.xp + (summary.xp?.gained ?? 0),
    rating: total.rating + (summary.rating?.delta ?? 0),
    lastBattleLog: summary.battleLog ?? total.lastBattleLog,
  };
}

export function runAutoDuels(state, playerDeck, count = BASE_DAILY_DUEL_LIMIT, now = Date.now()) {
  let current = refreshDuelAvailability(state, now);
  const availability = getDuelAvailabilityState(current, now);
  current = { ...current, duel: availability.duel };
  const requestedCount = clamp(asInt(count, BASE_DAILY_DUEL_LIMIT), 1, BASE_DAILY_DUEL_LIMIT);
  const gold = Math.max(0, asInt(current?.player?.gold, 0));
  const needsOpen = availability.availableDuels <= 0;
  const cost = needsOpen ? availability.autoBattleCost : 0;

  if (needsOpen) {
    if (gold < cost) {
      return { state: current, ok: false, summary: null, cost };
    }
    current = {
      ...current,
      duel: {
        ...availability.duel,
        availableDuels: availability.dailyDuelLimit,
        cooldownStartedAt: 0,
        cooldownEndsAt: 0,
      },
      player: {
        ...current.player,
        gold: gold - cost,
      },
    };
  }

  const runCount = needsOpen
    ? requestedCount
    : Math.min(requestedCount, Math.max(0, asInt(current.duel?.availableDuels, 0)));

  const total = {
    battles: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    silver: 0,
    gold: 0,
    xp: 0,
    rating: 0,
    cost,
    lastBattleLog: [],
  };

  for (let i = 0; i < runCount; i += 1) {
    const consumed = consumeDuelStart(current, now);
    if (!consumed.ok) break;
    const enemy = createDuelOpponent(playerDeck);
    const battle = autoPlayBattle(createDuelBattle(playerDeck, enemy.deck));
    const applied = applyDuelBattleResultToState(consumed.state, battle, now);
    current = applied.state;
    Object.assign(total, mergeAutoSummary(total, applied.summary));
  }

  const duel = normalizeDuelStats(current.duel, current.duelLeagueId, now);
  current = {
    ...current,
    duel: {
      ...duel,
      autoBattlesToday: duel.autoBattlesToday + total.battles,
      autoBattleDate: todayKeyLocal(now),
    },
  };

  return {
    state: current,
    ok: total.battles > 0,
    summary: total,
    cost,
  };
}
