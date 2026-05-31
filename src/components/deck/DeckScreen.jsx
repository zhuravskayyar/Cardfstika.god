import { useEffect, useMemo, useState } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import {
  buildBattleDeckCards,
  buildWeakDeckCards,
  getSameElementWeakCardsForTarget,
  withUpgradeIndicators,
} from '../../engine/deckModel.js';
import { canFreeUpgrade, getCardAvailableElements, getGoldUpgradeCost, getUpgradeProgress } from '../../engine/upgradeEngine.js';
import RowButton from '../ui/RowButton.jsx';
import CardSlot, { ELEMENT_ICONS } from './CardSlot.jsx';
import '../../styles/components/DeckScreen.css';

import powerIcon from '../../assets/icons/power.png';

const ELEMENT_WEAK_TEXT = {
  earth: 'землі',
  water: 'води',
  air: 'повітря',
  fire: 'вогню',
};

function UpgradeArrow({ type, onClick, title }) {
  if (!type) return null;
  return (
    <button
      className={`card-upgrade-arrow card-upgrade-arrow--${type}`}
      type="button"
      title={title}
      aria-label={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <span aria-hidden="true" />
    </button>
  );
}

function getUpgradeArrowTitle(type) {
  if (type === 'gold') return 'Покращити за золото';
  if (type === 'free') return 'Покращити безкоштовно';
  if (type === 'absorb') return 'Є слабкі карти для покращення';
  return '';
}

function getWeakCardUpgradePercent(targetCard, weakCard) {
  const progress = getUpgradeProgress(targetCard);
  const required = Number(progress.required) || 0;
  if (progress.isMax || required <= 0) return 0;
  return Math.max(1, Math.floor((getCardAvailableElements(weakCard) / required) * 100));
}

function canReachFreeUpgradeByAbsorption(state, card) {
  const progress = getUpgradeProgress(card);
  if (progress.isMax || progress.isGolden || progress.required <= 0 || progress.current >= progress.required) {
    return false;
  }

  const available = getSameElementWeakCardsForTarget(state, card)
    .filter((weakCard) => !weakCard.protected)
    .reduce((sum, weakCard) => sum + getCardAvailableElements(weakCard), 0);
  return progress.current + available >= progress.required;
}

function withAbsorbUpgradeIndicators(cards = [], state) {
  return cards.map((card) => ({
    ...card,
    upgradeIndicator: card.upgradeIndicator ?? (canReachFreeUpgradeByAbsorption(state, card) ? 'absorb' : null),
  }));
}

function DeckCard({ card, onOpenCard, onUpgradeFree, onUpgradeWithGold }) {
  const upgradeAction = card.upgradeIndicator === 'gold'
    ? () => onUpgradeWithGold?.(card.id)
    : card.upgradeIndicator === 'free'
      ? () => onUpgradeFree?.(card.id)
      : card.upgradeIndicator === 'absorb'
        ? () => onOpenCard?.(card.id)
        : undefined;
  return (
    <div className="deck-card-wrap">
      <UpgradeArrow
        type={card.upgradeIndicator}
        title={getUpgradeArrowTitle(card.upgradeIndicator)}
        onClick={upgradeAction}
      />
      <CardSlot
        power={card.power}
        element={card.element}
        rarity={card.rarity}
        art={card.art}
        name={card.name}
        origin={card.origin}
        onClick={() => onOpenCard?.(card.id)}
      />
    </div>
  );
}

function DeckListScreen({ cards, onOpenCard, onNavigate, onUpgradeFree, onUpgradeWithGold }) {
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
          <DeckCard
            key={card.id}
            card={card}
            onOpenCard={onOpenCard}
            onUpgradeFree={onUpgradeFree}
            onUpgradeWithGold={onUpgradeWithGold}
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

function WeakCardsScreen({ cards, onOpenCard, onNavigate, onUpgradeFree, onUpgradeWithGold }) {
  return (
    <>
      <div className="deck-title">
        <span className="deck-title__text">Слабкі карти</span>
      </div>

      <div className="deck-message">
        {cards.length > 0
          ? `У вас є ${cards.length} слабкі карти, які можна використати для покращення.`
          : 'У вас немає слабких карт.'}
      </div>

      <div className="deck-grid deck-grid--weak" aria-label="Слабкі карти">
        {cards.map((card) => (
          <DeckCard
            key={card.id}
            card={card}
            onOpenCard={onOpenCard}
            onUpgradeFree={onUpgradeFree}
            onUpgradeWithGold={onUpgradeWithGold}
          />
        ))}
      </div>

      <div className="deck-actions deck-actions--open" aria-label="Переходи слабких карт">
        <RowButton title="Бойова колода" onClick={() => onNavigate('deck')} />
        <RowButton title="Магазин" onClick={() => onNavigate('shop')} />
      </div>
    </>
  );
}

function OpenCardScreen({
  card,
  sameElementWeakCards,
  onBack,
  onNavigate,
  onAbsorb,
  onToggleProtection,
  onUpgradeFree,
  onUpgradeWithGold,
}) {
  const progress = getUpgradeProgress(card);
  const goldCost = getGoldUpgradeCost(card);
  const progressPercent = progress.isMax
    ? 100
    : Math.round((progress.ratio || 0) * 100);
  const powerGain = Math.max(1, Math.round((card.power || 0) * 0.03));
  const weakCards = sameElementWeakCards || [];
  const hasWeakCards = weakCards.length > 0;
  const isFreeUpgrade = canFreeUpgrade(card);
  const canGoldUpgrade = !progress.isMax && progress.isGolden;
  const canUpgrade = isFreeUpgrade || canGoldUpgrade;
  const absorbGain = weakCards.reduce((sum, w) => sum + getWeakCardUpgradePercent(card, w), 0);

  return (
    <>
      <div className="deck-title">
        <span className="deck-title__text">{card.name}</span>
      </div>

      <div className="opened-card">
        <div className="opened-card__preview">
          <DeckCard
            card={card}
            onUpgradeFree={onUpgradeFree}
            onUpgradeWithGold={onUpgradeWithGold}
          />
        </div>

        <div className="opened-card__preview-actions">
          <div>
            <button
              className={`card-upgrade-button${isFreeUpgrade ? ' card-upgrade-button--free' : ''}`}
              type="button"
              onClick={() => {
                if (isFreeUpgrade) {
                  onUpgradeFree(card.id);
                  return;
                }
                onUpgradeWithGold(card.id);
              }}
              disabled={!canUpgrade}
            >
              {isFreeUpgrade ? 'Прокачати безкоштовно' : 'Підняти рівень'}
            </button>
            <div className={`card-upgrade-note${isFreeUpgrade ? ' card-upgrade-note--free' : ''}`}>
              <span>Сила: <strong>+{powerGain}</strong></span>
              {canGoldUpgrade && <span>Ціна: <strong>{goldCost}</strong></span>}
            </div>
          </div>

          {hasWeakCards && (
            <div>
              <button
                className="card-absorb-button"
                type="button"
                onClick={() => onAbsorb(card.id, weakCards[0].id)}
              >
                зкормити
              </button>
              <div className="card-absorb-note">Прогрес рівня: <strong>+{absorbGain}%</strong></div>
            </div>
          )}
        </div>

        <div className="opened-card__info">
          <div>
            <div className="opened-card__stat">
              <img src={powerIcon} alt="" draggable={false} />
              <span>Сила: {card.power}</span>
            </div>
            <div className="opened-card__stat">
              <span className="opened-card__level-icon">↑</span>
              <span>Рівень: {card.level}</span>
            </div>
            <div className="opened-card__stat">
              <img src={ELEMENT_ICONS[card.element]} alt="" draggable={false} />
              <span>Стихія: {card.elementName}</span>
            </div>
            <button className="opened-card__protection" type="button" onClick={() => onToggleProtection(card.id)}>
              {card.protected ? 'Захищена' : 'Не захищена'}
            </button>
          </div>

        </div>
      </div>

      <div className="opened-card__progress" aria-label={`Прогрес прокачки ${progressPercent}%`}>
        <div className="opened-card__progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="weak-section-title">Слабкі карти</div>

      {sameElementWeakCards.length > 0 ? (
        <div className="weak-mini-grid" aria-label="Слабкі карти для поглинання">
          {sameElementWeakCards.map((weakCard) => (
            <div className="weak-mini-card" key={weakCard.id}>
              <DeckCard
                card={weakCard}
                onOpenCard={() => {
                  if (!weakCard.protected) onAbsorb(card.id, weakCard.id);
                }}
                onUpgradeFree={onUpgradeFree}
                onUpgradeWithGold={onUpgradeWithGold}
              />
              <div className={`weak-mini-card__absorb${weakCard.protected ? ' weak-mini-card__absorb--locked' : ''}`}>
                {weakCard.protected ? 'Захищена' : `+${getWeakCardUpgradePercent(card, weakCard)}%`}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="deck-message">
          У вас немає слабких карт стихії {ELEMENT_WEAK_TEXT[card.element] ?? card.elementName}.
        </div>
      )}

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
  const playerGold = Number(state.player?.gold) || 0;
  const cards = useMemo(
    () => withAbsorbUpgradeIndicators(withUpgradeIndicators(buildBattleDeckCards(state), playerGold), state),
    [state, playerGold],
  );
  const weakCards = useMemo(
    () => withUpgradeIndicators(buildWeakDeckCards(state), playerGold),
    [state, playerGold],
  );
  const allCards = useMemo(() => [...cards, ...weakCards], [cards, weakCards]);
  const [screen, setScreen] = useState(state.activeTab === 'weakCards' ? 'weakCards' : 'deck');
  const [selectedId, setSelectedId] = useState(cards[0]?.id);
  const selectedCard = useMemo(
    () => allCards.find((card) => card.id === selectedId) ?? cards[0] ?? weakCards[0],
    [allCards, cards, weakCards, selectedId],
  );
  const sameElementWeakCards = useMemo(
    () => (selectedCard ? withUpgradeIndicators(getSameElementWeakCardsForTarget(state, selectedCard), playerGold) : []),
    [state, selectedCard, playerGold],
  );

  useEffect(() => {
    if (state.activeTab === 'weakCards' && screen === 'deck') setScreen('weakCards');
    if (state.activeTab === 'deck' && screen === 'weakCards') setScreen('deck');
  }, [state.activeTab, screen]);

  if (!selectedCard) return null;

  function openCard(cardId) {
    setSelectedId(cardId);
    setScreen('card');
  }

  function navigate(tab) {
    if (tab === 'deck') {
      setScreen('deck');
      dispatch({ type: 'SET_TAB', payload: 'deck' });
      return;
    }
    if (tab === 'weakCards') {
      setScreen('weakCards');
      dispatch({ type: 'SET_TAB', payload: 'weakCards' });
      return;
    }
    dispatch({ type: 'SET_TAB', payload: tab });
  }

  function absorbWeakCard(targetCardId, sourceCardId) {
    dispatch({ type: 'ABSORB_WEAK_CARD', payload: { targetCardId, sourceCardId } });
  }

  function toggleProtection(cardId) {
    dispatch({ type: 'TOGGLE_CARD_PROTECTION', payload: cardId });
  }

  function upgradeFree(cardId) {
    dispatch({ type: 'UPGRADE_CARD_FREE', payload: { cardId } });
  }

  function upgradeWithGold(cardId) {
    dispatch({ type: 'UPGRADE_CARD_WITH_GOLD', payload: { cardId } });
  }

  return (
    <section className="deck-screen" aria-label="Колода">
      <div className="deck-panel">
        {screen === 'card' && selectedCard ? (
          <OpenCardScreen
            card={selectedCard}
            sameElementWeakCards={sameElementWeakCards}
            onBack={() => setScreen('deck')}
            onNavigate={navigate}
            onAbsorb={absorbWeakCard}
            onToggleProtection={toggleProtection}
            onUpgradeFree={upgradeFree}
            onUpgradeWithGold={upgradeWithGold}
          />
        ) : screen === 'weakCards' ? (
          <WeakCardsScreen
            cards={weakCards}
            onOpenCard={openCard}
            onNavigate={navigate}
            onUpgradeFree={upgradeFree}
            onUpgradeWithGold={upgradeWithGold}
          />
        ) : (
          <DeckListScreen
            cards={cards}
            onOpenCard={openCard}
            onNavigate={navigate}
            onUpgradeFree={upgradeFree}
            onUpgradeWithGold={upgradeWithGold}
          />
        )}
      </div>
    </section>
  );
}
