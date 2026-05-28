import { useState } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import { formatNumber } from '../../utils/formatNumber.js';
import './ProfileScreen.css';

import startAvatar from '../../assets/avatar/start.png';
import heroArt from '../../assets/profil/hero/hero.png';
import powerIcon from '../../assets/icons/power.png';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import mailIcon from '../../assets/buttonpazzle/task.png';
import deckIcon from '../../assets/main menu/deck.png';
import equipmentIcon from '../../assets/buttonpazzle/items.png';
import recordsIcon from '../../assets/buttonpazzle/liederboard.png';
import giftsIcon from '../../assets/icons/gold.png';

const SECTION_ROWS = [
  { id: 'mail', label: 'Моя пошта', icon: mailIcon, action: 'mail' },
  { id: 'deck', label: 'Бойова колода', icon: deckIcon, action: 'deck', hasDot: true },
  { id: 'equipment', label: 'Спорядження', icon: equipmentIcon, action: 'equipment' },
  { id: 'records', label: 'Рекорди', icon: recordsIcon, action: 'records' },
];

const TROPHY_STATS = [
  { label: 'Кращий титул', value: 'Немає' },
  { label: 'Медаль дракона', value: 'Немає' },
  { label: 'Награда турніра', value: 'Немає' },
  { label: 'Лучше достижение', value: 'Немає' },
];

const RATING_STATS = [
  { label: 'Колода', value: '0', note: 'Без рейтингу' },
  { label: 'Дуелі', value: '0', note: 'Не грав' },
  { label: 'Арена', value: '0', note: 'Не грав' },
  { label: 'Турнір', value: '0', note: 'Не грав' },
];

function avatarUrl(profile) {
  const avatar = profile?.avatar;
  if (avatar?.url) return avatar.url;
  return startAvatar;
}

function useToast() {
  const [toast, setToast] = useState('');

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(''), 1800);
  }

  return [toast, showToast];
}

function ProfileRow({ row, onClick }) {
  return (
    <button className="profile-row" type="button" onClick={() => onClick(row)}>
      <span className="profile-row__icon">
        <img src={row.icon} alt="" draggable={false} />
      </span>
      <span className="profile-row__text">{row.label}</span>
      {row.hasDot && <span className="profile-row__dot" />}
    </button>
  );
}

export default function ProfileScreen() {
  const { state, dispatch } = useGame();
  const [toast, showToast] = useToast();
  const player = state.player ?? {};
  const profile = state.profile ?? {};
  const name = profile.name || player.name || 'Гравець';
  const level = Number(player.level) || 1;
  const deckPower = Number(player.power) || 0;
  const silver = Number(player.silver) || 0;
  const gold = Number(player.gold) || 0;

  function handleRow(row) {
    dispatch({ type: 'SET_TAB', payload: row.action });
  }

  return (
    <section className="profile-screen" aria-label="Профіль">
      <div className="profile-titlebar">Ваш профіль</div>

      <section className="profile-hero">
        <div className="profile-identity profile-identity--self">
          <div className="profile-avatar">
            <img src={avatarUrl(profile)} alt="" draggable={false} />
          </div>
          <div className="profile-name">{name}</div>
          <div className="profile-sub">{level} ур.</div>
        </div>

        <div className="profile-identity profile-identity--rank" aria-label="Гільдія">
          <div className="profile-shield" aria-hidden="true">◆</div>
        </div>

        <div className="profile-side-slots profile-side-slots--left" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="profile-stage">
          <img className="profile-stage__hero" src={heroArt} alt="" draggable={false} />
        </div>

        <div className="profile-side-slots profile-side-slots--right" aria-hidden="true">
          <span />
          <span />
          <span className="is-locked" />
        </div>

        <div className="profile-deck-power">
          <span className="profile-deck-power__label">Сила колоди</span>
          <img src={powerIcon} alt="" draggable={false} />
          <span className="profile-deck-power__value">{formatNumber(deckPower)}</span>
        </div>
      </section>

      <div className="profile-rows" aria-label="Розділи профілю">
        {SECTION_ROWS.map((row) => (
          <ProfileRow key={row.id} row={row} onClick={handleRow} />
        ))}
      </div>

      <section className="profile-stat-band" aria-label="Титули">
        {TROPHY_STATS.map((item) => (
          <div className="profile-mini-stat" key={item.label}>
            <span>{item.label}</span>
            <strong>?</strong>
            <em>{item.value}</em>
          </div>
        ))}
      </section>

      <section className="profile-section" aria-label="Рейтинги">
        <div className="profile-section__title">Рейтинги</div>
        <div className="profile-rating-grid">
          {RATING_STATS.map((item) => (
            <div className="profile-rating" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <em>{item.note}</em>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-section profile-section--compact" aria-label="Бонуси">
        <div className="profile-section__title">Використовуються бонуси</div>
        <div className="profile-line">
          <span>Бонуси відсутні</span>
          <span className="profile-line__icons">
            <img src={silverIcon} alt="" draggable={false} />
            <img src={goldIcon} alt="" draggable={false} />
          </span>
        </div>
      </section>

      <section className="profile-section profile-section--compact" aria-label="Активність">
        <div className="profile-section__title">Активність</div>
        <div className="profile-line">
          <span>Дней в игре: 0</span>
          <span>Срібло: {formatNumber(silver)}</span>
        </div>
      </section>

      <section className="profile-section profile-section--compact" aria-label="Подарунки">
        <div className="profile-section__title">Подарки от магов</div>
        <button className="profile-gift-row" type="button" onClick={() => dispatch({ type: 'SET_TAB', payload: 'gifts' })}>
          <img src={giftsIcon} alt="" draggable={false} />
          <span>Подарунків немає</span>
        </button>
      </section>

      <button className="profile-row profile-row--last" type="button" onClick={() => dispatch({ type: 'SET_TAB', payload: 'settings' })}>
        <span className="profile-row__icon">⚙</span>
        <span className="profile-row__text">Налаштування</span>
      </button>

      {toast && <div className="profile-toast" role="status">{toast}</div>}
    </section>
  );
}
