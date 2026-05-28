import { useGame } from '../../store/GameContext.jsx';
import { getPackChances, getPaymentPlan } from './shopLogic.js';
import { CARDS } from '../../data/cards.js';
import goldIcon    from '../../assets/icons/gold.png';
import silverIcon  from '../../assets/icons/silver.png';
import gemIcon     from '../../assets/icons/silver.png';
import banner1     from '../../assets/shop/cardsshop/banner_1.png';
import banner2     from '../../assets/shop/cardsshop/banner_2.png';
import banner3     from '../../assets/shop/cardsshop/banner_3.png';
import './shop.css';

/* banner_1 = green, banner_2 = purple, banner_3 = orange */
const BANNER_MAP  = { green: banner1, purple: banner2, orange: banner3 };
const CURRENCY_ICONS = { gold: goldIcon, silver: silverIcon, gems: gemIcon };
const CARDS_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

const RARITY_CHANCE_TEXT = {
  rare: 'рідкісної',
  epic: 'епічної',
  legendary: 'легендарної',
  mythic: 'міфічної',
};

export default function CardPackItem({ item, onBuy, onDetails }) {
  const { state } = useGame();
  const { player, shopCardChances = {} } = state;
  const selectedCurrency = item.price.currency;

  const banner       = BANNER_MAP[item.color] ?? banner1;
  const paymentPlan  = getPaymentPlan(item, player, selectedCurrency);
  const currencyIcon = CURRENCY_ICONS[paymentPlan.currency];
  const chances      = getPackChances(item, shopCardChances);
  const chanceRarity = item.chanceRarity ?? item.higherQualities?.[item.higherQualities.length - 1];
  const chanceValue = chances[chanceRarity] ?? 0;
  const chanceLabel = RARITY_CHANCE_TEXT[chanceRarity] ?? 'кращої';
  const previewCard = (item.cardPool ?? [])
    .map((cardId) => CARDS_BY_ID.get(cardId))
    .find((card) => card?.rarity === item.guaranteedQuality)
    ?? CARDS_BY_ID.get(item.cardPool?.[0]);

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
        {previewCard?.art && (
          <img src={previewCard.art} alt={previewCard.name} draggable={false} />
        )}
      </div>

      {/* Текстовий блок: назва → шанс → подробніше → ліміт */}
      <div className="shop-pack-item__text">
        <div className={`shop-pack-item__title shop-pack-item__title--${item.color ?? 'default'}`}>
          {item.title}
        </div>

        <div className="shop-pack-item__desc">
          <span className={`shop-pack-item__chance shop-pack-item__chance--${chanceRarity ?? 'rare'}`}>
            {chanceValue}%
          </span>
          <span className="shop-pack-item__chance-label">шанс {chanceLabel}</span>
          <button
            type="button"
            className="shop-pack-item__more"
            onClick={() => onDetails?.(item.id)}
          >
            Подробніше&nbsp;<span className="shop-pack-item__more-icon">ⓘ</span>
          </button>
        </div>

        {item.limit === 1 && (
          <div className="shop-pack-item__limit">Доступно 1 раз!</div>
        )}
      </div>

      {/* Кнопка купівлі / стрічка стану */}
      <div className="shop-pack-item__buy-wrap">
        <button
          className="shop-pack-item__buy"
          onClick={handleBuy}
          aria-label={`Купити ${item.title}`}
          data-currency={paymentPlan.currency}
        >
          <span>Купити за</span>
          <img className="shop-pack-item__buy-icon" src={currencyIcon} alt="" draggable={false} />
          {paymentPlan.amount}
        </button>
      </div>
    </div>
  );
}
