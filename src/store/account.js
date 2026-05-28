import { STARTER_CARDS } from './cards.seed.js';
import { cards } from '../data/cards.js';
import { collections } from '../data/collections.js';

export const ACCOUNT_STORAGE_KEY = 'cardastika:account';
export const ACCOUNT_SCHEMA_VERSION = 2;
export const STARTER_CARD_POWER = 12;
export const DEFAULT_ACCOUNT_NAME = 'Гравець';

const DEFAULT_PLAYER = Object.freeze({
  level: 1,
  exp: 0,
  expToNext: 100,
  gold: 0,
  silver: 500,
  gems: 0,
  stars: 0,
  power: STARTER_CARDS.length * STARTER_CARD_POWER,
});

const DEFAULT_PROFILE = Object.freeze({
  name: DEFAULT_ACCOUNT_NAME,
  birthDate: null,
  gender: null,
  district: null,
  avatar: {
    type: 'pending',
    cardId: null,
    url: null,
  },
});

const DEFAULT_CREDENTIALS = Object.freeze({
  username: '',
  passwordHash: '',
});

const DEFAULT_SHOP_CARD_CHANCES = Object.freeze({
  silver_500: { rare: 5, epic: 1 },
  gold_50: { legendary: 5, mythic: 1 },
  gold_150: { mythic: 5 },
});

const UI_STATE = Object.freeze({
  modes: [
    { id: 'duel', title: 'Дуелі', stat: '', icon: 'swords', iconColor: '#f2c94c', gradient: 'duel' },
    { id: 'campaign', title: 'Кампанія', stat: '', icon: 'campaign', iconColor: '#00d2ff', gradient: 'camp' },
    { id: 'tournament', title: 'Турнір', stat: '', icon: 'tournament', iconColor: '#a0a0a0', gradient: 'tour' },
    { id: 'arena', title: 'Арена', stat: '', icon: 'arena', iconColor: '#a0a0a0', gradient: 'arena' },
    { id: 'deck', title: 'Колода', stat: '', icon: 'deck', iconColor: '#2ecc71', gradient: 'deck' },
    { id: 'invasion', title: 'Нашестя', stat: '', icon: 'invasion', iconColor: '#ff4500', gradient: 'invasion' },
  ],
  listItems: [
    { id: 'tasks', title: 'Завдання', icon: 'tasks', iconColor: '#00ff00', hasDot: false },
    { id: 'diamonds', title: 'Алмазні нагороди', icon: 'diamonds', iconColor: '#00d2ff', hasDot: false },
    { id: 'equipment', title: 'Спорядження', icon: 'equipment', iconColor: '#b7b1a2', hasDot: false },
    { id: 'collections', title: 'Колекції', icon: 'collections', iconColor: '#f2c94c', hasDot: false },
    { id: 'best', title: 'Кращі', icon: 'best', iconColor: '#ffd700', hasDot: false },
    { id: 'shop', title: 'Магазин', icon: 'shop', iconColor: '#cccccc', hasDot: false },
  ],
  tasks: { hasNew: false, count: 0 },
  goldTimer: { hours: 4, minutes: 16 },
  activeTab: 'deck',
  selectedCollectionId: null,
  selectedCardId: null,
});

