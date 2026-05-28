import { useMemo } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import CardSlot, { ELEMENT_ICONS } from '../deck/CardSlot.jsx';
import { getCollectionCardIds } from '../../engine/collectionEngine.js';
import { elementLabel } from '../../data/elements.js';
import { rarityLabel } from '../../data/rarity.js';
import { findCollectionCard, getCollectionProgress } from '../../utils/collectionProgress.js';
import powerBadgeIcon from '../../assets/icons/power.png';
import silverBadgeIcon from '../../assets/icons/silver.png';
import goldBadgeIcon from '../../assets/icons/gold.png';
import '../../styles/components/CollectionsScreen.css';

const BONUS_ICON_MAP = {
  deck_power_percent: powerBadgeIcon,
  boss_power_percent: powerBadgeIcon,
  element_power_percent: powerBadgeIcon,
  daily_random_element_power_percent: powerBadgeIcon,
  duel_silver_percent: silverBadgeIcon,
  event_silver_percent: silverBadgeIcon,
  autobattle_silver_percent: silverBadgeIcon,
  loss_reward_percent: silverBadgeIcon,
  duel_gold_percent: goldBadgeIcon,
  daily_gold_limit_percent: goldBadgeIcon,
};

const BONUS_TARGETS = {
  deck_power_percent: 'сила бойової колоди',
  duel_silver_percent: 'срібло за дуелі',
  duel_exp_percent: 'досвід за дуелі',
  rare_card_chance_percent: 'шанс отримати рідкісну карту',
  daily_gold_limit_percent: 'денний ліміт золота',
  loss_reward_percent: 'нагорода за програш',
  event_silver_percent: 'срібло з подій',
  duel_cooldown_percent: 'перерва між дуелями',
  uncommon_rare_card_chance_percent: 'шанс отримати незвичайну або рідкісну карту',
  victory_exp_percent: 'досвід за перемогу',
  daily_duel_count: 'кількість щоденних дуелей',
  daily_random_element_power_percent: 'сила випадкової стихії дня',
  autobattle_silver_percent: 'срібло з автобою',
  duel_gold_percent: 'золото з дуелей',
  boss_power_percent: 'сила проти босів',
};

const RARITY_TARGET_LABELS = {
  common: 'звичайних',
  uncommon: 'незвичайних',
  rare: 'рідкісних',
  epic: 'епічних',
  legendary: 'легендарних',
  mythic: 'міфічних',
};

function formatBonusTarget(bonus) {
  if (!bonus) return 'Буде додано';

  if (bonus.type === 'element_power_percent') {
    const element = bonus.element ? elementLabel(bonus.element).toLowerCase() : 'обраної стихії';
    return `сила карт стихії ${element}`;
  }

  if (bonus.type === 'upgrade_cost_percent') {
    const rarity = bonus.rarity
      ? RARITY_TARGET_LABELS[bonus.rarity] ?? rarityLabel(bonus.rarity).toLowerCase()
      : null;
    return bonus.rarity ? `вартість прокачки ${rarity} карт` : 'вартість прокачки карт';
  }

  return BONUS_TARGETS[bonus.type] ?? bonus.type;
}

function formatBonusValue(bonus) {
  if (!bonus) return '';
  const sign = bonus.value > 0 ? '+' : '';
  const suffix = bonus.type?.includes('percent') ? '%' : '';
  return `${sign}${bonus.value}${suffix}`;
}

function BonusBadgeRow({ bonus, isComplete }) {
  if (!bonus) return <span className="collection-bonus__text">Буде додано</span>;
  const mainIcon = BONUS_ICON_MAP[bonus.type];
  const elementIcon = bonus.element ? ELEMENT_ICONS[bonus.element] : null;
  const target = formatBonusTarget(bonus);
  const value = formatBonusValue(bonus);

  return (
    <div className="collection-bonus__row" aria-label={`${value}: ${target}`}>
      <span className={`bonus-badge${isComplete ? ' bonus-badge--active' : ''}`}>
        {mainIcon && <img src={mainIcon} alt="" aria-hidden="true" draggable={false} />}
        <span>{value}</span>
      </span>
      {elementIcon && (
        <span className="bonus-badge bonus-badge--elem">
          <img src={elementIcon} alt="" aria-hidden="true" draggable={false} />
        </span>
      )}
      <span className="collection-bonus__text">Ціль: {target}</span>
    </div>
  );
}

function EmptyCollections({ onBack }) {
  return (
    <div className="collections-empty">
      <div className="collections-empty__title">Дані колекцій очікуються</div>
      <p>
        Каркас екранів готовий для 20 колекцій і 180 карт. Повний список карт,
        рідкостей, стихій і біо потрібно перенести з canvas-документації.
      </p>
      {onBack && (
        <button className="collections-link" type="button" onClick={onBack}>
          Назад до колекцій
        </button>
      )}
    </div>
  );
}

function CollectionCover({ card, complete }) {
  return (
    <div className={`collection-cover${complete ? ' collection-cover--complete' : ''}`}>
      {card ? (
        <CardSlot
          art={card.art}
          minimal={true}
        />
      ) : null}
    </div>
  );
}

