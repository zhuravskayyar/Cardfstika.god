import { useMemo, useState } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import { elementLabel } from '../../data/elements.js';
import RowButton from '../ui/RowButton.jsx';
import CardSlot, { ELEMENT_ICONS } from './CardSlot.jsx';
import '../../styles/components/DeckScreen.css';

import powerIcon from '../../assets/icons/power.png';

const DECK_CARD_POWER = 12;

const ELEMENT_WEAK_TEXT = {
  earth: 'землі',
  water: 'води',
  air: 'повітря',
  fire: 'вогню',
};

function buildOwnedDeckCards(state) {
  const cardById = new Map((state.cards ?? []).map((card) => [card.id, card]));
  return (state.ownedCards ?? [])
    .map((owned) => {
      const base = cardById.get(owned.cardId);
      if (!base) return null;
      return {
        ...base,
        id: owned.cardId,
        art: base.art ?? null,
        level: owned.level ?? 1,
        rarity: owned.rarity ?? base.rarity ?? 'common',
        elementName: base.elementName ?? elementLabel(base.element),
        power: owned.power ?? base.power ?? base.basePower ?? 0,
        copies: owned.copies ?? 0,
        origin: base.collectionId ? base.collectionId : 'Starter',
        note: base.bio ?? '',
      };
    })
    .filter(Boolean)
    .sort((a, b) => (Number(b.power) || 0) - (Number(a.power) || 0))
    .slice(0, 9);
}

function DeckListScreen({ cards, onOpenCard, onNavigate }) {
  return (
    <>
      <div className="deck-title">
        <span className="deck-title__text">Бойова колода</span>
      </div>

      <div className="deck-hint">
        <span>↑</span>
        <span>Покращуйте карти!</span>
      </div>

      <div className="deck-grid" aria-label="Бойова колода">
        {cards.map((card) => (
          <CardSlot
            key={card.id}
            power={card.power}
            element={card.element}
            art={card.art}
            name={card.name}
            origin={card.origin}
            onClick={() => onOpenCard(card.id)}
          />
        ))}
      </div>

      <div className="extra-title">Додаткові карти</div>
      <div className="extra-grid" aria-label="Додаткові карти">
        <div className="extra-card">
          <div className="extra-card__empty" aria-hidden="true" />
          <span>Карта союзника</span>
        </div>
        <div className="extra-card">
          <div className="extra-card__empty" aria-hidden="true" />
          <span>Карта гільдії</span>
        </div>
        <div className="extra-card">
          <div className="extra-card__empty" aria-hidden="true" />
          <span>Карта події</span>
        </div>
      </div>

      <button className="deck-link" type="button" onClick={() => onNavigate('shop')}>
        ? Де взяти додаткові карти
      </button>

      <div className="deck-task">
        Поповніть ще 4 карти, щоб виконати щоденне завдання.
      </div>

      <div className="deck-actions" aria-label="Швидкі переходи">
        <RowButton title="Дуелі" onClick={() => onNavigate('duel')} />
        <RowButton title="Кампанія" onClick={() => onNavigate('campaign')} />
        <RowButton title="Магазин" onClick={() => onNavigate('shop')} />
      </div>
    </>
  );
}

function OpenCardScreen({ card, onBack, onNavigate }) {
  return (
    <>
      <div className="deck-title">
        <span className="deck-title__text">{card.name}</span>
      </div>

      <div className="opened-card">
        <div className="opened-card__preview">
          <CardSlot
            power={card.power}
            element={card.element}
            art={card.art}
            name={card.name}
            origin={card.origin}
          />
        </div>
        <div className="opened-card__info">
          <div className="opened-card__stat">
            <img src={powerIcon} alt="" draggable={false} />
            <span>Сила: {DECK_CARD_POWER}</span>
          </div>
          <div className="opened-card__stat">
            <span className="opened-card__level-icon">↑</span>
            <span>Рівень: 1</span>
          </div>
          <div className="opened-card__stat">
            <img src={ELEMENT_ICONS[card.element]} alt="" draggable={false} />
            <span>Стихія: {card.elementName}</span>
          </div>
          <div className="opened-card__line">{card.origin}</div>
          <div className="opened-card__line opened-card__line--muted">{card.note}</div>
        </div>
      </div>

      <div className="opened-card__separator" />

      <div className="deck-message">
        У вас немає слабких карт стихії {ELEMENT_WEAK_TEXT[card.element] ?? card.elementName}.
      </div>

      <div className="deck-actions deck-actions--open" aria-label="Переходи карти">
        <RowButton title="Бойова колода" onClick={onBack} />
        <RowButton title="Слабкі карти" onClick={() => onNavigate('weakCards')} />
        <RowButton title="Магазин" onClick={() => onNavigate('shop')} />
      </div>
    </>
  );
}

export default function DeckScreen() {
  const { state, dispatch } = useGame();
  const cards = useMemo(() => buildOwnedDeckCards(state), [state]);
  const [screen, setScreen] = useState('deck');
  const [selectedId, setSelectedId] = useState(cards[0]?.id);
  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedId) ?? cards[0],
    [cards, selectedId],
  );

  if (!selectedCard) return null;

  function openCard(cardId) {
    setSelectedId(cardId);
    setScreen('card');
  }

  function navigate(tab) {
    dispatch({ type: 'SET_TAB', payload: tab });
  }

  return (
    <section className="deck-screen" aria-label="Колода">
      <div className="deck-panel">
        {screen === 'card' ? (
          <OpenCardScreen card={selectedCard} onBack={() => setScreen('deck')} onNavigate={navigate} />
        ) : (
          <DeckListScreen cards={cards} onOpenCard={openCard} onNavigate={navigate} />
        )}
      </div>
    </section>
  );
}
