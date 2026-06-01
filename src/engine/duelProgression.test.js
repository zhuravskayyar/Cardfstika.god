import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyDuelBattleResultToState,
  applyTechnicalLossIfExpired,
  consumeDuelStart,
  getDuelAvailabilityState,
  grantExtraDuelForGoldUpgrade,
  openDuelsWithGold,
  runAutoDuels,
  normalizeDuelStats,
} from './duelProgression.js';

function baseState(overrides = {}) {
  return {
    xpTotal: 0,
    duelLeagueId: 'league-novice-3',
    duel: {
      rating: 0,
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      dailyGold: 0,
      dailyGoldDate: new Date().toISOString().slice(0, 10),
      goldPity: 0,
      dailyPlayed: 0,
      dailyPlayedDate: new Date().toISOString().slice(0, 10),
      promoLeaguesClaimed: [],
    },
    player: {
      level: 1,
      exp: 0,
      expToNext: 100,
      silver: 0,
      gold: 0,
    },
    collections: [],
    ownedCardIds: [],
    medals: [],
    ...overrides,
  };
}

function battle(result, damageDealt = 100) {
  return {
    result,
    enemy: { maxHp: damageDealt, hp: 0 },
    player: { maxHp: 90, hp: result === 'lose' ? 0 : 30 },
    log: [],
  };
}

function withRandom(value, fn) {
  const original = Math.random;
  Math.random = () => value;
  try {
    return fn();
  } finally {
    Math.random = original;
  }
}

function makeCard(prefix, index, power = 20, element = 'fire') {
  return {
    uid: `${prefix}-${index}`,
    id: `${prefix}-${index}`,
    name: `${prefix} ${index}`,
    element,
    rarity: 'common',
    power,
  };
}

function makeDeck(prefix, power = 20, element = 'fire') {
  return Array.from({ length: 9 }, (_, index) => makeCard(prefix, index + 1, power, element));
}

test('win applies rating, promotion silver, XP, stats, and gold pity drop', () => {
  const state = baseState({
    duel: {
      ...baseState().duel,
      rating: 480,
      goldPity: 4,
    },
  });

  const { state: next, summary } = withRandom(1, () => applyDuelBattleResultToState(state, battle('win', 100)));

  assert.equal(next.duel.rating, 510);
  assert.equal(next.duelLeagueId, 'league-novice-2');
  assert.equal(next.duel.wins, 1);
  assert.equal(next.duel.played, 1);
  assert.equal(next.xpTotal, 100);
  assert.equal(next.player.silver, 1120);
  assert.equal(next.player.gold, 1);
  assert.equal(next.duel.dailyGold, 1);
  assert.equal(next.duel.goldPity, 0);
  assert.equal(summary.rewards.duelSilver, 120);
  assert.equal(summary.rewards.promoSilver, 1000);
});

test('daily gold cap prevents extra gold after limit is reached', () => {
  const state = baseState({
    duel: {
      ...baseState().duel,
      dailyGold: 1,
      goldPity: 4,
    },
    player: {
      ...baseState().player,
      gold: 7,
    },
  });

  const { state: next, summary } = withRandom(0, () => applyDuelBattleResultToState(state, battle('win', 40)));

  assert.equal(next.player.gold, 7);
  assert.equal(next.duel.dailyGold, 1);
  assert.equal(summary.rewards.gold, 0);
  assert.equal(summary.rewards.goldLimit, 1);
});

test('loss applies loss stats, reduced silver, rating penalty, and XP from damage dealt', () => {
  const state = baseState({
    duel: {
      ...baseState().duel,
      rating: 100,
    },
  });

  const { state: next, summary } = withRandom(1, () => applyDuelBattleResultToState(state, battle('lose', 50)));

  assert.equal(next.duel.rating, 80);
  assert.equal(next.duel.losses, 1);
  assert.equal(next.player.silver, 50);
  assert.equal(next.xpTotal, 50);
  assert.equal(summary.rating.delta, -20);
});

test('legacy league id seeds normalized duel rating when saved rating is absent', () => {
  const duel = normalizeDuelStats({}, 'league-gray-1');

  assert.equal(duel.rating, 600);
});

test('duel start consumes one available duel and starts cooldown', () => {
  const now = new Date('2026-06-01T10:00:00Z').getTime();
  const state = baseState({
    duel: {
      ...baseState().duel,
      availableDuels: 10,
    },
  });

  const result = consumeDuelStart(state, now);

  assert.equal(result.ok, true);
  assert.equal(result.state.duel.availableDuels, 9);
  assert.equal(result.state.duel.cooldownStartedAt, now);
  assert.equal(result.state.duel.cooldownEndsAt, now + 2 * 60 * 60 * 1000);
});

test('cooldown does not reduce extra duels above the base limit', () => {
  const now = new Date('2026-06-01T10:00:00Z').getTime();
  const state = baseState({
    duel: {
      ...baseState().duel,
      availableDuels: 11,
      cooldownStartedAt: now - 3 * 60 * 60 * 1000,
      cooldownEndsAt: now - 60 * 60 * 1000,
    },
  });

  const availability = getDuelAvailabilityState(state, now);

  assert.equal(availability.availableDuels, 11);
  assert.equal(availability.cooldownActive, false);
  assert.equal(availability.duel.cooldownEndsAt, 0);
});

test('gold upgrade grants one extra duel', () => {
  const state = baseState({
    duel: {
      ...baseState().duel,
      availableDuels: 10,
    },
  });

  const next = grantExtraDuelForGoldUpgrade(state);

  assert.equal(next.duel.availableDuels, 11);
});

test('opening price follows remaining cooldown proportion', () => {
  const now = new Date('2026-06-01T10:00:00Z').getTime();
  const state = baseState({
    player: { ...baseState().player, gold: 100 },
    duel: {
      ...baseState().duel,
      availableDuels: 0,
      cooldownStartedAt: now - 60 * 60 * 1000,
      cooldownEndsAt: now + 60 * 60 * 1000,
    },
  });

  const opened = openDuelsWithGold(state, now);

  assert.equal(opened.ok, true);
  assert.equal(opened.cost, 13);
  assert.equal(opened.state.player.gold, 87);
  assert.equal(opened.state.duel.availableDuels, 10);
});

test('technical loss applies after 30 minutes without activity', () => {
  const now = new Date('2026-06-01T10:31:00Z').getTime();
  const state = baseState({
    duel: {
      ...baseState().duel,
      lastActivityAt: now - 31 * 60 * 1000,
    },
  });
  const session = {
    phase: 'battle',
    battle: {
      player: { hp: 90, maxHp: 90 },
      enemy: { hp: 40, maxHp: 100 },
      log: [],
    },
  };

  const expired = applyTechnicalLossIfExpired(state, session, now);

  assert.equal(expired.expired, true);
  assert.equal(expired.battle.result, 'lose');
  assert.equal(expired.state.duel.losses, 1);
});

test('auto battle consumes duels and returns aggregate rewards', () => {
  const now = new Date('2026-06-01T10:00:00Z').getTime();
  const state = baseState({
    player: { ...baseState().player, gold: 100 },
    duel: {
      ...baseState().duel,
      availableDuels: 3,
    },
  });

  const auto = withRandom(0.5, () => runAutoDuels(state, makeDeck('player', 30), 3, now));

  assert.equal(auto.ok, true);
  assert.equal(auto.summary.battles, 3);
  assert.equal(auto.state.duel.availableDuels, 0);
  assert.equal(auto.state.duel.autoBattlesToday, 3);
  assert.equal(auto.summary.silver > 0, true);
});
