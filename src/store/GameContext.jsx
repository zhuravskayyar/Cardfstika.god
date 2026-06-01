import { createContext, useContext, useReducer } from 'react';
import { accountToGameState, gameStateToAccount, loadInitialGameState, saveAccount } from './account.js';
import { logoutLocal } from './authAdapter.js';
import { loadUiState, saveUiState } from './uiStorage.js';
import { CARDS } from '../data/cards.js';
import { buildBattleDeckCards, buildWeakDeckCards, normalizeOwnedCards, getDeckPowerFromOwnedCards } from '../engine/deckModel.js';
import { attackLane, createDuelBattle, createDuelOpponent } from '../engine/duelEngine.js';
import {
  applyDuelBattleResultToState,
  applyTechnicalLossIfExpired,
  consumeDuelStart,
  grantExtraDuelForGoldUpgrade,
  openDuelsWithGold,
  refreshDuelAvailability,
  runAutoDuels,
} from '../engine/duelProgression.js';
import { getCardPower } from '../engine/powerEngine.js';
import {
  canFreeUpgrade,
  getCardAvailableElements,
  getGoldUpgradeCost,
  getUpgradeProgress,
} from '../engine/upgradeEngine.js';

export const GameContext = createContext(null);

function refreshOwnedCardIds(state) {
  return {
    ...state,
    ownedCardIds: (state.ownedCards ?? []).map((card) => card.cardId).filter(Boolean),
  };
}

function withPersistedAccount(state) {
  const next = refreshOwnedCardIds(state);
  saveAccount(gameStateToAccount(next));
  return next;
}

function withAppliedAccount(account, uiOverrides = {}) {
  const next = {
    ...accountToGameState(account),
    ...uiOverrides,
  };
  saveAccount(gameStateToAccount(next));
  if (Object.keys(uiOverrides).length > 0) {
    saveUiState(next);
  }
  return next;
}

function withPersistedUi(state) {
  saveUiState(state);
  return state;
}

function recalculatePlayerPower(state, ownedCards = state.ownedCards) {
  const normalized = normalizeOwnedCards({ ...state, ownedCards, cards: state.cards ?? CARDS });
  return getDeckPowerFromOwnedCards(normalized);
}

function getBaseCard(cardId, state) {
  return (state.cards ?? CARDS).find((card) => card.id === cardId);
}

function recalculateOwnedCard(state, ownedCard) {
  const base = getBaseCard(ownedCard.cardId, state);
  if (!base) return ownedCard;
  const level = Math.max(1, Number(ownedCard.level) || 1);
  return {
    ...ownedCard,
    level,
    power: getCardPower(base, level),
    upgradeProgressElements: Number(ownedCard.upgradeProgressElements) || 0,
    absorbedElements: Number(ownedCard.absorbedElements) || 0,
    protected: Boolean(ownedCard.protected),
  };
}

function applyFreeUpgrades(state, ownedCard) {
  let next = recalculateOwnedCard(state, ownedCard);
  while (canFreeUpgrade(next)) {
    const progress = getUpgradeProgress(next);
    next = recalculateOwnedCard(state, {
      ...next,
      level: next.level + 1,
      upgradeProgressElements: Math.max(0, (Number(next.upgradeProgressElements) || 0) - progress.required),
    });
  }
  return next;
}

function loadInitialState() {
  const state = loadInitialGameState();
  return {
    ...state,
    ...loadUiState(state),
  };
}

