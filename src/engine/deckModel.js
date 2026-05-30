import { elementLabel } from '../data/elements.js';
import { rarityRank } from '../data/rarity.js';
import { getCardLevelForPower, getCardPower, getOwnedCardPower } from './powerEngine.js';
import { getUpgradeIndicator } from './upgradeEngine.js';

const BALANCED_DECK_SIZE = 9;
const BALANCED_ELEMENT_CAP = 3;
const ELEMENT_ORDER = ['air', 'water', 'earth', 'fire'];

export function normalizeOwnedCards(state) {
  const cardById = new Map((state.cards ?? []).map((card) => [card.id, card]));
  return (state.ownedCards ?? [])
    .map((owned) => {
      const base = cardById.get(owned.cardId);
      if (!base) return null;
      const power = getOwnedCardPower(base, owned);
      const level = getCardLevelForPower(base, power);
      return {
        ...base,
        ...owned,
        id: owned.cardId,
        cardId: owned.cardId,
        art: base.art ?? null,
        level,
        rarity: owned.rarity ?? base.rarity ?? 'common',
        elementName: base.elementName ?? elementLabel(base.element),
        power,
        copies: Number(owned.copies) || 0,
        upgradeProgressElements: Number(owned.upgradeProgressElements) || 0,
        absorbedElements: Number(owned.absorbedElements) || 0,
        protected: Boolean(owned.protected),
        origin: base.collectionId ? base.collectionId : 'Starter',
        note: base.bio ?? '',
      };
    })
    .filter(Boolean);
}

function sortCardsByDeckPower(cards) {
  return [...cards].sort((a, b) => {
    if ((Number(b.power) || 0) !== (Number(a.power) || 0)) return (Number(b.power) || 0) - (Number(a.power) || 0);
    if ((Number(b.level) || 1) !== (Number(a.level) || 1)) return (Number(b.level) || 1) - (Number(a.level) || 1);
    return rarityRank(b.rarity) - rarityRank(a.rarity);
  });
}

function pickStrongestBalancedCards(cards, size = BALANCED_DECK_SIZE) {
  const sorted = sortCardsByDeckPower(cards);
  const byElement = new Map(ELEMENT_ORDER.map((element) => [element, []]));
  const extraElements = [];

  for (const card of sorted) {
    if (!byElement.has(card.element)) {
      byElement.set(card.element, []);
      extraElements.push(card.element);
    }
    byElement.get(card.element).push(card);
  }

  const elementOrder = [
    ...ELEMENT_ORDER,
    ...extraElements.filter((element) => !ELEMENT_ORDER.includes(element)),
  ].filter((element) => byElement.get(element)?.length);
  const picked = [];
  const pickedIds = new Set();
  const counts = new Map();

  function take(card) {
    if (!card || pickedIds.has(card.id)) return false;
    picked.push(card);
    pickedIds.add(card.id);
    counts.set(card.element, (counts.get(card.element) ?? 0) + 1);
    return true;
  }

  for (let round = 0; round < BALANCED_ELEMENT_CAP && picked.length < size; round += 1) {
    const candidates = elementOrder
      .map((element) => byElement.get(element)?.[round])
      .filter(Boolean)
      .sort((a, b) => {
        const aCount = counts.get(a.element) ?? 0;
        const bCount = counts.get(b.element) ?? 0;
        if (aCount !== bCount) return aCount - bCount;
        return sortCardsByDeckPower([a, b])[0] === a ? -1 : 1;
      });

    for (const card of candidates) {
      if (picked.length >= size) break;
      take(card);
    }
  }

  if (picked.length < size) {
    for (const card of sorted) {
      if (picked.length >= size) break;
      if (pickedIds.has(card.id)) continue;
      const elementCount = counts.get(card.element) ?? 0;
      const hasOtherOptions = sorted.some(
        (candidate) => !pickedIds.has(candidate.id)
          && candidate.element !== card.element
          && (counts.get(candidate.element) ?? 0) < BALANCED_ELEMENT_CAP,
      );
      if (elementCount >= BALANCED_ELEMENT_CAP && hasOtherOptions) continue;
      take(card);
    }
  }

  return picked;
}

export function buildBattleDeckCards(state) {
  return pickStrongestBalancedCards(normalizeOwnedCards(state));
}

export function buildWeakDeckCards(state) {
  const battleIds = new Set(buildBattleDeckCards(state).map((card) => card.id));
  return sortCardsByDeckPower(normalizeOwnedCards(state).filter((card) => !battleIds.has(card.id)));
}

export function getDeckPowerFromOwnedCards(cards = []) {
  return pickStrongestBalancedCards(cards)
    .reduce((sum, card) => sum + (Number(card.power) || 0), 0);
}

export function getSameElementWeakCardsForTarget(state, targetCard) {
  if (!targetCard) return [];
  return buildWeakDeckCards(state).filter(
    (card) => card.element === targetCard.element && (Number(card.power) || 0) < (Number(targetCard.power) || 0),
  );
}

export function withUpgradeIndicators(cards = [], playerGold = 0) {
  return cards.map((card) => ({
    ...card,
    upgradeIndicator: getUpgradeIndicator(card, playerGold),
  }));
}

export function getRecalculatedOwnedCard(baseCard, ownedCard) {
  const level = Math.max(1, Number(ownedCard.level) || 1);
  return {
    ...ownedCard,
    level,
    power: getCardPower(baseCard, level),
    upgradeProgressElements: Number(ownedCard.upgradeProgressElements) || 0,
    absorbedElements: Number(ownedCard.absorbedElements) || 0,
    protected: Boolean(ownedCard.protected),
  };
}
