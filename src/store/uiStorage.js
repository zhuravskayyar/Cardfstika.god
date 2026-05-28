import { PLACEHOLDER_TAB_IDS } from '../navigation/tabs.js';

export const UI_STORAGE_KEY = 'cardastika:ui';

const COLLECTION_TABS = new Set(['collectionDetail', 'collectionCardDetail']);

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function availableTabs(state) {
  return new Set([
    'home',
    'profile',
    'guild',
    'settings',
    'collections',
    'collectionDetail',
    'collectionCardDetail',
    ...PLACEHOLDER_TAB_IDS,
    ...(state.modes ?? []).map((item) => item.id),
    ...(state.listItems ?? []).map((item) => item.id),
  ]);
}

function collectionExists(state, collectionId) {
  if (!collectionId) return false;
  return (state.collections ?? []).some((collection) => collection.id === collectionId);
}

function cardExists(state, cardId) {
  if (!cardId) return false;
  return (state.cards ?? []).some((card) => card.id === cardId);
}

export function sanitizeUiState(rawUi, state) {
  if (!rawUi || typeof rawUi !== 'object') return {};

  const activeTab = availableTabs(state).has(rawUi.activeTab) ? rawUi.activeTab : null;
  if (!activeTab) return {};

  const selectedCollectionId = collectionExists(state, rawUi.selectedCollectionId)
    ? rawUi.selectedCollectionId
    : null;
  const selectedCardId = cardExists(state, rawUi.selectedCardId)
    ? rawUi.selectedCardId
    : null;

  if (COLLECTION_TABS.has(activeTab) && !selectedCollectionId) {
    return { activeTab: 'collections', selectedCollectionId: null, selectedCardId: null };
  }

  if (activeTab === 'collectionCardDetail' && !selectedCardId) {
    return { activeTab: 'collectionDetail', selectedCollectionId, selectedCardId: null };
  }

  return {
    activeTab,
    selectedCollectionId: activeTab === 'collectionDetail' || activeTab === 'collectionCardDetail'
      ? selectedCollectionId
      : null,
    selectedCardId: activeTab === 'collectionCardDetail' ? selectedCardId : null,
  };
}

export function loadUiState(state) {
  if (!canUseStorage()) return {};
  return sanitizeUiState(safeParse(window.localStorage.getItem(UI_STORAGE_KEY)), state);
}

export function saveUiState(state) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(UI_STORAGE_KEY, JSON.stringify({
      activeTab: state.activeTab,
      selectedCollectionId: state.selectedCollectionId ?? null,
      selectedCardId: state.selectedCardId ?? null,
    }));
  } catch {
    // Ignore private-mode/quota failures; in-memory navigation still works.
  }
}