function emptyDuelSession(message = null) {
  return {
    phase: 'search',
    enemy: null,
    battle: null,
    result: null,
    message,
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_GOLD':
      return withPersistedAccount({ ...state, player: { ...state.player, gold: action.payload } });
    case 'UPDATE_SILVER':
      return withPersistedAccount({ ...state, player: { ...state.player, silver: action.payload } });
    case 'UPDATE_GEMS':
      return withPersistedAccount({ ...state, player: { ...state.player, gems: action.payload } });
    case 'AUTH_APPLY_ACCOUNT':
      return withAppliedAccount(action.payload, {
        activeTab: 'home',
        selectedCollectionId: null,
        selectedCardId: null,
      });
    case 'AUTH_LOGOUT':
      return withAppliedAccount(logoutLocal(gameStateToAccount(state)));
    case 'COMPLETE_TASK':
      return { ...state, tasks: { hasNew: false, count: 0 } };
    case 'OPEN_COLLECTIONS':
      return withPersistedUi({
        ...state,
        activeTab: 'collections',
        selectedCollectionId: null,
        selectedCardId: null,
      });
    case 'OPEN_COLLECTION':
      return withPersistedUi({
        ...state,
        activeTab: 'collectionDetail',
        selectedCollectionId: action.payload,
        selectedCardId: null,
      });
    case 'OPEN_COLLECTION_CARD':
      return withPersistedUi({
        ...state,
        activeTab: 'collectionCardDetail',
        selectedCardId: action.payload,
      });
    case 'BACK_TO_COLLECTIONS':
      return withPersistedUi({
        ...state,
        activeTab: 'collections',
        selectedCollectionId: null,
        selectedCardId: null,
      });
    case 'BACK_TO_COLLECTION':
      return withPersistedUi({
        ...state,
        activeTab: 'collectionDetail',
        selectedCardId: null,
      });
    case 'DUEL_FIND_ENEMY': {
      const playerDeck = buildBattleDeckCards(state);
      const enemy = createDuelOpponent(playerDeck);
      const refreshed = refreshDuelAvailability(state);
      const playerPower = getDeckPowerFromOwnedCards(playerDeck);
      const strongEnemyStreak = enemy.power > playerPower
        ? (Number(refreshed.duel?.strongEnemyStreak) || 0) + 1
        : 0;
      return withPersistedAccount({
        ...refreshed,
        duel: {
          ...refreshed.duel,
          strongEnemyStreak,
        },
        activeTab: 'duel',
        duelSession: {
          phase: 'found',
          enemy,
          battle: null,
          result: null,
          message: null,
        },
      });
    }
    case 'DUEL_START_BATTLE': {
      const playerDeck = buildBattleDeckCards(state);
      const enemy = state.duelSession?.enemy ?? createDuelOpponent(playerDeck);
      const consumed = consumeDuelStart(state);
      if (!consumed.ok) {
        return withPersistedAccount({
          ...consumed.state,
          activeTab: 'duel',
          duelSession: {
            phase: state.duelSession?.phase === 'found' ? 'found' : 'search',
            enemy,
            battle: null,
            result: null,
            message: 'Доступні дуелі закінчилися. Відкрий дуелі за золото або запусти автобій.',
          },
        });
      }

      try {
        return withPersistedAccount({
          ...consumed.state,
          activeTab: 'duel',
          duelSession: {
            phase: 'battle',
            enemy,
            battle: createDuelBattle(playerDeck, enemy.deck),
            result: null,
            message: null,
          },
        });
      } catch {
        return withPersistedAccount({
          ...consumed.state,
          activeTab: 'duel',
          duelSession: {
            phase: 'found',
            enemy,
            battle: null,
            result: null,
            message: 'Бій не стартував: потрібно щонайменше 3 карти з кожного боку.',
          },
        });
      }
    }
    case 'DUEL_ATTACK_LANE': {
      const session = state.duelSession;
      if (session?.phase !== 'battle' || !session.battle) return state;

      const timeout = applyTechnicalLossIfExpired(state, session);
      if (timeout.expired) {
        return withPersistedAccount({
          ...timeout.state,
          activeTab: 'duel',
          duelSession: {
            ...session,
            phase: 'result',
            battle: timeout.battle,
            result: timeout.summary,
            message: 'Дуель завершена технічною поразкою через 30 хвилин без активності.',
          },
        });
      }

      const activeState = {
        ...timeout.state,
        duel: {
          ...timeout.state.duel,
          lastActivityAt: Date.now(),
        },
      };
      const battle = attackLane(session.battle, action.payload?.laneIndex ?? action.payload);
      if (!battle?.finished) {
        return withPersistedAccount({
          ...activeState,
          duelSession: {
            ...session,
            battle,
          },
        });
      }

      const applied = applyDuelBattleResultToState(activeState, battle);
      return withPersistedAccount({
        ...applied.state,
        activeTab: 'duel',
        duelSession: {
          ...session,
          phase: 'result',
          battle,
          result: applied.summary,
          message: null,
        },
      });
    }
    case 'DUEL_OPEN_WITH_GOLD': {
      const opened = openDuelsWithGold(state);
      return withPersistedAccount({
        ...opened.state,
        activeTab: 'duel',
        duelSession: {
          ...(state.duelSession ?? emptyDuelSession()),
          phase: opened.ok ? 'search' : (state.duelSession?.phase ?? 'search'),
          battle: null,
          result: null,
          message: opened.ok
            ? `Дуелі відкрито за ${opened.cost} золота.`
            : `Не вистачає золота: потрібно ${opened.cost}.`,
        },
      });
    }
    case 'DUEL_AUTO_RUN': {
      const playerDeck = buildBattleDeckCards(state);
      try {
        const auto = runAutoDuels(state, playerDeck, action.payload?.count ?? 10);
        return withPersistedAccount({
          ...auto.state,
          activeTab: 'duel',
          duelSession: {
            phase: 'result',
            enemy: null,
            battle: null,
            result: auto.summary
              ? { result: auto.summary.losses > auto.summary.wins ? 'lose' : 'win', auto: auto.summary }
              : null,
            message: auto.ok
              ? `Автобій завершено: перемог ${auto.summary.wins} з ${auto.summary.battles}.`
              : `Автобій недоступний: потрібно ${auto.cost} золота.`,
          },
        });
      } catch {
        return {
          ...state,
          duelSession: {
            ...(state.duelSession ?? emptyDuelSession()),
            message: 'Автобій не стартував: потрібно щонайменше 3 карти з кожного боку.',
          },
        };
      }
    }
    case 'DUEL_CHECK_TIMEOUT': {
      const session = state.duelSession;
      const timeout = applyTechnicalLossIfExpired(state, session);
      if (!timeout.expired) return timeout.state;
      return withPersistedAccount({
        ...timeout.state,
        activeTab: 'duel',
        duelSession: {
          ...session,
          phase: 'result',
          battle: timeout.battle,
          result: timeout.summary,
          message: 'Дуель завершена технічною поразкою через 30 хвилин без активності.',
        },
      });
    }
    case 'DUEL_RESET':
      return {
        ...state,
        activeTab: 'duel',
        duelSession: emptyDuelSession(),
      };
    case 'SET_TAB':
      return withPersistedUi({
        ...state,
        activeTab: action.payload,
        selectedCollectionId: null,
        selectedCardId: null,
      });
    case 'TICK_GOLD_TIMER': {
      const { hours, minutes } = state.goldTimer;
      const totalMinutes = hours * 60 + minutes;
      if (totalMinutes <= 0) return state;
      const next = totalMinutes - 1;
      return { ...state, goldTimer: { hours: Math.floor(next / 60), minutes: next % 60 } };
    }
    case 'TOGGLE_CARD_PROTECTION': {
      const cardId = action.payload;
      const ownedCards = (state.ownedCards ?? []).map((card) =>
        card.cardId === cardId ? { ...card, protected: !card.protected } : card,
      );
      return withPersistedAccount({ ...state, ownedCards });
    }
    case 'ABSORB_WEAK_CARD': {
      const { targetCardId, sourceCardId } = action.payload ?? {};
      if (!targetCardId || !sourceCardId || targetCardId === sourceCardId) return state;

      const normalized = normalizeOwnedCards(state);
      const target = normalized.find((card) => card.id === targetCardId);
      const source = normalized.find((card) => card.id === sourceCardId);
      if (!target || !source || source.protected || target.element !== source.element || source.power >= target.power) {
        return state;
      }

      const weakIds = new Set(buildWeakDeckCards(state).map((card) => card.id));
      if (!weakIds.has(source.id)) return state;

      const sourceElements = getCardAvailableElements(source);
      const ownedCards = (state.ownedCards ?? [])
        .filter((card) => card.cardId !== sourceCardId)
        .map((card) => {
          if (card.cardId !== targetCardId) return card;
          return applyFreeUpgrades(state, {
            ...card,
            upgradeProgressElements: (Number(card.upgradeProgressElements) || 0) + sourceElements,
            absorbedElements: (Number(card.absorbedElements) || 0) + sourceElements,
          });
        });
      return withPersistedAccount({
        ...state,
        ownedCards,
        player: {
          ...state.player,
          power: recalculatePlayerPower(state, ownedCards),
        },
      });
    }
    case 'UPGRADE_CARD_FREE': {
      const cardId = action.payload?.cardId ?? action.payload;
      const normalized = normalizeOwnedCards(state);
      const target = normalized.find((card) => card.id === cardId);
      if (!target || !canFreeUpgrade(target)) return state;

      const progress = getUpgradeProgress(target);
      const ownedCards = (state.ownedCards ?? []).map((card) => {
        if (card.cardId !== cardId) return card;
        return applyFreeUpgrades(state, {
          ...card,
          level: (Number(target.level) || 1) + 1,
          upgradeProgressElements: Math.max(0, (Number(target.upgradeProgressElements) || 0) - progress.required),
        });
      });
      return withPersistedAccount({
        ...state,
        ownedCards,
        player: {
          ...state.player,
          power: recalculatePlayerPower(state, ownedCards),
        },
      });
    }
    case 'UPGRADE_CARD_WITH_GOLD': {
      const cardId = action.payload?.cardId ?? action.payload;
      const normalized = normalizeOwnedCards(state);
      const target = normalized.find((card) => card.id === cardId);
      if (!target) return state;

      const progress = getUpgradeProgress(target);
      const cost = getGoldUpgradeCost(target);
      if (progress.isMax || !progress.isGolden || (Number(state.player?.gold) || 0) < cost) return state;

      const ownedCards = (state.ownedCards ?? []).map((card) => {
        if (card.cardId !== cardId) return card;
        return recalculateOwnedCard(state, {
          ...card,
          level: (Number(target.level) || 1) + 1,
          upgradeProgressElements: 0,
        });
      });
      const upgradedState = {
        ...state,
        ownedCards,
        player: {
          ...state.player,
          gold: (Number(state.player?.gold) || 0) - cost,
          power: recalculatePlayerPower(state, ownedCards),
        },
      };
      return withPersistedAccount(grantExtraDuelForGoldUpgrade(upgradedState));
    }
    case 'SHOP_PURCHASE': {
      const p = action.payload;
      return withPersistedAccount({
        ...state,
        player: p.player ?? state.player,
        ownedCards: p.ownedCards ?? state.ownedCards,
        purchaseCounts: p.purchaseCounts ?? state.purchaseCounts,
        shopCardChances: p.shopCardChances ?? state.shopCardChances,
        boosters: p.boosters ?? state.boosters,
        ownedCosmetics: p.ownedCosmetics ?? state.ownedCosmetics,
      });
    }
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadInitialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
