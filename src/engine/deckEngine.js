import { rarityRank } from '../data/rarity.js';
import { getCardPower } from './powerEngine.js';

export function buildBattleDeck(playerCards = []) {
  return [...playerCards]
    .filter((card) => card.owned)
    .map((card) => ({
      ...card,
      currentPower: getCardPower(card, card.level ?? 1),
    }))
    .sort((a, b) => {
      if (b.currentPower !== a.currentPower) return b.currentPower - a.currentPower;
      if ((b.level ?? 1) !== (a.level ?? 1)) return (b.level ?? 1) - (a.level ?? 1);
      return rarityRank(b.rarity) - rarityRank(a.rarity);
    })
    .slice(0, 9);
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

