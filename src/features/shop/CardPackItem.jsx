import { useState } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import { getPackChances, getPaymentPlan, getShopItemState } from './shopLogic.js';
import goldIcon    from '../../assets/icons/gold.png';
import silverIcon  from '../../assets/icons/silver.png';
import gemIcon     from '../../assets/icons/silver.png';
import greenRibbon from '../../assets/bage/green.png';
import banner1     from '../../assets/shop/cardsshop/banner_1.png';
import banner2     from '../../assets/shop/cardsshop/banner_2.png';
import banner3     from '../../assets/shop/cardsshop/banner_3.png';
import './shop.css';

/* banner_1 = green, banner_2 = purple, banner_3 = orange */
const BANNER_MAP  = { green: banner1, purple: banner2, orange: banner3 };
const CURRENCY_ICONS = { gold: goldIcon, silver: silverIcon, gems: gemIcon };

const STATE_LABELS = {
  soldOut:         'Вичерпано',
  locked:          'Недоступно',
  owned:           'Куплено',
};

export default function CardPackItem({ item, onBuy }) {
  const { state, dispatch } = useGame();
  const { player, purchaseCounts = {}, ownedCosmetics = [], shopCardChances = {} } = state;
  const [selectedCurrency, setSelectedCurrency] = useState(item.price.currency);

  const itemState    = getShopItemState(item, player, purchaseCounts, ownedCosmetics, state.boosters ?? {}, selectedCurrency);
  const isAvailable  = itemState === 'available';
  const banner       = BANNER_MAP[item.color] ?? banner1;
  const paymentPlan  = getPaymentPlan(item, player, selectedCurrency);
  const currencyIcon = CURRENCY_ICONS[paymentPlan.currency];
  const chances      = getPackChances(item, shopCardChances);
  const chanceText   = (item.higherQualities ?? [])
    .map((quality) => `${quality}: ${chances[quality]}%`)
    .join(' / ');

  function handleBuy() {
    if (paymentPlan.goldTopUp > 0) {
      const ok = window.confirm(`Не вистачає основної валюти. Доплатити ${paymentPlan.goldTopUp} золота?`);
      if (!ok) return;
    }

    onBuy(item, {
      selectedCurrency,
      confirmedTopUp: paymentPlan.goldTopUp > 0,
    });
  }

  return (
    <div
      className="shop-pack-item"
      style={{ backgroundImage: `url(${banner})` }}
    >
      {/* Іконка стихії / арт */}
      <div className="shop-pack-item__art-zone">
      </div>

      {/* Текстовий блок: назва → шанс → подробніше → ліміт */}
      <div className="shop-pack-item__text">
        <div className={`shop-pack-item__title shop-pack-item__title--${item.color ?? 'default'}`}>
          {item.title}
        </div>

        {(item.chance || item.chanceLabel) && (
          <div className="shop-pack-item__desc">
            {item.chance && (
              <span className={`shop-pack-item__chance shop-pack-item__chance--${item.chanceRarity ?? 'rare'}`}>
                {item.chance}%
              </span>
            )}
            {item.chanceLabel && (
              <span className="shop-pack-item__chance-label">{item.chanceLabel}</span>
            )}
            {!item.chance && chanceText && (
              <span className={`shop-pack-item__chance shop-pack-item__chance--${item.chanceRarity ?? 'rare'}`}>
                {chanceText}
              </span>
            )}
          </div>
        )}

        {!item.chance && chanceText && (
          <div className="shop-pack-item__desc">
            <span className={`shop-pack-item__chance shop-pack-item__chance--${item.chanceRarity ?? 'rare'}`}>
              {chanceText}
            </span>
          </div>
        )}

        <button
          type="button"
          className="shop-pack-item__more"
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'shopDetails' })}
        >
          Подробніше&nbsp;<span className="shop-pack-item__more-icon">ⓘ</span>
        </button>

        {item.limit === 1 && (
          <div className="shop-pack-item__limit">Доступно 1 раз!</div>
        )}
      </div>

      {/* Кнопка купівлі / стрічка стану */}
      {isAvailable ? (
        <div className="shop-pack-item__buy-wrap">
          {item.altPrice && (
            <button
              className="shop-pack-item__currency-toggle"
              type="button"
              onClick={() => setSelectedCurrency(selectedCurrency === item.price.currency ? item.altPrice.currency : item.price.currency)}
            >
              {selectedCurrency === item.price.currency ? 'Золото' : 'Алмази'}
            </button>
          )}
          <button
            className="shop-pack-item__buy"
            onClick={handleBuy}
            aria-label={`Купити ${item.title}`}
          >
            <img className="shop-pack-item__buy-icon" src={currencyIcon} alt="" draggable={false} />
            {paymentPlan.amount}
          </button>
        </div>
      ) : (
        <div className="shop-pack-item__ribbon">
          <img className="shop-pack-item__ribbon-img" src={greenRibbon} alt="" draggable={false} />
          <span className="shop-pack-item__ribbon-text">
            {STATE_LABELS[itemState] ?? 'Недоступно'}
          </span>
        </div>
      )}
    </div>
  );
}
