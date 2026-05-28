import { useGame } from '../../store/GameContext.jsx';
import CardPackItem from './CardPackItem.jsx';
import BonusItem from './BonusItem.jsx';
import RowButton from '../../components/ui/RowButton.jsx';
import { CARD_PACKS, BOOSTERS } from './shopConfig.js';
import { buyShopItem } from './shopLogic.js';
import banner1 from '../../assets/shop/cardsshop/banner_1.png';
import banner2 from '../../assets/shop/cardsshop/banner_2.png';
import banner3 from '../../assets/shop/cardsshop/banner_3.png';
import './shop.css';

const BANNER_MAP = { purple: banner1, green: banner2, orange: banner3 };

/** Банер категорії */
function CategoryBanner({ image, alt }) {
  return (
    <div className="shop-category-banner">
      <img src={image} alt={alt} draggable={false} />
    </div>
  );
}

// ─── Підрозділи ──────────────────────────────────────────────────────────────

function ShopDeferredPanel({ title, children }) {
  return (
    <section className="shop-deferred-panel" aria-label={title}>
      <h2>{title}</h2>
      <div className="shop-deferred-panel__body">{children}</div>
    </section>
  );
}

function CardsSection({ onBuy }) {
  return (
    <>
      <CategoryBanner image={BANNER_MAP.purple} alt="Магічні карти" />
      <div className="shop-items-list">
        {CARD_PACKS.map((item) => (
          <CardPackItem key={item.id} item={item} onBuy={onBuy} />
        ))}
      </div>
    </>
  );
}

function BoostersSection({ onBuy }) {
  return (
    <>
      <div className="shop-bonus-hint">Бонуси активуються одразу!</div>
      <div className="shop-items-list">
        {BOOSTERS.map((item) => (
          <BonusItem key={item.id} item={item} onBuy={onBuy} />
        ))}
      </div>
    </>
  );
}

function CosmeticsSection({ onBuy }) {
  return (
    <>
      <CategoryBanner image={BANNER_MAP.orange} alt="Профілі, силуети і петарди" />
      <ShopDeferredPanel title="Розділ відкладено">
        <p>Профілі, силуети і петарди не продаються до появи фінальних асетів та списку товарів.</p>
      </ShopDeferredPanel>
    </>
  );
}

const SECTIONS = {
  cards:     CardsSection,
  boosters:  BoostersSection,
  cosmetics: CosmeticsSection,
};

// ─── Головний компонент категорії ─────────────────────────────────────────────

export default function ShopCategory({ sectionId, onBack, onNavigate, onPurchased }) {
  const { state, dispatch } = useGame();

  function handleBuy(item, options = {}) {
    const result = buyShopItem(item, {
      player:          state.player,
      ownedCards:      state.ownedCards ?? [],
      purchaseCounts:  state.purchaseCounts ?? {},
      shopCardChances: state.shopCardChances ?? {},
      ownedCosmetics:  state.ownedCosmetics ?? [],
      boosters:        state.boosters ?? {},
      selectedCurrency: options.selectedCurrency,
      confirmedTopUp:  options.confirmedTopUp,
    });

    if (!result.ok) {
      // Повідомлення про помилку обробляється у ShopScreen через callback
      onPurchased?.({ ok: false, error: result.error, item });
      return;
    }

    dispatch({ type: 'SHOP_PURCHASE', payload: result.nextState });
    onPurchased?.({ ok: true, item, rewards: result.rewards });
  }

  const Section = SECTIONS[sectionId];

  return (
    <div className="shop-category">
      {Section ? (
        <Section onBuy={handleBuy} />
      ) : (
        <div className="shop-category__empty">Розділ не знайдено</div>
      )}

      {/* Кнопки дій — скролиться разом із контентом */}
      <div className="shop-category-actions">
        <RowButton title="Назад в магазин" onClick={onBack} />
        <RowButton title="Бойова колода" onClick={() => dispatch({ type: 'SET_TAB', payload: 'deck' })} />
        <RowButton title="Завдання" onClick={() => dispatch({ type: 'SET_TAB', payload: 'tasks' })} />
        <RowButton title="Купити золото" onClick={() => onNavigate?.('gold')} />
      </div>
    </div>
  );
}
