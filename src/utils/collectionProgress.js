import { getCollectionCardIds } from '../engine/collectionEngine.js';

export function getCollectionProgress(collection, ownedCardIds = []) {
  const cardIds = getCollectionCardIds(collection);
  const owned = new Set(ownedCardIds);
  const ownedCount = cardIds.reduce((count, cardId) => count + (owned.has(cardId) ? 1 : 0), 0);

  return {
    owned: ownedCount,
    total: cardIds.length,
    isComplete: cardIds.length > 0 && ownedCount === cardIds.length,
  };
}

export function findCollectionCard(cards, cardId) {
  return cards.find((card) => card.id === cardId) ?? null;
}
