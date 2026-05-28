import { memo } from 'react';
import { useGame } from '../../store/GameContext.jsx';
import { formatNumber } from '../../utils/formatNumber.js';
import startAvatar from '../../assets/avatar/start.png';
import powerIcon from '../../assets/icons/power.png';
import goldIcon from '../../assets/icons/gold.png';
import silverIcon from '../../assets/icons/silver.png';
import '../../styles/components/TopBar.css';

function avatarUrl(profile) {
  const avatar = profile?.avatar;
  if (avatar?.url) return avatar.url;
  return startAvatar;
}

function TopBar() {
  const { state } = useGame();
  const { power = 818, gold, silver = 0, exp, expToNext } = state.player;
  const profile = state.profile ?? {};
  const expPercent = Math.min(100, Math.max(0, Math.round((exp / expToNext) * 100)));

  return (
    <header className="top-bar">
      <div className="top-bar__main">
        <div className="top-bar__avatar" aria-label="Аватар гравця">
          <img src={avatarUrl(profile)} alt="" draggable={false} />
        </div>

        <div className="top-bar__stats">
          <div className="top-bar__wallet">
            <div className="top-bar__resource top-bar__resource--power">
              <img
                className="top-bar__asset-icon top-bar__asset-icon--power"
                src={powerIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
              <span>{formatNumber(power)}</span>
            </div>

            <div className="top-bar__resource top-bar__resource--gold">
              <img
                className="top-bar__asset-icon top-bar__asset-icon--gold"
                src={goldIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
              <span>{formatNumber(gold)}</span>
            </div>

            <div className="top-bar__resource top-bar__resource--silver">
              <img
                className="top-bar__asset-icon top-bar__asset-icon--silver"
                src={silverIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
              <span>{formatNumber(silver)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="top-bar__exp-wrap">
        <div className="top-bar__exp" aria-label={`Досвід ${exp} з ${expToNext}`}>
          <span style={{ width: `${expPercent}%` }} />
        </div>
        <div className="top-bar__exp-text">
          {expPercent}%
        </div>
      </div>
    </header>
  );
}

export default memo(TopBar);
