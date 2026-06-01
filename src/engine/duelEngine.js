import { getPlayerDuelHp } from './deckEngine.js';

export { getPlayerDuelHp };

export const ELEMENT_MULTIPLIERS = Object.freeze({
  fire: { fire: 1, water: 0.5, air: 1.5, earth: 1 },
  water: { fire: 1.5, water: 1, air: 1, earth: 0.5 },
  air: { fire: 0.5, water: 1, air: 1, earth: 1.5 },
  earth: { fire: 1, water: 1.5, air: 0.5, earth: 1 },
});

const ELEMENTS = Object.freeze(['fire', 'water', 'air', 'earth']);
const RARITIES = Object.freeze(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']);
const DUEL_LOG_LIMIT = 7;
const ENEMY_NAMES = Object.freeze([
  'Темний лицар',
  'Вартовий руїн',
  'Маг попелу',
  'Паломник бурі',
  'Лісовий суддя',
  'Хранитель брами',
  'Кривавий командор',
  'Жрець глибин',
  'Сірий інквізитор',
  'Паладин ночі',
]);

function randomInt(min, max) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return low + Math.floor(Math.random() * (high - low + 1));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function cardUid(card, fallback) {
  return String(card?.uid ?? card?.cardId ?? card?.id ?? fallback);
}

function normalizeElement(element) {
  const value = String(element ?? '').toLowerCase();
  if (value === 'wind') return 'air';
  return ELEMENTS.includes(value) ? value : 'fire';
}

function normalizeCard(card, fallback) {
  const power = Math.max(1, Math.round(Number(card?.power) || 1));
  const rarity = RARITIES.includes(card?.rarity) ? card.rarity : 'common';

  return {
    ...card,
    uid: cardUid(card, fallback),
    id: card?.id ?? card?.cardId ?? fallback,
    name: String(card?.name ?? card?.title ?? card?.id ?? 'Карта'),
    element: normalizeElement(card?.element),
    rarity,
    power,
    art: card?.art ?? null,
  };
}

function deckPower(deck = []) {
  return deck.reduce((sum, card) => sum + (Number(card?.power) || 0), 0);
}

function targetEnemyPower(playerPower) {
  const power = Math.max(9, Math.round(Number(playerPower) || 108));
  return randomInt(Math.max(9, Math.round(power * 0.8)), Math.max(9, Math.round(power * 1.4)));
}

export function calculateDamage(attackerCard, defenderCard) {
  const attackerElement = normalizeElement(attackerCard?.element);
  const defenderElement = normalizeElement(defenderCard?.element);
  const multiplier = ELEMENT_MULTIPLIERS[attackerElement]?.[defenderElement] ?? 1;
  const damage = Math.max(0, Math.round((Number(attackerCard?.power) || 0) * multiplier));
  return { damage, multiplier };
}

export function buildEnemyDeckForHp(totalHp) {
  const count = 9;
  const hp = Math.max(count, Math.round(Number(totalHp) || count));
  const minPower = hp >= count * 12 ? 12 : 1;
  let remaining = hp - minPower * count;

  if (remaining < 0) remaining = hp - count;

  const weights = Array.from({ length: count }, () => Math.random() + 0.1);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const additions = weights.map((weight) => Math.floor((remaining * weight) / totalWeight));
  let used = additions.reduce((sum, addition) => sum + addition, 0);

  while (used < remaining) {
    additions[used % count] += 1;
    used += 1;
  }

  const deck = additions.map((addition, index) => ({
    uid: `enemy-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
    id: `enemy-card-${index + 1}`,
    name: `Карта суперника ${index + 1}`,
    element: pick(ELEMENTS),
    rarity: pick(RARITIES),
    power: Math.max(1, minPower + addition),
    art: null,
  }));

  const fix = hp - deckPower(deck);
  if (fix !== 0) {
    deck[deck.length - 1] = {
      ...deck[deck.length - 1],
      power: Math.max(1, deck[deck.length - 1].power + fix),
    };
  }

  return deck;
}

export function createDuelOpponent(playerDeckOrPower = 108) {
  const playerPower = Array.isArray(playerDeckOrPower)
    ? deckPower(playerDeckOrPower)
    : Math.max(9, Math.round(Number(playerDeckOrPower) || 108));
  const power = targetEnemyPower(playerPower);
  const deck = buildEnemyDeckForHp(power);

  return {
    id: `enemy-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: pick(ENEMY_NAMES),
    power: deckPower(deck),
    hp: deckPower(deck),
    deck,
  };
}

function getNextAvailableCard(side, board, avoidUid = null) {
  const deck = side.deck;
  if (!Array.isArray(deck) || deck.length === 0) return null;

  let fallback = null;

  for (let attempt = 0; attempt < deck.length; attempt += 1) {
    const index = side.pointer % deck.length;
    const card = deck[index];
    side.pointer = (side.pointer + 1) % deck.length;

    if (!card) continue;

    const alreadyOnBoard = board.some((activeCard) => activeCard && activeCard.uid === card.uid);
    if (alreadyOnBoard) continue;
    if (avoidUid && card.uid === avoidUid) {
      fallback = fallback ?? card;
      continue;
    }

    return card;
  }

  return fallback;
}

function replaceLane(side, laneIndex, usedCard) {
  const board = side.board.slice();
  board[laneIndex] = null;
  const next = getNextAvailableCard(side, board, usedCard?.uid);
  board[laneIndex] = next ?? usedCard ?? null;
  side.board = board;
}

function makeSide(deck) {
  const normalized = deck.slice(0, 9).map((card, index) => normalizeCard(card, `card-${index}`));
  const maxHp = deckPower(normalized);

  return {
    hp: maxHp,
    maxHp,
    deck: normalized,
    board: normalized.slice(0, 3),
    pointer: 3 % Math.max(1, normalized.length),
  };
}

export function createDuelBattle(playerDeck = [], enemyDeck = []) {
  const player = makeSide(playerDeck);
  const enemy = makeSide(enemyDeck);

  if (player.board.filter(Boolean).length < 3 || enemy.board.filter(Boolean).length < 3) {
    throw new Error('Duel battle needs at least 3 cards per side.');
  }

  return {
    phase: 'battle',
    turn: 1,
    player,
    enemy,
    lastAction: null,
    log: [],
    result: null,
    finished: false,
  };
}

export function getLaneMultipliers(battle) {
  return [0, 1, 2].map((laneIndex) => {
    const playerCard = battle?.player?.board?.[laneIndex] ?? null;
    const enemyCard = battle?.enemy?.board?.[laneIndex] ?? null;
    const player = playerCard && enemyCard ? calculateDamage(playerCard, enemyCard).multiplier : 1;
    const enemy = playerCard && enemyCard ? calculateDamage(enemyCard, playerCard).multiplier : 1;
    return { laneIndex, player, enemy };
  });
}

export function attackLane(battle, laneIndex) {
  if (!battle || battle.finished) return battle;

  const index = Math.max(0, Math.min(2, Math.round(Number(laneIndex) || 0)));
  const next = typeof structuredClone === 'function' ? structuredClone(battle) : JSON.parse(JSON.stringify(battle));
  const playerCard = next.player.board[index];
  const enemyCard = next.enemy.board[index];

  if (!playerCard || !enemyCard) return next;

  const playerHit = calculateDamage(playerCard, enemyCard);
  const enemyHit = calculateDamage(enemyCard, playerCard);

  next.enemy.hp = Math.max(0, next.enemy.hp - playerHit.damage);
  next.player.hp = Math.max(0, next.player.hp - enemyHit.damage);

  const lastAction = {
    turn: next.turn,
    laneIndex: index,
    playerCard,
    enemyCard,
    playerDamage: playerHit.damage,
    enemyDamage: enemyHit.damage,
    playerMultiplier: playerHit.multiplier,
    enemyMultiplier: enemyHit.multiplier,
  };

  next.lastAction = lastAction;
  next.log = [...(next.log ?? []), lastAction].slice(-DUEL_LOG_LIMIT);
  next.turn += 1;

  if (next.enemy.hp <= 0 && next.player.hp <= 0) next.result = 'win';
  else if (next.enemy.hp <= 0) next.result = 'win';
  else if (next.player.hp <= 0) next.result = 'lose';

  if (next.result) {
    next.finished = true;
    return next;
  }

  replaceLane(next.player, index, playerCard);
  replaceLane(next.enemy, index, enemyCard);

  return next;
}
