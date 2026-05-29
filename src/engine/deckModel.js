import { elementLabel } from '../data/elements.js';
import { rarityRank } from '../data/rarity.js';
import { getCardLevelForPower, getCardPower, getOwnedCardPower } from './powerEngine.js';
import { getUpgradeIndicator } from './upgradeEngine.js';

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

export function buildBattleDeckCards(state) {
  return sortCardsByDeckPower(normalizeOwnedCards(state)).slice(0, 9);
}

export function buildWeakDeckCards(state) {
  const battleIds = new Set(buildBattleDeckCards(state).map((card) => card.id));
  return sortCardsByDeckPower(normalizeOwnedCards(state).filter((card) => !battleIds.has(card.id)));
}

export function getDeckPowerFromOwnedCards(cards = []) {
  return sortCardsByDeckPower(cards)
    .slice(0, 9)
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
