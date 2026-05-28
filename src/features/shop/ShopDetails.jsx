import { useState } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import RowButton from '../../components/ui/RowButton.jsx';
import { CARDS } from '../../data/cards.js';
import { getPackChances, getPaymentPlan, getShopItemState } from './shopLogic.js';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import airFallback from '../../assets/cards/pazzle/air.png';
import earthFallback from '../../assets/cards/pazzle/earth.png';
import fireFallback from '../../assets/cards/pazzle/fire.png';
import waterFallback from '../../assets/cards/pazzle/watter.png';
import './shop.css';

const CURRENCY_ICONS = { gold: goldIcon, silver: silverIcon, gems: silverIcon };
const ELEMENT_FALLBACKS = {
  air: airFallback,
  earth: earthFallback,
  fire: fireFallback,
  water: waterFallback,
};

const RARITY_ORDER = ['mythic', 'legendary', 'epic', 'rare', 'uncommon'];

const RARITY_UI = {
  uncommon: {
    plural: 'незвичайні',
    cardText: 'незвичайну карту',
  },
  rare: {
    plural: 'рідкісні',
    cardText: 'рідкісну карту',
  },
  epic: {
    plural: 'епічні',
    cardText: 'епічну карту',
  },
  legendary: {
    plural: 'легендарні',
    cardText: 'легендарну карту',
  },
  mythic: {
    plural: 'міфічні',
    cardText: 'міфічну карту',
  },
};

const STATE_LABELS = {
  soldOut: 'Вичерпано',
  locked: 'Недоступно',
  owned: 'Куплено',
  notEnoughGold: 'Недостатньо золота',
};

const CARDS_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

function formatChance(value) {
  const numeric = Number(value) || 0;
  return `${Number.isInteger(numeric) ? numeric : numeric.toFixed(2).replace(/\.?0+$/, '')}%`;
}

function sortRarities(rarities) {
  return [...rarities].sort((a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b));
}

function ShopDetailChanceRow({ rarity, chance }) {
  const meta = RARITY_UI[rarity] ?? { cardText: `${rarity} карту` };

  return (
    <div className={`shop-detail__chance-row shop-detail__chance-row--${rarity}`}>
      <span className="shop-detail__chance-value">{formatChance(chance)}</span>
      <span className="shop-detail__chance-text">шанс отримати</span>
      <span className="shop-detail__rarity-icon" aria-hidden="true">↧</span>
      <span className="shop-detail__chance-card">{meta.cardText}</span>
    </div>
  );
}

function ShopDetailCardGrid({ rarity, cards }) {
  const meta = RARITY_UI[rarity] ?? { plural: rarity };

  return (
    <section className={`shop-detail__rarity-section shop-detail__rarity-section--${rarity}`}>
      <div className="shop-detail__rarity-heading">
        <span className="shop-detail__rarity-rule" />
        <span className="shop-detail__rarity-icon" aria-hidden="true">↧</span>
        <span>{meta.plural}</span>
        <span className="shop-detail__rarity-icon" aria-hidden="true">↧</span>
        <span className="shop-detail__rarity-rule" />
      </div>

      <div className="shop-detail__card-grid" aria-label={meta.plural}>
        {cards.map((card) => {
          const art = card.art ?? ELEMENT_FALLBACKS[card.element];
          return (
            <div className="shop-detail__card-thumb" key={card.id}>
              <img src={art} alt={card.name} draggable={false} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ShopDetails({ item, onBack, onBuy }) {
  const { state } = useGame();
  const [selectedCurrency, setSelectedCurrency] = useState(item.price.currency);
  const chances = getPackChances(item, state.shopCardChances ?? {});
  const paymentPlan = getPaymentPlan(item, state.player ?? {}, selectedCurrency);
  const itemState = getShopItemState(
    item,
    state.player ?? {},
    state.purchaseCounts ?? {},
    state.ownedCosmetics ?? [],
    state.boosters ?? {},
    selectedCurrency,
  );
  const isAvailable = itemState === 'available';
  const currencyIcon = CURRENCY_ICONS[paymentPlan.currency] ?? goldIcon;
  const chanceRarities = sortRarities(item.higherQualities ?? []);
  const displayRarities = sortRarities(new Set([...(item.higherQualities ?? []), item.guaranteedQuality]));
  const cardPool = (item.cardPool ?? []).map((id) => CARDS_BY_ID.get(id)).filter(Boolean);
  const cardGroups = displayRarities
    .map((rarity) => ({
      rarity,
      cards: cardPool.filter((card) => card.rarity === rarity),
    }))
    .filter((group) => group.cards.length > 0);

  function handleBuy() {
    if (!isAvailable) return;

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
    <div className="shop-detail">
      <div className="shop-detail__price-strip">
        <span>Картки за</span>
        <img src={currencyIcon} alt="" draggable={false} />
        <strong>{paymentPlan.amount}</strong>
      </div>

      <section className="shop-detail__chance-panel" aria-label="Поточні шанси">
        <div className="shop-detail__panel-title">Ваші нинішні шанси:</div>
        {chanceRarities.map((rarity) => (
          <ShopDetailChanceRow key={rarity} rarity={rarity} chance={chances[rarity]} />
        ))}
      </section>

      <div className="shop-detail__buy-zone">
        {item.altPrice && (
          <button
            className="shop-detail__currency-toggle"
            type="button"
            onClick={() => setSelectedCurrency(
              selectedCurrency === item.price.currency ? item.altPrice.currency : item.price.currency,
            )}
          >
            {selectedCurrency === item.price.currency ? 'Золото' : 'Алмази'}
          </button>
        )}
        <button
          className="shop-detail__buy"
          type="button"
          disabled={!isAvailable}
          onClick={handleBuy}
        >
          {isAvailable ? (
            <>
              <span>Купити за</span>
              <img src={currencyIcon} alt="" draggable={false} />
              <strong>{paymentPlan.amount}</strong>
            </>
          ) : (
            <span>{STATE_LABELS[itemState] ?? 'Недоступно'}</span>
          )}
        </button>
      </div>

      <div className="shop-detail__growth-note">
        <span>Шанс зростає при покупці!</span>
      </div>

      <div className="shop-detail__sale-title">Прямо зараз у продажу:</div>

      <div className="shop-detail__rarity-list">
        {cardGroups.map((group) => (
          <ShopDetailCardGrid key={group.rarity} rarity={group.rarity} cards={group.cards} />
        ))}
      </div>

      <div className="shop-detail__actions">
        <RowButton title="Назад в магазин" onClick={onBack} />
      </div>
    </div>
  );
}
