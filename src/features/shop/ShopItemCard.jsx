import { useGame } from '../../store/GameContext.jsx';
import { getShopItemState } from './shopLogic.js';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import './shop.css';

const CURRENCY_ICONS = { gold: goldIcon, silver: silverIcon };

const STATE_LABELS = {
  soldOut:        'Вичерпано',
  locked:         'Недоступно',
  owned:          'Куплено',
};

export default function ShopItemCard({ item, onBuy }) {
  const { state, dispatch } = useGame();
  const { player, purchaseCounts = {}, ownedCosmetics = [] } = state;

  const itemState = getShopItemState(item, player, purchaseCounts, ownedCosmetics);
  const isAvailable = itemState === 'available' || itemState === 'notEnoughGold' || itemState === 'notEnoughSilver';
  const currencyIcon = CURRENCY_ICONS[item.price.currency];
  const rarity = item.rarity || item.color || 'default';

  return (
    <div className={`shop-item-card shop-item-card--${rarity}`} style={{ backgroundImage: `url(${item.image})` }}>
      {/* Паз карти зліва */}
      <div className="shop-item-preview"></div>

      {/* Назва товару */}
      <h3 className="shop-item-title">{item.title}</h3>

      {/* Мета (шанс + опис) */}
      {item.percent && (
        <div className="shop-item-meta">
          <span className={`shop-item-percent shop-item-percent--${item.rarityColor || rarity}`}>
            {item.percent}%
          </span>
          {item.description && (
            <span className="shop-item-desc">{item.description}</span>
          )}
        </div>
      )}

      {/* Подробніше */}
      {item.hasMore && (
        <button
          type="button"
          className="shop-item-more"
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'shopDetails' })}
        >
          Подробніше ⓘ
        </button>
      )}

      {/* Ліміт */}
      {item.limit === 1 && (
        <div className="shop-item-limit">Доступно 1 раз!</div>
      )}

      {/* Кнопка купівлі */}
      {isAvailable ? (
        <button
          className="shop-buy-button"
          onClick={() => onBuy(item)}
          aria-label={`Купити ${item.title}`}
        >
          <img className="shop-buy-button__icon" src={currencyIcon} alt="" draggable={false} />
          <span>Купити за {item.price.amount}</span>
        </button>
      ) : (
        <div className="shop-item-ribbon">
          {STATE_LABELS[itemState] ?? 'Недоступно'}
        </div>
      )}
    </div>
  );
}
