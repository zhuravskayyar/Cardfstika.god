/**
 * Форматує число у скорочений вигляд: 34880 → "34.88K", 1000000 → "1M"
 */
export function formatNumber(n) {
  const value = Number(n) || 0;
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'K';
  return value.toLocaleString('uk-UA');
}

/**
 * Форматує секунди у рядок "4 ч 16 м"
 */
export function formatTimer(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h} ч ${m} м`;
  return `${m} м`;
}