function CollectionsList({ collections, cards, ownedCardIds, dispatch }) {
  return (
    <>
      <div className="collections-title">Мої колекції</div>
      <div className="collections-note">Збирайте колекції та отримуйте бонуси!</div>

      {collections.length === 0 ? (
        <EmptyCollections />
      ) : (
        <div className="collections-grid" aria-label="Колекції">
          {collections.map((collection) => {
            const progress = getCollectionProgress(collection, ownedCardIds);
            // choose a random card from the collection that has art (for preview)
            const ids = getCollectionCardIds(collection) || [];
            let coverCard = null;
            if (ids.length > 0) {
              const shuffled = [...ids].sort(() => Math.random() - 0.5);
              for (const id of shuffled) {
                const c = findCollectionCard(cards, id);
                if (c && c.art) { coverCard = c; break; }
              }
            }

            return (
              <button
                className="collection-tile"
                key={collection.id}
                type="button"
                onClick={() => dispatch({ type: 'OPEN_COLLECTION', payload: collection.id })}
              >
                <CollectionCover card={coverCard} complete={progress.isComplete} />
                <span className="collection-tile__name">{collection.name}</span>
                <span className="collection-tile__progress">
                  {progress.owned} із {progress.total}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

function CollectionDetail({ collection, cards, ownedCardIds, dispatch }) {
  if (!collection) {
    return <EmptyCollections onBack={() => dispatch({ type: 'BACK_TO_COLLECTIONS' })} />;
  }

  const progress = getCollectionProgress(collection, ownedCardIds);
  const coverCard = findCollectionCard(cards, collection.coverCardId);
  const owned = new Set(ownedCardIds);
  const cardIds = getCollectionCardIds(collection);
  const collectionCards = cardIds.map((cardId) => ({
    id: cardId,
    card: findCollectionCard(cards, cardId),
    owned: owned.has(cardId),
  }));

  const bonusElementIcon = collection.bonus?.element ? ELEMENT_ICONS[collection.bonus.element] : null; // eslint-disable-line no-unused-vars

  return (
    <>
      <div className="collections-title">«{collection.name}»</div>

      <div className="collection-hero">
        <CollectionCover card={coverCard} complete={progress.isComplete} />
        <div className="collection-bonus">
          <span className="collection-bonus__label">Бонус зібраної колекції:</span>
          <BonusBadgeRow bonus={collection.bonus} isComplete={progress.isComplete} />
        </div>
        <div className="collection-progress">
          Знайдено {progress.owned} із {progress.total} карт
        </div>
      </div>

      <div className="collection-card-grid" aria-label={`Карти колекції ${collection.name}`}>
        {collectionCards.map(({ id, card, owned: isOwned }) => (
          <button
            className={`collection-card${isOwned ? ' collection-card--owned' : ''}`}
            key={id}
            type="button"
            onClick={() => card && dispatch({ type: 'OPEN_COLLECTION_CARD', payload: id })}
            disabled={!card}
          >
            <div
              className={`coll-art-square coll-art-square--${card?.element ?? 'fire'}${isOwned ? '' : ' coll-art-square--locked'}`}
            >
              {card?.art && (
                <img src={card.art} alt={card.name} draggable={false} />
              )}
            </div>
          </button>
        ))}
      </div>

      {collection.source && (
        <div className="collection-source">
          <span>Де можна отримати карти цієї колекції:</span>
          <strong>{collection.source}</strong>
        </div>
      )}

      <button className="collections-link" type="button" onClick={() => dispatch({ type: 'BACK_TO_COLLECTIONS' })}>
        Назад до колекцій
      </button>
    </>
  );
}

function CardDetail({ card, collection, ownedCardIds, dispatch }) {
  if (!card || !collection) {
    return <EmptyCollections onBack={() => dispatch({ type: 'BACK_TO_COLLECTIONS' })} />;
  }

  const isOwned = ownedCardIds.includes(card.id);
  const element = elementLabel(card.element) ?? card.elementName ?? '';
  const elementIcon = ELEMENT_ICONS[card.element];

  return (
    <>
      <div className="collections-title collections-title--card">
        {elementIcon && (
          <img className="collections-title__icon" src={elementIcon} alt="" aria-hidden="true" draggable={false} />
        )}
        {card.name}
        <span>{element}</span>
      </div>

      <div className="collection-card-detail">
        <div
          className={`card-art-blank card-art-blank--${card.element ?? 'fire'}${isOwned ? '' : ' card-art-blank--locked'}`}
        >
            {card.art ? (
              <img className="card-art-blank__img" src={card.art} alt={card.name} draggable={false} />
            ) : null}
        </div>

        {card.bio && (
          <p className="collection-card-detail__bio">{card.bio}</p>
        )}
      </div>

      <button className="collections-link" type="button" onClick={() => dispatch({ type: 'BACK_TO_COLLECTION' })}>
        Назад до колекції
      </button>
    </>
  );
}

export default function CollectionsScreen() {
  const { state, dispatch } = useGame();
  const { cards = [], collections = [], ownedCardIds = [] } = state;

  const selectedCollection = useMemo(
    () => collections.find((collection) => collection.id === state.selectedCollectionId) ?? null,
    [collections, state.selectedCollectionId],
  );

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === state.selectedCardId) ?? null,
    [cards, state.selectedCardId],
  );

  return (
    <section className="collections-screen" aria-label="Колекції">
      <div className="collections-panel">
        {state.activeTab === 'collectionCardDetail' ? (
          <CardDetail
            card={selectedCard}
            collection={selectedCollection}
            ownedCardIds={ownedCardIds}
            dispatch={dispatch}
          />
        ) : state.activeTab === 'collectionDetail' ? (
          <CollectionDetail
            collection={selectedCollection}
            cards={cards}
            ownedCardIds={ownedCardIds}
            dispatch={dispatch}
          />
        ) : (
          <CollectionsList
            collections={collections}
            cards={cards}
            ownedCardIds={ownedCardIds}
            dispatch={dispatch}
          />
        )}
      </div>
    </section>
  );
}
