import { useGame } from '../../store/GameContext.jsx';
import RowButton from '../../components/ui/RowButton.jsx';
import { SHOP_HOME_CATEGORIES } from './shopConfig.js';
import shopIcon from '../../assets/buttonpazzle/shop.png';
import banner02 from '../../assets/shop/02_shop_banner_sets.png';
import banner03 from '../../assets/shop/03_shop_banner_sets.png';
import banner04 from '../../assets/shop/04_shop_banner_sets.png';
import banner05 from '../../assets/shop/05_shop_banner_sets.png';
import './shop.css';

// Порядок банерів відповідає порядку категорій у SHOP_HOME_CATEGORIES
const BANNER_MAP = {
  cards:     banner02,
  cosmetics: banner03,
  boosters:  banner04,
  gold:      banner05,
};

export default function ShopHome({ onNavigate }) {
  const { dispatch } = useGame();

  return (
    <div className="shop-home">
      {/* Великі банерні панелі */}
      <div className="shop-banners">
        {SHOP_HOME_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`shop-banner shop-banner--${cat.id}`}
            style={BANNER_MAP[cat.id]
              ? { backgroundImage: `url(${BANNER_MAP[cat.id]})` }
              : undefined}
            onClick={() => onNavigate(cat.route)}
            aria-label={cat.title}
          >
            <div className="shop-banner__overlay">
              <div className="shop-banner__title">{cat.title}</div>
              <div className="shop-banner__subtitle">{cat.subtitle}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Нижні рядки-кнопки (як у референсі) */}
      <div className="shop-home__row-buttons">
        <RowButton
          image={shopIcon}
          title="Бойова колода"
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'deck' })}
        />
        <RowButton
          image={shopIcon}
          title="Завдання"
          onClick={() => dispatch({ type: 'SET_TAB', payload: 'tasks' })}
        />
        <RowButton
          image={shopIcon}
          title="Купити золото"
          onClick={() => onNavigate('gold')}
        />
      </div>

      <div className="menu-spacer" />
    </div>
  );
}
