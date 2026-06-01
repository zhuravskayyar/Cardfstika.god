import { useEffect, useMemo } from 'react';
import CardSlot from '../../components/deck/CardSlot.jsx';
import DuelButton from '../../components/ui/DuelButton.jsx';
import { useGame } from '../../store/GameContext.jsx';
import { getLaneMultipliers } from '../../engine/duelEngine.js';
import { getDuelProgressionState } from '../../engine/duelProgression.js';
import { formatNumber } from '../../utils/formatNumber.js';
import './DuelScreen.css';

import startAvatar from '../../assets/avatar/start.png';
import leaderboardIcon from '../../assets/buttonpazzle/liederboard.png';
import tasksIcon from '../../assets/buttonpazzle/task.png';
import shopIcon from '../../assets/buttonpazzle/shop.png';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import xpIcon from '../../assets/icons/xp.png';
import powerIcon from '../../assets/icons/power.png';
import swordsEqualIcon from '../../assets/icons/duel/swords-equal.svg';
import swordsPlayerAdvIcon from '../../assets/icons/duel/swords-player-adv.svg';
import swordsEnemyAdvIcon from '../../assets/icons/duel/swords-enemy-adv.svg';

const LEAGUE_ICON_MODULES = import.meta.glob([
  '../../assets/icons/leagues/league-*-1.svg',
  '../../assets/icons/leagues/league-*-2.svg',
  '../../assets/icons/leagues/league-*-3.svg',
], {
  eager: true,
  import: 'default',
  query: '?url',
});

const MENU_ROWS = [
  { id: 'duel-rating', label: 'Рейтинг дуелей', icon: leaderboardIcon, tab: 'duelRating' },
  { id: 'tasks', label: 'Завдання', icon: tasksIcon, tab: 'tasks', hasDot: true },
  { id: 'shop', label: 'Магазин', icon: shopIcon, tab: 'shop', hasDot: true },
];

const RESULT_TEXT = {
  win: 'ПЕРЕМОГА',
  lose: 'ПОРАЗКА',
  draw: 'НІЧИЯ',
};

function getLeagueIcon(league) {
  const keys = [league?.assetKey, league?.id, league?.legacyId].filter(Boolean);
  for (const key of keys) {
    const icon = LEAGUE_ICON_MODULES[`../../assets/icons/leagues/${key}.svg`];
    if (icon) return icon;
  }
  return null;
}

function avatarUrl(profile) {
  return profile?.avatar?.url || startAvatar;
}

function formatMs(ms) {
  const total = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) return `${hours}г ${String(minutes).padStart(2, '0')}хв`;
  return `${minutes}хв ${String(seconds).padStart(2, '0')}с`;
}

function LeagueBadge({ league }) {
  if (!league) return null;
  const icon = getLeagueIcon(league);

  return (
    <span className={`duel-league-badge ${league.id}`}>
      {icon ? <img src={icon} alt="" draggable={false} /> : <span className="duel-league-badge__mark">{league.tier}</span>}
      <span>{league.title}</span>
    </span>
  );
}

function hpPercent(current, max) {
  const safeMax = Math.max(1, Number(max) || 1);
  return Math.min(100, Math.max(0, Math.round(((Number(current) || 0) / safeMax) * 100)));
}

function MultiplierText({ value }) {
  const number = Number(value) || 1;
  return <span className={number > 1 ? 'is-good' : number < 1 ? 'is-bad' : ''}>x{number.toFixed(1).replace('.0', '')}</span>;
}

function swordIconForMultipliers(playerMultiplier, enemyMultiplier) {
  const player = Number(playerMultiplier) || 1;
  const enemy = Number(enemyMultiplier) || 1;
  if (Math.abs(player - enemy) < 0.001) return swordsEqualIcon;
  return player > enemy ? swordsPlayerAdvIcon : swordsEnemyAdvIcon;
}

function ResourceInline({ icon, children }) {
  return (
    <span className="duel-resource-inline">
      {icon ? <img src={icon} alt="" draggable={false} /> : null}
      {children}
    </span>
  );
}

