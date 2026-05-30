import { CARDS } from '../../data/cards.js';
import CardSlot from '../../components/deck/CardSlot.jsx';
import RowButton from '../../components/ui/RowButton.jsx';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import './shop.css';

const CURRENCY_ICONS = { gold: goldIcon, silver: silverIcon, gems: silverIcon };

const RARITY_LABELS = {
  common: 'Звичайна',
  uncommon: 'Незвичайна',
  rare: 'Рідкісна',
  epic: 'Епічна',
  legendary: 'Легендарна',
  mythic: 'Міфічна',
};

const RARITY_ORDER = ['uncommon', 'rare', 'epic', 'legendary', 'mythic'];

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

function formatChance(value) {
  const numeric = Number(value) || 0;
  return `${Number.isInteger(numeric) ? numeric : numeric.toFixed(2).replace(/\.?0+$/, '')}%`;
}

function sortRarities(rarities) {
  return [...rarities].sort((a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b));
}

function CardPackResult({ result, onClose }) {
  const reward = result.rewards.find((item) => item.cardId);
  const card = CARDS.find((item) => item.id === reward?.cardId);
  const priceIcon = CURRENCY_ICONS[result.paymentPlan?.currency] ?? goldIcon;
  const chances = result.nextChances ?? {};
  const chanceRarities = sortRarities(result.item.higherQualities ?? []);
  const guaranteedRank = RARITY_ORDER.indexOf(result.item.guaranteedQuality);
  const rewardRank = RARITY_ORDER.indexOf(reward?.rarity);
  const gotBetter = rewardRank > guaranteedRank;
  const isNew = reward?.acquireType === 'new';

  return (
    <div className="purchase-card-result" role="dialog" aria-modal="true" aria-label="Результат покупки карти">
      <div className="purchase-card-result__notice">
        <strong>Вітаємо!</strong>
        <span>{isNew ? ' У вас нова карта в ' : ' Ви отримали копію карти з '}</span>
        <span className="purchase-card-result__link">колекції!</span>
      </div>

      {gotBetter && (
        <div className={`purchase-card-result__luck purchase-card-result__luck--${reward.rarity}`}>
          Неймовірне везіння!<br />
          Замість {RARITY_LABELS[result.item.guaranteedQuality]?.toLowerCase()} - {RARITY_LABELS[reward.rarity]?.toLowerCase()} карта!
        </div>
      )}

      <div className="purchase-card-result__showcase">
        {card && (
          <div className="purchase-card-result__card">
            <CardSlot
              power={reward.power}
              element={card.element}
              rarity={reward.rarity}
              art={card.art}
              name={card.name}
              origin={card.collectionId}
            />
          </div>
        )}
      </div>

      <button className="purchase-card-result__buy-again" type="button" onClick={result.buyAgain}>
        Купити ще
      </button>

      <div className="purchase-card-result__price">
        <span>Ціна:</span>
        <img src={priceIcon} alt="" draggable={false} />
        <strong>{result.paymentPlan?.amount ?? result.item.price?.amount}</strong>
      </div>

      {chanceRarities.length > 0 && (
        <div className="purchase-card-result__chances">
          <div>Шанс отримати карту краще:</div>
          <div className="purchase-card-result__chance-row">
            {chanceRarities.map((rarity) => (
              <span className={`purchase-card-result__chance purchase-card-result__chance--${rarity}`} key={rarity}>
                <span aria-hidden="true">↟</span>
                <strong>{formatChance(chances[rarity])}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="purchase-card-result__divider" />

      <div className="purchase-card-result__deck-note">
        <span aria-hidden="true">▣</span>
        {reward.inBattleDeck ? 'Карта потрапила в бойову колоду' : 'Карта потрапила у слабкі карти'}
      </div>

      <div className="purchase-card-result__actions">
        <RowButton title="Назад в магазин" onClick={onClose} />
      </div>
    </div>
  );
}

export default function PurchaseResult({ result, onClose }) {
  if (!result) return null;

  const { ok, item, rewards, error } = result;
  const isCardPackResult = ok && item?.type === 'shop-card-pack' && rewards?.some((reward) => reward.cardId);

  const ERROR_MSG = {
    notEnoughGold: 'Недостатньо золота',
    notEnoughSilver: 'Недостатньо срібла',
    soldOut: 'Товар вичерпано',
    locked: 'Товар ще недоступний',
    owned: 'Ви вже маєте цей товар',
    ITEM_NOT_FOUND: 'Товар не знайдено',
    topUpRequired: 'Потрібне підтвердження доплати золотом',
  };

  return (
    <div className="purchase-result-backdrop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        {isCardPackResult ? (
          <CardPackResult result={result} onClose={onClose} />
        ) : (
          <div
            className="purchase-result"
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
        )}
      </div>
    </div>
  );
}
