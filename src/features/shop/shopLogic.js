// shopLogic.js — вся бізнес-логіка магазину (без знання про UI)
// Залежність: Shop → Rewards → Inventory → Collections → Deck recalculation

import { CARDS } from '../../data/cards.js';
import { getDeckPowerFromOwnedCards } from '../../engine/deckModel.js';
import { getCardPower } from '../../engine/powerEngine.js';
import { QUALITY_LEVEL_RANGES } from './shopCardPacks.js';

// ─── Утиліти ─────────────────────────────────────────────────────────────────

/** Вибрати випадкову карту з пулу */
function pickRandom(arr) {
  if (!arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

export function getPackChances(item, shopCardChances = {}) {
  return {
    ...(item.startChance ?? {}),
    ...(shopCardChances[item.id] ?? {}),
  };
}

function getEffectiveFailIncrement(item, player = {}) {
  const titles = new Set([
    ...(Array.isArray(player.titles) ? player.titles : []),
    ...(Array.isArray(player.titleIds) ? player.titleIds : []),
  ]);
  const increment = { ...(item.failIncrement ?? {}) };

  for (const [titleId, modifier] of Object.entries(item.titleModifiers ?? {})) {
    if (titles.has(titleId)) {
      Object.assign(increment, modifier.failIncrement ?? {});
    }
  }

  return increment;
}

function rollQuality(item, chances) {
  const sorted = [...(item.higherQualities ?? [])].reverse();

  for (const quality of sorted) {
    if (Math.random() * 100 < (Number(chances[quality]) || 0)) {
      return quality;
    }
  }

  return item.guaranteedQuality;
}

function updateCardPackChances(item, currentChances, droppedQuality, failIncrement) {
  const next = { ...currentChances };

  for (const quality of item.higherQualities ?? []) {
    if (quality === droppedQuality) {
      next[quality] = Math.ceil((Number(next[quality]) || 0) / 2);
    } else if (droppedQuality === item.guaranteedQuality) {
      next[quality] = (Number(next[quality]) || 0) + (Number(failIncrement[quality]) || 0);
    }
  }

  return next;
}

function makeOwnedCard(cardId, quality) {
  const base = CARDS.find((card) => card.id === cardId);
  const [minLevel, maxLevel] = QUALITY_LEVEL_RANGES[quality] ?? [1, 1];
  const level = randomInt(minLevel, maxLevel);
  const power = getCardPower(base, level);

  return {
    cardId,
    level,
    rarity: quality,
    power,
    copies: 0,
    isNew: true,
  };
}

function getOwnedDeckPower(ownedCards = []) {
  const baseById = new Map(CARDS.map((card) => [card.id, card]));
  return getDeckPowerFromOwnedCards(ownedCards.map((card) => {
    const base = baseById.get(card.cardId);
    return {
      ...card,
      id: card.cardId,
      element: base?.element,
      rarity: card.rarity ?? base?.rarity ?? 'common',
    };
  }));
}

export function getPaymentPlan(item, player = {}, selectedCurrency = item.price?.currency) {
  const currency = selectedCurrency === item.altPrice?.currency ? selectedCurrency : item.price?.currency;
  const basePrice = currency === item.altPrice?.currency ? item.altPrice : item.price;
  const amount = Number(basePrice?.amount) || 0;
  const plan = { currency, amount, goldTopUp: 0, spend: { gold: 0, silver: 0, gems: 0 } };

  if (currency === 'silver') {
    const silver = Number(player.silver) || 0;
    plan.spend.silver = Math.min(silver, amount);
    plan.goldTopUp = Math.ceil(Math.max(0, amount - silver) / 100);
    plan.spend.gold = plan.goldTopUp;
    return plan;
  }

  if (currency === 'gems') {
    const gems = Number(player.gems) || 0;
    plan.spend.gems = Math.min(gems, amount);
    plan.goldTopUp = Math.max(0, amount - gems);
    plan.spend.gold = plan.goldTopUp;
    return plan;
  }

  plan.spend.gold = amount;
  return plan;
}

/** Отримати кількість покупок товару */
export function getPurchaseCount(purchaseCounts, itemId) {
  return purchaseCounts?.[itemId] ?? 0;
}

/** Збільшити лічильник покупки товару */
export function incrementPurchaseCount(purchaseCounts, itemId) {
  return {
    ...purchaseCounts,
    [itemId]: (purchaseCounts?.[itemId] ?? 0) + 1,
  };
}

// ─── Стан товару ─────────────────────────────────────────────────────────────

/**
 * @typedef {'available'|'notEnoughGold'|'notEnoughSilver'|'soldOut'|'owned'|'locked'} ShopItemState
 */

/**
 * Визначити стан товару для конкретного гравця.
 * @param {object} item
 * @param {object} player  — { gold, silver, level }
 * @param {object} purchaseCounts — { [itemId]: number }
 * @param {string[]} ownedCosmetics — id косметики, якою вже володіє гравець
 * @returns {ShopItemState}
 */
export function getShopItemState(item, player, purchaseCounts, ownedCosmetics = [], boosters = {}, selectedCurrency) {
  if (item.disabled) {
    return 'locked';
  }

  // Косметика — перевіряємо "вже куплено"
  if (item.type === 'cosmetic' && ownedCosmetics.includes(item.id)) {
    return 'owned';
  }

  if (item.type === 'booster') {
    const active = boosters[item.effect?.stat];
    if (active?.endsAt > Date.now()) {
      return 'locked';
    }
  }

  // Ліміт
  if (item.limit != null && getPurchaseCount(purchaseCounts, item.id) >= item.limit) {
    return 'soldOut';
  }

  // Рівень (якщо є)
  if (item.requiresLevel != null && player.level < item.requiresLevel) {
    return 'locked';
  }

  const paymentPlan = getPaymentPlan(item, player, selectedCurrency);
  if ((paymentPlan.spend.gold ?? 0) > (Number(player.gold) || 0)) {
    return 'notEnoughGold';
  }

  return 'available';
}

// ─── Додавання карти до інвентарю ────────────────────────────────────────────

/**
 * Додати карту до масиву ownedCards.
 * Повертає { nextOwned, result: {type: 'new'|'duplicate', cardId} }
 */
export function addCardToInventory(ownedCards, cardId, quality = 'common') {
  const existing = ownedCards.find((c) => c.cardId === cardId);

  if (!existing) {
    const card = makeOwnedCard(cardId, quality);
    return {
      nextOwned: [
        ...ownedCards,
        card,
      ],
      result: { type: 'new', ...card },
    };
  }

  return {
    nextOwned: ownedCards.map((c) =>
      c.cardId === cardId ? { ...c, copies: c.copies + 1 } : c,
    ),
    result: { type: 'duplicate', cardId, level: existing.level, rarity: existing.rarity, power: existing.power },
  };
}

// ─── Логіка випадання карти ──────────────────────────────────────────────────

export function rollShopCardPack(item, player, shopCardChances = {}) {
  const chances = getPackChances(item, shopCardChances);
  const failIncrement = getEffectiveFailIncrement(item, player);
  const quality = rollQuality(item, chances);
  const canUseSpecial = item.specialDrop
    && quality === 'mythic'
    && (Number(player.level) || 0) >= item.specialDrop.requiredPlayerLevel
    && (Number(player.power) || 0) >= item.specialDrop.requiredPower
    && Math.random() * 100 < item.specialDrop.extraMythicChance;
  const pool = canUseSpecial ? item.specialDrop.cardPool : item.cardPool;
  const cardId = pickRandom(pool);

  if (!cardId) return null;

  return {
    cardId,
    rarity: quality,
    specialDropId: canUseSpecial ? item.specialDrop.id : null,
    specialDropName: canUseSpecial ? item.specialDrop.name : null,
    nextChances: updateCardPackChances(item, chances, quality, failIncrement),
  };
}

// ─── Активація бустера ───────────────────────────────────────────────────────

/**
 * Активувати бустер. Якщо вже є активний — час підсумовується.
 * Повертає новий об'єкт boosters для player.
 */
export function applyBooster(boosters = {}, booster) {
  const now = Date.now();
  const durationMs = booster.effect.durationMinutes * 60 * 1000;
  const stat = booster.effect.stat;
  const active = boosters[stat];

  const baseTime = active && active.endsAt > now ? active.endsAt : now;

  return {
    ...boosters,
    [stat]: {
      multiplier: booster.effect.multiplier,
      endsAt: baseTime + durationMs,
    },
  };
}

// ─── Основна функція покупки ─────────────────────────────────────────────────

/**
 * Виконати покупку. Повертає { ok, error? } або
 * { ok: true, item, rewards, nextState }
 *
 * nextState — патч для dispatch (вже обраховані нові значення)
 */
export function buyShopItem(item, state) {
  const {
    player,
    ownedCards = [],
    purchaseCounts = {},
    ownedCosmetics = [],
    boosters = {},
    shopCardChances = {},
    selectedCurrency,
    confirmedTopUp = false,
  } = state;

  const itemState = getShopItemState(item, player, purchaseCounts, ownedCosmetics, boosters, selectedCurrency);

  if (itemState !== 'available') {
    return { ok: false, error: itemState };
  }

  const paymentPlan = getPaymentPlan(item, player, selectedCurrency);
  if (paymentPlan.goldTopUp > 0 && !confirmedTopUp) {
    return { ok: false, error: 'topUpRequired', paymentPlan };
  }

  // Списати валюту
  const nextPlayer = {
    ...player,
    gold: (Number(player.gold) || 0) - (paymentPlan.spend.gold ?? 0),
    silver: (Number(player.silver) || 0) - (paymentPlan.spend.silver ?? 0),
    gems: (Number(player.gems) || 0) - (paymentPlan.spend.gems ?? 0),
  };

  const nextPurchaseCounts = incrementPurchaseCount(purchaseCounts, item.id);
  let rewards = [];
  let nextOwned = [...ownedCards];
  let nextBoosters = { ...boosters };
  let nextOwnedCosmetics = [...ownedCosmetics];
  let nextShopCardChances = { ...shopCardChances };

  if (item.type === 'shop-card-pack') {
    const rolled = rollShopCardPack(item, player, shopCardChances);
    if (!rolled) {
      return { ok: false, error: 'ITEM_NOT_FOUND' };
    }
    const { nextOwned: updated, result } = addCardToInventory(nextOwned, rolled.cardId, rolled.rarity);
    nextOwned = updated;
    nextShopCardChances = {
      ...nextShopCardChances,
      [item.id]: rolled.nextChances,
    };
    rewards.push({
      cardId: rolled.cardId,
      rarity: result.rarity ?? rolled.rarity,
      level: result.level,
      power: result.power,
      acquireType: result.type,
      specialDropId: rolled.specialDropId,
      specialDropName: rolled.specialDropName,
    });
    nextPlayer.power = getOwnedDeckPower(nextOwned);
  }

  // ─── booster ──────────────────────────────────────────────────────────────
  if (item.type === 'booster') {
    nextBoosters = applyBooster(boosters, item);
    rewards.push({ type: 'booster', stat: item.effect.stat, durationMinutes: item.effect.durationMinutes });
  }

  // ─── cosmetic ─────────────────────────────────────────────────────────────
  if (item.type === 'cosmetic') {
    nextOwnedCosmetics = [...ownedCosmetics, item.id];
    rewards.push({ type: 'cosmetic', id: item.id, title: item.title });
  }

  return {
    ok: true,
    item,
    rewards,
    nextState: {
      player: nextPlayer,
      ownedCards: nextOwned,
      purchaseCounts: nextPurchaseCounts,
      shopCardChances: nextShopCardChances,
      boosters: nextBoosters,
      ownedCosmetics: nextOwnedCosmetics,
    },
  };
}