function HpPanel({ side, name, league, avatar, align = 'left' }) {
  return (
    <div className={`duel-hp-panel duel-hp-panel--${align}`}>
      <div className="duel-hp-panel__avatar" aria-hidden="true">
        {avatar ? <img src={avatar} alt="" draggable={false} /> : <span>{name?.slice(0, 1) ?? '?'}</span>}
      </div>
      <div className="duel-hp-panel__body">
        <div className="duel-hp-panel__top">
          {league ? <LeagueBadge league={league} /> : null}
          <span className="duel-hp-panel__name">{name}</span>
          <span className="duel-hp-panel__value">♥ {formatNumber(side.hp)}</span>
        </div>
        <div className="duel-hp-bar" aria-hidden="true">
          <span style={{ width: `${hpPercent(side.hp, side.maxHp)}%` }} />
        </div>
      </div>
    </div>
  );
}

function StatStrip({ progression }) {
  const availability = progression.availability;
  return (
    <section className="duel-stat-strip" aria-label="Статистика дуелей">
      <div>
        <span>Перемог у дуелях</span>
        <b>{formatNumber(progression.duel.wins)} з {formatNumber(progression.duel.played || 0)}</b>
      </div>
      <div>
        <span>Доступно дуелей</span>
        <b>{formatNumber(availability.availableDuels)} / {formatNumber(availability.dailyDuelLimit)}</b>
      </div>
      <div>
        <span>Золото сьогодні</span>
        <b>{formatNumber(progression.duel.dailyGold)} / {formatNumber(progression.dailyGoldLimit)}</b>
      </div>
    </section>
  );
}

function MenuRows({ dispatch }) {
  return (
    <section className="duel-menu-list" aria-label="Меню дуелей">
      {MENU_ROWS.map((row) => (
        <button key={row.id} className="duel-menu-row" type="button" onClick={() => dispatch({ type: 'SET_TAB', payload: row.tab })}>
          <img className="duel-menu-icon" src={row.icon} alt="" aria-hidden="true" draggable={false} />
          <span className="duel-menu-title">{row.label}</span>
          {row.hasDot && <span className="duel-menu-dot" />}
        </button>
      ))}
    </section>
  );
}

function SearchScreen({ state, session, progression, dispatch }) {
  const enemy = session.enemy;
  const availability = progression.availability;
  const canStart = availability.availableDuels > 0;
  const title = enemy ? 'Знайдено суперника' : 'Пошук суперника';

  return (
    <>
      <div className="duel-title">
        <span className="duel-title__text">{title}</span>
      </div>

      <section className="duel-search-panel" aria-label="Пошук суперника">
        <div className="duel-opponent-strip">
          <div className="duel-opponent-strip__avatar" aria-hidden="true">
            {enemy ? enemy.name.slice(0, 1) : '?'}
          </div>
          <div className="duel-opponent-strip__body">
            <div className="duel-opponent-strip__name">
              {enemy ? <LeagueBadge league={progression.league} /> : null}
              <b>{enemy?.name ?? 'Суперник ще не знайдений'}</b>
            </div>
            <span>{enemy ? `HP ${formatNumber(enemy.hp)} · сила ${formatNumber(enemy.power)}` : `Сила твоєї колоди ${formatNumber(state.player.power)}`}</span>
          </div>
        </div>

        <div className="duel-arena-visual" aria-hidden="true">
          <div className="duel-arena-visual__slots duel-arena-visual__slots--left">
            <span /><span /><span />
          </div>
          <div className="duel-arena-visual__figure" />
          <div className="duel-arena-visual__slots duel-arena-visual__slots--right">
            <span /><span /><span className="is-locked" />
          </div>
        </div>

        <div className="duel-actions" aria-label="Дії дуелі">
          <DuelButton
            title={enemy ? 'Напасти' : 'Шукати'}
            variant="primary"
            disabled={enemy && !canStart}
            onClick={() => dispatch({ type: enemy ? 'DUEL_START_BATTLE' : 'DUEL_FIND_ENEMY' })}
          />
          <DuelButton title="Шукати ще" variant="secondary" onClick={() => dispatch({ type: 'DUEL_FIND_ENEMY' })} />
        </div>

        {!canStart ? (
          <div className="duel-actions duel-actions--paid" aria-label="Платні дії дуелі">
            <DuelButton title={`Відкрити ${availability.openCost}`} variant="primary" onClick={() => dispatch({ type: 'DUEL_OPEN_WITH_GOLD' })} />
            <DuelButton title={`Автобій ${availability.autoBattleCost}`} variant="secondary" onClick={() => dispatch({ type: 'DUEL_AUTO_RUN', payload: { count: 10 } })} />
          </div>
        ) : (
          <div className="duel-actions duel-actions--paid" aria-label="Автобій">
            <DuelButton title="Автобій" variant="secondary" onClick={() => dispatch({ type: 'DUEL_AUTO_RUN', payload: { count: 10 } })} />
          </div>
        )}

        {session.message ? <div className="duel-notice">{session.message}</div> : null}
        {availability.cooldownActive && availability.availableDuels <= 0 ? (
          <div className="duel-notice">Відновлення дуелей: {formatMs(availability.cooldownRemainingMs)}</div>
        ) : null}
        {progression.duel.strongEnemyStreak >= 3 ? (
          <div className="duel-notice">Три сильні суперники поспіль. Магазин може допомогти знайти карти посильніше.</div>
        ) : null}
      </section>

      <StatStrip progression={progression} />
      <MenuRows dispatch={dispatch} />
    </>
  );
}

