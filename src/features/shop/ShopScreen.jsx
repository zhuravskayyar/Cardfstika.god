import { useState } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import TopBar from '../../components/layout/TopBar.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';
import ShopHome from './ShopHome.jsx';
import ShopCategory from './ShopCategory.jsx';
import PurchaseResult from './PurchaseResult.jsx';
import './shop.css';

const SECTION_TITLES = {
  cards:     'Магічні карти',
  sets:      'Готові набори',
  cosmetics: 'Обліки та фони',
  boosters:  'Підсилення',
  gold:      'Купити золото',
};

export default function ShopScreen() {
  const { dispatch } = useGame();
  const [section, setSection] = useState(null);   // null = головна
  const [result, setResult]   = useState(null);   // результат покупки

  function handleNavigate(route) {
    setSection(route);
  }

  function handleBack() {
    setSection(null);
  }

  function handlePurchased(purchaseResult) {
    setResult(purchaseResult);
  }

  function handleCloseResult() {
    setResult(null);
  }

  const pageTitle = section ? (SECTION_TITLES[section] ?? 'Магазин') : 'Магазин';

  return (
    <div className="shop-screen-wrapper">
      <div className="shop-screen">
        {/* TopBar */}
        <TopBar />

        {/* Скролиться контент + bottom-menu */}
        <div className="shop-screen__body">
          {section ? (
            <ShopCategory
              sectionId={section}
              onBack={handleBack}
              onNavigate={handleNavigate}
              onPurchased={handlePurchased}
            />
          ) : (
            <ShopHome onNavigate={handleNavigate} />
          )}

          {/* Bottom menu скролиться разом із контентом */}
        </div>
        <BottomNav />

        {/* Модальне вікно результату */}
        {result && (
          <PurchaseResult result={result} onClose={handleCloseResult} />
        )}
      </div>
    </div>
  );
}
