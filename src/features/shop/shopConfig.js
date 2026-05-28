// shopConfig.js — конфіг магазину: всі секції, товари, ціни, ліміти

import { CARD_PACKS } from './shopCardPacks.js';

export { CARD_PACKS };

// ─── Підсилення ─────────────────────────────────────────────────────────────
export const BOOSTERS = [
  {
    id: 'xp_1h',
    title: 'Настоянка ветерана',
    time: 'Час дії: 1 год',
    effectText: '★ +100% досвіду',
    type: 'booster',
    effect: { stat: 'xp', multiplier: 2, durationMinutes: 60 },
    price: { currency: 'gold', amount: 10 },
    icon: 'exp1',
  },
  {
    id: 'silver_1h',
    title: 'Настоянка банкіра',
    time: 'Час дії: 1 год',
    effectText: '◈ +100% срібла в дуелях',
    type: 'booster',
    effect: { stat: 'silver', multiplier: 2, durationMinutes: 60 },
    price: { currency: 'gold', amount: 10 },
    icon: 'silver1',
  },
];

// ─── Косметика ───────────────────────────────────────────────────────────────
export const COSMETICS = {
  skins: [
    {
      id: 'skin_witch',
      category: 'skins',
      title: 'Відьма',
      subtitle: 'Темний образ чаклунки.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 120 },
      color: 'purple',
    },
    {
      id: 'skin_mage',
      category: 'skins',
      title: 'Маг',
      subtitle: 'Класичний образ мага.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 2500 },
      color: 'blue',
    },
    {
      id: 'skin_fox',
      category: 'skins',
      title: 'Лисиця',
      subtitle: 'Образ лисиці-чарівниці.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 2500 },
      color: 'orange',
    },
  ],
  backgrounds: [
    {
      id: 'bg_dark_forest',
      category: 'backgrounds',
      title: 'Темний ліс',
      subtitle: 'Таємничий лісовий фон.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 60 },
      color: 'green',
    },
    {
      id: 'bg_ruins',
      category: 'backgrounds',
      title: 'Стародавні руїни',
      subtitle: 'Фон занедбаних руїн.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 80 },
      color: 'orange',
    },
  ],
  silhouettes: [
    {
      id: 'sil_dragon',
      category: 'silhouettes',
      title: 'Дракон',
      subtitle: 'Силует вогняного дракона.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 90 },
      color: 'orange',
    },
  ],
  effects: [
    {
      id: 'fx_fire_trail',
      category: 'effects',
      title: 'Вогненний слід',
      subtitle: 'Ефект вогненного сліду.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 100 },
      color: 'orange',
    },
    {
      id: 'fx_ice_aura',
      category: 'effects',
      title: 'Льодяна аура',
      subtitle: 'Ефект крижаного сяйва.',
      type: 'cosmetic',
      price: { currency: 'gold', amount: 100 },
      color: 'blue',
    },
  ],
};

// ─── Головна ─────────────────────────────────────────────────────────────────
export const SHOP_HOME_CATEGORIES = [
  {
    id: 'cards',
    title: 'Магічні карти',
    subtitle: 'Очікуються таблиці карт і шансів',
    route: 'cards',
  },
  {
    id: 'cosmetics',
    title: 'Профілі, силуети і петарди',
    subtitle: 'Розділ буде додано після асетів',
    route: 'cosmetics',
  },
  {
    id: 'boosters',
    title: 'Підсилення',
    subtitle: 'Бонуси досвіду та срібла',
    route: 'boosters',
  },
];

// ─── Зведені секції ──────────────────────────────────────────────────────────
export const SHOP_SECTIONS = [
  { id: 'cards',    title: 'Магічні карти',  type: 'card-packs', items: CARD_PACKS },
  { id: 'boosters', title: 'Підсилення',     type: 'boosters',   items: BOOSTERS },
  { id: 'cosmetics',title: 'Профілі, силуети і петарди', type: 'cosmetics',  items: null },
];

export const COSMETICS_TABS = [
  { id: 'skins',       label: 'Обліки' },
  { id: 'backgrounds', label: 'Фони' },
  { id: 'silhouettes', label: 'Силуети' },
  { id: 'effects',     label: 'Ефекти' },
];
