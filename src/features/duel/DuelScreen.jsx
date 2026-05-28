import { useMemo } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import DuelButton from '../../components/ui/DuelButton.jsx';
import './DuelScreen.css';

import leaderboardIcon from '../../assets/buttonpazzle/liederboard.png';
import tasksIcon from '../../assets/buttonpazzle/task.png';
import shopIcon from '../../assets/buttonpazzle/shop.png';
import airBg from '../../assets/profil/bg/air.png';
import earthBg from '../../assets/profil/bg/earth.png';
import fireBg from '../../assets/profil/bg/fire.png';
import waterBg from '../../assets/profil/bg/watter.png';
import heroArt from '../../assets/profil/hero/hero.png';

const BACKGROUNDS = [airBg, earthBg, fireBg, waterBg];

const MENU_ROWS = [
  { id: 'duel-rating', label: 'Рейтинг дуелей', icon: leaderboardIcon, hasDot: false, tab: 'duelRating' },
  { id: 'tasks', label: 'Завдання', icon: tasksIcon, hasDot: true, tab: 'tasks' },
  { id: 'shop', label: 'Магазин', icon: shopIcon, hasDot: true, tab: 'shop' },
];

function pickRandomBackground() {
  return BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
}

export default function DuelScreen() {
  const { dispatch } = useGame();
  const background = useMemo(pickRandomBackground, []);

  function handleMenuRow(row) {
    dispatch({ type: 'SET_TAB', payload: row.tab });
  }

  return (
    <section className="duel-page" style={{ '--duel-bg': `url(${background})` }} aria-label="Дуель">
      <div className="duel-status-ribbon">Суперник очікується</div>

      <div className="duel-enemy-line">
        <span className="duel-enemy-avatar" aria-hidden="true" />
        <span className="duel-enemy-name">Суперник</span>
        <span className="duel-enemy-hp">HP -</span>
      </div>

      <section className="duel-battle-frame">
        <div className="duel-side-slots duel-side-slots-left" aria-label="Слоти карт гравця">
          <div className="duel-card-slot" />
          <div className="duel-card-slot" />
          <div className="duel-card-slot" />
          <div className="duel-card-slot" />
        </div>

        <div className="duel-art-stage">
          <img src={heroArt} alt="" className="duel-enemy-art" draggable={false} />
        </div>

        <div className="duel-side-slots duel-side-slots-right" aria-label="Слоти карт суперника">
          <div className="duel-card-slot" />
          <div className="duel-card-slot" />
          <div className="duel-card-slot" />
          <div className="duel-card-slot duel-card-slot-locked">
            <span aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="duel-actions" aria-label="Дії дуелі">
        <DuelButton title="Напасти" variant="primary" onClick={() => dispatch({ type: 'SET_TAB', payload: 'duelBattle' })} />
        <DuelButton title="Шукати ще" variant="secondary" onClick={() => dispatch({ type: 'SET_TAB', payload: 'duelSearch' })} />
      </div>

      <section className="duel-stats" aria-label="Статистика дуелей">
        <div className="duel-rating-line">
          Ваш рейтинг дуелей:
          <span className="duel-green-dot" />
          <b>-</b>
        </div>
        <div className="duel-small-line">
          Залишилось дуелей: <b>-</b>
        </div>
        <div className="duel-small-line">
          Сьогодні здобуто: <b>-</b>
        </div>
      </section>

      <section className="duel-menu-list" aria-label="Меню дуелей">
        {MENU_ROWS.map((row) => (
          <button key={row.id} className="duel-menu-row" type="button" onClick={() => handleMenuRow(row)}>
            <img className="duel-menu-icon" src={row.icon} alt="" aria-hidden="true" draggable={false} />
            <span className="duel-menu-title">{row.label}</span>
            {row.hasDot && <span className="duel-menu-dot" />}
          </button>
        ))}
      </section>
    </section>
  );
}
