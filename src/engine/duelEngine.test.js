import test from 'node:test';
import assert from 'node:assert/strict';

import {
  attackLane,
  buildEnemyDeckForHp,
  calculateDamage,
  createDuelBattle,
} from './duelEngine.js';
import {
  LEAGUE_TITLES,
  getDuelLeague,
  normalizeDuelLeagueId,
} from '../data/duelLeagues.js';

function makeCard(prefix, index, power = 10, element = 'fire') {
  return {
    uid: `${prefix}-${index}`,
    id: `${prefix}-${index}`,
    name: `${prefix} ${index}`,
    element,
    rarity: 'common',
    power,
  };
}

function makeDeck(prefix, power = 10, element = 'fire') {
  return Array.from({ length: 9 }, (_, index) => makeCard(prefix, index + 1, power, element));
}

function sumPower(cards) {
  return cards.reduce((sum, card) => sum + card.power, 0);
}

function assertUniqueBoard(side) {
  const ids = side.board.map((card) => card.uid);
  assert.equal(new Set(ids).size, ids.length);
}

test('enemy deck has exactly 9 cards and HP equals card power sum', () => {
  const deck = buildEnemyDeckForHp(123);
  assert.equal(deck.length, 9);
  assert.equal(sumPower(deck), 123);
});

test('element multiplier damage uses rounded card power', () => {
  assert.deepEqual(calculateDamage({ power: 11, element: 'fire' }, { element: 'water' }), {
    damage: 6,
    multiplier: 0.5,
  });
  assert.deepEqual(calculateDamage({ power: 11, element: 'fire' }, { element: 'air' }), {
    damage: 17,
    multiplier: 1.5,
  });
});

test('attacking a lane rotates both used cards without board duplicates', () => {
  const battle = createDuelBattle(makeDeck('player'), makeDeck('enemy'));
  const playerUsed = battle.player.board[0].uid;
  const enemyUsed = battle.enemy.board[0].uid;
  const next = attackLane(battle, 0);

  assert.notEqual(next.player.board[0].uid, playerUsed);
  assert.notEqual(next.enemy.board[0].uid, enemyUsed);
  assertUniqueBoard(next.player);
  assertUniqueBoard(next.enemy);
});

test('board remains duplicate-free over repeated lane rotations', () => {
  let battle = createDuelBattle(makeDeck('player'), makeDeck('enemy'));

  for (let i = 0; i < 6; i += 1) {
    battle = attackLane(battle, i % 3);
    assertUniqueBoard(battle.player);
    assertUniqueBoard(battle.enemy);
    assert.equal(battle.finished, false);
  }
});

test('simultaneous death counts as player victory', () => {
  let battle = createDuelBattle(makeDeck('player'), makeDeck('enemy'));

  while (!battle.finished) {
    battle = attackLane(battle, 0);
  }

  assert.equal(battle.player.hp, 0);
  assert.equal(battle.enemy.hp, 0);
  assert.equal(battle.result, 'win');
});

test('battle log keeps only the latest 7 strikes', () => {
  let battle = createDuelBattle(makeDeck('player', 2), makeDeck('enemy', 2));

  for (let i = 0; i < 9 && !battle.finished; i += 1) {
    battle = attackLane(battle, i % 3);
  }

  assert.equal(battle.log.length, 7);
  assert.equal(battle.log[0].turn, 3);
});

test('legacy league ids migrate to new Ukrainian league titles', () => {
  assert.equal(normalizeDuelLeagueId('league-gray-3'), 'league-novice-3');
  assert.equal(normalizeDuelLeagueId('league-masters-1'), 'league-master-1');
  assert.equal(getDuelLeague('league-green-2').id, 'league-squire-2');
  assert.equal(LEAGUE_TITLES['league-novice-3'], 'Послушник III');
  assert.equal(LEAGUE_TITLES['league-master-1'], 'Магістр Ордену I');
});
