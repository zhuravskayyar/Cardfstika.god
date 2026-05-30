import { rarityRank } from '../data/rarity.js';
import { getCardPower } from './powerEngine.js';

const BALANCED_DECK_SIZE = 9;
const BALANCED_ELEMENT_CAP = 3;
const ELEMENT_ORDER = ['air', 'water', 'earth', 'fire'];

function sortCardsByDeckPower(cards) {
  return [...cards].sort((a, b) => {
    if (b.currentPower !== a.currentPower) return b.currentPower - a.currentPower;
    if ((b.level ?? 1) !== (a.level ?? 1)) return (b.level ?? 1) - (a.level ?? 1);
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

export function buildBattleDeck(playerCards = []) {
  const cards = [...playerCards]
    .filter((card) => card.owned)
    .map((card) => ({
      ...card,
      currentPower: getCardPower(card, card.level ?? 1),
    }));
  return pickStrongestBalancedCards(cards);
}

export function buildWeakCards(playerCards = []) {
  const battleIds = new Set(buildBattleDeck(playerCards).map((card) => card.id));
  return playerCards.filter((card) => card.owned && !battleIds.has(card.id));
}

export function getDeckPower(deck = []) {
  return deck.reduce((sum, card) => sum + (card.currentPower || getCardPower(card)), 0);
}

export function getPlayerDuelHp(playerCards = []) {
  return getDeckPower(buildBattleDeck(playerCards));
}
