import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import '../../styles/components/BuyGoldBar.css';

export default function BuyGoldBar() {
  const { state, dispatch } = useGame();
  const { hours, minutes } = state.goldTimer;

  const intervalRef = useRef(null);

  const tick = useCallback(() => {
    dispatch({ type: 'TICK_GOLD_TIMER' });
  }, [dispatch]);

  useEffect(() => {
    intervalRef.current = setInterval(tick, 60_000);
    return () => clearInterval(intervalRef.current);
  }, [tick]);

  const timerLabel = hours > 0 ? `${hours} ч ${minutes} м` : `${minutes} м`;

  return (
    <button
      className="buy-gold-bar"
      aria-label={`Купити золото. Таймер: ${timerLabel}`}
      onClick={() => dispatch({ type: 'SET_TAB', payload: 'shop' })}
    >
      <div className="buy-gold-bar__left">
        <span className="buy-gold-bar__icon">🪙</span>
        <div className="buy-gold-bar__text">
          <span className="buy-gold-bar__title">Купити золото</span>
          <span className="buy-gold-bar__subtitle">Вигідна пропозиція</span>
        </div>
      </div>
      <div className="buy-gold-bar__timer">
        <span className="buy-gold-bar__timer-icon">⏱</span>
        <span className="buy-gold-bar__timer-value">{timerLabel}</span>
      </div>
    </button>
  );
}
