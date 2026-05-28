import { useGame } from '../../store/GameContext.jsx';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import bonusBg from '../../assets/shop/bonusshop/bonus.png';
import { getShopItemState } from './shopLogic.js';

import exp1 from '../../assets/shop/bonusshop/bottle/exp1.png';
import silver1 from '../../assets/shop/bonusshop/bottle/silver1.png';

const ICON_MAP = { exp1, silver1 };
const CURRENCY_ICON = { gold: goldIcon, silver: silverIcon };

export default function BonusItem({ item, onBuy }) {
  const { state } = useGame();
  const iconSrc = ICON_MAP[item.icon] ?? null;
  const currencyIcon = CURRENCY_ICON[item.price?.currency] ?? goldIcon;
  const itemState = getShopItemState(
    item,
    state.player ?? {},
    state.purchaseCounts ?? {},
    state.ownedCosmetics ?? [],
    state.boosters ?? {},
  );
  const isAvailable = itemState === 'available';

  const balance =
    item.price?.currency === 'silver'
      ? state.player?.silver ?? 0
      : state.player?.gold ?? 0;
  const canAfford = isAvailable && balance >= (item.price?.amount ?? 0);

  return (
    <div className="shop-item-card shop-bonus-card">
      <img className="shop-item-bg" src={bonusBg} alt="" draggable={false} />

      {iconSrc && (
        <div className="shop-item-icon-slot">
          <img className="shop-item-icon potion" src={iconSrc} alt="" draggable={false} />
        </div>
      )}

      <div className="shop-item-content">
        <div className="shop-item-title">{item.title}</div>
        <div className="shop-item-duration">{item.time}</div>
        <div className="shop-item-bonus">{item.effectText}</div>
      </div>

      <button
        className="shop-item-price"
        aria-disabled={!canAfford}
        disabled={!canAfford}
        data-affordable={canAfford ? 'true' : 'false'}
        onClick={() => onBuy(item)}
        aria-label={`Купити ${item.title}`}
      >
        Купити за
        <img className="price-currency-icon" src={currencyIcon} alt="" draggable={false} />
        {item.price.amount}
      </button>
    </div>
  );
}