function newAccountId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `account_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeBirthDate(raw) {
  const value = String(raw ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? value : null;
}

export function validateAccountName(name) {
  const value = String(name ?? '').trim().replace(/\s+/g, ' ');
  const errors = [];

  if (!value) errors.push('required');
  if (value.length > 20) errors.push('tooLong');

  const spaces = (value.match(/ /g) ?? []).length;
  if (spaces > 2) errors.push('tooManySpaces');

  const hasCyrillic = /[А-Яа-яЁёІіЇїЄєҐґ]/.test(value);
  const hasLatin = /[A-Za-z]/.test(value);
  if (hasCyrillic && hasLatin) errors.push('mixedAlphabet');

  const alphabetPattern = hasLatin
    ? /^[A-Za-z]+(?: [A-Za-z]+){0,2}$/
    : /^[А-Яа-яЁёІіЇїЄєҐґ]+(?: [А-Яа-яЁёІіЇїЄєҐґ]+){0,2}$/;

  if (!alphabetPattern.test(value)) errors.push('invalidCharacters');

  return {
    ok: errors.length === 0,
    name: value,
    errors,
  };
}

export async function validateAccountNameUnique(name) {
  const validation = validateAccountName(name);
  return {
    ok: validation.ok,
    name: validation.name,
    errors: validation.errors,
  };
}

export function createDefaultAccount() {
  return {
    schemaVersion: ACCOUNT_SCHEMA_VERSION,
    id: newAccountId(),
    createdAt: new Date().toISOString(),
    isAuthenticated: false,
    credentials: clone(DEFAULT_CREDENTIALS),
    player: clone(DEFAULT_PLAYER),
    profile: clone(DEFAULT_PROFILE),
    ownedCards: STARTER_CARDS.map((card) => ({
      cardId: card.id,
      level: 1,
      rarity: 'common',
      power: STARTER_CARD_POWER,
      copies: 0,
      isNew: false,
    })),
    purchaseCounts: {},
    shopCardChances: clone(DEFAULT_SHOP_CARD_CHANCES),
    boosters: {},
    ownedCosmetics: [],
  };
}

export function createRegisteredAccount({ username, passwordHash }) {
  const validation = validateAccountName(username);
  const safeName = validation.ok ? validation.name : DEFAULT_ACCOUNT_NAME;
  const account = createDefaultAccount();
  return normalizeAccount({
    ...account,
    isAuthenticated: true,
    credentials: {
      username: safeName,
      passwordHash: String(passwordHash ?? ''),
    },
    profile: {
      ...account.profile,
      name: safeName,
    },
    player: {
      ...account.player,
      name: safeName,
    },
  });
}

export function saveAccount(account) {
  if (!canUseStorage()) return account;
  try {
    window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account));
  } catch {
    // Ignore private-mode/quota failures; React state remains authoritative for the session.
  }
  return account;
}

export function resetAccount() {
  const account = createDefaultAccount();
  saveAccount(account);
  return account;
}

export function loadAccount() {
  if (!canUseStorage()) return createDefaultAccount();
  const stored = safeParse(window.localStorage.getItem(ACCOUNT_STORAGE_KEY));
  if (!stored || stored.schemaVersion !== ACCOUNT_SCHEMA_VERSION) {
    return resetAccount();
  }
  return normalizeAccount(stored);
}

export function normalizeAccount(rawAccount) {
  const account = rawAccount && typeof rawAccount === 'object' ? rawAccount : createDefaultAccount();
  const profileName = validateAccountName(account.profile?.name).ok
    ? validateAccountName(account.profile?.name).name
    : DEFAULT_ACCOUNT_NAME;
  const credentialName = validateAccountName(account.credentials?.username).ok
    ? validateAccountName(account.credentials?.username).name
    : '';

  return {
    ...account,
    schemaVersion: ACCOUNT_SCHEMA_VERSION,
    id: String(account.id || newAccountId()),
    createdAt: account.createdAt || new Date().toISOString(),
    isAuthenticated: Boolean(account.isAuthenticated && credentialName && account.credentials?.passwordHash),
    credentials: {
      username: credentialName,
      passwordHash: String(account.credentials?.passwordHash ?? ''),
    },
    player: {
      ...clone(DEFAULT_PLAYER),
      ...(account.player && typeof account.player === 'object' ? account.player : {}),
      name: profileName,
    },
    profile: {
      ...clone(DEFAULT_PROFILE),
      ...(account.profile && typeof account.profile === 'object' ? account.profile : {}),
      name: profileName,
      birthDate: normalizeBirthDate(account.profile?.birthDate),
      gender: ['male', 'female'].includes(account.profile?.gender) ? account.profile.gender : null,
      district: account.profile?.district ? String(account.profile.district) : null,
      avatar: {
        ...clone(DEFAULT_PROFILE.avatar),
        ...(account.profile?.avatar && typeof account.profile.avatar === 'object' ? account.profile.avatar : {}),
      },
    },
    ownedCards: Array.isArray(account.ownedCards) ? account.ownedCards : [],
    purchaseCounts: account.purchaseCounts && typeof account.purchaseCounts === 'object' ? account.purchaseCounts : {},
    shopCardChances: {
      ...clone(DEFAULT_SHOP_CARD_CHANCES),
      ...(account.shopCardChances && typeof account.shopCardChances === 'object' ? account.shopCardChances : {}),
    },
    boosters: account.boosters && typeof account.boosters === 'object' ? account.boosters : {},
    ownedCosmetics: Array.isArray(account.ownedCosmetics) ? account.ownedCosmetics : [],
  };
}

export function accountToGameState(accountLike) {
  const account = normalizeAccount(accountLike);
  const ownedCardIds = account.ownedCards.map((card) => card.cardId).filter(Boolean);

  return {
    ...clone(UI_STATE),
    accountId: account.id,
    createdAt: account.createdAt,
    isAuthenticated: account.isAuthenticated,
    credentials: account.credentials,
    profile: account.profile,
    player: {
      ...account.player,
      name: account.profile.name,
    },
    cards,
    collections,
    ownedCards: account.ownedCards,
    ownedCardIds,
    purchaseCounts: account.purchaseCounts,
    shopCardChances: account.shopCardChances,
    boosters: account.boosters,
    ownedCosmetics: account.ownedCosmetics,
  };
}

export function gameStateToAccount(state) {
  const current = state && typeof state === 'object' ? state : {};
  return normalizeAccount({
    schemaVersion: ACCOUNT_SCHEMA_VERSION,
    id: current.accountId,
    createdAt: current.createdAt,
    isAuthenticated: current.isAuthenticated,
    credentials: current.credentials,
    player: current.player,
    profile: current.profile,
    ownedCards: current.ownedCards,
    purchaseCounts: current.purchaseCounts,
    shopCardChances: current.shopCardChances,
    boosters: current.boosters,
    ownedCosmetics: current.ownedCosmetics,
  });
}

export function loadInitialGameState() {
  const account = loadAccount();
  saveAccount(account);
  return accountToGameState(account);
}