function BattleLog({ entries = [], compact = false }) {
  const rows = entries.slice(-7).reverse();
  return (
    <section className={`duel-battle-log ${compact ? 'duel-battle-log--compact' : ''}`} aria-label="Журнал бою">
      <h3>Журнал бою</h3>
      {rows.length ? rows.map((entry) => (
        <div key={`${entry.turn}-${entry.laneIndex}`} className="duel-battle-log__row">
          <span>Лінія {entry.laneIndex + 1}</span>
          <b className="is-player">{formatNumber(entry.playerDamage)}</b>
          <img src={swordIconForMultipliers(entry.playerMultiplier, entry.enemyMultiplier)} alt="" draggable={false} />
          <b className="is-enemy">{formatNumber(entry.enemyDamage)}</b>
        </div>
      )) : <p>Обери карту, щоб почати обмін ударами.</p>}
    </section>
  );
}

function BattleCard({ card, selected, onClick }) {
  return (
    <div className="duel-battle-card">
      <CardSlot
        power={card.power}
        element={card.element}
        rarity={card.rarity}
        art={card.art}
        name={card.name}
        selected={selected}
        onClick={onClick}
      />
    </div>
  );
}

function BattleScreen({ state, session, progression, dispatch }) {
  const battle = session.battle;
  const multipliers = useMemo(() => getLaneMultipliers(battle), [battle]);

  if (!battle) return null;

  return (
    <>
      <HpPanel side={battle.enemy} name={session.enemy?.name ?? 'Суперник'} align="right" />

      <section className="duel-battle-board" aria-label="Поле бою">
        <div className="duel-card-row duel-card-row--enemy">
          {battle.enemy.board.map((card, index) => (
            <BattleCard key={card.uid} card={card} selected={battle.lastAction?.laneIndex === index} />
          ))}
        </div>

        <div className="duel-mult-row" aria-label="Множники стихій">
          {multipliers.map((lane) => (
            <div key={lane.laneIndex} className="duel-mult-pill">
              <MultiplierText value={lane.enemy} />
              <img src={swordIconForMultipliers(lane.player, lane.enemy)} alt="" draggable={false} />
              <MultiplierText value={lane.player} />
            </div>
          ))}
        </div>

        <div className="duel-card-row duel-card-row--player">
          {battle.player.board.map((card, index) => (
            <BattleCard
              key={card.uid}
              card={card}
              selected={battle.lastAction?.laneIndex === index}
              onClick={() => dispatch({ type: 'DUEL_ATTACK_LANE', payload: { laneIndex: index } })}
            />
          ))}
        </div>
      </section>

      <HpPanel
        side={battle.player}
        name={progression?.playerName ?? 'Гравець'}
        league={progression.league}
        avatar={avatarUrl(state.profile)}
      />
      <BattleLog entries={battle.log ?? []} compact />
    </>
  );
}

function ResultReward({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="duel-result-reward">
      {icon ? <img src={icon} alt="" draggable={false} /> : <span className="duel-result-reward__badge">{label}</span>}
      <b>{value > 0 ? '+' : ''}{formatNumber(value)}</b>
    </div>
  );
}

function AutoResultPanel({ result }) {
  const auto = result.auto;
  return (
    <section className="duel-result-panel" aria-label="Підсумок автобою">
      <div className="duel-result-summary duel-result-summary--auto">
        <span>Проведено боїв</span>
        <b>{formatNumber(auto.battles)}</b>
        <span>Перемог</span>
        <b>{formatNumber(auto.wins)}</b>
        <span>Поразок</span>
        <b>{formatNumber(auto.losses)}</b>
        <span>Рейтинг</span>
        <b>{auto.rating > 0 ? '+' : ''}{formatNumber(auto.rating)}</b>
      </div>
      <div className="duel-result-rewards" aria-label="Нагорода автобою">
        <ResultReward icon={silverIcon} label="Срібло" value={auto.silver} />
        <ResultReward icon={goldIcon} label="Золото" value={auto.gold} />
        <ResultReward icon={xpIcon} label="XP" value={auto.xp} />
        <ResultReward icon={goldIcon} label="Ціна" value={auto.cost ? -auto.cost : 0} />
      </div>
    </section>
  );
}

