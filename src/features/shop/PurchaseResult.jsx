import { CARDS } from '../../data/cards.js';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import './shop.css';

const RARITY_LABELS = {
  common:    'Звичайна',
  uncommon:  'Незвичайна',
  rare:      'Рідкісна',
  epic:      'Епічна',
  legendary: 'Легендарна',
  mythic:    'Міфічна',
};

function RewardRow({ reward }) {
  if (reward.type === 'silver') {
    return (
      <div className="purchase-result__reward-row">
        <img src={silverIcon} alt="срібло" draggable={false} />
        <span>+{reward.amount} срібла</span>
      </div>
    );
  }

  if (reward.type === 'booster') {
    const statLabel = reward.stat === 'xp' ? 'досвіду' : 'срібла';
    const h = Math.floor(reward.durationMinutes / 60);
    const m = reward.durationMinutes % 60;
    const time = h > 0 ? `${h} год${m > 0 ? ` ${m} хв` : ''}` : `${m} хв`;
    return (
      <div className="purchase-result__reward-row">
        <span>+100% {statLabel} на {time}</span>
      </div>
    );
  }

  if (reward.type === 'cosmetic') {
    return (
      <div className="purchase-result__reward-row">
        <span>{reward.title}</span>
      </div>
    );
  }

  // Карта
  const card = CARDS.find((c) => c.id === reward.cardId);
  const rarity = RARITY_LABELS[reward.rarity] ?? reward.rarity;
  const isNew = reward.acquireType === 'new';

  return (
    <div className={`purchase-result__reward-row purchase-result__reward-row--${reward.rarity}`}>
      <span className="purchase-result__card-rarity">{rarity}</span>
      <span className="purchase-result__card-name">{card?.name ?? reward.cardId}</span>
      {reward.level && <span className="purchase-result__card-rarity">Рівень {reward.level}</span>}
      {reward.power && <span className="purchase-result__card-rarity">Сила {reward.power}</span>}
      {reward.specialDropName && <span className="purchase-result__new-badge">{reward.specialDropName}</span>}
      {isNew && <span className="purchase-result__new-badge">Нова!</span>}
      {!isNew && <span className="purchase-result__dup-badge">Копія</span>}
    </div>
  );
}

export default function PurchaseResult({ result, onClose }) {
  if (!result) return null;

  const { ok, item, rewards, error } = result;

  const ERROR_MSG = {
    notEnoughGold:   'Недостатньо золота',
    notEnoughSilver: 'Недостатньо срібла',
    soldOut:         'Товар вичерпано',
    locked:          'Товар ще недоступний',
    owned:           'Ви вже маєте цей товар',
    ITEM_NOT_FOUND:  'Товар не знайдено',
    topUpRequired:   'Потрібне підтвердження доплати золотом',
  };

  return (
    <div className="purchase-result-backdrop" onClick={onClose}>
      <div
        className="purchase-result"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Результат покупки"
      >
        {!ok ? (
          <>
            <div className="purchase-result__error-title">Покупка неможлива</div>
            <div className="purchase-result__error-msg">
              {ERROR_MSG[error] ?? 'Невідома помилка'}
            </div>
          </>
        ) : (
          <>
            <div className="purchase-result__success-title">{item.title}</div>
            <div className="purchase-result__rewards">
              {rewards.map((r, i) => (
                <RewardRow key={i} reward={r} />
              ))}
            </div>
          </>
        )}

        <button className="purchase-result__ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
