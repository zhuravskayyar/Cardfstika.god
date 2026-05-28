import { createContext, useContext, useReducer } from 'react';
import { accountToGameState, gameStateToAccount, loadInitialGameState, saveAccount } from './account.js';
import { logoutLocal } from './authAdapter.js';
import { loadUiState, saveUiState } from './uiStorage.js';

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

function loadInitialState() {
  const state = loadInitialGameState();
  return {
    ...state,
    ...loadUiState(state),
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
    case 'SHOP_PURCHASE': {
      const p = action.payload;
      return withPersistedAccount({
        ...state,
        player:         p.player         ?? state.player,
        ownedCards:     p.ownedCards     ?? state.ownedCards,
        purchaseCounts: p.purchaseCounts ?? state.purchaseCounts,
        shopCardChances: p.shopCardChances ?? state.shopCardChances,
        boosters:       p.boosters       ?? state.boosters,
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