function ResultScreen({ session, progression, dispatch }) {
  const result = session.result;
  const battle = session.battle;
  const title = RESULT_TEXT[result?.result] ?? 'РЕЗУЛЬТАТ';
  const entries = result?.battleLog ?? result?.auto?.lastBattleLog ?? [];
  const availability = progression.availability;

  return (
    <>
      <div className={`duel-result-banner duel-result-banner--${result?.result ?? 'none'}`}>
        <div className="duel-result-banner__title">{title}</div>
        {session.message ? <p>{session.message}</p> : null}
      </div>

      {result?.auto ? (
        <AutoResultPanel result={result} />
      ) : (
        <section className="duel-result-panel" aria-label="Підсумок бою">
          <div className="duel-result-summary">
            <span>Завдано шкоди</span>
            <b>{formatNumber(result?.xp?.base ?? 0)}</b>
            <span>Отримано шкоди</span>
            <b>{formatNumber(Math.max(0, (battle?.player?.maxHp ?? 0) - (battle?.player?.hp ?? 0)))}</b>
          </div>

          <div className="duel-result-rewards" aria-label="Нагорода">
            <ResultReward icon={silverIcon} label="Срібло" value={result?.rewards?.silver ?? 0} />
            <ResultReward icon={goldIcon} label="Золото" value={(result?.rewards?.gold ?? 0) + (result?.rewards?.levelUpGold ?? 0)} />
            <ResultReward icon={xpIcon} label="XP" value={result?.xp?.gained ?? 0} />
            <ResultReward label="Рейтинг" value={result?.rating?.delta ?? 0} />
          </div>
        </section>
      )}

      <div className="duel-result-league">
        <LeagueBadge league={result?.league ?? progression.league} />
        <span>Золото сьогодні: {formatNumber(progression.duel.dailyGold)} / {formatNumber(progression.dailyGoldLimit)}</span>
      </div>

      <div className="duel-result-actions">
        <DuelButton
          title={availability.availableDuels > 0 ? 'Ще дуель' : `Відкрити ${availability.openCost}`}
          variant="primary"
          onClick={() => dispatch({ type: availability.availableDuels > 0 ? 'DUEL_FIND_ENEMY' : 'DUEL_OPEN_WITH_GOLD' })}
        />
        <DuelButton title={availability.availableDuels > 0 ? 'Автобій' : `Автобій ${availability.autoBattleCost}`} variant="secondary" onClick={() => dispatch({ type: 'DUEL_AUTO_RUN', payload: { count: 10 } })} />
        <DuelButton title="До меню" variant="secondary" onClick={() => dispatch({ type: 'DUEL_RESET' })} />
      </div>

      <BattleLog entries={entries} />
      <MenuRows dispatch={dispatch} />
    </>
  );
}

export default function DuelScreen() {
  const { state, dispatch } = useGame();
  const session = state.duelSession ?? { phase: 'search', enemy: null, battle: null, result: null };
  const progression = {
    ...getDuelProgressionState(state),
    playerName: state.profile?.name ?? state.player?.name ?? 'Гравець',
  };

  useEffect(() => {
    if (session.phase !== 'battle') return undefined;
    const id = window.setInterval(() => dispatch({ type: 'DUEL_CHECK_TIMEOUT' }), 30_000);
    return () => window.clearInterval(id);
  }, [dispatch, session.phase]);

  return (
    <section className={`duel-page duel-page--${session.phase}`} aria-label="Дуелі">
      <div className="duel-power-chip">
        <ResourceInline icon={powerIcon}>{formatNumber(state.player?.power ?? 0)}</ResourceInline>
      </div>
      {session.phase === 'battle' ? (
        <BattleScreen state={state} session={session} progression={progression} dispatch={dispatch} />
      ) : session.phase === 'result' ? (
        <ResultScreen session={session} progression={progression} dispatch={dispatch} />
      ) : (
        <SearchScreen state={state} session={session} progression={progression} dispatch={dispatch} />
      )}
    </section>
  );
}
