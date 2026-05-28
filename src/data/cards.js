import { CARDS as SEED_CARDS, CARD_MAX_LEVEL as SEED_MAX_LEVEL } from '../store/cards.seed.js';

// Импорт всех изображений карт в папке assets (Vite import.meta.glob with eager)
const images = import.meta.glob('../assets/cards/**', { eager: true });

// Собираем список файлов: basename (без расширения) -> { url, ext, norm }
const artFiles = [];
function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

for (const p in images) {
  const mod = images[p];
  const url = (mod && mod.default) || mod;
  const parts = p.split('/');
  const file = parts[parts.length - 1];
  const name = file.replace(/\.[^.]+$/, '');
  const ext = file.split('.').pop().toLowerCase();
  artFiles.push({ name, url, ext, norm: normalizeName(name) });
}

export const CARD_MAX_LEVEL = SEED_MAX_LEVEL;

// Cards from the canonical seed. power = basePower at level 1 for UI display.
export const CARDS = SEED_CARDS.map((card) => ({
  ...card,
  power: card.basePower,
  // Найти art: сначала точний збіг по id, потім по нормалізованому включенню
  art: (() => {
    const id = card.id;
    if (!id) return null;
    const normId = normalizeName(id);
    // точний збіг
    const exact = artFiles.find(f => f.name === id);
    if (exact) return exact.url;
    // нормалізований точний
    const normExact = artFiles.find(f => f.norm === normId);
    if (normExact) return normExact.url;
    // файл, ім'я якого містить id (або навпаки)
    const contains = artFiles.find(f => f.name.includes(id) || id.includes(f.name) || f.norm.includes(normId) || normId.includes(f.norm));
    if (contains) return contains.url;
    return null;
  })(),
}));

export const cards = CARDS;
