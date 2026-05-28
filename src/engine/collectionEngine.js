export function getCollectionCardIds(collection) {
  if (Array.isArray(collection?.cards)) return collection.cards;
  if (Array.isArray(collection?.cardIds)) return collection.cardIds;
  return [];
}

export function isCollectionComplete(collection, ownedCardIds = []) {
  const cardIds = getCollectionCardIds(collection);
  const owned = new Set(ownedCardIds);
  return cardIds.length > 0 && cardIds.every((cardId) => owned.has(cardId));
}

export function getCompletedCollectionBonuses(collections = [], ownedCardIds = []) {
  return collections
    .filter((collection) => isCollectionComplete(collection, ownedCardIds))
    .map((collection) => collection.bonus)
    .filter(Boolean);
}

